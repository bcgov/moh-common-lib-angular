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
          'Known issue: this component is missing its (ngModelChange) and ' +
          '(blur) bindings, so it renders and masks input but never reports a ' +
          'value or shows an error.',
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
