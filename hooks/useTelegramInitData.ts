import { useEffect, useState } from 'react';

export interface TelegramUser {
	id: number;
	first_name: string;
	last_name?: string;
	username?: string;
	language_code?: string;
}

export interface InitData {
	user?: TelegramUser;
	auth_date?: number;
	hash?: string;
	[key: string]: any;
}

export function useTelegramInitData(botToken: string): InitData | null {
	const [initData, setInitData] = useState<InitData | null>(null);

	useEffect(() => {
		const tg = window.Telegram?.WebApp;

		if (tg) {
			const userData = tg.initDataUnsafe;

			setInitData(userData);
		}
	}, [botToken]);

	return initData;
}
