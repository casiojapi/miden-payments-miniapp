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
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const initializeTelegram = async () => {
			if (typeof window !== 'undefined' && window.Telegram?.WebApp && window.TelegramGameProxy) {
				console.log("Telegram SDK is loaded!");
				window.Telegram.WebApp.ready();

				defineEventHandlers();

				const tg = window.Telegram?.WebApp;
				tg.ready();

				const { initDataRaw } = retrieveLaunchParams();
				if (initDataRaw) {
					const initData = new URLSearchParams(initDataRaw);
					const user = JSON.parse(initData.get("user") || "{}");
					if (user.id && user.username) {
						await handleAccountFetch(user.id.toString(), user.username);
					} else {
						setError("User information not found.");
					}
				} else {
					setError("Failed to authenticate. Please open the app inside Telegram.");
				}
			} else {
				console.error("Telegram SDK is not loaded!");
				setError("Telegram SDK not fully loaded. Please try again.");
			}
			setIsLoading(false);
		};

		initializeTelegram();
	}, []);

	const handleAccountFetch = async (userId: string, username: string) => {
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/account/${username}/info`);
			console.log("handle account fetch response: ", response);
			if (response.ok) {
				const accountData = await response.json();
				if (accountData.username === username) {
					onAuthSuccess(userId, username);
					return;
				}
			}

			// If we reach here, we need to create the account
			await createAccount(userId, username);
		} catch (error) {
			console.error("Error fetching or creating account:", error);
			setError("Error connecting to server.");
		}
	};

	const createAccount = async (userId: string, username: string) => {
		try {
			const createResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/account/create`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username }),
			});

			if (createResponse.ok) {
				const accountData = await createResponse.json();
				if (accountData.username === username) {
					// Account created successfully, now request faucet
					//					await requestFaucet(username);
					onAuthSuccess(userId, username);
				} else {
					setError("Unexpected error while creating account.");
				}
			} else {
				setError("Error creating account.");
			}
		} catch (error) {
			console.error("Error creating account:", error);
			setError("Error creating account.");
		}
	};

	//	const requestFaucet = async (username: string) => {
	//		try {
	//			const faucetResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/account/${username}/faucet`);
	//			if (!faucetResponse.ok) {
	//				console.error("Faucet request failed:", await faucetResponse.text());
	//			}
	//		} catch (error) {
	//			console.error("Error requesting faucet:", error);
	//		}
	//	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div className="bg-red-500 text-white p-4">{error}</div>;
	}

	return null;
};

export default TelegramAuth;
