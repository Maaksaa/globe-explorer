import { useGlobeContext } from "./hooks/useGlobeContext";
import { GlobeCanvas } from "./components/GlobeCanvas";
import { CountryInfoPanel } from "./components/CountryInfoPanel";
import { CountryListPanel } from "./components/CountryListPanel";

function App() {
	const {
		containerRef,
		countries,
		selectedCountryId,
		selectedCountryName,
		hoveredCountryId,
		hoverCountry,
		selectCountry,
		deselectCountry,
	} = useGlobeContext();

	return (
		<div className="relative h-screen w-screen bg-black">
			<GlobeCanvas containerRef={containerRef} />

			<CountryListPanel
				countries={countries}
				selectedCountryId={selectedCountryId}
				hoveredCountryId={hoveredCountryId}
				onHover={hoverCountry}
				onSelect={selectCountry}
			/>

			{selectedCountryId && selectedCountryName && (
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
