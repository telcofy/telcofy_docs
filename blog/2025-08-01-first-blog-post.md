---
slug: enhanced-dasymetric-mapping-oslo
title: Revolutionizing Urban Activity Mapping with Mobile Phone Data
authors: [oslo-research-team]
tags: [facebook]
---

Have you ever wondered where people actually spend their time in a city? Not just where they live, but where they work, shop, exercise, and socialize? We're excited to introduce our groundbreaking research on Enhanced Dasymetric Mapping, which transforms how we understand human activity patterns in Oslo using mobile phone data.

<!-- truncate -->

## The Challenge: From Cell Towers to City Grids

Mobile network operators know roughly where phones connect to cell towers, but city planners need to know where people actually are within 250×250 meter grid cells. Traditional methods focus on nighttime residential populations, missing the dynamic pulse of urban life. Our research tackles a fundamental question: **"Which spatial interpolation method most accurately redistributes detected mobile phone activities from cell tower coverage areas to fine-grained geographic grids?"**

## What Makes Our Approach Revolutionary

### 1. Activity-First, Not Just Population
While traditional dasymetric mapping focuses on where people sleep, we're mapping where people *live their lives*. Using rich OpenStreetMap data, we've categorized Oslo into eight activity types:
- **Homes**: Residential buildings and hotels
- **Offices**: Work locations and business services  
- **Commercial**: Shops, restaurants, and markets
- **Education**: Schools, universities, and libraries
- **Leisure**: Parks, sports facilities, and entertainment
- **Transport**: Roads, railways, and transit stops
- **Public Services**: Healthcare and government facilities
- **Nature**: Green spaces and water bodies

### 2. Machine Learning Meets Geography
Our EM (Expectation-Maximization) algorithm doesn't just guess where activities happen—it learns from the data itself. Instead of predetermined weights, the algorithm discovers which geographic features best predict human presence throughout the day.

### 3. Synthetic Validation Framework
Here's the clever part: we created synthetic mobile phone data with perfect ground truth. This means we know exactly where our virtual residents are at all times, allowing us to rigorously test which methods work best under different network conditions.

## Key Findings That Challenge Assumptions

Our experiments with 1,000 synthetic users revealed surprising insights:

- **Less Can Be More**: Counter-intuitively, reduced cell tower density can actually *improve* stay detection accuracy by naturally aggregating activities
- **The 5-Minute Sweet Spot**: Ping frequencies of 5-10 minutes provide the optimal balance between accuracy (76.7%) and data efficiency (80% reduction)
- **Network Topology Matters**: The structure of the cellular network significantly influences how well we can detect human activities

## Real-World Applications

This research isn't just academic—it has immediate practical applications:

- **Urban Planning**: Understand real-time activity distributions for better city design
- **Emergency Management**: Know where people actually are during crises, not just where they live
- **Transportation**: Optimize public transit based on actual movement patterns
- **Commercial Analytics**: Help businesses understand customer behavior spatially

## What's Next?

We're currently in the feature extraction phase, having successfully processed all of Oslo's OpenStreetMap data into quantifiable grid features. Next steps include implementing the EM algorithm for activity weighting and conducting comprehensive validation across different network topologies.

Stay tuned as we continue to push the boundaries of what's possible with mobile phone data analytics. Our goal is to provide city planners and researchers with tools that reveal the true heartbeat of urban life—where people work, play, and connect throughout their day.

---

*This research is part of the Smart Oslo initiative, exploring how standardized mobile data can transform urban analytics while respecting privacy through advanced anonymization techniques.*