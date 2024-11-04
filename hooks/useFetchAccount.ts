import { useQuery } from "@tanstack/react-query";
import { z } from 'zod';

const Account = z.object({
	username: z.string().nullish(),
	balance: z.string().nullish(),
	account: z.string().nullish()
});

export const useFetchAccount = (props: { username: string }) => {
	const { username } = props;

	return useQuery({
		enabled: !!username,
		queryKey: ["useFetchAccount", username],
		refetchInterval: 5000,
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
