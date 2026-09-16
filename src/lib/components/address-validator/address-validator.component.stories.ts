import { applicationConfig } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { AddressValidatorComponent } from './address-validator.component';

const meta: Meta<AddressValidatorComponent> = {
  title: 'Components/Address and location/AddressValidator',
  component: AddressValidatorComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      // Injects HttpClient directly. serviceUrl below points at a host that
      // does not exist, so nothing is fetched unless someone types into it.
      providers: [provideHttpClient(), provideNoopAnimations()],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Typeahead lookup against an address service. Point serviceUrl at ' +
          'the geocoder and it suggests addresses as the user types, ' +
          'emitting the chosen Address through (select).',
      },
    },
  },
};

export default meta;
type Story = StoryObj<AddressValidatorComponent>;

export const Default: Story = {
  args: {
    label: 'Address Lookup',
    serviceUrl: 'https://geocoder.example.gov.bc.ca/addresses.json',
  },
};
