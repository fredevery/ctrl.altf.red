"use client";

import { useState, useLayoutEffect } from "react";
import rem from "@/utilities/rem";
import { useWindowResize } from "@/utilities/useWindowResize";

export default function useNavConfig() {
  const windowSize = useWindowResize();
  const [navConfig, setNavConfig] = useState({
    windowCenterX: 0,
    windowCenterY: 0,
    navWidth: 0,
    navHeight: 0,
    navCenterX: 0,
    navCenterY: 0,
    topBorder: { x: 0, y: 0, width: 0, height: 0, in: {}, out: {} },
    bottomBorder: { x: 0, y: 0, width: 0, height: 0, in: {}, out: {} },
    navBg: {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      centerX: 0,
      centerY: 0,
      in: {},
      out: {},
    },
    navMask: { in: {}, out: {} },
    navCutout: { x: 0, y: 0, width: 0, height: 0 },
    navFrameLeft: {
      thickness: 0,
      width: 0,
      x: 0,
      y: 0,
      height: 0,
      bottom: 0,
      in: {},
      out: {},
    },
    navFrameRight: {
      thickness: 0,
      width: 0,
      x: 0,
      y: 0,
      height: 0,
      bottom: 0,
      in: {},
      out: {},
    },
    navToggleCutout: { x: 0, y: 0, width: 0, height: 0 },
  });

  useLayoutEffect(() => {
    const { width: windowWidth, height: windowHeight } = windowSize;
    const windowCenterX = windowWidth / 2;
    const windowCenterY = windowHeight / 2;
    const navWidth = windowWidth;
    const navHeight = windowHeight * 0.5;
    const navCenterX = navWidth / 2;
    const navCenterY = navHeight / 2;
    const borderThickness = 2;

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
      width: Math.max(0, navWidth - rem(2)),
      height: Math.max(0, navHeight - rem(2)),
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
      bottom: navCutout.y + navCutout.height - rem(1),
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

    setNavConfig({
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
    });
  }, [windowSize, setNavConfig]);

  return navConfig;
}
