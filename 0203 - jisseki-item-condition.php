<?php
$id        = $args['id'] ?? 0;
$data      = $args['data'] ?? [];
$is_model  = $args['is_model'] ?? 0;

if (empty($data)) return;

$model_name = $args['model_name'] ?? rolex_resolve_model_name($is_model);
$title = 'ロレックス '
    . $model_name
    . the_spbr()
    . ' 買取実績（中古状態別）';

$default_img = get_s3_template_directory_uri()
    . '/img/pc/brand_lp/rolex/rolex/no_image.jpg';

$rank_fields = [
    ['price_rank_a_max', 'rank_a_grade', 'rank_a_image'],
    ['price_rank_ab_purchase', 'rank_ab_grade', 'rank_ab_image'],
];

$has_showmore = count($data) > 6;

$render_list = function () use ($data, $rank_fields, $default_img) { ?>
    <ul class="c-jisseki-item-condition__list">
        <?php foreach ($data as $index => $item):
            $item_name = ($item['brand_name_jp'] ?? '') . ($item['full_title_jp'] ?? '');

            foreach ($rank_fields as [$price_key, $grade_key, $img_key]):
                $price = (float) ($item[$price_key] ?? 0);
                if ($price <= 0) continue;

                $grade = $item[$grade_key] ?? '';
                $item_img = !empty($item[$img_key])
                    ? changeDomainAWSS3($item[$img_key])
                    : $default_img;
        ?>
                <li class="<?= clsx(
                                'c-jisseki-item-condition__item',
                                [
                                    'js-showmore-item' => $index >= 6,
                                    'c-jisseki-item-condition__item--no-img' => empty($item[$img_key]),
                                ]
                            ) ?>">
                    <figure class="c-jisseki-item-condition__img">
                        <img
                            loading="lazy"
                            src="<?= esc_url($item_img) ?>"
                            <?php device_width_height(120, 160); ?>
                            alt="<?= esc_attr($item_name); ?>">
                    </figure>

                    <div class="c-jisseki-item-condition__prices">
                        <span class="c-jisseki-item-condition__label">
                            状態ランク<?= esc_html($grade); ?>
                        </span>
                        <p class="c-jisseki-item-condition__num">
                            <?= number_format($price); ?>円
                        </p>
                    </div>

                    <p class="c-jisseki-item-condition__name">
                        <?= wp_kses_post($item_name); ?>
                    </p>
                </li>
        <?php
            endforeach;
        endforeach;
        ?>
    </ul>
<?php };
?>

<div class="c-jisseki-item-condition">
    <h2 class="c-jisseki-item-condition__title">
        <?= ($title) ?>
    </h2>

    <button class="c-jisseki-item-condition__modal js-modal-open">
        状態ランクについて
    </button>

    <?php if ($has_showmore):
        get_component('common/showmore', [
            'btn_show_text' => '続きを読む',
        ], $render_list);
    else:
        $render_list();
    endif; ?>

    <p class="c-jisseki-select__note">
        ※買取価格はあくまで参考です。実際の買取価格を保証するものではありません。<br>
        ※相場の変動や在庫の状況、付属品やお品物の状態によって買取価格が変わります。
    </p>
</div>
