import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const request = http.getRequest();
    const response = http.getResponse();
    const statusCode = response.statusCode;
    const method = request.method;
    const url = request.url;

    // 1. Do not intercept Swagger UI assets or raw OpenAPI JSON specification
    if (url.includes('-json') || url.includes('/swagger/')) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        // 2. Specific routes exempt from omitting data (Tokens, file upload paths, quiz scoring)
        const isExempt =
          url.includes('/auth/login') ||
          url.includes('/auth/register') ||
          url.includes('/uploads') ||
          url.includes('/submit');

        // 3. For Creation (POST): send ONLY success, statusCode, message, and timestamp
        if (method === 'POST' && !isExempt) {
          return {
            success: true,
            statusCode: statusCode || 201,
            message:
              typeof data?.message === 'string'
                ? data.message
                : 'Resource created successfully',
            timestamp: new Date().toISOString(),
          };
        }

        // 4. For Updates (PATCH / PUT): send ONLY success, statusCode, message, and timestamp
        if ((method === 'PATCH' || method === 'PUT') && !isExempt) {
          return {
            success: true,
            statusCode: statusCode || 200,
            message:
              typeof data?.message === 'string'
                ? data.message
                : 'Resource updated successfully',
            timestamp: new Date().toISOString(),
          };
        }

        // 5. For Deletion (DELETE): send ONLY success, statusCode, message, and timestamp
        if (method === 'DELETE') {
          return {
            success: true,
            statusCode: statusCode || 200,
            message:
              typeof data?.message === 'string'
                ? data.message
                : 'Resource deleted successfully',
            timestamp: new Date().toISOString(),
          };
        }

        // 6. For Paginated List Queries (GET)
        if (
          data &&
          typeof data === 'object' &&
          Array.isArray(data.items) &&
          typeof data.total === 'number'
        ) {
          return {
            success: true,
            statusCode,
            data: data.items,
            pagination: {
              total: data.total,
              page: data.page,
              limit: data.limit,
              totalPages: Math.ceil(data.total / data.limit) || 1,
            },
            timestamp: new Date().toISOString(),
          };
        }

        // 7. For Single Document / Detail Queries (GET :uuid, stats, etc.)
        return {
          success: true,
          statusCode,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
