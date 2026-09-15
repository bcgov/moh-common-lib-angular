import type { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from './button.component';

const meta: Meta<ButtonComponent> = {
  title: 'Components/Generic inputs/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  argTypes: {
    buttonType: {
      control: 'select',
      options: ['default', 'primary', 'secondary'],
    },
  },
};

export default meta;
type Story = StoryObj<ButtonComponent>;

export const Default: Story = {
  args: {
    label: 'Button',
    buttonType: 'default',
    disabled: false,
  },
};

export const Primary: Story = {
  args: {
    label: 'Save',
    buttonType: 'primary',
    disabled: false,
  },
};

export const Secondary: Story = {
  args: {
    label: 'Cancel',
    buttonType: 'secondary',
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Button',
    buttonType: 'primary',
    disabled: true,
  },
};
