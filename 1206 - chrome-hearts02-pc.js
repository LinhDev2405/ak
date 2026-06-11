import { FORM_STEP_RULES } from "../../modules/form-shared/form-rules";
import { initStepForm } from "../../modules/form-step/form-step";

$(document).ready(() => {
    initStepForm({ rules: FORM_STEP_RULES });
});
