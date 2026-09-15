import { applicationConfig } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { within, userEvent } from 'storybook/test';
import { NEVER, throwError } from 'rxjs';
import { CaptchaComponent } from './captcha.component';
import { CaptchaDataService } from './captcha-data.service';
import { FakeCaptchaDataService } from './testing/fake-captcha-data.service';

const networkError = { status: 500, statusText: 'Internal Server Error' };

function withFake(fake: FakeCaptchaDataService) {
  return applicationConfig({
    providers: [{ provide: CaptchaDataService, useValue: fake }],
  });
}

async function typeAnswer(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  const input = canvas.getByRole('textbox');
  await userEvent.type(input, '83EQ2P');
}

const meta: Meta<CaptchaComponent> = {
  title: 'Captcha/Captcha',
  component: CaptchaComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<CaptchaComponent>;

const baseArgs = {
  apiBaseUrl: 'https://captcha.example.gov.bc.ca',
  nonce: 'story-nonce',
};

// CAPTCHA_STATE.FETCHING_CAPTCHA_IMG: the image request never resolves.
export const FetchingImage: Story = {
  args: baseArgs,
  decorators: [withFake(new FakeCaptchaDataService(NEVER))],
};

// CAPTCHA_STATE.SUCCESS_FETCH_IMG: the default fake resolves immediately.
export const SuccessFetchImage: Story = {
  args: baseArgs,
  decorators: [withFake(new FakeCaptchaDataService())],
};

// CAPTCHA_STATE.ERROR_FETCH_IMG: the image request errors.
export const ErrorFetchImage: Story = {
  args: baseArgs,
  decorators: [
    withFake(new FakeCaptchaDataService(throwError(() => networkError))),
  ],
};

// CAPTCHA_STATE.VERIFYING_ANSWER: typing 6 characters submits, and the
// verify request never resolves.
export const VerifyingAnswer: Story = {
  args: baseArgs,
  decorators: [withFake(new FakeCaptchaDataService(undefined, NEVER))],
  play: async ({ canvasElement }) => {
    await typeAnswer(canvasElement);
  },
};

// CAPTCHA_STATE.SUCCESS_VERIFY_ANSWER_CORRECT: the verify request confirms
// the answer.
export const SuccessVerifyAnswerCorrect: Story = {
  args: baseArgs,
  decorators: [withFake(new FakeCaptchaDataService())],
  play: async ({ canvasElement }) => {
    await typeAnswer(canvasElement);
  },
};

// CAPTCHA_STATE.ERROR_VERIFY: the verify request errors.
export const ErrorVerify: Story = {
  args: baseArgs,
  decorators: [
    withFake(
      new FakeCaptchaDataService(
        undefined,
        throwError(() => networkError)
      )
    ),
  ],
  play: async ({ canvasElement }) => {
    await typeAnswer(canvasElement);
  },
};
