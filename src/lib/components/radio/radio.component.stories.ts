import type { Meta, StoryObj } from '@storybook/angular';
import { RadioComponent } from './radio.component';

const meta: Meta<RadioComponent> = {
  title: 'Components/Generic inputs/Radio',
  component: RadioComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<RadioComponent>;

export const Default: Story = {
  args: {
    label: 'Do you live in Canada?',
    radioLabels: [
      { label: 'No', value: false },
      { label: 'Yes', value: true },
    ],
    display: 'inline-block',
    required: false,
  },
};

export const Vertical: Story = {
  args: {
    label: 'How old are you?',
    radioLabels: [
      { label: '0-18 years', value: 0 },
      { label: '19 years and older', value: 1 },
    ],
    display: 'table-row-group',
  },
};
