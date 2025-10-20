import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CaptchaState, Challenge } from '../captcha-state';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result.html',
  styleUrls: ['./result.scss']
})
export class Result implements OnInit {
  challenges$: Observable<Challenge[]>;

  constructor(private captchaState: CaptchaState, private router: Router) {
    this.challenges$ = this.captchaState.getChallenges();
  }

  ngOnInit() {
  }

  newChallenge() {
    this.captchaState.resetState();
    this.router.navigate(['/captcha']);
  }
}
