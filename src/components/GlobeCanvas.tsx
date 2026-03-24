import { useGlobeContext } from "../hooks/useGlobeContext";

export function GlobeCanvas() {
	const { containerRef } = useGlobeContext();

	return <div ref={containerRef} className="h-full w-full" />;
}
