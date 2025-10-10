//TODO: Refactor
import { Component, Input, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Base } from '../../models/base';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SampleImageInterface {
  path: string;
  desc: string;
  title?: string;
}

@Component({
  selector: 'common-sample-modal',
  templateUrl: './sample-modal.component.html',
  styleUrls: ['./sample-modal.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class SampleModalComponent extends Base {

  @Input() title!: string;
  @Input() images: SampleImageInterface[] = [];

  @ViewChild('samplesModal') public sampleModal!: ModalDirective;

  constructor() {
    super();
  }

  public openModal(): void {
    this.sampleModal.show();
  }

  public closeModal(): void {
    this.sampleModal.hide();
  }
}
