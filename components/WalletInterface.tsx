import React, { useState, useEffect } from 'react';

interface WalletInterfaceProps {
	address: string;
	username: string;
}

declare global {
	interface Window {
		Telegram: any;
	}
}

export const WalletInterface: React.FC<WalletInterfaceProps> = ({ address, username }) => {
	const [balance, setBalance] = useState<string>('0 ETH'); // default

	useEffect(() => {
		const tg = window.Telegram?.WebApp;
		tg?.ready();
	}, []);

	const copyToClipboard = () => {
		navigator.clipboard.writeText(address);
	};

	// share app with contacts 
	const shareWithTelegram = () => {
		const message = `Check out miden payments: t.me/miden_payment_bot/pay`;
		const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(message)}`;

		window.open(shareUrl, '_blank');
	};


	return (
		<div className="wallet-container">

			<div className="address-section">
				<span className="address-text">{address}</span>
				<button onClick={copyToClipboard} className="copy-btn">
					Copy
				</button>
			</div>

			<div className="greeting-section">
				<p className="greeting-text">
					Hi "@{username}".
					miden, best note-taking app ever.
				</p>
			</div>

			<div className="balance-section">
				<h2 className="balance-text">{balance}</h2>
			</div>

			<div className="button-section">
				<button className="receive-btn" onClick={() => setBalance('10 ETH')}>
					Receive
				</button>
				<button className="send-btn" onClick={() => alert('sending notes...')}>
					Send
				</button>
				<button className="share-btn" onClick={shareWithTelegram}>
					Share on Telegram
				</button>
			</div>
		</div>
	);
};

export default WalletInterface;
