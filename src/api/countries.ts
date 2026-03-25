export interface CountryData {
	name: { common: string; official: string };
	capital?: string[];
	region: string;
	subregion?: string;
	population: number;
	flags: { svg: string; alt?: string };
	languages?: Record<string, string>;
	currencies?: Record<string, { name: string; symbol: string }>;
	cca3: string;
}

export async function fetchCountryByNumericId(numericId: string): Promise<CountryData> {
	// REST Countries API принимает ccn3 — это числовой ISO-код (тот же что в world-atlas)
	const res = await fetch(
		`https://restcountries.com/v3.1/alpha?codes=${numericId}&fields=name,capital,region,subregion,population,flags,languages,currencies,cca3`
	);
	if (!res.ok) throw new Error("Country not found");
	const data = await res.json();
	return data[0] as CountryData;
}
