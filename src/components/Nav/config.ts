"use client";

import rem from "@/utilities/rem";

const DUMMY_WINDOW = {
  innerWidth: 0,
  innerHeight: 0,
};

export default function navConfig() {
  const { innerWidth, innerHeight } =
    typeof window === "undefined" ? DUMMY_WINDOW : window;

  const windowCenterX = innerWidth / 2;
  const windowCenterY = innerHeight / 2;
  const navWidth = innerWidth;
  const navHeight = innerHeight * 0.5;
  const navCenterX = navWidth / 2;
  const navCenterY = navHeight / 2;
  const borderThickness = 3;

  const topBorder = {
    x: 0,
    y: 0,
    width: navWidth,
    height: borderThickness,
    out: { x: -navWidth },
    in: { x: 0 },
  };

  const bottomBorder = {
    ...topBorder,
    y: navHeight - borderThickness,
    out: { x: navWidth },
    in: { x: 0 },
  };

  const navBg = {
    x: rem(1),
    y: rem(1),
    width: navWidth - rem(2),
    height: navHeight - rem(2),
    centerX: navWidth / 2 - rem(1),
    centerY: navHeight / 2 - rem(1),
    out: {},
    in: {},
  };

  const navMask = {
    out: { y: navBg.centerY, scaleY: 0 },
    in: { y: 0, scaleY: 1 },
  };

  const navCutout = {
    x: navWidth * 0.2,
    y: navHeight * 0.2,
    width: navWidth * 0.6,
    height: navHeight * 0.6,
  };

  const navFrame = {
    thickness: borderThickness,
    width: rem(2),
  };

  const navFrameLeftX = navCutout.x + rem(1);
  const navFrameLeft = {
    ...navFrame,
    x: navFrameLeftX,
    y: navCutout.y + rem(1),
    height: navCutout.height - rem(2),
    bottom: navCutout.y + navCutout.height,
    out: { x: navBg.centerX, opacity: 0 },
    in: { x: navFrameLeftX, opacity: 1 },
  };

  const navFrameRightX =
    navCutout.x + navCutout.width - rem(1) - navFrame.width;
  const navFrameRight = {
    ...navFrameLeft,
    x: navFrameRightX,
    in: { x: navFrameRightX, opacity: 1 },
  };

  const navToggleCutout = {
    x: 0,
    y: navHeight * 0.5 - rem(2),
    height: rem(4),
    width: rem(5),
  };

  return {
    windowCenterX,
    windowCenterY,
    navWidth,
    navHeight,
    navCenterX,
    navCenterY,
    topBorder,
    bottomBorder,
    navBg,
    navMask,
    navCutout,
    navFrameLeft,
    navFrameRight,
    navToggleCutout,
  };
}
