<?php get_header(); ?>

<?php
$base_icons_url = 'https://img.test-kaitorisatei.info/bring/img/common/icons/';
$base_img_url = 'https://img.test-kaitorisatei.info/bring/img/sp/inquiry/shuccho01/content/';

$items = [
  [
    'id' => '1.jpg',
    'type' => 'image',
    'src' => '1.jpg',
    'footerText' => 'Footer text for image 1',
  ],
  [
    'id' => '2.jpg',
    'type' => 'image',
    'src' => '2.jpg',
  ],
  [
    'id' => '3.jpg',
    'type' => 'image',
    'src' => '3.jpg',
    'footerText' => 'Footer text for image 3',
  ],
  [
    'id' => 'random-text',
    'content' => '<p>Nội dung text tùy ý</p>',
    'footerText' => 'Footer text random text',
  ],
  [
    'id' => '4.jpg',
    'type' => 'image',
    'src' => '4.jpg'
  ],
  [
    'id' => '5.jpg',
    'type' => 'image',
    'src' => '5.jpg',
    'footerText' => 'Footer text random 5',
  ],
  [
    'id' => 'click-here',
    'content' => '<button>Click here</button>'
  ],
  [
    'id' => '6.jpg',
    'type' => 'image',
    'src' => '6.jpg'
  ],
  [
    'id' => '7.jpg',
    'type' => 'image',
    'src' => '7.jpg',
    'footerText' => 'Footer text random 7',
  ],
  [
    'id' => 'html-block',
    'content' => '<div class="custom">Khối HTML tùy chỉnh</div>'
  ]
];

// $footerItems = array_map(function ($item) {
//   return [
//     'id' => $item['id'],
//     'footerText' => $item['footerText'] ?? 'default text'
//   ];
// }, $items);
$footerItems = array_map(function ($item) {
  return $item['footerText'] ?? '';
}, $items);



$navlinks = array_column($items, 'id');


?>

<main class="p-shuccho01">
  <div class="p-shuccho01-container">
    <div class="c-intro">
      <figure class="c-intro-text"><img class="c-img" fetchpriority="high" src="<?php echo $base_icons_url . 'text-intro.svg' ?>" alt=""></figure>
      <figure class="c-intro-achive"><img class="c-img" fetchpriority="high" src="<?php echo $base_icons_url . 'achievements.svg' ?>" alt=""></figure>
    </div>

    <div class="p-shuccho01-content">
      <div class="p-shuccho01-box swiper-change-method">
        <div class="swiper-wrapper">
          <?php foreach ($items as $key => $item): ?>
            <div class="swiper-slide" data-slide-id="<?php echo $item['id']; ?>">
              <?php if (isset($item['type']) && $item['type'] === 'image') : ?>
                <figure class="p-shuccho01-content-img">
                  <img class="c-img" fetchpriority="high" src="<?php echo $base_img_url . $item['src']; ?>" alt="" width="1125" height="1397">
                </figure>
              <?php else : ?>
                <?php echo $item['content']; ?>
              <?php endif; ?>
            </div>
          <?php endforeach; ?>
        </div>

      </div>

      <div class="p-shuccho01-content-cta">
        <div class="p-shuccho01-content-footer">
          <span class="p-shuccho01-content-text current"></span>
          <span class="p-shuccho01-content-text previous"></span>
        </div>
      </div>
    </div>
    <div class="c-sidebar">
      <ul>
        <?php foreach ($navlinks as $link): ?>
          <li class="c-sidebar-item" data-tab-id="<?php echo $link; ?>">
            <?php echo $link; ?>
          </li>
        <?php endforeach; ?>
      </ul>
    </div>
  </div>
</main>

<?php get_footer() ?>

<?php
echo '<script>';
echo 'const footerItems = ' . json_encode($footerItems) . ';';
echo '</script>';
?>
