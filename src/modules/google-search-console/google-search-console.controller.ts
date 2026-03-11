import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { reply } from '../../app/utils/reply';
import { GoogleSearchConsoleService } from './google-search-console.service';
import {
  SearchAnalyticsDto,
  TopQueriesDto,
  TopPagesDto,
  PerformanceByCountryDto,
  PerformanceByDeviceDto,
  TotalStatsDto,
  ListSitesDto,
  ListSitemapsDto,
  SubmitSitemapDto,
  GetSitemapDto,
  DeleteSitemapDto,
} from './google-search-console.dto';

@Controller('google-search-console')
export class GoogleSearchConsoleController {
  constructor(
    private readonly googleSearchConsoleService: GoogleSearchConsoleService,
  ) {}

  /**
   * Get OAuth authorization URL
   */
  @Get('/auth-url')
  async get_Auth_Url(@Res() res) {
    const url = this.googleSearchConsoleService.generateAuthUrl();
    return reply({
      res,
      results: {
        authUrl: url,
        status: HttpStatus.OK,
        message: `Authorization URL fetched successfully`,
      },
    });
  }

  /**
   * Exchange OAuth code for tokens
   */
  @Get('/oauth2callback')
  async oauth_Callback(@Res() res, @Query('code') code: string) {
    const tokens = await this.googleSearchConsoleService.getTokens(code);

    if (tokens?.access_token) {
      res.setHeader('Authorization', `Bearer ${tokens.access_token}`);
    }

    return reply({
      res,
      results: {
        token: tokens,
        status: HttpStatus.OK,
        message: `Tokens fetched successfully`,
      },
    });
  }

  /**
   * Get performance by country
   */
  @Post('/performance-by-country')
  async get_Performance_By_Country(
    @Res() res,
    @Headers('authorization') authHeader: string,
    @Body() body: PerformanceByCountryDto,
  ) {
    const { siteUrl, startDate, endDate } = body;

    const accessToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!accessToken) {
      return reply({
        res,
        results: {
          status: HttpStatus.UNAUTHORIZED,
          message:
            'Missing or invalid Authorization header. Use Bearer <accessToken> format',
        },
      });
    }
    const result =
      await this.googleSearchConsoleService.getAndSavePerformanceByCountry(
        accessToken,
        siteUrl,
        startDate,
        endDate,
      );
    return reply({
      res,
      results: {
        data: result,
        status: HttpStatus.OK,
        message: `Data fetched and saved successfully`,
      },
    });
  }

  /**
   * Retrieve performance by country data from database
   */
  @Get('/performance-by-country/find-all')
  async find_All_Performance_By_Country(
    @Res() res,
    @Headers('authorization') authHeader: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const accessToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!accessToken) {
      return reply({
        res,
        results: {
          status: HttpStatus.UNAUTHORIZED,
          message:
            'Missing or invalid Authorization header. Use Bearer <accessToken> format',
        },
      });
    }

    const data =
      await this.googleSearchConsoleService.findAllPerformanceByCountry(
        startDate,
        endDate,
      );

    return reply({
      res,
      results: {
        ...data,
        status: HttpStatus.OK,
        message: `Performance by country data fetched successfully`,
      },
    });
  }

  /**
   * Get search analytics data
   */
  @Post('/analytics') // non toccare per il momento
  async get_Search_Analytics(
    @Res() res,
    @Headers('authorization') authHeader: string,
    @Body() body: SearchAnalyticsDto,
  ) {
    const { siteUrl, startDate, endDate, dimensions, rowLimit, startRow } =
      body;

    const accessToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!accessToken) {
      return reply({
        res,
        results: {
          status: HttpStatus.UNAUTHORIZED,
          message:
            'Missing or invalid Authorization header. Use Bearer <accessToken> format',
        },
      });
    }

    const result = await this.googleSearchConsoleService.getSearchAnalytics(
      accessToken,
      siteUrl,
      startDate,
      endDate,
      dimensions,
      rowLimit,
      startRow,
    );

    return reply({
      res,
      results: {
        data: result,
        status: HttpStatus.OK,
        message: `Data fetched and saved successfully`,
      },
    });
  }

  /**
   * List all sites
   */
  @Post('/sites')
  async list_Sites(@Res() res, @Body() body: ListSitesDto) {
    const { accessToken } = body;
    const result = await this.googleSearchConsoleService.listSites(accessToken);

    return reply({
      res,
      results: {
        sites: result,
        status: HttpStatus.OK,
        message: `Sites fetched successfully`,
      },
    });
  }

  /**
   * Get top queries
   */
  @Post('/top-queries')
  async get_Top_Queries(@Res() res, @Body() body: TopQueriesDto) {
    const { accessToken, siteUrl, startDate, endDate, limit } = body;
    const result = await this.googleSearchConsoleService.getAndSaveTopQueries(
      accessToken,
      siteUrl,
      startDate,
      endDate,
      limit || 25,
    );

    return reply({
      res,
      results: {
        data: result,
        status: HttpStatus.OK,
        message: `Data fetched and saved successfully`,
      },
    });
  }

  /**
   * Get top pages
   */
  @Post('/top-pages')
  async get_Top_Pages(@Res() res, @Body() body: TopPagesDto) {
    const { accessToken, siteUrl, startDate, endDate, limit } = body;
    const result = await this.googleSearchConsoleService.getAndSaveTopPages(
      accessToken,
      siteUrl,
      startDate,
      endDate,
      limit || 25,
    );

    return reply({
      res,
      results: {
        data: result,
        status: HttpStatus.OK,
        message: `Data fetched and saved successfully`,
      },
    });
  }

  @Post('/performance-by-device')
  async get_Performance_By_Device(
    @Res() res,
    @Body() body: PerformanceByDeviceDto,
  ) {
    const { accessToken, siteUrl, startDate, endDate } = body;
    const result =
      await this.googleSearchConsoleService.getAndSavePerformanceByDevice(
        accessToken,
        siteUrl,
        startDate,
        endDate,
      );
    return reply({
      res,
      results: {
        data: result,
        status: HttpStatus.OK,
        message: `Data fetched and saved successfully`,
      },
    });
  }

  /**
   * Get total statistics
   */
  @Post('/total-stats')
  async get_Total_Stats(@Res() res, @Body() body: TotalStatsDto) {
    const { accessToken, siteUrl, startDate, endDate } = body;
    const result = await this.googleSearchConsoleService.getTotalStats(
      accessToken,
      siteUrl,
      startDate,
      endDate,
    );
    return reply({
      res,
      results: {
        data: result,
        status: HttpStatus.OK,
        message: `Data fetched successfully`,
      },
    });
  }

  /**
   * List sitemaps
   */
  @Post('/sitemaps/list')
  async list_Sitemaps(@Res() res, @Body() body: ListSitemapsDto) {
    const { accessToken, siteUrl } = body;
    const result = await this.googleSearchConsoleService.listSitemaps(
      accessToken,
      siteUrl,
    );
    return reply({
      res,
      results: {
        data: result,
        status: HttpStatus.OK,
        message: `Data fetched successfully`,
      },
    });
  }

  /**
   * Submit sitemap
   */
  @Post('/sitemaps/submit')
  async submit_Sitemap(@Res() res, @Body() body: SubmitSitemapDto) {
    const { accessToken, siteUrl, feedpath } = body;
    const result = await this.googleSearchConsoleService.submitSitemap(
      accessToken,
      siteUrl,
      feedpath,
    );
    return reply({
      res,
      results: {
        data: result,
        status: HttpStatus.OK,
        message: `Data fetched successfully`,
      },
    });
  }

  /**
   * Get sitemap details
   */
  @Post('/sitemaps/get')
  async get_Sitemap(@Res() res, @Body() body: GetSitemapDto) {
    const { accessToken, siteUrl, feedpath } = body;
    const result = await this.googleSearchConsoleService.getSitemap(
      accessToken,
      siteUrl,
      feedpath,
    );
    return reply({
      res,
      results: {
        data: result,
        status: HttpStatus.OK,
        message: `Data fetched successfully`,
      },
    });
  }

  /**
   * Delete sitemap
   */
  @Post('/sitemaps/delete')
  async delete_Sitemap(@Res() res, @Body() body: DeleteSitemapDto) {
    const { accessToken, siteUrl, feedpath } = body;
    const result = await this.googleSearchConsoleService.deleteSitemap(
      accessToken,
      siteUrl,
      feedpath,
    );
    return reply({
      res,
      results: {
        data: result,
        status: HttpStatus.OK,
        message: `Data fetched successfully`,
      },
    });
  }
}
