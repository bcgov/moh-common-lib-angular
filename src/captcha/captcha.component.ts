import {
  Component,
  ElementRef,
  ViewChild,
  SimpleChanges,
  NgZone,
  ChangeDetectorRef,
  Output,
  Input,
  AfterViewInit,
  OnInit,
  OnChanges,
  EventEmitter,
  Optional,
  Self,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgControl, ControlValueAccessor } from '@angular/forms';
import { CaptchaDataService } from './captcha-data.service';

/**
 * 7 mutually exclusive states, the program can only be in one of these state
 * at any given point..
 */
export enum CAPTCHA_STATE {
  FETCHING_CAPTCHA_IMG = 1,
  SUCCESS_FETCH_IMG = 2,
  ERROR_FETCH_IMG = 3,
  VERIFYING_ANSWER = 4,
  SUCCESS_VERIFY_ANSWER_CORRECT = 5,
  // http error during verification call.
  ERROR_VERIFY = 6,
}

/** Each message keyed by language code. */
type Translations = { [language: string]: string };

interface TranslatedMessages {
  playAudio: Translations;
  tryAnotherImg: Translations;
  userPromptMessage: Translations;
  incorrectAnswer: Translations;
  successMessage: Translations;
  correct: Translations;
  loadingImage: Translations;
  browserNotSupportAudio: Translations;
  verifyingAnswer: Translations;
  errorRetrievingImg: Translations;
  errorVerifyingAnswer: Translations;
}

/**
 * A BC government CAPTCHA: an image or audio challenge, verified against the
 * captcha API, emitting a JWT through onValidToken once the answer is correct.
 * Set name, ngModel and required for it to report a required error.
 *
 *  @example
 *           <common-captcha
 *               [nonce]="application.uuid"
 *               [apiBaseUrl]="captchaApiBaseUrl"
 *               (onValidToken)="setToken($event)"
 *               name='captcha'
 *               ngModel
 *               required>
 *           </common-captcha>
 */
@Component({
  selector: 'common-captcha',
  templateUrl: './captcha.component.html',
  styleUrls: ['./captcha.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class CaptchaComponent
  implements AfterViewInit, OnInit, OnChanges, ControlValueAccessor
{
  @ViewChild('image') imageContainer!: ElementRef;
  @ViewChild('audioElement') audioElement!: ElementRef;

  @Input() apiBaseUrl!: string;
  @Input() nonce!: string;
  @Input() successMessage!: string;
  @Input() eagerFetchAudio!: string;
  @Input() language: string = 'en';
  @Input() userPromptMessage!: string;

  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onValidToken = new EventEmitter<string>();

  /**
   * Http error response for fetching a CAPTCHA image.
   */
  errorFetchingImg: string | null = null;

  /**
   * Http error response for verifying user's answer.
   */
  errorVerifyAnswer: string | null = null;

  private validation = '';
  public audio = '';
  public answer = '';

  state: CAPTCHA_STATE | undefined;
  incorrectAnswer: boolean | null = null;

  public fetchingAudioInProgress = false;

  public _onChange = (_: any) => {};
  public _onTouched = () => {};

  constructor(
    private dataService: CaptchaDataService,
    private cd: ChangeDetectorRef,
    private ngZone: NgZone,
    @Optional() @Self() public controlDir: NgControl
  ) {
    if (controlDir) {
      controlDir.valueAccessor = this;
    }
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  writeValue(value: any): void {
    this.answer = value;
  }

  onBlur(): void {
    this._onTouched();
  }

  ngOnInit() {
    (window as any)['ca.bcgov.captchaRefresh'] =
      this.publicForceRefresh.bind(this);
  }

  ngAfterViewInit() {
    this.forceRefresh();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Only a language change matters, and only once audio has been fetched:
    // the image itself is language independent, so there is nothing to redo.
    if (!changes['language'] || !this.audio) {
      return;
    }
    this.getNewCaptcha(false);
  }

  forceRefresh() {
    this.getNewCaptcha(false);
    this.cd.detectChanges();
  }

  publicForceRefresh() {
    this.ngZone.run(() => this.forceRefresh());
  }

  answerChanged(event: any) {
    if (this.answer.length < 6) {
      this.incorrectAnswer = null;
    }
    if (this.answer.length === 6) {
      this._onChange(event); // have response trigger _onChange for custom form control
      this.state = CAPTCHA_STATE.VERIFYING_ANSWER;
      this.incorrectAnswer = null;
      this.dataService
        .verifyCaptcha(
          this.apiBaseUrl,
          this.nonce,
          this.answer,
          this.validation
        )
        .subscribe({
          next: (response) => {
            const payload = response.body;
            if (this.isValidPayload(payload)) {
              this.handleVerify(payload);
            } else {
              this.state = CAPTCHA_STATE.ERROR_VERIFY;
              this.errorVerifyAnswer = this.createErrorTextLine(response);
            }
          },
          error: (error) => {
            this.state = CAPTCHA_STATE.ERROR_VERIFY;
            this.errorVerifyAnswer = this.createErrorTextLine(error);
          },
        });
    }
  }

  // Call the backend to see if our answer is correct
  private handleVerify(payload: any) {
    // There could be the rare change where an invalid payload response is received.
    if (payload.valid === true) {
      this.state = CAPTCHA_STATE.SUCCESS_VERIFY_ANSWER_CORRECT;
      this.onValidToken.emit(payload.jwt);
    } else {
      this.incorrectAnswer = true;
      this.answer = '';
      this.audio = '';
      // They failed - try a new one.
      this.getNewCaptcha(true);
    }
  }

  /**
   * Case where HTTP 200 response code is received by the payload is incorrect or corrupt.
   * The occurance of this type of case should be rare.
   */
  private isValidPayload(payload: any) {
    if (!payload) {
      console.error('payload cannot be null or undefined or 0');
      return false;
    }

    const hasValueProp = Object.prototype.hasOwnProperty.call(payload, 'valid');
    if (!hasValueProp) {
      console.error("payload must have its own property named 'valid'");
      return false;
    }
    return true;
  }

  public retryFetchCaptcha() {
    this.state = undefined;

    /**
     * wait for 0.5 seond before resubmitting
     */
    setTimeout(() => {
      this.getNewCaptcha(false);
    }, 100);
  }

  public playAudio() {
    if (this.audio && this.audio.length > 0) {
      this.audioElement.nativeElement.play();
    } else {
      this.fetchAudio(true);
    }
  }

  private fetchAudio(playImmediately: boolean = false) {
    if (!this.fetchingAudioInProgress) {
      this.fetchingAudioInProgress = true;
      this.dataService
        .fetchAudio(this.apiBaseUrl, this.validation, this.language)
        .subscribe({
          next: (response) => {
            this.fetchingAudioInProgress = false;
            this.audio = response.body.audio;
            this.cd.detectChanges();
            if (playImmediately) {
              this.audioElement.nativeElement.play();
            }
          },
          error: () => {
            this.fetchingAudioInProgress = false;
            this.cd.detectChanges();
          },
        });
    }
  }

  public getNewCaptcha(errorCase: any) {
    this.state = CAPTCHA_STATE.FETCHING_CAPTCHA_IMG;
    this.audio = '';

    // Reset things
    if (!errorCase) {
      // Let them know they failed instead of wiping out the answer area
      // Contructing this form on page load/reload will have errorCase = false
      this.incorrectAnswer = null;
    }

    this.dataService.fetchData(this.apiBaseUrl, this.nonce).subscribe({
      next: (response) => {
        this.state = CAPTCHA_STATE.SUCCESS_FETCH_IMG;

        const payload = response.body;
        this.imageContainer.nativeElement.innerHTML = payload?.captcha;
        this.validation = payload?.validation ?? '';
        this.cd.detectChanges();

        if (this.eagerFetchAudio === 'true') {
          this.fetchAudio();
        }
      },
      error: (error) => {
        this.state = CAPTCHA_STATE.ERROR_FETCH_IMG;
        this.errorFetchingImg = this.createErrorTextLine(error);
        this.cd.detectChanges();
      },
    });
  }

  private createErrorTextLine(error: any) {
    let line = 'Error status: ' + error.status;
    if (error.statusText) {
      line = line + ', status text: ' + error.statusText;
    }
    return line;
  }

  public translatedMessages: TranslatedMessages = {
    playAudio: {
      en: 'Play Audio',
      zh: '播放声音',
      fr: 'Lecture audio',
      pa: 'ਆਡੀਓ ਚਲਾਓ',
    },
    tryAnotherImg: {
      en: 'Try another image',
      zh: '换个图像',
      fr: 'Essayez une autre image',
      pa: 'ਕੋਈ ਹੋਰ ਚਿੱਤਰ ਅਜ਼ਮਾਓ',
    },
    userPromptMessage: {
      en: 'Enter the text you either see in the box or you hear in the audio',
      zh: '请输入看到或听到的文字',
      fr: 'Entrez le texte que vous voyez dans la case ou que vous entendez dans le son',
      pa: 'ਉਹ ਟੈਕਸਟ ਦਾਖਲ ਕਰੋ ਜੋ ਤੁਸੀਂ ਬਕਸੇ ਵਿੱਚ ਦੇਖਦੇ ਹੋ ਜਾਂ ਤੁਸੀਂ ਆਡੀਓ ਵਿੱਚ ਸੁਣਦੇ ਹੋ',
    },
    incorrectAnswer: {
      en: 'Incorrect answer, please try again.',
      zh: '答案不对。请重试。',
      fr: 'Mauvaise réponse, veuillez réessayer.',
      pa: 'ਗਲਤ ਜਵਾਬ, ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ.',
    },
    successMessage: {
      en: 'You can submit your application now.',
      zh: '你现在可以提交申请了。',
      fr: 'Vous pouvez soumettre votre candidature maintenant.',
      pa: 'ਤੁਸੀਂ ਆਪਣੀ ਅਰਜ਼ੀ ਹੁਣੇ ਪੇਸ਼ ਕਰ ਸਕਦੇ ਹੋ',
    },
    correct: {
      en: 'Correct.',
      zh: '正确。',
      fr: 'Correct.',
      pa: 'ਸਹੀ ਕਰੋ',
    },
    loadingImage: {
      en: 'Loading CAPTCHA image',
      zh: '正在下载验证码',
      fr: "Chargement de l'image CAPTCHA",
      pa: 'ਕੈਪਟਚਾ ਚਿੱਤਰ ਲੋਡ ਕਰ ਰਿਹਾ ਹੈ',
    },
    browserNotSupportAudio: {
      en: 'Your browser does not support the audio element.',
      zh: '你的浏览器不支持播音',
      fr: "Votre navigateur ne supporte pas l'élément audio.",
      pa: 'ਤੁਹਾਡਾ ਬ੍ਰਾਉਜ਼ਰ ਆਡੀਓ ਐਲੀਮੈਂਟ ਦਾ ਸਮਰਥਨ ਨਹੀਂ ਕਰਦਾ.',
    },
    verifyingAnswer: {
      en: 'Verifying your answer...',
      zh: '正在验证答案...',
      fr: 'Vérification de votre réponse ...',
      pa: 'ਤੁਹਾਡਾ ਜਵਾਬ ਤਸਦੀਕ ਕਰ ਰਿਹਾ ਹੈ ...',
    },
    errorRetrievingImg: {
      en: 'Error happened while retrieving CAPTCHA image. Please {{Click Here}} to try again',
      zh: '验证码下载错误。请{{点击这里}}重试',
      fr: "Une erreur s'est produite lors de la récupération de l'image CAPTCHA. S'il vous plaît {{Cliquez Ici}} pour réessayer",
      pa: 'ਕੈਪਟਚਾ ਚਿੱਤਰ ਨੂੰ ਪ੍ਰਾਪਤ ਕਰਦੇ ਸਮੇਂ ਤਰੁੱਟੀ ਉਤਪੰਨ ਹੋਈ. ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰਨ ਲਈ {{ਇੱਥੇ ਕਲਿਕ ਕਰੋ}}',
    },
    errorVerifyingAnswer: {
      en: 'Error happened while verifying your answer. Please {{Click Here}} to try again',
      zh: '验证答案过程发生错误。请{{点击这里}}重试',
      fr: "Une erreur s'est produite lors de la vérification de votre réponse. S'il vous plaît {{Cliquez Ici}} pour réessayer",
      pa: 'ਤੁਹਾਡਾ ਜਵਾਬ ਤਸਦੀਕ ਕਰਨ ਵੇਲੇ ਗਲਤੀ ਆਈ ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰਨ ਲਈ {{ਇੱਥੇ ਕਲਿਕ ਕਰੋ}}',
    },
  };
}
