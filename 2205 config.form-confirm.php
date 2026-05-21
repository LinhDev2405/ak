<?php
return [
    'form-step' => [
        'contact' => [
            'display' => 'ブラリバへのお問い合わせ',
            'fields' => [
                'form_type_contact'   => 'text',
                'sei-contact'         => 'text',
                'mei-contact'         => 'text',
                'kana_sei-contact'    => 'text',
                'kana_mei-contact'    => 'text',
                'tel-contact'         => 'text',
                'email-contact'       => 'email',
                'description-contact' => 'text',
                'file1'              => 'file',
                'file1_name'         => 'text',
            ],
            'rows' => [
                [
                    'label'       => 'お申し込みの内容',
                    'is_required' => true,
                    'keys'        => ['form_type_contact'],
                ],
                [
                    'label'       => 'お名前',
                    'is_required' => true,
                    'keys'        => ['sei-contact', 'mei-contact'],
                ],
                [
                    'label'       => 'フリガナ',
                    'is_required' => true,
                    'keys'        => ['kana_sei-contact', 'kana_mei-contact'],
                ],
                [
                    'label'       => '電話番号',
                    'is_required' => true,
                    'keys'        => ['tel-contact'],
                ],
                [
                    'label'       => 'メールアドレス',
                    'is_required' => true,
                    'keys'        => ['email-contact'],
                ],
                [
                    'label'       => 'お問い合わせ',
                    'is_required' => true,
                    'keys'        => ['description-contact'],
                ],
                [
                    'label'       => '添付画像',
                    'keys'        => ['file1'],
                    'type'        => 'image',
                ],
            ],
        ],

        'takuhai' => [
            'display' => 'takuhai',
            'fields' => [
                'form_type_takuhai' => 'text',
                'delivery'          => 'text',
                'delivery_date'     => 'text',
                'time-invoice'      => 'text',
                'delivery_service'  => 'text',
                'pickup'            => 'text',
                'pickup_date'       => 'text',
                'pickup_time'       => 'text',
                'sei-takuhai'       => 'text',
                'mei-takuhai'       => 'text',
                'kana_sei-takuhai'  => 'text',
                'kana_mei-takuhai'  => 'text',
                'zip01-takuhai'     => 'text',
                'pref01-takuhai'     => 'text',
                'addr01-takuhai'     => 'text',
                'blocknum-takuhai'   => 'text',
                'tel-takuhai'        => 'text',
                'email-takuhai'      => 'email',
            ],
            'rows' => [
                [
                    'label'       => 'お申し込みの内容',
                    'is_required' => true,
                    'keys'        => ['form_type_takuhai'],
                ],
                [
                    'label'       => '宅配キット・<br>伝票の選択',
                    'is_required' => true,
                    'keys'        => ['delivery'],
                ],
                [
                    'label'       => 'キット・伝票の<br>お届けご希望日時',
                    'is_required' => true,
                    'keys'        => ['delivery_date', 'time-invoice'],
                ],
                [
                    'label'       => '配送保証<br>サービスの選択',
                    'is_required' => true,
                    'keys'        => ['delivery_service'],
                ],
                [
                    'label'       => '集荷依頼の選択',
                    'is_required' => true,
                    'keys'        => ['pickup'],
                ],
                [
                    'label'       => '集荷のご希望日時',
                    'is_required' => true,
                    'keys'        => ['pickup_date', 'pickup_time'],
                ],
                [
                    'label'       => 'お名前',
                    'is_required' => true,
                    'keys'        => ['sei-takuhai', 'mei-takuhai'],
                ],
                [
                    'label'       => 'フリガナ',
                    'is_required' => true,
                    'keys'        => ['kana_sei-takuhai', 'kana_mei-takuhai'],
                ],
                [
                    'label'       => 'ご住所',
                    'is_required' => true,
                    'modifier'    => 'is-address',
                    'keys'        => [
                        'zip01-takuhai',
                        'pref01-takuhai',
                        'addr01-takuhai',
                        'blocknum-takuhai'
                    ],
                ],
                [
                    'label'       => '電話番号',
                    'is_required' => true,
                    'keys'        => ['tel-takuhai'],
                ],
                [
                    'label'       => 'メールアドレス',
                    'is_required' => true,
                    'keys'        => ['email-takuhai'],
                ],
            ],
        ],

        'shuccho' => [
            'display' => 'shuccho',
            'fields' => [
                'form_type_shuccho'   => 'text',
                'date_shuccho'        => 'text',
                'time-shuccho'        => 'text',
                'sei-shuccho'         => 'text',
                'mei-shuccho'         => 'text',
                'kana_sei-shuccho'    => 'text',
                'kana_mei-shuccho'    => 'text',
                'zip01-shuccho'       => 'text',
                'pref01-shuccho'      => 'text',
                'addr01-shuccho'      => 'text',
                'blocknum-shuccho'    => 'text',
                'tel-shuccho'         => 'text',
                'email-shuccho'       => 'email',
                'description-shuccho' => 'text',
                'file1'               => 'file',
                'file1_name'          => 'text',
            ],
            'rows' => [
                [
                    'label'       => 'お申し込みの内容',
                    'is_required' => true,
                    'keys'        => ['form_type_shuccho'],
                ],
                [
                    'label'       => '訪問ご希望日時',
                    'is_required' => true,
                    'keys'        => ['date_shuccho', 'time-shuccho'],
                ],
                [
                    'label'       => 'お名前',
                    'is_required' => true,
                    'keys'        => ['sei-shuccho', 'mei-shuccho'],
                ],
                [
                    'label'       => 'フリガナ',
                    'is_required' => true,
                    'keys'        => ['kana_sei-shuccho', 'kana_mei-shuccho'],
                ],
                [
                    'label'       => 'ご住所',
                    'is_required' => true,
                    'modifier'    => 'is-address',
                    'keys'        => [
                        'zip01-shuccho',
                        'pref01-shuccho',
                        'addr01-shuccho',
                        'blocknum-shuccho'
                    ],
                ],
                [
                    'label'       => '電話番号',
                    'is_required' => true,
                    'keys'        => ['tel-shuccho'],
                ],
                [
                    'label'       => 'メールアドレス',
                    'is_required' => true,
                    'keys'        => ['email-shuccho'],
                ],
                [
                    'label'       => 'お問い合わせ',
                    'keys'        => ['description-shuccho'],
                ],
                [
                    'label'       => '添付画像',
                    'keys'        => ['file1'],
                    'type'        => 'image',
                ],
            ],
        ],
    ],
];
