<div class="c-rcm-form__panel-step js-panel-step">
    <?php get_component('modules/form-step/field', [
            'text' => 'お名前を入力してください',
            'required' => true,
        ],
        function () { ?>
            <?php get_component('modules/form-step/field-content', [
                    'label' => 'お名前',
                ], function () { ?>
                    <?php get_component('modules/form-step/input', [
                        'name' => 'sei-contact',
                        'placeholder' => '例）山田',
                    ]); ?>

                    <?php get_component('modules/form-step/input', [
                        'name' => 'mei-contact',
                        'placeholder' => '例）太郎',
                    ]); ?>
            <?php }) ?>

            <?php get_component('modules/form-step/field-content', [
                    'label' => 'お名前（フリガナ）',
                ], function () { ?>
                    <?php get_component('modules/form-step/input', [
                        'name' => 'kana_sei-contact',
                        'placeholder' => '例）ヤマダ',
                    ]); ?>

                    <?php get_component('modules/form-step/input', [
                        'name' => 'kana_mei-contact',
                        'placeholder' => '例）タロウ',
                    ]); ?>
            <?php }) ?>
        <?php }
    ); ?>
</div>

<div class="c-rcm-form__panel-step js-panel-step">
    <?php get_component('modules/form-step/field', [
            'text' => '連絡先を入力してください',
            'required' => true,
        ],
        function () { ?>
            <?php get_component('modules/form-step/field-content', [
                    'label' => '電話番号',
                ], function () { ?>
                    <?php get_component('modules/form-step/input', [
                        'name' => 'tel-contact',
                        'placeholder' => '例：09012345678',
                    ]); ?>
            <?php }) ?>

            <?php get_component('modules/form-step/field-content', [
                    'label' => 'メールアドレス',
                ], function () { ?>
                <?php get_component('modules/form-step/input', [
                    'name' => 'email-contact',
                    'placeholder' => '例：info@brandrevalue.com',
                ]); ?>
            <?php }) ?>
        <?php }
    ); ?>
</div>

<div class="c-rcm-form__panel-step js-panel-step">
    <?php get_component('modules/form-step/field', [
            'text' => 'お問い合わせ内容を入力してください',
            'required' => true,
        ],
        function () { ?>
            <?php get_component('modules/form-step/field-content', [], function () { ?>
                    <?php get_component('modules/form-step/textarea', [
                        'name' => 'description-contact',
                        'placeholder' => '質問・ご要望などをご記入ください。

事前査定をご希望の方は、
ブランド名・モデル名・サイズ・付属品の有無など、お品物の情報をご入力ください。',
                    ]); ?>
            <?php }) ?>
        <?php }
    ); ?>

    <?php get_component('modules/form-step/field', [
            'text' => '画像をアップロード',
            'custom_class' => 'c-form-field--image'
        ],
        function () { ?>
            <?php get_component('modules/form-step/field-content', [], function () { ?>
                <?php get_component('modules/form-step/input', [
                    'type' => 'file',
                    'name' => 'file1',
                    'placeholder' => 'ファイルを選択 ',
                ]); ?>
            <?php }) ?>

            <p class="c-form-field__note">画像サイズの上限は8MBです</p>
        <?php }
    ); ?>

    <?php get_component('modules/form-step/field', [
            'text' => 'お客様の個人情報の取扱いについて',
            'required' => true,
            'custom_class' => 'c-form-field--privacy-policy js-hide-summary',
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
                'name' => 'acceptanceData-contact',
            ]); ?>
        <?php }
    ); ?>
</div>
