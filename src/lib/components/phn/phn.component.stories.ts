import type { Meta, StoryObj } from '@storybook/angular';
import { PhnComponent } from './phn.component';

const meta: Meta<PhnComponent> = {
  title: 'Components/Identity/Phn',
  component: PhnComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Fixed in 2.1.1: the input is now wired with (change) and (blur) ' +
          'bindings, so a typed value reaches a bound form control and leaving ' +
          'the field marks the control touched. The value delivered is the ' +
          'masked string.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<PhnComponent>;

export const Default: Story = {
  args: {
    label: 'Personal Health Number (PHN)',
    required: false,
    disabled: false,
    isBCPhn: true,
  },
};

export const NonBC: Story = {
  args: {
    label: 'Personal Health Number (PHN)',
    isBCPhn: false,
  },
};
