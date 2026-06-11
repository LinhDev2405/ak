import "../modules/announcement";
import "../modules/accordion";
import "../modules/modal";
import { initForm } from '../modules/form/form';
import "../modules/header-fixed";
import "../modules/anchor-scroll";
import { FORM_RULES } from "../modules/form-shared/form-rules";

const FORM_ID = '#form';

const MESSAGES = {
    delivery_date: { required: '日付を入力してください。' },
};

$(document).ready(() => {
    initForm({
        formType: 'shuccho',
        formSelector: FORM_ID,
        rules: FORM_RULES.shuccho,
        messages: MESSAGES,
    });
});

