import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  AppEventsService,
  AppEventType,
  EnrollmentCreatedPayload,
  QuizPassedPayload,
} from '../common/events/app-events.service';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly eventsService: AppEventsService) {}

  onModuleInit() {
    // Register asynchronous event listeners
    this.eventsService.on(
      AppEventType.ENROLLMENT_CREATED,
      (data: EnrollmentCreatedPayload) => this.handleEnrollmentCreated(data),
    );

    this.eventsService.on(
      AppEventType.QUIZ_PASSED,
      (data: QuizPassedPayload) => this.handleQuizPassed(data),
    );

    this.logger.log('Asynchronous notification event listeners registered successfully.');
  }

  private handleEnrollmentCreated(payload: EnrollmentCreatedPayload) {
    // Non-blocking asynchronous notification dispatch
    this.logger.log(
      `📧 [Email Dispatch Simulation] Welcome email sent to student ${payload.studentUuid} for joining "${payload.courseTitle}" at ${payload.enrolledAt.toISOString()}.`,
    );
  }

  private handleQuizPassed(payload: QuizPassedPayload) {
    this.logger.log(
      `🎉 [Achievement Dispatch Simulation] Congratulations! Student ${payload.studentUuid} passed "${payload.quizTitle}" with score ${payload.scorePercentage}%. Certificate unlocked!`,
    );
  }
}

