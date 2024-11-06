import React, { useState, useEffect } from "react";
import { useFetchAccount } from "../hooks/useFetchAccount";
import { useQueryClient } from "@tanstack/react-query";
import { useTransactionHistory } from "../hooks/useTransactionHistory";

interface WalletInterfaceProps {
	address: string;
	username: string;
}

export const WalletInterface: React.FC<WalletInterfaceProps> = ({ address, username }) => {
	const [receiverInput, setReceiverInput] = useState("");
	const [amount, setAmount] = useState("");
	const [isFunding, setIsFunding] = useState(false);
	const [isSending, setIsSending] = useState(false);

	const queryClient = useQueryClient();
	const { data: account, refetch: refetchAccount } = useFetchAccount({ username });
	const { data: txHistory, refetch: refetchTransactionHistory } = useTransactionHistory({ username });

	useEffect(() => {
		if (account?.balance && account.balance !== "0 ETH") {
			setIsFunding(false);
		}
	}, [account?.balance]);

	const faucetFund = async () => {
		try {
			setIsFunding(true);
			await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/account/${username}/faucet`);
			refetchAccount(); // Trigger an account refetch after faucet
		} catch (error) {
			alert("Faucet funding failed. Please try again.");
		} finally {
			setIsFunding(false);
		}
	};

	const sendFunds = async () => {
		if (!receiverInput.startsWith("@") || !amount) return;

		const receiverUsername = receiverInput.slice(1); // remove "@" prefix
		try {
			setIsSending(true);
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/account/${username}/note/to/${receiverUsername}/asset/${amount}`
			);
			if (response.ok) {
				alert("Funds sent successfully!");
				setReceiverInput("");
				setAmount("");
				refetchAccount();
				refetchTransactionHistory();
			} else {
				alert("Failed to send funds.");
			}
		} catch {
			alert("An error occurred while sending funds.");
		} finally {
			setIsSending(false);
		}
	};

	const copyToClipboard = () => {
		navigator.clipboard.writeText(address);
		alert("Address copied to clipboard!");
	};

	const handleUpdate = async () => {
		await queryClient.invalidateQueries({ queryKey: ["fetchAccount", username] });
		await queryClient.invalidateQueries({ queryKey: ["fetchTransactionHistory", username] });
	};

	return (
		<div className="wallet-container">
			<div className="address-section">
				<span className="address-text">{address}</span>
				<button onClick={copyToClipboard} className="copy-btn">
					Copy
				</button>
			</div>

			<div className="balance-section">
				{account ? <h2>{account.balance}</h2> : <p>Loading balance...</p>}
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
					onChange={(e) => setReceiverInput(e.target.value)}
				/>
				<input
					type="number"
					placeholder="Amount"
					value={amount}
					onChange={(e) => setAmount(e.target.value)}
				/>
				<button onClick={sendFunds} disabled={!amount || !receiverInput || isSending}>
					Send Funds
				</button>
			</div>

			<div className="transaction-history-section">
				<h3>Transaction History</h3>
				{txHistory?.transactions?.length ? (
					txHistory.transactions.map((tx, idx) => (
						<div key={tx?.note_id || idx} className={`transaction-box ${tx?.acc_sender === address ? "sent" : "received"}`}>
							{tx?.acc_sender === address ? "Sent" : "Received"} {tx?.value} ETH{" "}
							{tx?.acc_sender === address ? "to" : "from"}{" "}
							{tx?.acc_sender === address ? tx?.acc_recipient : tx?.acc_sender} on {new Date(tx?.timestamp || "").toLocaleString()}
						</div>
					))
				) : (
					<p>No transactions available.</p>
				)}
			</div>
		</div>
	);
};

export default WalletInterface;
