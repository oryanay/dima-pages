// GA4 - Scroll Depth Tracking
let scroll25 = false, scroll50 = false, scroll75 = false;

window.addEventListener("scroll", function () {
const scrollPos = window.scrollY + window.innerHeight;
const pageHeight = document.documentElement.scrollHeight;
const scrollPercent = (scrollPos / pageHeight) * 100;

if (scrollPercent > 25 && !scroll25) {
    gtag('event', 'scroll_depth', { value: 25 });
    scroll25 = true;
}
if (scrollPercent > 50 && !scroll50) {
    gtag('event', 'scroll_depth', { value: 50 });
    scroll50 = true;
}
if (scrollPercent > 75 && !scroll75) {
    gtag('event', 'scroll_depth', { value: 75 });
    scroll75 = true;
}
});

// GA4 - CTA Click Tracking (Main KPI)
document.querySelectorAll('.track-cta').forEach(btn => {
    btn.addEventListener('click', function () {
      gtag('event', 'cta_click', {
        'event_label': btn.getAttribute('data-dest')
      });
    });
  });