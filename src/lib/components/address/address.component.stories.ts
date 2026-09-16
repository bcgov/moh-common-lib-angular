import { applicationConfig, moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { provideHttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AddressComponent } from './address.component';
import { Address } from '../../models/address.model';

function sampleAddress(): Address {
  const address = new Address();
  address.addressLine1 = '525 Superior St';
  address.city = 'Victoria';
  address.province = 'BC';
  address.country = 'CAN';
  address.postal = 'V8V 1T7';
  return address;
}

// AddressComponent's viewProviders swap in the ancestor NgForm, and its
// StreetComponent child injects GeocoderService, which needs HttpClient even
// with the geocoder lookup disabled below.
const meta: Meta<AddressComponent> = {
  title: 'Components/Address and location/Address',
  component: AddressComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideHttpClient()],
    }),
    moduleMetadata({
      imports: [FormsModule],
    }),
  ],
  render: (args) => ({
    props: args,
    template: `
      <form #f="ngForm">
        <common-address
          [(address)]="address"
          [isRequired]="isRequired"
          [disableGeocoder]="disableGeocoder"
          [bcOnly]="bcOnly"
          [allowExtralines]="allowExtralines">
        </common-address>
      </form>
    `,
  }),
};

export default meta;
type Story = StoryObj<AddressComponent>;

export const Default: Story = {
  args: {
    address: sampleAddress(),
    isRequired: true,
    // Disabled so the story does not need an address service URL; this falls
    // back to the plain street field.
    disableGeocoder: true,
    bcOnly: false,
    allowExtralines: false,
  },
};

export const Empty: Story = {
  args: {
    address: new Address(),
    isRequired: false,
    disableGeocoder: true,
  },
};
