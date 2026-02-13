import { Controller, Get, Query, Res } from '@nestjs/common';
import { GoogleSearchConsoleService } from '../google-search-console/google-search-console.service';

@Controller()
export class OAuthController {
  constructor(
    private readonly googleSearchConsoleService: GoogleSearchConsoleService,
  ) {}

  /**
   * OAuth callback endpoint
   */
  @Get('/oauth2callback')
  async oauthCallback(@Query('code') code: string, @Res() res) {
    try {
      const tokens = await this.googleSearchConsoleService.getTokens(code);

      // Return tokens as JSON
      return res.json({
        statusCode: 200,
        message: 'Authorization successful',
        results: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresIn: tokens.expiry_date,
          tokenType: tokens.token_type,
          scope: tokens.scope,
        },
      });
    } catch (error) {
      return res.status(500).json({
        statusCode: 500,
        message: `Authorization failed: ${error.message}`,
      });
    }
  }
}
