import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../app/database/database.service';
import { FilterGroup, Prisma, User } from '../../app/database/prisma';
import {
  dateTimeNowUtc,
  lastDayMonth,
  substrateDaysToTimeNowUtcDate,
} from '../../app/utils/formate-date';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import { groupCountUsersByDateAndReturnArray } from './users.analytics.utils';
import {
  CreateUsersOptions,
  GetOneUsersSelections,
  GetUsersSelections,
  UpdateUsersOptions,
  UpdateUsersSelections,
} from './users.type';

@Injectable()
export class UsersService {
  constructor(private readonly client: DatabaseService) {}

  /** Get all users in database. */
  async findAll({
    pagination,
    search,
  }: GetUsersSelections): Promise<WithPaginationResponse | null> {
    const where: FilterGroup<Prisma.UserWhereInput> = {
      deletedAt: null,
      AND: [],
    };

    if (search) {
      where.AND.push({
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { profile: { firstName: { contains: search, mode: 'insensitive' } } },
          { profile: { lastName: { contains: search, mode: 'insensitive' } } },
        ],
      });
    }

    const rowCount = await this.client.user.count({
      where,
    });

    const users = await this.client.user.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: pagination.orderBy,
    });

    return withPagination({
      pagination,
      rowCount,
      value: users,
    });
  }

  /** Find one User in  database. */
  async findOneBy({
    userId,
    organizationId,
    email,
    provider,
  }: GetOneUsersSelections) {
    const where: FilterGroup<Prisma.UserWhereInput> = {
      deletedAt: null,
      AND: [],
    };

    if (email) {
      where.AND.push({ email: { contains: email, mode: 'insensitive' } });
    }

    if (provider) {
      where.AND.push({ provider });
    }

    if (userId) {
      where.AND.push({ id: userId });
    }

    if (organizationId) {
      where.AND.push({ organizationId });
    }

    const user = await this.client.user.findFirst({
      where,
      select: {
        id: true,
        email: true,
        password: true,
        provider: true,
        organizationId: true,
        confirmedAt: true,
        profile: true,
      },
    });

    return user;
  }

  /** Find me User in  database. */
  async findMe({ userId, organizationId }: GetOneUsersSelections) {
    const where: FilterGroup<Prisma.UserWhereInput> = {
      deletedAt: null,
      AND: [],
    };

    if (userId) {
      where.AND.push({ id: userId });
    }

    if (organizationId) {
      where.AND.push({ organizationId });
    }

    const user = await this.client.user.findFirst({
      where,
    });

    return user;
  }

  /** Create one User in database. */
  async createOne(options: CreateUsersOptions): Promise<User> {
    return await this.client.user.create({
      data: options,
    });
  }

  /** Get users analytics. */
  async getUsersAnalytics({ periode, months, year }: GetUsersSelections) {
    const where: FilterGroup<Prisma.UserWhereInput> = {
      deletedAt: null,
      AND: [],
    };

    if (periode) {
      where.AND.push({
        createdAt: {
          gte: substrateDaysToTimeNowUtcDate(Number(periode)),
          lte: dateTimeNowUtc(),
        },
      });
    }

    if (year) {
      where.AND.push({
        createdAt: {
          gte: new Date(`${Number(year)}-01-01`),
          lte: new Date(`${Number(year) + 1}-01-01`),
        },
      });
      if (months) {
        where.AND.push({
          createdAt: {
            gte: new Date(`${year}-${months}-01`),
            lte: lastDayMonth({
              year: Number(year),
              month: Number(months),
            }),
          },
        });
      }
    }

    const groupUsers = await this.client.user.groupBy({
      by: ['createdAt'],
      where,
      _count: true,
    });

    const userAnalytics = groupCountUsersByDateAndReturnArray({
      data: groupUsers,
      year: year,
      month: months,
    });

    return userAnalytics;
  }

  /** Update one User in database. */
  async updateOne(
    { userId }: UpdateUsersSelections,
    options: UpdateUsersOptions,
  ): Promise<User> {
    return await this.client.user.update({
      where: { id: userId },
      data: options,
    });
  }

  /** Get users transactions. */
  async getUsersTransactions() {
    const [users, administrators] = await this.client.$transaction([
      this.client.user.count({
        where: {
          deletedAt: null,
        },
      }),
      this.client.user.count({
        where: {
          deletedAt: null,
        },
      }),
    ]);

    return {
      users,
      administrators,
    };
  }
}
