const currentEnv = scriptParams.currentEnv;
const isPrd = currentEnv == 'production' ? true : false;
scribesdk.initialize("grabcom", isPrd);

if (window.performance) {
  window.addEventListener("load", function () {

    // FCP
    function showPaintTimings() {
      const performance = window.performance;
      const performanceEntries = performance.getEntriesByType("paint");
      return performanceEntries;
    }

    // TTFB:
    function showTTFBTiming() {
      const performance = window.performance;
      const performanceEntry = performance.getEntriesByType("navigation")[0];
      const ttfb = performanceEntry.responseStart;
      return ttfb;
    }

    if (window.PerformanceObserver) {
      // https://web.dev/fid/
      const perf_observerFID = (entryList, observerFID) => {
        let obj = {};
        for (const entry of entryList.getEntries()) {
          const delay = entry.processingStart - entry.startTime;
          obj[`${entry.entryType}`] = delay;
          scribesdk.sendEvent("webvitals", obj);
        }
        observerFID.disconnect();
      };

      const observerFID = new PerformanceObserver(perf_observerFID);
      observerFID.observe({ type: "first-input", buffered: true });

      // https://web.dev/lcp/
      const perf_observerLCP = (entryList, observerLCP) => {
        let obj = {};
        for (const entry of entryList.getEntries()) {
          obj[`${entry.entryType}`] = entry.startTime;
          scribesdk.sendEvent("webvitals", obj);
        }
        observerLCP.disconnect();
      };

      const observerLCP = new PerformanceObserver(perf_observerLCP);
      observerLCP.observe({ type: "largest-contentful-paint", buffered: true });

      // CLS
      let cumulativeLayoutShiftScore = 0;
  
      const observerCLS = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Only count layout shifts without recent user input.
        if (!entry.hadRecentInput) {
          cumulativeLayoutShiftScore += entry.value;
        }
      }
      scribesdk.sendEvent("webvitals", {'CLS': cumulativeLayoutShiftScore});
      observerCLS.disconnect();
      });
    
      observerCLS.observe({type: 'layout-shift', buffered: true});
      
    }

    const ttfbTiming = showTTFBTiming();
    const paints = showPaintTimings();
    let paintTimings = {};
    paints.forEach((e) => {
      paintTimings[e.name] = e.startTime;
    });

    const facets = { TTFB: ttfbTiming, ...paintTimings };
    scribesdk.sendEvent("webvitals", facets);
  });
}