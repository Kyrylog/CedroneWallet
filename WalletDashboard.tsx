import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Copy, Wallet, Send, Image, Droplet, Check } from 'lucide-react';
import { toast } from 'sonner';
import NetworkSelector from './NetworkSelector';
import BalanceCard from './BalanceCard';
import SendTransaction from './SendTransaction';
import ReceiveDialog from './ReceiveDialog';
import NFTGallery from './NFTGallery';
import FaucetTab from './FaucetTab';
import { useNetworkPreference, useAptBalance, useAptPrice } from '../hooks/useQueries';
import { copyToClipboard } from '@/lib/clipboard';

interface WalletDashboardProps {
  walletData: {
    address: string;
    privateKey: string;
    mnemonic?: string;
  };
  onLogout: () => void;
}

export default function WalletDashboard({ walletData, onLogout }: WalletDashboardProps) {
  const [network, setNetwork] = useState<'mainnet' | 'testnet' | 'devnet'>('mainnet');
  const [activeTab, setActiveTab] = useState('balance');
  const [isCopyingAddress, setIsCopyingAddress] = useState(false);
  const [copyAddressSuccess, setCopyAddressSuccess] = useState(false);
  const { data: savedNetwork } = useNetworkPreference('user');
  const { data: balanceData } = useAptBalance(walletData.address, network);
  const { data: priceData } = useAptPrice();

  const handleCopyAddress = async () => {
    setIsCopyingAddress(true);
    const result = await copyToClipboard(walletData.address);
    setIsCopyingAddress(false);
    
    if (result.success) {
      toast.success('Address copied to clipboard');
      setCopyAddressSuccess(true);
      setTimeout(() => setCopyAddressSuccess(false), 2000);
    } else {
      toast.error(result.error || 'Failed to copy address to clipboard');
      console.error('Copy failed:', result.error);
    }
  };

  const shortAddress = `${walletData.address.slice(0, 6)}...${walletData.address.slice(-4)}`;
  const showFaucetTab = network === 'testnet' || network === 'devnet';

  const aptBalance = balanceData?.balanceInApt || 0;
  const price = priceData ? parseFloat(priceData) : 0;
  const usdValue = aptBalance * price;

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/assets/generated/aptos-logo-transparent.dim_64x64.png" alt="APTOS" className="w-10 h-10" />
              <div>
                <h1 className="text-xl font-bold">APTOS Wallet</h1>
                <button
                  onClick={handleCopyAddress}
                  disabled={isCopyingAddress}
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  {shortAddress}
                  {copyAddressSuccess ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className={`w-3 h-3 ${isCopyingAddress ? 'animate-pulse' : ''}`} />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NetworkSelector network={network} onNetworkChange={setNetwork} />
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <BalanceCard network={network} address={walletData.address} />

          <Card className="mt-6 border-border/50">
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="balance">
                    <Wallet className="w-4 h-4 mr-2" />
                    Balance
                  </TabsTrigger>
                  <TabsTrigger value="send">
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </TabsTrigger>
                  <TabsTrigger value="nfts">
                    <Image className="w-4 h-4 mr-2" />
                    NFTs
                  </TabsTrigger>
                  {showFaucetTab && (
                    <TabsTrigger value="faucet">
                      <Droplet className="w-4 h-4 mr-2" />
                      Faucet
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="balance" className="mt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Token Balances</h3>
                      <ReceiveDialog address={walletData.address} />
                    </div>
                    <div className="space-y-3">
                      <Card className="border-border/50">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <img src="/assets/generated/aptos-logo-transparent.dim_64x64.png" alt="APT" className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="font-semibold">APT</p>
                              <p className="text-sm text-muted-foreground">Aptos</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{aptBalance.toFixed(2)} APT</p>
                            <p className="text-sm text-muted-foreground">${usdValue.toFixed(2)}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="send" className="mt-6">
                  <SendTransaction network={network} walletData={walletData} />
                </TabsContent>

                <TabsContent value="nfts" className="mt-6">
                  <NFTGallery network={network} address={walletData.address} />
                </TabsContent>

                {showFaucetTab && (
                  <TabsContent value="faucet" className="mt-6">
                    <FaucetTab address={walletData.address} network={network as 'testnet' | 'devnet'} />
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t border-border/50 mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025. Built with <span className="text-destructive">♥</span> using{' '}
          <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
