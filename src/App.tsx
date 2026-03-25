import { useGlobeContext } from "./hooks/useGlobeContext";
import { GlobeCanvas } from "./components/GlobeCanvas";
import { CountryInfoPanel } from "./components/CountryInfoPanel";

function App() {
	const { containerRef, selectedCountryId, selectedCountryName, deselectCountry } =
		useGlobeContext();

	return (
		<div className="relative h-screen w-screen bg-black">
			<GlobeCanvas containerRef={containerRef} />

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
