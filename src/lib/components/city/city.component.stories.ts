import type { Meta, StoryObj } from '@storybook/angular';
import { CityComponent } from './city.component';

const meta: Meta<CityComponent> = {
  title: 'Components/Address and location/City',
  component: CityComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<CityComponent>;

export const Default: Story = {
  args: {
    label: 'City',
    placeholder: 'City name',
    required: false,
    disabled: false,
    value: '',
  },
};

export const Prefilled: Story = {
  args: {
    label: 'City',
    value: 'Victoria',
    required: true,
  },
};
