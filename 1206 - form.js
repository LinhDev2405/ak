import { bindPhoneFormatter, initZipFields, wireActiveState } from "../form-shared/field-binder.js";
import { FileUploadController } from "../form-shared/file-upload.js";
import { isBackForwardNavigation, scrollToId } from "../form-shared/utils.js";
import { FORM_STEP_RULES } from "./form-rules.js";
import { PanelValidator } from "./validation.js";
import { errorText } from "./variables.js";

export class FormController {
    /**
     * @param {object}  options
     * @param {string}  [options.formSelector='#form']
     * @param {string}  [options.formType='form']
     * @param {object}  [options.rules]
     * @param {object}  [options.messages]
     * @param {boolean} [options.scrollOnPrefill=true]
     * @param {boolean} [options.enableFileUpload=true]
     */
    constructor({
        formSelector = "#form",
        formType = "form",
        rules = FORM_STEP_RULES.shuccho,
        messages = {},
        scrollOnPrefill = true,
        enableFileUpload = true,
    } = {}) {
        this.formSelector = formSelector;
        this.formType = formType;
        this.rules = rules;
        this.messages = messages;
        this.scrollOnPrefill = scrollOnPrefill;
        this.enableFileUpload = enableFileUpload;

        this.$form = $(formSelector);
        this.validator = null;
    }

    // ── Date picker ────────────────────────────────────────────────────────────

    initDatePicker($elements) {
        if (typeof $.fn.datepicker === "undefined") {
            console.error("jQuery UI datepicker is not loaded");
            return;
        }
        if (!$elements.length) {
            console.error("Date element not found");
            return;
        }

        const opts = {
            yearSuffix: "",
            dateFormat: "yy年mm月dd日",
            dayNames: ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"],
            dayNamesMin: ["日", "月", "火", "水", "木", "金", "土"],
            dayNamesShort: ["日曜", "月曜", "火曜", "水曜", "木曜", "金曜", "土曜"],
            monthNames: [
                "1月",
                "2月",
                "3月",
                "4月",
                "5月",
                "6月",
                "7月",
                "8月",
                "9月",
                "10月",
                "11月",
                "12月",
            ],
            monthNamesShort: [
                "1月",
                "2月",
                "3月",
                "4月",
                "5月",
                "6月",
                "7月",
                "8月",
                "9月",
                "10月",
                "11月",
                "12月",
            ],
            showMonthAfterYear: true,
            changeYear: true,
            changeMonth: true,
            minDate: 0,
        };

        const normalize = (v) => {
            const m = (v || "").trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
            return m ? `${m[1]}年${m[2]}月${m[3]}日` : (v || "").trim();
        };

        $elements.each((_, el) => {
            const $el = $(el);
            const key = `selectedDate:${$el.attr("name") || "date"}`;

            if (isBackForwardNavigation()) {
                const saved = normalize(sessionStorage.getItem(key));
                if (saved && !$el.val()) {
                    $el.val(saved);
                    this.validator.setActiveField($el);
                    sessionStorage.setItem(key, saved);
                }
            } else {
                sessionStorage.removeItem(key);
            }

            const current = normalize($el.val());
            if (current && current !== $el.val()) $el.val(current);

            if (!$el.hasClass("hasDatepicker")) {
                $el.datepicker({
                    ...opts,
                    onSelect: (date) => {
                        sessionStorage.setItem(key, date);
                        this.validator.removeErrorMessage($el);
                        this.validator.setActiveField($el);
                    },
                });
            }
        });
    }

    // ── Live validation ────────────────────────────────────────────────────────

    _bindLiveValidation() {
        // Track which fields have been touched (have a value or already show an error).
        // Mirrors the approach used by form-step-events.js in StepEvents.
        const touchedInputs = new WeakSet();

        this.$form.on("input change", 'input:not([type="file"]), textarea, select', (event) => {
            const $input = $(event.currentTarget);
            const type = String($input.attr("type") || "").toLowerCase();
            const value = String($input.val() || "").trim();

            const shouldTrack = value || ["checkbox", "radio"].includes(type) || $input.hasClass("is-error");
            if (shouldTrack) touchedInputs.add(event.currentTarget);

            if (touchedInputs.has(event.currentTarget)) {
                this.validator.validateInput($input, { showErrors: true });
            }
        });
    }

    // ── Wire ───────────────────────────────────────────────────────────────────

    wireForm() {
        // Active-state wiring (checkmark, is-active class)
        wireActiveState(this.$form, ($field) => this.validator.setActiveField($field));

        // Live per-field validation
        this._bindLiveValidation();

        // Phone formatting
        const $phone = this.$form.find(".js-field-phone");
        if ($phone.length) bindPhoneFormatter($phone);

        // Zip auto-fill
        initZipFields(this.$form, {
            namespace: "formZipAutoFill",
            onSuccess: ({ $pref, $addr }) => {
                this.validator.removeErrorMessage($pref);
                this.validator.removeErrorMessage($addr);
            },
        });

        // Date picker
        const $date = this.$form.find(".js-field-date");
        if ($date.length) $(window).on("load", () => this.initDatePicker($date));
    }

    // ── Submit ─────────────────────────────────────────────────────────────────

    bindSubmit() {
        this.$form.on("submit", (event) => {
            // validateContainer scans all .js-form-field rows and shows errors inline.
            // It returns true if any field has an error (same semantics as form-step).
            const hasErrors = this.validator.validateContainer(this.$form, { showErrors: true });
            if (hasErrors) {
                event.preventDefault();
                scrollToId(this.formSelector);
            }
        });
    }

    // ── Init ───────────────────────────────────────────────────────────────────

    init() {
        if (!this.$form.length) {
            console.error(`FormController: form "${this.formSelector}" not found`);
            return null;
        }

        // PanelValidator accepts flat rules ({ fieldName: ['required', …] })
        // or step-array rules ([{ … }, { … }]) — same engine used by form-step.js.
        this.validator = new PanelValidator({
            rules: this.rules,
            messages: this.messages,
        });

        this.wireForm();

        if (this.enableFileUpload) {
            new FileUploadController(this.$form, {
                formType: this.formType,
                errorText,
                useNoteForDisplay: true,
            }).init();
        }

        if (this.scrollOnPrefill) {
            const hasValue = this.$form
                .find("input[required], input.js-required")
                .toArray()
                .some((el) => $(el).val() !== "");
            if (hasValue) scrollToId(`#${this.$form.attr("id")}`);
        }

        this.bindSubmit();

        return { $form: this.$form, validator: this.validator, controller: this };
    }
}

/** @deprecated Use new FormController(options).init() instead. */
export const initForm = (options = {}) => new FormController(options).init();
