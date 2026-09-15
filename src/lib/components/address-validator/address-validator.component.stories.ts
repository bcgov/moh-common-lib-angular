import { applicationConfig } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { provideHttpClient } from '@angular/common/http';
import { AddressValidatorComponent } from './address-validator.component';

const meta: Meta<AddressValidatorComponent> = {
  title: 'Components/Address and location/AddressValidator',
  component: AddressValidatorComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      // Injects HttpClient directly. No fake backend is wired up: see the
      // known-gap note below for why a real lookup would not help either.
      providers: [provideHttpClient()],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Known issue: the typeahead bindings were commented out during ' +
          'the ngx-bootstrap removal, so this never calls the geocoder. It ' +
          'renders as a plain text field.',
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
