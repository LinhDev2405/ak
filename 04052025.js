$(document).ready(function () {
	$(window).on("load", function () {
		if ($(".swiper-change-method").length) {
			const getOuterHeight = (selector) => $(selector).outerHeight(true) || 0;

			const windowHeight = $(window).height();
			const headerHeight = getOuterHeight(".c-header");
			const boxHeight = headerHeight + getOuterHeight(".p-shuccho01-content-cta");
			console.log("a", headerHeight);

			const swiperHeightPercent = ((windowHeight - headerHeight) / windowHeight) * 100;

			console.log(swiperHeightPercent);

			const boxHeight2 = ((windowHeight - boxHeight) / windowHeight) * 100;
			// const scrollbarHeightPercent =
			// 	((windowHeight - (headerHeight + getOuterHeight(".c-top-notice") + getOuterHeight(".btm-nav2"))) /
			// 		windowHeight) *
			// 	100;

			$(".p-shuccho01-content").css({
				height: `${swiperHeightPercent}dvh`,
			});

			$(".p-shuccho01-box").css({
				height: `${boxHeight2}dvh`,
			});

			let footerTextTimeout = null;

			function updateFooterText(swiper) {
				const { activeIndex: currentIndex, previousIndex } = swiper;
				const direction = currentIndex > previousIndex ? "down" : "up";
				const footerText = footerItems[currentIndex] || "default text";

				// Cache DOM elements
				const $footer = $(".p-shuccho01-content-footer");
				const $current = $footer.find(".p-shuccho01-content-text.current");
				const $previous = $footer.find(".p-shuccho01-content-text.previous");

				// Nếu text hiện tại giống với text mới thì không làm gì cả
				if ($current.text().trim() === footerText.trim()) {
					return;
				}

				// Nếu đang có hiệu ứng trước đó thì reset ngay
				if (footerTextTimeout) {
					clearTimeout(footerTextTimeout);
					footerTextTimeout = null;

					$previous.hide().removeClass("fade-out-up fade-out-down visible");
					$current.removeClass("fade-in-up fade-in-down").addClass("visible");
				}

				// Đưa text cũ vào previous
				$previous
					.text($current.text())
					.attr("class", "p-shuccho01-content-text previous visible")
					.show();

				// Đặt text mới vào current
				$current.text(footerText).attr("class", "p-shuccho01-content-text current").show();

				// Kích hoạt animation (để setTimeout 0ms có thể cũng đủ, nhưng +10ms an toàn hơn)
				setTimeout(() => {
					$previous
						.removeClass("visible")
						.addClass(direction === "down" ? "fade-out-up" : "fade-out-down");
					$current.addClass(direction === "down" ? "fade-in-up" : "fade-in-down");
				}, 10);

				// Sau animation, giữ trạng thái cuối và ẩn previous
				footerTextTimeout = setTimeout(() => {
					$previous.hide().removeClass("fade-out-up fade-out-down visible");
					$current.removeClass("fade-in-up fade-in-down").addClass("visible");
					footerTextTimeout = null;
				}, 810);
			}

			const swiperInstance = new Swiper(".swiper-change-method", {
				direction: "vertical",
				slidesPerView: 1,
				mousewheel: true,
				speed: 600,
				on: {
					init: function () {
						updateFooterText(this);
					},
					slideChangeTransitionStart: function () {
						updateFooterText(this);
					},
				},
			});

			// height: $(".p-shuccho01-content").height(),
			// scrollbar: {
			// 	el: ".swiper-scrollbar",
			// },
			// $(swiperInstance.slides).css("height", "100%");
			// k choi tro nay dc

			// $(".p-shuccho01-box").css({
			// 	height: `${boxHeight2}dvh`,
			// });

			// $(".swiper-scrollbar").css({
			// 	height: `${scrollbarHeightPercent}dvh`,
			// 	top: 0,
			// });

			$(".c-sidebar .c-sidebar-item").on("click", function () {
				const slideId = $(this).data("tab-id");
				const index = targetSlide.index();
				const targetSlide = $(`.swiper-slide[data-slide-id="${slideId}"]`);


				if (index) {
					swiperInstance.slideTo(index);
				}
			});

			$(".go-top").on("click", function () {
				swiperInstance.slideTo(0);
			});
		}
	});
});
