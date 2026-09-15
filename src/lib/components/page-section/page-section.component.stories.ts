import type { Meta, StoryObj } from '@storybook/angular';
import { PageSectionComponent } from './page-section.component';

const meta: Meta<PageSectionComponent> = {
  title: 'Components/Layout and presentation/PageSection',
  component: PageSectionComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `
      <common-page-section [layout]="layout">
        <p>Main column content goes here.</p>
        <div aside>Side column content.</div>
      </common-page-section>
    `,
  }),
};

export default meta;
type Story = StoryObj<PageSectionComponent>;

export const Tips: Story = {
  args: {
    layout: 'tips',
  },
};

export const Double: Story = {
  args: {
    layout: 'double',
  },
};

export const NoTips: Story = {
  args: {
    layout: 'noTips',
  },
};
