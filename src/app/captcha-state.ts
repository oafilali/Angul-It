import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Challenge {
  id: number;
  type: 'math' | 'text';
  question: string;
  correctAnswer: string;
  userAnswer?: string;
  isCompleted?: boolean;
}

interface CaptchaStateData {
  challenges: Challenge[];
  currentStage: number;
}

@Injectable({
  providedIn: 'root',
})
export class CaptchaState {
  private readonly STORAGE_KEY = 'angul-it-captcha-state';
  private challengesSubject = new BehaviorSubject<Challenge[]>([]);
  private currentStageSubject = new BehaviorSubject<number>(0);

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const savedState = localStorage.getItem(this.STORAGE_KEY);
      if (savedState) {
        const state: CaptchaStateData = JSON.parse(savedState);
        this.challengesSubject.next(state.challenges);
        this.currentStageSubject.next(state.currentStage);
      } else {
        this.initializeDefaultChallenges();
      }
    } catch (error) {
      console.error('Error loading state from localStorage:', error);
      this.initializeDefaultChallenges();
    }
  }

  private saveToStorage(): void {
    try {
      const state: CaptchaStateData = {
        challenges: this.challengesSubject.value,
        currentStage: this.currentStageSubject.value,
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving state to localStorage:', error);
    }
  }

  private initializeDefaultChallenges(): void {
    const defaultChallenges: Challenge[] = [
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
      {
        id: 3,
        type: 'math',
        question: '15 - 8',
        correctAnswer: '7',
        isCompleted: false,
      },
    ];
    this.challengesSubject.next(defaultChallenges);
    this.currentStageSubject.next(0);
    this.saveToStorage();
  }

  // Observable getters
  getChallenges(): Observable<Challenge[]> {
    return this.challengesSubject.asObservable();
  }

  getCurrentStage(): Observable<number> {
    return this.currentStageSubject.asObservable();
  }

  // Sync getters for tests
  getChallengesValue(): Challenge[] {
    return this.challengesSubject.value;
  }

  getCurrentStageValue(): number {
    return this.currentStageSubject.value;
  }

  selectAnswer(answer: string): void {
    const challenges = this.challengesSubject.value;
    const currentStage = this.currentStageSubject.value;

    if (challenges[currentStage]) {
      challenges[currentStage].userAnswer = answer;
      this.challengesSubject.next([...challenges]);
      this.saveToStorage();
    }
  }

  submitAnswer(): boolean {
    const challenges = this.challengesSubject.value;
    const currentStage = this.currentStageSubject.value;
    const currentChallenge = challenges[currentStage];

    if (!currentChallenge || !currentChallenge.userAnswer) {
      return false;
    }

    const isCorrect =
      currentChallenge.userAnswer.trim().toLowerCase() ===
      currentChallenge.correctAnswer.trim().toLowerCase();

    if (isCorrect) {
      challenges[currentStage].isCompleted = true;
      this.challengesSubject.next([...challenges]);
      this.saveToStorage();
    }

    return isCorrect;
  }

  goToNextStage(): void {
    const currentStage = this.currentStageSubject.value;
    const challenges = this.challengesSubject.value;

    if (currentStage < challenges.length - 1) {
      this.currentStageSubject.next(currentStage + 1);
      this.saveToStorage();
    }
  }

  goToPreviousStage(): void {
    const currentStage = this.currentStageSubject.value;

    if (currentStage > 0) {
      this.currentStageSubject.next(currentStage - 1);
      this.saveToStorage();
    }
  }

  areAllChallengesCompleted(): boolean {
    return this.challengesSubject.value.every((c) => c.isCompleted);
  }

  resetState(): void {
    this.initializeDefaultChallenges();
  }

  clearStorage(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
