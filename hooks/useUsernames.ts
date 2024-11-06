import { useQuery } from "@tanstack/react-query";

// Define the hook
export const useFetchUsernames = () => {
	return useQuery({
		queryKey: ["fetchUsernames"],
		refetchInterval: 5000,
		refetchIntervalInBackground: true,
		queryFn: async () => {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/account/users`);
			if (!response.ok) {
				throw new Error(`Failed to fetch usernames: ${response.statusText}`);
			}
			const data = await response.json();
			return data.users;
		},
		staleTime: 60000, // Cache data for 1 minute
	});
};
