"use client";

import p5 from "p5";
import { mapRange } from "@/utilities/math";

type UnknownPixel = {
  x: number;
  y: number;
  size: number;
};

type OnChangeCallback = (arg0: GridPixel) => void;
type UnknownColor =
  | string
  | number
  | p5.Color
  | { r: number; g: number; b: number; a: number }
  | number[];

const ASCII_CHARS = "@#%WM8&$B9D0QZUvxyuncrt:.- ";

class PixelColor {
  r: number = 0;
  g: number = 0;
  b: number = 0;
  a: number = 255;
  p: p5;
  pColor: p5.Color | null = null;

  constructor(color: UnknownColor, options: { p: p5 }) {
    this.p = options.p;
    this.pColor = this.set(color);
  }

  get luminance() {
    return (this.r + this.g + this.b) / 3;
  }

  get alpha() {
    return this.a;
  }

  set(color: UnknownColor) {
    switch (typeof color) {
      case "string":
      case "number":
        this.pColor = this.p.color(color as string);
        this.r = this.p.red(this.pColor);
        this.g = this.p.green(this.pColor);
        this.b = this.p.blue(this.pColor);
        this.a = this.p.alpha(this.pColor);
        break;
      case "object":
        let r = 0;
        let g = 0;
        let b = 0;
        let a = 0;

        if (color instanceof p5.Color) {
          this.pColor = color;
          this.r = this.p.red(this.pColor);
          this.g = this.p.green(this.pColor);
          this.b = this.p.blue(this.pColor);
          this.a = this.p.alpha(this.pColor);
          break;
        }

        if (Array.isArray(color)) {
          [r, g, b, a] = color as number[];
        } else {
          r = color.r;
          g = color.g;
          b = color.b;
          a = color.a;
        }
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        this.pColor = this.p.color(r, g, b, a);
        break;
    }

    return this.pColor;
  }
}

interface PixelChangeOptions extends Omit<Partial<GridPixel>, "color"> {
  color?: UnknownColor | PixelColor;
}

export class GridPixel {
  p: p5;
  x: number = 0;
  y: number = 0;
  gridX: number = 0;
  gridY: number = 0;
  size: number = 0;
  color: PixelColor;
  alpha: number = 0;
  xCenter: number = 0;
  yCenter: number = 0;
  savedColor: PixelColor | null = null;
  savedAlpha: number = 0;
  onChange: OnChangeCallback | null = null;
  asciiChar: string = "";
  type: string = "ascii";
  changes: Partial<GridPixel> | null = null;
  changeAge: number = 0;
  idleAge: number = 0;
  state: string = "idle";
  changeAgeTimeout: NodeJS.Timeout | null = null;
  neighbors: {
    [key: string]: GridPixel | null;
  } = {
    topLeft: null,
    top: null,
    topRight: null,
    left: null,
    right: null,
    bottomLeft: null,
    bottom: null,
    bottomRight: null,
  };

  constructor(options: Partial<GridPixel>) {
    this.p = options.p!;
    this.color = new PixelColor([0, 0, 0, 0], { p: this.p });
    this.set(options);
  }

  get drawSize() {
    return this.changes?.size || this.size;
  }

  get drawColor() {
    return this.p.color(166, 0, 255, this.color.a);
    // return this.drawState.startsWith("infected")
    //   ? this.p.color(
    //       this.p.random(255),
    //       mapRange(this.changeAge, 1, 20, 255, 0)
    //     )
    //   : this.color.pColor;
    // return this.changes?.color?.pColor || this.color.pColor;
  }

  get drawType() {
    // return this.changes?.type || this.type;
    return "ascii";
  }

  get drawState() {
    return this.changes?.state || this.state;
  }

  get drawAsciiChar() {
    return this.drawState.startsWith("infected")
      ? this.getRandomAsciiChar()
      : this.asciiChar;
  }

  get hasChanges() {
    return this.changes !== null;
  }

  get isInfected() {
    return this.drawState.startsWith("infected");
  }

  get allNeighbors() {
    return Object.values(this.neighbors).filter(
      neighbor => neighbor !== null
    ) as GridPixel[];
  }

  get allHealthyNeighbors() {
    return Object.values(this.neighbors).filter(
      neighbor => neighbor !== null && !neighbor.isInfected
    );
  }

  get allInfectedNeighbors() {
    return Object.values(this.neighbors).filter(
      neighbor => neighbor?.isInfected
    );
  }

  set(options: Partial<GridPixel>) {
    Object.assign(this, options);
    if (options.color) {
      this.setColor(options.color);
    }
    this.calculateCenter();
    if (this.onChange) this.onChange(this);
  }

  getAsciiChar() {
    this.asciiChar = ASCII_CHARS.charAt(
      mapRange(this.color.luminance, 0, 255, ASCII_CHARS.length - 1, 0)
    );
  }

  getRandomAsciiChar() {
    return ASCII_CHARS.charAt(
      mapRange(this.p.random(255), 0, 255, ASCII_CHARS.length - 1, 0)
    );
  }

  setColor(color: UnknownColor) {
    this.color.set(color);
    this.getAsciiChar();
    this.emitChange();
  }

  calculateCenter() {
    this.xCenter = this.x + this.size / 2;
    this.yCenter = this.y + this.size / 2;
  }

  changeTo(changes: PixelChangeOptions) {
    this.changes = changes as Partial<GridPixel>;
    if (this.changes.color) {
      this.changes.color = new PixelColor(this.changes.color, { p: this.p });
    }
    if (this.changeAgeTimeout) {
      clearTimeout(this.changeAgeTimeout);
    }
    this.emitChange();
  }

  draw() {
    this.p.fill(this.drawColor!);
    if (this.hasChanges) {
      this.changeAge += 1;
    }
    switch (this.drawType) {
      case "ascii":
        this.drawAscii();
        break;
      case "rect":
        this.drawRect();
        break;
    }
  }

  drawRect() {
    this.p.rect(this.x + 1, this.y + 1, this.drawSize - 2, this.drawSize - 2);
  }

  drawAscii() {
    if (this.isInfected) {
      this.p.fill(204, 255, 0, 255 / this.changeAge + 1);
      this.drawRect();
      this.p.fill(this.drawColor!);
    }
    this.p.textFont("baseMonoFont");
    this.p.textSize(this.drawSize);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text(this.drawAsciiChar, this.xCenter, this.yCenter);
  }

  loadPixel(pixel: ImagePixel) {
    const { r, g, b, a } = pixel;
    this.setColor([r, g, b, a]);
  }

  saveColor() {
    this.savedColor = this.color;
  }

  resetChanges() {
    this.changes = null;
    this.changeAgeTimeout = setTimeout(() => (this.changeAge = 0), 100);
    // this.emitChange();
  }

  emitChange() {
    if (this.onChange) this.onChange(this);
  }
}

export class PixelGrid {
  p: p5;
  x: number = 0;
  y: number = 0;
  canvasWidth: number = 0;
  canvasHeight: number = 0;
  xResolution: number = 0;
  yResolution: number = 0;
  pixelSize: number = 0;
  pixels: GridPixel[] = [];
  xOffset: number = 0;
  yOffset: number = 0;
  xCenter: number = 0;
  yCenter: number = 0;
  populated: boolean = false;
  pixelsToMap: Partial<GridPixel>[] | Partial<GridPixel>[][] = [];
  changedPixels: GridPixel[] = [];
  firstDraw: boolean = true;
  cacheNextFrame: boolean = true;
  cachedFrame: p5.Image | null = null;

  constructor(options: Partial<PixelGrid>) {
    this.p = options.p!;
    this.set(options);
  }

  get hasPendingDraws() {
    return this.firstDraw === true || this.changedPixels.length > 0;
  }

  set(options: Partial<PixelGrid>) {
    Object.assign(this, options);
    this.calculateResolution();
    this.calculateOffset();
    this.calculateCenter();
    this.prepopulatePixels();

    if (this.pixelsToMap) {
      this.mapPixels(this.pixelsToMap);
    }
  }

  cacheFrame() {
    this.cachedFrame = this.p.get();
  }

  calculateResolution() {
    this.xResolution = Math.floor(this.canvasWidth / this.pixelSize);
    this.yResolution = Math.floor(this.canvasHeight / this.pixelSize);
  }

  calculateOffset() {
    this.xOffset = Math.floor(
      (this.canvasWidth - this.xResolution * this.pixelSize) / 2
    );
    this.yOffset = Math.floor(
      (this.canvasHeight - this.yResolution * this.pixelSize) / 2
    );
  }

  calculateCenter() {
    this.xCenter = Math.floor(this.canvasWidth / 2);
    this.yCenter = Math.floor(this.canvasHeight / 2);
  }

  prepopulatePixels() {
    for (let y = 0; y < this.yResolution; y++) {
      for (let x = 0; x < this.xResolution; x++) {
        const gridPixel = new GridPixel({
          p: this.p,
          x: x * this.pixelSize + this.xOffset,
          y: y * this.pixelSize + this.yOffset,
          gridX: x,
          gridY: y,
          size: this.pixelSize,
          onChange: this.onPixelChange.bind(this),
        });
        this.pixels.push(gridPixel);
      }
    }

    this.pixels.forEach(pixel => {
      pixel.neighbors = this.getNeighborsForPixel(pixel);
    });
    this.populated = true;
  }

  getNeighborsForPixel(gridPixel: GridPixel) {
    const { gridX, gridY } = gridPixel;
    const neighbors = {
      topLeft: this.getPixelOnGrid(gridX - 1, gridY - 1),
      top: this.getPixelOnGrid(gridX, gridY - 1),
      topRight: this.getPixelOnGrid(gridX + 1, gridY - 1),
      left: this.getPixelOnGrid(gridX - 1, gridY),
      right: this.getPixelOnGrid(gridX + 1, gridY),
      bottomLeft: this.getPixelOnGrid(gridX - 1, gridY + 1),
      bottom: this.getPixelOnGrid(gridX, gridY + 1),
      bottomRight: this.getPixelOnGrid(gridX + 1, gridY + 1),
    };
    return neighbors;
  }

  onPixelChange(gridPixel: GridPixel) {
    if (!this.changedPixels.find(changedPixel => changedPixel === gridPixel)) {
      this.changedPixels.push(gridPixel);
    }
  }

  processChangedPixels(processor: (pixel: GridPixel) => void) {
    this.changedPixels.forEach(pixel => {
      processor(pixel);
    });
    return this;
  }

  viewPositionToGrid(x: number, y: number) {
    const gridX = Math.floor(
      mapRange(x, 0, this.canvasWidth, 0, this.xResolution)
    );
    const gridY = Math.floor(
      mapRange(y, 0, this.canvasHeight, 0, this.yResolution)
    );
    return { gridX, gridY };
  }

  mapPixels(pixels: Partial<GridPixel>[] | Partial<GridPixel>[][]) {
    pixels.forEach(pixelOrRow => {
      if (!pixelOrRow) return;
      if (Array.isArray(pixelOrRow)) {
        this.mapPixels(pixelOrRow);
        return;
      }
      const gridPixel = this.getGridPixel(pixelOrRow as UnknownPixel);
      if (gridPixel) {
        gridPixel.set({ color: pixelOrRow.color, alpha: pixelOrRow.alpha });
        gridPixel.draw();
      }
    });
  }

  loadMap(pixelMap: PixelMap) {
    pixelMap.pixels
      .filter(pixel => pixel.l > 50)
      .forEach((mappedPixel: ImagePixel) => {
        const gridPixel = this.getGridPixel(mappedPixel);
        if (gridPixel) {
          gridPixel.loadPixel(mappedPixel);
        } else {
          console.error("no gridPixel for", mappedPixel, this.pixels.length);
        }
      });
    this.cacheNextFrame = true;
  }

  getGridPixel(pixel: UnknownPixel | ImagePixel): GridPixel | null {
    const { gridX, gridY } = this.viewPositionToGrid(pixel.x, pixel.y);
    return this.getPixelOnGrid(gridX, gridY);
  }

  getPixel(viewX: number, viewY: number) {
    const { gridX, gridY } = this.viewPositionToGrid(viewX, viewY);
    return this.getPixelOnGrid(gridX, gridY);
  }

  getPixelOnGrid(gridX: number, gridY: number) {
    if (gridX < 0 || gridY < 0) return null;
    if (gridX >= this.xResolution || gridY >= this.yResolution) return null;
    const pixelIndex = gridX + gridY * this.xResolution;
    if (pixelIndex < 0 || pixelIndex >= this.pixels.length) return null;
    const gridPixel = this.pixels[pixelIndex];
    return gridPixel;
  }

  draw() {
    if (this.firstDraw) {
      this.pixels.forEach(pixel => pixel.draw());
      this.firstDraw = false;
    }

    if (this.cachedFrame) {
      this.p.image(this.cachedFrame, 0, 0);
    }
    this.changedPixels.forEach(pixel => pixel.draw());
    this.flush();

    if (this.cacheNextFrame) {
      this.cacheFrame();
      this.cacheNextFrame = false;
    }
  }

  flush() {
    this.changedPixels = this.changedPixels.filter(pixel => pixel.hasChanges);
  }
}

type OnLoadCallback = (imageLoader: ImageLoader) => void;
type ImagePixel = {
  i: number;
  r: number;
  g: number;
  b: number;
  a: number;
  l: number;
  x: number;
  y: number;
};

export class ImageLoader {
  image: HTMLImageElement;
  canvas: HTMLCanvasElement;
  src: string = "";
  imageLoaded: boolean = false;
  canvasWidth: number = 0;
  canvasHeight: number = 0;
  width: number = 0;
  height: number = 0;
  zoom: number = 1;
  origin: number[] | string[] = ["center", "center"];
  xOffset: number = 0;
  yOffset: number = 0;
  pixelSize: number = 1;
  pixelMap: PixelMap;
  onLoadCallback: OnLoadCallback = () => {};

  constructor(options: Partial<ImageLoader>) {
    this.set(options);
    this.image = this.createImageElement();
    this.canvas = document.createElement("canvas");
    this.pixelMap = new PixelMap({
      canvasWidth: this.canvasWidth,
      canvasHeight: this.canvasHeight,
    });
    if (!this.imageLoaded && this.canvasIsValid && this.srcIsValid) {
      this.loadImage();
    }
  }

  get srcIsValid() {
    return this.src.length > 0;
  }

  get canvasIsValid() {
    return this.canvasWidth > 0 && this.canvasHeight > 0;
  }

  get canvasOriginX() {
    return this.getAxisOrigin(this.canvasWidth, this.origin[0]);
  }

  get canvasOriginY() {
    return this.getAxisOrigin(this.canvasHeight, this.origin[1]);
  }

  get zoomWidth() {
    return this.width * this.zoom;
  }

  get zoomHeight() {
    return this.height * this.zoom;
  }

  get zoomOriginX() {
    return this.getAxisOrigin(this.zoomWidth, this.origin[0]);
  }

  get zoomOriginY() {
    return this.getAxisOrigin(this.zoomHeight, this.origin[1]);
  }

  get canvasXOffset() {
    return this.canvasWidth * this.xOffset;
  }

  get canvasYOffset() {
    return this.canvasHeight * this.yOffset;
  }

  get zoomX() {
    return this.canvasOriginX - this.zoomOriginX + this.canvasXOffset;
  }

  get zoomY() {
    return this.canvasOriginY - this.zoomOriginY + this.canvasYOffset;
  }

  set(options: Partial<ImageLoader>) {
    Object.assign(this, options);
    if (this.imageLoaded) {
      this.handleImageLoaded();
    }
    return this;
  }

  createImageElement() {
    const imageElement = new Image();
    imageElement.onload = () => this.handleImageLoaded();
    return imageElement;
  }

  loadImage() {
    this.image.src = this.src;
  }

  handleImageLoaded() {
    this.imageLoaded = true;
    this.processImage();
    this.onLoadCallback(this);
  }

  processImage() {
    const {
      canvas,
      image,
      zoomX,
      zoomY,
      zoomWidth,
      zoomHeight,
      canvasWidth,
      canvasHeight,
      pixelSize,
    } = this;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    canvas.classList = "image-loader-canvas";
    // document.body.appendChild(canvas);

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Failed to get canvas context");

    context.drawImage(image, zoomX, zoomY, zoomWidth, zoomHeight);

    const contextPixels = context.getImageData(
      0,
      0,
      canvasWidth,
      canvasHeight
    ).data;

    const pixels = [];
    let yResolution = 0;
    let xResolution = 0;
    for (let y = pixelSize / 2; y < canvasHeight - pixelSize; y += pixelSize) {
      yResolution++;

      for (let x = pixelSize / 2; x < canvasWidth - pixelSize; x += pixelSize) {
        const i = (y * canvas.width + x) * 4;
        const r = contextPixels[i];
        const g = contextPixels[i + 1];
        const b = contextPixels[i + 2];
        const l = (r + g + b) / 3;
        const a = l < 50 ? 0 : l;
        const viewX = x;
        const viewY = y;

        pixels.push({ i, r, g, b, a, l, x: viewX, y: viewY });
        if (yResolution === 1) {
          xResolution++;
        }
      }
    }

    this.pixelMap.set({
      pixels,
      xResolution,
      yResolution,
    });
  }

  onLoad(onLoadCallback: OnLoadCallback) {
    this.onLoadCallback = onLoadCallback;
    return this;
  }

  getAxisOrigin(axisSize: number, origin: number | string) {
    const originFloat = parseFloat(origin as string);
    const originIsNumeric =
      typeof origin === "number" ||
      (!isNaN(originFloat) && isFinite(originFloat));

    if (originIsNumeric) {
      return axisSize * originFloat;
    }

    switch (origin) {
      case "left":
      case "top":
        return 0;
      case "right":
      case "bottom":
        return axisSize;
      case "center":
        return axisSize / 2;
      default:
        throw new Error(`Invalid origin value: ${origin}`);
    }
  }

  destroy() {
    this.canvas.parentElement?.removeChild(this.canvas);
  }
}

export class PixelMap {
  pixels: ImagePixel[] = [];
  xResolution: number = 0;
  yResolution: number = 0;
  canvasWidth: number = 0;
  canvasHeight: number = 0;

  constructor(options: Partial<PixelMap>) {
    this.set(options);
  }

  set(options: Partial<PixelMap>) {
    Object.assign(this, options);
    if (options.pixels && options.pixels.length) {
      this.loadPixels(options.pixels);
    }
  }

  loadPixels(pixels: ImagePixel[]) {
    this.pixels = pixels;
    // pixels.forEach((pixel, i) => {
    //   pixel.x = pixel.i % this.xResolution;
    //   pixel.y = Math.floor(i / this.xResolution);
    //   pixel.i = i;
    //   this.pixels.push(pixel);
    // });
  }

  getPixel(x: number, y: number) {
    const gridX = mapRange(x, 0, this.canvasWidth, 0, this.xResolution);
    const gridY = mapRange(y, 0, this.canvasHeight, 0, this.yResolution);
    const pixelIndex = gridX + gridY * this.xResolution;
    return this.pixels[pixelIndex];
  }
}

export class MousePosition {
  x: number = 0;
  y: number = 0;
  gridX: number = 0;
  gridY: number = 0;
  prevGridX: number = 0;
  prevGridY: number = 0;
  pixelGrid: PixelGrid | null = null;
  changed: boolean = false;

  setPixelGrid(pixelGrid: PixelGrid) {
    this.pixelGrid = pixelGrid;
  }

  setViewPos({ x, y }: { x: number; y: number }) {
    if (!this.pixelGrid) return;
    const gridPos = this.pixelGrid!.viewPositionToGrid(x, y);
    this.x = x;
    this.y = y;
    this.gridX = gridPos.gridX;
    this.gridY = gridPos.gridY;
    this.updateChanged();
  }

  updateChanged() {
    this.changed =
      this.prevGridX !== this.gridX || this.prevGridY != this.gridY;
  }

  update() {
    this.updateChanged();
    this.prevGridX = this.gridX;
    this.prevGridY = this.gridY;
  }
}
