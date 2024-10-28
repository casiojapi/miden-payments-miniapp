'use client';

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

	const getAccountId = (userId: string) => `acc_${userId}`;

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
		const accountId = getAccountId(userId);
		console.log(`Fetching account for accountId: ${accountId}`);

		const response = await fetch(`https://miden-api-public-tx-mock.onrender.com/api/account/${accountId}`);

		if (response.status === 404) {
			console.log('Account not found. Creating a new account...');
			await createAccount(userId, username);
		} else if (response.ok) {
			console.log('Account found. Proceeding with auth success.');
			onAuthSuccess(userId, username);
		} else {
			throw new Error('Unexpected response from API.');
		}
	};

	const createAccount = async (userId: string, username: string) => {
		try {
			console.log(`Creating account for userId: ${userId}`);
			const response = await fetch('https://miden-api-public-tx-mock.onrender.com/api/account/create', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ user_id: userId, username }),
			});

			if (response.ok) {
				console.log('Account created successfully.');
				onAuthSuccess(userId, username);
			} else {
				console.error('Failed to create account:', response.status);
				throw new Error('Failed to create account.');
			}
		} catch (err) {
			console.error('Error creating account:', err);
			setError('Error creating account.');
		}
	};

	if (error) {
		return (
			<div className="bg-red-500 text-white p-4">
				<p>{error}</p>
			</div>
		);
	}

	return <div>Loading...</div>;
};

export default TelegramAuth;
