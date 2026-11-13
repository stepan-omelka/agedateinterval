import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException } from '@nestjs/common';
import type { Response } from 'express';
import { STATUS_CODES } from 'node:http';

/**
 * Answers every error in the Problem Details format (RFC 9457): a rejected parameter, an unknown
 * path and, without its message, anything unexpected.
 */
@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : 500;
    if (!isHttpException) {
      console.error(exception);
    }
    const problem = {
      type: 'about:blank',
      title: STATUS_CODES[status],
      status,
      ...(isHttpException && { detail: exception.message }),
    };
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(status)
      .setHeader('Content-Type', 'application/problem+json')
      // `end`, not Express's `send` or `json`, which would add "; charset=utf-8" to the media type.
      .end(JSON.stringify(problem));
  }
}
