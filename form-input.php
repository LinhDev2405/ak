<?php
$class_wrapper = $args['class_wrapper'] ?? '';
$class = $args['class'] ?? '';
$name = $args['name'] ?? '';
$type = $args['type'] ?? 'text';
$placeholder = $args['placeholder'] ?? '';
$required = !empty($args['required']);
$readonly = !empty($args['readonly']);
$is_half_width = !empty($args['is_half_width']);
$is_file_type = $type === 'file';

$classes = clsx(
    "c-form-field__wrap js-error-wrapper",
    $class_wrapper,
    [
        'c-form-field__wrap--half' => $is_half_width,
    ]
);
?>

<div class="<?= $classes; ?>">
    <?php if ($is_file_type): ?>
        <label for="<?= esc_attr($name); ?>" class="c-form-field__upload js-file-label">
            <?= esc_html($placeholder); ?>
        </label>
    <?php endif; ?>

    <input
        type="<?= esc_attr($type); ?>"
        id="<?= esc_attr($name); ?>"
        name="<?= esc_attr($name); ?>"
        class="<?= clsx("c-form-field__input", $class) ?>"
        placeholder="<?= esc_attr($placeholder); ?>" <?= $readonly ? 'readonly' : ''; ?>
        <?= $is_file_type ? 'hidden' : ''; ?>
    >
    <div class="c-form-field__error js-error"></div>
</div>
