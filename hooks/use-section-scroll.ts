'use client';

import { useEffect, type RefObject } from 'react';

/** Complete each scene automatically, while allowing the user to reverse direction. */
export function useSectionScroll(
  root: RefObject<HTMLElement | null>,
  stops: readonly (readonly [number, number])[],
  viewportSelector: string,
  staticReducedMotion = false,
) {
  useEffect(() => {
    const element = root.current;
    const viewport = element?.querySelector<HTMLElement>(viewportSelector);
    if (!element || !viewport) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const events = new AbortController();
    let frame = 0;
    let moving = false;
    let activeDirection = 0;
    let targetIndex = 0;
    let touch: { x: number; y: number; consumed: boolean } | null = null;

    const bounds = () => {
      const top = element.getBoundingClientRect().top + window.scrollY
        - (parseFloat(getComputedStyle(viewport).top) || 0);
      const travel = Math.max(0, element.offsetHeight - viewport.offsetHeight);
      return { top, travel };
    };
    const editable = (target: EventTarget | null) => target instanceof Element
      && Boolean(target.closest('input, textarea, select, [contenteditable="true"], [role="dialog"], [role="listbox"]'));
    const nestedScroll = (target: EventTarget | null, direction: number) => {
      for (let node = target instanceof Element ? target : null;
        node && node !== element && node !== document.body; node = node.parentElement) {
        if (/(auto|scroll)/.test(getComputedStyle(node).overflowY)
          && node.scrollHeight > node.clientHeight + 1
          && (direction > 0 ? node.scrollTop + node.clientHeight < node.scrollHeight - 1 : node.scrollTop > 1)) return true;
      }
      return false;
    };
    const advance = (direction: number, event: Event) => {
      if (event.defaultPrevented || (staticReducedMotion && reduced.matches)
        || editable(event.target) || nestedScroll(event.target, direction)
        || getComputedStyle(document.body).overflow === 'hidden') return;
      const { top, travel } = bounds();
      const position = window.scrollY;
      if (!travel || position < top - 2 || position > top + travel + 2) return;
      const now = performance.now();
      const reversing = direction !== activeDirection;
      if (!reversing && moving) {
        event.preventDefault();
        return;
      }
      // Each scene has a settled interval. Skip that still interval when leaving
      // it, instead of spending part of the gesture on an unchanged picture.
      const destinations = stops.map(stop => top + stop[direction > 0 ? 0 : 1] * travel);
      const settledIndex = stops.findIndex(([start, end]) =>
        position >= top + start * travel - 2 && position <= top + end * travel + 2);
      const destination = moving && reversing
        ? destinations[targetIndex - activeDirection]
        : settledIndex >= 0
        ? destinations[settledIndex + direction]
        : direction > 0
        ? destinations.find(stop => stop > position + 2)
        : destinations.findLast(stop => stop < position - 2);
      if (destination === undefined) return; // Allow access to the footer and page edges.
      event.preventDefault();
      cancelAnimationFrame(frame);
      activeDirection = direction;
      targetIndex = destinations.indexOf(destination);
      const departure = !moving && settledIndex >= 0
        ? top + stops[settledIndex][direction > 0 ? 1 : 0] * travel
        : position;
      moving = true;
      const duration = reduced.matches ? 0 : 2500;
      const tick = (time: number) => {
        const progress = duration ? Math.min(1, (time - now) / duration) : 1;
        // Start moving immediately and decelerate at the destination.
        const eased = progress + progress ** 2 - progress ** 3;
        const updated = bounds();
        const target = updated.top + (destination - top) / travel * updated.travel;
        window.scrollTo({ top: departure + (target - departure) * eased, behavior: 'instant' });
        if (progress < 1) frame = requestAnimationFrame(tick);
        else { moving = false; frame = 0; }
      };
      frame = requestAnimationFrame(tick);
    };
    window.addEventListener('wheel', event => {
      if (event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      advance(Math.sign(event.deltaY), event);
    }, { passive: false, signal: events.signal });
    window.addEventListener('touchstart', event => {
      touch = event.touches.length === 1
        ? { x: event.touches[0].clientX, y: event.touches[0].clientY, consumed: false } : null;
    }, { passive: true, signal: events.signal });
    window.addEventListener('touchmove', event => {
      if (!touch || event.touches.length !== 1) return;
      const dy = touch.y - event.touches[0].clientY;
      const dx = touch.x - event.touches[0].clientX;
      if (Math.abs(dy) < 8 || Math.abs(dy) <= Math.abs(dx)) return;
      if (touch.consumed) { event.preventDefault(); return; }
      advance(Math.sign(dy), event);
      touch.consumed = event.defaultPrevented;
    }, { passive: false, signal: events.signal });
    window.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey || editable(event.target)) return;
      if (event.key === ' ' && event.target instanceof Element
        && event.target.closest('button, a, [role="button"]')) return;
      const direction = ['ArrowDown', 'PageDown'].includes(event.key) || (event.key === ' ' && !event.shiftKey) ? 1
        : ['ArrowUp', 'PageUp'].includes(event.key) || (event.key === ' ' && event.shiftKey) ? -1 : 0;
      if (direction) advance(direction, event);
    }, { signal: events.signal });
    return () => { events.abort(); cancelAnimationFrame(frame); };
  }, [root, stops, viewportSelector, staticReducedMotion]);
}
