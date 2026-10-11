import { useCallback, useEffect, useState } from 'react';

/**
 * A hash router in about thirty lines, so the back button, a bookmark and a
 * refresh all behave the way she'd expect without pulling in a dependency.
 *
 * Routes are plain names ('boxes', 'letter', …) and live in the URL as
 * '#/letter'. Anything unrecognised falls back to the first route.
 */

function read(routes, fallback) {
  const name = window.location.hash.replace(/^#\/?/, '').split(/[?/]/)[0];
  return routes.includes(name) ? name : fallback;
}

export function useHashRoute(routes, fallback = routes[0]) {
  const [route, setRoute] = useState(() => read(routes, fallback));

  useEffect(() => {
    const onChange = () => setRoute(read(routes, fallback));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
    // `routes` is a module-level constant at every call site, so this only
    // ever runs once.
  }, [routes, fallback]);

  /** Navigate, leaving a history entry so Back works. */
  const go = useCallback((name) => {
    if (read(routes, fallback) === name) return;
    window.location.hash = `#/${name}`;
  }, [routes, fallback]);

  /** Navigate without adding to history — used when redirecting. */
  const replace = useCallback((name) => {
    const url = `${window.location.pathname}${window.location.search}#/${name}`;
    window.history.replaceState(null, '', url);
    setRoute(read(routes, fallback));
  }, [routes, fallback]);

  return [route, go, replace];
}
