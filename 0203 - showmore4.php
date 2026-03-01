<?php
$show_btn_text = $args['btn_show_text'] ?? 'もっと見る';
$step          = $args['step'] ?? 6;
?>

<div class="c-showmore4 js-showmore4" data-step="<?= esc_attr($step) ?>">
    <div class="c-showmore4__inner js-showmore4-inner">
        <?php $slot(); ?>
    </div>

    <?php
        get_component('common/button', [
            'type'         => 'button',
            'variant'      => 'secondary',
            'custom_class' => 'js-showmore4-btn',
        ],
            function () use ($show_btn_text) {
                echo wp_kses_post($show_btn_text);
            }
        );
    ?>
</div>
