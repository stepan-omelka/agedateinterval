import { Component, input } from '@angular/core';
import type { DatingRange } from '@shared/dating-range';

@Component({
  selector: 'app-range-card',
  template: `
    <h2 class="eyebrow">Your dating range</h2>
    <dl class="bounds">
      <div class="bound">
        <dt>Min</dt>
        <dd>{{ range().min }}</dd>
      </div>
      <div class="bound">
        <dt>Max</dt>
        <dd>{{ range().max }}</dd>
      </div>
    </dl>
    <p class="note">Based on the "half your age plus seven" rule</p>
  `,
  styleUrl: './range-card.scss',
})
export class RangeCard {
  readonly range = input.required<DatingRange>();
}
