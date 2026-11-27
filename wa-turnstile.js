(function () {
  "use strict";

  const API_BASE = String(document.body?.dataset.waApiBase || "").replace(/\/$/, "");
  const ACTION = "wealth_arrays_action";
  const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  let configPromise = null;
  let scriptPromise = null;
  let widgetId = null;
  let widgetHost = null;
  let issuedToken = false;
  let pending = null;
  let requesting = false;

  function loadConfig() {
    if (!configPromise) {
      configPromise = fetch(API_BASE + "/v1/security-config", { cache: "no-store" })
        .then(async (response) => {
          if (!response.ok) throw new Error("Request verification settings could not be loaded.");
          const config = await response.json();
          if (config.configured !== true || typeof config.site_key !== "string" || !config.site_key.trim()) {
            throw new Error("Request verification is not configured for this environment.");
          }
          return config;
        })
        .catch((error) => {
          configPromise = null;
          throw error;
        });
    }
    return configPromise;
  }

  function loadTurnstile() {
    if (window.turnstile) return Promise.resolve(window.turnstile);
    if (!scriptPromise) {
      scriptPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector('script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]');
        const script = existing || document.createElement("script");
        const fail = () => {
          scriptPromise = null;
          reject(new Error("Cloudflare verification could not be loaded. Check your connection and try again."));
        };
        script.addEventListener("load", () => {
          if (window.turnstile) resolve(window.turnstile);
          else fail();
        }, { once: true });
        script.addEventListener("error", fail, { once: true });
        if (!existing) {
          script.src = SCRIPT_URL;
          script.async = true;
          script.defer = true;
          document.head.append(script);
        } else if (window.turnstile) {
          resolve(window.turnstile);
        }
      });
    }
    return scriptPromise;
  }

  function ensureWidget(turnstile, siteKey) {
    if (widgetId !== null) return;
    widgetHost = document.createElement("div");
    widgetHost.id = "wa-turnstile-widget";
    widgetHost.setAttribute("aria-live", "polite");
    widgetHost.style.cssText = "position:fixed;right:16px;bottom:16px;z-index:2147483000;max-width:calc(100vw - 32px);";
    document.body.append(widgetHost);
    widgetId = turnstile.render(widgetHost, {
      sitekey: siteKey,
      action: ACTION,
      appearance: "interaction-only",
      execution: "execute",
      callback(token) {
        if (!pending) return;
        const current = pending;
        pending = null;
        issuedToken = true;
        clearTimeout(current.timeout);
        current.resolve(token);
      },
      "expired-callback"() {
        if (!pending) return;
        const current = pending;
        pending = null;
        clearTimeout(current.timeout);
        current.reject(new Error("Verification expired. Please try again."));
      },
      "error-callback"() {
        if (!pending) return;
        const current = pending;
        pending = null;
        clearTimeout(current.timeout);
        current.reject(new Error("Verification failed to load. Please try again."));
      }
    });
    if (widgetId === undefined || widgetId === null) {
      widgetHost.remove();
      widgetHost = null;
      throw new Error("Cloudflare verification could not be initialized.");
    }
  }

  async function getToken() {
    if (pending || requesting) throw new Error("Verification is already in progress. Please wait.");
    requesting = true;
    try {
    const hostname = window.location.hostname.toLowerCase();
    if (hostname !== "wealtharrays.com" && hostname !== "www.wealtharrays.com") {
      throw new Error("Verification is unavailable on this hostname.");
    }
    const config = await loadConfig();
    const turnstile = await loadTurnstile();
    ensureWidget(turnstile, config.site_key);
    if (issuedToken) {
      turnstile.reset(widgetId);
      issuedToken = false;
    }
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (!pending) return;
        pending = null;
        reject(new Error("Verification timed out. Please try again."));
        try { turnstile.reset(widgetId); } catch {}
      }, 30000);
      pending = { resolve, reject, timeout };
      try {
        turnstile.execute(widgetId);
      } catch {
        clearTimeout(timeout);
        pending = null;
        reject(new Error("Cloudflare verification could not start. Please try again."));
      }
    });
    } finally {
      requesting = false;
    }
  }

  window.WATurnstile = Object.freeze({ getToken });
})();
