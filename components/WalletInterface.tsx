import React, { useState, useEffect } from 'react';

interface WalletInterfaceProps {
	address: string;
	username: string;
}

export const WalletInterface: React.FC<WalletInterfaceProps> = ({ address, username }) => {
	const [balance, setBalance] = useState<string>('0 ETH');
	const [notes, setNotes] = useState<any[]>([]);
	const [receiverInput, setReceiverInput] = useState('');
	const [amount, setAmount] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		fetchNotes();
		fetchBalance();
	}, []);

	const fetchNotes = async () => {
		try {
			const userId = address.replace('0x', '');
			const response = await fetch(`https://miden-api-public-tx-mock.onrender.com/api/account/${userId}/notes`);

			if (response.ok) {
				const userNotes = await response.json();
				setNotes(userNotes);
			} else {
				console.error('Failed to fetch notes:', response.status);
			}
		} catch (error) {
			console.error('Error fetching notes:', error);
		}
	};

	const fetchBalance = async () => {
		try {
			const userId = address.replace('0x', '');
			const response = await fetch(`https://miden-api-public-tx-mock.onrender.com/api/account/${userId}`);

			if (response.ok) {
				const account = await response.json();
				setBalance(account.balance);
			} else {
				console.error('Failed to fetch balance:', response.status);
			}
		} catch (error) {
			console.error('Error fetching balance:', error);
		}
	};

	const sendNote = async () => {
		const senderId = address.replace('0x', '');
		const isUsername = receiverInput.startsWith('@');
		const receiverUsername = isUsername ? receiverInput.substring(1) : null;
		const receiverId = isUsername ? null : receiverInput;

		try {
			setIsLoading(true);
			const response = await fetch('https://miden-api-public-tx-mock.onrender.com/api/notes/public/send', {
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
				alert('Note sent successfully!');
				setReceiverInput('');
				setAmount('');
				fetchNotes();
				fetchBalance();
			} else {
				console.error('Failed to send note:', response.status);
			}
		} catch (error) {
			alert('error sending note');
			console.error('Error sending note:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const consumeNote = async (noteId: string) => {
		const userId = address.replace('0x', '');
		try {
			setIsLoading(true);
			const response = await fetch('https://miden-api-public-tx-mock.onrender.com/api/notes/consume', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ user_id: userId, note_id: noteId }),
			});

			if (response.ok) {
				alert('Note consumed successfully!');
				setNotes((prevNotes) => prevNotes.filter((note) => note.note_id !== noteId));
				fetchBalance();
			} else {
				console.error('Failed to consume note:', response.status);
			}
		} catch (error) {
			console.error('Error consuming note:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const copyToClipboard = () => {
		navigator.clipboard.writeText(address);
		alert('Address copied to clipboard!');
	};

	return (
		<div className="wallet-container">
			{isLoading && <p>loading...</p>} {/* Loading indicator */}
			<div className="address-section">
				<span className="address-text">{address}</span>
				<button onClick={copyToClipboard} className="copy-btn">Copy</button>
			</div>

			<div className="balance-section">
				<h2>{balance}</h2>
			</div>

			<div className="notes-section">
				<h3>User Notes</h3>
				<ul>
					{notes.map((note) => (
						<li key={note.note_id}>
							Note ID: {note.note_id}, Amount: {note.amount} ETH
							<button onClick={() => consumeNote(note.note_id)}>Consume</button>
						</li>
					))}
				</ul>
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
				<button onClick={sendNote} disabled={isLoading || !amount || !receiverInput}>
					Send Note
				</button>
			</div>
		</div>
	);
};

export default WalletInterface;
