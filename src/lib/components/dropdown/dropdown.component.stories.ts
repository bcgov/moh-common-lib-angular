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

// Hoisted so ObjectItems' `value` is the exact same object reference as one
// of its `items`, rather than a separate literal that merely matches on
// label. ng-select's own comparator (no bindValue/compareWith here) falls
// back to a label match for a distinct object, which would still select the
// right option - but the point of this story is to show whole-object
// binding, so it should stand on object identity, not that fallback.
const ADMINISTERING_FOR_OPTIONS = [
  { label: 'Employees', value: 'EMPLOYEES' },
  { label: 'Contractors', value: 'CONTRACTORS' },
  { label: 'Both', value: 'BOTH' },
];

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
    items: ADMINISTERING_FOR_OPTIONS,
    value: ADMINISTERING_FOR_OPTIONS[0],
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
