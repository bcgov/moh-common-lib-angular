import { Component, ViewChild } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { FormsModule, NgForm } from '@angular/forms';
import { FileUploaderComponent } from './file-uploader.component';
import { PdfService } from './pdf.service';
import { CommonImage, CommonImageError } from '../../models/images.model';

@Component({
  template: `
    <form>
      <common-file-uploader
        id="docs"
        [images]="images"
        [required]="required"
        (imagesChange)="images = $event"
        (errorDocument)="errors.push($event)"></common-file-uploader>
    </form>
  `,
  imports: [FormsModule, FileUploaderComponent],
})
class HostComponent {
  @ViewChild(FileUploaderComponent) uploader!: FileUploaderComponent;
  @ViewChild(NgForm) form!: NgForm;
  images: CommonImage[] = [];
  errors: CommonImage[] = [];
  required = false;
}

/** A CommonImage that already looks processed, so tests can skip canvas work. */
function processedImage(content: string, size = 1000): CommonImage {
  const image = new CommonImage(content);
  image.size = size;
  image.naturalWidth = 800;
  image.naturalHeight = 600;
  return image;
}

describe('FileUploaderComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let pdfService: { getDocument: jest.Mock };

  beforeEach(async () => {
    pdfService = { getDocument: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [FormsModule, HostComponent, FileUploaderComponent],
      providers: [{ provide: PdfService, useValue: pdfService }],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function uploader() {
    return host.uploader;
  }

  it('should create', () => {
    expect(uploader()).toBeTruthy();
  });

  it('should default its inputs', () => {
    expect(uploader().required).toBe(false);
    expect(uploader().instructionText).toBe(
      'Please upload required ID documents.'
    );
    expect(uploader().errorMessages).toEqual({ required: 'File is required.' });
  });

  it('should render the instruction text', () => {
    uploader().instructionText = 'Upload your passport.';
    fixture.detectChanges();
    const description: HTMLElement =
      fixture.nativeElement.querySelector('.description');
    expect(description.textContent?.trim()).toBe('Upload your passport.');
  });

  // NgModel consumes the interpolated name attribute, so it does not stay on the
  // DOM element. What matters is that the control registers under that name,
  // because fileControl looks it up on the parent form by string.
  it('should register the file input on the form under a name built from the id', () => {
    expect(host.form.control.contains('fileUploadBrowse-docs')).toBe(true);
    expect(uploader().fileControl).toBe(
      host.form.control.get('fileUploadBrowse-docs')
    );
  });

  it('should give the file input an id the label points at', () => {
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input[type="file"]');
    const label: HTMLLabelElement = fixture.nativeElement.querySelector(
      'label.file-upload-label'
    );
    expect(input.id).toBe('fileUploadBrowse-docs');
    expect(label.getAttribute('for')).toBe(input.id);
  });

  it('should resolve fileControl from the parent form', () => {
    expect(uploader().fileControl).toBeTruthy();
  });

  it('should open the file dialog by clicking the hidden input', () => {
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input[type="file"]');
    const click = jest
      .spyOn(input, 'click')
      .mockImplementation(() => undefined);
    uploader().openFileDialog();
    expect(click).toHaveBeenCalled();
  });

  it('should open the file dialog on Enter, and not on other keys', () => {
    const open = jest
      .spyOn(uploader(), 'openFileDialog')
      .mockImplementation(() => undefined);
    uploader().handleKeyDownFileBrowse(
      new KeyboardEvent('keydown', { key: 'Enter' })
    );
    expect(open).toHaveBeenCalledTimes(1);
    uploader().handleKeyDownFileBrowse(
      new KeyboardEvent('keydown', { key: 'a' })
    );
    expect(open).toHaveBeenCalledTimes(1);
  });

  it('should prevent the default drag over, so the browser does not open the file', () => {
    const event = new Event('dragover') as any;
    event.preventDefault = jest.fn();
    uploader().handleDragOver(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should ignore a drop carrying no files', () => {
    const event = {
      preventDefault: jest.fn(),
      dataTransfer: { files: [] },
    } as any;
    const process = jest.spyOn(uploader() as any, 'processFile');
    uploader().handleDrop(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(process).not.toHaveBeenCalled();
  });

  it('should process every dropped file', () => {
    const process = jest
      .spyOn(uploader() as any, 'processFile')
      .mockResolvedValue(undefined);
    const files = [
      new File(['a'], 'a.jpg', { type: 'image/jpeg' }),
      new File(['b'], 'b.jpg', { type: 'image/jpeg' }),
    ];
    uploader().handleDrop({
      preventDefault: jest.fn(),
      dataTransfer: { files },
    } as any);
    expect(process).toHaveBeenCalledTimes(2);
  });

  it('should clear the input after processing a selection, so the same file can be re-picked', () => {
    jest.spyOn(uploader() as any, 'processFile').mockResolvedValue(undefined);
    const target = {
      files: [new File(['a'], 'a.jpg', { type: 'image/jpeg' })],
      value: 'C:\\fakepath\\a.jpg',
    };
    uploader().handleChangeFile({ target } as any);
    expect(target.value).toBe('');
  });

  it('should ignore a selection carrying no files', () => {
    const process = jest.spyOn(uploader() as any, 'processFile');
    uploader().handleChangeFile({ target: { files: [] } } as any);
    expect(process).not.toHaveBeenCalled();
  });

  describe('getConstrainedSize', () => {
    function constrain(w: number, h: number) {
      return (uploader() as any).getConstrainedSize(w, h);
    }

    it('should leave an image within bounds untouched', () => {
      expect(constrain(800, 600)).toEqual({ width: 800, height: 600 });
    });

    it('should cap a wide image at the maximum width, keeping the ratio', () => {
      expect(constrain(6600, 3300)).toEqual({ width: 3300, height: 1650 });
    });

    it('should cap a tall image at the maximum height, keeping the ratio', () => {
      expect(constrain(3300, 6600)).toEqual({ width: 1650, height: 3300 });
    });

    it('should floor fractional dimensions', () => {
      const size = constrain(6601, 3300);
      expect(Number.isInteger(size.width)).toBe(true);
      expect(Number.isInteger(size.height)).toBe(true);
    });
  });

  describe('addFileImages', () => {
    function add(fileName: string, images: CommonImage[]) {
      return (uploader() as any).addFileImages(fileName, images);
    }

    it('should name a single image after the file', async () => {
      const image = processedImage('data:image/jpeg;base64,AAA');
      await add('passport.pdf', [image]);
      expect(image.name).toBe('passport.pdf');
      expect(image.id).toBe('passport.pdf');
      expect(image.contentType).toBe('image/jpeg');
    });

    it('should suffix a page number when a file yields several images', async () => {
      const images = [
        processedImage('data:image/jpeg;base64,AAA'),
        processedImage('data:image/jpeg;base64,BBB'),
      ];
      await add('passport.pdf', images);
      expect(images.map((i) => i.name)).toEqual([
        'passport.pdf.page-1',
        'passport.pdf.page-2',
      ]);
    });

    it('should emit the merged list through imagesChange', async () => {
      const image = processedImage('data:image/jpeg;base64,AAA');
      await add('passport.pdf', [image]);
      expect(host.images.length).toBe(1);
      expect(host.images[0]).toBe(image);
    });

    it('should reject a duplicate rather than adding it twice', async () => {
      const first = processedImage('data:image/jpeg;base64,SAME');
      await add('a.jpg', [first]);
      const duplicate = processedImage('data:image/jpeg;base64,SAME');
      await expect(add('b.jpg', [duplicate])).rejects.toBe(
        CommonImageError.AlreadyExists
      );
      expect(uploader().images.length).toBe(1);
    });
  });

  describe('deleteImage', () => {
    it('should remove the image and emit the remaining list', async () => {
      const first = processedImage('data:image/jpeg;base64,AAA');
      const second = processedImage('data:image/jpeg;base64,BBB');
      await (uploader() as any).addFileImages('a.jpg', [first]);
      await (uploader() as any).addFileImages('b.jpg', [second]);

      uploader().deleteImage(first);

      expect(uploader().images.map((i) => i.uuid)).toEqual([second.uuid]);
      expect(host.images.map((i) => i.uuid)).toEqual([second.uuid]);
    });

    it('should set a required error once the last image is removed', async () => {
      host.required = true;
      fixture.detectChanges();
      const only = processedImage('data:image/jpeg;base64,AAA');
      await (uploader() as any).addFileImages('a.jpg', [only]);

      uploader().deleteImage(only);

      expect(uploader().fileControl.hasError('required')).toBe(true);
    });

    it('should not set a required error when the field is optional', async () => {
      const only = processedImage('data:image/jpeg;base64,AAA');
      await (uploader() as any).addFileImages('a.jpg', [only]);
      uploader().deleteImage(only);
      expect(uploader().fileControl.hasError('required')).toBe(false);
    });
  });

  describe('PDF handling', () => {
    function pdfFile() {
      return new File(['%PDF-1.4'], 'doc.pdf', { type: 'application/pdf' });
    }

    it('should reject a PDF whose pages would exceed the image limit', async () => {
      pdfService.getDocument.mockResolvedValue({ numPages: 51 });

      await expect((uploader() as any).processPDFFile(pdfFile())).rejects.toBe(
        CommonImageError.TooBig
      );
      expect(pdfService.getDocument).toHaveBeenCalled();
    });

    it('should report a PDF it cannot open', async () => {
      pdfService.getDocument.mockRejectedValue(new Error('broken'));

      await expect((uploader() as any).processPDFFile(pdfFile())).rejects.toBe(
        CommonImageError.CannotOpenPDF
      );
    });

    it('should report a page it cannot render', async () => {
      pdfService.getDocument.mockResolvedValue({
        numPages: 1,
        getPage: () => Promise.reject(new Error('bad page')),
      });

      await expect((uploader() as any).processPDFFile(pdfFile())).rejects.toBe(
        CommonImageError.CannotOpenPDF
      );
    });

    it('should pass the file contents through to pdfjs', async () => {
      pdfService.getDocument.mockResolvedValue({ numPages: 0 });

      await (uploader() as any).processPDFFile(pdfFile());

      expect(pdfService.getDocument).toHaveBeenCalledTimes(1);
      expect(pdfService.getDocument.mock.calls[0][0]).toBeInstanceOf(
        ArrayBuffer
      );
    });
  });

  it('should reject a further image once the maximum count is reached', async () => {
    uploader().images = new Array(50)
      .fill(null)
      .map((_, i) => processedImage('data:image/jpeg;base64,' + i));
    await expect(
      (uploader() as any).processImageFile(
        new File(['a'], 'a.jpg', { type: 'image/jpeg' })
      )
    ).rejects.toBe(CommonImageError.TooBig);
  });

  it('should emit an error document carrying the error code', () => {
    (uploader() as any).handleError(CommonImageError.CannotOpen);
    expect(host.errors.length).toBe(1);
    expect(host.errors[0].error).toBe(CommonImageError.CannotOpen);
  });

  // Every other test here stubs processFile, so the dispatch it performs was
  // never exercised. These two drive a file in through the public handler and
  // watch the outcome land, with no private method stubbed.
  describe('end to end through the public handlers', () => {
    // FileReader resolves on a real macrotask, so a single tick is not enough.
    // Poll until the pipeline has produced its result.
    async function waitFor(predicate: () => boolean, attempts = 50) {
      for (let i = 0; i < attempts; i++) {
        if (predicate()) return;
        await new Promise((resolve) => setTimeout(resolve, 5));
      }
      throw new Error('timed out waiting for the upload pipeline');
    }

    it('should route a PDF through processFile and surface its error', async () => {
      pdfService.getDocument.mockRejectedValue(new Error('broken'));

      uploader().handleChangeFile({
        target: {
          files: [
            new File(['%PDF-1.4'], 'doc.pdf', { type: 'application/pdf' }),
          ],
          value: '',
        },
      } as any);
      await waitFor(() => host.errors.length > 0);

      expect(pdfService.getDocument).toHaveBeenCalled();
      expect(host.errors.length).toBe(1);
      expect(host.errors[0].error).toBe(CommonImageError.CannotOpenPDF);
    });

    it('should route a dropped image through processFile and surface its error', async () => {
      // At the image cap, processImageFile rejects before touching the canvas,
      // which jsdom cannot run. That makes the default branch reachable here.
      uploader().images = new Array(50)
        .fill(null)
        .map((_, i) => processedImage('data:image/jpeg;base64,' + i));

      uploader().handleDrop({
        preventDefault: jest.fn(),
        dataTransfer: {
          files: [new File(['a'], 'a.jpg', { type: 'image/jpeg' })],
        },
      } as any);
      await waitFor(() => host.errors.length > 0);

      expect(host.errors.length).toBe(1);
      expect(host.errors[0].error).toBe(CommonImageError.TooBig);
    });
  });

  it('should render a thumbnail per image', async () => {
    await (uploader() as any).addFileImages('a.jpg', [
      processedImage('data:image/jpeg;base64,AAA'),
    ]);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelectorAll('common-thumbnail').length
    ).toBe(1);
  });
});
