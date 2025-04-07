'use client';

import userAgent from "@/utilities/userAgent";

export default function Meta() {
    if (userAgent.iOS) {
        document.body.classList.add("user-agent-ios");
    }

    return (<></>)
}