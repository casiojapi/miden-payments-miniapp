import React, { useState, useEffect } from 'react';

interface WalletInterfaceProps {
	address: string;
	username: string;
}

export const WalletInterface: React.FC<WalletInterfaceProps> = ({ address, username }) => {
	const [balance, setBalance] = useState<string>('0 ETH');
	const [notes, setNotes] = useState<any[]>([]);
	const [receiverAddress, setReceiverAddress] = useState('');
	const [amount, setAmount] = useState('');

	useEffect(() => {
		fetchNotes();
		fetchBalance();
	}, []);

	const fetchNotes = async () => {
		try {
			const userId = address.replace('0x', ''); // Strip the prefix
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
		try {
			const senderId = address.replace('0x', '');
			const receiverId = receiverAddress.replace('0x', '');

			const response = await fetch('https://miden-api-public-tx-mock.onrender.com/api/notes/public/send', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sender_id: senderId, receiver_id: receiverId, amount }),
			});

			if (response.ok) {
				alert('Note sent successfully!');
				fetchNotes(); // Refresh notes
			} else {
				console.error('Failed to send note:', response.status);
			}
		} catch (error) {
			console.error('Error sending note:', error);
		}
	};

	const consumeNote = async (noteId: string) => {
		try {
			const userId = address.replace('0x', '');
			const response = await fetch('https://miden-api-public-tx-mock.onrender.com/api/notes/consume', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ user_id: userId, note_id: noteId }),
			});

			if (response.ok) {
				alert('Note consumed successfully!');
				fetchNotes(); // Refresh notes
			} else {
				console.error('Failed to consume note:', response.status);
			}
		} catch (error) {
			console.error('Error consuming note:', error);
		}
	};

	const copyToClipboard = () => {
		navigator.clipboard.writeText(address);
	};

	return (
		<div className="wallet-container">
			<div className="address-section">
				<span className="address-text">{address}</span>
				<button onClick={copyToClipboard} className="copy-btn">Copy</button>
			</div>

			<div className="greeting-section">
				<p>Hi "@{username}", miden, best note-taking app ever.</p>
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
					placeholder="Receiver Address"
					value={receiverAddress}
					onChange={(e) => setReceiverAddress(e.target.value)}
				/>
				<input
					type="number"
					placeholder="Amount"
					value={amount}
					onChange={(e) => setAmount(e.target.value)}
				/>
				<button onClick={sendNote}>Send Note</button>
			</div>
		</div>
	);
};

export default WalletInterface;
