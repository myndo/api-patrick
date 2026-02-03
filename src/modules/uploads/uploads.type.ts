import { QueryTypeEnum } from '../../../prisma/generated/prisma/enums';
import { Prisma, Upload } from '../../app/database/prisma';

export type UploadType = 'IMAGE' | 'FILE';

export enum FieldnameType {
  Attachments = 'attachments',
  AttachmentFiles = 'attachmentFiles',
}
export type GetUploadsSelections = {
  search?: string;
  uploadType?: string;
  model?: QueryTypeEnum;
  organizationId?: Upload['organizationId'];
  uploadableId?: Upload['uploadableId'];
};

export type UpdateUploadSelections = {
  uploadId: Upload['id'];
};

export type CreateUploadOptions = Prisma.UploadCreateInput;

export type UpdateUploadOptions = Prisma.UploadUpdateInput;

export type ExpressFile = Express.Multer.File;

export type UploadToAwsModel = Prisma.UploadCreateInput & {
  files?: Array<ExpressFile>;
  file?: ExpressFile;
  model: QueryTypeEnum;
  folder: string;
};
