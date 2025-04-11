export type Pixel = {
  r: number;
  g: number;
  b: number;
  a: number;
  l: number;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  repulsed?: boolean;
};
export type ImageData = {
  pixels: Pixel[];
  pixelSize: number;
  width: number;
  height: number;
  loaded: boolean;
};
type Callback = (data: ImageData) => void;
type LoaderOptions = {
  zoom?: number;
  origin?: string[];
};

export function emptyImageData(): ImageData {
  return {
    pixels: [],
    pixelSize: 0,
    width: 0,
    height: 0,
    loaded: false,
  };
}

const DEFAULT_OPTIONS = {
  zoom: 1,
  origin: ["center", "center"],
};

export function loadImageData(
  src: string,
  callback: Callback | null = null,
  options: LoaderOptions = DEFAULT_OPTIONS
) {
  const image = new Image();
  const loaderOptions = { ...DEFAULT_OPTIONS, ...options };
  image.src = src;

  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Failed to get canvas context");
    context.drawImage(image, 0, 0);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const pixelSize = Math.floor(
      (window.innerHeight / image.height) * loaderOptions.zoom
    );
    const processedPixels: Pixel[] = [];
    const [originX, originY] = getOrigin(
      image.width,
      image.height,
      loaderOptions.origin![0],
      loaderOptions.origin![1]
    );
    const zoomXOffset = Math.floor(
      (image.width - image.width / loaderOptions.zoom) / 2
    );
    const zoomYOffset = Math.floor(
      (image.height - image.height / loaderOptions.zoom) / 2
    );
    const startX = originX - image.width / 2 + zoomXOffset;
    const startY = originY - image.height / 2 + zoomYOffset;
    // console.table([
    //   {
    //     axis: "X",
    //     start: startX,
    //     origin: originX,
    //     size: image.width,
    //     offset: zoomXOffset,
    //     zoom: loaderOptions.zoom,
    //   },
    //   {
    //     axis: "Y",
    //     start: startY,
    //     origin: originY,
    //     size: image.height,
    //     offset: zoomYOffset,
    //     zoom: loaderOptions.zoom,
    //   },
    // ]);

    for (let y = startY; y < image.height; y++) {
      for (let x = startX; x < image.width; x++) {
        const i = (y * image.width + x) * 4;
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        // const a = pixels[i + 3];
        const l = (r + g + b) / 3;
        const a = l / 255;

        if (l < 50) continue; // Skip transparent pixels
        processedPixels.push({
          r,
          g,
          b,
          a,
          l,
          x,
          y,
          baseX: x,
          baseY: y,
          size: pixelSize,
        });
      }
    }

    const processedImageData: ImageData = {
      pixels: processedPixels,
      pixelSize,
      width: image.width,
      height: image.height,
      loaded: true,
    };

    // console.table(processedImageData, ["pixelSize"]);

    if (callback) callback(processedImageData);

    return processedImageData;
  };
}

function getOrigin(
  imageWidth: number,
  imageHeight: number,
  originX: string,
  originY: string
) {
  return [
    getAxisOrigin(imageWidth, originX),
    getAxisOrigin(imageHeight, originY),
  ];
}

function getAxisOrigin(axesSize: number, origin: number | string) {
  const originFloat = parseFloat(origin as string);
  const originIsNumeric =
    typeof origin === "number" ||
    (!isNaN(originFloat) && isFinite(originFloat));
  if (originIsNumeric) {
    return axesSize * originFloat;
  }

  switch (origin) {
    case "left":
    case "top":
      return 0;
    case "right":
    case "bottom":
      return axesSize;
    case "center":
      return axesSize / 2;
    default:
      throw new Error(`Invalid origin value: ${origin}`);
  }
}
