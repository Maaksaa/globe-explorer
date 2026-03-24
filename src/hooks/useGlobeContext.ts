import { useEffect, useRef } from "react";
import { createGlobeContext } from "../three/createGlobeContext";

export function useGlobeContext() {
	const containerRef = useRef<HTMLDivElement>(null);
	const ctxRef = useRef<Awaited<ReturnType<typeof createGlobeContext>> | null>(null);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		let cancelled = false;

		createGlobeContext().then((ctx) => {
			if (cancelled) {
				ctx.destroy();
				return;
			}

			ctxRef.current = ctx;

			ctx.three.mount(container);

			ctx.run();
		});

		return () => {
			cancelled = true;
			if (ctxRef.current) {
				ctxRef.current.destroy();
				ctxRef.current = null;
			}
		};
	}, []);

	return { containerRef, ctxRef };
}
