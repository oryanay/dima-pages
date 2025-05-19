// tracking-events.js

// === Configurable Settings ===
const SCROLL_THRESHOLD = 50;  // % of scroll to fire scroll event
const TIME_THRESHOLD = 15;    // seconds before firing "engaged"

// === CTA Click Tracker ===
function trackClickEvent(eventName, eventData = {}) {
    // Umami v2+ safe check
    if (typeof umami === 'object' && typeof umami.track === 'function') {
        umami.track(eventName, eventData);
    }

    // GA4 (gtag.js)
    if (typeof gtag === 'function') {
        gtag('event', eventName, eventData);
    }

    console.log(`Tracked click: ${eventName}`, eventData);
}

// === Scroll Depth Tracker ===
function handleScrollTracking() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrolledPercent = Math.round((scrollTop / docHeight) * 100);

  if (scrolledPercent >= SCROLL_THRESHOLD && !window.__scrollTracked) {
    window.__scrollTracked = true;

    // Umami v2+ safe check
    if (typeof umami === 'object' && typeof umami.track === 'function') {
        umami.track(`Scroll ${SCROLL_THRESHOLD}%`);
      }

    if (typeof gtag === 'function') {
      gtag('event', 'scroll_depth', {
        event_category: 'Engagement',
        event_label: `${SCROLL_THRESHOLD}% Scroll`,
      });
    }

    if (typeof obApi === 'function') {
      obApi('track', 'ENGAGEMENT');
    }
  }
}

// === Time on Page Tracker ===
function handleTimeTracking() {
  setTimeout(() => {
    if (!window.__timeTracked) {
      window.__timeTracked = true;

      if (typeof gtag === 'function') {
        gtag('event', 'engaged_time', {
          event_category: 'Engagement',
          event_label: `${TIME_THRESHOLD}s Time on Page`,
        });
      }

      if (typeof umami === 'function') {
        umami.track(`Time on Page > ${TIME_THRESHOLD}s`);
      }

      if (typeof obApi === 'function') {
        obApi('track', 'ENGAGEMENT');
      }
    }
  }, TIME_THRESHOLD * 1000);
}

// === Initialization ===
document.addEventListener('DOMContentLoaded', () => {
  window.__scrollTracked = false;
  window.__timeTracked = false;

  window.addEventListener('scroll', handleScrollTracking, { passive: true });
  handleTimeTracking();
});