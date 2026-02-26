<?php
function get_rolex_data_by_model(string $model_jp): array {
    if (empty($model_jp)) {
        return [];
    }

    $results = [];
    foreach ([
        'rolex_standard_items_with_map',
        'rolex_fixed_items_with_map',
    ] as $file) {
        read_csv($file, null, function (array $row) use ($model_jp, &$results) {
            if (
                !empty($row['model_name_jp']) &&
                $row['model_name_jp'] === $model_jp
            ) {
                $results[] = $row;
            }

            return false;
        });
    }

    return $results;
}

function rolex_resolve_model_name(
    bool $is_model,
    string $path_from_csv = ''
): string {
    if ($path_from_csv !== '') {
        $current_path = $path_from_csv;

    } else {
        $path_obj = get_path()
            ->without_query()
            ->without_page();

        if (!$is_model) {
            $path_obj = $path_obj->without_page_number();
        }

        $current_path = $path_obj
            ->ltrim('/')
            ->get();
    }

    $current_path = str_replace(
        'cat/watch/rolex/',
        '',
        $current_path
    );

    foreach (config('rolex_models_list') ?? [] as $m) {
        $model_en = $m['model_en'] ?? '';
        $model_jp = $m['model_jp'] ?? '';

        if ($model_en === $current_path) {
            return $model_jp;
        }
    }

    return '';
}
