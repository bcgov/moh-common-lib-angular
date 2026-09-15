import type { Meta, StoryObj } from '@storybook/angular';
import { ProvinceComponent } from './province.component';

const meta: Meta<ProvinceComponent> = {
  title: 'Components/Address and location/Province',
  component: ProvinceComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Known issue: selecting a value in the dropdown throws, because ' +
          'the change handler reads event.target.value from a value ng-select ' +
          'already emits directly. The initial render below is unaffected; ' +
          'selecting an option in the browser reproduces the throw.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<ProvinceComponent>;

export const Default: Story = {
  args: {
    label: 'Province or state',
    value: 'BC',
    required: false,
    disabled: false,
    useDropDownList: true,
  },
};

export const FreeText: Story = {
  args: {
    label: 'Province or state',
    value: 'Elsewhere',
    useDropDownList: false,
  },
};
