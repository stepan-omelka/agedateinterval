import { Component, computed, signal } from '@angular/core';
import { FormField, form, max, min, validate } from '@angular/forms/signals';
import { type DatingRange, MAX_AGE, MIN_AGE, datingRange } from '@shared/dating-range';
import { RangeCard } from './range-card/range-card';
import { ShareButton } from './share-button/share-button';

type Result =
  | { kind: 'empty' }
  | { kind: 'invalid'; message: string }
  | { kind: 'too-young' }
  | { kind: 'range'; age: number; range: DatingRange };

@Component({
  selector: 'app-root',
  imports: [FormField, RangeCard, ShareButton],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly minAge = MIN_AGE;

  private readonly model = signal<{ age: number | null }>({ age: null });

  protected readonly ageForm = form(this.model, path => {
    min(path.age, 1, { message: `Enter an age from 1 to ${MAX_AGE}.` });
    max(path.age, MAX_AGE, { message: `Max age is ${MAX_AGE}! 🧛` });
    validate(path.age, ({ value }) => {
      const age = value();
      return age === null || Number.isInteger(age)
        ? undefined
        : { kind: 'wholeYears', message: 'Use whole years, like 25.' };
    });
  });

  protected readonly result = computed<Result>(() => {
    const field = this.ageForm.age();
    if (field.invalid()) {
      // A parse error (such as "1e") comes from the browser and has no message.
      return { kind: 'invalid', message: field.errors()[0]?.message ?? 'Enter your age in years.' };
    }
    const age = field.value();
    if (age === null) {
      return { kind: 'empty' };
    }
    const range = datingRange(age);
    return range ? { kind: 'range', age, range } : { kind: 'too-young' };
  });
}
