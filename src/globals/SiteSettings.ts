import type { GlobalConfig } from "payload";
import { allow, anyone } from "@/access/roles";
import { revalidateGlobal } from "@/lib/cms/revalidate";

// CMS-03: site settings, contact info, social links. FR-TEAM-03: company channels only.
export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site settings",
  admin: { group: "Settings" },
  access: { read: anyone, update: allow("content.site") },
  hooks: { afterChange: [revalidateGlobal("site-settings")] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Contact",
          fields: [
            { name: "email", type: "email", required: true },
            {
              name: "phones",
              type: "array",
              fields: [
                { name: "label", type: "text", localized: true },
                {
                  name: "number",
                  type: "text",
                  required: true,
                  admin: { description: "E.164, e.g. +250782634364" },
                },
              ],
            },
            {
              name: "whatsapp",
              type: "group",
              fields: [
                { name: "enabled", type: "checkbox", defaultValue: true },
                { name: "number", type: "text", admin: { description: "E.164 without spaces" } },
              ],
            },
            {
              name: "address",
              type: "group",
              fields: [
                { name: "street", type: "text" },
                { name: "building", type: "text" },
                { name: "district", type: "text" },
                { name: "city", type: "text", defaultValue: "Kigali" },
                { name: "country", type: "text", defaultValue: "Rwanda" },
                { name: "landmark", type: "text", localized: true },
                { name: "mapsUrl", type: "text" },
                { name: "lat", type: "number" },
                { name: "lng", type: "number" },
              ],
            },
            {
              name: "officeHours",
              type: "group",
              admin: {
                description:
                  "Kigali time (UTC+2). Used for “Open now” and the hours-overlap widget.",
              },
              fields: [
                { name: "openHour", type: "number", defaultValue: 8, min: 0, max: 23 },
                { name: "closeHour", type: "number", defaultValue: 17, min: 1, max: 24 },
                {
                  name: "days",
                  type: "select",
                  hasMany: true,
                  defaultValue: ["1", "2", "3", "4", "5"],
                  options: [
                    { label: "Mon", value: "1" },
                    { label: "Tue", value: "2" },
                    { label: "Wed", value: "3" },
                    { label: "Thu", value: "4" },
                    { label: "Fri", value: "5" },
                    { label: "Sat", value: "6" },
                    { label: "Sun", value: "0" },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Social",
          fields: [
            {
              name: "social",
              type: "array",
              fields: [
                {
                  name: "network",
                  type: "select",
                  required: true,
                  options: ["linkedin", "x", "facebook", "instagram", "youtube", "github"].map(
                    (v) => ({ label: v, value: v }),
                  ),
                },
                { name: "url", type: "text", required: true },
              ],
            },
          ],
        },
        {
          label: "Company",
          fields: [
            { name: "legalName", type: "text", defaultValue: "Universal Bridge Ltd" },
            { name: "foundingYear", type: "number", defaultValue: 2019 },
            {
              name: "registrationNumber",
              type: "text",
              admin: { description: "RDB number (OI-09)" },
            },
            { name: "tin", type: "text" },
          ],
        },
      ],
    },
  ],
};
