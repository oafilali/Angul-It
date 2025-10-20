import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CaptchaState } from '../captcha-state';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home {

  constructor(private captchaState: CaptchaState, private router: Router) { }

  startChallenge() {
    this.captchaState.resetState();
    this.router.navigate(['/captcha']);
  }
}
