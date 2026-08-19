import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class Punch extends Model {
  static table = 'punches';

  @field('company_id') companyId: string;
  @field('company_member_id') companyMemberId: string;
  @field('boat_assignment_id') boatAssignmentId?: string;
  @field('punch_type') punchType: 'in' | 'out';
  @date('device_timestamp') deviceTimestamp: Date;
  @date('synced_at') syncedAt?: Date;
  @field('latitude') latitude?: number;
  @field('longitude') longitude?: number;
  @field('created_offline') createdOffline: boolean;
  @field('flagged_out_of_schedule') flaggedOutOfSchedule: boolean;
  @readonly @date('created_at') createdAt: Date;
  @readonly @date('updated_at') updatedAt: Date;
}
