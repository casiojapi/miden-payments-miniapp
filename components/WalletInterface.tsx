import React, { useState, useEffect, useRef, useCallback } from "react";
import { useFetchAccount } from "../hooks/useFetchAccount";
import { useFetchUsernames } from "../hooks/useUsernames";
import { useQueryClient } from "@tanstack/react-query";
import { useTransactionHistory } from "../hooks/useTransactionHistory";
import { toast } from 'react-toastify';

interface WalletInterfaceProps {
	username: string;
	address?: string;
}

export const WalletInterface: React.FC<WalletInterfaceProps> = ({ address, username }) => {
	const [receiverInput, setReceiverInput] = useState("");
	const [amount, setAmount] = useState("");
	const [isFunding, setIsFunding] = useState(false);
	const [isSending, setIsSending] = useState(false);
	const [suggestions, setSuggestions] = useState<string[]>([]);

	const queryClient = useQueryClient();
	const { data: account, isLoading: accountLoading, refetch: refetchAccount } = useFetchAccount({ username });
	const { data: txHistory, isLoading: txHistoryLoading, refetch: refetchTransactionHistory } = useTransactionHistory({ username });
	const { data: usernames = [] } = useFetchUsernames();
	const cachedTransactions = useRef<any[]>([]);
	const cachedBalance = useRef<string | null>(null);

	const fetchTransactionHistory = useCallback(async () => {
		try {
			await refetchTransactionHistory();
		} catch (error) {
			console.error("Failed to fetch transaction history:", error);
			toast.error("Failed to load transaction history. Please try again later.");
		}
	}, [refetchTransactionHistory]);

	useEffect(() => {
		fetchTransactionHistory();
	}, [fetchTransactionHistory]);

	useEffect(() => {
		if (account?.balance && account.balance !== "0 ETH") {
			cachedBalance.current = account.balance;
			setIsFunding(false);
		}
	}, [account?.balance]);

	useEffect(() => {
		if (txHistory?.transactions && txHistory.transactions.length > 0) {
			const newTransactions = txHistory.transactions.filter(
				(tx) => !cachedTransactions.current.find((cachedTx) => cachedTx.note_id === tx.note_id)
			);
			if (newTransactions.length > 0) {
				cachedTransactions.current = [...newTransactions, ...cachedTransactions.current];
				// Sort transactions by timestamp, newest first
				cachedTransactions.current.sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp));
			}
		}
		// If txHistory.transactions is an empty array, we don't update cachedTransactions
	}, [txHistory]);

	const faucetFund = async () => {
		try {
			setIsFunding(true);
			toast.info("Requesting faucet funding...");
			await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/account/${username}/faucet`);
			toast.success("Faucet funding received!");
			await refetchAccount();
			await fetchTransactionHistory();
		} catch (error) {
			toast.error("Faucet funding failed. Please try again.");
		} finally {
			setIsFunding(false);
		}
	};

	const sendFunds = async () => {
		const isUsername = receiverInput.startsWith('@');
		const receiverUsername = isUsername ? receiverInput.substring(1) : null;

		toast.info('Sending funds...');
		try {
			setIsSending(true);
			if (receiverUsername) {
				const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/account/${username}/note/to/${receiverUsername}/asset/${amount}`);
				if (response.ok) {
					toast.success('Funds sent successfully!');
					setReceiverInput('');
					setAmount('');
					await refetchAccount();
					await fetchTransactionHistory();
				} else {
					const errorText = await response.text();
					toast.error(`Error: ${errorText}`);
				}
			}
		} catch (error) {
			toast.error('An unexpected error occurred while sending funds.');
			console.error(error);
		} finally {
			setIsSending(false);
		}
	};

	const handleReceiverInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const inputValue = e.target.value;
		setReceiverInput(inputValue);

		if (inputValue.startsWith('@') && inputValue.length > 1) {
			const filteredSuggestions = usernames.filter((name: string) =>
				name.toLowerCase().startsWith(inputValue.slice(1).toLowerCase())
			);
			setSuggestions(filteredSuggestions);
		} else {
			setSuggestions([]);
		}
	};

	const copyToClipboard = () => {
		navigator.clipboard.writeText(account?.address || "");
		toast.success("Address copied to clipboard!");
	};

	return (
		<div className="wallet-container">
			<div className="address-section">
				<span className="address-text">{account?.address || address}</span>
				<button onClick={copyToClipboard} className="copy-btn">
					Copy
				</button>
			</div>

			<div className="balance-section">
				<h2>{accountLoading ? "Loading..." : (account?.balance || cachedBalance.current || "0 ETH")}</h2>
			</div>

			<div className="update-section">
				<button onClick={faucetFund} className="update-btn" disabled={isFunding}>
					{isFunding ? "Funding..." : "Request Faucet"}
				</button>
			</div>

			<div className="send-note-section">
				<input
					type="text"
					placeholder="Receiver Address or @username"
					value={receiverInput}
					onChange={handleReceiverInputChange}
				/>

				{suggestions.length > 0 && (
					<ul className="suggestions-list">
						{suggestions.map((suggestion, index) => (
							<li
								key={index}
								onClick={() => {
									setReceiverInput(`@${suggestion}`);
									setSuggestions([]);
								}}
							>
								@{suggestion}
							</li>
						))}
					</ul>
				)}

				<input
					type="number"
					placeholder="Amount"
					value={amount}
					onChange={(e) => setAmount(e.target.value)}
				/>
				<button onClick={sendFunds} disabled={!amount || !receiverInput || isSending}>
					{isSending ? "Sending..." : "Send Funds"}
				</button>
			</div>

			<div className="transaction-history-section">
				<h3>Transaction History</h3>
				{txHistoryLoading ? (
					<p>Loading transactions...</p>
				) : cachedTransactions.current.length ? (
					<div className="transaction-list">
						{cachedTransactions.current.map((tx, idx) => {
							const date = tx?.timestamp
								? new Date(parseInt(tx.timestamp) * 1000).toLocaleString()
								: "Invalid date";
							return (
								<div key={tx?.note_id || idx} className={`transaction-box ${tx?.transaction_type === "input" ? "received" : "sent"}`}>
									{tx?.transaction_type === "input" ? "Received" : "Sent"} {tx?.value} ETH{" "}
									{tx?.transaction_type === "input" ? "from" : "to"}{" "}
									{tx?.transaction_type === "input" ? tx?.acc_sender : tx?.acc_recipient} on {date}
								</div>
							);
						})}
					</div>
				) : (
					<p className="no-transactions">No transactions available.</p>
				)}
			</div>
		</div>
	);
};

export default WalletInterface;
