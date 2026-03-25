import type { RefObject } from "react";

interface GlobeCanvasProps {
	containerRef: RefObject<HTMLDivElement | null>;
}

export function GlobeCanvas({ containerRef }: GlobeCanvasProps) {
	return <div ref={containerRef} className="h-full w-full" />;
}
