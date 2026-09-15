import type { Meta, StoryObj } from '@storybook/angular';
import { PhoneNumberComponent } from './phone-number.component';

const meta: Meta<PhoneNumberComponent> = {
  title: 'Components/Contact/PhoneNumber',
  component: PhoneNumberComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<PhoneNumberComponent>;

export const Default: Story = {
  args: {
    label: 'Mobile',
    required: false,
    disabled: false,
    allowInternational: true,
  },
};

export const Prefilled: Story = {
  args: {
    label: 'Mobile',
    value: '(250) 555-0123',
    required: true,
  },
};

export const NoMask: Story = {
  args: {
    label: 'Mobile',
    displayMask: false,
  },
};
