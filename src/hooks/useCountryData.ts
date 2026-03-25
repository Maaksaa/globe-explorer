import { useQuery } from "@tanstack/react-query";
import { fetchCountryByNumericId } from "../api/countries";

export function useCountryData(numericId: string | null) {
	return useQuery({
		queryKey: ["country", numericId],
		queryFn: () => fetchCountryByNumericId(numericId!),
		enabled: numericId !== null,
	});
}
