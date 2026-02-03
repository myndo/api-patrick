import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../app/database/database.service';
import { FilterGroup, Prisma } from '../../app/database/prisma';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  CreateOrganizationsOptions,
  GetOneOrganizationsSelections,
  GetOrganizationsSelections,
  OrganizationSelect,
  UpdateOrganizationsOptions,
  UpdateOrganizationsSelections,
} from './organizations.type';

@Injectable()
export class OrganizationsService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetOrganizationsSelections,
  ): Promise<WithPaginationResponse | null> {
    const where: FilterGroup<Prisma.OrganizationWhereInput> = {
      deletedAt: null,
      AND: [],
    };
    const { search, pagination } = selections;

    if (search) {
      where.AND.push({
        OR: [
          {
            name: { contains: search, mode: 'insensitive' },
          },
        ],
      });
    }

    const rowCount = await this.client.organization.count({
      where,
    });

    const organizations = await this.client.organization.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: pagination.orderBy,
    });

    return withPagination({
      pagination,
      rowCount,
      value: organizations,
    });
  }

  /** Find one Organization in database. */
  async findOneBy(selections: GetOneOrganizationsSelections) {
    const where: FilterGroup<Prisma.OrganizationWhereInput> = {
      deletedAt: null,
      AND: [],
    };
    const { organizationId } = selections;

    if (organizationId) {
      where.AND.push({ id: organizationId });
    }

    const organization = await this.client.organization.findFirst({
      where,
      select: OrganizationSelect,
    });

    return organization;
  }

  /** Create one Organization in database. */
  async createOne(options: CreateOrganizationsOptions) {
    return await this.client.organization.create({
      data: options,
    });
  }

  /** Update one Organization in database. */
  async updateOne(
    { organizationId }: UpdateOrganizationsSelections,
    options: UpdateOrganizationsOptions,
  ) {
    return await this.client.organization.update({
      where: { id: organizationId },
      data: options,
    });
  }
}
