import * as THREE from "three/webgpu";
import CameraControls from "camera-controls";
import { CoreContextModule } from "@vladkrutenyuk/three-kvy-core";
import type { CoreContext } from "@vladkrutenyuk/three-kvy-core";

CameraControls.install({
	THREE: {
		Vector2: THREE.Vector2,
		Vector3: THREE.Vector3,
		Vector4: THREE.Vector4,
		Quaternion: THREE.Quaternion,
		Matrix4: THREE.Matrix4,
		Spherical: THREE.Spherical,
		Box3: THREE.Box3,
		Sphere: THREE.Sphere,
		Raycaster: THREE.Raycaster,
	},
});

export class CameraControlsModule extends CoreContextModule {
	controls: CameraControls | null = null;

	protected useCtx(ctx: CoreContext) {
		const { camera, renderer } = ctx.three;

		this.controls = new CameraControls(camera, renderer.domElement);

		this.controls.minDistance = 2;
		this.controls.maxDistance = 10;
		this.controls.dollySpeed = 0.5;

		const onBeforeRender = () => {
			if (this.controls) {
				this.controls.update(ctx.deltaTime);
			}
		};

		const three = ctx.three as any;
		three.on("renderbefore", onBeforeRender);

		return () => {
			three.off("renderbefore", onBeforeRender);
			this.controls?.dispose();
			this.controls = null;
		};
	}
}
