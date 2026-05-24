<div class="">
    form-visit
</div>

<div class="c-rcm-form__panel-step js-panel-step">
    <?php get_component(
        'modules/form-step/field',
        [
            'text' => '来店日時を選択してください',
            'required' => true,
        ],
        function () use ($times) { ?>
        <?php get_component('modules/form-step/field-content', [
                'text' => '第1希望',
                'required' => true,
            ], function () { ?>
            <?php get_component('modules/form-step/select', [
                    'name' => 'visit_time_1',
                    'custom_class' => 'js-form-select-date',
                    'default_option' => '希望日を選択してください',
                ]); ?>
            <?php get_component('modules/form-step/select', [
                    'name' => 'visit_date_1',
                    'custom_class' => 'js-form-select-date',
                    'default_option' => '時間を選択してください',
                ]); ?>
        <?php }) ?>

        <p class="c-form-field__note c-form-field__note--time">
            来店予約は日程調整が必要なため、弊社担当スタッフよりご連絡申し上げます。
        </p>

        <?php get_component('modules/form-step/field-content', [
                'text' => '第2希望',
                'required' => true,
            ], function () { ?>
            <?php get_component('modules/form-step/select', [
                    'name' => 'visit_time_2',
                    'custom_class' => 'js-form-select-date',
                    'default_option' => '希望日を選択してください',
                ]); ?>
            <?php get_component('modules/form-step/select', [
                    'name' => 'visit_date_2',
                    'custom_class' => 'js-form-select-date',
                    'default_option' => '時間を選択してください',
                ]); ?>
        <?php }) ?>

        <p class="c-form-field__note c-form-field__note--time">
            来店予約は日程調整が必要なため、弊社担当スタッフよりご連絡申し上げます。
        </p>

        <?php get_component('modules/form-step/field-content', [
                'text' => '第3希望',
                'required' => true,
            ], function () { ?>
            <?php get_component('modules/form-step/select', [
                    'name' => 'visit_time_3',
                    'custom_class' => 'js-form-select-date',
                    'default_option' => '希望日を選択してください',
                ]); ?>
            <?php get_component('modules/form-step/select', [
                    'name' => 'visit_date_3',
                    'custom_class' => 'js-form-select-date',
                    'default_option' => '時間を選択してください',
                ]); ?>
        <?php }) ?>

        <p class="c-form-field__note c-form-field__note--time">
            来店予約は日程調整が必要なため、弊社担当スタッフよりご連絡申し上げます。
        </p>
    <?php }
    ); ?>
</div>

<div class="c-rcm-form__panel-step js-panel-step">
    <?php get_component(
        'modules/form-step/field',
        [
            'text' => 'お名前を入力してください',
            'required' => true,
        ],
        function () { ?>
        <?php get_component('modules/form-step/field-content', [
                'label' => 'お名前',
            ], function () { ?>
            <?php get_component('modules/form-step/input', [
                    'name' => 'sei-visit',
                    'placeholder' => '例）山田',
                ]); ?>

            <?php get_component('modules/form-step/input', [
                    'name' => 'mei-visit',
                    'placeholder' => '例）太郎',
                ]); ?>
        <?php }) ?>

        <?php get_component('modules/form-step/field-content', [
                'label' => 'お名前（フリガナ）',
            ], function () { ?>
            <?php get_component('modules/form-step/input', [
                    'name' => 'kana_sei-visit',
                    'placeholder' => '例）ヤマダ',
                ]); ?>

            <?php get_component('modules/form-step/input', [
                    'name' => 'kana_mei-visit',
                    'placeholder' => '例）タロウ',
                ]); ?>
        <?php }) ?>
    <?php }
    ); ?>
</div>

<div class="c-rcm-form__panel-step js-panel-step">
    <?php get_component(
        'modules/form-step/field',
        [
            'text' => '連絡先を入力してください',
            'required' => true,
        ],
        function () { ?>
        <?php get_component('modules/form-step/field-content', [
                'text' => '電話番号',
            ], function () { ?>
            <?php get_component('modules/form-step/input', [
                    'name' => 'tel-visit',
                    'placeholder' => '例：09012345678',
                ]); ?>
        <?php }) ?>

        <?php get_component('modules/form-step/field-content', [
                'text' => 'メールアドレス',
            ], function () { ?>
            <?php get_component('modules/form-step/input', [
                    'name' => 'email-visit',
                    'placeholder' => '例：info@brandrevalue.com',
                ]); ?>
        <?php }) ?>
    <?php }
    ); ?>

    <?php get_component(
        'modules/form-step/field',
        [
            'text' => 'お客様の個人情報の取扱いについて',
            'required' => true,
            'hide_error' => true,
            'custom_class' => 'c-form-field--privacy-policy',
        ],
        function () { ?>
        <?php get_component('modules/form-step/field-content', [], function () { ?>
            <!-- Privacy Policy -->
            <?php get_component('modules/form/privacy-policy', [
                    'custom_path' => 'recommend/rolex',
                ]) ?>
        <?php }) ?>

        <?php get_component('modules/form-step/checkbox', [
                'text' => 'お客様の個人情報の取扱いについてに同意します',
                'required' => true,
                'type' => 'checkbox',
                'name' => 'acceptanceData-visit',
            ]); ?>
    <?php }
    ); ?>
</div>
