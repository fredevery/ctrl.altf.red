"use client";

const userAgent = {
  userAgent: navigator.userAgent,
  iOS:
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.userAgent.includes("Macintosh") && "ontouchend" in document),
};
export default userAgent;
