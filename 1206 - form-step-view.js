import { buildBusinessHourOptions, formatDate, formatPhoneValue, parseDate } from "../../utils/format.js";
import { SelectorValidator } from "./validation.js";

// StepView
// Receives `session` (StepSession instance) via constructor so it can call
// session.set / session.remove without importing the old storage singleton.
export class StepView {
    /**
     * @param {import('./form-step-session.js').StepSession} session
     */
    constructor(session) {
        this.session = session;
        this.selectorValidator = new SelectorValidator();
    }

    // Generic helpers
    setState($element, active, hidden = true) {
        $element.toggleClass("is-active", active);

        if (hidden) {
            $element.attr("hidden", !active);
        }
    }

    // Step bar
    renderStepBar($items, current) {
        $items
            .removeClass("is-active is-complete")
            .attr("aria-hidden", true)
            .each(function (index) {
                $(this)
                    .toggleClass("is-complete", index < current)
                    .toggleClass("is-active", index === current);
            })
            .eq(current)
            .removeAttr("aria-hidden");
    }

    updateStepBar(elements, selectors, state, $radio = null, resetStep = false) {
        if (!elements.stepBar.length) return;

        const totalSteps = Math.max(1, Number($radio?.data("steps")) || 4);

        elements.stepBar.html(
            Array.from(
                { length: totalSteps },
                (_, index) => `<span class="c-step-bar__item js-step-bar-item">STEP${index + 1}</span>`,
            ).join(""),
        );

        elements.stepItems = elements.stepBar.find(selectors.stepItem);

        if (resetStep) {
            state.step = 0;
        }

        if (state.step > totalSteps - 1) {
            state.step = totalSteps - 1;
        }
    }

    getStepBarIndex($panel, step) {
        if (!this.hasAreaSubSteps($panel)) return step;

        const $steps = this.getSteps($panel);
        const detailIndex = $steps.index($steps.filter('[data-area-mode="detail"]').first());

        if (detailIndex < 0 || step < detailIndex) return step;
        if (step === detailIndex) return detailIndex - 1;

        return step - 1;
    }

    // Error helpers
    clearPanelErrors($scope, fieldErrorSelector, summaryErrorSelector) {
        // Clear is-error from all elements except file inputs that have an active
        // upload error — those are managed by StepFileUploadController and must
        // not be wiped here, otherwise syncNextButton loses track of the error state.
        $scope
            .find(".is-error")
            .not('input[type="file"][data-upload-error]')
            .removeClass("is-error")
            .removeAttr("data-step-error-type");

        // Hide all field-level error messages except those owned by the upload controller.
        $scope.find(fieldErrorSelector).not("[data-upload-error]").text("").prop("hidden", true).hide();

        $scope.find(summaryErrorSelector).text("").prop("hidden", true).hide();

        $scope.find(".js-form-tab-item").removeClass("is-error");
    }

    clearToggleGroupErrors($input, selectors) {
        const $group = $input.closest(".js-toggle-group");

        if (!$group.length) return;

        $group.find(selectors.fieldError).text("").prop("hidden", true).hide();
        $group
            .find('input[type="radio"], input[type="checkbox"]')
            .removeClass("is-error")
            .removeAttr("data-step-error-type");
        $group.find(".js-form-tab-item").removeClass("is-error");
    }

    // Select / option rendering
    renderSelectOptions($select, choices, placeholder) {
        if (!$select?.length) return;

        const currentValue = String($select.val() || "");

        $select.empty().append(`<option value="">${placeholder}</option>`);
        choices.forEach((choice) => {
            const value = String(choice || "");

            if (!value) return;

            $select.append(`<option value="${value}">${value}</option>`);
        });

        if (choices.includes(currentValue)) {
            $select.val(currentValue);
        }
    }

    /**
     * Populate date <select> options.
     *
     * Date selects can be marked either directly on the <select> with
     * `js-date-select`, or on the wrapper produced by the shared select
     * component with `js-form-select-date`.
     * Delivery-offset:   also add class `js-date-offset` to start from tomorrow/day-after.
     * Baked-in time opts: add class `js-restore-time` on time <select>s whose options are
     *                     already in HTML and only need their saved value restored.
     */
    populateDateOptions($root, selectors, savedValues = {}) {
        const now = new Date();
        let nextMinDate = null;
        let resetRemaining = false;

        // --- Pass 1: build date option lists and restore date values ---
        $root.find(".js-form-select-date select, select.js-date-select").each(function () {
            const $select = $(this);
            const name = String($select.attr("name") || "");
            const hasOffset = $select.hasClass("js-date-offset");

            // Read from savedValues (session) first; DOM value is empty on restore.
            // An empty saved value means the field was never filled — fall back to the
            // current DOM value rather than forcing the select to empty.
            const savedValue =
                savedValues[name] != null && String(savedValues[name]).trim() !== ""
                    ? String(savedValues[name]).trim()
                    : null;
            const selectedValue = savedValue ?? String($select.val() || "").trim();
            const selectedDate = parseDate(selectedValue);

            const start = new Date(now);
            start.setHours(0, 0, 0, 0);

            if (hasOffset) {
                start.setDate(start.getDate() + (now.getHours() < 12 ? 1 : 2));
            }

            if (nextMinDate && start < nextMinDate) {
                start.setTime(nextMinDate.getTime());
            }

            $select.find("option").not('[value=""]').remove();

            // Generate at least 14 days, but extend the window to cover the saved
            // date even when it falls beyond the default range.
            let dayCount = 14;
            if (!resetRemaining && selectedDate && selectedDate >= start) {
                const diffDays = Math.ceil((selectedDate - start) / (1000 * 60 * 60 * 24)) + 1;
                if (diffDays > dayCount) dayCount = diffDays;
            }

            for (let index = 0; index < dayCount; index += 1) {
                const date = new Date(start);
                date.setDate(date.getDate() + index);
                const value = formatDate(date);
                $select.append(`<option value="${value}">${value}</option>`);
            }

            if (resetRemaining) {
                $select.val("");
                return;
            }

            if (selectedDate && selectedDate >= start) {
                $select.val(formatDate(selectedDate));
                nextMinDate = new Date(selectedDate);
                nextMinDate.setDate(nextMinDate.getDate() + 1);
                return;
            }

            $select.val("");

            // Only cascade-reset when a non-empty value is invalid (e.g. past date).
            // An empty string means the field was never filled — don't penalise the next date.
            if (selectedValue) {
                resetRemaining = true;
            }
        });

        // --- Pass 2: restore baked-in time selects ---
        // These selects have options already in HTML. Class `js-restore-time` signals
        // that only value restoration is needed — no option generation.
        $root.find(".js-restore-time").each(function () {
            const $select = $(this);
            const name = String($select.attr("name") || "");
            const saved = savedValues[name] != null ? String(savedValues[name]).trim() : "";

            if (!saved) return;

            $select.val(saved);
        });
    }

    // initZipAutoFill removed — zip binding is handled by field-binder.initZipFields

    // Panel / step queries
    getPanelByFormId(elements, formId = "") {
        const normalizedId = String(formId || "").trim();

        if (!normalizedId) return $();

        return elements.panels.filter(`#${normalizedId}_content, #${normalizedId}`).first();
    }

    getActivePanel(elements) {
        return elements.panels.filter(".is-active").first();
    }

    getSteps($panel) {
        return $panel.find(".js-panel-step");
    }

    getStepButtonGroups($panel) {
        return $panel.find(".js-step-form-btn-selected");
    }

    getCurrentStepElement($panel, step) {
        return this.getSteps($panel).eq(step);
    }

    getSelectedRadioByName($panel, name) {
        const $checked = $panel.find(`input[name="${name}"]:checked`).first();

        if ($checked.length) return $checked;

        return $panel.find(`.js-form-radio-item.is-active input[name="${name}"]`).first();
    }

    isAreaModeStep($step, mode) {
        return $step.is(`[data-area-mode="${String(mode || "").trim()}"]`);
    }

    hasAreaSubSteps($panel) {
        const $steps = this.getSteps($panel);

        return (
            $steps.filter('[data-area-mode="list"]').length > 0 &&
            $steps.filter('[data-area-mode="detail"]').length > 0
        );
    }

    getCurrentStepButtons($panel, step) {
        const $buttonGroups = this.getStepButtonGroups($panel);

        if (!$buttonGroups.length) return { next: $(), back: $() };

        const visibleCount = Math.max(1, this.getSteps($panel).length || 1);
        const activeIndex = Math.min(step, visibleCount - 1, $buttonGroups.length - 1);
        const $currentGroup = $buttonGroups.eq(activeIndex);

        return {
            next: $currentGroup.find(".js-step-form-button-next").first(),
            back: $currentGroup.find(".js-step-form-button-back").first(),
        };
    }

    // Panel activation
    activatePanel(elements, $radio) {
        const panelId = String($radio.data("form") || "");

        elements.radios.filter('[name="form_type"]').closest(".js-form-radio-item").removeClass("is-active");

        $radio.closest(".js-form-radio-item").addClass("is-active");
        this.setState(elements.panels, false);

        const $panel = this.getPanelByFormId(elements, panelId);
        if (!$panel.length) return $();

        this.setState($panel, true);
        return $panel;
    }

    enterPanelMode(elements, syncStepUiFn, onNext, $panel) {
        elements.selector.removeAttr("hidden").addClass("is-active");
        elements.selectorContents.attr("hidden", true);
        elements.initButtons.attr("hidden", true);

        this.setState(elements.bg, false);
        elements.selectedButtons.attr("hidden", true).removeClass("is-active");
        this.setState(elements.panels, false);
        this.setState($panel, true);

        syncStepUiFn();
        onNext?.($panel);
    }

    // Background pulse
    pulseBackground(elements) {
        this.setState(elements.bg, true);

        clearTimeout(elements.bg.data("timer"));

        elements.bg.data(
            "timer",
            setTimeout(() => {
                this.setState(elements.bg, false);
            }, 220),
        );
    }

    // Form submission
    submitCurrentPanel($panel, onSubmit) {
        const form = $panel[0];

        onSubmit?.(form);

        if (typeof form?.submit === "function") {
            form.submit();
        }
    }

    // Formatting
    formatPhone(validator, $input) {
        if (!validator.getInputRules($input).includes("phone")) return;

        const value = String($input.val() || "").trim();
        const formatter = typeof getFormatPhone === "function" ? getFormatPhone : window.getFormatPhone;

        const formatted = formatPhoneValue(value, { formatter });

        if (formatted && formatted !== value) {
            $input.val(formatted);
        }
    }

    // Input reset
    resetPanelInputs($root, elements) {
        const $forms = elements.panels.filter("form").add(elements.panels.find("form"));

        $forms.each(function () {
            if (typeof this.reset === "function") {
                this.reset();
            }
        });

        $root.find(".js-input-checkbox-wrapper").removeClass("is-checked");
        $root.find(".js-toggle-group").removeClass("is-selected");
        $root.find(".js-form-radio-item").removeClass("is-active");
    }

    // Domain sync helpers
    syncShopDetail($panel, areaFormId = "") {
        const $detailStep = this.getSteps($panel).filter('[data-area-mode="detail"]').first();

        if (!$detailStep.length) return $();

        const normalizedAreaFormId = String(areaFormId || "").trim();

        $detailStep.find(".js-shop-detail").attr("hidden", true);

        if (!normalizedAreaFormId) return $detailStep;

        const $matchedDetail = $detailStep
            .find(".js-shop-detail")
            .filter(function () {
                return String($(this).data("form") || "") === normalizedAreaFormId;
            })
            .first();

        if ($matchedDetail.length) {
            $matchedDetail.removeAttr("hidden");
        }

        return $detailStep;
    }

    /**
     * Sync visit-time <select> options based on the selected shop radio.
     * Mark each time select either directly with `js-visit-time` or via the
     * shared select wrapper class `js-form-select-time`.
     * Placeholder text can be customised per-select via `data-placeholder`
     * (data attribute kept here because it is a configuration value, not a hook).
     *
     * HTML example:
     *   <select name="visit_time_1" class="js-visit-time" data-placeholder="時間を選択してください">
     */
    syncVisitTimeOptions($panel, renderSelectOptionsFn, savedTimes = {}) {
        const $shopRadio = this.getSelectedRadioByName($panel, "visit_area2");
        const options = buildBusinessHourOptions($shopRadio.attr("data-business-hours"));

        $panel.find(".js-form-select-time select, select.js-visit-time").each(function () {
            const $select = $(this);
            const name = String($select.attr("name") || "");
            const placeholder = String($select.data("placeholder") || "時間を選択してください");

            renderSelectOptionsFn($select, options, placeholder);

            // Restore saved value if it exists in the newly rendered options.
            const savedValue = savedTimes[name] || String($select.data("restore-value") || "");
            if (savedValue) {
                $select.val(savedValue);
            }
        });
    }

    syncToggleGroups($root) {
        $root.find(".js-toggle-group").each(function () {
            const $group = $(this);

            const hasCheckedInput =
                $group.find('input[type="radio"]:checked, input[type="checkbox"]:checked').length > 0;

            const hasActiveLabel = $group.find(".js-toggle-item.is-active").length > 0;

            $group.toggleClass("is-selected", hasCheckedInput || hasActiveLabel);
        });
    }

    /**
     * Sync pickup-option visibility.
     *
     *   .js-pickup-yes          — container holding the "yes" radio + its collapsible content
     *   .js-pickup-no           — container holding the "no" radio
     *   .js-pickup-yes-content  — collapsible section inside .js-pickup-yes
     *
     * HTML example:
     *   <div class="js-pickup-yes">
     *     <input type="radio" name="pickup" value="1">
     *     <div class="js-pickup-yes-content"> … pickup date / time fields … </div>
     *   </div>
     *   <div class="js-pickup-no">
     *     <input type="radio" name="pickup" value="0">
     *   </div>
     */
    syncPickupOption($root, selectors) {
        const $checked = $root.find('input[name="pickup"]:checked');
        const $yes = $root.find(".js-pickup-yes");
        const $no = $root.find(".js-pickup-no");
        const $yesContent = $yes.find(".js-pickup-yes-content");
        const $pickupField = $yes.closest(".js-form-field");

        const isYes = $checked.length && $yes.has($checked).length;

        $yes.add($no).removeClass("is-active");

        if ($checked.length) {
            (isYes ? $yes : $no).addClass("is-active");
        }

        if ($yesContent.length) {
            $yesContent.attr("hidden", !isYes);
            $yesContent.find("input, textarea, select").prop("disabled", !isYes);
            $yesContent.find(".is-error").removeClass("is-error").removeAttr("data-step-error-type");
            $yesContent.find(".js-form-tab-item").removeClass("is-error");
            $yesContent
                .find(`${selectors.fieldError}, ${selectors.summaryError}`)
                .text("")
                .prop("hidden", true)
                .hide();
        }

        if ($checked.length && $pickupField.length) {
            $pickupField.find(selectors.summaryError).text("").prop("hidden", true).hide();
        }
    }

    syncRadioActiveState($root, $radio) {
        if (!$radio?.length) return;

        const name = String($radio.attr("name") || "");

        $root.find(`input[name="${name}"]`).closest(".js-form-radio-item").removeClass("is-active");

        if (name === "service_form_switch") return;

        $radio.closest(".js-form-radio-item").addClass("is-active");
    }

    // Button sync
    syncButtons(elements) {
        this.selectorValidator.updateButtonState({
            $selector: elements.selector,
            $button: elements.selectorButton,
            $radios: elements.radios.filter('[name="form_type"], [name="service_form_switch"]'),
        });
    }

    syncStepButtonsVisibility(elements, state, $panel) {
        elements.selectedButtons.attr("hidden", true).removeClass("is-active");

        if (!$panel.length) return;

        const $buttonGroups = this.getStepButtonGroups($panel);

        if (!$buttonGroups.length) return;

        const visibleCount = Math.max(1, this.getSteps($panel).length || 1);
        const activeIndex = Math.min(state.step, visibleCount - 1, $buttonGroups.length - 1);

        $buttonGroups.each(function (index) {
            const isActive = index === activeIndex && index < visibleCount;

            $(this).attr("hidden", !isActive).toggleClass("is-active", isActive);
        });
    }

    syncNextButton(elements, state, validator, selectors, showErrors = false) {
        const $panel = this.getActivePanel(elements);

        if (!$panel.length) return;

        const $steps = this.getSteps($panel);
        const $current = $steps.length ? this.getCurrentStepElement($panel, state.step) : $panel;
        const hasErrors = validator.validateContainer($current, { showErrors });

        // Disable the button when a file input in the current step has:
        //   • a pending upload error (wrong type/size) — data-upload-error
        //   • an upload still in progress              — data-upload-pending
        const hasUploadError = $current.find('input[type="file"][data-upload-error]').length > 0;
        const hasUploadPending =
            $current.find('input[type="file"][data-upload-pending]').length > 0 ||
            $current
                .find(".js-file-label")
                .toArray()
                .some((element) => {
                    const text = String($(element).text() || "").trim();
                    return text === "Image is processing..." || /^ファイルを選択 .+/.test(text);
                });

        const { next: $next } = this.getCurrentStepButtons($panel, state.step);

        if (!$next.length) return;

        $next.toggleClass("is-active", !hasErrors && !hasUploadError && !hasUploadPending);
    }

    // Full step UI sync
    syncStepUi(
        elements,
        state,
        selectors,
        validator,
        persistFormTypeFn,
        syncShopDetailFn,
        syncVisitTimeOptionsFn,
        savedValues = {},
    ) {
        const $panel = this.getActivePanel(elements);
        const $steps = this.getSteps($panel);

        $steps.removeClass("is-active is-complete").attr("aria-hidden", true);

        const $current = $steps.eq(state.step);

        $current.addClass("is-active").removeAttr("aria-hidden");
        $steps.each(function (index) {
            $(this).toggleClass("is-complete", index < state.step);
        });

        this.renderStepBar(elements.stepItems, this.getStepBarIndex($panel, state.step));

        if (this.isAreaModeStep($current, "list")) {
            const $areaRadio = this.getSelectedRadioByName($panel, "visit_area");

            syncShopDetailFn($panel, String($areaRadio.data("form") || ""));
        }

        if (this.isAreaModeStep($current, "detail")) {
            syncVisitTimeOptionsFn($panel, savedValues);
        }

        const $servicePanel = $panel.find(".js-panel-service");

        if ($servicePanel.length) {
            const isAreaStep =
                this.isAreaModeStep($current, "list") || this.isAreaModeStep($current, "detail");

            if (isAreaStep) {
                $servicePanel.removeAttr("hidden");
            } else {
                $servicePanel.attr("hidden", true);
            }
        }

        this.syncStepButtonsVisibility(elements, state, $panel);
        this.syncNextButton(elements, state, validator, selectors);
        persistFormTypeFn();
    }
}
