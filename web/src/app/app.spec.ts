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

  afterEach(() => vi.useRealTimers());

  /** The input labelled "Your age", found through its label as a screen reader finds it. */
  function ageField(): HTMLInputElement {
    const label = [...page.querySelectorAll('label')].find(
      ({ textContent }) => textContent?.trim() === 'Your age',
    );
    return label?.control as HTMLInputElement;
  }

  /** The live region a screen reader announces. */
  const results = () => page.querySelector('[aria-live]')?.textContent?.trim();

  function type(value: string): void {
    ageField().value = value;
    ageField().dispatchEvent(new Event('input'));
  }

  /** Types `value` and leaves the field, which shows the result without waiting. */
  function enterAge(value: string): void {
    type(value);
    ageField().dispatchEvent(new Event('blur'));
    // Not whenStable(): a shown range starts loading its story image, a pending task
    // that never settles here. The image is the ShareButton spec's business.
    TestBed.tick();
  }

  /** The element the field's aria-describedby points at: what a screen reader reads with it. */
  function fieldDescription(): Element | null {
    const id = ageField().getAttribute('aria-describedby');
    return id ? page.querySelector(`[id="${id}"]`) : null;
  }

  it('asks for an age until one is entered', () => {
    expect(results()).toBe('Enter your age above to see the magic.');
    expect(page.querySelector('button')).toBeNull();
  });

  it('shows the dating range and the share button', () => {
    enterAge('21');

    const values = [...page.querySelectorAll('dd')].map(dd => dd.textContent);
    expect(values).toEqual(['17.5', '28']);
    expect(page.querySelector('button')?.textContent).toContain('Painting pixels');
  });

  it('waits for typing to pause, so "2" of "25" never shows as too young', async () => {
    vi.useFakeTimers();

    type('2');
    TestBed.tick();
    type('25');
    TestBed.tick();
    expect(results()).toBe('Enter your age above to see the magic.');

    // Async: the debounce resolves a promise once its timer fires.
    await vi.advanceTimersByTimeAsync(300);
    TestBed.tick();
    expect(results()).toContain('Your dating range');
    expect([...page.querySelectorAll('dd')].map(dd => dd.textContent)).toEqual(['19.5', '36']);
  });

  it('says when the rule has no range', () => {
    enterAge('10');

    expect(results()).toContain('Too young to date!');
    expect(page.querySelector('dd')).toBeNull();
  });

  it.each([
    ['150', 'Max age is 120! 🧛'],
    ['0', 'Enter an age from 1 to 120.'],
    ['25.5', 'Use whole years, like 25.'],
  ])('explains why %s is not an age, where screen readers hear it', (value, message) => {
    enterAge(value);

    expect(ageField().getAttribute('aria-invalid')).toBe('true');
    expect(fieldDescription()?.textContent?.trim()).toBe(message);
    expect(results()).toBe(message);
    expect(page.querySelector('dd')).toBeNull();
  });

  it('clears the error once the age is fixed', () => {
    enterAge('150');
    enterAge('30');

    expect(ageField().getAttribute('aria-invalid')).toBe('false');
    expect(fieldDescription()).toBeNull();
    expect(results()).not.toContain('Max age');
  });
});
