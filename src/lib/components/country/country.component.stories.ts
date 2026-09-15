import type { Meta, StoryObj } from '@storybook/angular';
import { CountryComponent } from './country.component';

const meta: Meta<CountryComponent> = {
  title: 'Components/Address and location/Country',
  component: CountryComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<CountryComponent>;

export const Default: Story = {
  args: {
    label: 'Jurisdiction',
    value: 'CAN',
    required: false,
    disabled: false,
    useDropDownList: true,
  },
};

export const FreeText: Story = {
  args: {
    label: 'Jurisdiction',
    value: 'Elsewhere',
    useDropDownList: false,
  },
};
