import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "system_settings" ADD COLUMN "integrations_ga_enabled" boolean DEFAULT true;
  ALTER TABLE "system_settings" ADD COLUMN "integrations_ga_measurement_id" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "system_settings" DROP COLUMN "integrations_ga_enabled";
  ALTER TABLE "system_settings" DROP COLUMN "integrations_ga_measurement_id";`)
}
