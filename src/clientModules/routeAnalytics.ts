import type {ClientModule} from '@docusaurus/types';
import {isTagLoaded, streamFor, trackPageView} from '../lib/analytics';

/**
 * Longest we will wait for a page to settle on its own title. The title
 * normally lands within ~30ms, so this only matters when the main thread is
 * busy (a blog index full of large images) or the new page genuinely shares
 * its predecessor's title. Too short a cap mislabels pages: at 500ms a
 * slow render reported a blog post under the blog index's title.
 */
const TITLE_TIMEOUT_MS = 3000;

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

  const finish = () => {
    if (done) return;
    done = true;
    observer?.disconnect();
    clearTimeout(timer);
    window.removeEventListener('pagehide', finish);
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

  const timer = setTimeout(finish, TITLE_TIMEOUT_MS);
  // A visitor who leaves while the hit is pending must still be counted.
  window.addEventListener('pagehide', finish);
}

/**
 * Report a page view on the initial load and on every client-side navigation.
 * Docusaurus calls this with `previousLocation: null` on the first render.
 */
const routeAnalytics: ClientModule = {
  onRouteDidUpdate({location, previousLocation}) {
    // Docs and blog are separate GA streams, and a document may only ever be
    // configured for one of them (see ensureConfigured). So when a visitor
    // whose tag is already loaded crosses between the two, reload into the new
    // section instead of transitioning in-app. The old page's closing events
    // then go to its own stream, and the new document starts clean.
    if (
      previousLocation &&
      isTagLoaded() &&
      streamFor(previousLocation.pathname) !== streamFor(location.pathname)
    ) {
      window.location.reload();
      return;
    }

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
