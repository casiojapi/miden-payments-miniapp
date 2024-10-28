import React, { useState, useEffect } from 'react';

interface WalletInterfaceProps {
	userId: string;
	username: string;
	address: string;
}

export const WalletInterface: React.FC<WalletInterfaceProps> = ({ userId, username }) => {
	const [balance, setBalance] = useState<string>('0 ETH');
	const [notes, setNotes] = useState<any[]>([]);
	const [receiverId, setReceiverId] = useState('');
	const [amount, setAmount] = useState('');

	useEffect(() => {
		fetchAccountDetails();
		fetchUserNotes();
	}, []);

	const fetchAccountDetails = async () => {
		try {
			const response = await fetch(`https://miden-api-public-tx-mock.onrender.com/api/account/acc_${userId}`);
			const data = await response.json();
			setBalance(data.balance);
		} catch (err) {
			console.error('Error fetching account details:', err);
		}
	};

	const fetchUserNotes = async () => {
		try {
			const response = await fetch(`https://miden-api-public-tx-mock.onrender.com/api/account/${userId}/notes`);
			const data = await response.json();
			setNotes(data);
		} catch (err) {
			console.error('Error fetching notes:', err);
		}
	};

	const sendNote = async () => {
		try {
			await fetch('https://miden-api-public-tx-mock.onrender.com/api/notes/public/send', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					sender_id: `acc_${userId}`,
					receiver_id: `acc_${receiverId}`,
					amount,
				}),
			});
			fetchAccountDetails(); // Refresh balance
		} catch (err) {
			console.error('Error sending note:', err);
		}
	};

	const consumeNote = async (noteId: string) => {
		try {
			await fetch('https://miden-api-public-tx-mock.onrender.com/api/notes/consume', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ account_id: `acc_${userId}`, note_id: noteId }),
			});
			fetchAccountDetails(); // Refresh balance
			fetchUserNotes(); // Refresh notes list
		} catch (err) {
			console.error('Error consuming note:', err);
		}
	};

	const copyToClipboard = () => {
		navigator.clipboard.writeText(`acc_${userId}`);
	};

	const shareWithTelegram = () => {
		const message = `Check out miden payments: t.me/miden_payment_bot/pay`;
		const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(message)}`;
		window.open(shareUrl, '_blank');
	};

	return (
		<div className="wallet-container">
			<div className="address-section">
				<span className="address-text">{`Account: acc_${userId}`}</span>
				<button onClick={copyToClipboard} className="copy-btn">Copy</button>
			</div>

			<div className="greeting-section">
				<p className="greeting-text">
					Hi "@{username}". miden, best note-taking app ever.
				</p>
			</div>

			<div className="balance-section">
				<h2 className="balance-text">{balance}</h2>
			</div>

			<div className="notes-section">
				<h3>Your Notes</h3>
				<ul>
					{notes.map((note) => (
						<li key={note.note_id}>
							{note.amount} ETH from {note.sender_id}
							<button onClick={() => consumeNote(note.note_id)}>Consume</button>
						</li>
					))}
				</ul>
			</div>

			<div className="send-section">
				<input
					type="text"
					placeholder="Receiver ID"
					value={receiverId}
					onChange={(e) => setReceiverId(e.target.value)}
				/>
				<input
					type="number"
					placeholder="Amount"
					value={amount}
					onChange={(e) => setAmount(e.target.value)}
				/>
				<button onClick={sendNote}>Send Note</button>
			</div>

			<button className="share-btn" onClick={shareWithTelegram}>
				Share on Telegram
			</button>
		</div>
	);
};

export default WalletInterface;
