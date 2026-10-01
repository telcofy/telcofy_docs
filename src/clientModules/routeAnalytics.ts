import type {ClientModule} from '@docusaurus/types';
import {trackPageView} from '../lib/analytics';

/** Longest we will wait for a page to settle on its own title. */
const TITLE_TIMEOUT_MS = 500;

/**
 * Run `callback` once the document title has been updated for the new route.
 *
 * Docusaurus applies the new title through react-helmet-async on the next
 * animation frame, *after* `onRouteDidUpdate` fires. A bare `setTimeout`
 * usually wins that race and reports the previous page's title — which would
 * mislabel every blog post in the reports. So wait for the <title> to change,
 * and fall back to a timer for pages that share their predecessor's title.
 */
function afterTitleSettles(callback: () => void): void {
  const titleElement = document.querySelector('title');
  const previousTitle = document.title;
  let done = false;
  let observer: MutationObserver | undefined;
  let timer: ReturnType<typeof setTimeout>;

  const finish = () => {
    if (done) return;
    done = true;
    observer?.disconnect();
    clearTimeout(timer);
    callback();
  };

  if (titleElement) {
    observer = new MutationObserver(() => {
      if (document.title !== previousTitle) finish();
    });
    observer.observe(titleElement, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  }

  timer = setTimeout(finish, TITLE_TIMEOUT_MS);
}

/**
 * Report a page view on the initial load and on every client-side navigation.
 * Docusaurus calls this with `previousLocation: null` on the first render.
 */
const routeAnalytics: ClientModule = {
  onRouteDidUpdate({location, previousLocation}) {
    // Hash-only changes are in-page anchor jumps, not page views. Query strings
    // are kept so campaign (utm_*) parameters survive.
    if (
      previousLocation &&
      previousLocation.pathname === location.pathname &&
      previousLocation.search === location.search
    ) {
      return;
    }

    afterTitleSettles(() => trackPageView(location));
  },
};

export default routeAnalytics;
