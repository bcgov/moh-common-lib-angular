import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { DateComponent } from './date.component';

// Self-validation (dayOutOfRange, invalidRange, etc.) only registers once the
// component has an ngModel or formControl attached to it, so the Required and
// ErrorState stories below wire one up through a render() template rather than
// relying on Storybook's default arg-to-input binding.
const meta: Meta<DateComponent> = {
  title: 'Components/Generic inputs/Date',
  component: DateComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [FormsModule],
    }),
  ],
};

export default meta;
type Story = StoryObj<DateComponent>;

export const Default: Story = {
  args: {
    label: 'Date',
  },
};

export const Required: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Bound with [(ngModel)] and [required], matching how msp uses the ' +
          'component. The month/day/year fields carry the required attribute ' +
          "once Angular's own RequiredValidator picks it up from the host.",
      },
    },
  },
  render: () => ({
    props: { value: null },
    template: `
      <common-date name="dob" label="Date of birth"
                   [required]="true"
                   [(ngModel)]="value"></common-date>
    `,
  }),
};

export const DateRange: Story = {
  args: {
    label: 'Effective date',
    dateRangeStart: new Date(2020, 0, 1),
    dateRangeEnd: new Date(2030, 11, 31),
  },
};

export const ErrorState: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Restricted to past dates only. The error text only appears once ' +
          'the control is touched or dirty, so tab through the day, month and ' +
          'year fields and blur out of the last one to see "Invalid Effective ' +
          'date." appear.',
      },
    },
  },
  render: () => ({
    props: { value: null },
    template: `
      <common-date name="pastOnly" label="Effective date"
                   [restrictDate]="'past'"
                   [(ngModel)]="value"></common-date>
    `,
  }),
};
