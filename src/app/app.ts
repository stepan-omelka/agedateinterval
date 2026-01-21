import { Component, computed, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { bootstrapApplication } from '@angular/platform-browser';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDgjowruBs7794Hc1vkYKX649JDJLetLfw",
  authDomain: "dateageinterval.firebaseapp.com",
  projectId: "dateageinterval",
  storageBucket: "dateageinterval.firebasestorage.app",
  messagingSenderId: "466580000391",
  appId: "1:466580000391:web:dde82b25f8443f48ee3222"
};

try {
  const app = initializeApp(firebaseConfig);
} catch (e) {
  console.log("Firebase config placeholder");
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center p-4 font-sans text-slate-800">

      <!-- Main Card -->
      <div class="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-pink-500/20 relative">

        <!-- Toast Notification -->
        <div *ngIf="showToast()" class="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-fade-in z-50 flex items-center gap-2 w-max">
          <span>{{ toastMessage() }}</span>
        </div>

        <!-- Header -->
        <div class="bg-slate-50 p-6 text-center border-b border-slate-100">
          <h1 class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-2">
            Agedate
          </h1>
          <p class="text-slate-500 text-sm leading-relaxed">
            What age is it ok to date? Enter your age to find your socially acceptable dating interval!
          </p>
        </div>

        <!-- Input Section -->
        <div class="p-8 space-y-8">
          <div class="space-y-2">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
              Enter Your Age
            </label>
            <div class="relative group">
              <input
                #ageInput
                type="number"
                [ngModel]="userAge()"
                (ngModelChange)="onAgeChange($event)"
                (input)="checkInputLimit(ageInput)"
                placeholder="25"
                class="w-full text-center text-5xl font-black text-slate-700 bg-transparent border-b-4 border-slate-200 focus:border-pink-500 focus:outline-none transition-colors duration-300 py-4 placeholder-slate-200"
                min="0"
                max="120"
              />
              <div class="absolute right-4 top-1/2 -translate-y-1/2 text-pink-200 pointer-events-none group-focus-within:text-pink-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <!-- Validation Message -->
            <p *ngIf="userAge() === 120" class="text-[10px] text-pink-500 text-center font-bold animate-pulse">
              Max age reached! 🧛
            </p>
          </div>

          <!-- Results Section -->
          <div class="space-y-4">

            <!-- Case 1: Valid Age (>= 14) -->
            <div *ngIf="isValidAge() && (userAge() ?? 0) >= 14" class="animate-fade-in space-y-6">

              <!-- Result Display -->
              <div class="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-100 text-center relative overflow-hidden">
                <div class="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-pink-100 rounded-full opacity-50 blur-xl"></div>

                <p class="text-xs font-bold text-pink-400 uppercase tracking-widest mb-4">Your Dating Range</p>

                <div class="flex items-center justify-center space-x-4">
                  <!-- Min -->
                  <div class="flex flex-col">
                    <!-- Display logic handles string (decimal) or number -->
                    <span class="text-4xl font-bold text-slate-800">{{ minDate() }}</span>
                    <span class="text-xs text-slate-400">Min</span>
                  </div>

                  <!-- Dash -->
                  <div class="h-px w-8 bg-slate-300"></div>

                  <!-- Max -->
                  <div class="flex flex-col">
                    <span class="text-4xl font-bold text-slate-800">{{ maxDate() }}</span>
                    <span class="text-xs text-slate-400">Max</span>
                  </div>
                </div>

                <p class="mt-4 text-xs text-slate-400 italic">
                  Based on the "Half your age plus seven" rule
                </p>
              </div>

              <!-- Share Button -->
              <button
                (click)="shareVisual()"
                [disabled]="isGenerating()"
                class="w-full py-3 px-6 rounded-xl text-white font-bold shadow-lg transform active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-400 hover:shadow-pink-500/40 disabled:opacity-70 disabled:cursor-wait"
              >
                <span *ngIf="!isGenerating()">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                  </svg>
                  Share on Story
                </span>
                <span *ngIf="isGenerating()" class="flex items-center">
                  Painting Pixels...
                </span>
              </button>
            </div>

            <!-- Case 2: Too Young (< 14) -->
            <div *ngIf="isValidAge() && (userAge() ?? 0) < 14 && (userAge() ?? 0) > 0" class="bg-yellow-50 rounded-2xl p-6 border border-yellow-100 text-center animate-fade-in">
              <span class="text-3xl mb-2 block">🧸</span>
              <h3 class="font-bold text-yellow-700">Too young to date!</h3>
              <p class="text-sm text-yellow-600 mt-1">The rule breaks down mathematically below age 14.</p>
            </div>

            <!-- Case 3: Invalid Input -->
            <div *ngIf="!isValidAge()" class="text-center py-4 text-slate-400 text-sm">
              Enter your age above to see the magic.
            </div>

          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  `]
})
export class App {
  userAge = signal<number | null>(null);
  showToast = signal(false);
  toastMessage = signal('Image copied!');
  isGenerating = signal(false);

  // LOGIC UPDATE: Handles decimals for young ages
  minDate = computed(() => {
    const age = this.userAge();
    if (age === null || age === undefined) return 0;

    const val = (age / 2) + 7;

    // If age is 25 or under AND it results in a decimal, keep one decimal place
    // Otherwise round down to whole number for cleaner look
    if (age <= 25 && val % 1 !== 0) {
      return val.toFixed(1);
    }

    return Math.floor(val);
  });

  // LOGIC UPDATE: Caps max result at 120
  maxDate = computed(() => {
    const age = this.userAge();
    if (age === null || age === undefined) return 0;

    const val = (age - 7) * 2;
    // Cap at 120 years old
    return Math.min(val, 120);
  });

  isValidAge = computed(() => {
    const age = this.userAge();
    return age !== null && age > 0;
  });

  checkInputLimit(el: HTMLInputElement) {
    if (parseInt(el.value) > 120) {
      el.value = '120';
      this.userAge.set(120);
    }
  }

  onAgeChange(val: number) {
    if (val > 120) {
      this.userAge.set(120);
    } else if (val < 0) {
      this.userAge.set(0);
    } else {
      this.userAge.set(val);
    }
  }

  async shareVisual() {
    this.isGenerating.set(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      const size = 1080;
      canvas.width = size;
      canvas.height = size;

      // 1. Background
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, '#ec4899');
      gradient.addColorStop(1, '#8b5cf6');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      // 2. Card
      const cardW = 800;
      const cardH = 600;
      const cardX = (size - cardW) / 2;
      const cardY = (size - cardH) / 2;
      const cornerRadius = 60;

      ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
      ctx.shadowBlur = 50;
      ctx.shadowOffsetY = 20;

      ctx.fillStyle = '#ffffff';
      this.roundRect(ctx, cardX, cardY, cardW, cardH, cornerRadius);
      ctx.fill();
      ctx.shadowColor = "transparent";

      // 3. Content
      ctx.fillStyle = '#f472b6';
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '4px';
      ctx.fillText('MY DATING RANGE', size/2, cardY + 120);

      const min = this.minDate().toString(); // Ensure string for canvas
      const max = this.maxDate().toString();

      ctx.fillStyle = '#1e293b';
      // Reduced font slightly to 170px to accommodate decimals (like "17.5") safely
      ctx.font = '900 170px sans-serif';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = '-4px'; // Tighter spacing for numbers

      const centerY = size/2;
      const numberOffset = 210;

      ctx.fillText(min, size/2 - numberOffset, centerY);
      ctx.fillText(max, size/2 + numberOffset, centerY);

      // Divider
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(size/2, centerY - 80);
      ctx.lineTo(size/2, centerY + 80);
      ctx.stroke();

      // Labels
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 24px sans-serif';
      ctx.letterSpacing = '2px';
      ctx.fillText('MIN', size/2 - numberOffset, centerY + 130);
      ctx.fillText('MAX', size/2 + numberOffset, centerY + 130);

      // Footer
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'italic 24px sans-serif';
      ctx.fillText('agedate app', size/2, cardY + cardH - 50);

      // URL
      const currentHost = window.location.hostname;
      if (currentHost && currentHost !== 'localhost') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = 'bold 24px sans-serif';
        ctx.letterSpacing = '1px';
        ctx.fillText(currentHost, size/2, size - 60);
      }

      // 4. Export
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Image generation failed');

        const file = new File([blob], 'agedate.png', { type: 'image/png' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Agedate',
            text: 'Check my dating range!'
          });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'agedate-story.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          this.toastMessage.set('Image downloaded!');
          this.triggerToast();
        }
        this.isGenerating.set(false);
      }, 'image/png');

    } catch (err) {
      console.error(err);
      this.toastMessage.set('Error generating image');
      this.triggerToast();
      this.isGenerating.set(false);
    }
  }

  roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  triggerToast() {
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }
}

bootstrapApplication(App);
