import type { Meta, StoryObj } from '@storybook/angular';
import { CoreBreadcrumbComponent } from './core-breadcrumb.component';

const meta: Meta<CoreBreadcrumbComponent> = {
  title: 'Components/Layout and presentation/CoreBreadcrumb',
  component: CoreBreadcrumbComponent,
  tags: ['autodocs'],
  render: () => ({
    template: `
      <common-core-breadcrumb>
        <div left><a href="#">Dashboard</a> / <strong>Provision by User</strong></div>
        <div center></div>
        <div right></div>
      </common-core-breadcrumb>
    `,
  }),
};

export default meta;
type Story = StoryObj<CoreBreadcrumbComponent>;

export const Default: Story = {};
