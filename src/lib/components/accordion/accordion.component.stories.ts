import type { Meta, StoryObj } from '@storybook/angular';
import { AccordionCommonComponent } from './accordion.component';

const meta: Meta<AccordionCommonComponent> = {
  title: 'Components/Layout and presentation/Accordion',
  component: AccordionCommonComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Known issue: this still emits <accordion>/<accordion-group>, ' +
          'markup from the removed ngx-bootstrap dependency. It compiles under ' +
          'NO_ERRORS_SCHEMA and renders, but the panel never collapses and ' +
          '[isOpen] has no effect.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <common-accordion [title]="title" [isOpen]="isOpen">
        <p>Supporting documents go here.</p>
      </common-accordion>
    `,
  }),
};

export default meta;
type Story = StoryObj<AccordionCommonComponent>;

export const Default: Story = {
  args: {
    title: 'Documents',
    isOpen: false,
  },
};
