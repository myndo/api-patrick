import {
  Body,
  Controller,
  Get,
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
   * Get search analytics data
   */
  @Post('/analytics')
  async get_Search_Analytics(@Res() res, @Body() body: SearchAnalyticsDto) {
    const {
      accessToken,
      siteUrl,
      startDate,
      endDate,
      dimensions,
      rowLimit,
      startRow,
    } = body;
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
        message: `Data fetched successfully`,
      },
    });
  }

  /**
   * Get top queries
   */
  @Post('/top-queries')
  async get_Top_Queries(@Res() res, @Body() body: TopQueriesDto) {
    const { accessToken, siteUrl, startDate, endDate, limit } = body;
    const result = await this.googleSearchConsoleService.getTopQueries(
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
        message: `Data fetched successfully`,
      },
    });
  }

  /**
   * Get top pages
   */
  @Post('/top-pages')
  async get_Top_Pages(@Res() res, @Body() body: TopPagesDto) {
    const { accessToken, siteUrl, startDate, endDate, limit } = body;
    const result = await this.googleSearchConsoleService.getTopPages(
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
        message: `Data fetched successfully`,
      },
    });
  }

  /**
   * Get performance by country
   */
  @Post('/performance-by-country')
  async get_Performance_By_Country(
    @Res() res,
    @Body() body: PerformanceByCountryDto,
  ) {
    const { accessToken, siteUrl, startDate, endDate } = body;
    const result =
      await this.googleSearchConsoleService.getPerformanceByCountry(
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
   * Get performance by device
   */
  @Post('/performance-by-device')
  async get_Performance_By_Device(
    @Res() res,
    @Body() body: PerformanceByDeviceDto,
  ) {
    const { accessToken, siteUrl, startDate, endDate } = body;
    const result = await this.googleSearchConsoleService.getPerformanceByDevice(
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
