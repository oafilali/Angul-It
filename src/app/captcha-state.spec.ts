import { TestBed } from '@angular/core/testing';
import { CaptchaState, Challenge } from './captcha-state';

describe('CaptchaState', () => {
  let service: CaptchaState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaptchaState);
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with default challenges', (done) => {
      service.getChallenges().subscribe((challenges) => {
        expect(challenges.length).toBeGreaterThan(0);
        expect(challenges[0].isCompleted).toBe(false);
        done();
      });
    });

    it('should start at stage 0', (done) => {
      service.getCurrentStage().subscribe((stage) => {
        expect(stage).toBe(0);
        done();
      });
    });
  });

  describe('State Persistence', () => {
    it('should save state to localStorage', () => {
      const storageKey = 'angul-it-captcha-state';
      service.selectAnswer('test answer');

      const savedState = localStorage.getItem(storageKey);
      expect(savedState).toBeTruthy();

      const parsedState = JSON.parse(savedState!);
      expect(parsedState.challenges).toBeDefined();
      expect(parsedState.currentStage).toBeDefined();
    });

    it('should load state from localStorage', () => {
      // Save a state
      service.selectAnswer('test answer');
      service.goToNextStage();

      // Create new service instance (simulates page reload)
      const newService = new CaptchaState();

      expect(newService.getCurrentStageValue()).toBe(1);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('angul-it-captcha-state', 'corrupted data');

      const newService = new CaptchaState();
      expect(newService.getCurrentStageValue()).toBe(0);
    });
  });

  describe('Answer Selection and Validation', () => {
    it('should select answer for current challenge', (done) => {
      const testAnswer = 'AB3K9';
      service.selectAnswer(testAnswer);

      service.getChallenges().subscribe((challenges) => {
        expect(challenges[0].userAnswer).toBe(testAnswer);
        done();
      });
    });

    it('should validate correct answer', () => {
      const challenges = service.getChallengesValue();
      const correctAnswer = challenges[0].correctAnswer;

      service.selectAnswer(correctAnswer);
      const result = service.submitAnswer();

      expect(result).toBe(true);
      expect(service.getChallengesValue()[0].isCompleted).toBe(true);
    });

    it('should reject incorrect answer', () => {
      service.selectAnswer('wrong answer');
      const result = service.submitAnswer();

      expect(result).toBe(false);
      expect(service.getChallengesValue()[0].isCompleted).toBe(false);
    });

    it('should return false when no answer is selected', () => {
      const result = service.submitAnswer();
      expect(result).toBe(false);
    });
  });

  describe('Stage Navigation', () => {
    it('should navigate to next stage', () => {
      const initialStage = service.getCurrentStageValue();
      service.goToNextStage();

      expect(service.getCurrentStageValue()).toBe(initialStage + 1);
    });

    it('should navigate to previous stage', () => {
      service.goToNextStage();
      service.goToPreviousStage();

      expect(service.getCurrentStageValue()).toBe(0);
    });

    it('should not go below stage 0', () => {
      service.goToPreviousStage();
      expect(service.getCurrentStageValue()).toBe(0);
    });

    it('should not exceed maximum stage', () => {
      const maxStage = service.getChallengesValue().length - 1;

      for (let i = 0; i <= maxStage + 5; i++) {
        service.goToNextStage();
      }

      expect(service.getCurrentStageValue()).toBeLessThanOrEqual(maxStage);
    });
  });

  describe('Challenge Completion', () => {
    it('should return false when not all challenges are completed', () => {
      expect(service.areAllChallengesCompleted()).toBe(false);
    });

    it('should return true when all challenges are completed', () => {
      const challenges = service.getChallengesValue();

      challenges.forEach((challenge, index) => {
        service.selectAnswer(challenge.correctAnswer);
        service.submitAnswer();
        if (index < challenges.length - 1) {
          service.goToNextStage();
        }
      });

      expect(service.areAllChallengesCompleted()).toBe(true);
    });
  });

  describe('State Reset', () => {
    it('should reset state and clear localStorage', () => {
      service.selectAnswer('test');
      service.goToNextStage();

      service.resetState();

      expect(service.getCurrentStageValue()).toBe(0);
      expect(service.getChallengesValue()[0].userAnswer).toBeUndefined();
      expect(service.getChallengesValue()[0].isCompleted).toBe(false);
    });

    it('should clear storage', () => {
      service.selectAnswer('test');
      service.clearStorage();

      const savedState = localStorage.getItem('angul-it-captcha-state');
      expect(savedState).toBeNull();
    });
  });
});
