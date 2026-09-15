import type { Meta, StoryObj } from '@storybook/angular';
import {
  ConfirmTemplateComponent,
  ApiStatusCodes,
} from './confirm-template.component';

const meta: Meta<ConfirmTemplateComponent> = {
  title: 'Components/Layout and presentation/ConfirmTemplate',
  component: ConfirmTemplateComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `
      <common-confirm-template [displayIcon]="displayIcon">
        <h2 confirmationTitle>Your application was received</h2>
        <p>Reference number 12345.</p>
        <div AdditionalInfo>Keep this number for your records.</div>
      </common-confirm-template>
    `,
  }),
};

export default meta;
type Story = StoryObj<ConfirmTemplateComponent>;

export const Success: Story = {
  args: {
    displayIcon: ApiStatusCodes.SUCCESS,
  },
};

export const Warning: Story = {
  args: {
    displayIcon: ApiStatusCodes.WARNING,
  },
};

// Named ErrorStatus, not Error, so this does not shadow the global Error
// constructor; the story name (and its id) still read as "Error".
export const ErrorStatus: Story = {
  name: 'Error',
  args: {
    displayIcon: ApiStatusCodes.ERROR,
  },
};
