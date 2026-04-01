import { IsEnum } from 'class-validator';
import { PurchaseRequestStatus } from '../../../common/enums';

export class UpdatePurchaseRequestStatusDto {
  @IsEnum(PurchaseRequestStatus)
  status: PurchaseRequestStatus;
}
