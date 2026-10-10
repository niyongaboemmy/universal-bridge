import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_leads_currency" AS ENUM('RWF', 'USD', 'EUR', 'KES', 'UGX');
  CREATE TYPE "public"."enum_employees_department" AS ENUM('leadership', 'engineering', 'design', 'academy', 'sales', 'operations', 'labs');
  CREATE TYPE "public"."enum_employees_employment" AS ENUM('full-time', 'part-time', 'contract', 'intern');
  CREATE TYPE "public"."enum_employees_status" AS ENUM('active', 'on-leave', 'left');
  CREATE TYPE "public"."enum_projects_kind" AS ENUM('client', 'internal-tool', 'product');
  CREATE TYPE "public"."enum_projects_status" AS ENUM('planning', 'active', 'on-hold', 'done', 'cancelled');
  CREATE TYPE "public"."enum_projects_health" AS ENUM('on-track', 'at-risk', 'off-track');
  CREATE TYPE "public"."enum_projects_currency" AS ENUM('RWF', 'USD', 'EUR', 'KES', 'UGX');
  CREATE TYPE "public"."enum_openings_fields_type" AS ENUM('text', 'textarea', 'email', 'tel', 'number', 'url', 'date', 'select', 'radio', 'checkbox', 'file');
  CREATE TYPE "public"."enum_openings_fields_width" AS ENUM('full', 'half');
  CREATE TYPE "public"."enum_openings_kind" AS ENUM('academy', 'internship', 'job', 'partner', 'event');
  CREATE TYPE "public"."enum_openings_status" AS ENUM('draft', 'open', 'paused', 'closed');
  CREATE TYPE "public"."enum_openings_mode" AS ENUM('onsite', 'remote', 'hybrid');
  CREATE TYPE "public"."enum_users_landing" AS ENUM('office', 'cms');
  CREATE TYPE "public"."enum_members_locale" AS ENUM('en', 'fr', 'rw');
  CREATE TYPE "public"."enum_roles_permissions" AS ENUM('office.overview', 'requests.view', 'requests.manage', 'demos.view', 'demos.manage', 'messages.view', 'messages.manage', 'applicants.academy', 'applicants.internship', 'applicants.job', 'applicants.partner', 'applicants.event', 'openings.view', 'openings.manage', 'projects.view', 'projects.manage', 'people.view', 'people.manage', 'analytics.view', 'subscribers.view', 'users.manage', 'members.manage', 'roles.manage', 'settings.manage', 'privacy.manage', 'audit.view', 'data.export', 'cms.access', 'content.site', 'content.academy', 'content.careers', 'content.team', 'content.media', 'content.announcement', 'content.liveEdit', 'member.profile', 'member.apply', 'member.applications');
  CREATE TYPE "public"."enum_roles_audience" AS ENUM('staff', 'member');
  CREATE TYPE "public"."enum_roles_color" AS ENUM('blue', 'orange', 'violet', 'green', 'amber', 'teal', 'rose', 'slate');
  CREATE TYPE "public"."enum_notifications_kind" AS ENUM('request', 'demo', 'message', 'application', 'assignment', 'opening', 'project', 'account', 'system');
  CREATE TYPE "public"."enum_audit_log_actor_type" AS ENUM('staff', 'member', 'public', 'system');
  CREATE TYPE "public"."enum_system_settings_accounts_staff_landing" AS ENUM('office', 'cms');
  CREATE TABLE "employees" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"job_title" varchar NOT NULL,
  	"department" "enum_employees_department" NOT NULL,
  	"employment" "enum_employees_employment" DEFAULT 'full-time' NOT NULL,
  	"status" "enum_employees_status" DEFAULT 'active' NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone,
  	"manager_id" integer,
  	"user_id" integer,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "employees_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "projects_milestones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"due" timestamp(3) with time zone,
  	"done" boolean
  );
  
  CREATE TABLE "projects_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"code" varchar,
  	"kind" "enum_projects_kind" DEFAULT 'client' NOT NULL,
  	"status" "enum_projects_status" DEFAULT 'planning' NOT NULL,
  	"health" "enum_projects_health" DEFAULT 'on-track' NOT NULL,
  	"summary" varchar,
  	"client" varchar,
  	"lead_id" integer,
  	"product_id" integer,
  	"start_date" timestamp(3) with time zone,
  	"due_date" timestamp(3) with time zone,
  	"progress" numeric DEFAULT 0,
  	"budget" numeric,
  	"currency" "enum_projects_currency",
  	"owner_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "projects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"employees_id" integer
  );
  
  CREATE TABLE "page_views" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"path" varchar NOT NULL,
  	"locale" varchar,
  	"referrer" varchar,
  	"utm_source" varchar,
  	"utm_medium" varchar,
  	"utm_campaign" varchar,
  	"country" varchar,
  	"device" varchar,
  	"browser" varchar,
  	"os" varchar,
  	"visitor" varchar,
  	"session" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "openings_fields" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"type" "enum_openings_fields_type" DEFAULT 'text' NOT NULL,
  	"required" boolean DEFAULT false,
  	"width" "enum_openings_fields_width" DEFAULT 'full',
  	"options" varchar
  );
  
  CREATE TABLE "openings_fields_locales" (
  	"label" varchar NOT NULL,
  	"help" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "openings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"kind" "enum_openings_kind" NOT NULL,
  	"status" "enum_openings_status" DEFAULT 'draft' NOT NULL,
  	"mode" "enum_openings_mode" DEFAULT 'onsite',
  	"opens_at" timestamp(3) with time zone,
  	"closes_at" timestamp(3) with time zone,
  	"starts_at" timestamp(3) with time zone,
  	"seats" numeric,
  	"cover_id" integer,
  	"program_id" integer,
  	"intake_id" integer,
  	"job_id" integer,
  	"event_id" integer,
  	"owner_id" integer,
  	"require_account" boolean DEFAULT false,
  	"featured" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "openings_locales" (
  	"title" varchar NOT NULL,
  	"location" varchar,
  	"summary" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "users_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"roles_id" integer
  );
  
  CREATE TABLE "members_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "members" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"phone" varchar,
  	"country" varchar,
  	"role_id" integer,
  	"avatar_id" integer,
  	"locale" "enum_members_locale" DEFAULT 'en',
  	"newsletter" boolean DEFAULT false,
  	"last_login_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "roles_permissions" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_roles_permissions",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "roles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"description" varchar,
  	"audience" "enum_roles_audience" DEFAULT 'staff' NOT NULL,
  	"color" "enum_roles_color" DEFAULT 'blue',
  	"system" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "avatars" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_small_url" varchar,
  	"sizes_small_width" numeric,
  	"sizes_small_height" numeric,
  	"sizes_small_mime_type" varchar,
  	"sizes_small_filesize" numeric,
  	"sizes_small_filename" varchar
  );
  
  CREATE TABLE "notifications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"kind" "enum_notifications_kind" NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar,
  	"href" varchar,
  	"read_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "system_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email_from_name" varchar DEFAULT 'Universal Bridge',
  	"email_from_address" varchar,
  	"email_inboxes_sales" varchar,
  	"email_inboxes_academy" varchar,
  	"email_inboxes_careers" varchar,
  	"email_inboxes_partnerships" varchar,
  	"email_inboxes_press" varchar,
  	"email_inboxes_support" varchar,
  	"email_inboxes_events" varchar,
  	"accounts_registration_open" boolean DEFAULT true,
  	"accounts_default_member_role_id" integer,
  	"accounts_applicant_role_id" integer,
  	"accounts_staff_landing" "enum_system_settings_accounts_staff_landing" DEFAULT 'office',
  	"accounts_sso_domains" varchar,
  	"workflow_response_hours" numeric DEFAULT 24,
  	"workflow_follow_up_days" numeric DEFAULT 3,
  	"workflow_notify_applicants" boolean DEFAULT true,
  	"workflow_board_limit" numeric DEFAULT 40,
  	"workflow_default_currency" varchar DEFAULT 'RWF',
  	"uploads_max_mb" numeric DEFAULT 5,
  	"uploads_clamav_host" varchar,
  	"integrations_plausible_domain" varchar,
  	"integrations_cal_link" varchar,
  	"integrations_crm_webhook_url" varchar,
  	"integrations_team_webhook_url" varchar,
  	"retention_leads_months" numeric DEFAULT 24,
  	"retention_applications_months" numeric DEFAULT 12,
  	"retention_page_views_months" numeric DEFAULT 13,
  	"retention_orphan_files_days" numeric DEFAULT 30,
  	"retention_subscribers_days" numeric DEFAULT 30,
  	"site_noindex" boolean DEFAULT false,
  	"site_maintenance" boolean DEFAULT false,
  	"site_maintenance_message" varchar,
  	"site_maintenance_until" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "leads" ADD COLUMN "value" numeric;
  ALTER TABLE "leads" ADD COLUMN "currency" "enum_leads_currency";
  ALTER TABLE "leads" ADD COLUMN "next_follow_up_at" timestamp(3) with time zone;
  ALTER TABLE "applications" ADD COLUMN "opening_id" integer;
  ALTER TABLE "applications" ADD COLUMN "member_id" integer;
  ALTER TABLE "applications" ADD COLUMN "rating" numeric;
  ALTER TABLE "users" ADD COLUMN "job_title" varchar;
  ALTER TABLE "users" ADD COLUMN "phone" varchar;
  ALTER TABLE "users" ADD COLUMN "avatar_id" integer;
  ALTER TABLE "users" ADD COLUMN "landing" "enum_users_landing" DEFAULT 'office';
  ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp(3) with time zone;
  ALTER TABLE "audit_log" ADD COLUMN "member_id" integer;
  ALTER TABLE "audit_log" ADD COLUMN "actor_type" "enum_audit_log_actor_type";
  ALTER TABLE "audit_log" ADD COLUMN "actor_name" varchar;
  ALTER TABLE "audit_log" ADD COLUMN "label" varchar;
  ALTER TABLE "audit_log" ADD COLUMN "ip" varchar;
  ALTER TABLE "audit_log" ADD COLUMN "device" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "employees_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "projects_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "page_views_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "openings_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "members_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "roles_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "avatars_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "notifications_id" integer;
  ALTER TABLE "payload_preferences_rels" ADD COLUMN "members_id" integer;
  ALTER TABLE "employees" ADD CONSTRAINT "employees_manager_id_employees_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "employees_texts" ADD CONSTRAINT "employees_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_milestones" ADD CONSTRAINT "projects_milestones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_links" ADD CONSTRAINT "projects_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_employees_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_employees_fk" FOREIGN KEY ("employees_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "openings_fields" ADD CONSTRAINT "openings_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."openings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "openings_fields_locales" ADD CONSTRAINT "openings_fields_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."openings_fields"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "openings" ADD CONSTRAINT "openings_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "openings" ADD CONSTRAINT "openings_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "openings" ADD CONSTRAINT "openings_intake_id_intakes_id_fk" FOREIGN KEY ("intake_id") REFERENCES "public"."intakes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "openings" ADD CONSTRAINT "openings_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "openings" ADD CONSTRAINT "openings_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "openings" ADD CONSTRAINT "openings_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "openings_locales" ADD CONSTRAINT "openings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."openings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_roles_fk" FOREIGN KEY ("roles_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "members_sessions" ADD CONSTRAINT "members_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "members" ADD CONSTRAINT "members_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "members" ADD CONSTRAINT "members_avatar_id_avatars_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."avatars"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "roles_permissions" ADD CONSTRAINT "roles_permissions_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_accounts_default_member_role_id_roles_id_fk" FOREIGN KEY ("accounts_default_member_role_id") REFERENCES "public"."roles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_accounts_applicant_role_id_roles_id_fk" FOREIGN KEY ("accounts_applicant_role_id") REFERENCES "public"."roles"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "employees_department_idx" ON "employees" USING btree ("department");
  CREATE INDEX "employees_status_idx" ON "employees" USING btree ("status");
  CREATE UNIQUE INDEX "employees_email_idx" ON "employees" USING btree ("email");
  CREATE INDEX "employees_manager_idx" ON "employees" USING btree ("manager_id");
  CREATE INDEX "employees_user_idx" ON "employees" USING btree ("user_id");
  CREATE INDEX "employees_updated_at_idx" ON "employees" USING btree ("updated_at");
  CREATE INDEX "employees_created_at_idx" ON "employees" USING btree ("created_at");
  CREATE INDEX "employees_texts_order_parent" ON "employees_texts" USING btree ("order","parent_id");
  CREATE INDEX "projects_milestones_order_idx" ON "projects_milestones" USING btree ("_order");
  CREATE INDEX "projects_milestones_parent_id_idx" ON "projects_milestones" USING btree ("_parent_id");
  CREATE INDEX "projects_links_order_idx" ON "projects_links" USING btree ("_order");
  CREATE INDEX "projects_links_parent_id_idx" ON "projects_links" USING btree ("_parent_id");
  CREATE INDEX "projects_kind_idx" ON "projects" USING btree ("kind");
  CREATE INDEX "projects_status_idx" ON "projects" USING btree ("status");
  CREATE INDEX "projects_lead_idx" ON "projects" USING btree ("lead_id");
  CREATE INDEX "projects_product_idx" ON "projects" USING btree ("product_id");
  CREATE INDEX "projects_due_date_idx" ON "projects" USING btree ("due_date");
  CREATE INDEX "projects_owner_idx" ON "projects" USING btree ("owner_id");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "projects_rels_order_idx" ON "projects_rels" USING btree ("order");
  CREATE INDEX "projects_rels_parent_idx" ON "projects_rels" USING btree ("parent_id");
  CREATE INDEX "projects_rels_path_idx" ON "projects_rels" USING btree ("path");
  CREATE INDEX "projects_rels_employees_id_idx" ON "projects_rels" USING btree ("employees_id");
  CREATE INDEX "page_views_path_idx" ON "page_views" USING btree ("path");
  CREATE INDEX "page_views_referrer_idx" ON "page_views" USING btree ("referrer");
  CREATE INDEX "page_views_country_idx" ON "page_views" USING btree ("country");
  CREATE INDEX "page_views_visitor_idx" ON "page_views" USING btree ("visitor");
  CREATE INDEX "page_views_session_idx" ON "page_views" USING btree ("session");
  CREATE INDEX "page_views_updated_at_idx" ON "page_views" USING btree ("updated_at");
  CREATE INDEX "page_views_created_at_idx" ON "page_views" USING btree ("created_at");
  CREATE INDEX "openings_fields_order_idx" ON "openings_fields" USING btree ("_order");
  CREATE INDEX "openings_fields_parent_id_idx" ON "openings_fields" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "openings_fields_locales_locale_parent_id_unique" ON "openings_fields_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "openings_slug_idx" ON "openings" USING btree ("slug");
  CREATE INDEX "openings_kind_idx" ON "openings" USING btree ("kind");
  CREATE INDEX "openings_status_idx" ON "openings" USING btree ("status");
  CREATE INDEX "openings_closes_at_idx" ON "openings" USING btree ("closes_at");
  CREATE INDEX "openings_cover_idx" ON "openings" USING btree ("cover_id");
  CREATE INDEX "openings_program_idx" ON "openings" USING btree ("program_id");
  CREATE INDEX "openings_intake_idx" ON "openings" USING btree ("intake_id");
  CREATE INDEX "openings_job_idx" ON "openings" USING btree ("job_id");
  CREATE INDEX "openings_event_idx" ON "openings" USING btree ("event_id");
  CREATE INDEX "openings_owner_idx" ON "openings" USING btree ("owner_id");
  CREATE INDEX "openings_updated_at_idx" ON "openings" USING btree ("updated_at");
  CREATE INDEX "openings_created_at_idx" ON "openings" USING btree ("created_at");
  CREATE UNIQUE INDEX "openings_locales_locale_parent_id_unique" ON "openings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "users_rels_order_idx" ON "users_rels" USING btree ("order");
  CREATE INDEX "users_rels_parent_idx" ON "users_rels" USING btree ("parent_id");
  CREATE INDEX "users_rels_path_idx" ON "users_rels" USING btree ("path");
  CREATE INDEX "users_rels_roles_id_idx" ON "users_rels" USING btree ("roles_id");
  CREATE INDEX "members_sessions_order_idx" ON "members_sessions" USING btree ("_order");
  CREATE INDEX "members_sessions_parent_id_idx" ON "members_sessions" USING btree ("_parent_id");
  CREATE INDEX "members_role_idx" ON "members" USING btree ("role_id");
  CREATE INDEX "members_avatar_idx" ON "members" USING btree ("avatar_id");
  CREATE INDEX "members_updated_at_idx" ON "members" USING btree ("updated_at");
  CREATE INDEX "members_created_at_idx" ON "members" USING btree ("created_at");
  CREATE UNIQUE INDEX "members_email_idx" ON "members" USING btree ("email");
  CREATE INDEX "roles_permissions_order_idx" ON "roles_permissions" USING btree ("order");
  CREATE INDEX "roles_permissions_parent_idx" ON "roles_permissions" USING btree ("parent_id");
  CREATE UNIQUE INDEX "roles_slug_idx" ON "roles" USING btree ("slug");
  CREATE INDEX "roles_updated_at_idx" ON "roles" USING btree ("updated_at");
  CREATE INDEX "roles_created_at_idx" ON "roles" USING btree ("created_at");
  CREATE INDEX "avatars_updated_at_idx" ON "avatars" USING btree ("updated_at");
  CREATE INDEX "avatars_created_at_idx" ON "avatars" USING btree ("created_at");
  CREATE UNIQUE INDEX "avatars_filename_idx" ON "avatars" USING btree ("filename");
  CREATE INDEX "avatars_sizes_small_sizes_small_filename_idx" ON "avatars" USING btree ("sizes_small_filename");
  CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id");
  CREATE INDEX "notifications_kind_idx" ON "notifications" USING btree ("kind");
  CREATE INDEX "notifications_read_at_idx" ON "notifications" USING btree ("read_at");
  CREATE INDEX "notifications_updated_at_idx" ON "notifications" USING btree ("updated_at");
  CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");
  CREATE INDEX "system_settings_accounts_accounts_default_member_role_idx" ON "system_settings" USING btree ("accounts_default_member_role_id");
  CREATE INDEX "system_settings_accounts_accounts_applicant_role_idx" ON "system_settings" USING btree ("accounts_applicant_role_id");
  ALTER TABLE "applications" ADD CONSTRAINT "applications_opening_id_openings_id_fk" FOREIGN KEY ("opening_id") REFERENCES "public"."openings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "applications" ADD CONSTRAINT "applications_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_avatar_id_avatars_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."avatars"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_employees_fk" FOREIGN KEY ("employees_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_page_views_fk" FOREIGN KEY ("page_views_id") REFERENCES "public"."page_views"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_openings_fk" FOREIGN KEY ("openings_id") REFERENCES "public"."openings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_members_fk" FOREIGN KEY ("members_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_roles_fk" FOREIGN KEY ("roles_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_avatars_fk" FOREIGN KEY ("avatars_id") REFERENCES "public"."avatars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_notifications_fk" FOREIGN KEY ("notifications_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_members_fk" FOREIGN KEY ("members_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "leads_next_follow_up_at_idx" ON "leads" USING btree ("next_follow_up_at");
  CREATE INDEX "applications_opening_idx" ON "applications" USING btree ("opening_id");
  CREATE INDEX "applications_member_idx" ON "applications" USING btree ("member_id");
  CREATE INDEX "users_avatar_idx" ON "users" USING btree ("avatar_id");
  CREATE INDEX "audit_log_member_idx" ON "audit_log" USING btree ("member_id");
  CREATE INDEX "audit_log_actor_type_idx" ON "audit_log" USING btree ("actor_type");
  CREATE INDEX "payload_locked_documents_rels_employees_id_idx" ON "payload_locked_documents_rels" USING btree ("employees_id");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_page_views_id_idx" ON "payload_locked_documents_rels" USING btree ("page_views_id");
  CREATE INDEX "payload_locked_documents_rels_openings_id_idx" ON "payload_locked_documents_rels" USING btree ("openings_id");
  CREATE INDEX "payload_locked_documents_rels_members_id_idx" ON "payload_locked_documents_rels" USING btree ("members_id");
  CREATE INDEX "payload_locked_documents_rels_roles_id_idx" ON "payload_locked_documents_rels" USING btree ("roles_id");
  CREATE INDEX "payload_locked_documents_rels_avatars_id_idx" ON "payload_locked_documents_rels" USING btree ("avatars_id");
  CREATE INDEX "payload_locked_documents_rels_notifications_id_idx" ON "payload_locked_documents_rels" USING btree ("notifications_id");
  CREATE INDEX "payload_preferences_rels_members_id_idx" ON "payload_preferences_rels" USING btree ("members_id");`)

  // Data: the built-in roles (as of this release; their permissions stay editable), then
  // every staff account keeps the roles it had. The old "users_roles" table stays as the
  // hidden "legacyRoles" field so a rollback to the previous release still works.
  await db.execute(sql`
  INSERT INTO "roles" ("name", "slug", "description", "audience", "color", "system") VALUES ('Super admin', 'super', 'Everything, including accounts, roles and settings.', 'staff', 'orange', true);
  INSERT INTO "roles_permissions" ("order", "parent_id", "value") SELECT v.ord, r."id", v.perm::"enum_roles_permissions" FROM "roles" r, (VALUES (1, 'office.overview'), (2, 'requests.view'), (3, 'requests.manage'), (4, 'demos.view'), (5, 'demos.manage'), (6, 'messages.view'), (7, 'messages.manage'), (8, 'applicants.academy'), (9, 'applicants.internship'), (10, 'applicants.job'), (11, 'applicants.partner'), (12, 'applicants.event'), (13, 'openings.view'), (14, 'openings.manage'), (15, 'projects.view'), (16, 'projects.manage'), (17, 'people.view'), (18, 'people.manage'), (19, 'analytics.view'), (20, 'subscribers.view'), (21, 'users.manage'), (22, 'members.manage'), (23, 'roles.manage'), (24, 'settings.manage'), (25, 'privacy.manage'), (26, 'audit.view'), (27, 'data.export'), (28, 'cms.access'), (29, 'content.site'), (30, 'content.academy'), (31, 'content.careers'), (32, 'content.team'), (33, 'content.media'), (34, 'content.announcement'), (35, 'content.liveEdit')) AS v(ord, perm) WHERE r."slug" = 'super';
  INSERT INTO "roles" ("name", "slug", "description", "audience", "color", "system") VALUES ('Editor', 'editor', 'Website content and event sign-ups.', 'staff', 'blue', true);
  INSERT INTO "roles_permissions" ("order", "parent_id", "value") SELECT v.ord, r."id", v.perm::"enum_roles_permissions" FROM "roles" r, (VALUES (1, 'office.overview'), (2, 'analytics.view'), (3, 'cms.access'), (4, 'data.export'), (5, 'applicants.event'), (6, 'subscribers.view'), (7, 'content.site'), (8, 'content.careers'), (9, 'content.team'), (10, 'content.media'), (11, 'content.announcement'), (12, 'content.liveEdit')) AS v(ord, perm) WHERE r."slug" = 'editor';
  INSERT INTO "roles" ("name", "slug", "description", "audience", "color", "system") VALUES ('Academy', 'academy', 'Trainees, interns, events, programs and certificates.', 'staff', 'violet', true);
  INSERT INTO "roles_permissions" ("order", "parent_id", "value") SELECT v.ord, r."id", v.perm::"enum_roles_permissions" FROM "roles" r, (VALUES (1, 'office.overview'), (2, 'analytics.view'), (3, 'cms.access'), (4, 'data.export'), (5, 'applicants.academy'), (6, 'applicants.internship'), (7, 'applicants.event'), (8, 'openings.view'), (9, 'openings.manage'), (10, 'content.academy'), (11, 'content.media'), (12, 'content.announcement'), (13, 'content.liveEdit')) AS v(ord, perm) WHERE r."slug" = 'academy';
  INSERT INTO "roles" ("name", "slug", "description", "audience", "color", "system") VALUES ('HR', 'hr', 'Employees, job and internship applicants, job posts.', 'staff', 'green', true);
  INSERT INTO "roles_permissions" ("order", "parent_id", "value") SELECT v.ord, r."id", v.perm::"enum_roles_permissions" FROM "roles" r, (VALUES (1, 'office.overview'), (2, 'analytics.view'), (3, 'cms.access'), (4, 'data.export'), (5, 'applicants.internship'), (6, 'applicants.job'), (7, 'openings.view'), (8, 'openings.manage'), (9, 'projects.view'), (10, 'people.view'), (11, 'people.manage'), (12, 'content.careers'), (13, 'content.team'), (14, 'content.media'), (15, 'content.liveEdit')) AS v(ord, perm) WHERE r."slug" = 'hr';
  INSERT INTO "roles" ("name", "slug", "description", "audience", "color", "system") VALUES ('Sales', 'sales', 'Service and demo requests, messages, partners and projects.', 'staff', 'amber', true);
  INSERT INTO "roles_permissions" ("order", "parent_id", "value") SELECT v.ord, r."id", v.perm::"enum_roles_permissions" FROM "roles" r, (VALUES (1, 'office.overview'), (2, 'analytics.view'), (3, 'cms.access'), (4, 'data.export'), (5, 'requests.view'), (6, 'requests.manage'), (7, 'demos.view'), (8, 'demos.manage'), (9, 'messages.view'), (10, 'messages.manage'), (11, 'applicants.partner'), (12, 'projects.view'), (13, 'projects.manage'), (14, 'subscribers.view'), (15, 'content.liveEdit')) AS v(ord, perm) WHERE r."slug" = 'sales';
  INSERT INTO "roles" ("name", "slug", "description", "audience", "color", "system") VALUES ('Visitor', 'visitor', 'Registered on the website; can apply to openings.', 'member', 'slate', true);
  INSERT INTO "roles_permissions" ("order", "parent_id", "value") SELECT v.ord, r."id", v.perm::"enum_roles_permissions" FROM "roles" r, (VALUES (1, 'member.profile'), (2, 'member.apply')) AS v(ord, perm) WHERE r."slug" = 'visitor';
  INSERT INTO "roles" ("name", "slug", "description", "audience", "color", "system") VALUES ('Applicant', 'applicant', 'Has applied at least once; can follow their applications.', 'member', 'teal', true);
  INSERT INTO "roles_permissions" ("order", "parent_id", "value") SELECT v.ord, r."id", v.perm::"enum_roles_permissions" FROM "roles" r, (VALUES (1, 'member.profile'), (2, 'member.apply'), (3, 'member.applications')) AS v(ord, perm) WHERE r."slug" = 'applicant';
  INSERT INTO "users_rels" ("order", "parent_id", "path", "roles_id")
    SELECT ur."order", ur."parent_id", 'roles', r."id"
    FROM "users_roles" ur JOIN "roles" r ON r."slug" = ur."value"::text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "employees" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "employees_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects_milestones" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_views" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "openings_fields" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "openings_fields_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "openings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "openings_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "users_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "members_sessions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "members" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "roles_permissions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "roles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "avatars" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "notifications" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "system_settings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "employees" CASCADE;
  DROP TABLE "employees_texts" CASCADE;
  DROP TABLE "projects_milestones" CASCADE;
  DROP TABLE "projects_links" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "projects_rels" CASCADE;
  DROP TABLE "page_views" CASCADE;
  DROP TABLE "openings_fields" CASCADE;
  DROP TABLE "openings_fields_locales" CASCADE;
  DROP TABLE "openings" CASCADE;
  DROP TABLE "openings_locales" CASCADE;
  DROP TABLE "users_rels" CASCADE;
  DROP TABLE "members_sessions" CASCADE;
  DROP TABLE "members" CASCADE;
  DROP TABLE "roles_permissions" CASCADE;
  DROP TABLE "roles" CASCADE;
  DROP TABLE "avatars" CASCADE;
  DROP TABLE "notifications" CASCADE;
  DROP TABLE "system_settings" CASCADE;
  ALTER TABLE "applications" DROP CONSTRAINT "applications_opening_id_openings_id_fk";
  
  ALTER TABLE "applications" DROP CONSTRAINT "applications_member_id_members_id_fk";
  
  ALTER TABLE "users" DROP CONSTRAINT "users_avatar_id_avatars_id_fk";
  
  ALTER TABLE "audit_log" DROP CONSTRAINT "audit_log_member_id_members_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_employees_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_projects_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_page_views_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_openings_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_members_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_roles_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_avatars_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_notifications_fk";
  
  ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT "payload_preferences_rels_members_fk";
  
  DROP INDEX "leads_next_follow_up_at_idx";
  DROP INDEX "applications_opening_idx";
  DROP INDEX "applications_member_idx";
  DROP INDEX "users_avatar_idx";
  DROP INDEX "audit_log_member_idx";
  DROP INDEX "audit_log_actor_type_idx";
  DROP INDEX "payload_locked_documents_rels_employees_id_idx";
  DROP INDEX "payload_locked_documents_rels_projects_id_idx";
  DROP INDEX "payload_locked_documents_rels_page_views_id_idx";
  DROP INDEX "payload_locked_documents_rels_openings_id_idx";
  DROP INDEX "payload_locked_documents_rels_members_id_idx";
  DROP INDEX "payload_locked_documents_rels_roles_id_idx";
  DROP INDEX "payload_locked_documents_rels_avatars_id_idx";
  DROP INDEX "payload_locked_documents_rels_notifications_id_idx";
  DROP INDEX "payload_preferences_rels_members_id_idx";
  ALTER TABLE "leads" DROP COLUMN "value";
  ALTER TABLE "leads" DROP COLUMN "currency";
  ALTER TABLE "leads" DROP COLUMN "next_follow_up_at";
  ALTER TABLE "applications" DROP COLUMN "opening_id";
  ALTER TABLE "applications" DROP COLUMN "member_id";
  ALTER TABLE "applications" DROP COLUMN "rating";
  ALTER TABLE "users" DROP COLUMN "job_title";
  ALTER TABLE "users" DROP COLUMN "phone";
  ALTER TABLE "users" DROP COLUMN "avatar_id";
  ALTER TABLE "users" DROP COLUMN "landing";
  ALTER TABLE "users" DROP COLUMN "last_login_at";
  ALTER TABLE "audit_log" DROP COLUMN "member_id";
  ALTER TABLE "audit_log" DROP COLUMN "actor_type";
  ALTER TABLE "audit_log" DROP COLUMN "actor_name";
  ALTER TABLE "audit_log" DROP COLUMN "label";
  ALTER TABLE "audit_log" DROP COLUMN "ip";
  ALTER TABLE "audit_log" DROP COLUMN "device";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "employees_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "projects_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "page_views_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "openings_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "members_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "roles_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "avatars_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "notifications_id";
  ALTER TABLE "payload_preferences_rels" DROP COLUMN "members_id";
  DROP TYPE "public"."enum_leads_currency";
  DROP TYPE "public"."enum_employees_department";
  DROP TYPE "public"."enum_employees_employment";
  DROP TYPE "public"."enum_employees_status";
  DROP TYPE "public"."enum_projects_kind";
  DROP TYPE "public"."enum_projects_status";
  DROP TYPE "public"."enum_projects_health";
  DROP TYPE "public"."enum_projects_currency";
  DROP TYPE "public"."enum_openings_fields_type";
  DROP TYPE "public"."enum_openings_fields_width";
  DROP TYPE "public"."enum_openings_kind";
  DROP TYPE "public"."enum_openings_status";
  DROP TYPE "public"."enum_openings_mode";
  DROP TYPE "public"."enum_users_landing";
  DROP TYPE "public"."enum_members_locale";
  DROP TYPE "public"."enum_roles_permissions";
  DROP TYPE "public"."enum_roles_audience";
  DROP TYPE "public"."enum_roles_color";
  DROP TYPE "public"."enum_notifications_kind";
  DROP TYPE "public"."enum_audit_log_actor_type";
  DROP TYPE "public"."enum_system_settings_accounts_staff_landing";`)
}
