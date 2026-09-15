import type { Meta, StoryObj } from '@storybook/angular';
import { ThumbnailComponent } from './thumbnail.component';
import { CommonImage } from '../../models/images.model';

// 1x1 transparent PNG, small enough to keep the story file self-contained.
const SAMPLE_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

function sampleImage(): CommonImage {
  const image = new CommonImage(SAMPLE_IMAGE);
  image.name = 'sample-document.png';
  image.naturalWidth = 200;
  image.naturalHeight = 200;
  return image;
}

const meta: Meta<ThumbnailComponent> = {
  title: 'Components/Upload/Thumbnail',
  component: ThumbnailComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ThumbnailComponent>;

export const Default: Story = {
  args: {
    imageObject: sampleImage(),
    reviewMode: false,
  },
};

export const ReviewMode: Story = {
  args: {
    imageObject: sampleImage(),
    reviewMode: true,
  },
};
