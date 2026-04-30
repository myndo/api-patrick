import { Controller, Get, Res } from '@nestjs/common';
import { reply } from '../../app/utils/reply';

@Controller('hello')
export class HelloController {
  /** Login with username/password to get local platform authorization token */
  @Get(`/`)
  async hello(@Res() res) {
    return reply({
      res,
      results: {
        message:
          'Hello world! This is a test endpoint to verify that the API is working.',
      },
    });
  }
}
