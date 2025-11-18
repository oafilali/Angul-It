import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { Captcha } from './captcha';
import { CaptchaState, Challenge } from '../captcha-state';

describe('Captcha Component', () => {
  let component: Captcha;
  let fixture: ComponentFixture<Captcha>;
  let mockCaptchaState: jasmine.SpyObj<CaptchaState>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockChallenges: Challenge[] = [
    {
      id: 1,
      type: 'math',
      question: '7 + 5',
      correctAnswer: '12',
      isCompleted: false,
    },
    {
      id: 2,
      type: 'text',
      question: 'VERIFY',
      correctAnswer: 'VERIFY',
      isCompleted: false,
    },
  ];

  beforeEach(async () => {
    mockCaptchaState = jasmine.createSpyObj('CaptchaState', [
      'getChallenges',
      'getCurrentStage',
      'selectAnswer',
      'submitAnswer',
      'goToNextStage',
      'goToPreviousStage',
      'areAllChallengesCompleted',
      'resetState',
    ]);

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockCaptchaState.getChallenges.and.returnValue(of(mockChallenges));
    mockCaptchaState.getCurrentStage.and.returnValue(of(0));
    mockCaptchaState.areAllChallengesCompleted.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [Captcha, ReactiveFormsModule, BrowserAnimationsModule],
      providers: [
        { provide: CaptchaState, useValue: mockCaptchaState },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Captcha);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with empty answer', () => {
      expect(component.answerForm).toBeDefined();
      // Change this line - form starts with null when reset
      expect(component.answerForm.get('answer')?.value).toBeNull();
    });

    it('should have required validator on answer field', () => {
      const answerControl = component.answerForm.get('answer');
      answerControl?.setValue('');

      expect(answerControl?.hasError('required')).toBe(true);
    });
  });

  describe('Answer Selection', () => {
    it('should select answer and update form', () => {
      const testAnswer = 'AB3K9';
      component.selectAnswer(testAnswer);

      expect(component.answerForm.get('answer')?.value).toBe(testAnswer);
      expect(mockCaptchaState.selectAnswer).toHaveBeenCalledWith(testAnswer);
      expect(component.error).toBeNull();
    });

    it('should clear submitted flag when selecting new answer', () => {
      component.submitted = true;
      component.selectAnswer('test');

      expect(component.submitted).toBe(false);
    });

    it('should update answer when user types', () => {
      const testAnswer = '12';
      component.answerForm.patchValue({ answer: testAnswer });
      component.selectAnswer(testAnswer);

      expect(mockCaptchaState.selectAnswer).toHaveBeenCalledWith(testAnswer);
      expect(component.error).toBeNull();
    });
  });

  describe('Answer Submission', () => {
    it('should show error when submitting without selection', () => {
      component.submitAnswer();

      expect(component.submitted).toBe(true);
      expect(component.error).toBe('Please enter an answer before submitting.');
    });

    it('should submit correct answer successfully', () => {
      mockCaptchaState.submitAnswer.and.returnValue(true);
      component.answerForm.patchValue({ answer: '12' });

      component.submitAnswer();

      expect(mockCaptchaState.submitAnswer).toHaveBeenCalled();
      expect(component.error).toBeNull();
    });

    it('should show error for incorrect answer', () => {
      mockCaptchaState.submitAnswer.and.returnValue(false);
      component.answerForm.patchValue({ answer: 'wrong' });

      component.submitAnswer();

      expect(component.error).toBe('Incorrect answer. Please try again.');
    });
  });

  describe('Stage Navigation', () => {
    it('should navigate to next stage when current is completed', () => {
      component.currentChallenge = { ...mockChallenges[0], isCompleted: true };

      component.nextStage();

      expect(mockCaptchaState.goToNextStage).toHaveBeenCalled();
      expect(component.error).toBeNull();
    });

    it('should show error when trying to proceed without completing challenge', () => {
      component.currentChallenge = { ...mockChallenges[0], isCompleted: false };

      component.nextStage();

      expect(mockCaptchaState.goToNextStage).not.toHaveBeenCalled();
      expect(component.error).toBe('Please complete the current challenge before proceeding.');
    });

    it('should navigate to previous stage', () => {
      component.previousStage();

      expect(mockCaptchaState.goToPreviousStage).toHaveBeenCalled();
    });
  });

  describe('Challenge Completion', () => {
    it('should navigate to results when all challenges completed', () => {
      mockCaptchaState.areAllChallengesCompleted.and.returnValue(true);

      component.finish();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/result']);
    });

    it('should show error when trying to finish incomplete challenges', () => {
      mockCaptchaState.areAllChallengesCompleted.and.returnValue(false);

      component.finish();

      expect(mockRouter.navigate).not.toHaveBeenCalled();
      expect(component.error).toBe('Please complete all challenges before finishing.');
    });
  });

  describe('SVG CAPTCHA Generation', () => {
    it('should generate SVG characters', () => {
      component.currentChallenge = mockChallenges[0];
      component['generateSvgCaptcha']('TEST');

      expect(component.svgChars.length).toBeGreaterThan(0);
      expect(component.svgChars[0].char).toBeDefined();
    });

    it('should generate background noise', () => {
      component['generateSvgCaptcha']('TEST');

      expect(component.svgNoises.length).toBeGreaterThan(0);
    });
  });

  describe('Component Cleanup', () => {
    it('should unsubscribe on destroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });
});
