import type { Preview } from '@storybook/angular';

const preview: Preview = {
  parameters: {
    a11y: {
      // 'todo' shows a11y violations in the panel without failing the build.
      test: 'todo',
    },
  },
};

export default preview;
