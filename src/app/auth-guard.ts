import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CaptchaState } from './captcha-state';

export const authGuard: CanActivateFn = (route, state) => {
  const captchaState = inject(CaptchaState);
  const router = inject(Router);

  if (captchaState.areAllChallengesCompleted()) {
    return true;
  } else {
    router.navigate(['/captcha']);
    return false;
  }
};
