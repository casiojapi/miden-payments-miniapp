import React, { useEffect, useState } from "react";
import { retrieveLaunchParams, defineEventHandlers } from "@telegram-apps/bridge";

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
			try {
				if (typeof window !== "undefined" && window.Telegram?.WebApp && window.TelegramGameProxy) {
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
							throw new Error("User information not found.");
						}
					} else {
						throw new Error("Failed to authenticate. Please open the app inside Telegram.");
					}
				} else {
					throw new Error("Telegram SDK not fully loaded. Please try again.");
				}
			} catch (error) {
				setError("An unexpected error occurred: " + error);
			} finally {
				setIsLoading(false);
			}
		};

		initializeTelegram();
	}, []);

	const handleAccountFetch = async (userId: string, username: string) => {
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/account/${username}/info`);
			if (response.ok) {
				const accountData = await response.json();
				if (accountData.username === username) {
					onAuthSuccess(userId, username);
					return;
				}
			}

			await createAccount(userId, username);
		} catch {
			throw new Error("Error connecting to server.");
		}
	};

	const createAccount = async (userId: string, username: string) => {
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/account/create`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username }),
			});

			if (response.ok) {
				const accountData = await response.json();
				if (accountData.username === username) {
					onAuthSuccess(userId, username);
				} else {
					throw new Error("Unexpected error while creating account.");
				}
			} else {
				throw new Error("Error creating account.");
			}
		} catch {
			throw new Error("Error creating account.");
		}
	};

	if (isLoading) {
		return (
			<div className="auth-overlay">
				<div className="auth-container">
					<div className="loading-spinner"></div>
					<p className="auth-text">Initializing your wallet...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="auth-overlay">
				<div className="auth-container">
					<p className="auth-text error-text">{error}</p>
					<button className="retry-button" onClick={() => window.location.reload()}>
						Retry
					</button>
				</div>
			</div>
		);
	}

	return null;
};

export default TelegramAuth;
