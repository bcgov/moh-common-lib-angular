import type { Meta, StoryObj } from '@storybook/angular';
import { PageFrameworkComponent } from './page-framework.component';

const meta: Meta<PageFrameworkComponent> = {
  title: 'Components/Layout and presentation/PageFramework',
  component: PageFrameworkComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `
      <common-page-framework [layout]="layout">
        <p>Main column content goes here.</p>
        <div aside>Side column content, or tips.</div>
      </common-page-framework>
    `,
  }),
};

export default meta;
type Story = StoryObj<PageFrameworkComponent>;

export const Default: Story = {
  args: {
    layout: 'default',
  },
};

export const Double: Story = {
  args: {
    layout: 'double',
  },
};

export const Single: Story = {
  args: {
    layout: 'single',
  },
};

export const Blank: Story = {
  args: {
    layout: 'blank',
  },
};
