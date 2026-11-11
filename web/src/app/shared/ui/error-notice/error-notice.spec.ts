import { TestBed } from '@angular/core/testing';
import { ApiErrorKind } from '@core/api/jolpica/api-error';
import { provideAppTranslations } from '@core/i18n/testing/provide-app-translations';
import en from '../../../../../public/i18n/en.json';
import { ErrorNotice } from './error-notice';

describe('ErrorNotice', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideAppTranslations()] });
  });

  async function render(kind: ApiErrorKind | null) {
    const fixture = TestBed.createComponent(ErrorNotice);
    fixture.componentRef.setInput('kind', kind);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      alert: el.querySelector('[role="alert"]')!,
      button: el.querySelector('button')!,
    };
  }

  it('explains each kind of error in its own words', async () => {
    const messages = en.common.errors;
    for (const kind of ['rate-limited', 'network', 'http', 'invalid-response'] as const) {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ providers: [provideAppTranslations()] });

      const { alert } = await render(kind);

      expect(alert.textContent).toContain(messages[kind]);
    }
  });

  it('shows the generic message when the kind is unknown', async () => {
    const { alert } = await render(null);

    expect(alert.textContent).toContain(en.common.errors.http);
  });

  it('offers to try again', async () => {
    const { button } = await render('network');

    expect(button.textContent?.trim()).toBe('Try again');
  });

  it('asks to retry when the button is clicked', async () => {
    const { fixture, button } = await render('network');
    const retried = vi.fn();
    fixture.componentInstance.retry.subscribe(retried);

    button.click();

    expect(retried).toHaveBeenCalledTimes(1);
  });
});
