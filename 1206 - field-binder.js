/**
 * field-binder.js  —  form-shared
 *
 * Shared wiring utilities used by both FormController (single-step)
 * and StepFormController (multi-step).
 *
 * Zip HTML convention (class-based, no wrapper needed):
 *   <input class="js-field-zip"        name="zip01-…">
 *   <input class="js-field-prefecture" name="pref01-…">
 *   <input class="js-field-city"       name="addr01-…">
 *
 * Multiple zip groups on the same page are supported — each triplet must
 * share a common ancestor. The lookup is scoped to the closest ancestor
 * that contains all three inputs (typically a .c-form-field__box or form).
 *
 * Phone fields: add class `js-field-phone` on the <input>.
 */

import { formatPhoneValue } from "../../utils/format.js";
import { getPhoneFormatter } from "./utils.js";

// ─── Zip ──────────────────────────────────────────────────────────────────────

/**
 * Bind AjaxZip3 auto-fill for one zip/pref/addr triplet.
 *
 * @param {object}   options
 * @param {jQuery}   options.$zip
 * @param {jQuery}   options.$pref
 * @param {jQuery}   options.$addr
 * @param {string}   [options.namespace='zipAutoFill']
 * @param {function} [options.onSuccess]  receives { $zip, $pref, $addr }
 */
export function bindZipGroup({ $zip, $pref, $addr, namespace = "zipAutoFill", onSuccess } = {}) {
    if (typeof AjaxZip3 === "undefined") return false;
    if (!$zip?.length || !$pref?.length || !$addr?.length) return false;

    const eventName = `keyup.${namespace}`;
    $zip.off(eventName).on(eventName, function () {
        AjaxZip3.onSuccess = () => onSuccess?.({ $zip, $pref, $addr });
        AjaxZip3.zip2addr(
            this,
            "",
            $pref.attr("id") || $pref.attr("name"),
            $addr.attr("id") || $addr.attr("name"),
        );
    });

    return true;
}

/**
 * Find all zip triplets inside $root using js-field-zip / js-field-prefecture /
 * js-field-city classes and bind AjaxZip3 auto-fill on each.
 *
 * If only one triplet exists the binding is straightforward.
 * For multiple triplets, each js-field-zip is paired with the nearest
 * js-field-prefecture and js-field-city within the same scoped ancestor.
 *
 * @param {jQuery}   $root
 * @param {object}   [options]
 * @param {string}   [options.namespace='zipAutoFill']
 * @param {function} [options.onSuccess]  receives { $zip, $pref, $addr }
 */
export function initZipFields($root, { namespace = "zipAutoFill", onSuccess } = {}) {
    const $zips = $root.find(".js-field-zip");

    if (!$zips.length) return;

    if ($zips.length === 1) {
        // Single triplet — simple lookup
        const $zip = $zips.first();
        const $pref = $root.find(".js-field-prefecture").first();
        const $addr = $root.find(".js-field-city").first();

        if ($zip.length && $pref.length && $addr.length) {
            bindZipGroup({ $zip, $pref, $addr, namespace, onSuccess });
        }
        return;
    }

    // Multiple zip inputs — pair each with its closest sibling pref/city.
    // Strategy: find the common ancestor of zip+pref+city by walking up from
    // each zip until we find an ancestor that also contains pref and city.
    $zips.each(function () {
        const $zip = $(this);

        // Walk up the DOM until we find an element containing all three.
        let $scope = $zip.parent();
        let $pref = $();
        let $addr = $();

        while ($scope.length && $scope[0] !== document) {
            $pref = $scope.find(".js-field-prefecture").first();
            $addr = $scope.find(".js-field-city").first();
            if ($pref.length && $addr.length) break;
            $scope = $scope.parent();
        }

        if (!$pref.length || !$addr.length) return;

        bindZipGroup({ $zip, $pref, $addr, namespace, onSuccess });
    });
}

// ─── Phone ────────────────────────────────────────────────────────────────────

/**
 * Format phone inputs on `change`.
 * @param {jQuery} $phoneFields
 */
export function bindPhoneFormatter($phoneFields) {
    const getFormatter = () => getPhoneFormatter();

    $phoneFields.on("change", function () {
        const val = (this.value || "").trim();
        const formatted = formatPhoneValue(val, { formatter: getFormatter() });

        if (formatted && formatted !== val) {
            this.value = formatted;
            $(this).trigger("input");
        }
    });
}

// ─── Active-field wiring ──────────────────────────────────────────────────────

/**
 * Wire `input` / `change` on all inputs inside `$scope` → `onField($field)`.
 * Also activates fields that already have values (initial load + bfcache restore).
 *
 * Accepts a plain callback so it works with both FormValidator (form.js) and
 * PanelValidator (form-step.js) without coupling to a specific class.
 *
 * @param {jQuery}   $scope
 * @param {function} onField  — called with a jQuery-wrapped input on every interaction
 */
export function wireActiveState($scope, onField) {
    $scope.on("input change", "input, textarea, select", (e) => {
        onField($(e.currentTarget));
    });

    const activateExisting = () => {
        $scope
            .find('input:not([type="hidden"]):not([type="file"]), textarea, select')
            .each((_, el) => onField($(el)));
    };

    activateExisting();

    // bfcache restore (Safari / Firefox back-forward)
    $(window).on("pageshow", (e) => {
        if (e.originalEvent?.persisted) activateExisting();
    });
}
