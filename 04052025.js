<?php
return [
    // number model
    [
        'condition' => ['number' => true],
        'result_items' => [
            [
                'boxes' => [
                    [
                        'sub_heading' => '{page_model}の型番から探す',
                        'filter' => [
                            'number' => true,
                            'page_model' => '{page_model}'
                        ],
                    ],
                ],
            ],
        ],
    ],

    // shop
    [
        'condition' => ['shop' => true, 'page_category' => false],
        'result_items' => [
            [
                'heading' => '{text_for_page_list}の<br>買取実績一覧を絞り込む',
                'boxes' => [
                    [
                        'sub_heading' => 'カテゴリで絞り込む',
                        'filter' => [
                            'shop' => '{shop}',
                            'page_category' => true,
                            'page_brand' => false,
                        ],
                        'display_text_fields' => ['page_category'],
                    ],
                    [
                        'sub_heading' => 'ブランドで絞り込む',
                        'filter' => [
                            'shop' => '{shop}',
                            'page_brand' => true,
                        ],
                        'display_text_fields' => ['page_brand'],
                    ],
                ],
            ],
            [
                'boxes' => [
                    [
                        'sub_heading' => '店舗から探す',
                        'filter' => [
                            'shop' => true,
                            'page_category' => false
                        ],
                    ],
                ],
            ],
        ],
    ],

    // page_type = 買取方法
    // purchase_way
    [
        'condition' => ['page_type' => '買取方法'],
        'result_items' => [
            [
                'boxes' => [
                    [
                        'sub_heading' => 'ブランドから探す',
                        'filter' => ['brand_pick_up' => 'TRUE'],
                        'display_text_fields' => ['page_brand'],
                    ],
                    [
                        'sub_heading' => 'カテゴリから探す',
                        'filter' => ['page_type' => 'カテゴリトップ'],
                        'display_text_fields' => ['page_category', 'page_subcategory'],
                    ],
                ],
            ],
        ],
    ],

    // page_type = ブランドトップ"
    // brand-top
    [
        'condition' => ['page_type' => 'ブランドトップ'],
        'result_items' => [
            [
                'heading' => '{text_for_page_list}の<br>買取実績一覧を絞り込む',
                'boxes' => [
                    [
                        'sub_heading' => 'アイテムで絞り込む',
                        'filter' => [
                            'page_type' => 'ブランド×カテゴリ',
                            'page_brand' => '{page_brand}'
                        ],
                        'display_text_fields' => ['page_category'],
                    ],
                    [
                        'sub_heading' => 'アイテムで絞り込む',
                        'filter' => [
                            'page_type' => 'アイテム',
                            'page_brand' => '{page_brand}'
                        ],
                    ],
                    [
                        'sub_heading' => 'モデルで絞り込む',
                        'filter' => [
                            'page_type' => 'モデル',
                            'page_brand' => '{page_brand}'
                        ],
                    ],
                    [
                        'sub_heading' => '店舗で絞り込む',
                        'filter' => [
                            'shop' => true,
                            'page_category' => false,
                            'page_brand' => '{page_brand}'
                        ],
                    ],
                ],
            ],
            [
                'boxes' => [
                    [
                        'key' => 'box1',
                        'sub_heading' => '{page_category}の注目ブランドから探す',
                        'filter' => [
                            'page_category'    => '{page_category}',
                            'category_pick_up' => 'TRUE',
                        ],
                        'display_text_fields' => ['page_brand'],
                    ],
                    [
                        'sub_heading' => [
                            'is_first' => '{page_category}のその他ブランドから探す',
                            'default'  => '{page_category}のブランドから探す',
                        ],
                        'filter' => [
                            'page_type'        => 'ブランドトップ',
                            'page_category'    => '{page_category}',
                            'category_pick_up' => 'FALSE',
                            'page_brand'       => 'not_in:box1',
                        ],
                    ],
                ],
            ],
        ],
    ],

    // page_type = 買取方法
    // diamond_page
    [
        'condition' => [
            'page_type' => 'アイテム',
            'page_category' => '宝石・ジュエリー',
            'gem' => 'ダイヤモンド',
        ],
        'result_items' => [
            [
                'heading' => 'ダイヤモンドの<br>買取実績一覧を絞り込む',
                'boxes' => [
                    [
                        'sub_heading' => 'ダイヤモンドのアイテムで絞り込む',
                        'filter' => [
                            'page_type' => 'アイテム',
                            'page_subcategory' => 'ダイヤモンド',
                        ],
                    ],
                ],
            ],
            [
                'boxes' => [
                    [
                        'sub_heading' => '宝石・ジュエリーの種類から探す',
                        'filter' => [
                            'page_type' => 'アイテム',
                            'page_subcategory' => '宝石',
                        ],
                    ],
                ],
            ],
        ],
    ],
];
