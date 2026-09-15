import { applicationConfig } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { provideRouter, withDisabledInitialNavigation } from '@angular/router';
import { HeaderComponent } from './header.component';

// A small inline logo, standing in for the default assets/gov3_bc_logo.png,
// which is a showcase-app asset and does not exist in Storybook's build.
const SAMPLE_LOGO =
  'data:image/svg+xml;utf8,' +
  '<svg xmlns="http://www.w3.org/2000/svg" width="155" height="40">' +
  '<rect width="155" height="40" fill="%23003366"/>' +
  '<text x="8" y="26" font-family="sans-serif" font-size="14" fill="white">BC Gov</text>' +
  '</svg>';

const meta: Meta<HeaderComponent> = {
  title: 'Components/Layout and presentation/Header',
  component: HeaderComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      // Disabling initial navigation stops the router from matching the
      // Storybook iframe's own URL against this empty route table, which
      // otherwise logs an NG04002 "cannot match any routes" error.
      providers: [provideRouter([], withDisabledInitialNavigation())],
    }),
  ],
};

export default meta;
type Story = StoryObj<HeaderComponent>;

export const Default: Story = {
  args: {
    serviceName: 'FPCare',
    urlBaseName: 'fpcare',
    logoSrc: SAMPLE_LOGO,
  },
};
