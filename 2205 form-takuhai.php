<?php
$times = [
    'いつでも',
    '午前中',
    '12時〜14時',
    '14時〜16時',
    '16時〜18時',
    '18時〜21時',
]
?>

<div class="c-rcm-form__panel-step js-panel-step">
    <?php get_component(
        'modules/form-step/field',
        [
            'text' => 'お申し込み内容を選択してください',
            'required' => true,
        ],
        function () use ($form_options) { ?>
        <div class="c-form-field__options js-step-form-options">
            <?php foreach ($form_options as $key => $option): ?>
                <?php get_component('modules/form-step/radio', [
                    'type'        => $key,
                    'gtm'         => $option['gtm'],
                    'step'        => $option['steps'],
                    'value'       => $option['value'],
                    'description' => $option['description'],
                ]); ?>
                <!-- if else radio2 -->
                <?php get_component('modules/form-step/radio2', [
                    'type'        => $key,
                    'gtm'         => $option['gtm'],
                    'step'        => $option['steps'],
                    'value'       => $option['value'],
                    'description' => $option['description'],
                ]); ?>
            <?php endforeach; ?>
        </div>
    <?php }
    ); ?>
</div>

<div class="c-rcm-form__panel-step js-panel-step">
    <?php get_component(
        'modules/form-step/field',
        [
            'text' => 'キット・伝票のお届け日時を<br>選択してください',
            'required' => true,
        ],
        function () use ($times) { ?>
        <?php get_component('modules/form-step/field-content', [
                'label' => 'キット・伝票のお届け希望日',
            ], function () { ?>
            <?php get_component('modules/form-step/select', [
                    'name' => 'delivery_date',
                    'custom_class' => 'js-form-select-date',
                ]); ?>
        <?php }) ?>

        <?php get_component('modules/form-step/field-content', [
                'label' => '時間を選択してください',
            ], function () use ($times) { ?>
            <?php get_component('modules/form-step/tab', [
                    'name' => 'time-invoice',
                    'data' => $times,
                ]); ?>
        <?php }) ?>

        <p class="c-form-field__note c-form-field__note--time">
            エリアによってはご希望の日時に添えない場合がございます。その場合はお問い合わせ後に弊社担当スタッフよりご連絡申し上げます。
        </p>

        <?php get_component('modules/form-step/field-content', [
                'label' => '配送保証サービスの選択',
            ], function () use ($times) { ?>
            <?php get_component('modules/form-step/radio2', [
                    'name' => 'delivery_service',
                    'data' => $times,
                ]); ?>
        <?php }) ?>
    <?php }
    ); ?>
</div>

<div class="c-rcm-form__panel-step js-panel-step">
    <?php get_component(
        'modules/form-step/field',
        [
            'text' => '集荷依頼の選択',
            'required' => true,
        ],
        function () use ($times) { ?>
        <?php get_component('modules/form-step/field-content', [], function () use ($times) { ?>
            <?php get_component('modules/form-step/radio2', [
                    'name' => 'pickup',
                    'data' => $times,
                ]); ?>
        <?php }) ?>
    <?php }
    ); ?>
</div>

<!-- nếu chọn pickup -->
<div class="c-rcm-form__panel-step js-panel-step">
    <?php get_component(
        'modules/form-step/field',
        [
            'text' => '訪問希望日時を選択してください',
            'required' => true,
        ],
        function () use ($times) { ?>
        <?php get_component('modules/form-step/field-content', [
                'label' => '希望日をお選びください',
            ], function () { ?>
            <?php get_component('modules/form-step/select', [
                    'name' => 'pickup_date',
                    'custom_class' => 'js-form-select-date',
                ]); ?>
        <?php }) ?>

        <?php get_component('modules/form-step/field-content', [
                'label' => '時間を選択してください',
            ], function () use ($times) { ?>
            <?php get_component('modules/form-step/tab', [
                    'name' => 'pickup_time',
                    'data' => $times,
                ]); ?>
        <?php }) ?>

        <p class="c-form-field__note c-form-field__note--time">
            エリアによってはご希望の日時に添えない場合がございます。その場合はお問い合わせ後に弊社担当スタッフよりご連絡申し上げます。
        </p>
    <?php }
    ); ?>
</div>

<!-- nếu chọn không pickup thi qua buoc nay-->
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
                    'name' => 'sei-takuhai',
                    'placeholder' => '例）山田',
                ]); ?>

            <?php get_component('modules/form-step/input', [
                    'name' => 'mei-takuhai',
                    'placeholder' => '例）太郎',
                ]); ?>
        <?php }) ?>

        <?php get_component('modules/form-step/field-content', [
                'label' => 'お名前（フリガナ）',
            ], function () { ?>
            <?php get_component('modules/form-step/input', [
                    'name' => 'kana_sei-takuhai',
                    'placeholder' => '例）ヤマダ',
                ]); ?>

            <?php get_component('modules/form-step/input', [
                    'name' => 'kana_mei-takuhai',
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
            'text' => '住所を入力してください',
            'required' => true,
        ],
        function () { ?>
        <?php get_component('modules/form-step/field-content', [
                'label' => '郵便番号',
            ], function () { ?>
            <?php get_component('modules/form-step/input', [
                    'name' => 'zip01-takuhai',
                    'placeholder' => '例）1410022',
                ]); ?>
        <?php }) ?>

        <?php get_component('modules/form-step/field-content', [
                'label' => '都道府県',
            ], function () { ?>
            <?php get_component('modules/form-step/input', [
                    'name' => 'pref01-takuhai',
                    'placeholder' => '都道府県',
                ]); ?>
        <?php }) ?>

        <?php get_component('modules/form-step/field-content', [
                'label' => '市区町村',
            ], function () { ?>
            <?php get_component('modules/form-step/input', [
                    'name' => 'addr01-takuhai',
                    'placeholder' => '市区町村',
                ]); ?>
        <?php }) ?>

        <?php get_component('modules/form-step/field-content', [
                'label' => '番地・建物名・部屋番号',
            ], function () { ?>
            <?php get_component('modules/form-step/input', [
                    'name' => 'blocknum-takuhai',
                    'placeholder' => '番地、建物名・部屋番号をご記入ください',
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
                'label' => '電話番号',
            ], function () { ?>
            <?php get_component('modules/form-step/input', [
                    'name' => 'tel-takuhai',
                    'placeholder' => '例：09012345678',
                ]); ?>
        <?php }) ?>

        <?php get_component('modules/form-step/field-content', [
                'label' => 'メールアドレス',
            ], function () { ?>
            <?php get_component('modules/form-step/input', [
                    'name' => 'email-takuhai',
                    'placeholder' => '例：info@brandrevalue.com',
                ]); ?>
        <?php }) ?>
    <?php }
    ); ?>
</div>

<div class="c-rcm-form__panel-step js-panel-step">
    <?php get_component(
        'modules/form-step/field',
        [
            'text' => 'お客様の個人情報の取扱いについて',
            'required' => true,
            'custom_class' => 'c-form-field--privacy-policy js-hide-inline-error js-hide-summary js-summary-proxy',
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
                'name' => 'acceptanceData-takuhai',
            ]); ?>
    <?php }
    ); ?>
</div>
