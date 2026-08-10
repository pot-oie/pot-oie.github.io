import type { ImageMetadata } from "astro";
import space2026Cover from "../../assets/space/2026-concept.png";
import { SPACE_EDITIONS, type SpaceEditionSummary } from "./editions";

export type SpaceEditionWithCover = SpaceEditionSummary & {
  cover?: ImageMetadata;
};

const EDITION_COVERS: Partial<Record<number, ImageMetadata>> = {
  2026: space2026Cover,
};

export const SPACE_EDITIONS_WITH_COVERS: readonly SpaceEditionWithCover[] =
  SPACE_EDITIONS.map((edition) => ({
    ...edition,
    cover: EDITION_COVERS[edition.year],
  }));
