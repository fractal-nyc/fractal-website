import { Select, Stack, TextInput } from "@sanity/ui";
import { useEffect, useState } from "react";
import { set, unset, type StringInputProps } from "sanity";

export const FRACTALU_LOCATION_PRESETS = [
  { title: "NoHo, Manhattan", value: "NoHo, Manhattan" },
  {
    title: "Brooklyn (address sent to accepted students)",
    value: "Brooklyn (address sent to accepted students)",
  },
  {
    title: "Fractal Campus, 111 Conselyea St",
    value: "Fractal Campus, 111 Conselyea St",
  },
  { title: "Lower East Side", value: "Lower East Side" },
  { title: "Outdoor parks, Manhattan", value: "Outdoor parks, Manhattan" },
  { title: "Gowanus, Brooklyn", value: "Gowanus, Brooklyn" },
  { title: "Bushwick", value: "Bushwick" },
  { title: "Merlin's Place, Bushwick", value: "Merlin's Place, Bushwick" },
  { title: "Homebrew", value: "Homebrew" },
  {
    title: "Jersey City (remote for Aug sessions)",
    value: "Jersey City (remote for Aug sessions)",
  },
  {
    title: "TBD (address emailed to enrolled students)",
    value: "TBD (address emailed to enrolled students)",
  },
  {
    title: "Fractal Campus rooftop, 111 Conselyea St",
    value: "Fractal Campus rooftop, 111 Conselyea St",
  },
  { title: "Vital Williamsburg", value: "Vital Williamsburg" },
] as const;

export const FRACTALU_LOCATION_OTHER_VALUE = "__fractalu_location_other__";

const presetValues = new Set<string>(
  FRACTALU_LOCATION_PRESETS.map(({ value }) => value),
);

export function isFractalULocationPreset(
  value: string | undefined,
): value is (typeof FRACTALU_LOCATION_PRESETS)[number]["value"] {
  return typeof value === "string" && presetValues.has(value);
}

export function getFractalULocationMode(
  value: string | undefined,
): "preset" | "other" {
  return isFractalULocationPreset(value) ? "preset" : "other";
}

export function FractalULocationInput({
  elementProps,
  onChange,
  readOnly,
  value,
}: StringInputProps) {
  const [showCustomInput, setShowCustomInput] = useState(
    () => getFractalULocationMode(value) === "other",
  );

  useEffect(() => {
    setShowCustomInput(getFractalULocationMode(value) === "other");
  }, [value]);

  const {
    onChange: _elementOnChange,
    readOnly: elementReadOnly,
    value: _elementValue,
    ...forwardedElementProps
  } = elementProps;
  const isReadOnly = readOnly || elementReadOnly;
  const selectedValue = showCustomInput
    ? FRACTALU_LOCATION_OTHER_VALUE
    : value ?? FRACTALU_LOCATION_OTHER_VALUE;

  const handlePresetChange = (nextValue: string) => {
    if (nextValue === FRACTALU_LOCATION_OTHER_VALUE) {
      setShowCustomInput(true);
      return;
    }

    setShowCustomInput(false);
    onChange(set(nextValue));
  };

  return (
    <Stack space={3}>
      <Select
        {...forwardedElementProps}
        aria-label="Location preset"
        disabled={isReadOnly}
        id={showCustomInput ? `${elementProps.id}-preset` : elementProps.id}
        onChange={(event) => handlePresetChange(event.currentTarget.value)}
        ref={showCustomInput ? undefined : elementProps.ref}
        value={selectedValue}
      >
        {FRACTALU_LOCATION_PRESETS.map((preset) => (
          <option key={preset.value} value={preset.value}>
            {preset.title}
          </option>
        ))}
        <option value={FRACTALU_LOCATION_OTHER_VALUE}>Other</option>
      </Select>

      {showCustomInput ? (
        <TextInput
          {...elementProps}
          aria-label="Custom location"
          onChange={(event) => {
            const nextValue = event.currentTarget.value;
            onChange(nextValue ? set(nextValue) : unset());
          }}
          readOnly={isReadOnly}
          value={value ?? ""}
        />
      ) : null}
    </Stack>
  );
}
