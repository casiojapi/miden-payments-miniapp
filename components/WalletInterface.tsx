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
	const account = useFetchAccount({ address });
	const txHistory = useTransactionHistory({ address });

	useEffect(() => {
		fetchUsernames();
	}, []);

	// Function to fetch all usernames
	const fetchUsernames = async () => {
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/usernames`);
			if (response.ok) {
				const data = await response.json();
				setUsernames(data);
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

		// Show suggestions only if input starts with "@" and has at least one additional character
		if (inputValue.startsWith('@') && inputValue.length > 0) {
			const filteredSuggestions = usernames.filter((username) =>
				username.toLowerCase().startsWith(inputValue.slice(1).toLowerCase())
			);
			setSuggestions(filteredSuggestions);
		} else {
			setSuggestions([]); // Clear suggestions if condition isn’t met
		}
	};

	// const fetchBalance = async () => {
	// 	try {
	// 		const userId = address.replace('0x', '');
	// 		const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/account/${userId}`);
	// 		if (response.ok) {
	// 			const account = await response.json();
	// 			setBalance(account.balance);
	// 		} else {
	// 			console.error('Failed to fetch balance:', response.status); } } catch (error) {
	// 		console.error('Error fetching balance:', error);
	// 	}
	// };

	// 	try {
	// 		const userId = address.replace('0x', '');
	// 		const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/account/${userId}/transactions`);
	// 		if (response.ok) {
	// 			const data = await response.json();
	// 			setTransactions(Array.isArray(data.transactions) ? data.transactions.reverse() : []);
	// 		} else {
	// 			console.error('Failed to fetch transaction history:', response.status);
	// 		}
	// 	} catch (error) {
	// 		console.error('Error fetching transaction history:', error);
	// 	}
	// };

	const sendFunds = async () => {
		const senderId = address.replace('0x', '');
		const isUsername = receiverInput.startsWith('@');
		const receiverUsername = isUsername ? receiverInput.substring(1) : null;
		const receiverId = isUsername ? null : receiverInput;

		try {
			setIsLoading(true);

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transactions/send`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					sender_id: senderId,
					receiver_id: receiverId,
					receiver_username: receiverUsername,
					amount,
				}),
			});

			if (response.ok) {
				const responseData = await response.json();
				alert('Funds sent successfully!');
				setReceiverInput('');
				setAmount('');
				await queryClient.invalidateQueries();
				//await fetchTransactionHistory();
			} else {
				const errorText = await response.text();
				console.error('Error sending funds:', errorText);
				alert(`Error: ${errorText}`);
			}
		} catch (error) {
			console.error('Error sending funds:', error);
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
		//await fetchBalance();
		await queryClient.invalidateQueries();
		//await fetchTransactionHistory();
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
								key={tx?.transaction_id}
								className={`transaction-box ${tx?.sender_id === address ? 'sent' : 'received'}`}
							>
								{tx?.sender_id === address ? 'Sent' : 'Received'} {tx?.amount} ETH{' '}
								{tx?.sender_id === address ? 'to' : 'from'} {tx?.sender_id === address ? `tx?.receiver_id}` : `tx?.sender_id}`} on{' '}
								{tx?.timestamp.toLocaleString()}
							</div>
						))
					) : (
						<div>No transactions available.</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default WalletInterface;
