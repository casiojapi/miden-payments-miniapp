import { useEffect, useState } from 'react';
import { retrieveLaunchParams } from '@telegram-apps/sdk';

interface TelegramAuthProps {
	onAuthSuccess: (userId: string, username: string) => void;
}

declare global {
	interface Window {
		Telegram: any;
	}
}

const TelegramAuth: React.FC<TelegramAuthProps> = ({ onAuthSuccess }) => {
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const tg = window.Telegram?.WebApp;
		tg?.ready();

		const { initDataRaw } = retrieveLaunchParams();

		if (initDataRaw) {
			const initData = new URLSearchParams(initDataRaw);
			const user = JSON.parse(initData.get('user') || '{}');
			if (user.id && user.username) {
				handleAccountFetch(user.id.toString(), user.username);
			} else {
				setError('User information not found.');
			}
		} else {
			setError('Failed to authenticate. Please open the app inside Telegram.');
		}
	}, []);

	const handleAccountFetch = async (userId: string, username: string) => {
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/account/${userId}`);

			if (response.status === 404) {
				await createAccount(userId, username);
			} else if (response.ok) {
				onAuthSuccess(userId, username);
			} else {
				setError('Unexpected error while fetching account.');
			}
		} catch {
			setError('Error connecting to server.');
		}
	};

	const createAccount = async (userId: string, username: string) => {
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/account/create`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ user_id: userId, username }),
			});

			if (response.ok) {
				onAuthSuccess(userId, username);
			} else {
				setError('Error creating account.');
			}
		} catch {
			setError('Error creating account.');
		}
	};

	return error ? (
		<div className="bg-red-500 text-white p-4">{error}</div>
	) : (
		<div>Loading...</div>
	);
};

export default TelegramAuth;
