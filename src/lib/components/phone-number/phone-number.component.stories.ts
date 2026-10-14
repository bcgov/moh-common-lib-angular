import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { PhoneNumberComponent } from './phone-number.component';

// Self-validation (incompleteValue) only registers once the component has an
// ngModel or formControl attached to it, so the Validation story wires one up
// through a render() template rather than relying on Storybook's default
// arg-to-input binding.
const meta: Meta<PhoneNumberComponent> = {
  title: 'Components/Contact/PhoneNumber',
  component: PhoneNumberComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [FormsModule],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'A North American phone number. The value is always 10 digits and ' +
          'the first digit (the area code) must be 2-9. The "+1 " shown when ' +
          'allowInternational is true is display only and is never stored, ' +
          'so typing +1, or a leading 1 or 0, is ignored: "+1 (234) 567-8978" ' +
          'stores 2345678978. A partial number, or a value starting with 0 or ' +
          '1, is invalid and shows "<label> does not appear to be valid."; ' +
          'a value made only of 0s and 1s is dropped and becomes empty. In a ' +
          'custom [mask], N means a digit 2-9 and the stock ngx-mask tokens ' +
          '(0 any digit, S a letter, A a letter or digit) still work; the ' +
          'default mask is (N00) 000-0000.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<PhoneNumberComponent>;

export const Default: Story = {
  args: {
    label: 'Mobile',
    required: false,
    disabled: false,
    allowInternational: true,
  },
};

export const Prefilled: Story = {
  args: {
    label: 'Mobile',
    value: '(250) 555-0123',
    required: true,
  },
};

export const NoMask: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'With displayMask false the field takes free text, but a bound ' +
          'control still needs exactly 10 digits starting 2-9. Other ' +
          'characters are ignored, so 250.123.4567 is valid and ' +
          '+1 250 123 4567 (11 digits) is not.',
      },
    },
  },
  args: {
    label: 'Mobile',
    displayMask: false,
  },
};

export const Validation: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Bound with [(ngModel)], so the component validates itself. Type ' +
          '+1 (234) 567-8978 to see the +1 ignored and the stored value ' +
          'below. Type a partial number and tab out to see "Mobile does not ' +
          'appear to be valid." appear.',
      },
    },
  },
  render: () => ({
    props: { value: '' },
    template: `
      <common-phone-number name="mobile" label="Mobile"
                           [(ngModel)]="value"></common-phone-number>
      <p>Stored value: "{{ value }}"</p>
    `,
  }),
};
