import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter } from 'node:events';

export enum AppEventType {
  ENROLLMENT_CREATED = 'enrollment.created',
  COURSE_COMPLETED = 'course.completed',
  QUIZ_PASSED = 'quiz.passed',
}

export interface EnrollmentCreatedPayload {
  studentUuid: string;
  courseTitle: string;
  enrolledAt: Date;
}

export interface QuizPassedPayload {
  studentUuid: string;
  quizTitle: string;
  scorePercentage: number;
}

@Injectable()
export class AppEventsService extends EventEmitter {
  private readonly logger = new Logger(AppEventsService.name);

  emitEvent(event: AppEventType, payload: any): boolean {
    this.logger.log(`[Event Dispatched] ${event} with payload: ${JSON.stringify(payload)}`);
    return this.emit(event, payload);
  }
}

