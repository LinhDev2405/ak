/**
 * form-step-events.js
 * Binds all DOM events for the step form.
 * Receives a `ctx` context object with `view` (StepView instance) instead of
 * individual imported functions.
 */
import { scrollToId } from "../form-shared/utils.js";
import { SelectorValidator } from "./validation.js";

/**
 * ctx = {
 *   $root, elements, state, SELECTORS, validator, touchedInputs,
 *   view,                        ← StepView instance
 *   populateDateOptions,
 *   renderSelectOptions,
 *   clearToggleGroupErrors,
 *   formatPhone,
 *   tryAdvance, stepBack, selectForm, switchFormById,
 *   onSelect,
 * }
 */

export class StepEvents {
    /**
     * @param {object} ctx
     */
    constructor(ctx) {
        this.ctx = ctx;
        this.selectorValidator = new SelectorValidator();
    }

    bind() {
        const {
            $root,
            elements,
            state,
            SELECTORS,
            validator,
            touchedInputs,
            view,
            populateDateOptions,
            renderSelectOptions,
            clearToggleGroupErrors,
            formatPhone,
            tryAdvance,
            stepBack,
            selectForm,
            switchFormById,
            onSelect,
        } = this.ctx;

        const syncNext = (showErrors = false) =>
            view.syncNextButton(elements, state, validator, SELECTORS, showErrors);

        // Radio change
        elements.radios.on("change", function () {
            const $radio = $(this);

            if (!$radio.is(":checked")) return;

            view.syncRadioActiveState($root, $radio);

            const autoNext = String($radio.data("auto-next")) === "true";
            const isFormTypeRadio = String($radio.attr("name") || "") === "form_type";

            if (!isFormTypeRadio) {
                const $panel = view.getActivePanel(elements);

                if (autoNext && $panel.length) tryAdvance($panel, { allowSubmit: false });
                else syncNext();

                onSelect?.($radio);
                return;
            }

            selectForm($radio, { enter: autoNext });
            onSelect?.($radio);
        });

        // Re-trigger auto-next when already-checked radio is clicked again
        elements.panelBlock.on(
            "pointerdown mousedown",
            'input[type="radio"][data-auto-next="true"]',
            function () {
                $(this).data("wasCheckedBeforeClick", $(this).is(":checked"));
            },
        );

        elements.panelBlock.on("click", 'input[type="radio"][data-auto-next="true"]', function () {
            const $radio = $(this);
            const wasChecked = Boolean($radio.data("wasCheckedBeforeClick"));

            $radio.removeData("wasCheckedBeforeClick");

            if (!wasChecked) return;

            const $panel = view.getActivePanel(elements);

            if ($panel.length) tryAdvance($panel, { allowSubmit: false });
        });

        // Selector submit button
        elements.selectorButton.on("click", (event) => {
            event.preventDefault();

            const $formTypeRadios = elements.radios.filter('[name="form_type"]');
            const valid = this.selectorValidator.validate({
                $selector: elements.selector,
                $radios: $formTypeRadios,
                fieldErrorSelector: SELECTORS.fieldError,
                summaryErrorSelector: SELECTORS.summaryError,
            });

            if (!valid) {
                scrollToId(SELECTORS.root, { header: ".c-header" });
                return;
            }

            const $radio = $formTypeRadios.filter(":checked").first();

            if ($radio.length) selectForm($radio, { enter: true });
        });

        // Next / Back─
        elements.panelBlock.on("click", ".js-step-form-button-next", (event) => {
            event.preventDefault();

            const $panel = view.getActivePanel(elements);

            if ($panel.length) tryAdvance($panel);
        });

        elements.panelBlock.on("click", ".js-step-form-button-back", (event) => {
            event.preventDefault();
            stepBack();
        });

        // Input / Change
        elements.panelBlock.on("input change", "input, textarea, select", (event) => {
            const $input = $(event.currentTarget);
            const type = String($input.attr("type") || "").toLowerCase();

            // File inputs are handled exclusively by StepFileUploadController (async pipeline).
            // Processing them here would cause a race condition: this handler runs synchronously
            // before the async upload pipeline resolves and sets data-upload-error, so
            // syncNext() would incorrectly see no error and re-enable the next button.
            // Button state for file inputs is updated via the 'upload:settled' event instead.
            if (type === "file") return;

            if (
                event.type === "change" &&
                ($(event.currentTarget).is(SELECTORS.dateSelect) ||
                    $(event.currentTarget).closest(".js-form-select-date").length > 0)
            ) {
                populateDateOptions();
            }

            if (
                event.type === "change" &&
                event.currentTarget.matches('input[type="radio"], input[type="checkbox"]')
            ) {
                clearToggleGroupErrors($input);
                view.syncToggleGroups($root);
            }

            if (event.type === "change") formatPhone($input);

            if (type === "checkbox") {
                $input.closest(".js-input-checkbox-wrapper").toggleClass("is-checked", $input.is(":checked"));
            }

            const value = String($input.val() || "").trim();
            const shouldValidate =
                value || ["checkbox", "radio"].includes(type) || $input.hasClass("is-error");

            if (shouldValidate) touchedInputs.add(event.currentTarget);

            if (touchedInputs.has(event.currentTarget)) {
                validator.validateInput($input, { showErrors: true });
                validator.syncRowSummary($input.closest(".js-form-field"));
            }

            syncNext();
        });

        // Checkbox wrapper click
        elements.panelBlock.on("click", ".js-input-checkbox-wrapper", function (event) {
            if ($(event.target).closest("a").length) return;

            const $input = $(this).find('input[type="checkbox"]').first();

            if (!$input.length) return;

            event.preventDefault();
            $input.prop("checked", !$input.prop("checked")).trigger("change");
        });

        // Domain-specific change handlers
        elements.panelBlock.on("change", 'input[name="pickup"]', () => {
            view.syncPickupOption($root, SELECTORS);
            syncNext();
        });

        elements.panelBlock.on("change", 'input[name="visit_area2"]', () => {
            view.syncVisitTimeOptions($root, renderSelectOptions);
        });

        elements.panelBlock.on("change", 'input[name="visit_area"]', function () {
            const $panel = view.getActivePanel(elements);

            view.syncShopDetail($panel, String($(this).data("form") || ""));
            view.syncVisitTimeOptions($panel, renderSelectOptions);
        });

        $root.on("change", SELECTORS.switchForm, function () {
            if ($(this).is(":checked")) switchFormById($(this).data("form-step-switch-to"));
        });

        // Re-sync the next button after the file upload pipeline settles (success or error).
        // A regular change event is not re-fired here to avoid re-entering the upload handler.
        // Listened directly on panelBlock since the event is triggered on it, not the input.
        elements.panelBlock.on("upload:settled", () => {
            syncNext();
        });
    }
}
