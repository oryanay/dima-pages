(function () {
    const pagePath = window.location.pathname;
    const scrollTracked = new Set();
    const scrollThresholds = [25, 75, 90];
    const timeMilestones = [1, 3, 5, 10];
    let engagementState = {
        minEngagementFired: false,
        normalEngagementFired: false,
        ctaClickFired: false
      };
      
    function sendOutbrainEvent(eventName) {
        if (typeof obApi !== 'function') return;
        
        switch (eventName) {
            /*case 'page_view':
            obApi('track', 'PAGE_VIEW');
            break;*/
        
            case 'time_on_page_3s':
            case 'scroll_depth_25':
            case 'hero_image_click':
            if (!engagementState.minEngagementFired) {
                obApi('track', 'MIN_ENGAGEMENT');
                engagementState.minEngagementFired = true;
            }
            break;
            
            case 'scroll_depth_75':
            if (!engagementState.normalEngagementFired) {
                obApi('track', 'NORMAL_ENGAGEMENT');
                engagementState.normalEngagementFired = true;
            }
            break;

            case 'cta_button_click':
            case 'footer_link_click':
            if (!engagementState.ctaClickFired) {
                obApi('track', 'CTA_CLICK');
                engagementState.ctaClickFired = true;
            }
            break;
        }
    }
  
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

        // Outbrain 
        sendOutbrainEvent(eventName)

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