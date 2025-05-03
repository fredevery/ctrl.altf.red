import localFont from "next/font/local";
import { stripWhitespace } from '@/utilities/string';

const baseMonoFont = localFont({
    src: [
        {
            // path: "../../public/fonts/3270/3270NerdFontMono-Regular.ttf",
            // path: "../../public/fonts/Glass_TTY_VT220.ttf",
            // path: "../../public/fonts/Web437_IBM_3270pc.woff",
            // path: "../../public/fonts/Ac437_OlivettiThin_8x16.ttf",
            // path: "../../public/fonts/Disket-Mono-Regular.ttf",
            // path: "../../public/fonts/Arturito Slab_v2.ttf",
            // path: "../../public/fonts/CPMono_v07 Plain.otf",
            // path: "../../../public/fonts/PixelCode.woff2",
            path: "../../../public/fonts/consolas.ttf",
            weight: "400",
            style: "normal",
        }
    ],
    fallback: ["monospace"],
});
const accentMonoFont = localFont({
    src: [
        {
            // path: "../../public/fonts/Boxy-Bold.ttf",
            // path: "../../public/fonts/Typodermic - JoystixMonospace-Regular.otf",
            path: "../../../public/fonts/Telegrama Raw.ttf",
            weight: "400",
            style: "normal",
        }
    ],
    fallback: ["monospace"],
});
const titleFont = localFont({
    src: [
        {
            // path: "../../public/fonts/RealVhsFontRegular-WyV0z.ttf",
            path: "../../../public/fonts/PPSupplyMono-Ultralight.woff2",
            // path: "../../public/fonts/CPMono_v07 Plain.otf",
            // path: "../../public/fonts/Disket-Mono-Regular.ttf",
            weight: "400",
            style: "normal",
        }
    ],
    declarations: [{
        prop: "line-gap-override",
        value: "20%"
    }]
})

const fontVariables = `
:root {
  --base-mono-font: ${baseMonoFont.style.fontFamily};
  --accent-mono-font: ${accentMonoFont.style.fontFamily};
  --title-font: ${titleFont.style.fontFamily};
}
`

export default function Fonts() {
    return (
        <style href="fonts-variables" precedence="high">{stripWhitespace(fontVariables)}</style>

    )
}