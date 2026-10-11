import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_page_views_audience" AS ENUM('visitor', 'member', 'staff');
  ALTER TABLE "page_views" ADD COLUMN "audience" "enum_page_views_audience" DEFAULT 'visitor';
  CREATE INDEX "page_views_audience_idx" ON "page_views" USING btree ("audience");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "page_views_audience_idx";
  ALTER TABLE "page_views" DROP COLUMN "audience";
  DROP TYPE "public"."enum_page_views_audience";`)
}
