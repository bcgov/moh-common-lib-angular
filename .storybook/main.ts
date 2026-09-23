import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.ts', '../src/**/*.mdx'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
};

export default config;
