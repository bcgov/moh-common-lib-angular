import { applicationConfig } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { StreetComponent } from './street.component';
import {
  GeoAddressResult,
  GeocoderService,
} from '../../services/geocoder.service';

const meta: Meta<StreetComponent> = {
  title: 'Components/Address and location/Street',
  component: StreetComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      // StreetComponent injects GeocoderService, which needs HttpClient.
      providers: [provideHttpClient()],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'A street address field. It renders a plain text input by default. ' +
          'Set useGeoCoder to swap in a typeahead that suggests addresses ' +
          'from the BC geocoder and emits the chosen one through (select).',
      },
    },
  },
};

export default meta;
type Story = StoryObj<StreetComponent>;

export const Default: Story = {
  args: {
    label: 'Full street address or rural route',
    required: false,
    disabled: false,
  },
};

const sampleResults: GeoAddressResult[] = [
  {
    fullAddress: '525 Superior St, Victoria, BC',
    street: '525 Superior St',
    city: 'Victoria',
    province: 'BC',
    country: 'CAN',
  },
  {
    fullAddress: '1515 Blanshard St, Victoria, BC',
    street: '1515 Blanshard St',
    city: 'Victoria',
    province: 'BC',
    country: 'CAN',
  },
  {
    fullAddress: '4000 Seymour Pl, Victoria, BC',
    street: '4000 Seymour Pl',
    city: 'Victoria',
    province: 'BC',
    country: 'CAN',
  },
];

export const WithGeocoder: Story = {
  decorators: [
    applicationConfig({
      providers: [
        // The typeahead dropdown animates its options, and stands in for the
        // live geocoder at https://geocoder.api.gov.bc.ca so the story never
        // reaches the network.
        provideNoopAnimations(),
        {
          provide: GeocoderService,
          useValue: { lookup: () => of(sampleResults) },
        },
      ],
    }),
  ],
  args: {
    label: 'Full street address or rural route',
    useGeoCoder: true,
    required: false,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Type three or more characters to see suggestions. This story ' +
          'serves a fixed list instead of calling the geocoder.',
      },
    },
  },
};
