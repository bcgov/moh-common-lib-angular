import type { Meta, StoryObj } from '@storybook/angular';
import { CheckboxComponent } from './checkbox.component';

const meta: Meta<CheckboxComponent> = {
  title: 'Components/Generic inputs/Checkbox',
  component: CheckboxComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<CheckboxComponent>;

export const Default: Story = {
  args: {
    label: 'I want to opt in',
    data: false,
    required: false,
    disabled: false,
  },
};

export const Checked: Story = {
  args: {
    label: 'I want to opt in',
    data: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'I want to opt in',
    data: false,
    disabled: true,
  },
};
