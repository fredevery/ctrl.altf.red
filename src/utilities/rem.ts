"use client";

export default function rem(multiplier = 1) {
  const baseRem =
    typeof getComputedStyle === "undefined"
      ? 16
      : parseFloat(getComputedStyle(document.documentElement).fontSize);
  return baseRem * multiplier;
}
