import {hasAnalyticsConsent} from './consent';

/**
 * GA4 measurement IDs — one data stream per section of this site.
 *
 * Docs and blog are served from the same origin (docs.telcofy.ai), so the
 * stream is chosen by URL path rather than by hostname. See `streamFor`.
 */
export const STREAMS = {
  docs: 'G-XXXXXXXXXX',
  blog: 'G-XXXXXXXXXX',
} as const;

export type Stream = keyof typeof STREAMS;

const PLACEHOLDER = 'G-XXXXXXXXXX';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    [disableFlag: `ga-disable-${string}`]: boolean;
  }
}

/** Blog lives under /blog; everything else on the site is documentation. */
export function streamFor(pathname: string): Stream {
  return /^\/blog(\/|$)/.test(pathname) ? 'blog' : 'docs';
}

/** A stream with no real ID yet must never put a tag on the page. */
function isConfigured(id: string): boolean {
  return id !== PLACEHOLDER;
}

let tagInjected = false;
const configured = new Set<string>();

/**
 * Inject gtag.js and configure a stream.
 *
 * The tag is deliberately absent from the static HTML and only ever reaches
 * the page from behind a consent check, so a visitor who has not accepted
 * never contacts Google at all — no request, no cookie, no IP disclosure.
 *
 * Streams are configured lazily, on first use, so a visitor who only reads
 * the docs is never given the blog stream's session cookie (and vice versa).
 */
function ensureConfigured(id: string): void {
  const firstLoad = !tagInjected;

  if (firstLoad) {
    tagInjected = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // gtag.js requires the `arguments` object itself, not a rest array.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
  }

  if (!configured.has(id)) {
    configured.add(id);
    // send_page_view is off because this is a single-page app: trackPageView
    // reports every view, including the first.
    window.gtag('config', id, {send_page_view: false});
  }

  if (firstLoad) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(script);
  }
}

/**
 * Report a page view to the stream that owns this path, if — and only if —
 * analytics consent has been given. Guarding here rather than at the call
 * site means no caller can leak a hit.
 *
 * Production builds only: the dev server never reports, so running
 * `npm start` and accepting the banner cannot pollute the real data.
 */
export function trackPageView({
  pathname,
  search = '',
}: {
  pathname: string;
  search?: string;
}): void {
  if (process.env.NODE_ENV !== 'production') return;
  if (!hasAnalyticsConsent()) return;

  const id = STREAMS[streamFor(pathname)];
  if (!isConfigured(id)) return;

  // A visitor who withdrew and then re-accepted within one page load.
  Object.values(STREAMS).forEach((streamId) => {
    window[`ga-disable-${streamId}`] = false;
  });

  ensureConfigured(id);

  window.gtag('event', 'page_view', {
    page_path: `${pathname}${search}`,
    page_location: window.location.href,
    page_title: document.title,
    send_to: id,
  });
}

/**
 * Honour a withdrawal: stop a tag that is already on the page from sending
 * anything further, and remove the cookies it set.
 */
export function disableAnalytics(): void {
  Object.values(STREAMS).forEach((id) => {
    window[`ga-disable-${id}`] = true;
  });
  clearAnalyticsCookies();
}

/**
 * Only this site's own cookies are removed: the shared `_ga` client ID plus
 * the per-stream session cookies for the streams above. The main site sets
 * its own `_ga_<id>` session cookie on the same parent domain, and withdrawing
 * here must not reach in and delete it.
 */
function clearAnalyticsCookies(): void {
  const ownSessionCookies = new Set(
    Object.values(STREAMS).map((id) => `_ga_${id.replace(/^G-/, '')}`),
  );
  const isOurs = (name: string) =>
    name === '_ga' ||
    name === '_gid' ||
    name.startsWith('_gat') ||
    ownSessionCookies.has(name);

  const {hostname} = window.location;
  const domains: Array<string | undefined> = [
    undefined,
    hostname,
    `.${hostname}`,
  ];

  // GA sets its cookies on the registrable domain, which is one level up from
  // the host we are served on (docs.telcofy.ai -> .telcofy.ai).
  const labels = hostname.split('.');
  if (labels.length > 2) {
    const registrable = labels.slice(-2).join('.');
    domains.push(registrable, `.${registrable}`);
  }

  document.cookie
    .split(';')
    .map((cookie) => cookie.split('=')[0].trim())
    .filter(isOurs)
    .forEach((name) => {
      domains.forEach((domain) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${
          domain ? `; domain=${domain}` : ''
        }`;
      });
    });
}
