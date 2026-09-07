"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/** Page-only wheel smoothing; touch, form controls and dialogs remain native. */
export default function SmoothPageScroll({ paused = false }: { paused?: boolean }) {
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | undefined;
    let anchorFrame = 0;
    const onAnchor = (event: MouseEvent) => {
      if (!lenis || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(link instanceof HTMLAnchorElement) || link.target || link.hasAttribute("download")) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
      let target: HTMLElement | null;
      try { target = document.getElementById(decodeURIComponent(url.hash.slice(1))); } catch { return; }
      if (!target) return;
      event.preventDefault();
      cancelAnimationFrame(anchorFrame);
      // Wait for the mobile menu to collapse before measuring the destination.
      anchorFrame = requestAnimationFrame(() => {
        if (!lenis) return;
        lenis.scrollTo(window.scrollY, { immediate: true });
        lenis.scrollTo(target, { onComplete: () => {
          if (location.hash !== url.hash) history.pushState(null, "", url.hash);
          if (!target.hasAttribute("tabindex")) {
            target.setAttribute("tabindex", "-1");
            target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
          }
          target.focus({ preventScroll: true });
        } });
      });
    };
    const syncLock = () => {
      if (!lenis) return;
      if (document.querySelector("dialog[open]") || document.body.style.overflow === "hidden") lenis.stop();
      else lenis.start();
    };
    const setup = () => {
      lenis?.destroy();
      lenis = undefined;
      if (paused || preference.matches) return;
      lenis = new Lenis({
        autoRaf: true,
        lerp: 0.12,
        smoothWheel: true,
        syncTouch: false,
        anchors: false,
        prevent: node => node.matches("dialog, textarea, select, [data-native-scroll]"),
      });
      syncLock();
    };
    setup();
    document.addEventListener("click", onAnchor);
    preference.addEventListener("change", setup);
    const observer = new MutationObserver(records => {
      if (records.some(record => record.type === "childList" || record.attributeName === "open")) syncLock();
    });
    observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open"], childList: true });
    const bodyObserver = new MutationObserver(syncLock);
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ["style"] });
    return () => {
      observer.disconnect();
      bodyObserver.disconnect();
      document.removeEventListener("click", onAnchor);
      cancelAnimationFrame(anchorFrame);
      preference.removeEventListener("change", setup);
      lenis?.destroy();
    };
  }, [paused]);
  return null;
}
