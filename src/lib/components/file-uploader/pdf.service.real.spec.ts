import { deserialize, serialize } from 'v8';
import { PdfService } from './pdf.service';

// Minimal one-page PDF with a correct xref table.
const minimalPdf = (): Uint8Array => {
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 10 10] >>',
  ];
  let out = '%PDF-1.4\n';
  const offsets = objs.map((body, i) => {
    const at = out.length;
    out += `${i + 1} 0 obj\n${body}\nendobj\n`;
    return at;
  });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((o) => (out += `${String(o).padStart(10, '0')} 00000 n \n`));
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(out);
};

// Real pdfjs-dist, no mocks. pdfjs decides at module load whether it is in
// Node (pdf.mjs:4967) and if so sets its own workerSrc and loads its own worker
// (pdf.mjs:17315-17317), which hides the browser-only workerSrc error. Jest
// reports a Node-like process, so process.toString is overridden while pdfjs
// first evaluates, forcing the browser path (pdf.mjs:17493-17513).
describe('PdfService with the real pdfjs-dist', () => {
  it('opens a PDF in the browser path with workerSrc unset', async () => {
    PdfService.workerSrc = undefined;
    delete (globalThis as { pdfjsWorker?: unknown }).pdfjsWorker;
    const own = Object.getOwnPropertyDescriptor(process, 'toString');
    Object.defineProperty(process, 'toString', {
      value: () => '[object browser]',
      configurable: true,
    });
    // jsdom lacks structuredClone, which pdfjs's main-thread worker port calls.
    const g = globalThis as { structuredClone?: unknown };
    const hadClone = g.structuredClone;
    g.structuredClone = (v: unknown) => deserialize(serialize(v));
    const service = new PdfService();
    let doc: { numPages: number };
    try {
      doc = await service.getDocument(minimalPdf());
    } finally {
      g.structuredClone = hadClone;
      if (own) {
        Object.defineProperty(process, 'toString', own);
      } else {
        delete (process as any).toString;
      }
    }
    expect(doc.numPages).toBe(1);
  });
});
