import { scrollToId } from "../form/form.js";
import { initStepFileUpload } from "./file-upload.js";
import {
    clearStepFormErrors,
    createPanelValidator,
    updateButtonState,
    validateSelectorFields,
} from "./validates.js";
import { phoneRegex } from "./variables.js";

const SELECTORS = {
    root: ".js-step-form-wrap",
    stepItem: ".c-step-bar__item, .c-step-bar-item",
    fieldError: ".js-form-error",
    summaryError: ".js-form-field-error",
    tabInput: ".c-form-tab__item-btn",
    dateSelect: ".js-form-select-date select",
    switchForm: ".js-form-step-switch-form",
};

const SESSION_KEYS = {
    state: "step-form:state",
    restore: "step-form:restore",
};

const storage = {
    get(key, fallback = null) {
        try {
            return JSON.parse(sessionStorage.getItem(key)) ?? fallback;
        } catch {
            return fallback;
        }
    },

    set(key, value) {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
        } catch {}
    },

    remove(key) {
        try {
            sessionStorage.removeItem(key);
        } catch {}
    },
};

const getStepState = () =>
    storage.get(SESSION_KEYS.state, {
        panelId: "",
        value: "",
        currentStep: 0,
    });

const setStepState = (payload = {}) => {
    storage.set(SESSION_KEYS.state, {
        ...getStepState(),
        ...payload,
    });
};

const clearLegacyStepFormSession = () => {
    try {
        Object.keys(sessionStorage).forEach((key) => {
            if (key.startsWith("recommend-step-form:") || key.startsWith("recommend-step-form:selected:")) {
                sessionStorage.removeItem(key);
            }
        });
    } catch {}
};

const setState = ($el, active, hidden = true) => {
    $el.toggleClass("is-active", active);

    if (hidden) {
        $el.attr("hidden", !active);
    }
};

const setStep = ($items, current) => {
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
};

const formatDate = (date) => {
    const days = ["日", "月", "火", "水", "木", "金", "土"];

    return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(
        2,
        "0",
    )}月${String(date.getDate()).padStart(2, "0")}日(${days[date.getDay()]})`;
};

const parseDate = (value) => {
    const match = String(value || "")
        .trim()
        .match(/^(\d{4})年(\d{1,2})月(\d{1,2})日/);

    if (!match) {
        return null;
    }

    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));

    date.setHours(0, 0, 0, 0);

    return Number.isNaN(date.getTime()) ? null : date;
};

const populateDateOptions = ($root) => {
    const now = new Date();
    let nextMinDate = null;

    $root
        .find(
            `
            ${SELECTORS.dateSelect},
            select[name="delivery_date"],
            select[name="pickup_date"],
            select[name="date_shuccho"]
        `,
        )
        .each(function () {
            const $select = $(this);
            const name = String($select.attr("name") || "");
            const selectedValue = String($select.val() || "").trim();
            const selectedDate = parseDate(selectedValue);

            const start = new Date(now);

            start.setHours(0, 0, 0, 0);

            if (["delivery_date", "pickup_date"].includes(name)) {
                start.setDate(start.getDate() + (now.getHours() < 12 ? 1 : 2));
            }

            if (nextMinDate && start < nextMinDate) {
                start.setTime(nextMinDate.getTime());
            }

            $select.find("option").not('[value=""]').remove();

            for (let i = 0; i < 14; i += 1) {
                const date = new Date(start);

                date.setDate(date.getDate() + i);

                const value = formatDate(date);

                $select.append(`<option value="${value}">${value}</option>`);
            }

            if (selectedDate && selectedDate >= start) {
                const normalizedValue = formatDate(selectedDate);

                $select.val(normalizedValue);

                nextMinDate = new Date(selectedDate);
                nextMinDate.setDate(nextMinDate.getDate() + 1);

                return;
            }

            $select.val("");
            nextMinDate = null;
        });
};

const syncTabs = ($scope) => {
    $scope.find(".c-form-tab").each(function () {
        $(this).toggleClass("is-selected", $(this).find(`${SELECTORS.tabInput}:checked`).length > 0);
    });
};

const getRestorePayload = () => {
    const payload = storage.get(SESSION_KEYS.restore);

    if (!payload || typeof payload !== "object") {
        return null;
    }

    const path = String(payload.path || "").trim();

    if (path && path !== window.location.pathname) {
        return null;
    }

    return payload;
};

const applyRestorePayload = ($root, payload) => {
    const values = payload?.values || {};

    Object.entries(values).forEach(([name, value]) => {
        const $inputs = $root.find(`[name="${name}"]`);

        if (!$inputs.length) {
            return;
        }

        const type = String($inputs.first().attr("type") || "").toLowerCase();

        if (type === "file") {
            return;
        }

        if (type === "radio") {
            $inputs.prop("checked", false);

            $inputs
                .filter(function () {
                    return String($(this).val()) === String(value);
                })
                .prop("checked", true);

            return;
        }

        if (type === "checkbox") {
            const selectedValues = Array.isArray(value) ? value.map(String) : [String(value || "on")];

            $inputs.each(function () {
                const checked = selectedValues.includes(String($(this).val() || "on"));

                $(this).prop("checked", checked);

                $(this).closest(".js-input-checkbox-wrapper").toggleClass("is-checked", checked);
            });

            return;
        }

        $inputs.val(value);
    });
};

const createStepForm = ($root, options = {}) => {
    const { rules = {}, onNext, onBack, onSubmit, onSelect } = options;

    const touchedInputs = new WeakSet();

    const state = {
        step: 0,
    };

    const elements = {
        selector: $root.find(".js-step-form-selector").first(),
        panelBlock: $root.find(".js-step-form-panels").first(),
        panels: $root.find(".js-step-form-panel"),
        radios: $root.find(".js-form-radio"),
        bg: $root.find(".js-step-form-panels-bg").first(),
        initButtons: $root.find(".js-step-form-btn-init").first(),
        selectedButtons: $root.find(".js-step-form-btn-selected").first(),
        stepBar: $root.find(".js-rcm-step-bar").first(),
    };

    elements.next = elements.selectedButtons.find(".js-step-form-button-next").first();

    elements.back = elements.selectedButtons.find(".js-step-form-button-back").first();

    elements.selectorButton = elements.initButtons.find(".js-step-form-button");

    elements.stepItems = elements.stepBar.find(SELECTORS.stepItem);

    elements.selectorContents =
        elements.panelBlock.length &&
        elements.selector.length &&
        $.contains(elements.selector[0], elements.panelBlock[0])
            ? elements.selector.children().not(elements.panelBlock)
            : elements.selector;

    const validator = createPanelValidator({
        rules,
        fieldErrorSelector: SELECTORS.fieldError,
        summaryErrorSelector: SELECTORS.summaryError,
    });

    const defaultNextText = elements.next.find(".c-form-button__text").text().trim();

    const getActivePanel = () => elements.panels.filter(".is-active").first();

    const getSteps = ($panel) => $panel.find(".js-panel-step");

    const persistFormType = () => {
        const $checked = elements.radios.filter(":checked").first();

        if (!$checked.length) {
            return;
        }

        setStepState({
            panelId: String($checked.data("form") || ""),
            value: String($checked.val() || ""),
            currentStep: state.step,
        });
    };

    const syncButtons = () => {
        updateButtonState({
            $selector: elements.selector,
            $button: elements.selectorButton,
            $radios: elements.radios,
        });
    };

    const clearPanelErrors = ($scope) => {
        $scope.find(".is-error").removeClass("is-error").removeAttr("data-step-error-type");

        $scope.find(SELECTORS.fieldError).text("").prop("hidden", true).hide();

        $scope.find(SELECTORS.summaryError).text("").prop("hidden", true).hide();

        $scope.find(".c-form-tab__item").removeClass("is-error");
    };

    const updateStepBar = ($radio, resetStep = false) => {
        if (!elements.stepBar.length || !$radio?.length) {
            return;
        }

        const totalSteps = Math.max(1, Number($radio.data("steps")) || 4);

        elements.stepBar.html(
            Array.from(
                { length: totalSteps },
                (_, index) => `<span class="c-step-bar__item">STEP${index + 1}</span>`,
            ).join(""),
        );

        elements.stepItems = elements.stepBar.find(SELECTORS.stepItem);

        if (resetStep) {
            state.step = 0;
        }

        if (state.step > totalSteps - 1) {
            state.step = totalSteps - 1;
        }
    };

    const syncNextButton = (showErrors = false) => {
        const $panel = getActivePanel();

        if (!$panel.length) {
            return;
        }

        const $steps = getSteps($panel);
        const $current = $steps.length ? $steps.eq(state.step) : $panel;

        const hasErrors = validator.validateContainer($current, {
            showErrors,
        });

        const isLast = !$steps.length || state.step >= $steps.length - 1;

        elements.next.toggleClass("is-active", !hasErrors);

        elements.next.find(".c-form-button__text").text(isLast ? "入力確認画面へ！" : defaultNextText);

        elements.next.toggleClass("is-right-arrow", !isLast);
    };

    const syncStepUi = () => {
        const $panel = getActivePanel();
        const $steps = getSteps($panel);

        if ($steps.length) {
            setStep($steps, state.step);
        }

        setStep(elements.stepItems, state.step);

        syncNextButton();

        persistFormType();
    };

    const activatePanel = ($radio) => {
        const panelId = String($radio.data("form") || "");

        elements.radios.closest(".c-form-radio").removeClass("is-active");

        $radio.closest(".c-form-radio").addClass("is-active");

        setState(elements.panels, false);

        const $panel = elements.panels.filter(`#${panelId}`).first();

        setState($panel, true);

        populateDateOptions($root);

        return $panel;
    };

    const enterPanelMode = ($panel) => {
        elements.selector.removeAttr("hidden").addClass("is-active");

        elements.selectorContents.attr("hidden", true);

        elements.initButtons.attr("hidden", true);

        setState(elements.bg, false);

        setState(elements.selectedButtons, true);

        setState(elements.panels, false);

        setState($panel, true);

        syncStepUi();

        onNext?.($panel);
    };

    const showSelector = () => {
        elements.selector.removeAttr("hidden").addClass("is-active");

        elements.selectorContents.removeAttr("hidden");

        elements.initButtons.removeAttr("hidden");

        setState(elements.selectedButtons, false);

        setState(elements.bg, false);

        setState(elements.panels, false);

        elements.stepItems.removeClass("is-active is-complete");

        clearPanelErrors(elements.panelBlock);

        syncButtons();

        persistFormType();
    };

    const pulseBackground = () => {
        setState(elements.bg, true);

        clearTimeout(elements.bg.data("timer"));

        elements.bg.data(
            "timer",
            setTimeout(() => {
                setState(elements.bg, false);
            }, 220),
        );
    };

    const moveStep = (direction) => {
        state.step += direction;

        setStepState({
            currentStep: state.step,
        });

        pulseBackground();

        populateDateOptions($root);

        syncStepUi();

        scrollToId(SELECTORS.root);
    };

    const formatPhone = ($input) => {
        if (!validator.getInputRules($input).includes("phone")) {
            return;
        }

        const value = String($input.val() || "").trim();

        if (!value || !phoneRegex.test(value)) {
            return;
        }

        const formatter = typeof getFormatPhone === "function" ? getFormatPhone : window.getFormatPhone;

        if (!formatter) {
            return;
        }

        const formatted = formatter(value);

        if (formatted && formatted !== value) {
            $input.val(formatted);
        }
    };

    const selectForm = ($radio, { enter = false, resetStep = true } = {}) => {
        if (!$radio?.length) {
            return;
        }

        $radio.prop("checked", true);

        updateStepBar($radio, resetStep);

        clearStepFormErrors(elements.selector, SELECTORS.fieldError, SELECTORS.summaryError);

        syncButtons();

        persistFormType();

        if (!enter) {
            activatePanel($radio);
            return;
        }

        const $panel = activatePanel($radio);

        enterPanelMode($panel);

        storage.remove(SESSION_KEYS.restore);
    };
    // bấm là đổi form

    //     <button
    //     type="button"
    //     class="js-form-step-switch-form"
    //     data-form-step-switch-to="form_takuhai"
    // >
    //     Takuhai
    // </button>
    const switchFormById = (formId) => {
        const normalizedId = String(formId || "").trim();

        if (!normalizedId) {
            return;
        }

        const $radio = elements.radios
            .filter(function () {
                return String($(this).data("form")) === normalizedId;
            })
            .first();

        if (!$radio.length) {
            return;
        }

        selectForm($radio, {
            enter: true,
        });
    };

    const restoreFormTypeOnly = () => {
        const saved = storage.get(SESSION_KEYS.state);

        if (!saved?.panelId) {
            return;
        }

        const $radio = elements.radios
            .filter(function () {
                return String($(this).data("form")) === saved.panelId;
            })
            .first();

        if (!$radio.length) {
            return;
        }

        $radio.prop("checked", true);

        updateStepBar($radio);

        activatePanel($radio);

        setState(elements.panels, false);

        syncButtons();
    };

    const restoreFromSessionStorage = () => {
        const payload = getRestorePayload();

        if (!payload?.values) {
            return;
        }

        applyRestorePayload($root, payload);

        const saved = getStepState();

        const panelId = saved?.panelId || (payload.form_key ? `form_${payload.form_key}` : "");

        if (!panelId) {
            syncTabs($root);
            populateDateOptions($root);
            return;
        }

        const $radio = elements.radios
            .filter(function () {
                return String($(this).data("form")) === panelId;
            })
            .first();

        if (!$radio.length) {
            return;
        }

        const $panel = activatePanel($radio);
        const $steps = getSteps($panel);

        updateStepBar($radio, true);

        state.step = Number(saved.currentStep || $steps.length - 1);

        enterPanelMode($panel);

        syncTabs($root);

        populateDateOptions($root);

        syncButtons();
    };

    const initEvents = () => {
        // nếu có data-auto-next thì bấm radio là step đó sẽ active luôn, không cần bấm nút next nữa
        //         <input
        //     type="radio"
        //     class="js-form-radio"
        //     data-auto-next="true"
        // />
        elements.radios.on("change", function () {
            const $radio = $(this);

            if (!$radio.is(":checked")) {
                return;
            }

            const autoNext = String($radio.data("auto-next")) === "true";

            selectForm($radio, {
                enter: autoNext,
            });

            onSelect?.($radio);
        });

        elements.selectorButton.on("click", function (event) {
            event.preventDefault();

            const valid = validateSelectorFields({
                $selector: elements.selector,
                $radios: elements.radios,
                fieldErrorSelector: SELECTORS.fieldError,
                summaryErrorSelector: SELECTORS.summaryError,
            });

            if (!valid) {
                scrollToId(SELECTORS.root);
                return;
            }

            const $radio = elements.radios.filter(":checked").first();

            if (!$radio.length) {
                return;
            }

            selectForm($radio, {
                enter: true,
            });
        });

        elements.next.on("click", function (event) {
            event.preventDefault();

            const $panel = getActivePanel();
            const $steps = getSteps($panel);
            const $current = $steps.eq(state.step);

            const hasErrors = validator.validateContainer($current, {
                showErrors: true,
            });

            $current.find("input, textarea, select").each(function () {
                touchedInputs.add(this);
            });

            syncNextButton(true);

            if (hasErrors) {
                scrollToId(SELECTORS.root);
                return;
            }

            if (state.step < $steps.length - 1) {
                moveStep(1);

                onNext?.($panel);

                return;
            }

            const form = $panel[0];

            onSubmit?.(form);

            if (typeof form.submit === "function") {
                form.submit();
            }
        });

        elements.back.on("click", function (event) {
            event.preventDefault();

            if (state.step > 0) {
                moveStep(-1);

                onBack?.();

                return;
            }

            showSelector();
        });

        elements.panelBlock.on("input change", "input, textarea, select", function (event) {
            const $input = $(this);

            if (event.type === "change" && this.matches(SELECTORS.dateSelect)) {
                populateDateOptions($root);
            }

            if (event.type === "change" && this.matches(SELECTORS.tabInput)) {
                syncTabs($root);
            }

            if (event.type === "change") {
                formatPhone($input);
            }

            const type = String($input.attr("type") || "").toLowerCase();

            if (type === "checkbox") {
                $input.closest(".js-input-checkbox-wrapper").toggleClass("is-checked", $input.is(":checked"));
            }

            const value = String($input.val() || "").trim();

            const shouldValidate =
                value || ["checkbox", "radio"].includes(type) || $input.hasClass("is-error");

            if (shouldValidate) {
                touchedInputs.add(this);
            }

            if (touchedInputs.has(this)) {
                validator.validateInput($input, {
                    showErrors: true,
                });

                validator.syncRowSummary($input.closest(".c-form-field"));
            }

            syncNextButton();

            persistFormType();
        });

        elements.panelBlock.on("click", ".js-input-checkbox-wrapper", function (event) {
            if ($(event.target).closest("a").length) {
                return;
            }

            const $wrapper = $(this);

            const $input = $wrapper.find('input[type="checkbox"]').first();

            if (!$input.length) {
                return;
            }

            event.preventDefault();

            $input.prop("checked", !$input.prop("checked")).trigger("change");
        });

        // External CTA can switch form instantly.
        $root.on("click", SELECTORS.switchForm, function (event) {
            event.preventDefault();

            switchFormById($(this).data("form-step-switch-to"));
        });
    };

    const init = () => {
        initStepFileUpload($root);

        setState(elements.bg, false);

        populateDateOptions($root);

        syncTabs($root);

        restoreFromSessionStorage();

        if (!getRestorePayload()) {
            restoreFormTypeOnly();
        }

        syncButtons();

        clearStepFormErrors(elements.selector, SELECTORS.fieldError, SELECTORS.summaryError);

        initEvents();
    };

    return {
        init,
    };
};

export const initStepForm = (options = {}) => {
    clearLegacyStepFormSession();

    $(SELECTORS.root).each(function () {
        createStepForm($(this), options).init();
    });
};
