import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { FileUploaderComponent } from './file-uploader.component';
import { CommonImage } from '../../models/images.model';

// FileUploaderComponent requires an ancestor NgForm for its ControlContainer.
const meta: Meta<FileUploaderComponent> = {
  title: 'Components/Upload/FileUploader',
  component: FileUploaderComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Drag-and-drop or browse upload for images and PDFs. Each PDF page ' +
          'becomes one image thumbnail. PDF support needs pdfjs-dist, an ' +
          'optional peer dependency. PdfService.workerSrc is optional: set it ' +
          'to load the pdfjs worker from a URL, or leave it unset and the ' +
          'worker is bundled with the app and runs on the main thread. A file ' +
          'that cannot be read shows the CannotOpenPDF error.',
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [FormsModule],
    }),
  ],
  render: (args) => ({
    props: args,
    template: `
      <form #f="ngForm">
        <common-file-uploader
          [id]="id"
          [images]="images"
          [required]="required"
          [instructionText]="instructionText">
        </common-file-uploader>
      </form>
    `,
  }),
};

export default meta;
type Story = StoryObj<FileUploaderComponent>;

export const Empty: Story = {
  args: {
    id: 'docs',
    images: [],
    required: true,
    instructionText:
      'Please upload required ID documents. Drop a PDF here to see one ' +
      'thumbnail per page.',
  },
};

export const WithImages: Story = {
  args: {
    id: 'docs-with-images',
    images: [
      new CommonImage(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
      ),
    ],
    required: false,
    instructionText: 'Please upload required ID documents.',
  },
};
