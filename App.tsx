import { useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import WalletSetup from './components/WalletSetup';
import WalletDashboard from './components/WalletDashboard';
import { useInitializeBip39Words } from './hooks/useQueries';

export default function App() {
  const [walletData, setWalletData] = useState<{
    address: string;
    privateKey: string;
    mnemonic?: string;
  } | null>(null);

  const { isInitializing } = useInitializeBip39Words();

  const handleWalletCreated = (data: { address: string; privateKey: string; mnemonic?: string }) => {
    setWalletData(data);
  };

  const handleLogout = () => {
    setWalletData(null);
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        {isInitializing ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 animate-pulse">
                <img src="/assets/generated/aptos-logo-transparent.dim_64x64.png" alt="APTOS" className="w-12 h-12" />
              </div>
              <p className="text-muted-foreground">Initializing wallet...</p>
            </div>
          </div>
        ) : !walletData ? (
          <WalletSetup onWalletCreated={handleWalletCreated} />
        ) : (
          <WalletDashboard walletData={walletData} onLogout={handleLogout} />
        )}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
