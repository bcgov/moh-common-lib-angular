import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { DropdownComponent } from './dropdown.component';

const meta: Meta<DropdownComponent> = {
  title: 'Components/Generic inputs/Dropdown',
  component: DropdownComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "There is no bindLabel/bindValue override, so ng-select's own " +
          'defaults apply: an object item displays item.label, and the ' +
          'selected value is the whole item, not just one of its fields.',
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [FormsModule],
    }),
  ],
};

export default meta;
type Story = StoryObj<DropdownComponent>;

export const PlainItems: Story = {
  args: {
    label: 'Select an option',
    items: ['Option A', 'Option B', 'Option C'],
    value: 'Option B',
    required: false,
    disabled: false,
    clearable: true,
  },
};

export const ObjectItems: Story = {
  args: {
    label: 'Administering for',
    items: [
      { label: 'Employees', value: 'EMPLOYEES' },
      { label: 'Contractors', value: 'CONTRACTORS' },
      { label: 'Both', value: 'BOTH' },
    ],
    value: { label: 'Employees', value: 'EMPLOYEES' },
    required: false,
    disabled: false,
    clearable: false,
  },
};

export const Required: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Bound with [(ngModel)] and [required], the component's own " +
          'required @Input does not add validation to the outer control; ' +
          "Angular's RequiredValidator does that once it sees [required] " +
          'and [ngModel] together on the host. Open and close the dropdown ' +
          'without selecting, then click elsewhere to blur it and see the ' +
          'required message appear.',
      },
    },
  },
  render: () => ({
    props: { value: null },
    template: `
      <common-dropdown name="option" label="Select an option"
                        [items]="['Option A', 'Option B', 'Option C']"
                        [required]="true"
                        [(ngModel)]="value"></common-dropdown>
    `,
  }),
};

export const Disabled: Story = {
  args: {
    label: 'Select an option',
    items: ['Option A', 'Option B', 'Option C'],
    value: 'Option A',
    disabled: true,
  },
};
