import { useQuery } from "@tanstack/react-query";
import { z } from 'zod';

const Account = z.object({
	id: z.string().nullish(),
	user_id: z.string().nullish(),
	username: z.string().nullish(),
	balance: z.string().nullish(),
	notes: z.array(z.string()).nullish(),
});

export const useFetchAccount = (props: { address: string }) => {
	const { address } = props;
	const userId = address.replace('0x', '');

	return useQuery({
		enabled: !!address,
		queryKey: ["useFetchAccount", userId],
		refetchInterval: 5000,
		queryFn: async () => {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/account/${userId}`);
			if (!response.ok) {
				throw new Error(`Error fetching account data: ${response.statusText}`);
			}

			const data = await response.json();
			console.log("Response data:", data);

			return Account.parse(data);
		},
	});
};
