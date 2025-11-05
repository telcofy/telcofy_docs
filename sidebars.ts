import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'index',
    //'getting-started',
    {
      type: 'category',
      label: 'Products',
      items: [
        'products/index',
      ],
    },
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
        'eu-compliance/methodological-framework',
        'eu-compliance/use-cases',
        'eu-compliance/methods',
        'eu-compliance/codebase-overview',
        'eu-compliance/quality',
        'eu-compliance/eurostat-pipeline-staypoint-detection',
      ],
    },
    {
      type: 'category',
      label: 'Data Delivery',
      items: [
        'data-access/overview',
        'data-access/analytical-hub',
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
    {
      type: 'html',
      value: '<hr style="margin: 1rem 0; border: 0; border-top: 1px solid rgba(0, 0, 0, 0.1);" />',
    },
    {
      type: 'html',
      value: '<a href="/llm_friendly_docs.json" download="llm_friendly_docs.json" class="menu__link" style="display: block; padding: 0.375rem 0.75rem;">📄 LLM Friendly Docs</a>',
    },
  ],
};

export default sidebars;
