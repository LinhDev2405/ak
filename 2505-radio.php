<?php
$type = $args['type'] ?? '';
$item = $args['item'] ?? [];
$custom_class = $args['custom_class'] ?? '';

$gtm   = $item['gtm'] ?? '';
$value = $item['value'] ?? '';
$text  = $item['text'] ?? '';

$form_id = "form_{$type}";
$label   = $text ?: $value;

$classes = clsx(
    'c-form-radio',
    "c-form-radio--{$type}",
    $custom_class
);
?>

<?php start_gtm($gtm, [
    'set_num_gtm' => false,
]); ?>
<label for="<?= esc_attr($form_id); ?>" class="<?= esc_attr($classes); ?>">
    <?php $slot(null, [], function () use ($form_id, $value, $label) { ?>
        <input
            type="radio"
            id="<?= esc_attr($form_id); ?>"
            data-form="<?= esc_attr($form_id); ?>"
            value="<?= esc_attr($value); ?>"
            name="form_type"
            class="js-form-radio c-form-radio__btn">

        <span><?= wp_kses_post($label) ?></span>
    <?php }); ?>
</label>
<?php end_gtm(); ?>
