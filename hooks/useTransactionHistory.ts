import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const Transaction = z.object({
	note_id: z.string().nullish(),
	acc_sender: z.string().nullish(),
	acc_recipient: z.string().nullish(),
	value: z.string().nullish(),
	timestamp: z.string().nullish(),
});

const TransactionHistory = z.object({
	transactions: z.array(Transaction).nullish(),
});

export const useTransactionHistory = ({ username }: { username: string }) => {
	return useQuery({
		queryKey: ["fetchTransactionHistory", username],
		enabled: !!username,
		refetchInterval: 5000,
		refetchIntervalInBackground: true,
		queryFn: async () => {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/account/${username}/transactions`);
			if (!response.ok) {
				throw new Error(`Error fetching transaction history: ${response.statusText}`);
			}
			const data = await response.json();
			return TransactionHistory.parse(data);
		},
	});
};
