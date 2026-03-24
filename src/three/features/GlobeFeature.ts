import * as THREE from "three/webgpu";
import { Object3DFeature } from "@vladkrutenyuk/three-kvy-core";
import type { CoreContext } from "@vladkrutenyuk/three-kvy-core";
import type { GlobeModules } from "../createGlobeContext";

export class GlobeFeature extends Object3DFeature<GlobeModules> {
	protected useCtx(_ctx: CoreContext<GlobeModules>) {
		const geometry = new THREE.SphereGeometry(1, 64, 64);
		const material = new THREE.MeshStandardMaterial({
			color: 0x1a3a5c,
			roughness: 0.8,
		});
		const sphereMesh = new THREE.Mesh(geometry, material);

		this.object.add(sphereMesh);

		return () => {
			this.object.remove(sphereMesh);
			geometry.dispose();
			material.dispose();
		};
	}
}
