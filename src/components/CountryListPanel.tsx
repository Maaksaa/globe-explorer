import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollArea } from "@base-ui/react/scroll-area";
import { cn } from "../lib/cn";
import type { CountryEntry } from "../three/geo/globeTexture";

interface CountryListPanelProps {
	countries: CountryEntry[];
	selectedCountryId: string | null;
	hoveredCountryId: string | null;
	onHover: (id: string | undefined) => void;
	onSelect: (id: string | undefined) => void;
}

export function CountryListPanel({
	countries,
	selectedCountryId,
	hoveredCountryId,
	onHover,
	onSelect,
}: CountryListPanelProps) {
	const [search, setSearch] = useState("");
	const selectedItemRef = useRef<HTMLButtonElement | null>(null);

	const sorted = useMemo(() => {
		const seen = new Set<string>();
		return countries
			.filter((c) => {
				if (!c.name.trim() || !c.id) return false;
				if (seen.has(c.id)) return false;
				seen.add(c.id);
				return true;
			})
			.sort((a, b) => a.name.localeCompare(b.name));
	}, [countries]);

	const filtered = useMemo(() => {
		const query = search.trim().toLowerCase();
		return query
			? sorted.filter((c) => c.name.toLowerCase().includes(query))
			: sorted;
	}, [sorted, search]);

	// Автоскролл к выбранной стране (например, при клике на глобусе)
	useEffect(() => {
		if (selectedCountryId && selectedItemRef.current) {
			selectedItemRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
		}
	}, [selectedCountryId]);

	return (
		<div
			className={cn(
				"fixed z-10",
				"bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-2xl",
				"flex flex-col",
				// Mobile: панель снизу
				"bottom-0 left-0 right-0 rounded-t-2xl max-h-[45vh]",
				// Desktop: панель слева
				"md:bottom-4 md:left-4 md:right-auto md:top-4 md:w-64 md:rounded-2xl md:max-h-none"
			)}
		>
			{/* Поиск */}
			<div className="px-4 pt-4 pb-3 border-b border-white/20 shrink-0">
				<h2 className="text-xs font-semibold uppercase tracking-wide text-white/50 mb-2">
					Страны
				</h2>
				<input
					type="search"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Поиск..."
					className={cn(
						"w-full rounded-lg px-3 py-1.5 text-sm",
						"bg-white/10 border border-white/20 text-white placeholder:text-white/40",
						"outline-none focus:border-white/40 focus:bg-white/15 transition-colors"
					)}
				/>
			</div>

			{/* Список через ScrollArea */}
			<ScrollArea.Root className="flex-1 min-h-0">
				<ScrollArea.Viewport className="h-full py-1">
					{filtered.length === 0 && (
						<p className="px-4 py-3 text-sm text-white/40">Ничего не найдено</p>
					)}

					{filtered.map((country) => {
						const isSelected = country.id === selectedCountryId;
						const isHovered = country.id === hoveredCountryId;

						return (
							<button
								key={country.id}
								ref={isSelected ? selectedItemRef : undefined}
								onClick={() => onSelect(country.id)}
								onMouseEnter={() => onHover(country.id)}
								onMouseLeave={() => onHover(undefined)}
								className={cn(
									"w-full text-left px-4 py-1.5 text-sm cursor-pointer transition-colors",
									isSelected
										? "bg-[#e8c547]/30 text-[#e8c547] font-medium"
										: isHovered
										? "bg-[#5cb85c]/20 text-white"
										: "text-white/80 hover:bg-white/10"
								)}
							>
								{country.name}
							</button>
						);
					})}
				</ScrollArea.Viewport>

				<ScrollArea.Scrollbar
					orientation="vertical"
					className="flex w-1.5 touch-none select-none p-px mr-1"
				>
					<ScrollArea.Thumb className="flex-1 rounded-full bg-white/30" />
				</ScrollArea.Scrollbar>
			</ScrollArea.Root>
		</div>
	);
}
