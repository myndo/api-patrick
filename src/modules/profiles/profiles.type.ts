import { Profile } from '../../app/database/prisma';
import { PaginationType } from '../../app/utils/pagination/with-pagination';

export type GetProfilesSelections = {
  search?: string;
  pagination?: PaginationType;
};

export type GetOneProfilesSelections = {
  profileId?: Profile['id'];
};

export type UpdateProfilesSelections = {
  profileId: Profile['id'];
};

export type CreateProfilesOptions = Partial<Profile>;

export type UpdateProfilesOptions = Partial<Profile>;

export const UserProfileSelect = {
  createdAt: true,
  id: true,
  profession: true,
  firstName: true,
  lastName: true,
  address: true,
  phone: true,
  photo: true,
  city: true,
  countryName: true,
  description: true,
  currency: {
    select: {
      name: true,
      code: true,
      symbol: true,
    },
  },
};
