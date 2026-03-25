import { useEffect, useRef, useState } from "react";
import { createGlobeContext } from "../three/createGlobeContext";
import type { CoreContext } from "@vladkrutenyuk/three-kvy-core";
import type { GlobeModules } from "../three/createGlobeContext";
import type { GlobeFeature } from "../three/features/GlobeFeature";

export function useGlobeContext() {
	const containerRef = useRef<HTMLDivElement>(null);
	const ctxRef = useRef<CoreContext<GlobeModules> | null>(null);
	const globeFeatureRef = useRef<GlobeFeature | null>(null);

	const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
	const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);

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

			// Связываем выбор страны с React-состоянием
			globeFeature.onSelect = (id, name) => {
				setSelectedCountryId(id ?? null);
				setSelectedCountryName(name ?? null);
			};

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

	function deselectCountry() {
		globeFeatureRef.current?.setSelected(undefined);
	}

	return { containerRef, selectedCountryId, selectedCountryName, deselectCountry };
}
