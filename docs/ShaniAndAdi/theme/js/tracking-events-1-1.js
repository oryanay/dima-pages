(function () {
    const pagePath = window.location.pathname;
    const scrollTracked = new Set();
    const scrollThresholds = [25, 50, 90];
    const timeMilestones = [1, 3, 5, 10];
  
    // === Multi-Platform Event Dispatcher ===
    function trackEvent(eventName) {
        // Umami
        if (typeof umami === 'object' && typeof umami.track === 'function') {
            umami.track(eventName);
        }

        // GA4
        if (typeof gtag === 'function') {
            gtag('event', eventName);
        }

        // Outbrain (simple event name only)
        if (typeof obApi === 'function') {
            obApi('track', eventName.toUpperCase());
        }

        console.log(`Event sent: ${eventName}`);
    }
  
    // === Page View ===
    trackEvent('page_view');
  
    // === Scroll Depth Tracker ===
    function handleScrollDepth() {
        const scrollY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const percentScrolled = Math.floor((scrollY / docHeight) * 100);

        scrollThresholds.forEach(percent => {
        if (percentScrolled >= percent && !scrollTracked.has(percent)) {
            scrollTracked.add(percent);
            trackEvent(`scroll_depth_${percent}`);
        }
        });
    }
  
    window.addEventListener('scroll', () => {
        requestAnimationFrame(handleScrollDepth);
    });
  
    // === Time on Page Tracker ===
    timeMilestones.forEach(seconds => {
      setTimeout(() => {
        trackEvent(`time_on_page_${seconds}s`);
      }, seconds * 1000);
    });
  
    // === Expose for CTA click handlers ===
    window.trackClickEvent = function (eventName) {
      trackEvent(eventName);
    };
  })();