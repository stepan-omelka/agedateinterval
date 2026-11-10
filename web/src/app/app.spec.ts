import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let page: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(App);
    page = fixture.nativeElement;
    await fixture.whenStable();
  });

  function enterAge(value: string): void {
    const input = page.querySelector<HTMLInputElement>('#age')!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    // Not whenStable(): a shown range starts loading its story image, a pending task
    // that never settles here. The image is the ShareButton spec's business.
    TestBed.tick();
  }

  const text = (selector: string) => page.querySelector(selector)?.textContent?.trim();

  it('asks for an age until one is entered', () => {
    expect(text('.hint')).toBe('Enter your age above to see the magic.');
    expect(page.querySelector('app-share-button')).toBeNull();
  });

  it('shows the dating range and the share button', () => {
    enterAge('21');

    const values = [...page.querySelectorAll('app-range-card dd')].map(dd => dd.textContent);
    expect(values).toEqual(['17.5', '28']);
    expect(page.querySelector('app-share-button')).not.toBeNull();
  });

  it('says when the rule has no range', () => {
    enterAge('10');

    expect(text('.too-young-title')).toBe('Too young to date!');
    expect(page.querySelector('app-range-card')).toBeNull();
  });

  it.each([
    ['150', 'Max age is 120! 🧛'],
    ['0', 'Enter an age from 1 to 120.'],
    ['25.5', 'Use whole years, like 25.'],
  ])('explains why %s is not an age', (value, message) => {
    enterAge(value);

    const input = page.querySelector('#age')!;
    expect(text('#age-error')).toBe(message);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('age-error');
    expect(page.querySelector('app-range-card')).toBeNull();
  });

  it('clears the error once the age is fixed', () => {
    enterAge('150');
    enterAge('30');

    expect(page.querySelector('#age-error')).toBeNull();
    expect(page.querySelector('#age')!.getAttribute('aria-invalid')).toBe('false');
  });
});
