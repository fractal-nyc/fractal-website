import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FractalUniversityPortal } from "@/components/education/FractalUniversityPortal";
import {
  FractalUContentProvider,
  useFractalUContent,
} from "@/content/FractalUContentProvider";
import { FRACTALU_CATALOG, type FractalUCatalog } from "@/data/fractalu";
import { getSanityPublicConfig } from "@/sanity/env";

const VALID_ENV = {
  VITE_SANITY_PROJECT_ID: "example123",
  VITE_SANITY_DATASET: "production",
};

function Probe() {
  const catalog = useFractalUContent();
  return <p>{catalog.semester}</p>;
}

function remoteCatalog(overrides: Partial<FractalUCatalog> = {}): FractalUCatalog {
  return {
    ...FRACTALU_CATALOG,
    semester: "Published semester",
    ...overrides,
  };
}

describe("FractalU local-first content", () => {
  it("disables reads for absent, partial, or invalid public configuration", () => {
    expect(getSanityPublicConfig({})).toEqual({ config: null });
    expect(getSanityPublicConfig({ VITE_SANITY_PROJECT_ID: "project" }).config).toBeNull();
    expect(getSanityPublicConfig({
      VITE_SANITY_PROJECT_ID: "bad value",
      VITE_SANITY_DATASET: "production",
    }).config).toBeNull();
  });

  it.each([
    {},
    { VITE_SANITY_PROJECT_ID: "project" },
    { VITE_SANITY_PROJECT_ID: "bad value", VITE_SANITY_DATASET: "production" },
  ])("renders the local snapshot synchronously and does not invoke a loader for %o", (env) => {
    const loadCatalog = vi.fn();
    const fetch = vi.spyOn(globalThis, "fetch");
    render(
      <FractalUContentProvider env={env} loadCatalog={loadCatalog}>
        <Probe />
      </FractalUContentProvider>,
    );
    expect(screen.getByText(FRACTALU_CATALOG.semester)).toBeInTheDocument();
    expect(loadCatalog).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    fetch.mockRestore();
  });

  it("atomically replaces the synchronous local catalog after an injected published load", async () => {
    const remote = remoteCatalog();
    render(
      <FractalUContentProvider env={VALID_ENV} loadCatalog={async () => remote}>
        <Probe />
      </FractalUContentProvider>,
    );
    expect(screen.getByText(FRACTALU_CATALOG.semester)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(remote.semester)).toBeInTheDocument());
  });

  it("keeps the complete local catalog when a read rejects or returns invalid content", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { rerender } = render(
      <FractalUContentProvider env={VALID_ENV} loadCatalog={async () => { throw new Error("offline"); }}>
        <Probe />
      </FractalUContentProvider>,
    );
    await waitFor(() => expect(warning).toHaveBeenCalled());
    expect(screen.getByText(FRACTALU_CATALOG.semester)).toBeInTheDocument();

    rerender(
      <FractalUContentProvider env={VALID_ENV} loadCatalog={async () => null}>
        <Probe />
      </FractalUContentProvider>,
    );
    await waitFor(() => expect(screen.getByText(FRACTALU_CATALOG.semester)).toBeInTheDocument());
    warning.mockRestore();
  });

  it("resets a removed active category when a catalog update arrives", async () => {
    let resolveCatalog!: (catalog: FractalUCatalog) => void;
    const pending = new Promise<FractalUCatalog>((resolve) => { resolveCatalog = resolve; });
    render(
      <FractalUContentProvider env={VALID_ENV} loadCatalog={() => pending}>
        <FractalUniversityPortal />
      </FractalUContentProvider>,
    );

    const removedCategory = FRACTALU_CATALOG.courses[0].category;
    fireEvent.click(screen.getByRole("button", { name: removedCategory }));
    expect(screen.getByRole("button", { name: removedCategory })).toHaveAttribute("aria-pressed", "true");

    const replacementCourse = {
      ...FRACTALU_CATALOG.courses[0],
      id: "published-course",
      title: "Published course",
      category: "Published category",
    };
    resolveCatalog(remoteCatalog({ courses: [replacementCourse], clubs: [] }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "true");
      expect(screen.getByRole("heading", { name: /Published course course description/ })).toBeInTheDocument();
    });
    expect(screen.queryByRole("button", { name: removedCategory })).toBeNull();
  });
});
