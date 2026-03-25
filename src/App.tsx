import { useGlobeContext } from "./hooks/useGlobeContext";
import { useTheme } from "./hooks/useTheme";
import { GlobeCanvas } from "./components/GlobeCanvas";
import { CountryInfoPanel } from "./components/CountryInfoPanel";
import { CountryTablePanel } from "./components/CountryTablePanel";
import { ThemeToggle } from "./components/ThemeToggle";

function App() {
	const {
		containerRef,
		selectedCountryId,
		selectedCountryName,
		hoveredCountryId,
		hoverCountry,
		selectCountry,
		deselectCountry,
	} = useGlobeContext();

	const { theme, toggleTheme } = useTheme();

	const hasSelection = !!(selectedCountryId && selectedCountryName);

	return (
		<div className="relative h-screen w-screen bg-gray-100 dark:bg-black">
			<GlobeCanvas containerRef={containerRef} />

			<ThemeToggle theme={theme} onToggle={toggleTheme} />

			{/* На мобилке: скрываем таблицу когда открыта инфо-панель */}
			<div className={hasSelection ? "hidden md:contents" : "contents"}>
				<CountryTablePanel
					selectedCountryId={selectedCountryId}
					hoveredCountryId={hoveredCountryId}
					onHover={hoverCountry}
					onSelect={selectCountry}
				/>
			</div>

			{hasSelection && (
				<CountryInfoPanel
					countryId={selectedCountryId}
					countryName={selectedCountryName}
					onClose={deselectCountry}
				/>
			)}
		</div>
	);
}

export default App;
