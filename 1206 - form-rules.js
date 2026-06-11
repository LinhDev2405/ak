const FORM_STEP_RULES = {
    visit: [
        {
            visit_area: ["required"],
            visit_area2: ["required"],
        },
        {
            visit_date_1: ["required"],
            visit_time_1: ["required"],
            visit_date_2: ["required"],
            visit_time_2: ["required"],
            visit_date_3: ["required"],
            visit_time_3: ["required"],
        },
        {
            "sei-visit": ["required"],
            "mei-visit": ["required"],
            "kana_sei-visit": ["required", "kata"],
            "kana_mei-visit": ["required", "kata"],
        },
        {
            "tel-visit": ["required", "phone"],
            "email-visit": ["required", "email"],
            "acceptanceData-visit": ["acceptance"],
        },
    ],

    takuhai: [
        {
            delivery: ["required"],
        },
        {
            delivery_date: ["required"],
            "time-invoice": ["required"],
            delivery_service: ["required"],
        },
        {
            pickup: ["required"],
            pickup_date: ["required"],
            pickup_time: ["required"],
        },
        {
            "sei-takuhai": ["required"],
            "mei-takuhai": ["required"],
            "kana_sei-takuhai": ["required", "kata"],
            "kana_mei-takuhai": ["required", "kata"],
        },
        {
            "zip01-takuhai": ["zipcode"],
            "pref01-takuhai": ["required"],
            "addr01-takuhai": ["required"],
            "blocknum-takuhai": ["required"],
        },
        {
            "tel-takuhai": ["required", "phone"],
            "email-takuhai": ["required", "email"],
            "acceptanceData-takuhai": ["acceptance"],
        },
    ],

    shuccho: [
        {
            date_shuccho: ["required"],
            "time-shuccho": ["required"],
        },
        {
            "sei-shuccho": ["required"],
            "mei-shuccho": ["required"],
            "kana_sei-shuccho": ["required", "kata"],
            "kana_mei-shuccho": ["required", "kata"],
        },
        {
            "zip01-shuccho": ["zipcode"],
            "pref01-shuccho": ["required"],
            "addr01-shuccho": ["required"],
            "blocknum-shuccho": ["required"],
        },
        {
            "tel-shuccho": ["required", "phone"],
            "email-shuccho": ["required", "email"],
        },
        {
            "description-shuccho": ["required"],
            file1: ["fileType", "fileSize"],
            "acceptanceData-shuccho": ["acceptance"],
        },
    ],

    contact: [
        {
            "sei-contact": ["required"],
            "mei-contact": ["required"],
            "kana_sei-contact": ["required", "kata"],
            "kana_mei-contact": ["required", "kata"],
        },
        {
            "tel-contact": ["required", "phone"],
            "email-contact": ["required", "email"],
        },
        {
            "description-contact": ["required"],
            file1: ["fileType", "fileSize"],
            "acceptanceData-contact": ["acceptance"],
        },
    ],
};

const FORM_RULES = {
    shuccho: {
        sei: ["required"],
        mei: ["required"],
        kana_sei: ["required", "kata"],
        kana_mei: ["required", "kata"],
        tel: ["required", "phone"],
        zip: ["required", "zipcode"],
        pref01: ["required"],
        addr01: ["required"],
        blocknum: ["required"],
        email: ["required", "email"],
        delivery_date: ["required"],
        request_kit: ["required"],
        file1: ["fileType", "fileSize"],
        acceptanceData: ["required"],
    },
};

export { FORM_RULES, FORM_STEP_RULES };
