import * as THREE from "three/webgpu";
import * as KVY from "@vladkrutenyuk/three-kvy-core";
import { Object3DFeature } from "@vladkrutenyuk/three-kvy-core";
import { geoContains } from "d3-geo";
import { GlobeFeature } from "./GlobeFeature";
import type { CoreContext } from "@vladkrutenyuk/three-kvy-core";
import type { GlobeModules } from "../createGlobeContext";

export class CountryPickerFeature extends Object3DFeature<GlobeModules> {
	private raycaster = new THREE.Raycaster();
	private pointer = new THREE.Vector2();
	private globeFeature: GlobeFeature | null = null;

	protected useCtx(ctx: CoreContext<GlobeModules>) {
		this.globeFeature = KVY.getFeatureBy<GlobeFeature>(
			this.object,
			(f) => f.constructor === GlobeFeature
		);

		const canvas = ctx.three.renderer.domElement;

		const onMove = (e: PointerEvent) => this.pick(e, ctx, false);
		const onClick = (e: PointerEvent) => this.pick(e, ctx, true);

		canvas.addEventListener("pointermove", onMove);
		canvas.addEventListener("click", onClick);

		return () => {
			canvas.removeEventListener("pointermove", onMove);
			canvas.removeEventListener("click", onClick);
			this.globeFeature = null;
		};
	}

	private pick(e: PointerEvent, ctx: CoreContext<GlobeModules>, isClick: boolean) {
		const canvas = ctx.three.renderer.domElement;
		const rect = canvas.getBoundingClientRect();

		this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
		this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

		this.raycaster.setFromCamera(this.pointer, ctx.three.camera);

		const hits = this.raycaster.intersectObject(this.object, true);
		if (hits.length === 0) {
			if (!isClick) this.globeFeature?.setHovered(undefined);
			return;
		}

		// 3D-точка → lat/lon
		const p = hits[0].point;
		const lat = 90 - (Math.acos(p.y / p.length()) * 180) / Math.PI;
		const lon = (((Math.atan2(p.z, -p.x) * 180) / Math.PI + 360) % 360) - 180;

		// Ищем страну
		const found = this.globeFeature?.countries.find(({ feature }) =>
			geoContains(feature, [lon, lat])
		);

		if (isClick) {
			this.globeFeature?.setSelected(found?.id);
		} else {
			this.globeFeature?.setHovered(found?.id);
		}
	}
}
