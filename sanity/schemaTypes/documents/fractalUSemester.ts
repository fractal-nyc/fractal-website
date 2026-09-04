import { defineField, defineType } from "sanity";

export const fractalUSemester = defineType({
  name: "fractalUSemester",
  title: "FractalU semester",
  type: "document",
  fields: [
    defineField({ name: "key", title: "Stable key", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "semester", title: "Semester label", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "displayOrder", title: "Display order", type: "number", initialValue: 0, validation: (rule) => rule.required().integer().min(0) }),
    defineField({ name: "visible", title: "Visible", type: "boolean", initialValue: true, validation: (rule) => rule.required() }),
  ],
  preview: { select: { title: "semester", subtitle: "key" } },
});
