<?php
$data = $args['data'] ?? [];
$id   = $args['id'] ?? 0;

if (empty($data)) return;

$has_showmore = count($data) > 8;

$render_list = function () use ($data) { ?>
    <ul class="c-jisseki-select__list">
        <?php foreach ($data as $index => $item):

            // Skip items with no prices (matches old behavior)
            $price_a = (float) ($item['price_rank_a_purchase'] ?? 0);
            $price_b = (float) ($item['price_rank_b_purchase'] ?? 0);
            if ($price_a <= 0 && $price_b <= 0) continue;

            $has_href  = !empty($item['model_detail_url']);
            $item_href = $has_href ? $item['model_detail_url'] : '';
            $item_name = ($item['brand_name_jp'] ?? '') . ($item['full_title_jp'] ?? '');
            $item_img  = !empty($item['image_url'])
                ? changeDomainAWSS3($item['image_url'])
                : '';

            $tag  = $has_href ? 'a' : 'p';
            $href = $has_href ? ' href="' . esc_url(home_url($item_href)) . '"' : '';
            $class_atr = 'c-jisseki-select__name' . ($has_href ? ' is-link' : '');

            $prices = [
                ['value' => $price_a, 'label' => '未使用品'],
                ['value' => $price_b, 'label' => '中古品'],
            ];

            $prices = array_filter($prices, fn($p) => $p['value'] > 0);
        ?>
            <li class="<?= clsx('c-jisseki-select__item', [
                            'js-showmore-item' => $index >= 8,
                            'c-jisseki-select__item--no-link' => !$has_href,
                        ]) ?>">
                <figure class="c-jisseki-select__img">
                    <img
                        loading="lazy"
                        src="<?= esc_url($item_img); ?>"
                        width="120"
                        height="160"
                        alt="<?= esc_attr($item_name); ?>">
                </figure>

                <<?= $tag; ?> class="c-jisseki-select__name" <?= $href; ?>>
                    <?= wp_kses_post($item_name); ?>
                </<?= $tag; ?>>

                <?php if ($prices): ?>
                    <div class="c-jisseki-select__prices">
                        <?php foreach ($prices as $i => $price): ?>
                            <div class="<?= clsx('c-jisseki-select__sale', [
                                            'c-jisseki-select__sale--first' => $i === 0,
                                        ]) ?>">
                                <span class="c-jisseki-select__label">
                                    <?= esc_html($price['label']); ?>
                                </span>
                                <p class="c-jisseki-select__num">
                                    <?= number_format($price['value']); ?><span class="c-jisseki-select__unit">円</span>
                                </p>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </li>
        <?php endforeach; ?>
    </ul>
<?php };

if ($has_showmore):
    get_component('common/showmore', [
        'btn_show_text' => 'もっと見る',
    ], $render_list);
else:
    $render_list();
endif;
