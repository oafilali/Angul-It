import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './home/home';
import { Captcha } from './captcha/captcha';
import { Result } from './result/result';
import { authGuard } from './auth-guard';

const routes: Routes = [
  { path: '', component: Home },
  { path: 'captcha', component: Captcha },
  { path: 'result', component: Result, canActivate: [authGuard] },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }