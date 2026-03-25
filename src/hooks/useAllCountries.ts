import { useQuery } from "@tanstack/react-query";
import { fetchAllCountries } from "../api/countries";

export function useAllCountries() {
	return useQuery({
		queryKey: ["countries", "all"],
		queryFn: fetchAllCountries,
		staleTime: Infinity, // данные не меняются, кешируем навсегда
	});
}
