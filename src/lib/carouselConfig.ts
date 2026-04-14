/**
 * Carousel section configuration.
 * Sections listed here get the full CarouselManager UI in the admin panel
 * (drag-to-reorder, add card, delete card, edit card).
 */

export interface CarouselSectionConfig {
  /** Dot-path to the array inside the section JSON (e.g. "images", "tour.plan") */
  arrayPath: string;
  /** Field name used as the card thumbnail (must be an image path). */
  imageField?: string;
  /** Field name used as the card title in the list. */
  titleField: string;
  /** Maximum number of cards allowed. */
  maxCards: number;
}

export const CAROUSEL_CONFIG: Record<string, CarouselSectionConfig> = {
  ashgabat: { arrayPath: "images",  imageField: "src",        titleField: "label", maxCards: 30 },
  events:   { arrayPath: "events",  imageField: "image",      titleField: "title", maxCards: 30 },
  heritage: { arrayPath: "sites",   imageField: "image",      titleField: "name",  maxCards: 30 },
  nature:   { arrayPath: "cards",   imageField: "image",      titleField: "name",  maxCards: 30 },
  cuisine:  { arrayPath: "dishes",  imageField: "image",      titleField: "name",  maxCards: 30 },
  apps:     { arrayPath: "apps",    imageField: "screenshot", titleField: "name",  maxCards: 20 },
};
