import type { Meta, StoryObj } from '@storybook/angular';
import { ErrorContainerComponent } from './error-container.component';

const meta: Meta<ErrorContainerComponent> = {
  title: 'Components/Layout and presentation/ErrorContainer',
  component: ErrorContainerComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `
      <common-error-container [displayError]="displayError">
        <div>City is required.</div>
      </common-error-container>
    `,
  }),
};

export default meta;
type Story = StoryObj<ErrorContainerComponent>;

export const Hidden: Story = {
  args: {
    displayError: false,
  },
};

export const Visible: Story = {
  args: {
    displayError: true,
  },
};
