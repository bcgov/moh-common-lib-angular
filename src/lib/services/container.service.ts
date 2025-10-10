/* eslint-disable @typescript-eslint/no-empty-function */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export const DefaultSubmitLabel = 'Continue';

@Injectable({
  providedIn: 'root'
})
export class ContainerService {

  $isLoadingSubject = new BehaviorSubject( false );
  $submitLabelSubject = new BehaviorSubject( DefaultSubmitLabel );
  $useDefaultColorSubject = new BehaviorSubject( true );
  $continueBtnSubject = new Subject();

  // Observables
  $isLoading = this.$isLoadingSubject.asObservable();
  $submitLabel = this.$submitLabelSubject.asObservable();
  $continueBtn = this.$continueBtnSubject.asObservable();
  $useDefaultColor = this.$useDefaultColorSubject.asObservable();

  constructor() { }

  /** If no parameter is passed, the default label is 'Continue' */
  setSubmitLabel( label: string  = DefaultSubmitLabel ) {
    this.$submitLabelSubject.next( label );
  }

  /** If no parameter is passed, it uses the default color */
  setUseDefaultColor( defaultColor = true ) {
    this.$useDefaultColorSubject.next( defaultColor );
  }

  /** If no parameter is passed, it sets the spinner active */
  setIsLoading( isLoading = true ) {
    this.$isLoadingSubject.next( isLoading );
  }

  submitButtonClicked() {
    this.$continueBtnSubject.next(null);
  }
}
