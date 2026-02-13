import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export interface GoogleSearchConsoleConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface SearchAnalyticsQuery {
  startDate: string;
  endDate: string;
  dimensions?: ('query' | 'page' | 'country' | 'device' | 'searchAppearance')[];
  rowLimit?: number;
  startRow?: number;
}

export interface SearchAnalyticsRow {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
}

export interface SearchAnalyticsResponse {
  rows?: SearchAnalyticsRow[];
  responseAggregationType?: string;
}

export interface SitemapInfo {
  path: string;
  lastSubmitted?: string;
  isPending?: boolean;
  isSitemapsIndex?: boolean;
  type?: string;
  lastDownloaded?: string;
  warnings?: number;
  errors?: number;
  contents?: any[];
}

export class GoogleSearchConsoleAdapter {
  private oauth2Client: OAuth2Client;
  private searchconsole: any;

  constructor(config: GoogleSearchConsoleConfig) {
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri,
    );

    this.searchconsole = google.searchconsole({
      version: 'v1',
      auth: this.oauth2Client,
    });
  }

  /**
   * Set access token for authenticated requests
   */
  setCredentials(accessToken: string, refreshToken?: string) {
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  /**
   * Generate OAuth URL for user authentication
   */
  generateAuthUrl(
    scopes: string[] = ['https://www.googleapis.com/auth/webmasters.readonly'],
  ): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokensFromCode(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  /**
   * List all sites available in Search Console
   */
  async listSites() {
    const response = await this.searchconsole.sites.list();
    return response.data.siteEntry || [];
  }

  /**
   * Get search analytics data
   */
  async getSearchAnalytics(
    siteUrl: string,
    query: SearchAnalyticsQuery,
  ): Promise<SearchAnalyticsResponse> {
    const response = await this.searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: query.startDate,
        endDate: query.endDate,
        dimensions: query.dimensions || ['query'],
        rowLimit: query.rowLimit || 100,
        startRow: query.startRow || 0,
      },
    });

    return response.data;
  }

  /**
   * Get top queries
   */
  async getTopQueries(
    siteUrl: string,
    startDate: string,
    endDate: string,
    limit: number = 25,
  ): Promise<SearchAnalyticsRow[]> {
    const response = await this.getSearchAnalytics(siteUrl, {
      startDate,
      endDate,
      dimensions: ['query'],
      rowLimit: limit,
    });

    return response.rows || [];
  }

  /**
   * Get top pages
   */
  async getTopPages(
    siteUrl: string,
    startDate: string,
    endDate: string,
    limit: number = 25,
  ): Promise<SearchAnalyticsRow[]> {
    const response = await this.getSearchAnalytics(siteUrl, {
      startDate,
      endDate,
      dimensions: ['page'],
      rowLimit: limit,
    });

    return response.rows || [];
  }

  /**
   * Get performance by country
   */
  async getPerformanceByCountry(
    siteUrl: string,
    startDate: string,
    endDate: string,
  ): Promise<SearchAnalyticsRow[]> {
    const response = await this.getSearchAnalytics(siteUrl, {
      startDate,
      endDate,
      dimensions: ['country'],
      rowLimit: 100,
    });

    return response.rows || [];
  }

  /**
   * Get performance by device
   */
  async getPerformanceByDevice(
    siteUrl: string,
    startDate: string,
    endDate: string,
  ): Promise<SearchAnalyticsRow[]> {
    const response = await this.getSearchAnalytics(siteUrl, {
      startDate,
      endDate,
      dimensions: ['device'],
    });

    return response.rows || [];
  }

  /**
   * Get total statistics for a date range
   */
  async getTotalStats(siteUrl: string, startDate: string, endDate: string) {
    const response = await this.getSearchAnalytics(siteUrl, {
      startDate,
      endDate,
      dimensions: [],
    });

    return (
      response.rows?.[0] || {
        clicks: 0,
        impressions: 0,
        ctr: 0,
        position: 0,
      }
    );
  }

  /**
   * List sitemaps
   */
  async listSitemaps(siteUrl: string): Promise<SitemapInfo[]> {
    const response = await this.searchconsole.sitemaps.list({
      siteUrl,
    });

    return response.data.sitemap || [];
  }

  /**
   * Submit sitemap
   */
  async submitSitemap(siteUrl: string, feedpath: string) {
    const response = await this.searchconsole.sitemaps.submit({
      siteUrl,
      feedpath,
    });

    return response.data;
  }

  /**
   * Delete sitemap
   */
  async deleteSitemap(siteUrl: string, feedpath: string) {
    const response = await this.searchconsole.sitemaps.delete({
      siteUrl,
      feedpath,
    });

    return response.data;
  }

  /**
   * Get sitemap details
   */
  async getSitemap(siteUrl: string, feedpath: string): Promise<SitemapInfo> {
    const response = await this.searchconsole.sitemaps.get({
      siteUrl,
      feedpath,
    });

    return response.data;
  }
}
