export interface PintoCarouselItem {
  id?: string;
  name: string;
  imageUrl: string;
}

export interface PintoCarouselController {
  previous(): void;
  next(): void;
  destroy(): void;
}

export interface PintoCarouselOptions {
  imageUrl?: string;
  items?: PintoCarouselItem[];
  labels?: {
    year?: string;
    materials?: string;
  };
  onChange?: (index: number, item: PintoCarouselItem) => void;
}

export function createPintoCarousel(
  container: Element | string,
  options?: PintoCarouselOptions,
): PintoCarouselController;
