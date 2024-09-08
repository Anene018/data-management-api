import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// this decorator gets the request user and returns the user or a requested data of the user
export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request: Express.Request = ctx.switchToHttp().getRequest();
    if (data) {
      return request.user[data];
    }
    return request.user;
  },
);
