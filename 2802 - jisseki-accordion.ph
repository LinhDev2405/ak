<?php
$data    = $args['data'] ?? [];
$id      = $args['id'] ?? 0;
$hide_id = $args['hide_id'] ?? false;

if (empty($data)) return;

$has_showmore = count($data) > 12;

$render_list = function () use ($data) { ?>

    <div class="c-jisseki-accordion__header">
        <span class="c-jisseki-accordion__header-name">商品名</span>
        <span class="c-jisseki-accordion__header-price">買取価格</span>
    </div>

    <ul class="c-jisseki-accordion__list">
        <?php foreach ($data as $index => $item):
            $brand_name   = $item['model_name_jp'] ?? '';
            $full_title   = $item['full_title_jp'] ?? '';
            $item_name    = $brand_name !== ''
                ? str_replace($brand_name, '', $full_title)
                : $full_title;

            $has_href  = !empty($item['model_detail_url']);
            $item_href = $has_href ? $item['model_detail_url'] : '';

            $tag  = $has_href ? 'a' : 'span';
            $href = $has_href ? ' href="' . esc_url(home_url($item_href)) . '"' : '';

            $prices = [
                [
                    'value' => (float) ($item['price_rank_a_purchase'] ?? 0),
                    'label' => '未使用品',
                ],
                [
                    'value' => (float) ($item['price_rank_b_purchase'] ?? 0),
                    'label' => '中古品',
                ],
            ];

            $prices = array_filter($prices, fn($p) => $p['value'] > 0);
        ?>
            <li class="<?= clsx('c-jisseki-accordion__item', [
                            'js-showmore-item' => $index >= 12,
                        ]) ?>">
                <div class="c-jisseki-accordion__name">
                    <span class="c-jisseki-accordion__brand">
                        <?= esc_html($brand_name); ?>
                    </span>
                    <<?= $tag; ?> class="c-jisseki-accordion__product" <?= $href; ?>>
                        <?= wp_kses_post($item_name); ?>
                    </<?= $tag; ?>>
                </div>

                <?php if ($prices): ?>
                    <div class="c-jisseki-accordion__prices">
                        <?php foreach ($prices as $price): ?>
                            <div class="c-jisseki-accordion__sale">
                                <span class="c-jisseki-accordion__label">
                                    <?= esc_html($price['label']); ?>
                                </span>
                                <p class="c-jisseki-accordion__num">
                                    <?= number_format($price['value']); ?>
                                    <span class="c-jisseki-accordion__unit">円</span>
                                </p>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </li>
        <?php endforeach; ?>
    </ul>

<?php };
?>

<div class="c-jisseki-accordion">
    <p class="c-jisseki-accordion__title">その他の買取価格相場</p>

    <?php if ($has_showmore):
        get_component('common/showmore', [
            'btn_show_text' => '続きを読む',
        ], $render_list);
    else:
        $render_list();
    endif; ?>
</div>
