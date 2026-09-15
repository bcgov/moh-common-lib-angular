import type { Meta, StoryObj } from '@storybook/angular';
import { SampleModalComponent } from './sample-modal.component';

// 1x1 transparent PNG, small enough to keep the story file self-contained
// and avoid a network request to an external image host.
const SAMPLE_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

const sampleImages = [
  {
    path: SAMPLE_IMAGE,
    desc: 'Front of document',
    title: 'Front',
  },
  {
    path: SAMPLE_IMAGE,
    desc: 'Back of document',
    title: 'Back',
  },
];

const meta: Meta<SampleModalComponent> = {
  title: 'Components/Layout and presentation/SampleModal',
  component: SampleModalComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `
      <button type="button" class="btn btn-primary" (click)="samples.openModal()">
        Show sample documents
      </button>
      <common-sample-modal #samples [title]="title" [images]="images">
      </common-sample-modal>
    `,
  }),
};

export default meta;
type Story = StoryObj<SampleModalComponent>;

export const Default: Story = {
  args: {
    title: 'Sample documents',
    images: sampleImages,
  },
};
