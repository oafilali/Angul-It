import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Challenge {
  id: number;
  type: 'math' | 'text';
  question: string;
  correctAnswer: string;
  userAnswer: string | null;
  completed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CaptchaState {
  private readonly state$ = new BehaviorSubject<Challenge[]>(this.loadState());
  private readonly currentStage$ = new BehaviorSubject<number>(this.loadCurrentStage());

  constructor() {
    this.state$.subscribe(state => this.saveState(state));
    this.currentStage$.subscribe(stage => this.saveCurrentStage(stage));
  }

  // --- Private Methods for Challenge Generation ---

  private generateMathChallenge(id: number): Challenge {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    return {
      id: id,
      type: 'math',
      question: `What is ${num1} + ${num2}?`,
      correctAnswer: String(num1 + num2),
      userAnswer: null,
      completed: false,
    };
  }

  private generateTextChallenge(id: number): Challenge {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return {
      id: id,
      type: 'text',
      question: `Type this: ${result}`,
      correctAnswer: result,
      userAnswer: null,
      completed: false,
    };
  }

  private generateNewChallengeSet(): Challenge[] {
    const challenges: Challenge[] = [];
    challenges.push(this.generateMathChallenge(0)); // Temporary ID
    challenges.push(this.generateMathChallenge(0)); // Temporary ID
    challenges.push(this.generateTextChallenge(0)); // Temporary ID

    // Shuffle the challenges to randomize their order
    for (let i = challenges.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [challenges[i], challenges[j]] = [challenges[j], challenges[i]];
    }

    // Reassign IDs after shuffling to maintain sequential IDs
    return challenges.map((challenge, index) => ({ ...challenge, id: index + 1 }));
  }

  // --- State Selectors ---

  getChallenges() {
    return this.state$.asObservable();
  }

  getCurrentStage() {
    return this.currentStage$.asObservable();
  }

  getCurrentChallenge() {
    const stage = this.currentStage$.value;
    const challenges = this.state$.value;
    return challenges[stage];
  }

  // --- Actions ---

  selectAnswer(answer: string) {
    const stage = this.currentStage$.value;
    const state = this.state$.value;
    const challenge = state[stage];
    if (challenge) {
      challenge.userAnswer = answer;
      this.state$.next([...state]);
    }
  }

  submitAnswer(): boolean {
    const stage = this.currentStage$.value;
    const state = this.state$.value;
    const challenge = state[stage];
    if (challenge && challenge.userAnswer === challenge.correctAnswer) {
      challenge.completed = true;
      this.state$.next([...state]);
      return true;
    }
    return false;
  }

  goToNextStage() {
    if (this.currentStage$.value < this.state$.value.length - 1) {
      this.currentStage$.next(this.currentStage$.value + 1);
    }
  }

  goToPreviousStage() {
    if (this.currentStage$.value > 0) {
      this.currentStage$.next(this.currentStage$.value - 1);
    }
  }

  areAllChallengesCompleted() {
    return this.state$.value.every(c => c.completed);
  }

  resetState() {
    const newState = this.generateNewChallengeSet();
    this.state$.next(newState);
    this.currentStage$.next(0);
    this.saveState(newState);
    this.saveCurrentStage(0);
  }

  // --- Persistence ---

  private saveState(state: Challenge[]) {
    localStorage.setItem('captcha_state', JSON.stringify(state));
  }

  private loadState(): Challenge[] {
    const savedState = localStorage.getItem('captcha_state');
    if (savedState) {
      return JSON.parse(savedState);
    }
    return this.generateNewChallengeSet();
  }

  private saveCurrentStage(stage: number) {
    localStorage.setItem('captcha_stage', String(stage));
  }

  private loadCurrentStage(): number {
    const savedStage = localStorage.getItem('captcha_stage');
    return savedStage ? parseInt(savedStage, 10) : 0;
  }
}