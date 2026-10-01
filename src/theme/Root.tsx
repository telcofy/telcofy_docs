import React, {type ReactNode} from 'react';

import CookieConsent from '@site/src/components/CookieConsent';

/** Mounts the consent banner once, on every page of the site. */
export default function Root({children}: {children: ReactNode}): ReactNode {
  return (
    <>
      {children}
      <CookieConsent />
    </>
  );
}
