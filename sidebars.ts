import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'index',
    'getting-started',
    {
      type: 'category',
      label: 'Methodology',
      items: [
        'methodology/index',
      ],
    },
    {
      type: 'category',
      label: 'EU Compliance',
      items: [
        'eu-compliance/index',
        // Add more items here as you create them
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/quickstart',
        'api/authentication',
        'api/endpoints',
      ],
    },
    // Commented out sections - uncomment as you create the docs
    /*
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/overview',
        'architecture/data-pipeline',
        'architecture/security',
        'architecture/scalability',
      ],
    },
    {
      type: 'category',
      label: 'Analytics',
      items: [
        'analytics/overview',
        'analytics/dashboard',
        'analytics/custom-queries',
        'analytics/visualizations',
      ],
    },
    {
      type: 'category',
      label: 'Use Cases',
      items: [
        'use-cases/eurostat',
        'use-cases/urban-planning',
        'use-cases/tourism',
        'use-cases/emergency-response',
      ],
    },
    {
      type: 'category',
      label: 'Support',
      items: [
        'support/troubleshooting',
        'support/faq',
        'support/contact',
      ],
    },
    */
  ],
};

export default sidebars;