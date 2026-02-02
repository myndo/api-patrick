import { Contributor, Prisma } from '../../app/database/prisma';
import { PrismaPagination } from '../../app/utils/pagination';

export type GetContributorsSelections = {
  search?: string;
  pagination?: PrismaPagination;
};

export type GetOneContributorsSelections = {
  contributorId?: Contributor['id'];
};

export type UpdateContributorsSelections = {
  contributorId: Contributor['id'];
};

export type CreateContributorsOptions = Prisma.ContributorCreateInput;

export type UpdateContributorsOptions = Prisma.ContributorUpdateInput;

export const ContributorSelect = {
  createdAt: true,
  id: true,
  name: true,
  description: true,
  status: true,
};
