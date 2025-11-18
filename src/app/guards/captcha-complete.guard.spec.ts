import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { captchaCompleteGuard } from './captcha-complete.guard';
import { CaptchaState } from '../captcha-state';

describe('captchaCompleteGuard', () => {
  let mockCaptchaState: jasmine.SpyObj<CaptchaState>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    mockCaptchaState = jasmine.createSpyObj('CaptchaState', ['areAllChallengesCompleted']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: CaptchaState, useValue: mockCaptchaState },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  it('should allow access when all challenges are completed', () => {
    mockCaptchaState.areAllChallengesCompleted.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() => captchaCompleteGuard({} as any, {} as any));

    expect(result).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should deny access and redirect when challenges are incomplete', () => {
    mockCaptchaState.areAllChallengesCompleted.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() => captchaCompleteGuard({} as any, {} as any));

    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/captcha']);
  });
});
