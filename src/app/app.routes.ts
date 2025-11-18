import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Captcha } from './captcha/captcha';
import { Result } from './result/result';
import { captchaCompleteGuard } from './guards/captcha-complete.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'captcha', component: Captcha },
  {
    path: 'result',
    component: Result,
    canActivate: [captchaCompleteGuard],
  },
  { path: '**', redirectTo: '' },
];
