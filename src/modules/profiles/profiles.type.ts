import { Prisma, Profile } from '../../app/database/prisma';
import { PrismaPagination } from '../../app/utils/pagination';

export type GetProfilesSelections = {
  search?: string;
  pagination?: PrismaPagination;
};

export type GetOneProfilesSelections = {
  profileId?: Profile['id'];
};

export type UpdateProfilesSelections = {
  profileId: Profile['id'];
};

export type CreateProfilesOptions = Prisma.ProfileCreateInput;

export type UpdateProfilesOptions = Prisma.ProfileUpdateInput;

export const UserProfileSelect = {
  createdAt: true,
  id: true,
  city: true,
  phone: true,
  photo: true,
  address: true,
  lastName: true,
  firstName: true,
  profession: true,
  countryName: true,
};
