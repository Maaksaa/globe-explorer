import { useEffect, useRef, useState } from "react";
import { createGlobeContext } from "../three/createGlobeContext";
import type { CoreContext } from "@vladkrutenyuk/three-kvy-core";
import type { GlobeModules } from "../three/createGlobeContext";
import type { GlobeFeature } from "../three/features/GlobeFeature";
import type { CountryEntry } from "../three/geo/globeTexture";

export function useGlobeContext() {
	const containerRef = useRef<HTMLDivElement>(null);
	const ctxRef = useRef<CoreContext<GlobeModules> | null>(null);
	const globeFeatureRef = useRef<GlobeFeature | null>(null);

	const [countries, setCountries] = useState<CountryEntry[]>([]);
	const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
	const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);
	const [hoveredCountryId, setHoveredCountryId] = useState<string | null>(null);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		let cancelled = false;

		createGlobeContext().then(({ ctx, globeFeature }) => {
			if (cancelled) {
				ctx.destroy();
				return;
			}

			ctxRef.current = ctx;
			globeFeatureRef.current = globeFeature;

			globeFeature.onSelect = (id, name) => {
				setSelectedCountryId(id ?? null);
				setSelectedCountryName(name ?? null);
			};

			globeFeature.onHover = (id) => {
				setHoveredCountryId(id ?? null);
			};

			setCountries(globeFeature.countries);

			ctx.three.mount(container);
			ctx.run();
		});

		return () => {
			cancelled = true;
			if (ctxRef.current) {
				ctxRef.current.destroy();
				ctxRef.current = null;
			}
			globeFeatureRef.current = null;
		};
	}, []);

	function hoverCountry(id: string | undefined) {
		globeFeatureRef.current?.setHovered(id);
	}

	function selectCountry(id: string | undefined) {
		globeFeatureRef.current?.setSelected(id);
	}

	function deselectCountry() {
		globeFeatureRef.current?.setSelected(undefined);
	}

	return {
		containerRef,
		countries,
		selectedCountryId,
		selectedCountryName,
		hoveredCountryId,
		hoverCountry,
		selectCountry,
		deselectCountry,
	};
}
