import type { Block, Field } from "payload";
import { ICON_NAMES } from "@/lib/icons";

const heading: Field[] = [
  { name: "eyebrow", type: "text", localized: true },
  {
    name: "title",
    type: "text",
    localized: true,
    admin: { description: "Wrap one or two words in *asterisks* to colour them orange." },
  },
  { name: "lead", type: "textarea", localized: true },
  {
    name: "anchor",
    type: "text",
    admin: { description: "Optional section id for links, e.g. engagement" },
  },
];

const link = (name: string, label?: string): Field => ({
  name,
  type: "group",
  label: label ?? name,
  fields: [
    { name: "label", type: "text", localized: true },
    { name: "href", type: "text", admin: { description: "Path without locale, e.g. /contact" } },
  ],
});

const icon: Field = {
  name: "icon",
  type: "select",
  options: ICON_NAMES.map((v) => ({ label: v, value: v })),
};

// CMS-04 page-builder blocks. Blocks marked "auto" pull their items from
// collections, so editors only write the headings.
export const blocks: Block[] = [
  {
    slug: "hero",
    interfaceName: "HeroBlock",
    labels: { singular: "Hero", plural: "Heroes" },
    fields: [
      ...heading,
      {
        name: "mood",
        type: "select",
        defaultValue: "night",
        options: ["night", "day"].map((v) => ({ label: v, value: v })),
      },
      link("primary", "Primary button"),
      link("secondary", "Secondary button"),
      {
        name: "chip",
        type: "text",
        localized: true,
        admin: { description: "Small glass label, e.g. “Built in Kigali · Delivering worldwide”" },
      },
      {
        name: "visual",
        type: "select",
        defaultValue: "media",
        options: [
          { label: "Photo (below)", value: "media" },
          { label: "Showcase — live product, Labs sensor and dashboard", value: "showcase" },
        ],
        admin: { description: "Showcase shows what UB builds instead of a photo (home page)." },
      },
      {
        name: "media",
        type: "upload",
        relationTo: "media",
        admin: {
          description: "Real team photo (OI-06). Optional — the circuit art is shown without it.",
          condition: (_, sibling) => sibling?.visual !== "showcase",
        },
      },
    ],
  },
  {
    slug: "logoCloud",
    interfaceName: "LogoCloudBlock",
    labels: { singular: "Logo cloud (auto)", plural: "Logo clouds" },
    fields: heading,
  },
  {
    slug: "servicesGrid",
    interfaceName: "ServicesGridBlock",
    labels: { singular: "Services grid (auto)", plural: "Services grids" },
    fields: [
      ...heading,
      { name: "showFilter", type: "checkbox", label: "Show pillar filter (services overview)" },
    ],
  },
  {
    slug: "industriesGrid",
    interfaceName: "IndustriesGridBlock",
    labels: { singular: "Industries grid (auto)", plural: "Industries grids" },
    fields: heading,
  },
  {
    slug: "statsBand",
    interfaceName: "StatsBandBlock",
    labels: { singular: "Stats (auto, verified only)", plural: "Stats" },
    fields: heading,
  },
  {
    slug: "featuredWork",
    interfaceName: "FeaturedWorkBlock",
    labels: { singular: "Featured work (auto)", plural: "Featured work" },
    fields: heading,
  },
  {
    slug: "productsShowcase",
    interfaceName: "ProductsShowcaseBlock",
    labels: { singular: "Products (auto)", plural: "Products" },
    fields: heading,
  },
  {
    // FR-HOME-11: the three newest published posts; hidden when there are none.
    slug: "latestPosts",
    interfaceName: "LatestPostsBlock",
    labels: { singular: "Latest insights (auto)", plural: "Latest insights" },
    fields: heading,
  },
  {
    slug: "testimonials",
    interfaceName: "TestimonialsBlock",
    labels: { singular: "Testimonials (auto, approved only)", plural: "Testimonials" },
    fields: heading,
  },
  {
    slug: "process",
    interfaceName: "ProcessBlock",
    labels: { singular: "Process", plural: "Processes" },
    fields: [
      ...heading,
      {
        name: "steps",
        type: "array",
        localized: true,
        fields: [
          { name: "title", type: "text", required: true },
          { name: "body", type: "textarea" },
        ],
      },
    ],
  },
  {
    slug: "labs",
    interfaceName: "LabsBlock",
    labels: { singular: "Labs", plural: "Labs" },
    fields: [
      ...heading,
      {
        name: "hubs",
        type: "array",
        localized: true,
        fields: [
          { name: "title", type: "text", required: true },
          { name: "body", type: "textarea" },
          icon,
          { name: "href", type: "text" },
          {
            name: "media",
            type: "upload",
            relationTo: "media",
            admin: { description: "Photo of the hub (real photo preferred, OI-06)" },
          },
        ],
      },
    ],
  },
  {
    slug: "story",
    interfaceName: "StoryBlock",
    labels: { singular: "Ideas → Code → Impact story", plural: "Stories" },
    fields: [
      ...heading,
      {
        name: "steps",
        type: "array",
        localized: true,
        minRows: 3,
        maxRows: 3,
        fields: [
          { name: "eyebrow", type: "text", required: true },
          { name: "title", type: "text", required: true },
          { name: "body", type: "textarea" },
          {
            name: "metric",
            type: "text",
            admin: { description: "Impact step only: e.g. “−42% processing time”" },
          },
        ],
      },
    ],
  },
  {
    slug: "academyTeaser",
    interfaceName: "AcademyTeaserBlock",
    labels: { singular: "Academy teaser", plural: "Academy teasers" },
    fields: [
      ...heading,
      link("cta", "Button"),
      { name: "media", type: "upload", relationTo: "media" },
    ],
  },
  {
    slug: "globalReach",
    interfaceName: "GlobalReachBlock",
    labels: { singular: "Kigali → World", plural: "Kigali → World" },
    fields: [
      ...heading,
      {
        name: "markets",
        type: "array",
        admin: {
          description:
            "Countries UB has delivered to (verified only, OI-13). Each draws an arc from Kigali.",
        },
        fields: [
          { name: "name", type: "text", required: true, localized: true },
          {
            type: "row",
            fields: [
              { name: "lat", type: "number", required: true },
              { name: "lng", type: "number", required: true },
            ],
          },
        ],
      },
      {
        name: "points",
        type: "array",
        localized: true,
        fields: [
          { name: "title", type: "text", required: true },
          { name: "body", type: "text" },
        ],
      },
    ],
  },
  {
    slug: "ctaBand",
    interfaceName: "CtaBandBlock",
    labels: { singular: "CTA band", plural: "CTA bands" },
    fields: [...heading, link("primary", "Primary button"), link("secondary", "Secondary button")],
  },
  {
    slug: "cardsGrid",
    interfaceName: "CardsGridBlock",
    labels: { singular: "Cards grid", plural: "Cards grids" },
    fields: [
      ...heading,
      {
        name: "cards",
        type: "array",
        localized: true,
        fields: [
          { name: "title", type: "text", required: true },
          { name: "body", type: "textarea" },
          icon,
          { name: "href", type: "text" },
        ],
      },
    ],
  },
  {
    slug: "mediaText",
    interfaceName: "MediaTextBlock",
    labels: { singular: "Media + text", plural: "Media + text" },
    fields: [
      ...heading,
      { name: "media", type: "upload", relationTo: "media" },
      link("cta", "Button"),
      { name: "reverse", type: "checkbox" },
    ],
  },
  {
    slug: "timeline",
    interfaceName: "TimelineBlock",
    labels: { singular: "Timeline", plural: "Timelines" },
    fields: [
      ...heading,
      {
        name: "items",
        type: "array",
        localized: true,
        fields: [
          { name: "year", type: "text", required: true },
          { name: "title", type: "text", required: true },
          { name: "body", type: "textarea" },
        ],
      },
    ],
  },
  {
    slug: "faq",
    interfaceName: "FaqBlock",
    labels: { singular: "FAQ", plural: "FAQs" },
    fields: [...heading, { name: "faqs", type: "relationship", relationTo: "faqs", hasMany: true }],
  },
  {
    slug: "richText",
    interfaceName: "RichTextBlock",
    labels: { singular: "Rich text", plural: "Rich text" },
    fields: [{ name: "content", type: "richText", localized: true }],
  },
];
