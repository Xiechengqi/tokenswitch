import { geoNaturalEarth1, geoPath } from "d3-geo";
import type { GeoPermissibleObjects } from "d3-geo";

export function createProjection(width: number, height: number, worldGeoJSON: GeoPermissibleObjects) {
  const projection = geoNaturalEarth1()
    .fitSize([width, height], worldGeoJSON)
    .precision(0.1);

  const path = geoPath(projection);
  return { projection, path };
}
