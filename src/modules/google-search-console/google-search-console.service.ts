import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { GoogleSearchConsoleAdapter } from '../integrations/google-search-console-adapter';

@Injectable()
export class GoogleSearchConsoleService {
  private gscAdapter: GoogleSearchConsoleAdapter;

  constructor() {
    this.gscAdapter = new GoogleSearchConsoleAdapter({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirectUri:
        process.env.GOOGLE_REDIRECT_URI ||
        'http://localhost:8000/oauth2callback',
    });
  }

  /**
   * Generate OAuth URL
   */
  generateAuthUrl(): string {
    return this.gscAdapter.generateAuthUrl();
  }

  /**
   * Exchange code for tokens
   */
  async getTokens(code: string) {
    try {
      return await this.gscAdapter.getTokensFromCode(code);
    } catch (error) {
      throw new HttpException(
        `Failed to get tokens: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * List all sites
   */
  async listSites(accessToken: string) {
    try {
      this.gscAdapter.setCredentials(accessToken);
      const sites = await this.gscAdapter.listSites();
      return { sites };
    } catch (error) {
      throw new HttpException(
        `Failed to list sites: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get search analytics data
   */
  async getSearchAnalytics(
    accessToken: string,
    siteUrl: string,
    startDate: string,
    endDate: string,
    dimensions?: any[],
    rowLimit?: number,
    startRow?: number,
  ) {
    try {
      this.gscAdapter.setCredentials(accessToken);
      const data = await this.gscAdapter.getSearchAnalytics(siteUrl, {
        startDate,
        endDate,
        dimensions,
        rowLimit,
        startRow,
      });
      return data;
    } catch (error) {
      throw new HttpException(
        `Failed to get search analytics: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get top queries
   */
  async getTopQueries(
    accessToken: string,
    siteUrl: string,
    startDate: string,
    endDate: string,
    limit: number = 25,
  ) {
    try {
      this.gscAdapter.setCredentials(accessToken);
      const queries = await this.gscAdapter.getTopQueries(
        siteUrl,
        startDate,
        endDate,
        limit,
      );
      return { queries };
    } catch (error) {
      throw new HttpException(
        `Failed to get top queries: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get top pages
   */
  async getTopPages(
    accessToken: string,
    siteUrl: string,
    startDate: string,
    endDate: string,
    limit: number = 25,
  ) {
    try {
      this.gscAdapter.setCredentials(accessToken);
      const pages = await this.gscAdapter.getTopPages(
        siteUrl,
        startDate,
        endDate,
        limit,
      );
      return { pages };
    } catch (error) {
      throw new HttpException(
        `Failed to get top pages: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get performance by country
   */
  async getPerformanceByCountry(
    accessToken: string,
    siteUrl: string,
    startDate: string,
    endDate: string,
  ) {
    try {
      this.gscAdapter.setCredentials(accessToken);
      const countries = await this.gscAdapter.getPerformanceByCountry(
        siteUrl,
        startDate,
        endDate,
      );
      return { countries };
    } catch (error) {
      throw new HttpException(
        `Failed to get performance by country: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get performance by device
   */
  async getPerformanceByDevice(
    accessToken: string,
    siteUrl: string,
    startDate: string,
    endDate: string,
  ) {
    try {
      this.gscAdapter.setCredentials(accessToken);
      const devices = await this.gscAdapter.getPerformanceByDevice(
        siteUrl,
        startDate,
        endDate,
      );
      return { devices };
    } catch (error) {
      throw new HttpException(
        `Failed to get performance by device: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get total statistics
   */
  async getTotalStats(
    accessToken: string,
    siteUrl: string,
    startDate: string,
    endDate: string,
  ) {
    try {
      this.gscAdapter.setCredentials(accessToken);
      const stats = await this.gscAdapter.getTotalStats(
        siteUrl,
        startDate,
        endDate,
      );
      return stats;
    } catch (error) {
      throw new HttpException(
        `Failed to get total stats: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * List sitemaps
   */
  async listSitemaps(accessToken: string, siteUrl: string) {
    try {
      this.gscAdapter.setCredentials(accessToken);
      const sitemaps = await this.gscAdapter.listSitemaps(siteUrl);
      return { sitemaps };
    } catch (error) {
      throw new HttpException(
        `Failed to list sitemaps: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Submit sitemap
   */
  async submitSitemap(accessToken: string, siteUrl: string, feedpath: string) {
    try {
      this.gscAdapter.setCredentials(accessToken);
      await this.gscAdapter.submitSitemap(siteUrl, feedpath);
      return { message: 'Sitemap submitted successfully' };
    } catch (error) {
      throw new HttpException(
        `Failed to submit sitemap: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get sitemap details
   */
  async getSitemap(accessToken: string, siteUrl: string, feedpath: string) {
    try {
      this.gscAdapter.setCredentials(accessToken);
      const sitemap = await this.gscAdapter.getSitemap(siteUrl, feedpath);
      return sitemap;
    } catch (error) {
      throw new HttpException(
        `Failed to get sitemap: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete sitemap
   */
  async deleteSitemap(accessToken: string, siteUrl: string, feedpath: string) {
    try {
      this.gscAdapter.setCredentials(accessToken);
      await this.gscAdapter.deleteSitemap(siteUrl, feedpath);
      return { message: 'Sitemap deleted successfully' };
    } catch (error) {
      throw new HttpException(
        `Failed to delete sitemap: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
