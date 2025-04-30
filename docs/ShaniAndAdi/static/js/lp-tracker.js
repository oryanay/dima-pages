(function () {
    const DEBUG = true; // Set to false for production
    const FULL_VISIBLE_THRESHOLD = 100; // px allowed for scroll to still consider page fully visible
    const timeThresholds = [10, 30, 60, 120];
    const trackedThresholds = new Set();
  
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
  
    // Track CTA Clicks
    function trackCtaClicks() {
      document.querySelectorAll('.track-cta').forEach(btn => {
        btn.addEventListener('click', function () {
          const dest = btn.getAttribute('data-dest') || 'unknown';
          sendEvent('cta-click', { destination: dest });
        });
      });
    }
  
    // Time on Page Tracking
    function trackTimeOnPage() {
      let secondsPassed = 0;
      const interval = setInterval(() => {
        if (document.visibilityState !== 'visible') return;
  
        secondsPassed++;
  
        if (timeThresholds.includes(secondsPassed) && !trackedThresholds.has(secondsPassed)) {
          trackedThresholds.add(secondsPassed);
          sendEvent('time-on-page', { time: `${secondsPassed}s` });
        }
  
        if (secondsPassed > Math.max(...timeThresholds)) {
          clearInterval(interval);
        }
      }, 1000);
    }
  
    // Track Page Load Time
    function trackPageLoadTime() {
      window.addEventListener('load', () => {
        const [navigationEntry] = performance.getEntriesByType('navigation');
        if (navigationEntry) {
          const loadTime = navigationEntry.loadEventEnd;
          const loadTimeSec = (loadTime / 1000).toFixed(2);
          sendEvent('page-load-time', { value: `${loadTimeSec}s` });
        }
      });
    }
  
    // Scroll Depth and Full Visible Page Tracking
    function handleScroll() {
      const scrollPos = window.scrollY + window.innerHeight;
      const pageHeight = document.documentElement.scrollHeight;
      const scrollPercent = (scrollPos / pageHeight) * 100;
  
      if (scrollPercent >= 25 && !scroll25) {
        sendEvent('scroll-depth', { value: 25 });
        scroll25 = true;
      }
      if (scrollPercent >= 50 && !scroll50) {
        sendEvent('scroll-depth', { value: 50 });
        scroll50 = true;
      }
      if (scrollPercent >= 75 && !scroll75) {
        sendEvent('scroll-depth', { value: 75 });
        scroll75 = true;
      }
      if (scrollPercent >= 95 && !scroll100) {
        sendEvent('scroll-depth', { value: 100 });
        scroll100 = true;
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
  
    function initializeScrollTracking() {
      const pageHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      const scrollableHeight = pageHeight - viewportHeight;
  
      debugLog(`Page height: ${pageHeight}px, Viewport height: ${viewportHeight}px, Scrollable height: ${scrollableHeight}px`);
  
      if (scrollableHeight <= FULL_VISIBLE_THRESHOLD) {
        sendEvent('page-view-full-visible', { scrollable_height: scrollableHeight });
        debugLog('Short page detected: full visible event sent.');
      } else {
        window.addEventListener('scroll', throttledScrollHandler);
        debugLog('Scrollable page detected: scroll depth tracking enabled.');
      }
    }
  
    // Initialize All Trackers
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      initializeScrollTracking();
      trackCtaClicks();
      trackTimeOnPage();
      trackPageLoadTime();
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        initializeScrollTracking();
        trackCtaClicks();
        trackTimeOnPage();
        trackPageLoadTime();
      });
    }
  })();
  