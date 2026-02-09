<?php

/**
 * Rolex Jisseki Select — Data Layer (Optimized)
 *
 * Performance: CSV files are loaded ONCE per request via static cache.
 * All lookups use pre-built indexes for O(1) access.
 *
 * Original: components/rolex/list-rolex.php
 */

// ─── Cache Layer ─────────────────────────────────────────────

/**
 * Load all Rolex CSV rows once (static cached).
 * Replaces repeated read_csv() calls throughout the file.
 *
 * @return array Flat array of all CSV rows
 */
function rolex_load_all_items(): array
{
    static $cache = null;
    if ($cache !== null) {
        return $cache;
    }

    $cache = [];
    foreach (['rolex_standard_items_with_map', 'rolex_fixed_items_with_map'] as $file) {
        array_push($cache, ...read_csv($file));
    }

    return $cache;
}

/** Get all items indexed by model_name_jp (static cached). */
function rolex_items_by_model(): array
{
    static $index = null;
    if ($index !== null) {
        return $index;
    }

    $index = [];
    foreach (rolex_load_all_items() as $row) {
        $key = $row['model_name_jp'] ?? '';
        if ($key !== '') {
            $index[$key][] = $row;
        }
    }

    return $index;
}

/** Get model_en → model_jp mapping (static cached). */
function rolex_slug_to_name_map(): array
{
    static $map = null;
    if ($map !== null) {
        return $map;
    }

    $map = [];
    foreach (config('rolex_models_list') ?? [] as $m) {
        $en = $m['model_en'] ?? '';
        if ($en !== '') {
            $map[$en] = $m['model_jp'] ?? '';
        }
    }

    return $map;
}

// ─── Main Entry Point ────────────────────────────────────────

/** Get Rolex jisseki select data for display. */
function get_jisseki_select(?string $custom_path, array $options = []): array
{
    $current_path = get_path($custom_path)
        ->without_query()
        ->without_page()
        ->without_lp()
        ->get();

    $options = array_merge([
        'model'          => '',
        'brands'         => [],
        'type2'          => false,
        'is_br2'         => false,
        'br'             => '',
        'is_model'       => false,
        'component_type' => 1,
    ], $options);

    if ($options['component_type'] === 3) {
        return rolex_get_type3_data(
            $current_path,
            $options['is_model'],
            $options['is_br2']
        );
    }

    // Type 1 & 2
    $models = rolex_get_valid_models($options['brands']);
    $model  = $options['model'];
    $br     = ($options['is_br2'] && wp_is_mobile()) ? '<br>' : ' ';
    $title  = empty($model)
        ? 'ロレックス 買取価格相場'
        : 'ロレックス' . $br . str_replace('Ⅰ', '', $model) . '<br>買取価格相場';

    return [
        'models'   => $models,
        'title'    => $title,
        'prepared' => rolex_prepare_data($models, $options['component_type'], false, $options['is_model']),
    ];
}

// ─── Helpers ─────────────────────────────────────────────────

/** Resolve Rolex model display name from path or current URL. */
function rolex_resolve_model_name(bool $is_model, string $path_from_csv = ''): string
{
    $map = rolex_slug_to_name_map();

    if ($path_from_csv !== '') {
        $current_path = $path_from_csv;
    } else {
        // No path given → resolve from current URL (used by type 3)
        $path_obj = get_path()->without_query()->without_page();
        if (!$is_model) {
            $path_obj = $path_obj->without_page_number();
        }
        $current_path = $path_obj->ltrim('/')->get();
    }

    $current_path = str_replace('cat/watch/rolex/', '', $current_path);

    return $map[$current_path] ?? '';
}

// ─── Data Functions ──────────────────────────────────────────

/** Filter Rolex models: remove brands with no items or no images. */
function rolex_get_valid_models(array $brands = []): array
{
    $models = config('rolex_models_list') ?? [];
    $items_index = rolex_items_by_model();

    if (!empty($brands)) {
        $models = array_values(array_filter($models, function ($item) use ($brands) {
            foreach ($brands as $brand) {
                if (str_contains($item['model_en'] ?? '', $brand)) {
                    return true;
                }
            }
            return false;
        }));
    }

    return array_values(array_filter($models, function ($model) use ($items_index) {
        $model_jp = $model['model_jp'] ?? '';
        if ($model_jp === '') {
            return false;
        }

        $key = str_contains($model_jp, 'サンダーバード') ? 'デイトジャストサンダーバード' : $model_jp;
        $results = $items_index[$key] ?? [];

        foreach ($results as $row) {
            if (!empty($row['image_url'])) {
                return true;
            }
        }

        return false;
    }));
}

/** Prepare Rolex model data for display. */
function rolex_prepare_data(array $models, int $component_type, bool $single = false, bool $is_model = false): array
{
    $items_index = rolex_items_by_model();
    $default_arr = [];
    $default_arr_accordion = [];
    $processed_models = [];

    foreach ($single ? [$models] : $models as $model) {
        $model_jp = $model['model_jp'] ?? '';
        $key = str_contains($model_jp, 'サンダーバード') ? 'デイトジャストサンダーバード' : $model_jp;
        $results = $items_index[$key] ?? [];

        $model_name = !empty($results)
            ? rolex_resolve_model_name($is_model, $results[0]['path'] ?? '')
            : '';

        $new_item_arr = [];
        $new_item_arr1 = [];
        $accordion_items = [];

        foreach ($results as $index => $row) {
            $has_image = !empty($row['image_url'] ?? '');

            if ($component_type === 1) {
                if ($has_image) {
                    $default_arr[] = $row;
                    $new_item_arr[] = $row;
                } else {
                    $accordion_items[] = $row;
                    $default_arr_accordion[] = $row;
                }
            } elseif ($component_type === 2) {
                if ($has_image && $index < 2) {
                    $default_arr[] = $row;
                }
                if ($has_image) {
                    $new_item_arr[] = $row;
                } else {
                    $accordion_items[] = $row;
                }
                if (empty($new_item_arr)) {
                    $new_item_arr1[] = $row;
                }
            }
        }

        $processed_models[] = [
            'new_item_arr'    => $new_item_arr,
            'accordion_items' => $accordion_items,
            'new_item_arr1'   => $new_item_arr1,
            'model_name'      => $model_name,
            'item_array'      => $results,
        ];
    }

    if ($single && !empty($processed_models)) {
        return $processed_models[0];
    }

    return [
        'default_arr'           => $default_arr,
        'default_arr_accordion' => $default_arr_accordion,
        'processed_models'      => $processed_models,
    ];
}

// ─── Type 3 ──────────────────────────────────────────────────

/** Get items and title for component_type 3. */
function rolex_get_type3_data(string $display_url, bool $is_model, bool $is_br2): array
{
    $all_items = rolex_load_all_items();

    if ($is_model) {
        $url = ltrim(replacePathURL($display_url), '/');
        $matches = rolex_filter_items($all_items, 'path', $url);
    } else {
        $segments = array_values(array_filter(explode('/', $display_url)));
        $model_number = strtolower(end($segments) ?: '');
        $matches = rolex_filter_items($all_items, 'ref_number', $model_number, true);
    }

    $purchase_items = [];
    $accordion_items = [];
    foreach ($matches['results'] as $row) {
        if (!empty($row['image_url'] ?? '')) {
            $purchase_items[] = $row;
        } else {
            $accordion_items[] = $row;
        }
    }

    $model = rolex_resolve_model_name($is_model);
    $url = currentURL();

    if (strpos($url, '/rolex-thunderbird') !== false) {
        $model = str_replace('デイトジャストサンダーバード', 'サンダーバード', $model);
    }
    if ($is_model && strpos($url, '/rolex-explorer') === false) {
        $model = str_replace('Ⅰ', '', $model);
    }

    $br = ($is_br2 && wp_is_mobile()) ? '<br>' : ' ';

    if ($is_model) {
        $brand = 'ロレックス';
        $number = '';
        $h2_title = "{$brand}{$br}{$model}<br>買取価格相場";
    } else {
        $brand = $matches['brand_jp'];
        $number = strtoupper($matches['model_number'] ?? '');
        $h2_title = "{$brand}{$br}{$model} Ref.{$number}の";
    }

    return [
        'purchase_items'  => $purchase_items,
        'accordion_items' => $accordion_items,
        'h2_title'        => $h2_title,
        'brand'           => $brand,
        'model'           => $model,
        'number'          => $number,
    ];
}

/** Filter cached items by a given field (path, ref_number, etc.). */
function rolex_filter_items(array $all_items, string $field, string $value, bool $lowercase = false): array
{
    $results = [];
    $brand_jp = '';
    $brand_en = '';

    foreach ($all_items as $row) {
        $cell = trim($row[$field] ?? '');
        if ($lowercase) {
            $cell = strtolower($cell);
        }
        if ($cell !== '' && $cell === $value) {
            $results[] = $row;
            $brand_jp = $row['model_name_jp'] ?? '';
            $brand_en = $row['model_name_en'] ?? '';
        }
    }

    return [
        'results'      => $results,
        'brand_jp'     => $brand_jp,
        'brand_en'     => $brand_en,
        'model_number' => $value,
    ];
}
