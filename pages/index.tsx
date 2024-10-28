import { useState } from 'react';
import TelegramAuth from '../components/TelegramAuth';
import { WalletInterface } from '../components/WalletInterface';

export default function Home() {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [userAddress, setUserAddress] = useState<string | null>(null);
	const [username, setUsername] = useState<string | null>(null);

	const handleAuthSuccess = (userId: string, tgUsername: string) => {
		const address = userId;
		setUserAddress(address);
		setUsername(tgUsername);
		setIsAuthenticated(true);
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			{!isAuthenticated ? (
				<TelegramAuth onAuthSuccess={handleAuthSuccess} />
			) : (
				<WalletInterface address={userAddress || '1234...6789'} username={username || 'User'} />
			)}
		</div>
	);
}
