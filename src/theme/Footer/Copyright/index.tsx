import React, {type ReactNode} from 'react';
import Copyright from '@theme-original/Footer/Copyright';
import type CopyrightType from '@theme/Footer/Copyright';
import type {WrapperProps} from '@docusaurus/types';

import CookieFooterLinks from '@site/src/components/CookieConsent/FooterLinks';

type Props = WrapperProps<typeof CopyrightType>;

export default function CopyrightWrapper(props: Props): ReactNode {
  return (
    <>
      <CookieFooterLinks />
      <Copyright {...props} />
    </>
  );
}
