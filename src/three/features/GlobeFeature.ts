import * as THREE from "three/webgpu";
import { Object3DFeature } from "@vladkrutenyuk/three-kvy-core";
import { createGlobeTexture } from "../geo/globeTexture";
import type { CoreContext } from "@vladkrutenyuk/three-kvy-core";
import type { GlobeModules } from "../createGlobeContext";
import type { CountryEntry } from "../geo/globeTexture";

/**
 * GlobeFeature — Feature на globeGroup.
 *
 * Создаёт сферу с canvas-текстурой (рисунок стран через d3-geo).
 * Хранит список стран для последующего пикинга.
 * Предоставляет setHovered / setSelected — перерисовывают текстуру.
 */
export class GlobeFeature extends Object3DFeature<GlobeModules> {
	// Список стран доступен для CountryPickerFeature
	countries: CountryEntry[] = [];

	private texture: THREE.CanvasTexture | null = null;
	private drawFn: ((hoveredId?: string, selectedId?: string) => void) | null = null;
	private hoveredId: string | undefined = undefined;
	private selectedId: string | undefined = undefined;
	onSelect: ((id: string | undefined, name: string | undefined) => void) | null = null;

	// ── публичные методы (вызывает CountryPickerFeature) ──

	setHovered(id: string | undefined) {
		if (this.hoveredId === id) return;
		this.hoveredId = id;
		this.refresh();
	}

	setSelected(id: string | undefined) {
		if (this.selectedId === id) return;
		this.selectedId = id;
		this.refresh();
		const name = this.countries.find((c) => c.id === id)?.name;
		this.onSelect?.(id, name);
	}

	// ── lifecycle ──────────────────────────────

	protected useCtx(_ctx: CoreContext<GlobeModules>) {
		const { texture, countries, draw } = createGlobeTexture();

		this.texture = texture;
		this.countries = countries;
		this.drawFn = draw;

		const geometry = new THREE.SphereGeometry(1, 64, 64);
		const material = new THREE.MeshStandardMaterial({
			map: texture,
			roughness: 0.8,
		});
		texture.anisotropy = 16;
		const sphere = new THREE.Mesh(geometry, material);
		this.object.add(sphere);

		return () => {
			this.object.remove(sphere);
			geometry.dispose();
			material.dispose();
			texture.dispose();
			this.texture = null;
			this.drawFn = null;
			this.countries = [];
		};
	}

	// ── private ────────────────────────────────

	private refresh() {
		if (!this.drawFn || !this.texture) return;
		this.drawFn(this.hoveredId, this.selectedId);
		this.texture.needsUpdate = true;
	}
}
