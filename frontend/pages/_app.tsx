import { AuthProvider } from '@/context/AuthContext';
import "@/styles/main.css";
import type { AppProps } from "next/app";
import ScrollToTopButton from '../components/ScrollToTopButton';
import Assistant from '@/components/Assistant';
import '../styles/components/assistant.css';
import '../styles/components/scroll-to-top.css';
import '../styles/pages/articles.css';


export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <div className="fixed-low-right-panel-container">
        <Assistant /> { }
        <ScrollToTopButton /> { }
      </div>
    </AuthProvider>
  );
}