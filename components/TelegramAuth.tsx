'use client';

import { useEffect, useState } from 'react';
import { retrieveLaunchParams } from '@telegram-apps/sdk';

interface TelegramAuthProps {
	onAuthSuccess: (userId: number, tgUsername: string) => void;
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

		const { initDataRaw } = retrieveLaunchParams(); // fetch la data de user de telegram 

		if (initDataRaw) {
			const initData = new URLSearchParams(initDataRaw);
			const user = JSON.parse(initData.get('user') || '{}');
			if (user.id && user.username) {
				onAuthSuccess(user.id, user.username);
			} else {
				setError('User information not found.');
			}
		} else {
			setError('Failed to authenticate. Please open the app inside Telegram.');
		}
	}, [onAuthSuccess]);

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
