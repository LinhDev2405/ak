import { SESSION_KEYS } from "./variables";

// StepSession
export class StepSession {
    // Storage primitives
    get(key, fallback = null) {
        try {
            return JSON.parse(sessionStorage.getItem(key)) ?? fallback;
        } catch {
            return fallback;
        }
    }

    set(key, value) {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
        } catch {}
    }

    remove(key) {
        try {
            sessionStorage.removeItem(key);
        } catch {}
    }

    // Step state
    getStepState() {
        return this.get(SESSION_KEYS.state, {
            panelId: "",
            value: "",
            currentStep: 0,
        });
    }

    setStepState(payload = {}) {
        this.set(SESSION_KEYS.state, {
            ...this.getStepState(),
            ...payload,
        });
    }

    clearStepState() {
        this.remove(SESSION_KEYS.state);
    }

    // Restore payload
    getRestorePayload() {
        const payload = this.get(SESSION_KEYS.restore);

        if (!payload || typeof payload !== "object") {
            return null;
        }

        const path = String(payload.path || "").trim();

        if (path && path !== window.location.pathname) {
            return null;
        }

        return payload;
    }

    clearRestorePayload() {
        this.remove(SESSION_KEYS.restore);
    }

    applyRestorePayload($root, payload) {
        const values = payload?.values || {};
        const entries = Object.entries(values);

        // ── Pass 1: restore radios and checkboxes ─────────────────────────────
        // These must be applied first so that any conditional visibility logic
        // (e.g. syncPickupOption) that runs after applyRestorePayload sees the
        // correct checked state before text/select values are written.
        entries.forEach(([name, value]) => {
            const $inputs = $root.find(`[name="${name}"]`);

            if (!$inputs.length) return;

            const type = String($inputs.first().attr("type") || "").toLowerCase();

            if (type === "radio") {
                // Skip if no value saved — avoids unchecking a group that was never
                // filled (e.g. pickup_time when the user chose "希望しない").
                if (String(value) === "") return;

                $inputs.prop("checked", false);

                const $matched = $inputs.filter(function () {
                    return String($(this).val()) === String(value);
                });

                $matched.prop("checked", true);
                $inputs.closest(".js-form-radio-item").removeClass("is-active");
                $matched.closest(".js-form-radio-item").addClass("is-active");
                return;
            }

            if (type === "checkbox") {
                const selectedValues = Array.isArray(value) ? value.map(String) : [String(value || "on")];

                $inputs.each(function () {
                    const checked = selectedValues.includes(String($(this).val() || "on"));

                    $(this).prop("checked", checked);
                    $(this).closest(".js-input-checkbox-wrapper").toggleClass("is-checked", checked);
                });
            }
        });

        // ── Sync conditional UI after radios are restored ─────────────────────
        // Run pickup visibility so that inputs inside hidden sections are
        // disabled before we attempt to restore their values below.
        const $pickupRadio = $root.find('input[name="pickup"]:checked').first();

        if ($pickupRadio.length) {
            const $yes = $root.find(".js-pickup-option-yes");
            const $yesDetails = $yes.find(".js-pickup-option-yes-content");

            if ($yesDetails.length) {
                const isYes = $yes.has($pickupRadio).length > 0;

                $yesDetails.attr("hidden", !isYes);
                $yesDetails.find("input, textarea, select").prop("disabled", !isYes);
            }
        }

        // ── Pass 2: restore text / select values ──────────────────────────────
        // Skip file inputs and any input that is currently disabled — disabled
        // inputs belong to a hidden conditional section (e.g. pickup date/time
        // when "希望しない" is selected) and must not be pre-filled.
        entries.forEach(([name, value]) => {
            const $inputs = $root.find(`[name="${name}"]`);

            if (!$inputs.length) return;

            const type = String($inputs.first().attr("type") || "").toLowerCase();
            if (type === "file" || type === "radio" || type === "checkbox") return;

            // Don't restore into disabled inputs (conditional hidden sections).
            if ($inputs.first().prop("disabled")) return;

            // An empty saved value means the field was never filled — don't clear it.
            if (String(value) === "") return;
            $inputs.val(value);
        });
    }

    // Scroll after back
    consumeScrollAfterBackFlag() {
        try {
            const value = sessionStorage.getItem(SESSION_KEYS.scrollAfterBack);

            if (!value) return false;

            sessionStorage.removeItem(SESSION_KEYS.scrollAfterBack);
            return true;
        } catch {
            return false;
        }
    }

    setScrollTop(value) {
        this.set(SESSION_KEYS.scrollTop, value);
    }

    getScrollTop() {
        return this.get(SESSION_KEYS.scrollTop, null);
    }

    consumeScrollTop() {
        const value = this.getScrollTop();
        this.remove(SESSION_KEYS.scrollTop);
        return value;
    }
}
