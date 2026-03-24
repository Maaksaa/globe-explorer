import * as KVY from "@vladkrutenyuk/three-kvy-core";
import { feature as topoFeature } from "topojson-client";
import worldAtlas from "world-atlas/countries-50m.json";
import { createCountryMeshes } from "./geo/geoJsonToMeshes";
import { CountryMeshFeature } from "./features/CountryMeshFeature";
import type { GeometryCollection, Topology } from "topojson-specification";
import type { CoreContext } from "@vladkrutenyuk/three-kvy-core";
import type { GlobeModules } from "./createGlobeContext";

export function loadCountries(ctx: CoreContext<GlobeModules>): void {
	const geojson = topoFeature(
		worldAtlas as unknown as Topology,
		(worldAtlas as unknown as Topology<{ countries: GeometryCollection }>).objects
			.countries
	);

	for (const countryFeature of geojson.features) {
		const geometry = countryFeature.geometry;

		if (geometry.type !== "Polygon" && geometry.type !== "MultiPolygon") continue;

		const iso = String(countryFeature.id ?? "");
		const name = (countryFeature.properties as { name?: string } | null)?.name ?? "";

		const group = createCountryMeshes({
			iso,
			name,
			type: geometry.type,
			coordinates: geometry.coordinates as number[][][] | number[][][][],
		});

		ctx.root.add(group);

		KVY.addFeature(group, CountryMeshFeature, { iso, name });
	}
}
