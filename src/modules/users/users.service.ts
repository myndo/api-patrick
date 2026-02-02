import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../app/database/database.service';
import { Prisma, User } from '../../app/database/prisma';
import {
  dateTimeNowUtc,
  lastDayMonth,
  substrateDaysToTimeNowUtcDate,
} from '../../app/utils/commons';
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
  UserSelect,
} from './users.type';

@Injectable()
export class UsersService {
  constructor(private readonly client: DatabaseService) {}

  /** Get all users in database. */
  async findAll(
    selections: GetUsersSelections,
  ): Promise<WithPaginationResponse | null> {
    const prismaWhere = {} as Prisma.UserWhereInput;
    const { pagination, search, member, isSubscribed } = selections;

    if (search) {
      Object.assign(prismaWhere, {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { profile: { firstName: { contains: search, mode: 'insensitive' } } },
          { profile: { lastName: { contains: search, mode: 'insensitive' } } },
        ],
      });
    }

    if (member) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      member === 'true'
        ? Object.assign(prismaWhere, { member: true })
        : Object.assign(prismaWhere, { member: false });
    }

    if (isSubscribed) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      isSubscribed === 'true'
        ? Object.assign(prismaWhere, { isSubscribed: true })
        : Object.assign(prismaWhere, { isSubscribed: false });
    }

    const rowCount = await this.client.user.count({
      where: { ...prismaWhere, deletedAt: null },
    });

    const users = await this.client.user.findMany({
      where: { ...prismaWhere, deletedAt: null },
      select: UserSelect,
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
  async findOneBy(selections: GetOneUsersSelections) {
    const prismaWhereUser = {} as Prisma.UserWhereInput;
    const { userId, organizationId, email, provider } = selections;

    if (email) {
      Object.assign(prismaWhereUser, { email: email.toLocaleLowerCase() });
    }

    if (provider) {
      Object.assign(prismaWhereUser, { provider });
    }

    if (userId) {
      Object.assign(prismaWhereUser, { id: userId });
    }

    if (organizationId) {
      Object.assign(prismaWhereUser, { organizationId });
    }

    const user = await this.client.user.findFirst({
      where: { ...prismaWhereUser, deletedAt: null },
      select: {
        password: true,
        id: true,
        email: true,
        confirmedAt: true,
        profile: true,
      },
    });

    return user;
  }

  /** Find one User in  database. */
  async findMe(selections: GetOneUsersSelections) {
    const prismaWhereUser = {} as Prisma.UserWhereInput;
    const { userId, organizationId } = selections;

    if (userId) {
      Object.assign(prismaWhereUser, { id: userId });
    }

    if (organizationId) {
      Object.assign(prismaWhereUser, { organizationId });
    }

    const user = await this.client.user.findFirst({
      where: { ...prismaWhereUser, deletedAt: null },
      select: UserSelect,
    });

    return user;
  }

  /** Create one User in database. */
  async createOne(options: CreateUsersOptions): Promise<User> {
    const { email, password, provider, confirmedAt } = options;

    const user = this.client.user.create({
      data: {
        email,
        password,
        provider,
        confirmedAt,
      },
    });

    return user;
  }

  /** Get users analytics. */
  async getUsersAnalytics(selections: GetUsersSelections) {
    const prismaWhere = {} as Prisma.UserWhereInput;
    const { periode, months, year } = selections;

    if (periode) {
      Object.assign(prismaWhere, {
        createdAt: {
          gte: substrateDaysToTimeNowUtcDate(Number(periode)),
          lte: dateTimeNowUtc(),
        },
      });
    }

    if (year) {
      Object.assign(prismaWhere, {
        createdAt: {
          gte: new Date(`${Number(year)}-01-01`),
          lte: new Date(`${Number(year) + 1}-01-01`),
        },
      });
      if (months) {
        Object.assign(prismaWhere, {
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
      where: {
        ...prismaWhere,
        deletedAt: null,
      },
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
    selections: UpdateUsersSelections,
    options: UpdateUsersOptions,
  ): Promise<User> {
    const { userId } = selections;
    const { email, provider, password, confirmedAt, deletedAt } = options;

    const user = this.client.user.update({
      where: { id: userId },
      data: {
        email,
        provider,
        password,
        confirmedAt,
        deletedAt,
      },
    });

    return user;
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
