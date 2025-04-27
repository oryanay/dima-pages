// GA4 - CTA Click Tracking (Main KPI)
document.querySelectorAll('.track-cta').forEach(btn => {
    btn.addEventListener('click', function () {
      gtag('event', 'cta_click', {
        'event_label': btn.getAttribute('data-dest')
      });
    });
  });



// Time thresholds (in seconds) you want to track
const timeThresholds = [10, 30, 60, 120]; // can add more if needed
const trackedThresholds = new Set();

function trackTimeOnPage() {
let secondsPassed = 0;

const interval = setInterval(() => {
    secondsPassed++;

    // Check if we hit a threshold
    if (timeThresholds.includes(secondsPassed) && !trackedThresholds.has(secondsPassed)) {
    trackedThresholds.add(secondsPassed);

    // Send Umami event
    if (typeof umami !== "undefined") {
        umami.track("time-on-page", { time: `${secondsPassed}s` });
    }
    }

    // Optional: stop after last threshold
    if (secondsPassed > Math.max(...timeThresholds)) {
    clearInterval(interval);
    }
}, 1000); // runs every second
}

// Start tracking when DOM is fully loaded
document.addEventListener("DOMContentLoaded", trackTimeOnPage);

// Track Page Load Time
window.addEventListener('load', () => {
    // Use Navigation Timing Level 2 (modern approach)
    const [navigationEntry] = performance.getEntriesByType('navigation');
    const loadTime = navigationEntry.loadEventEnd; // in milliseconds
    const loadTimeSec = (loadTime / 1000).toFixed(2);

    if (typeof umami !== "undefined") {
      umami.track('page-load-time', { value: `${loadTimeSec}s` });
    }

    console.log('Page Load Time:', loadTimeSec + 's');
  });


// Scroll Depth Tracker 
(function () {
    const DEBUG = true; // Set false for production
    const FULL_VISIBLE_THRESHOLD = 100; // px allowed for scroll to still consider page fully visible
  
    let scroll25 = false, scroll50 = false, scroll75 = false, scroll100 = false;
    let timeout;
  
    function debugLog(message) {
      if (DEBUG) {
        console.log(message);
      }
    }
  
    function sendEvent(name, params = {}) {
      debugLog(`Event triggered: ${name} with params: ${JSON.stringify(params)}`);
  
      // GA4
      if (typeof gtag === 'function') {
        gtag('event', name, params);
        debugLog(`GA4 event sent: ${name}`);
      } else {
        debugLog('gtag is not defined');
      }
  
      // Umami
      if (typeof umami === 'object' && typeof umami.track === 'function') {
        umami.track(name, params);
        debugLog(`Umami event sent: ${name}`);
      } else {
        debugLog('umami.track is not defined');
      }
    }
  
    function handleScroll() {
      const scrollPos = window.scrollY + window.innerHeight;
      const pageHeight = document.documentElement.scrollHeight;
      const scrollPercent = (scrollPos / pageHeight) * 100;
  
      if (scrollPercent >= 25 && !scroll25) {
        sendEvent('scroll_depth', { value: 25 });
        scroll25 = true;
      }
      if (scrollPercent >= 50 && !scroll50) {
        sendEvent('scroll_depth', { value: 50 });
        scroll50 = true;
      }
      if (scrollPercent >= 75 && !scroll75) {
        sendEvent('scroll_depth', { value: 75 });
        scroll75 = true;
      }
      if (scrollPercent >= 95 && !scroll100) {
        sendEvent('scroll_depth', { value: 100 });
        scroll100 = true;
  
        // Remove scroll listener after 100%
        window.removeEventListener('scroll', throttledScrollHandler);
        debugLog('Scroll tracking completed and listener removed.');
      }
    }
  
    function throttledScrollHandler() {
      if (!timeout) {
        timeout = setTimeout(() => {
          handleScroll();
          timeout = null;
        }, 120);
      }
    }
  
    function initializeTracking() {
      const pageHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      const scrollableHeight = pageHeight - viewportHeight;
  
      debugLog(`Page height: ${pageHeight}px, Viewport height: ${viewportHeight}px, Scrollable height: ${scrollableHeight}px`);
  
      if (scrollableHeight <= FULL_VISIBLE_THRESHOLD) {
        // Page fully visible — send full visible event + include scrollable height
        sendEvent('page_view_full_visible', { scrollable_height: scrollableHeight });
        debugLog('Short page detected: full visible event sent.');
      } else {
        // Page is scrollable — start scroll depth tracking
        window.addEventListener('scroll', throttledScrollHandler);
        debugLog('Scrollable page detected: scroll depth tracking enabled.');
      }
    }
  
    // Initialize when DOM is ready
    if (document.readyState === "complete" || document.readyState === "interactive") {
      initializeTracking();
    } else {
      document.addEventListener("DOMContentLoaded", initializeTracking);
    }
  })();