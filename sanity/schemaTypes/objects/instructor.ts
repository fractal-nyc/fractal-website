import { defineField, defineType } from "sanity";

export const instructor = defineType({
  name: "instructor",
  title: "Instructor",
  type: "object",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "bio", title: "Biography", type: "text", rows: 6, validation: (rule) => rule.required() }),
  ],
  preview: { select: { title: "name", subtitle: "bio" } },
});
