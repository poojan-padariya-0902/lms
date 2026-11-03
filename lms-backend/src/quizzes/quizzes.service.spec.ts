import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { QuizzesService } from './quizzes.service';
import { Quiz } from './schemas/quiz.schema';
import { Submission } from './schemas/submission.schema';
import { CoursesService } from '../courses/courses.service';
import { UsersService } from '../users/users.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { AppEventsService } from '../common/events/app-events.service';

describe('QuizzesService', () => {
  let service: QuizzesService;

  const mockQuizModel = {
    create: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockSubmissionModel = {
    create: jest.fn(),
    find: jest.fn(),
  };

  const mockCoursesService = {
    findOne: jest.fn(),
  };

  const mockUsersService = {
    findOne: jest.fn(),
  };

  const mockEnrollmentsService = {
    isStudentEnrolled: jest.fn(),
  };

  const mockEventsService = {
    emitEvent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizzesService,
        {
          provide: getModelToken(Quiz.name),
          useValue: mockQuizModel,
        },
        {
          provide: getModelToken(Submission.name),
          useValue: mockSubmissionModel,
        },
        {
          provide: CoursesService,
          useValue: mockCoursesService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: EnrollmentsService,
          useValue: mockEnrollmentsService,
        },
        {
          provide: AppEventsService,
          useValue: mockEventsService,
        },
      ],
    }).compile();

    service = module.get<QuizzesService>(QuizzesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('submitQuiz', () => {
    it('should correctly grade a quiz and return passed status when score >= passing threshold', async () => {
      mockUsersService.findOne.mockResolvedValue({ _id: 'user_123', uuid: 'user-uuid' });
      mockQuizModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            _id: 'quiz_123',
            title: 'NestJS Basics',
            course: 'course_123',
            passingScorePercentage: 70,
            questions: [
              { questionText: 'Q1', correctOptionIndex: 1 },
              { questionText: 'Q2', correctOptionIndex: 0 },
            ],
          }),
        }),
      });
      mockEnrollmentsService.isStudentEnrolled.mockResolvedValue(true);
      mockSubmissionModel.create.mockResolvedValue({
        uuid: 'sub-uuid',
        submittedAt: new Date(),
      });

      const result = await service.submitQuiz('quiz-uuid', 'user-uuid', {
        selectedAnswers: [1, 0], // 100% correct
      });

      expect(result.scorePercentage).toBe(100);
      expect(result.correctAnswers).toBe(2);
      expect(result.isPassed).toBe(true);
      expect(mockEventsService.emitEvent).toHaveBeenCalled();
    });
  });
});

