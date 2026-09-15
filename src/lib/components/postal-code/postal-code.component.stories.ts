import type { Meta, StoryObj } from '@storybook/angular';
import { PostalCodeComponent } from './postal-code.component';

const meta: Meta<PostalCodeComponent> = {
  title: 'Components/Generic inputs/PostalCode',
  component: PostalCodeComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<PostalCodeComponent>;

export const Default: Story = {
  args: {
    label: 'Postal Code',
    displayMask: true,
    required: false,
    disabled: false,
  },
};

export const Prefilled: Story = {
  args: {
    label: 'Postal Code',
    value: 'V8W 1A1',
    required: true,
  },
};

export const NoMask: Story = {
  args: {
    label: 'Zip Code',
    displayMask: false,
  },
};
