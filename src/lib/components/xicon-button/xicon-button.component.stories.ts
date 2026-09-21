import type { Meta, StoryObj } from '@storybook/angular';
import { XiconButtonComponent } from './xicon-button.component';

const meta: Meta<XiconButtonComponent> = {
  title: 'Components/Generic inputs/XiconButton',
  component: XiconButtonComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<XiconButtonComponent>;

export const Default: Story = {
  args: {
    label: 'Remove Spouse',
  },
};
