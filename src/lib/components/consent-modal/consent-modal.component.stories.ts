import type { Meta, StoryObj } from '@storybook/angular';
import { ConsentModalComponent } from './consent-modal.component';

const meta: Meta<ConsentModalComponent> = {
  title: 'Components/Layout and presentation/ConsentModal',
  component: ConsentModalComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `
      <button type="button" class="btn btn-primary" (click)="consent.show()">
        Open consent modal
      </button>
      <common-consent-modal #consent
        [title]="title"
        [agreeLabel]="agreeLabel"
        [continueButton]="continueButton"
        [disableContinue]="disableContinue"
        [isUnderMaintenance]="isUnderMaintenance"
        [maintenanceMessage]="maintenanceMessage">
        <p>Information is collected under section 26 of FOIPPA.</p>
      </common-consent-modal>
    `,
  }),
};

export default meta;
type Story = StoryObj<ConsentModalComponent>;

export const Default: Story = {
  args: {
    title: 'Information collection notice',
    agreeLabel: 'I have read and understand this info',
    continueButton: 'Continue',
    disableContinue: false,
    isUnderMaintenance: false,
    maintenanceMessage: '',
  },
};

export const UnderMaintenance: Story = {
  args: {
    ...Default.args,
    isUnderMaintenance: true,
    maintenanceMessage: 'This service is temporarily unavailable.',
  },
};
