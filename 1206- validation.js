import { getPhoneFormatter } from "./utils";

export class BaseValidator {
  /**
   * @param {object} options
   * @param {object} options.errorText          — error message map
   * @param {object} [options.regexes]          — regex / file-constraint map
   * @param {function} [options.phoneFormatter] — override phone formatter factory
   */
  constructor({ errorText, regexes = {}, phoneFormatter = getPhoneFormatter() } = {}) {
    this.errorText      = errorText;
    this.regexes        = regexes;
    this.phoneFormatter = phoneFormatter;

    this.SELECTORS = {
      validateWrap  : '.js-validate-wrap',
      formError     : '.js-form-error',
      formCheckmark : '.js-form-checkmark',
      formCheckbox  : '.js-form-checkbox, .js-checkbox, .c-form-checkbox',
      formField     : '.c-form-field',
      fieldBox      : '.c-form-field__box',
      fieldTitle    : '.c-form-field__title',
      fieldNote     : '.js-form-field-note',
    };

    this._ruleHandlers = this._buildRuleHandlers();
  }

  // Static helpers
  static normalizeRuleKey(key) {
    return String(key || '').trim().toLowerCase().replace(/-/g, '_');
  }

  // Empty-value check
  isEmptyFieldValue($field) {
    const type = String($field.attr('type') || 'text').toLowerCase();

    if (type === 'radio' || type === 'checkbox') {
      return !$field.is(':checked');
    }

    if (type === 'file') {
      const hasNative   = ($field[0]?.files?.length ?? 0) > 0;
      const hasUploaded = !!($field.closest(this.SELECTORS.validateWrap).find('.js-file1').val() || '').trim();
      return !hasNative && !hasUploaded;
    }

    return !String($field.val() || '').trim();
  }

  // Rule handlers
  _buildRuleHandlers() {
    const {
      emailRegex,
      kataRegex,
      zipRegex,
      phoneRegex,
      allowedFileExtensions = [],
      maxFileSize = 0,
    } = this.regexes;

    const et = this.errorText;

    return {
      required: (field) => this.isEmptyFieldValue(field) ? et.required : null,

      email: (field) => {
        const val = String(field.val() || '').trim();
        if (!val) return null; // empty is required's job
        return emailRegex.test(val) ? null : et.email;
      },

      phone: (field) => {
        const value = String(field.val() || '').trim();
        if (!value) return null; // empty is required's job
        if (!phoneRegex.test(value) || value.length > 13) return et.phone;

        const formatter = this.phoneFormatter?.();
        if (formatter) return formatter(value) ? null : et.phone;

        const digits = value.replace(/-/g, '');
        return digits.length >= 10 && digits.length <= 11 ? null : et.phone;
      },

      kata: (field) => {
        const val = String(field.val() || '').trim();
        if (!val) return null; // empty is required's job
        return kataRegex.test(val) ? null : et.kata;
      },

      zipcode: (field) => {
        const val = String(field.val() || '').trim();
        if (!val) return null;
        return zipRegex.test(val) ? null : et.zip;
      },

      filetype: (field) => {
        const file = field[0]?.files?.[0];
        if (!file) return null;
        const ext = String(file.name || '').split('.').pop().toLowerCase();
        return allowedFileExtensions.includes(ext) ? null : et.fileType;
      },

      filesize: (field) => {
        const file = field[0]?.files?.[0];
        if (!file) return null;
        return file.size <= maxFileSize ? null : et.fileSize;
      },
    };
  }

  /** Register or override a rule handler at runtime */
  addRuleHandler(name, fn) {
    this._ruleHandlers[BaseValidator.normalizeRuleKey(name)] = fn;
  }

  getHandler(name) {
    return this._ruleHandlers[BaseValidator.normalizeRuleKey(name)];
  }

  // ── Error element helpers ──────────────────────────────────────────────────
  // Each message is a <p> so CSS can style lines independently.
  // Prefer these over direct DOM manipulation in subclasses.

  _hideErrorEl($el) {
    if (!$el?.length) return;
    $el.empty().prop('hidden', true).hide();
  }

  _showErrorEl($el, message) {
    if (!$el?.length) return;
    const messages = Array.isArray(message) ? message : [message];
    $el.empty();
    messages.forEach((m) => $el.append($('<p>').text(m)));
    $el.prop('hidden', false).show();
  }

  // ── DOM helpers ────────────────────────────────────────────────────────────

  getErrorEl($field) {
    return $field.closest(this.SELECTORS.validateWrap).find(this.SELECTORS.formError);
  }

  getCheckmarkEl($field) {
    const $wrap = $field.closest(this.SELECTORS.validateWrap).find(this.SELECTORS.formCheckmark);
    if ($wrap.length) return $wrap;
    return $field.closest(this.SELECTORS.fieldBox).children(this.SELECTORS.formCheckmark);
  }

  getCheckboxWrapper($field) {
    return $field.closest(this.SELECTORS.formCheckbox);
  }

  // ── Checkmark sync ─────────────────────────────────────────────────────────
  // Row-level checkmark inside .c-form-field__title — visible only when every
  // input in the row has a value and carries no is-error class.

  updateRowCheckmark($field) {
    const $row          = $field.closest(this.SELECTORS.formField);
    const $rowCheckmark = $row.children(this.SELECTORS.fieldTitle).find(this.SELECTORS.formCheckmark);
    if (!$rowCheckmark.length) return;

    const $targets = $row.find(
      `${this.SELECTORS.validateWrap} input:not([type="hidden"]),
       ${this.SELECTORS.validateWrap} textarea,
       ${this.SELECTORS.validateWrap} select`
    );

    if (!$targets.length) {
      $rowCheckmark.removeClass('is-visible');
      return;
    }

    const isComplete = $targets.toArray().every((el) => {
      const $el  = $(el);
      const type = $el.attr('type');

      if ($el.hasClass('is-error')) return false;
      if (type === 'checkbox')      return $el.is(':checked');
      if (type === 'file') {
        const hasNative   = ($el[0]?.files?.length ?? 0) > 0;
        const hasUploaded = !!($el.closest('.js-validate-wrap').find('.js-file1').val() || '').trim();
        return hasNative || hasUploaded;
      }
      return !!($el.val() || '').trim();
    });

    $rowCheckmark.toggleClass('is-visible', isComplete);
  }

  // ── Active-field state ─────────────────────────────────────────────────────
  // Shared by FormController and StepFormController.
  // Sets is-active on the field and syncs the inline checkmark.
  // File inputs are excluded — their checkmark is managed exclusively by
  // FileUploadController (_applySuccess / _applyError / _reset).

  setActiveField($field) {
    const type   = String($field.attr('type') || '').toLowerCase();
    const isFile = type === 'file';

    const hasValue = isFile
      ? ($field[0]?.files?.length ?? 0) > 0
      : type === 'checkbox'
        ? $field.is(':checked')
        : !!($field.val() ?? '').trim();

    $field.toggleClass('is-active', hasValue);

    if (!isFile && !$field.hasClass('is-error')) {
      this.getCheckmarkEl($field).toggleClass('is-visible', hasValue);
      this.updateRowCheckmark($field);
    }
  }

  // ── Show / remove error ────────────────────────────────────────────────────

  /**
   * Show one or more error messages under a field.
   * @param {jQuery}          $field
   * @param {string|string[]} message
   * @param {object}          [hooks]  { before, after }
   */
  showErrorMessage($field, message, { before, after } = {}) {
    before?.($field, message);

    const type = String($field.attr('type') || '').toLowerCase();

    if (!$field.hasClass('js-field-date') && !$field.hasClass('js-file-label')) {
      type === 'checkbox'
        ? this.getCheckboxWrapper($field).addClass('is-error')
        : $field.addClass('is-error');
    }

    this.getCheckmarkEl($field).removeClass('is-visible');
    this.updateRowCheckmark($field);

    this._showErrorEl(this.getErrorEl($field), message);

    after?.($field, message);
  }

  /**
   * Clear error state for a field.
   * Restores the checkmark when the field has a value, and removes is-hide
   * from .js-form-field-note (e.g. file-size hint hidden after upload success).
   * @param {jQuery} $field
   * @param {object} [hooks]  { before, after }
   */
  removeErrorMessage($field, { before, after } = {}) {
    before?.($field);

    const type = String($field.attr('type') || '').toLowerCase();
    $field.removeClass('is-error');

    if (type === 'checkbox') {
      this.getCheckboxWrapper($field).removeClass('is-error');
      this._hideErrorEl($field.closest(this.SELECTORS.validateWrap).find(this.SELECTORS.formError));
      after?.($field);
      return;
    }

    this._hideErrorEl(this.getErrorEl($field));

    // Restore note visibility (may have been hidden by FileUploadController on success).
    $field.closest(this.SELECTORS.validateWrap)
      .find(this.SELECTORS.fieldNote)
      .removeClass('is-hide');

    const hasValue = (() => {
      if (type === 'file') {
        const hasNative   = ($field[0]?.files?.length ?? 0) > 0;
        const hasUploaded = !!($field.closest(this.SELECTORS.validateWrap).find('.js-file1').val() || '').trim();
        return hasNative || hasUploaded;
      }
      return !!($field.val() || '').trim();
    })();

    this.getCheckmarkEl($field).toggleClass('is-visible', hasValue);
    this.updateRowCheckmark($field);

    after?.($field);
  }
}

// ── FormValidator ─────────────────────────────────────────────────────────────
// Used by FormController (form.js) for standard single-page forms.
// Provides validate() + showErrors() + live per-field validation on top of BaseValidator.

export class FormValidator extends BaseValidator {
  /**
   * @param {jQuery} $form
   * @param {object} [options]
   * @param {object} [options.rules]      — { fieldName: ['required', …] }
   * @param {object} [options.messages]   — { fieldName: { ruleName: 'custom msg' } }
   * @param {object} [options.errorText]  — error message map
   * @param {object} [options.regexes]    — regex / file-constraint map
   */
  constructor($form, { rules = {}, messages = {}, errorText = {}, regexes = {} } = {}) {
    super({ errorText, regexes });
    this.$form    = $form;
    this.rules    = rules;
    this.messages = messages;

    this._bindLiveValidation();
  }

  // ── Internal ───────────────────────────────────────────────────────────────

  _resolveMessage(fieldName, rule, fallback) {
    return this.messages?.[fieldName]?.[rule] ?? fallback ?? '';
  }

  // Run rules for one field; returns array of error messages (max 1).
  _validateField($field) {
    const name  = String($field.attr('name') || '');
    const rules = this.rules[name] || [];

    for (const rule of rules) {
      const handler = this.getHandler(rule);
      if (typeof handler !== 'function') continue;

      const msg = handler($field);
      if (!msg) continue;

      return [this._resolveMessage(name, rule, msg)];
    }

    return [];
  }

  // Live: re-validate a field on every input/change.
  // Only fires after the field has been touched (has a value or already has an error).
  _bindLiveValidation() {
    Object.keys(this.rules).forEach((name) => {
      const $field = this.$form.find(`[name="${name}"]`);
      if (!$field.length) return;

      // File inputs are managed by FileUploadController — skip.
      if ($field.attr('type') === 'file') return;

      $field.on('input change', () => {
        const type     = String($field.attr('type') || '').toLowerCase();
        const hasError = $field.hasClass('is-error');
        const hasValue = type === 'checkbox' || type === 'radio'
          ? $field.is(':checked')
          : !!String($field.val() || '').trim();

        // Only run live validation once the user has engaged with the field
        if (!hasValue && !hasError) return;

        const errors = this._validateField($field);
        if (errors.length) {
          this.showErrorMessage($field, errors);
        } else {
          this.removeErrorMessage($field);
        }
      });
    });
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Validate all enabled fields in the form.
   * @returns {object} { fieldName: ['error message', …] }
   */
  validate() {
    const errors = {};

    this.$form.find('input:not([type="hidden"]), textarea, select').each((_, el) => {
      const $field = $(el);
      if ($field.prop('disabled')) return;

      const name        = String($field.attr('name') || '');
      const fieldErrors = this._validateField($field);
      if (fieldErrors.length) errors[name] = fieldErrors;
    });

    return errors;
  }

  /**
   * Display collected errors in the DOM.
   * @param {object} errors — return value of validate()
   */
  showErrors(errors) {
    this.$form.find(this.SELECTORS.formError).each((_, el) => this._hideErrorEl($(el)));

    for (const [name, msgs] of Object.entries(errors)) {
      const $field = this.$form.find(`[name="${name}"]`).first();
      if (!$field.length) continue;
      this.showErrorMessage($field, msgs);
    }
  }
}
