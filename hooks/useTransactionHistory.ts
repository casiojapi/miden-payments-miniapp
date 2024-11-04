import { useQuery } from "@tanstack/react-query";
import { z } from 'zod';

const TxHistory = z.object({
	transactions: z.array(
		z.object({
			note_id: z.string(),
			acc_sender: z.string(),
			acc_recipient: z.string(),
			acc_recipient_user_id: z.string(),
			faucet: z.string(),
			value: z.string(),
			timestamp: z.coerce.date(),
			transaction_type: z.string(),
		}).nullish()
	)
}
);

export const useTransactionHistory = (props: { username: string }) => {
	const { username } = props;

	return useQuery({
		enabled: !!username,
		queryKey: ["useTransactionHistory", username],
		refetchInterval: 5000,
		refetchIntervalInBackground: true,
		queryFn: async () => {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/account/${username}/transactions`);
			if (!response.ok) {
				throw new Error(`Error fetching transaction history: ${response.statusText}`);
			}

			const data = await response.json();
			return TxHistory.parse(data);
		},
	});
};
