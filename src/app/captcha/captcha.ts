import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, combineLatest, Subject } from 'rxjs';
import { distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { CaptchaState, Challenge } from '../captcha-state';
import { trigger, transition, style, animate, query, group } from '@angular/animations';

const fadeAnimation = trigger('fadeAnimation', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
        }),
      ],
      { optional: true }
    ),
    query(':enter', [style({ opacity: 0 })], { optional: true }),
    group([
      query(':leave', [animate('600ms ease-out', style({ opacity: 0 }))], { optional: true }),
      query(':enter', [animate('600ms ease-out', style({ opacity: 1 }))], { optional: true }),
    ]),
  ]),
]);

interface SvgChar {
  char: string;
  x: number;
  y: number;
  rotate: number;
  color: string;
  fontSize: number;
  stroke: string;
}

interface SvgNoise {
  type: 'line' | 'circle';
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  cx?: number;
  cy?: number;
  r?: number;
  stroke?: string;
  fill?: string;
}

@Component({
  selector: 'app-captcha',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './captcha.html',
  styleUrls: ['./captcha.scss'],
  animations: [fadeAnimation],
})
export class Captcha implements OnInit, OnDestroy {
  challenges$: Observable<Challenge[]>;
  currentStage$: Observable<number>;
  currentChallenge: Challenge | undefined;
  allChallengesCompleted = false;
  error: string | null = null;

  // Reactive Form
  answerForm!: FormGroup;
  submitted = false;

  svgChars: SvgChar[] = [];
  svgNoises: SvgNoise[] = [];

  svgWidth = 300;
  svgHeight = 80;
  padding = 15;
  svgBackgroundColor: string = '#f9f9f9';

  private destroy$ = new Subject<void>();

  constructor(public captchaState: CaptchaState, private router: Router, private fb: FormBuilder) {
    this.challenges$ = this.captchaState.getChallenges();
    this.currentStage$ = this.captchaState.getCurrentStage();

    // Initialize form with validation
    this.answerForm = this.fb.group({
      answer: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    combineLatest([this.currentStage$, this.challenges$])
      .pipe(
        map(([stage, challenges]) => challenges[stage]),
        distinctUntilChanged((prev, curr) => prev?.id === curr?.id),
        takeUntil(this.destroy$)
      )
      .subscribe((currentChallenge) => {
        if (currentChallenge) {
          this.currentChallenge = currentChallenge;
          this.allChallengesCompleted = this.captchaState.areAllChallengesCompleted();
          this.error = null;
          this.submitted = false;

          // Reset form and pre-fill if user already answered
          this.answerForm.reset();
          if (currentChallenge.userAnswer) {
            this.answerForm.patchValue({ answer: currentChallenge.userAnswer });
          }

          this.generateSvgCaptcha(this.currentChallenge.question);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private generateSvgCaptcha(question: string) {
    this.svgChars = [];
    this.svgNoises = [];

    this.svgBackgroundColor = `hsl(${Math.random() * 360}, 100%, 95%)`;

    const chars = question.replace(/ /g, '');
    const effectiveWidth = this.svgWidth - 2 * this.padding;
    const effectiveHeight = this.svgHeight - 2 * this.padding;
    const baseFontSize = 25;
    const fontSizeRange = 10;

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const fontSize = baseFontSize + (Math.random() * fontSizeRange - fontSizeRange / 2);
      const rotate = Math.random() * 30 - 15;
      const color = `hsl(${Math.random() * 360}, 70%, 40%)`;
      const stroke = `hsl(${Math.random() * 360}, 50%, 60%)`;

      let x = this.padding + (i * effectiveWidth) / chars.length + (Math.random() * 10 - 5);
      x = Math.max(this.padding, Math.min(this.svgWidth - this.padding - fontSize * 0.6, x));

      let y = this.padding + fontSize + Math.random() * (effectiveHeight - fontSize);
      y = Math.max(this.padding + fontSize * 0.8, Math.min(this.svgHeight - this.padding, y));

      this.svgChars.push({ char, x, y, rotate, color, fontSize, stroke });
    }

    for (let i = 0; i < 10; i++) {
      const noiseX1 = this.padding + Math.random() * effectiveWidth;
      const noiseY1 = this.padding + Math.random() * effectiveHeight;
      const noiseX2 = this.padding + Math.random() * effectiveWidth;
      const noiseY2 = this.padding + Math.random() * effectiveHeight;

      this.svgNoises.push({
        type: 'line',
        x1: noiseX1,
        y1: noiseY1,
        x2: noiseX2,
        y2: noiseY2,
        stroke: `hsl(${Math.random() * 360}, 50%, 70%, 0.5)`,
      });
    }
  }

  selectAnswer(answer: string) {
    this.error = null;
    this.submitted = false;
    this.captchaState.selectAnswer(answer);
  }

  submitAnswer() {
    this.submitted = true;
    this.error = null;

    // Validate form
    if (this.answerForm.invalid) {
      this.error = 'Please enter an answer before submitting.';
      return;
    }

    // Submit to state service
    const success = this.captchaState.submitAnswer();
    if (!success) {
      this.error = 'Incorrect answer. Please try again.';
      this.answerForm.setErrors({ incorrect: true });
    }
  }

  nextStage() {
    if (this.currentChallenge?.isCompleted) {
      this.captchaState.goToNextStage();
    } else {
      this.error = 'Please complete the current challenge before proceeding.';
    }
  }

  previousStage() {
    this.captchaState.goToPreviousStage();
  }

  finish() {
    if (this.captchaState.areAllChallengesCompleted()) {
      this.router.navigate(['/result']);
    } else {
      this.error = 'Please complete all challenges before finishing.';
    }
  }
}
