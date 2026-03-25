import { ScrollArea } from "@base-ui/react/scroll-area";
import { cn } from "../lib/cn";
import { useCountryData } from "../hooks/useCountryData";

interface CountryInfoPanelProps {
	countryId: string;
	countryName: string;
	onClose: () => void;
}

export function CountryInfoPanel({
	countryId,
	countryName,
	onClose,
}: CountryInfoPanelProps) {
	const { data, isLoading, isError } = useCountryData(countryId);

	return (
		<div
			className={cn(
				"fixed z-10",
				"backdrop-blur-md shadow-2xl",
				"bg-white/80 border border-black/10 text-gray-900",
				"dark:bg-white/10 dark:border-white/20 dark:text-white",
				// Mobile: панель снизу
				"bottom-0 left-0 right-0 rounded-t-2xl max-h-[55vh] flex flex-col",
				// Desktop: панель справа снизу (50% высоты)
				"md:bottom-4 md:left-auto md:right-4 md:top-auto md:h-[calc(50vh-1rem)] md:w-80 md:rounded-2xl md:max-h-none"
			)}
		>
			{/* Заголовок */}
			<div className="px-5 pt-4 pb-4 border-b border-black/10 dark:border-white/20 shrink-0">
				<div className="flex items-start justify-between gap-2">
					<div className="min-w-0">
						{data?.flags.svg && (
							<img
								src={data.flags.svg}
								alt={data.flags.alt ?? countryName}
								className="h-10 rounded mb-3 shadow"
							/>
						)}
						<h2 className="text-xl font-bold leading-tight">
							{data?.name.common ?? countryName}
						</h2>
						{data?.name.official &&
							data.name.official !== data.name.common && (
								<p className="text-sm text-gray-500 dark:text-white/60 mt-0.5">
									{data.name.official}
								</p>
							)}
					</div>

					<button
						onClick={onClose}
						aria-label="Закрыть"
						className={cn(
							"shrink-0 mt-0.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-colors",
							"bg-black/5 text-gray-400 hover:bg-black/10 hover:text-gray-600",
							"dark:bg-white/10 dark:text-white/60 dark:hover:bg-white/20 dark:hover:text-white"
						)}
					>
						✕
					</button>
				</div>
			</div>

			{/* Скроллируемый контент через base-ui ScrollArea */}
			<ScrollArea.Root className="flex-1 min-h-0">
				<ScrollArea.Viewport className="h-full p-5">
					{isLoading && (
						<p className="text-gray-400 dark:text-white/60 text-sm">
							Загрузка данных...
						</p>
					)}

					{isError && (
						<p className="text-red-500 dark:text-red-400 text-sm">
							Не удалось загрузить данные
						</p>
					)}

					{data && (
						<dl className="space-y-3 text-sm pb-2">
							{data.capital?.[0] && (
								<div>
									<dt className="text-gray-500 dark:text-white/50 text-xs uppercase tracking-wide mb-0.5">
										Столица
									</dt>
									<dd className="font-medium">
										{data.capital[0]}
									</dd>
								</div>
							)}

							<div>
								<dt className="text-gray-500 dark:text-white/50 text-xs uppercase tracking-wide mb-0.5">
									Регион
								</dt>
								<dd className="font-medium">
									{data.subregion
										? `${data.subregion}, ${data.region}`
										: data.region}
								</dd>
							</div>

							<div>
								<dt className="text-gray-500 dark:text-white/50 text-xs uppercase tracking-wide mb-0.5">
									Население
								</dt>
								<dd className="font-medium">
									{data.population.toLocaleString("ru-RU")}{" "}
									чел.
								</dd>
							</div>

							{data.languages && (
								<div>
									<dt className="text-gray-500 dark:text-white/50 text-xs uppercase tracking-wide mb-0.5">
										Языки
									</dt>
									<dd className="font-medium">
										{Object.values(data.languages).join(
											", "
										)}
									</dd>
								</div>
							)}

							{data.currencies && (
								<div>
									<dt className="text-gray-500 dark:text-white/50 text-xs uppercase tracking-wide mb-0.5">
										Валюта
									</dt>
									<dd className="font-medium">
										{Object.values(data.currencies)
											.map(
												(c) =>
													`${c.name} (${c.symbol})`
											)
											.join(", ")}
									</dd>
								</div>
							)}
						</dl>
					)}
				</ScrollArea.Viewport>

				<ScrollArea.Scrollbar
					orientation="vertical"
					className="flex w-1.5 touch-none select-none p-px mr-1"
				>
					<ScrollArea.Thumb className="flex-1 rounded-full bg-black/20 dark:bg-white/30" />
				</ScrollArea.Scrollbar>
			</ScrollArea.Root>
		</div>
	);
}
