import { Organization, Prisma } from '../../app/database/prisma';
import { PrismaPagination } from '../../app/utils/pagination';

export type GetOrganizationsSelections = {
  search?: string;
  pagination?: PrismaPagination;
};

export type GetOneOrganizationsSelections = {
  organizationId?: Organization['id'];
};

export type UpdateOrganizationsSelections = {
  organizationId: Organization['id'];
};

export type CreateOrganizationsOptions = Prisma.OrganizationCreateInput;

export type UpdateOrganizationsOptions = Prisma.OrganizationUpdateInput;

export const OrganizationSelect = {
  createdAt: true,
  id: true,
  name: true,
  description: true,
};
