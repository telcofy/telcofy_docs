import React, {type ReactNode} from 'react';

import {openCookieSettings} from '@site/src/lib/consent';

import {COOKIE_NOTICE_URL} from './constants';
import styles from './styles.module.css';

/**
 * Footer entry points for the cookie notice and for changing a decision.
 *
 * The notice lives on the main site, and the "Cookie settings" control on that
 * page only reopens *that* site's banner — consent is stored per origin. So
 * withdrawing consent for this site needs a control here, on this origin.
 */
export default function FooterLinks(): ReactNode {
  return (
    <div className={styles.footerLinks}>
      <a className="footer__link-item" href={COOKIE_NOTICE_URL}>
        Cookies
      </a>
      <button
        type="button"
        className={`footer__link-item ${styles.linkButton}`}
        onClick={openCookieSettings}>
        Cookie settings
      </button>
    </div>
  );
}
