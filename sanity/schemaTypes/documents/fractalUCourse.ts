import { defineArrayMember, defineField, defineType } from "sanity";
import { FractalULocationInput } from "../../components/FractalULocationInput";

export const fractalUCourse = defineType({
  name: "fractalUCourse",
  title: "FractalU course",
  type: "document",
  fields: [
    defineField({ name: "semester", title: "Semester", type: "reference", to: [{ type: "fractalUSemester" }], validation: (rule) => rule.required() }),
    defineField({ name: "key", title: "Stable key", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "category", title: "Category", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "instructors", title: "Ordered instructors", type: "array", of: [defineArrayMember({ type: "instructor" })], validation: (rule) => rule.required().min(1).unique() }),
    defineField({ name: "schedule", title: "Schedule", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "dates", title: "Dates", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
      description: "Choose a shared location preset, or choose Other to enter a custom location.",
      components: { input: FractalULocationInput },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "price", title: "Price", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "description", title: "Exact description", type: "text", rows: 6, validation: (rule) => rule.required() }),
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
    defineField({ name: "applicationUrl", title: "Application URL", type: "url", validation: (rule) => rule.required().uri({ scheme: ["http", "https"] }) }),
    defineField({ name: "applicationLabel", title: "Application label", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "videoUrl", title: "Optional video URL", type: "url", validation: (rule) => rule.uri({ scheme: ["http", "https"] }) }),
    defineField({ name: "displayOrder", title: "Display order", type: "number", initialValue: 0, validation: (rule) => rule.required().integer().min(0) }),
    defineField({ name: "visible", title: "Visible", type: "boolean", initialValue: true, validation: (rule) => rule.required() }),
  ],
  preview: { select: { title: "title", subtitle: "category" } },
});
