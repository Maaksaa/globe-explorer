import * as THREE from "three/webgpu";
import * as KVY from "@vladkrutenyuk/three-kvy-core";
import { CameraControlsModule } from "./modules/CameraControlsModule";
import { TweenModule } from "./modules/TweenModule";
import { GlobeFeature } from "./features/GlobeFeature";

export type GlobeModules = {
	cameraControls: CameraControlsModule;
	tween: TweenModule;
};

export async function createGlobeContext() {
	const renderer = new THREE.WebGPURenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	await renderer.init();

	const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
	camera.position.set(0, 0, 3);

	const scene = new THREE.Scene();
	const clock = new THREE.Clock();

	const ctx = KVY.CoreContext.create<GlobeModules>({
		renderer,
		camera,
		scene,
		clock,
		modules: {
			cameraControls: new CameraControlsModule(),
			tween: new TweenModule(),
		},
	});

	// Освещение
	const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
	ctx.root.add(ambientLight);

	const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
	directionalLight.position.set(5, 3, 5);
	ctx.root.add(directionalLight);

	// Глобус — сфера с canvas-текстурой стран
	const globeGroup = new THREE.Group();
	ctx.root.add(globeGroup);
	KVY.addFeature(globeGroup, GlobeFeature);

	return ctx;
}
