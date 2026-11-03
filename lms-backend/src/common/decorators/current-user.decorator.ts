import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom parameter decorator to extract the authenticated user (or a specific property)
 * directly from the request context.
 *
 * Usage:
 *   @Get('profile')
 *   getProfile(@CurrentUser() user: any) { ... }
 *
 *   @Post('enroll')
 *   enroll(@CurrentUser('uuid') userId: string) { ... }
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);

