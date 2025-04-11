"use client";

export default function rem(multiplier = 1, integer = false) {
  const baseRem =
    typeof getComputedStyle === "undefined"
      ? 16
      : parseFloat(getComputedStyle(document.documentElement).fontSize);
  const remPxFloat = baseRem * multiplier;
  const remPx = Math.round(remPxFloat);
  return integer ? remPx : remPxFloat;
}
