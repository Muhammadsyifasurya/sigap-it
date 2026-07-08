import { Prisma } from '@prisma/client';

export class CreateDocumentDto {
  docNumber: string;
  title: string;
  level?: string;
  currentVersion?: string;
  status?: string;
  filePath?: string;
  creator: Prisma.UserCreateNestedOneWithoutDocumentsInput;
}
