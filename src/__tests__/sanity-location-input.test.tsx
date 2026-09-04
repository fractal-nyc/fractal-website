import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider, studioTheme } from "@sanity/ui";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import type { StringInputProps } from "sanity";
import {
  FRACTALU_LOCATION_OTHER_VALUE,
  FRACTALU_LOCATION_PRESETS,
  FractalULocationInput,
  getFractalULocationMode,
  isFractalULocationPreset,
} from "../../sanity/components/FractalULocationInput";

function inputProps(
  value: string | undefined,
  onChange = vi.fn(),
  readOnly = false,
): StringInputProps {
  return {
    value,
    onChange,
    readOnly,
    elementProps: {
      id: "location",
      value,
      readOnly,
      onChange: vi.fn(),
      onFocus: vi.fn(),
      onBlur: vi.fn(),
      ref: createRef<HTMLInputElement>(),
      "aria-describedby": "location-description",
    },
  } as unknown as StringInputProps;
}

function renderInput(props: StringInputProps) {
  return render(
    <ThemeProvider theme={studioTheme}>
      <FractalULocationInput {...props} />
    </ThemeProvider>,
  );
}

describe("FractalU location input", () => {
  it("classifies exact presets and selects the matching option", () => {
    const preset = FRACTALU_LOCATION_PRESETS[2].value;
    expect(isFractalULocationPreset(preset)).toBe(true);
    expect(getFractalULocationMode(preset)).toBe("preset");
    renderInput(inputProps(preset));

    expect(screen.getByLabelText("Location preset")).toHaveValue(preset);
    expect(screen.queryByLabelText("Custom location")).toBeNull();
  });

  it("emits the exact display string when another preset is selected", () => {
    const onChange = vi.fn();
    renderInput(inputProps(FRACTALU_LOCATION_PRESETS[0].value, onChange));

    const nextLocation = FRACTALU_LOCATION_PRESETS[4].value;
    fireEvent.change(screen.getByLabelText("Location preset"), {
      target: { value: nextLocation },
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toMatchObject({
      type: "set",
      path: [],
      value: nextLocation,
    });
  });

  it("reveals Other without patching or discarding the prior preset", () => {
    const onChange = vi.fn();
    const existingLocation = FRACTALU_LOCATION_PRESETS[0].value;
    renderInput(inputProps(existingLocation, onChange));

    fireEvent.change(screen.getByLabelText("Location preset"), {
      target: { value: FRACTALU_LOCATION_OTHER_VALUE },
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Custom location")).toHaveValue(existingLocation);
  });

  it("opens an unknown legacy string as Other without a mount-time patch", () => {
    const onChange = vi.fn();
    const legacyLocation = "Legacy venue — ring the side bell";
    expect(getFractalULocationMode(legacyLocation)).toBe("other");
    renderInput(inputProps(legacyLocation, onChange));

    expect(screen.getByLabelText("Location preset")).toHaveValue(
      FRACTALU_LOCATION_OTHER_VALUE,
    );
    expect(screen.getByLabelText("Custom location")).toHaveValue(legacyLocation);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("reflects collaborative value updates without emitting a patch", () => {
    const onChange = vi.fn();
    const { rerender } = renderInput(inputProps("Legacy venue", onChange));
    const preset = FRACTALU_LOCATION_PRESETS[1].value;

    rerender(
      <ThemeProvider theme={studioTheme}>
        <FractalULocationInput {...inputProps(preset, onChange)} />
      </ThemeProvider>,
    );

    expect(screen.getByLabelText("Location preset")).toHaveValue(preset);
    expect(screen.queryByLabelText("Custom location")).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("sets edited custom text and unsets cleared text", () => {
    const onChange = vi.fn();
    renderInput(inputProps("Legacy venue", onChange));
    const customInput = screen.getByLabelText("Custom location");

    fireEvent.change(customInput, { target: { value: "New custom venue" } });
    fireEvent.change(customInput, { target: { value: "" } });

    expect(onChange).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ type: "set", path: [], value: "New custom venue" }),
    );
    expect(onChange).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ type: "unset", path: [] }),
    );
  });

  it("keeps both accessible controls read-only and forwards focus behavior", () => {
    const props = inputProps("Legacy venue", vi.fn(), true);
    renderInput(props);

    const select = screen.getByLabelText("Location preset");
    const customInput = screen.getByLabelText("Custom location");
    expect(select).toBeDisabled();
    expect(customInput).toHaveAttribute("readonly");
    expect(customInput).toHaveAttribute("aria-describedby", "location-description");

    fireEvent.focus(customInput);
    expect(props.elementProps.onFocus).toHaveBeenCalledTimes(1);
  });
});
