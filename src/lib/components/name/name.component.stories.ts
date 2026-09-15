import type { Meta, StoryObj } from '@storybook/angular';
import { NameComponent } from './name.component';

const meta: Meta<NameComponent> = {
  title: 'Components/Identity/Name',
  component: NameComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<NameComponent>;

export const Default: Story = {
  args: {
    label: 'Name',
    required: false,
    disabled: false,
    value: '',
  },
};

export const Prefilled: Story = {
  args: {
    label: 'First Name',
    value: 'Jordan',
    required: true,
  },
};

export const Initial: Story = {
  args: {
    label: 'Middle Initial',
    value: 'A',
    maxlength: '1',
  },
};
