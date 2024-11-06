import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const Account = z.object({
	address: z.string().nullish(),
	balance: z.string().nullish(),
	username: z.string().nullish(),
});

export const useFetchAccount = ({ username }: { username: string }) => {
	return useQuery({
		queryKey: ["fetchAccount", username],
		//		enabled: !!username,
		//		refetchInterval: 5000,
		//		refetchIntervalInBackground: true,
		queryFn: async () => {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/account/${username}/info`);
			if (!response.ok) {
				throw new Error(`Error fetching account data: ${response.statusText}`);
			}
			const data = await response.json();
			return Account.parse(data);
		},
	});
};
