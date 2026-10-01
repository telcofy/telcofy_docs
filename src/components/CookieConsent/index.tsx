import React, {useCallback, useEffect, useState, type ReactNode} from 'react';
import {useLocation} from '@docusaurus/router';

import {disableAnalytics, trackPageView} from '@site/src/lib/analytics';
import {
  OPEN_SETTINGS_EVENT,
  readConsent,
  writeConsent,
} from '@site/src/lib/consent';

import {COOKIE_NOTICE_URL} from './constants';
import styles from './styles.module.css';

export default function CookieConsent(): ReactNode {
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  // Decided client-side only: the static HTML never contains the banner, and
  // there is no server-side notion of a visitor's choice.
  useEffect(() => {
    if (readConsent() === null) setVisible(true);
  }, []);

  useEffect(() => {
    const reopen = () => setVisible(true);
    window.addEventListener(OPEN_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, reopen);
  }, []);

  const accept = useCallback(() => {
    writeConsent(true);
    setVisible(false);
    // The visit that produced the consent is itself a page view.
    trackPageView(location);
  }, [location]);

  const reject = useCallback(() => {
    writeConsent(false);
    disableAnalytics();
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      className={styles.banner}>
      <div className={styles.card}>
        <h2 id="cookie-consent-title" className={styles.title}>
          Cookies
        </h2>

        <p id="cookie-consent-description" className={styles.body}>
          We’d like to set analytics cookies to understand how this site is
          used. Nothing is set unless you accept.{' '}
          <a href={COOKIE_NOTICE_URL} className={styles.link}>
            How we handle data
          </a>
        </p>

        <div className={styles.actions}>
          <button
            type="button"
            className="button button--telcofy"
            onClick={accept}>
            Accept
          </button>
          <button
            type="button"
            className="button button--eu-compliance"
            onClick={reject}>
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
