"use client";

import { useEffect } from "react";

/**
 * Registers the offline service worker in production. Registration is
 * deferred until the page has loaded so it never competes with first paint.
 * We deliberately do NOT reload on controller change: that would wipe an
 * in-progress round. New assets simply apply on the next visit.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        /* Offline support is progressive enhancement; ignore failures. */
      });
    };

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
