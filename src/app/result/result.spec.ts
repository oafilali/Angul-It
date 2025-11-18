import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Result } from './result';
import { CaptchaState, Challenge } from '../captcha-state';

describe('Result Component', () => {
  let component: Result;
  let fixture: ComponentFixture<Result>;
  let mockCaptchaState: jasmine.SpyObj<CaptchaState>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockChallenges: Challenge[] = [
    {
      id: 1,
      type: 'math',
      question: '7 + 5',
      correctAnswer: '12',
      userAnswer: '12',
      isCompleted: true,
    },
    {
      id: 2,
      type: 'text',
      question: 'VERIFY',
      correctAnswer: 'VERIFY',
      userAnswer: 'VERIFY',
      isCompleted: true,
    },
  ];

  beforeEach(async () => {
    mockCaptchaState = jasmine.createSpyObj('CaptchaState', ['getChallenges', 'resetState']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockCaptchaState.getChallenges.and.returnValue(of(mockChallenges));

    await TestBed.configureTestingModule({
      imports: [Result],
      providers: [
        { provide: CaptchaState, useValue: mockCaptchaState },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Result);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load challenges on init', (done) => {
    component.challenges$.subscribe((challenges) => {
      expect(challenges).toEqual(mockChallenges);
      expect(challenges.length).toBe(2);
      done();
    });
  });

  it('should reset state and navigate on new challenge', () => {
    component.newChallenge();

    expect(mockCaptchaState.resetState).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/captcha']);
  });
});
