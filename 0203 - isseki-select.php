<?php
$brands         = $args['brands'] ?? [];
$is_br2         = $args['is_br2'] ?? false;
$type2          = $args['type2'] ?? false;
$model          = $args['model'] ?? '';
$is_model       = $args['is_model'] ?? false;
$component_type = $args['component_type'] ?? 2;
$custom_path    = $args['custom_path'] ?? null;

$data = get_jisseki_select($custom_path, [
    'is_model'       => $is_model,
    'model'          => $model,
    'brands'         => $brands,
    'is_br2'         => $is_br2,
    'component_type' => $component_type,
]);

$title        = $data['title'] ?? '';
$rolex_models = $data['models'] ?? [];
$prepared     = $data['prepared'] ?? [];

$default_arr       = $prepared['default_arr'] ?? [];
$default_accordion = $prepared['default_arr_accordion'] ?? [];
$processed_models  = $prepared['processed_models'] ?? [];
$purchase_items    = $prepared['purchase_items'] ?? [];
$accordion_items   = $prepared['accordion_items'] ?? [];

$render_block = function (int $id, array $block = []) use ($is_model) {
    $select_data    = $block['select_data'] ?? [];
    $condition_data = $block['condition_data'] ?? [];
    $accordion_data = $block['accordion_data'] ?? [];
    $model_name     = $block['model_name'] ?? '';
    $hide_id        = $block['hide_id'] ?? false;

    if (empty($select_data) && empty($condition_data) && empty($accordion_data)) {
        return;
    }

    $hidden = $id > 0 ? ' hidden' : '';
    echo '<div class="c-jisseki-select__block" data-block-id="' . $id . '"' . $hidden . '>';

    if (!empty($select_data)) {
        get_component('jisseki/jisseki-item-select', [
            'id'   => $id,
            'data' => $select_data,
        ]);
    }

    if (!empty($accordion_data)) {
        get_component('jisseki/jisseki-item-accordion', [
            'data'    => $accordion_data,
            'id'      => $id,
            'hide_id' => $hide_id,
        ]);
    }

    if (!empty($condition_data)) {
        get_component('jisseki/jisseki-item-condition', [
            'id'         => $id,
            'data'       => $condition_data,
            'is_model'   => $is_model,
            'model_name' => $model_name,
        ]);
    }

    echo '</div>';
};
?>

<section class="c-jisseki-select js-jisseki-select">
    <?php if (!empty($title)) : ?>
        <?php get_component('titles/title3', [], function () use ($title) { ?>
            <?= wp_kses_post($title); ?>
        <?php }); ?>
    <?php endif; ?>

    <div class="c-jisseki-select__form" id="purchase_search_form">
        <?php if ($component_type !== 3 && !empty($rolex_models)) : ?>
            <div class="c-jisseki-select__form-search js-jisseki-dropdown">
                <p class="c-jisseki-select__form-default js-jisseki-toggle">
                    モデル名から選ぶ
                </p>

                <ul class="c-jisseki-select__form-options">
                    <?php foreach ($rolex_models as $index => $item) :
                        $model_jp = $item['model_jp'] ?? '';
                        if (!$model_jp) continue; ?>
                        <li
                            class="c-jisseki-select__form-item js-jisseki-option"
                            data-position="ロレックスモデル：<?= esc_attr($model_jp); ?>"
                            data-value="<?= $index + 1; ?>"
                            data-name="<?= esc_attr($model_jp); ?>">
                            <?= wp_kses_post($model_jp); ?>
                        </li>
                    <?php endforeach; ?>
                </ul>
            </div>
        <?php endif; ?>

        <?php get_component('datetime'); ?>
    </div>

    <?php get_component('jisseki/jisseki-information'); ?>

    <?php if ($component_type === 1 || $component_type === 2) : ?>
        <?php
        $render_block(0, [
            'select_data'    => $default_arr,
            'condition_data' => $default_arr,
            'accordion_data' => $default_accordion,
        ]);

        foreach ($processed_models as $index => $m) :
            $accordion_data = $m['accordion_items'] ?? [];

            $render_block($index + 1, [
                'select_data'    => $m['new_item_arr'] ?? [],
                'condition_data' => $m['item_array'] ?? [],
                'accordion_data' => $accordion_data,
                'model_name'     => $m['model_name'] ?? '',
                'hide_id'        => $component_type === 2 && $type2,
            ]);
        endforeach;
        ?>
    <?php endif; ?>

    <?php if ($component_type === 3 && (!empty($purchase_items) || !empty($accordion_items))) : ?>
        <?php $render_block(0, [
            'select_data'    => $purchase_items,
            'accordion_data' => $accordion_items,
        ]); ?>
    <?php endif; ?>

    <?php if ($component_type === 2 || ($component_type === 3 && (!empty($purchase_items) || !empty($accordion_items)))) : ?>
        <p class="c-jisseki-select__note">
            ※買取価格はあくまで参考です。実際の買取価格を保証するものではありません。<br>
            ※相場の変動や在庫の状況によって買取価格が変わります。
        </p>
    <?php endif; ?>

    <?php get_component('modal-condition'); ?>
</section>
