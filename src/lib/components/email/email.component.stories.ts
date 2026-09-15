import type { Meta, StoryObj } from '@storybook/angular';
import { EmailComponent } from './email.component';

const meta: Meta<EmailComponent> = {
  title: 'Components/Contact/Email',
  component: EmailComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<EmailComponent>;

export const Default: Story = {
  args: {
    label: 'Email',
    required: false,
    disabled: false,
    value: '',
  },
};

export const Prefilled: Story = {
  args: {
    label: 'Email',
    value: 'name@example.com',
    required: true,
  },
};
