import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../app/database/database.service';
import { FilterGroup, Prisma, Profile } from '../../app/database/prisma';
import {
  WithPaginationResponse,
  withPagination,
} from '../../app/utils/pagination';
import {
  CreateProfilesOptions,
  GetOneProfilesSelections,
  GetProfilesSelections,
  UpdateProfilesOptions,
  UpdateProfilesSelections,
  UserProfileSelect,
} from './profiles.type';

@Injectable()
export class ProfilesService {
  constructor(private readonly client: DatabaseService) {}

  async findAll(
    selections: GetProfilesSelections,
  ): Promise<WithPaginationResponse | null> {
    const where: FilterGroup<Prisma.ProfileWhereInput> = {
      deletedAt: null,
      AND: [],
    };
    const { search, pagination } = selections;

    if (search) {
      where.AND.push({
        OR: [
          {
            firstName: { contains: search, mode: 'insensitive' },
            lastName: { contains: search, mode: 'insensitive' },
          },
        ],
      });
    }

    const rowCount = await this.client.profile.count({
      where,
    });

    const profiles = await this.client.profile.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: pagination.orderBy,
    });

    return withPagination({
      pagination,
      rowCount,
      value: profiles,
    });
  }

  /** Find one Profile in database. */
  async findOneBy(selections: GetOneProfilesSelections) {
    const where: FilterGroup<Prisma.ProfileWhereInput> = {
      deletedAt: null,
      AND: [],
    };
    const { profileId } = selections;

    if (profileId) {
      where.AND.push({ id: profileId });
    }

    const profile = await this.client.profile.findFirst({
      where,
      select: UserProfileSelect,
    });

    return profile;
  }

  /** Create one Profile in database. */
  async createOne(options: CreateProfilesOptions): Promise<Profile> {
    return await this.client.profile.create({
      data: options,
    });
  }

  /** Update one Profile in database. */
  async updateOne(
    { profileId }: UpdateProfilesSelections,
    options: UpdateProfilesOptions,
  ): Promise<Profile> {
    return await this.client.profile.update({
      where: { id: profileId },
      data: options,
    });
  }
}
