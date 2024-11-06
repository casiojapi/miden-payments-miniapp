import '../styles/globals.css';
import {
	QueryClient,
	QueryClientProvider,
} from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: any) {
	return (
		<QueryClientProvider client={queryClient}>
			<Component {...pageProps} />
			<ToastContainer
				position="top-center"
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme="dark"
			/>
		</QueryClientProvider>
	);
}
