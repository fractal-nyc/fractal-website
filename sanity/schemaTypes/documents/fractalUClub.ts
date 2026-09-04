import { defineField, defineType } from "sanity";
import { FractalULocationInput } from "../../components/FractalULocationInput";

export const fractalUClub = defineType({
  name: "fractalUClub",
  title: "FractalU club",
  type: "document",
  fields: [
    defineField({ name: "semester", title: "Semester", type: "reference", to: [{ type: "fractalUSemester" }], validation: (rule) => rule.required() }),
    defineField({ name: "key", title: "Stable key", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "name", title: "Name", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "description", title: "Description", type: "text", rows: 5, validation: (rule) => rule.required() }),
    defineField({ name: "schedule", title: "Schedule", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
      description: "Choose a shared location preset, or choose Other to enter a custom location.",
      components: { input: FractalULocationInput },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "detailsUrl", title: "Optional details URL", type: "url", validation: (rule) => rule.uri({ scheme: ["http", "https"] }) }),
    defineField({
      name: "detailsLabel",
      title: "Details label",
      type: "string",
      hidden: ({ parent }) => !parent?.detailsUrl,
      validation: (rule) => rule.custom((value, context) => {
        const parent = context.parent as { detailsUrl?: string } | undefined;
        return Boolean(value) === Boolean(parent?.detailsUrl)
          ? true
          : "Details URL and label must be provided together";
      }),
    }),
    defineField({ name: "actionUrl", title: "Primary action URL", type: "url", validation: (rule) => rule.required().uri({ scheme: ["http", "https"] }) }),
    defineField({ name: "actionLabel", title: "Primary action label", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "displayOrder", title: "Display order", type: "number", initialValue: 0, validation: (rule) => rule.required().integer().min(0) }),
    defineField({ name: "visible", title: "Visible", type: "boolean", initialValue: true, validation: (rule) => rule.required() }),
  ],
  preview: { select: { title: "name", subtitle: "schedule" } },
});
