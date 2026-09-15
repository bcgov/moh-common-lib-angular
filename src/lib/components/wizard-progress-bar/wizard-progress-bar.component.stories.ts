import { applicationConfig } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { provideRouter, withDisabledInitialNavigation } from '@angular/router';
import { WizardProgressBarComponent } from './wizard-progress-bar.component';
import type { WizardProgressItem } from '../../models/container';

const steps: WizardProgressItem[] = [
  { title: 'Personal Info', route: 'personal-info' },
  { title: 'Address', route: 'address' },
  { title: 'Review', route: 'review' },
];

const meta: Meta<WizardProgressBarComponent> = {
  title: 'Components/Layout and presentation/WizardProgressBar',
  component: WizardProgressBarComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      // Disabling initial navigation stops the router from matching the
      // Storybook iframe's own URL against this empty route table, which
      // otherwise logs an NG04002 "cannot match any routes" error.
      providers: [provideRouter([], withDisabledInitialNavigation())],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'The active step is derived from the current route. With an empty ' +
          'route table in this story, no step shows as active.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<WizardProgressBarComponent>;

export const Default: Story = {
  args: {
    progressSteps: steps,
  },
};
