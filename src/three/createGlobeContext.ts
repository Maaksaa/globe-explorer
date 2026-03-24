import * as THREE from "three/webgpu";
import { CoreContext } from "@vladkrutenyuk/three-kvy-core";
import { CameraControlsModule } from "./modules/CameraControlsModule";
import { TweenModule } from "./modules/TweenModule";

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

	return CoreContext.create<GlobeModules>({
		renderer,
		camera,
		scene,
		clock,
		modules: {
			cameraControls: new CameraControlsModule(),
			tween: new TweenModule(),
		},
	});
}
