<?php
$name           = $args['name'] ?? '';
$options        = $args['options'] ?? [];
$custom_class   = $args['custom_class'] ?? '';
$default_option = $args['default_option'] ?? '選択';

$classes = clsx(
    'c-form-select',
    $custom_class
);
?>

<?php get_component('modules/form-step/control', [], function () use (
    $classes,
    $name,
    $options,
    $default_option
) { ?>
    <div class="<?= $classes; ?>">
        <select class="c-form-select__btn" name="<?= $name; ?>" id="<?= $name; ?>">
            <?php if (!empty($options)) : ?>
                <?php foreach ($options as $value => $label) : ?>
                    <option value="<?= $value; ?>"><?= $label; ?></option>
                <?php endforeach; ?>

            <?php else : ?>
                <option value=""><?= $default_option; ?></option>
            <?php endif; ?>
        </select>
    </div>
<?php }); ?>
