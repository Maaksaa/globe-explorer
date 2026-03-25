import { useEffect, useMemo, useRef, useState } from "react";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Input } from "@base-ui/react/input";
import { ScrollArea } from "@base-ui/react/scroll-area";
import { Menu } from "@base-ui/react/menu";
import { cn } from "../lib/cn";
import { useAllCountries } from "../hooks/useAllCountries";
import type { SortingState } from "@tanstack/react-table";
import type { CountrySummary } from "../api/countries";

interface CountryTablePanelProps {
	selectedCountryId: string | null;
	hoveredCountryId: string | null;
	onHover: (id: string | undefined) => void;
	onSelect: (id: string | undefined) => void;
}

const columnHelper = createColumnHelper<CountrySummary>();

const COLUMNS = [
	columnHelper.accessor((row) => row.name.common, {
		id: "name",
		header: "Страна",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("region", {
		header: "Регион",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("population", {
		header: "Население",
		cell: (info) =>
			info.getValue() > 0 ? info.getValue().toLocaleString("ru-RU") : "—",
	}),
];

const ROW_HEIGHT = 34;

export function CountryTablePanel({
	selectedCountryId,
	hoveredCountryId,
	onHover,
	onSelect,
}: CountryTablePanelProps) {
	const { data: allCountries = [], isLoading } = useAllCountries();

	const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);
	const [globalFilter, setGlobalFilter] = useState("");
	const [regionFilter, setRegionFilter] = useState("");

	const scrollRef = useRef<HTMLDivElement>(null);

	// Список уникальных регионов для селекта
	const regions = useMemo(() => {
		const set = new Set(allCountries.map((c) => c.region).filter(Boolean));
		return Array.from(set).sort();
	}, [allCountries]);

	// Предфильтрация по региону до передачи в react-table
	const data = useMemo(() => {
		if (!regionFilter) return allCountries;
		return allCountries.filter((c) => c.region === regionFilter);
	}, [allCountries, regionFilter]);

	const table = useReactTable({
		data,
		columns: COLUMNS,
		state: { sorting, globalFilter },
		onSortingChange: setSorting,
		onGlobalFilterChange: setGlobalFilter,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		globalFilterFn: "includesString",
	});

	const rows = table.getRowModel().rows;

	const virtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => scrollRef.current,
		estimateSize: () => ROW_HEIGHT,
		overscan: 10,
	});

	// Автоскролл к выбранной стране (при клике на глобусе)
	useEffect(() => {
		if (!selectedCountryId) return;
		const idx = rows.findIndex((r) => r.original.ccn3 === selectedCountryId);
		if (idx !== -1) {
			virtualizer.scrollToIndex(idx, { behavior: "smooth" });
		}
	}, [selectedCountryId]); // virtualizer и rows намеренно не в deps — нужна реакция только на смену выбора

	const virtualItems = virtualizer.getVirtualItems();

	return (
		<div
			className={cn(
				"fixed z-10 flex flex-col",
				"bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-2xl",
				// Mobile: снизу
				"bottom-0 left-0 right-0 rounded-t-2xl max-h-[50vh]",
				// Desktop: слева
				"md:bottom-4 md:left-4 md:right-auto md:top-4 md:w-80 md:rounded-2xl md:max-h-none"
			)}
		>
			{/* Фильтры */}
			<div className="px-3 pt-3 pb-2 border-b border-white/20 shrink-0 space-y-2">
				<h2 className="text-xs font-semibold uppercase tracking-wide text-white/50">
					Страны{" "}
					{rows.length > 0 && (
						<span className="font-normal">({rows.length})</span>
					)}
				</h2>

				{/* Поиск — base-ui Input */}
				<Input
					type="text"
					value={globalFilter}
					onChange={(e) => setGlobalFilter(e.target.value)}
					placeholder="Поиск по названию..."
					className={cn(
						"w-full rounded-lg px-3 py-1.5 text-sm",
						"bg-white/10 border border-white/20 text-white placeholder:text-white/40",
						"outline-none focus:border-white/40 focus:bg-white/15 transition-colors"
					)}
				/>

				{/* Фильтр по региону — base-ui Menu */}
				<Menu.Root>
					<Menu.Trigger
						className={cn(
							"flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-sm",
							"bg-white/10 border border-white/20 text-white",
							"outline-none focus:border-white/40 transition-colors cursor-pointer"
						)}
					>
						<span className={cn(!regionFilter && "text-white/60")}>
							{regionFilter || "Все регионы"}
						</span>
						<svg
							width="12"
							height="12"
							viewBox="0 0 12 12"
							fill="none"
							className="ml-1 text-white/40"
						>
							<path
								d="M3 4.5L6 7.5L9 4.5"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</Menu.Trigger>

					<Menu.Portal>
						<Menu.Positioner sideOffset={4} align="end" className="z-50">
							<Menu.Popup
								className={cn(
									"min-w-40 rounded-xl py-1",
									"bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl"
								)}
							>
								<Menu.Item
									onClick={() => setRegionFilter("")}
									className={cn(
										"flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer",
										"outline-none data-highlighted:bg-white/10",
										!regionFilter ? "text-white" : "text-white/60"
									)}
								>
									<span className="w-4 text-xs">
										{!regionFilter && "✓"}
									</span>
									Все регионы
								</Menu.Item>

								{regions.map((r) => (
									<Menu.Item
										key={r}
										onClick={() => setRegionFilter(r)}
										className={cn(
											"flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer",
											"outline-none data-highlighted:bg-white/10",
											regionFilter === r
												? "text-white"
												: "text-white/60"
										)}
									>
										<span className="w-4 text-xs">
											{regionFilter === r && "✓"}
										</span>
										{r}
									</Menu.Item>
								))}
							</Menu.Popup>
						</Menu.Positioner>
					</Menu.Portal>
				</Menu.Root>
			</div>

			{/* Заголовки колонок */}
			<div className="shrink-0 border-b border-white/20">
				{table.getHeaderGroups().map((hg) => (
					<div key={hg.id} className="flex">
						{hg.headers.map((header) => (
							<div
								key={header.id}
								onClick={header.column.getToggleSortingHandler()}
								className={cn(
									"px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white/50 select-none",
									header.column.getCanSort() &&
										"cursor-pointer hover:text-white/80 transition-colors",
									header.id === "name" && "flex-1 min-w-0",
									header.id === "region" && "w-24 shrink-0",
									header.id === "population" &&
										"w-24 shrink-0 text-right"
								)}
							>
								{flexRender(
									header.column.columnDef.header,
									header.getContext()
								)}
								{header.column.getIsSorted() === "asc" && " ↑"}
								{header.column.getIsSorted() === "desc" && " ↓"}
							</div>
						))}
					</div>
				))}
			</div>

			{/* Виртуализированный список строк — base-ui ScrollArea */}
			<ScrollArea.Root className="flex-1 min-h-0">
				<ScrollArea.Viewport ref={scrollRef} className="h-full">
					{isLoading && (
						<p className="px-3 py-4 text-sm text-white/40">Загрузка...</p>
					)}

					{!isLoading && rows.length === 0 && (
						<p className="px-3 py-4 text-sm text-white/40">
							Ничего не найдено
						</p>
					)}

					<div
						style={{
							height: virtualizer.getTotalSize(),
							position: "relative",
						}}
					>
						{virtualItems.map((vRow) => {
							const row = rows[vRow.index];
							const isSelected = row.original.ccn3 === selectedCountryId;
							const isHovered = row.original.ccn3 === hoveredCountryId;

							return (
								<div
									key={row.id}
									style={{
										position: "absolute",
										top: vRow.start,
										height: vRow.size,
										width: "100%",
									}}
									onClick={() => onSelect(row.original.ccn3)}
									onMouseEnter={() => onHover(row.original.ccn3)}
									onMouseLeave={() => onHover(undefined)}
									className={cn(
										"flex items-center cursor-pointer transition-colors",
										isSelected
											? "bg-[#e8c547]/25 text-[#e8c547]"
											: isHovered
												? "bg-[#5cb85c]/20 text-white"
												: "text-white/80 hover:bg-white/10"
									)}
								>
									{row.getVisibleCells().map((cell) => (
										<div
											key={cell.id}
											className={cn(
												"px-3 text-sm truncate",
												cell.column.id === "name" &&
													"flex-1 min-w-0",
												cell.column.id === "region" &&
													"w-24 shrink-0 text-white/60 text-xs",
												cell.column.id === "population" &&
													"w-24 shrink-0 text-right text-xs tabular-nums"
											)}
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</div>
									))}
								</div>
							);
						})}
					</div>
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
