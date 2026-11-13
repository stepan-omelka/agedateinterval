import { type ExecutionContext, createParamDecorator } from '@nestjs/common';
import type { Request } from 'express';

/**
 * The `:age` segment of the path as the client sent it. `@Param('age')` is Express's decoded
 * value, in which "%33%30" is "30": a second spelling of a valid age, which the CDN has no file
 * for and the function would draw on every request.
 */
export const RawAge = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string =>
    /([^/]*)\/?$/.exec(context.switchToHttp().getRequest<Request>().path)?.[1] ?? '',
);
