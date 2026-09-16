import { applicationConfig } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { provideHttpClient } from '@angular/common/http';
import { StreetComponent } from './street.component';

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
          'Renders a plain text input for the street address. The typeahead ' +
          '(geocoder) suggestion path is not wired up in this release; the ' +
          'field behaves like a plain text field.',
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
