import * as argon2 from 'argon2';
import { Prisma, User } from '../../app/database/prisma';
import { PrismaPagination } from '../../app/utils/pagination';

export type JwtPayloadType = {
  id: string;
  organizationId: string;
};

export type GetUsersSelections = {
  search?: string;
  periode?: number;
  days?: string;
  months?: string;
  year?: string;
  organizationId?: string;
  pagination?: PrismaPagination;
};

export type GetOneUsersSelections = {
  email?: User['email'];
  userId?: User['id'];
  provider?: User['provider'];
  organizationId?: User['organizationId'];
};

export type UpdateUsersSelections = {
  userId?: User['id'];
  organizationId?: User['organizationId'];
};

export type CreateUsersOptions = Prisma.UserCreateInput;

export type UpdateUsersOptions = Prisma.UserUpdateInput;

export const checkIfPasswordMatch = async (
  userPassword: string,
  password: string,
) => {
  return await argon2.verify(String(userPassword), String(password));
};

export const hashPassword = async (password: string) => {
  return await argon2.hash(String(password), {
    type: argon2.argon2id,
    hashLength: 32,
    memoryCost: 2 ** 16,
    parallelism: 4,
  });
};

export const UserSelect = {
  createdAt: true,
  id: true,
  email: true,
  member: true,
  isSubscribed: true,
  confirmedAt: true,
  profile: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      profession: true,
      address: true,
      phone: true,
      photo: true,
      countryName: true,
      description: true,
      currency: {
        select: {
          name: true,
          symbol: true,
        },
      },
    },
  },
  _count: {
    select: {
      assignTypes: true,
      contributors: true,
    },
  },
  organizationId: true,
  organization: {
    select: {
      name: true,
      facebook: true,
      youtube: true,
      description: true,
      assignTypes: {
        select: {
          animalTypeId: true,
          userId: true,
        },
      },
      images: true,
    },
  },
};
