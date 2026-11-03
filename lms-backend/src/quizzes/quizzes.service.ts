import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quiz, QuizDocument } from './schemas/quiz.schema';
import { Submission, SubmissionDocument } from './schemas/submission.schema';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { CoursesService } from '../courses/courses.service';
import { UsersService } from '../users/users.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import {
  AppEventsService,
  AppEventType,
} from '../common/events/app-events.service';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectModel(Quiz.name)
    private readonly quizModel: Model<QuizDocument>,
    @InjectModel(Submission.name)
    private readonly submissionModel: Model<SubmissionDocument>,
    private readonly coursesService: CoursesService,
    private readonly usersService: UsersService,
    private readonly enrollmentsService: EnrollmentsService,
    private readonly eventsService: AppEventsService,
  ) {}

  async create(dto: CreateQuizDto): Promise<Quiz> {
    const course = await this.coursesService.findOne(dto.courseUuid);

    const { courseUuid, ...quizData } = dto;
    const createdQuiz = await this.quizModel.create({
      ...quizData,
      course: (course as any)._id,
    });

    return await this.findOne(createdQuiz.uuid);
  }

  async findByCourse(courseUuid: string): Promise<Quiz[]> {
    const course = await this.coursesService.findOne(courseUuid);

    return await this.quizModel
      .find({ course: (course as any)._id })
      .populate('course')
      .exec();
  }

  async findOne(uuid: string): Promise<Quiz> {
    const quiz = await this.quizModel
      .findOne({ uuid })
      .populate('course')
      .exec();

    if (!quiz) {
      throw new NotFoundException(`Quiz with UUID ${uuid} not found`);
    }

    return quiz;
  }

  /**
   * Automated grading engine:
   * Selects hidden correctOptionIndex, validates answers, computes score & pass/fail status
   */
  async submitQuiz(uuid: string, userUuid: string, dto: SubmitQuizDto) {
    const student = await this.usersService.findOne(userUuid);
    const quiz = await this.quizModel
      .findOne({ uuid })
      .select('+questions.correctOptionIndex')
      .exec();

    if (!quiz) {
      throw new NotFoundException(`Quiz with UUID ${uuid} not found`);
    }

    // Verify student is enrolled in the parent course
    const isEnrolled = await this.enrollmentsService.isStudentEnrolled(
      (student as any)._id,
      quiz.course,
    );

    if (!isEnrolled) {
      throw new ForbiddenException(
        'You must be enrolled in this course to submit this quiz',
      );
    }

    if (dto.selectedAnswers.length !== quiz.questions.length) {
      throw new BadRequestException(
        `Answer count mismatch: expected ${quiz.questions.length} answers, but received ${dto.selectedAnswers.length}`,
      );
    }

    // Grade submission
    let correctCount = 0;
    quiz.questions.forEach((question, index) => {
      if (dto.selectedAnswers[index] === (question as any).correctOptionIndex) {
        correctCount++;
      }
    });

    const scorePercentage = Math.round(
      (correctCount / quiz.questions.length) * 100,
    );
    const isPassed = scorePercentage >= quiz.passingScorePercentage;

    const submission = await this.submissionModel.create({
      student: (student as any)._id,
      quiz: (quiz as any)._id,
      course: quiz.course,
      selectedAnswers: dto.selectedAnswers,
      scorePercentage,
      isPassed,
      submittedAt: new Date(),
    });

    if (isPassed) {
      this.eventsService.emitEvent(AppEventType.QUIZ_PASSED, {
        studentUuid: userUuid,
        quizTitle: quiz.title,
        scorePercentage,
      });
    }

    return {
      submissionUuid: submission.uuid,
      quizTitle: quiz.title,
      totalQuestions: quiz.questions.length,
      correctAnswers: correctCount,
      scorePercentage,
      passingScorePercentage: quiz.passingScorePercentage,
      isPassed,
      submittedAt: submission.submittedAt,
    };
  }

  async getMySubmissions(quizUuid: string, userUuid: string) {
    const student = await this.usersService.findOne(userUuid);
    const quiz = await this.findOne(quizUuid);

    return await this.submissionModel
      .find({
        quiz: (quiz as any)._id,
        student: (student as any)._id,
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async delete(uuid: string): Promise<{ message: string }> {
    const result = await this.quizModel.deleteOne({ uuid }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Quiz with UUID ${uuid} not found`);
    }
    return { message: `Quiz with UUID ${uuid} has been deleted` };
  }
}
