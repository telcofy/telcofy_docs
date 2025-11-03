import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import AnimatedTelcofyPin from '../components/HomepageFeatures/TelcofyPin';
import ContactSection from '../components/ContactSection';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--telcofy', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <h1 className="hero__title">{siteConfig.title}</h1>
            <p className="hero__subtitle">{siteConfig.tagline}</p>
            <div className={styles.buttons}>
              <Link
                className="button button--telcofy button--lg"
                to="/docs">
                Get Started with Telcofy
              </Link>
              <Link
                className="button button--eu-compliance button--lg margin-left--md"
                to="/docs/eu-compliance">
                EU Compliance Guide
              </Link>
            </div>
          </div>
          <div className={styles.heroRight}>
            <AnimatedTelcofyPin width={200} height={200} className={styles.heroLogo} />
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Transform Telco Data into Value">
      <HomepageHeader />
      <main>
        <ContactSection />
      </main>
    </Layout>
  );
}