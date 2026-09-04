import { defineQuery } from "groq";

export const FRACTALU_CATALOG_QUERY = defineQuery(`
  *[_type == "fractalUSemester" && visible == true]
    | order(displayOrder asc, key asc)[0] {
      semester,
      "courses": *[
        _type == "fractalUCourse" &&
        visible == true &&
        references(^._id)
      ] | order(displayOrder asc, key asc) {
        "id": key,
        title,
        category,
        instructors[]{name, bio},
        schedule,
        dates,
        location,
        price,
        description,
        detailsUrl,
        detailsLabel,
        applicationUrl,
        applicationLabel,
        videoUrl
      },
      "clubs": *[
        _type == "fractalUClub" &&
        visible == true &&
        references(^._id)
      ] | order(displayOrder asc, key asc) {
        "id": key,
        name,
        description,
        schedule,
        location,
        detailsUrl,
        detailsLabel,
        actionUrl,
        actionLabel
      }
    }
`);
