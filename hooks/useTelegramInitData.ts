import { useEffect, useState } from 'react';

export interface TelegramUser {
	id: number;
	first_name: string;
	last_name?: string;
	username?: string;
	language_code?: string;
	is_bot?: boolean;
	is_premium?: boolean;
	photo_url?: string;
}

export interface InitData {
	query_id?: string;
	user?: TelegramUser;
	auth_date?: number;
	hash?: string;
	chat_instance?: string;
	chat_type?: 'private' | 'group' | 'supergroup' | 'channel';
	start_param?: string;
	can_send_after?: number;
	chat?: {
		id: number;
		type: 'private' | 'group' | 'supergroup' | 'channel';
		title?: string;
		username?: string;
		photo_url?: string;
	};
}

export function useTelegramInitData(): InitData | null {
	const [initData, setInitData] = useState<InitData | null>(null);

	useEffect(() => {
		const searchParams = new URLSearchParams(window.location.hash.slice(1));
		const initDataRaw = searchParams.get('tgWebAppData');

		if (initDataRaw) {
			try {
				const decodedInitData = decodeURIComponent(initDataRaw);
				const parsedInitData = Object.fromEntries(new URLSearchParams(decodedInitData)) as any;

				if (typeof parsedInitData.user === 'string') {
					const userObj = JSON.parse(parsedInitData.user);
					parsedInitData.user = {
						id: userObj.id,
						first_name: userObj.first_name,
						last_name: userObj.last_name,
						username: userObj.username,
						language_code: userObj.language_code,
						is_bot: userObj.is_bot,
						is_premium: userObj.is_premium ?? userObj.isPremium,
						photo_url: userObj.photo_url ?? userObj.photoUrl,
					};
				}

				if (typeof parsedInitData.chat === 'string') {
					parsedInitData.chat = JSON.parse(parsedInitData.chat);
				}

				setInitData(parsedInitData as InitData);
			} catch (error) {
				console.error('Failed to parse Telegram init data:', error);
			}
		}
	}, []);

	return initData;
}
