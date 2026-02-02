import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../app/database/database.service';
import { Contributor, FilterGroup, Prisma } from '../../app/database/prisma';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  ContributorSelect,
  CreateContributorsOptions,
  GetContributorsSelections,
  GetOneContributorsSelections,
  UpdateContributorsOptions,
  UpdateContributorsSelections,
} from './contributors.type';

@Injectable()
export class ContributorsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetContributorsSelections,
  ): Promise<WithPaginationResponse | null> {
    const where: FilterGroup<Prisma.ContributorWhereInput> = {
      deletedAt: null,
      AND: [],
    };
    const { search, pagination } = selections;

    if (search) {
      where.AND.push({
        OR: [
          {
            description: { contains: search, mode: 'insensitive' },
          },
        ],
      });
    }

    const rowCount = await this.client.contributor.count({
      where,
    });

    const contributors = await this.client.contributor.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: pagination.orderBy,
    });

    return withPagination({
      pagination,
      rowCount,
      value: contributors,
    });
  }

  /** Find one Profile in database. */
  async findOneBy({ contributorId }: GetOneContributorsSelections) {
    const where: FilterGroup<Prisma.ContributorWhereInput> = {
      deletedAt: null,
      AND: [],
    };

    if (contributorId) {
      where.AND.push({ id: contributorId });
    }

    const contributor = await this.client.contributor.findFirst({
      where,
      select: ContributorSelect,
    });

    return contributor;
  }

  /** Create one Contributor in database. */
  async createOne(options: CreateContributorsOptions): Promise<Contributor> {
    return await this.client.contributor.create({
      data: options,
    });
  }

  /** Update one Contributor in database. */
  async updateOne(
    { contributorId }: UpdateContributorsSelections,
    options: UpdateContributorsOptions,
  ): Promise<Contributor> {
    return await this.client.contributor.update({
      where: { id: contributorId },
      data: options,
    });
  }
}
