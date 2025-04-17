export type Pixel = {
  color: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
  alpha: number;
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
  zoomedWidth: number;
  zoomedHeight: number;
  loaded: boolean;
};
type Callback = (data: ImageData) => void;
type LoaderOptions = {
  zoom?: number;
  origin?: string[];
  pixelSize: number | null;
  width: number;
  height: number;
  canvasWidth: number;
  canvasHeight: number;
  xOffset: number;
  yOffset: number;
};

export function emptyImageData(): ImageData {
  return {
    pixels: [],
    pixelSize: 0,
    width: 0,
    height: 0,
    zoomedWidth: 0,
    zoomedHeight: 0,
    loaded: false,
  };
}

const DEFAULT_OPTIONS = {
  zoom: 1,
  origin: ["center", "center"],
  pixelSize: null,
  width: 0,
  height: 0,
  canvasWidth: 0,
  canvasHeight: 0,
  xOffset: 0,
  yOffset: 0,
};

export function loadImageData(
  src: string,
  callback: Callback | null = null,
  options: LoaderOptions = DEFAULT_OPTIONS
) {
  const loaderOptions = { ...DEFAULT_OPTIONS, ...options };
  if (loaderOptions.height === 0 || loaderOptions.width === 0) return;

  const imageWidth = loaderOptions.width!;
  const imageHeight = loaderOptions.height!;
  const image = new Image(imageWidth, imageHeight);
  const resolvedXOffset = loaderOptions.canvasWidth * loaderOptions.xOffset;
  const resolvedYOffset = loaderOptions.canvasHeight * loaderOptions.yOffset;
  // console.log(
  //   { imageWidth, imageHeight, imageCenterX, imageCenterY },
  //   imageCenterX / 2
  // );
  image.src = src;

  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = loaderOptions.canvasWidth;
    canvas.height = loaderOptions.canvasHeight;

    canvas.classList = "image-loader-canvas";
    document.body.appendChild(canvas);

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Failed to get canvas context");
    const zoomWidth = Math.floor(image.width * loaderOptions.zoom);
    const zoomHeight = Math.floor(image.height * loaderOptions.zoom);
    const zoomXOffset = Math.floor((image.width - zoomWidth) / 2);
    const zoomYOffset = Math.floor((image.height - zoomHeight) / 2);

    const [imageOriginX, imageOriginY] = getOrigin(
      imageWidth,
      imageHeight,
      loaderOptions.origin![0],
      loaderOptions.origin![1]
    );
    const [zoomOriginX, zoomOriginY] = getOrigin(
      zoomWidth,
      zoomHeight,
      loaderOptions.origin[0],
      loaderOptions.origin[1]
    );
    const [canvasOriginX, canvasOriginY] = getOrigin(
      loaderOptions.canvasWidth,
      loaderOptions.canvasHeight,
      loaderOptions.origin[0],
      loaderOptions.origin[1]
    );

    const zoomX = canvasOriginX - zoomOriginX;
    const zoomY = canvasOriginY - zoomOriginY;
    // console.log("zoomDims", zoomWidth, zoomHeight, zoomOriginX, zoomOriginY);

    context.drawImage(image, zoomX, zoomY, zoomWidth, zoomHeight);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const pixelSize =
      loaderOptions.pixelSize ||
      Math.floor((window.innerHeight / image.height) * loaderOptions.zoom);
    const processedPixels: Pixel[] = [];

    // canvas.style.left = -imageOriginX + canvasOriginX + resolvedXOffset + "px";
    // canvas.style.top = -imageOriginY + canvasOriginY + resolvedYOffset + "px";
    // const startX = originX - image.width / 2 + zoomXOffset;
    // const startY = originY - image.height / 2 + zoomYOffset;
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

    for (let y = pixelSize / 2; y < canvas.height; y += pixelSize) {
      for (let x = pixelSize / 2; x < canvas.width; x += pixelSize) {
        const i = (y * canvas.width + x) * 4;
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        // const a = pixels[i + 3];
        const l = (r + g + b) / 3;
        const a = l;

        const resolvedX = x - imageOriginX + canvasOriginX + resolvedXOffset;
        const resolvedY = y - imageOriginY + canvasOriginY + resolvedYOffset;

        // if (resolvedX > 1400) {
        //   console.log(x, resolvedX);
        // }

        // if (l < 50) continue; // Skip transparent pixels
        processedPixels.push({
          color: { r, g, b, a },
          alpha: a,
          l,
          x: resolvedX,
          y: resolvedY,
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
      zoomedWidth: image.width * pixelSize,
      zoomedHeight: image.height * pixelSize,
      loaded: true,
    };

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
