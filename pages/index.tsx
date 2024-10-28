import { useState } from 'react';
import TelegramAuth from '../components/TelegramAuth';
import { WalletInterface } from '../components/WalletInterface';

export default function Home() {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [userAddress, setUserAddress] = useState<string | null>(null);
	const [username, setUsername] = useState<string | null>(null);

	const handleAuthSuccess = (userId: string, tgUsername: string) => {
		const address = `0x${userId.padStart(20, '0')}`; // Generate address from userId
		setUserAddress(address);
		setUsername(tgUsername);
		setIsAuthenticated(true);
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			{!isAuthenticated ? (
				<TelegramAuth onAuthSuccess={handleAuthSuccess} />
			) : (
				<WalletInterface address={userAddress || '0x1234...abcd'} username={username || 'User'} userId={userAddress || '0x123'} />
			)}
		</div>
	);
}
