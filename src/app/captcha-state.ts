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
    const challenges: Challenge[] = [];

    // 1. Create a random math problem
    let num1, num2, operator;
    const operators = ['+', '-', '*'];
    operator = operators[Math.floor(Math.random() * operators.length)];

    if (operator === '*') {
      num1 = Math.floor(Math.random() * (10 - 2 + 1)) + 2; // 2-10
      num2 = Math.floor(Math.random() * (10 - 2 + 1)) + 2; // 2-10
    } else {
      num1 = Math.floor(Math.random() * 20) + 1; // 1-20
      num2 = Math.floor(Math.random() * 20) + 1; // 1-20
    }

    let correctAnswer;
    switch (operator) {
      case '+':
        correctAnswer = num1 + num2;
        break;
      case '-':
        correctAnswer = num1 - num2;
        break;
      case '*':
        correctAnswer = num1 * num2;
        break;
    }
    challenges.push({
      id: 1,
      type: 'math',
      question: `${num1} ${operator} ${num2}`,
      correctAnswer: String(correctAnswer),
      isCompleted: false,
    });

    // 2. Create a random text challenge with random chars, 1 number, 1 symbol
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    let randomTextArray = [];

    // Add random characters
    for (let i = 0; i < 4; i++) { // 4 random chars
      randomTextArray.push(chars.charAt(Math.floor(Math.random() * chars.length)));
    }
    // Add one random number
    randomTextArray.push(numbers.charAt(Math.floor(Math.random() * numbers.length)));
    // Add one random symbol
    randomTextArray.push(symbols.charAt(Math.floor(Math.random() * symbols.length)));

    // Shuffle the array to mix characters, number, and symbol
    for (let i = randomTextArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [randomTextArray[i], randomTextArray[j]] = [randomTextArray[j], randomTextArray[i]];
    }
    const randomText = randomTextArray.join('');

    challenges.push({
      id: 2,
      type: 'text',
      question: randomText,
      correctAnswer: randomText,
      isCompleted: false,
    });

    // 3. Create a second random math problem
    let num3, num4, operator2;
    operator2 = operators[Math.floor(Math.random() * operators.length)];

    if (operator2 === '*') {
      num3 = Math.floor(Math.random() * (10 - 2 + 1)) + 2; // 2-10
      num4 = Math.floor(Math.random() * (10 - 2 + 1)) + 2; // 2-10
    } else {
      num3 = Math.floor(Math.random() * 20) + 1; // 1-20
      num4 = Math.floor(Math.random() * 20) + 1; // 1-20
    }

    let correctAnswer2;
    switch (operator2) {
      case '+':
        correctAnswer2 = num3 + num4;
        break;
      case '-':
        correctAnswer2 = num3 - num4;
        break;
      case '*':
        correctAnswer2 = num3 * num4;
        break;
    }
    challenges.push({
      id: 3,
      type: 'math',
      question: `${num3} ${operator2} ${num4}`,
      correctAnswer: String(correctAnswer2),
      isCompleted: false,
    });

    // Shuffle the challenges array to randomize their order
    for (let i = challenges.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [challenges[i], challenges[j]] = [challenges[j], challenges[i]];
    }

    this.challengesSubject.next(challenges);
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
