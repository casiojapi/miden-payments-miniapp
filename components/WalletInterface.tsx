import React, { useState, useEffect, use } from 'react';
import { useFetchAccount } from '../hooks/useFetchAccount';
import { useQueryClient } from '@tanstack/react-query';
import { useTransactionHistory } from '../hooks/useTransactionHistory';

interface WalletInterfaceProps {
	address: string;
	username: string;
}


export const WalletInterface: React.FC<WalletInterfaceProps> = ({ address, username }) => {
	const [balance, setBalance] = useState<string>('0 ETH');
	const [receiverInput, setReceiverInput] = useState('');
	const [amount, setAmount] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	// suggestions
	const [usernames, setUsernames] = useState<string[]>([]); // All usernames
	const [suggestions, setSuggestions] = useState<string[]>([]); // Filtered suggestions

	const queryClient = useQueryClient();
	const account = useFetchAccount({ username });
	const txHistory = useTransactionHistory({ username });

	useEffect(() => {
		fetchUsernames();
	}, []);

	const fetchUsernames = async () => {
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/account/users`);
			if (response.ok) {
				const data = await response.json();
				setUsernames(data.users);
			} else {
				console.error('Failed to fetch usernames:', response.status);
			}
		} catch (error) {
			console.error('Error fetching usernames:', error);
		}
	};

	const handleReceiverInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const inputValue = e.target.value;
		setReceiverInput(inputValue);

		if (inputValue.startsWith('@') && inputValue.length > 0) {
			const filteredSuggestions = usernames.filter((username) =>
				username.toLowerCase().startsWith(inputValue.slice(1).toLowerCase())
			);
			setSuggestions(filteredSuggestions);
		} else {
			setSuggestions([]);
		}
	};

	const faucetFund = async () => {
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/account/${username}/faucet`);
			if (response.ok) {
				alert('Faucet funding successful!');
				handleUpdate();
			} else {
				alert('Error with faucet funding.');
			}
		} catch {
			alert('Network error occurred during faucet funding.');
		}
	};

	const sendFunds = async () => {
		const isUsername = receiverInput.startsWith('@');
		const receiverUsername = isUsername ? receiverInput.substring(1) : null;

		try {
			setIsLoading(true);
			if (receiverUsername) {
				const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/account/${username}/note/to/${receiverUsername}/asset/${amount}`);
				if (response.ok) {
					alert('Funds sent successfully!');
					setReceiverInput('');
					setAmount('');
					handleUpdate(); // Refresh account and transactions
				} else {
					const errorText = await response.text();
					alert(`Error: ${errorText}`);
				}
			}
		} catch {
			alert('An unexpected error occurred while sending funds.');
		} finally {
			setIsLoading(false);
		}
	};

	const copyToClipboard = () => {
		navigator.clipboard.writeText(address);
		alert('Address copied to clipboard!');
	};

	const handleUpdate = async () => {
		setIsLoading(true);
		await queryClient.invalidateQueries();
		setIsLoading(false);
	};

	return (
		<div className="wallet-container">
			{isLoading && <p>Loading...</p>}
			<div className="address-section">
				<span className="address-text">{address}</span>
				<button onClick={copyToClipboard} className="copy-btn">Copy</button>
			</div>

			<div className="balance-section">
				{account.isLoading ? <>loading...</> :
					<h2>{account?.data?.balance}</h2>}
			</div>

			<div className="update-section">
				<button onClick={handleUpdate} className="update-btn">
					sync
				</button>
			</div>

			<div className="send-note-section">
				<input
					type="text"
					placeholder="Receiver Address or @username"
					value={receiverInput}
					onChange={handleReceiverInputChange}
				/>

				{/* Suggestions Dropdown */}
				{suggestions.length > 0 && (
					<ul className="suggestions-list">
						{suggestions.map((suggestion, index) => (
							<li
								key={index}
								onClick={() => {
									setReceiverInput(`@${suggestion}`);
									setSuggestions([]); // Clear suggestions after selection
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
				<button onClick={sendFunds} disabled={isLoading || !amount || !receiverInput}>
					Send Funds
				</button>
			</div>

			<div className="transaction-history-section">
				<h3>Transaction History</h3>
				<div className="transaction-list">
					{txHistory?.data?.transactions?.length &&
						txHistory?.data?.transactions?.length > 0 ? (
						txHistory.data?.transactions?.map((tx) => (
							<div
								key={tx?.note_id}
								className={`transaction-box ${tx?.acc_sender === address ? 'sent' : 'received'}`}
							>
								{tx?.acc_sender === address ? 'Sent' : 'Received'} {tx?.value} ETH{' '}
								{tx?.acc_sender === address ? 'to' : 'from'} {tx?.acc_sender === address ? tx?.acc_recipient : tx?.acc_sender} on{' '}
								{tx?.timestamp.toLocaleString()}
							</div>
						))
					) : (
						<div className="transacion-list">No transactions available.</div>
					)}
				</div>


			</div>
		</div>
	);
};

export default WalletInterface;
