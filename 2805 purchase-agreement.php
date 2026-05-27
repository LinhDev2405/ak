<?php
$data_list = read_csv('purchase_agreement');
$last = array_key_last($data_list);
?>

<div class="c-purchase-agreement">
    <?php foreach ($data_list as $i => $row) : ?>
        <p class="c-purchase-agreement__item">
            <span class="c-purchase-agreement__title">
                <?= $row['title'] ?>
            </span>

            <?= $i === $last ? str_replace('/', '<br>&nbsp;&nbsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;', $row['body']) : $row['body'] ?>

            <?php if (!empty($row['list'])) : ?>
                <span class="c-purchase-agreement__sub">
                    <?= $row['list'] ?>
                </span>
            <?php endif ?>
        </p>
    <?php endforeach ?>
</div>
