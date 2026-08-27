import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OriginStory } from "@/components/sections/OriginStory";

describe("Story anchor integrity", () => {
  it("leaves the canonical #story anchor to the Home section wrapper", () => {
    const { container } = render(<OriginStory />);

    expect(container.querySelector('[id="story"]')).toBeNull();
  });
});
