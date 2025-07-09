---
sidebar_position: 2
title: Getting Started
---

# Getting Started with Telcofy

Get your Telcofy platform up and running in minutes.

## Prerequisites

Before you begin, ensure you have:

- Access to your telco data sources
- Administrative privileges for your infrastructure
- Basic understanding of data pipelines

## Installation

### Option 1: Cloud Deployment

```bash
# Clone the Telcofy deployment repository
git clone https://github.com/telcofy/telcofy-deploy.git
cd telcofy-deploy

# Configure your environment
cp .env.example .env
# Edit .env with your configuration

# Deploy to your cloud provider
./deploy.sh --provider=aws --region=eu-west-1