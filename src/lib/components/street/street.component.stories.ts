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
      // StreetComponent injects GeocoderService, which needs HttpClient even
      // though the typeahead below never calls it (see the known-gap note).
      providers: [provideHttpClient()],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Known issue: the typeahead input is commented out, so this ' +
          'renders only its label.',
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
