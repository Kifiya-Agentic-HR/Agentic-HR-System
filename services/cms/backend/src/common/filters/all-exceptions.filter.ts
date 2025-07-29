import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { Request, Response } from 'express';
  
  @Catch()
  export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
  
      let status =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
  
      let message =
        exception instanceof HttpException
          ? exception.getResponse()
          : (exception as any)?.message || 'Internal server error';
  
      // If message is an object (from HttpException), extract message property
      if (typeof message === 'object' && message !== null) {
        message = (message as any).message || message;
      }
  
      response.status(status).json({
        success: false,
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message,
      });
    }
  }