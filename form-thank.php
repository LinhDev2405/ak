<?php
$root_img = get_s3_follow_device() . '/categories/kimono-lp/form/';
$tel_number = config('contact.tel.affiliate_auto_send');
?>

<section class="c-form-thank">
    <h1 class="c-form-thank__title">
        出張買取のお申込みが<?= the_spbr() ?>完了いたしました！
        <i class="c-form-thank__icon"></i>
    </h1>

    <div class="c-form-thank__container">
        <?php get_component(
            'sections/lp/form/form-step',
            [
                'root_img'     => $root_img,
                'current_step' => 3,
            ]
        ); ?>

        <p class="c-form-thank__txt">
            <span class="c-form-thank__txt--big">お申込みありがとうございました。</span>
            <br>
            <?php if (is_mobile()) : ?>
                ご登録頂いたお電話番号宛にオペレーターからお電話致します。<br>お伺いの住所と日程をお伝えの上、ご予約の確定をお願い致します。
            <?php else : ?>
                お申込み内容を確認後、担当者より折り返しのご連絡をさせていただきます。
            <?php endif ?>
        </p>

        <div class="c-form-thank__contact">
            <p class="c-form-thank__contact-title">この番号からお電話させていただきます</p>
            <p class="c-form-thank__contact-tel"><?= $tel_number ?></p>
            <p class="c-form-thank__contact-disclaimer">■ 迷惑電話などの設定にご注意ください。</p>
        </div>

        <p class="c-form-thank__info">
            <?php if (is_mobile()) : ?>
                <span class="c-form-thank__info--bold">
                    お申込み内容を確認後、担当者より<br>折り返しのご連絡をさせていただきます。
                </span>
            <?php endif; ?>
            お問い合わせが殺到している時期は、ご連絡差し上げるまでにお時間を要する場合がございます。<br>
            お客様には大変ご迷惑をおかけしますが、お電話での受付も承っておりますので、<?= the_pbr() ?>
            こちらもご利用いただけますと幸いです。
        </p>

        <div class="c-form-thank__cta">
            <p class="c-form-thank__cta-title">
                お申込み内容の変更、その他<br>質問などはお電話をご利用ください
            </p>
            <?php get_component('common/lp/cta-btn', [
                'type' => 'tel'
            ], function () {
                slot('text1', function () { ?>
                    無料電話で申し込む
            <?php });
            }); ?>
        </div>

        <?php get_component('sections/lp/form/button', [
            'href' => home_url($back),
            'text' => '入力確認画面へ',
            'button_type' => 'submit',
        ]); ?>
    </div>
</section>
