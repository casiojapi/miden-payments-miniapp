import { useQuery } from "@tanstack/react-query";
import { z } from 'zod';

const TxHistory = z.object({
	transactions: z.array(
		z.object({
			transaction_id: z.string(),
			sender_id: z.string(),
			receiver_id: z.string(),
			amount: z.string(),
			timestamp: z.coerce.date(),
		}).nullish()
	)
}
);

export const useTransactionHistory = (props: { address: string }) => {
	const { address } = props;
	const userId = address.replace('0x', '');

	return useQuery({
		enabled: !!address,
		queryKey: ["useTransactionHistory", userId],
		refetchInterval: 5000,
		refetchIntervalInBackground: true,
		queryFn: async () => {

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/account/${userId}/transactions`);
			if (!response.ok) {
				throw new Error(`Error fetching account transactions history: ${response.statusText}`);
			}

			const data = await response.json();
			console.log("Response data:", data);

			return TxHistory.parse(data);
		},
	});
};

