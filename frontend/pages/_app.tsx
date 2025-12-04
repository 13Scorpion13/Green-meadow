import { AuthProvider } from '@/context/AuthContext';
import "@/styles/main.css";
import type { AppProps } from "next/app";
import ScrollToTopButton from '../components/ScrollToTopButton';
import '../styles/components/scroll-to-top.css';
import '../styles/pages/articles.css';


export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <ScrollToTopButton /> { }
    </AuthProvider>
  );
}