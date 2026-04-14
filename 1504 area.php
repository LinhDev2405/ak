<div class="c-area">
    <div class="l-container">
        <?php $slot('image', [], function () { ?>
            <figure class="c-area__banner">
                <img
                    loading="lazy"
                    class="c-area__img"
                    src="<?= esc_url(get_s3_template_directory_uri() . '/img/kottou/' . get_device() . '/area/area_img.png'); ?>"
                    alt="日本全国対応可能!!"
                    <?= device_width_height(634, 658, 1170, 321); ?>>

                <figcaption class="c-area__cap">※季節事情または地域により出張査定や最短で即日での対応が難しい場合もございます。<?php the_spbr(); ?>ご不明な点はお問い合わせください。</figcaption>
            </figure>
        <?php }); ?>
    </div>
</div>
