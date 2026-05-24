<?php
$text         = $args['text'] ?? '';
$required     = $args['required'] ?? false;
$hide_error   = $args['hide_error'] ?? false;
$custom_class = $args['custom_class'] ?? '';

$label        = $required ? '必須' : '任意';

$classes = clsx(
    'c-form-field',
    $custom_class,
    [
        'is-required' => $required,
    ]
);
?>

<div class="<?= esc_attr($classes); ?>">
    <p class="c-form-field__title">
        <span class="c-form-field__title-label">
            <?= esc_html($label); ?>
        </span>

        <span class="c-form-field__title-text">
            <?= esc_html($text); ?>
        </span>
    </p>

    <?php if (!$hide_error) : ?>
        <p class="c-form-field__message js-form-field-error"></p>
    <?php endif; ?>

    <?php if ($has_slot(null)) : ?>
        <div class="c-form-field__box">
            <?php $slot(); ?>
        </div>
    <?php endif; ?>
</div>
