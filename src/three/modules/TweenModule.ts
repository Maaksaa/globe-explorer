import { Group } from "@tweenjs/tween.js";
import { CoreContextModule } from "@vladkrutenyuk/three-kvy-core";
import type { CoreContext } from "@vladkrutenyuk/three-kvy-core";

export class TweenModule extends CoreContextModule {
	readonly group = new Group();

	protected useCtx(ctx: CoreContext) {
		const onBeforeRender = () => {
			this.group.update();
		};

		ctx.three.on("renderbefore", onBeforeRender);

		return () => {
			ctx.three.off("renderbefore", onBeforeRender);
			this.group.removeAll();
		};
	}
}
