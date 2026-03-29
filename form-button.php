<?php
$href           = $args['href'] ?? '';
$type           = $args['button_type'] ?? 'button';
$variant        = $args['type'] ?? 'primary';
$text           = $args['text'] ?? '';

$is_link = !empty($href);
$tag  = $is_link ? 'a' : 'button';
$attr = $is_link
    ? 'href="' . esc_url($href) . '"'
    : 'type="' . esc_attr($type) . '"';

$classes = clsx(
    'c-form-button',
    "c-form-button--{$variant}",
);
?>

<<?= $tag ?> <?= $attr ?> class="<?= $classes; ?>">
    <?= wp_kses_post($text); ?>
</<?= $tag ?>>
