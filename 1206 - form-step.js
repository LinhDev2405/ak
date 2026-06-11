/**
 * form-step.js
 *
 * Multi-step form controller.
 * Validates per-step (one js-validate-wrap group per step),
 * manages step navigation, and delegates to collaborators:
 *
 *   StepSession    — session read/write/restore
 *   StepView       — all DOM mutations and UI sync
 *   StepEvents     — all event bindings
 *   PanelValidator — step-scoped validation
 */

import { initZipFields, wireActiveState } from "../form-shared/field-binder.js";
import { FileUploadController } from "../form-shared/file-upload.js";
import { isBackForwardNavigation, scrollToId } from "../form-shared/utils.js";

import { StepEvents } from "./form-step-events.js";
import { StepSession } from "./form-step-session.js";
import { StepView } from "./form-step-view.js";
import { PanelValidator, SelectorValidator } from "./validation.js";
import { errorText } from "./variables.js";

const ROOT_SELECTOR = ".js-step-form-wrap";

const SELECTORS = {
    root: ROOT_SELECTOR,
    stepItem: ".js-step-bar-item",
    fieldError: ".js-form-error",
    summaryError: ".js-form-field-error",
    switchForm: ".js-form-step-switch-form",
    dateSelect: "select.js-date-select, .js-form-select-date select",
};

// ─── StepFormController ───────────────────────────────────────────────────────

class StepFormController {
    /**
     * @param {jQuery} $root
     * @param {object} [options]
     * @param {object}   [options.rules]     { formKey: [ { field: ['required',…] }, … ] }
     * @param {function} [options.onNext]
     * @param {function} [options.onBack]
     * @param {function} [options.onSubmit]
     * @param {function} [options.onSelect]
     */
    constructor($root, options = {}) {
        this.$root = $root;
        this.rules = options.rules ?? {};
        this.onNext = options.onNext;
        this.onBack = options.onBack;
        this.onSubmit = options.onSubmit;
        this.onSelect = options.onSelect;

        this.state = { step: 0 };
        this.touchedInputs = new WeakSet();
        this.restoreValues = {};

        this.session = new StepSession();
        this.view = new StepView(this.session);
        this.selectorValidator = new SelectorValidator();
        this.elements = this._resolveElements();

        this.validator = new PanelValidator({
            rules: this.rules,
            fieldErrorSelector: SELECTORS.fieldError,
            summaryErrorSelector: SELECTORS.summaryError,
        });
    }

    // ── Element resolution ─────────────────────────────────────────────────────

    _resolveElements() {
        const r = this.$root;
        const e = {
            selector: r.find(".js-step-form-selector").first(),
            panelBlock: r.find(".js-step-form-panels").first(),
            panels: r.find(".js-step-form-panel"),
            radios: r.find(".js-form-radio"),
            bg: r.find(".js-step-form-panels-bg").first(),
            initButtons: r.find(".js-step-form-btn-init").first(),
            selectedButtons: r.find(".js-step-form-btn-selected"),
            stepBar: r.find(".js-step-bar").first(),
        };
        e.selectorButton = e.initButtons.find(".js-step-form-button");
        e.stepItems = e.stepBar.find(SELECTORS.stepItem);
        e.selectorContents =
            e.panelBlock.length && e.selector.length && $.contains(e.selector[0], e.panelBlock[0])
                ? e.selector.children().not(e.panelBlock)
                : e.selector;
        return e;
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    _currentPanel() {
        return this.view.getActivePanel(this.elements);
    }

    _currentStepEl($panel) {
        return this.view.getSteps($panel).eq(this.state.step);
    }

    _syncStep() {
        this.validator.setStep(this.state.step);
        this.view.syncStepUi(
            this.elements,
            this.state,
            SELECTORS,
            this.validator,
            () => this._persistFormType(),
            ($panel, areaId) => this.view.syncShopDetail($panel, areaId),
            ($panel, saved) =>
                this.view.syncVisitTimeOptions(
                    $panel,
                    ($sel, choices, ph) => this.view.renderSelectOptions($sel, choices, ph),
                    saved,
                ),
            this.restoreValues,
        );
    }

    _persistFormType() {
        const $checked = this.elements.radios.filter('[name="form_type"]:checked').first();
        if (!$checked.length) return;
        this.session.setStepState({
            panelId: String($checked.data("form") || ""),
            value: String($checked.val() || ""),
            currentStep: this.state.step,
        });
    }

    // ── Navigation ─────────────────────────────────────────────────────────────

    /**
     * Validate the current step; advance (or submit) when clean.
     * Returns false when blocked by errors or pending uploads.
     */
    tryAdvance($panel, { allowSubmit = true } = {}) {
        this.validator.setStep(this.state.step);

        const $current = this._currentStepEl($panel);
        const hasErrors = this.validator.validateContainer($current, { showErrors: true });
        const hasUploadError = $current.find('input[type="file"][data-upload-error]').length > 0;
        const hasUploadPending = $current.find('input[type="file"][data-upload-pending]').length > 0;

        this.view.syncNextButton(this.elements, this.state, this.validator, SELECTORS, true);

        if (hasErrors || hasUploadError || hasUploadPending) {
            scrollToId(SELECTORS.root, { header: ".c-header" });
            return false;
        }

        $current.find("input, textarea, select").each((_, el) => this.touchedInputs.add(el));
        this._persistFormType();

        const $steps = this.view.getSteps($panel);

        // Area-mode list step → sync shop detail then step forward
        if (this.view.isAreaModeStep($current, "list")) {
            this.view.syncShopDetail(
                $panel,
                String(this.view.getSelectedRadioByName($panel, "visit_area").data("form") || ""),
            );
            this._step(1, $panel);
            return true;
        }

        if (this.state.step < $steps.length - 1) {
            this._step(1, $panel);
            return true;
        }

        if (allowSubmit) {
            try {
                this.session.setScrollTop(window.pageYOffset || document.documentElement.scrollTop || 0);
            } catch {}
            this.view.submitCurrentPanel($panel, this.onSubmit);
        }

        return true;
    }

    /**
     * Move step by `dir` (+1 / -1) and sync UI.
     */
    _step(dir, $panel) {
        const $p = $panel ?? this._currentPanel();
        this.state.step = Math.max(0, Math.min(this.state.step + dir, this.view.getSteps($p).length - 1));
        this.session.setStepState({ currentStep: this.state.step });
        this.view.pulseBackground(this.elements);
        this.view.populateDateOptions(this.$root, SELECTORS, this.restoreValues);
        this._syncStep();
        scrollToId(SELECTORS.root, { header: ".c-header" });
        if (dir > 0) this.onNext?.($p);
    }

    showSelector() {
        this.state.step = 0;

        const { elements } = this;
        elements.selector.removeAttr("hidden").addClass("is-active");
        elements.panels.removeClass("is-active").attr("hidden", true);
        elements.selectorContents.removeAttr("hidden");
        elements.initButtons.removeAttr("hidden");

        this.view.setState(elements.selectedButtons, false);
        this.view.setState(elements.bg, false);
        this.view.setState(elements.panels, false);

        elements.panels.find(".js-panel-step").removeClass("is-active is-complete");

        this.view.updateStepBar(elements, SELECTORS, this.state, null, true);

        elements.radios
            .filter('[name="form_type"], [name="service_form_switch"]')
            .prop("checked", false)
            .closest(".js-form-radio-item")
            .removeClass("is-active");

        this.view.clearPanelErrors(elements.panelBlock, SELECTORS.fieldError, SELECTORS.summaryError);
        this.session.clearStepState();
        this.session.clearRestorePayload();
        this.view.syncButtons(elements);
    }

    // ── Form selection ─────────────────────────────────────────────────────────

    /**
     * Activate a form panel by radio.
     * Pass `switchTo` (formId string) for hard-switch from .js-form-step-switch-form.
     */
    selectForm($radio, { enter = false, resetStep = true, switchTo = null } = {}) {
        if (switchTo) {
            $radio = this.elements.radios
                .filter('[name="form_type"]')
                .filter(function () {
                    return String($(this).data("form") || "") === switchTo;
                })
                .first();

            if (!$radio.length) return;

            this.state.step = 0;
            this.validator.setStep(0);
            this.elements.radios
                .filter('[name="form_type"]')
                .prop("checked", false)
                .closest(".js-form-radio-item")
                .removeClass("is-active");

            const $panel = this.view.getPanelByFormId(this.elements, switchTo);
            if (!$panel.length) return;

            this.view.updateStepBar(this.elements, SELECTORS, this.state, $radio, true);
            this.selectorValidator.clearErrors(
                this.elements.selector,
                SELECTORS.fieldError,
                SELECTORS.summaryError,
            );
            this.view.syncButtons(this.elements);

            this.elements.selector.removeAttr("hidden").addClass("is-active");
            this.elements.selectorContents.attr("hidden", true);
            this.elements.initButtons.attr("hidden", true);
            this.view.setState(this.elements.bg, false);
            this.elements.selectedButtons.attr("hidden", true).removeClass("is-active");
            this.view.setState(this.elements.panels, false);
            this.view.setState($panel, true);

            $radio.prop("checked", true);
            this._syncStep();
            this._persistFormType();
            this.session.clearRestorePayload();
            this.onSelect?.($radio);
            return;
        }

        if (!$radio?.length) return;
        $radio.prop("checked", true);

        this.view.updateStepBar(this.elements, SELECTORS, this.state, $radio, resetStep);
        this.selectorValidator.clearErrors(
            this.elements.selector,
            SELECTORS.fieldError,
            SELECTORS.summaryError,
        );
        this.view.syncButtons(this.elements);

        if (!enter) {
            this.view.setState(this.elements.panels, false);
            return;
        }

        const $panel = this.view.activatePanel(this.elements, $radio);
        if (!$panel.length) return;

        this.view.enterPanelMode(this.elements, () => this._syncStep(), this.onNext, $panel);
        this.session.clearRestorePayload();
    }

    // ── Session restore ────────────────────────────────────────────────────────

    _restoreFromSession() {
        const payload = this.session.getRestorePayload();
        if (!payload?.values) return false;

        this.restoreValues = { ...payload.values };
        this.session.applyRestorePayload(this.$root, payload);

        const saved = this.session.getStepState();
        const panelId = saved?.panelId || (payload.form_key ? `form_${payload.form_key}` : "");

        if (!panelId) {
            this.view.syncToggleGroups(this.$root);
            this.view.populateDateOptions(this.$root, SELECTORS, this.restoreValues);
            return false;
        }

        const $radio = this.elements.radios
            .filter(function () {
                return String($(this).data("form")) === panelId;
            })
            .first();
        if (!$radio.length) return false;

        const $panel = this.view.activatePanel(this.elements, $radio);
        const $steps = this.view.getSteps($panel);

        this.view.updateStepBar(this.elements, SELECTORS, this.state, $radio, true);
        this.state.step = Math.min(
            Math.max(0, Number(saved.currentStep) || 0),
            Math.max(0, $steps.length - 1),
        );
        this.validator.setStep(this.state.step);

        this.view.enterPanelMode(this.elements, () => this._syncStep(), this.onNext, $panel);

        const renderSelect = ($sel, choices, ph) => this.view.renderSelectOptions($sel, choices, ph);
        this.view.syncShopDetail(
            $panel,
            String(this.view.getSelectedRadioByName($panel, "visit_area").data("form") || ""),
        );
        this.view.populateDateOptions(this.$root, SELECTORS, this.restoreValues);
        this.view.syncVisitTimeOptions($panel, renderSelect, this.restoreValues);
        this.view.syncToggleGroups(this.$root);
        this.view.syncPickupOption(this.$root, SELECTORS);

        const $active = this._currentPanel();
        if ($active.length) {
            this.view.syncShopDetail(
                $active,
                String(this.view.getSelectedRadioByName($active, "visit_area").data("form") || ""),
            );
            this.view.syncVisitTimeOptions($active, renderSelect, this.restoreValues);
        }

        this.view.syncButtons(this.elements);
        return true;
    }

    // ── Init ───────────────────────────────────────────────────────────────────

    init() {
        new FileUploadController(this.$root, {
            errorText,
            restoreAlways: true,
            usePendingFlag: true,
            scopeInputId: true,
        }).init();

        initZipFields(this.$root, {
            namespace: "stepZipAutoFill",
            onSuccess: ({ $pref, $addr }) => {
                [$pref, $addr].forEach(($f) =>
                    $f.removeClass("is-error").removeAttr("data-step-error-type").trigger("input"),
                );
            },
        });

        wireActiveState(this.elements.panelBlock, ($field) => this.validator.setActiveField($field));

        this.view.setState(this.elements.bg, false);
        this.view.populateDateOptions(this.$root, SELECTORS);
        this.view.syncToggleGroups(this.$root);
        this.view.syncPickupOption(this.$root, SELECTORS);

        const restored = this._restoreFromSession();

        if (!restored) {
            this.view.resetPanelInputs(this.$root, this.elements);
            this.showSelector();
        }

        const $panel = this._currentPanel();
        if ($panel.length) {
            const renderSelect = ($sel, choices, ph) => this.view.renderSelectOptions($sel, choices, ph);
            this.view.syncShopDetail(
                $panel,
                String(this.view.getSelectedRadioByName($panel, "visit_area").data("form") || ""),
            );
            this.view.syncVisitTimeOptions($panel, renderSelect);
        }

        this.view.syncButtons(this.elements);
        this.selectorValidator.clearErrors(
            this.elements.selector,
            SELECTORS.fieldError,
            SELECTORS.summaryError,
        );

        new StepEvents({
            $root: this.$root,
            elements: this.elements,
            state: this.state,
            SELECTORS,
            validator: this.validator,
            touchedInputs: this.touchedInputs,
            view: this.view,

            populateDateOptions: () => this.view.populateDateOptions(this.$root, SELECTORS),
            renderSelectOptions: ($sel, choices, ph) => this.view.renderSelectOptions($sel, choices, ph),
            clearToggleGroupErrors: ($input) => this.view.clearToggleGroupErrors($input, SELECTORS),
            formatPhone: ($input) => this.view.formatPhone(this.validator, $input),

            tryAdvance: (...a) => this.tryAdvance(...a),
            stepBack: () => {
                this.view.clearPanelErrors(
                    this.elements.panelBlock,
                    SELECTORS.fieldError,
                    SELECTORS.summaryError,
                );
                this.$root.find(".js-pickup-option-yes, .js-pickup-option-no").removeClass("is-active");
                if (this.state.step > 0) {
                    this._step(-1);
                    this.onBack?.();
                } else {
                    this.showSelector();
                }
            },
            selectForm: (...a) => this.selectForm(...a),
            switchFormById: (id) => this.selectForm(null, { switchTo: String(id || "").trim() }),

            onSelect: this.onSelect,
        }).bind();

        // Scroll restore after back/forward navigation
        const shouldScroll =
            this.session.consumeScrollAfterBackFlag() ||
            (isBackForwardNavigation() && !!this.session.getRestorePayload()?.values);

        if (shouldScroll) {
            const savedTop = this.session.consumeScrollTop();
            if (typeof savedTop === "number" && savedTop >= 0) {
                requestAnimationFrame(() => window.scrollTo({ top: savedTop, behavior: "auto" }));
            } else {
                setTimeout(() => scrollToId(SELECTORS.root, { header: ".c-header" }), 300);
            }
        }
    }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const initStepForm = (options = {}) => {
    $(ROOT_SELECTOR).each(function () {
        new StepFormController($(this), options).init();
    });
};
