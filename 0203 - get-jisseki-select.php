<?php

/**
 * サンダーバード → デイトジャストサンダーバード (config name → CSV lookup key).
 */
function rolex_csv_key(string $model_jp): string
{
    return str_contains($model_jp, 'サンダーバード')
        ? 'デイトジャストサンダーバード'
        : $model_jp;
}

function get_jisseki_select(?string $custom_path, array $options = [])
{
    $current_path = get_path($custom_path)
        ->without_query()
        ->without_page()
        ->without_lp()
        ->get();

    $options = array_merge([
        'model'          => '',
        'brands'         => [],
        'is_br2'         => false,
        'is_model'       => false,
        'component_type' => 1,
    ], $options);

    if ($options['component_type'] === 3) {
        return rolex_get_type3_data($current_path, $options);
    }

    // Type 1 & 2: validate models + cache CSV data in one pass
    [$models, $cache] = rolex_get_valid_models($options['brands']);

    $model = $options['model'];
    $break = $options['is_br2'] && is_mobile() ? get_spbr() : ' ';
    $title = empty($model)
        ? 'ロレックス 買取価格相場'
        : 'ロレックス' . $break . str_replace('Ⅰ', '', $model) . '<br>買取価格相場';

    $prepared = rolex_prepare_data(
        $models,
        $options['component_type'],
        $options['is_model'],
        $cache,
    );

    return [
        'models'   => $models,
        'title'    => $title,
        'prepared' => $prepared,
    ];
}

/**
 * Filter Rolex models by brands, remove empty/imageless models.
 * Returns [filtered_models, data_cache] — CSV is read once per model.
 *
 * @param  array $brands
 * @return array{0: list<array>, 1: array<string, list<array>>}
 */
function rolex_get_valid_models(array $brands = []): array
{
    $models = config('rolex_models_list') ?? [];

    if (!empty($brands)) {
        $models = array_values(array_filter($models, function ($item) use ($brands) {
            $model_jp = $item['model_jp'] ?? '';
            foreach ($brands as $brand) {
                if (str_contains($model_jp, $brand)) {
                    return true;
                }
            }
            return false;
        }));
    }

    $valid = [];
    $cache = [];

    foreach ($models as $model) {
        $model_jp = $model['model_jp'] ?? '';
        if (!$model_jp) continue;

        $key  = rolex_csv_key($model_jp);
        $data = get_rolex_data_by_model($key);

        if (!$data) continue;
        if (empty(array_filter(array_column($data, 'image_url')))) continue;

        $valid[]     = $model;
        $cache[$key] = $data;
    }

    return [$valid, $cache];
}

/**
 * Prepare Rolex model data for display (Type 1 & 2).
 *
 * @param array $cache Pre-loaded CSV data keyed by rolex_csv_key().
 */
function rolex_prepare_data(
    array $models,
    int $component_type,
    bool $is_model,
    array $cache = [],
): array {

    $default_arr           = [];
    $default_arr_accordion = [];
    $processed_models      = [];

    foreach ($models as $model) {
        $model_jp = $model['model_jp'] ?? '';
        if (!$model_jp) continue;

        $key     = rolex_csv_key($model_jp);
        $results = $cache[$key] ?? get_rolex_data_by_model($key);
        if (!$results) continue;

        $model_name = rolex_resolve_model_name(
            $is_model,
            $results[0]['category_url'] ?? '',
        );

        $new_item_arr    = [];
        $new_item_arr1   = [];
        $accordion_items = [];
        $image_counter   = 0;

        foreach ($results as $row) {
            $has_image = !empty($row['image_url']);

            if ($component_type === 1) {
                if ($has_image) {
                    $default_arr[]  = $row;
                    $new_item_arr[] = $row;
                } else {
                    $accordion_items[]       = $row;
                    $default_arr_accordion[] = $row;
                }
                continue;
            }

            // Type 2
            if ($has_image) {
                if ($image_counter < 2) {
                    $default_arr[] = $row;
                    $image_counter++;
                }
                $new_item_arr[] = $row;
            } else {
                $accordion_items[] = $row;
            }

            if (empty($new_item_arr)) {
                $new_item_arr1[] = $row;
            }
        }

        $processed_models[] = [
            'new_item_arr'    => $new_item_arr,
            'new_item_arr1'   => $new_item_arr1,
            'accordion_items' => $accordion_items,
            'model_name'      => $model_name,
            'item_array'      => $results,
        ];
    }

    return [
        'default_arr'           => $default_arr,
        'default_arr_accordion' => $default_arr_accordion,
        'processed_models'      => $processed_models,
    ];
}

/**
 * Get data for component_type 3.
 *
 * is_model = true  → model page  (e.g. /cat/watch/rolex/rolex-daytona)
 * is_model = false → product page (e.g. /cat/watch/rolex/rolex-daytona/116500ln)
 */
function rolex_get_type3_data(string $current_path, array $options): array
{
    $is_model = $options['is_model'];
    $break    = $options['is_br2'] && is_mobile() ? get_spbr() : ' ';

    $purchase_items  = [];
    $accordion_items = [];
    $brand  = '';
    $number = '';

    if ($is_model) {
        // Model page: resolve name from URL, lookup CSV by key
        $model_name = rolex_resolve_model_name(true);
        $results    = get_rolex_data_by_model(rolex_csv_key($model_name));
    } else {
        // Product page: find rows matching model_code
        $product = get_rolex_product_by_path($current_path);

        if (empty($product)) {
            return ['title' => '', 'prepared' => []];
        }

        $model_code = strtolower($product['model'] ?? '');
        $model_name = rolex_resolve_model_name(false);
        $brand      = $product['brand_name_jp'] ?? '';
        $number     = strtoupper($product['model'] ?? '');

        $all_rows = get_rolex_data_by_model($product['model_name_jp'] ?? '');
        $results  = array_values(array_filter(
            $all_rows,
            fn($row) => isset($row['model_code'])
                && strtolower((string) $row['model_code']) === $model_code,
        ));
    }

    // Explorer: strip Ⅰ on non-explorer model pages
    if ($is_model && !str_contains($current_path, 'rolex-explorer')) {
        $model_name = str_replace('Ⅰ', '', $model_name);
    }

    // Split: has image → purchase list, no image → accordion
    foreach ($results ?? [] as $row) {
        if (!empty($row['image_url'])) {
            $purchase_items[] = $row;
        } else {
            $accordion_items[] = $row;
        }
    }

    // Title
    if ($is_model) {
        $brand = 'ロレックス';
        $title = $brand . $break . $model_name . '<br>買取価格相場';
    } else {
        $title = $brand . $break . $model_name
            . ' Ref.' . $number . 'の'
            . '<br>買取価格相場表';
    }

    return [
        'title'    => $title,
        'is_model' => $is_model,
        'prepared' => [
            'purchase_items'  => $purchase_items,
            'accordion_items' => $accordion_items,
        ],
    ];
}
