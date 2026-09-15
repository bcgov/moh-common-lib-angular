import type { Meta, StoryObj } from '@storybook/angular';
import { FormActionBarComponent } from './form-action-bar.component';

const meta: Meta<FormActionBarComponent> = {
  title: 'Components/Layout and presentation/FormActionBar',
  component: FormActionBarComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Place this as a sibling after common-page-framework, not nested inside it.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<FormActionBarComponent>;

export const Default: Story = {
  args: {
    submitLabel: 'Continue',
    canContinue: true,
    isLoading: false,
    defaultColor: true,
  },
};

export const Loading: Story = {
  args: {
    submitLabel: 'Continue',
    canContinue: true,
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    submitLabel: 'Continue',
    canContinue: false,
  },
};
