import type { Meta, StoryObj } from '@storybook/angular';
import { SinComponent } from './sin.component';

const meta: Meta<SinComponent> = {
  title: 'Components/Identity/Sin',
  component: SinComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<SinComponent>;

export const Default: Story = {
  args: {
    label: 'Social Insurance Number (SIN)',
    disabled: false,
  },
};

export const Prefilled: Story = {
  args: {
    label: 'Social Insurance Number (SIN)',
    value: '046 454 286',
  },
};
