import { Select, Stack, TextInput } from "@sanity/ui";
import { useEffect, useState } from "react";
import { set, unset, type StringInputProps } from "sanity";

export const FRACTALU_LOCATION_PRESETS = [
  { title: "Merlin's Place, Bushwick", value: "Merlin's Place, Bushwick" },
  { title: "280 East Houston, Manhattan", value: "280 East Houston, Manhattan" },
  { title: "Bushwick", value: "Bushwick" },
  { title: "203 Harrison Place, Bushwick", value: "203 Harrison Place, Bushwick" },
  {
    title: "TBD (address emailed to enrolled students)",
    value: "TBD (address emailed to enrolled students)",
  },
  { title: "Herbert Von King Park, Bed-Stuy", value: "Herbert Von King Park, Bed-Stuy" },
  { title: "309 Elizabeth St, Manhattan", value: "309 Elizabeth St, Manhattan" },
  {
    title: "Dance studio, Manhattan (announced closer to start)",
    value: "Dance studio, Manhattan (announced closer to start)",
  },
  { title: "Lower East Side, Manhattan", value: "Lower East Side, Manhattan" },
  { title: "Clinton Hill, Brooklyn", value: "Clinton Hill, Brooklyn" },
  { title: "Fractal Campus, 111 Conselyea St", value: "Fractal Campus, 111 Conselyea St" },
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
