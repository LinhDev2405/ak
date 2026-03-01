$(function () {
  $('.js-showmore4').each(function () {
    const $root = $(this);
    const $btn = $root.find('.js-showmore4-btn');
    const step = parseInt($root.data('step'), 10) || 6;

    // Hide button if there are no hidden items to begin with
    if ($root.find('.js-showmore4-item').length === 0) {
      $btn.hide();
    }

    $btn.on('click', function () {
      const $hiddenItems = $root.find('.js-showmore4-item');
      const $nextBatch = $hiddenItems.slice(0, step);

      $nextBatch.slideDown(300, function () {
        $(this).removeClass('js-showmore4-item');
      });

      // After revealing this batch, check if there are remaining hidden items
      // $hiddenItems was captured before removal, so compare against step
      if ($hiddenItems.length <= step) {
        $root.addClass('is-show');
        $btn.slideUp(200);
      }
    });
  });
});
