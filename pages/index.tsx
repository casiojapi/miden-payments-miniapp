import { useState } from 'react';
import TelegramAuth from '../components/TelegramAuth';
import { WalletInterface } from '../components/WalletInterface';

export default function Home() {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [username, setUsername] = useState<string | null>(null);

	const handleAuthSuccess = (userId: string, tgUsername: string) => {
		setUsername(tgUsername);
		setIsAuthenticated(true);
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			{!isAuthenticated ? (
				<TelegramAuth onAuthSuccess={handleAuthSuccess} />
			) : (
				<WalletInterface username={username || 'User'} />
			)}
		</div>
	);
}
