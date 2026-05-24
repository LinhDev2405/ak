<?php
$text       = $args['text'] ?? '';
$required   = $args['required'] ?? false;
$show_label = $args['show_label'] ?? false;
$label      = $show_label ? ($required ? '必須' : '任意') : '';

$classes = clsx(
    'c-form-field-content',
    [
        'is-required' => $required,
    ]
);

if(!$has_slot(null)) {
    return;
}
?>

<div class="<?= $classes; ?>">
    <?php if (!empty($text)): ?>
        <p class="c-form-field-content__title">
            <?php if (!empty($label)): ?>
                <span class="c-form-field-content__label"><?= esc_html($label); ?></span>
            <?php endif; ?>
            <span class="c-form-field-content__text"><?= wp_kses_post($text) ?></span>
        </p>
    <?php endif; ?>

    <div class="c-form-field-content__box">
        <?php $slot(); ?>
    </div>
</div>
