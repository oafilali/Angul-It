import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { CaptchaState } from '../captcha-state';

export const captchaCompleteGuard: CanActivateFn = (route, state) => {
  const captchaState = inject(CaptchaState);
  const router = inject(Router);

  // Check if all challenges are completed
  if (captchaState.areAllChallengesCompleted()) {
    return true;
  }

  // Redirect to captcha page if not completed
  console.warn('Access denied: Complete all challenges first');
  router.navigate(['/captcha']);
  return false;
};
