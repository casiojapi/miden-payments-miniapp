import { useEffect, useState } from 'react';
import { retrieveLaunchParams, defineEventHandlers } from '@telegram-apps/bridge';

interface TelegramAuthProps {
	onAuthSuccess: (userId: string, username: string) => void;
}

declare global {
	interface Window {
		Telegram?: {
			WebApp?: {
				ready: () => void;
				initDataUnsafe?: any;
			};
		};
		TelegramGameProxy: any;
	}
}

const TelegramAuth: React.FC<TelegramAuthProps> = ({ onAuthSuccess }) => {
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (typeof window !== 'undefined' && window.Telegram?.WebApp && window.TelegramGameProxy) {
			console.log("Telegram SDK is loaded!");
			window.Telegram.WebApp.ready();
		} else {
			console.error("Telegram SDK is not loaded!");
			setError("Telegram SDK not fully loaded. Please try again.");
		}
	}, []);

	useEffect(() => {
		defineEventHandlers();

		const tg = window.Telegram?.WebApp;
		if (!tg) {
			setError("Telegram SDK not loaded. Please open the app inside Telegram.");
			return;
		}
		tg.ready();

		const { initDataRaw } = retrieveLaunchParams();
		if (initDataRaw) {
			const initData = new URLSearchParams(initDataRaw);
			const user = JSON.parse(initData.get("user") || "{}");
			if (user.id && user.username) {
				handleAccountFetch(user.id.toString(), user.username);
			} else {
				setError("User information not found.");
			}
		} else {
			setError("Failed to authenticate. Please open the app inside Telegram.");
		}
	}, []);

	const handleAccountFetch = async (userId: string, username: string) => {
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/account/${username}/info`);
			console.log("handle account fetch response: ", response);
			if (response.status === 500) {
				await createAccount(userId, username);
			} else if (response.ok) {
				onAuthSuccess(userId, username);
			} else {
				setError("Unexpected error while fetching account.");
			}
		} catch {
			setError("Error connecting to server.");
		}
	};

	const createAccount = async (userId: string, username: string) => {
		try {
			const createAccountPromise = fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/account/create`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username }),
			});

			const faucetPromise = fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/account/${username}/faucet`);

			const [createResponse] = await Promise.allSettled([createAccountPromise, faucetPromise]);

			if (createResponse.status === "fulfilled" && createResponse.value.ok) {
				onAuthSuccess(userId, username);
			} else {
				setError("Error creating account.");
			}
		} catch {
			setError("Error creating account.");
		}
	};

	return error ? (
		<div className="bg-red-500 text-white p-4">{error}</div>
	) : (
		<div>Loading...</div>
	);
};

export default TelegramAuth;
