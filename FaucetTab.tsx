import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Droplet, AlertCircle, CheckCircle2, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useActor } from '../hooks/useActor';
import { useQueryClient } from '@tanstack/react-query';

interface FaucetTabProps {
  address: string;
  network: 'testnet' | 'devnet';
}

interface FaucetResult {
  transactionHash?: string;
  explorerUrl?: string;
  timestamp: Date;
}

export default function FaucetTab({ address, network }: FaucetTabProps) {
  const [lastRequest, setLastRequest] = useState<Date | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [faucetResult, setFaucetResult] = useState<FaucetResult | null>(null);
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const canRequest = !lastRequest || Date.now() - lastRequest.getTime() > 60000;

  const handleRequest = async () => {
    if (!actor) {
      toast.error('Wallet not initialized. Please try again.');
      return;
    }

    if (!address) {
      toast.error('Wallet address not found.');
      return;
    }

    setIsRequesting(true);
    try {
      let response: string;
      if (network === 'testnet') {
        response = await actor.requestTestnetFaucet(address);
        console.log('Testnet faucet response:', response);
        toast.success('Testnet APT requested successfully! Tokens should arrive shortly.');
        setLastRequest(new Date());
        setFaucetResult({ timestamp: new Date() });
        
        // Invalidate balance query to trigger refresh
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['aptBalance', address, network] });
        }, 2000); // Wait 2 seconds for transaction to be processed
      } else if (network === 'devnet') {
        response = await actor.requestDevnetFaucet(address);
        console.log('Devnet faucet response:', response);
        
        // Parse the response to extract transaction hash
        let transactionHash: string | undefined;
        try {
          const parsed = JSON.parse(response);
          // The devnet faucet API returns an array with transaction hash
          if (Array.isArray(parsed) && parsed.length > 0) {
            transactionHash = parsed[0];
          } else if (typeof parsed === 'string') {
            transactionHash = parsed;
          } else if (parsed.hash) {
            transactionHash = parsed.hash;
          } else if (parsed.txn_hash) {
            transactionHash = parsed.txn_hash;
          }
        } catch (e) {
          // If response is not JSON, it might be the hash directly
          transactionHash = response;
        }

        if (transactionHash) {
          // Get explorer URL from backend
          const explorerUrl = await actor.getDevnetExplorerUrl(transactionHash);
          
          setFaucetResult({
            transactionHash,
            explorerUrl,
            timestamp: new Date()
          });
          
          toast.success('Devnet APT requested successfully! 1 APT should arrive shortly.');
        } else {
          toast.success('Devnet APT requested successfully! 1 APT should arrive shortly.');
          setFaucetResult({ timestamp: new Date() });
        }
        
        setLastRequest(new Date());
        
        // Invalidate balance query to trigger refresh
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['aptBalance', address, network] });
        }, 2000); // Wait 2 seconds for transaction to be processed
      } else {
        toast.error('Invalid network selected.');
        return;
      }
    } catch (error) {
      const networkName = network === 'testnet' ? 'Testnet' : 'Devnet';
      console.error(`${networkName} faucet error:`, error);
      
      // Provide more specific error messages
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
        toast.error(`${networkName} faucet rate limit reached. Please try again later.`);
      } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
        toast.error(`Network error. Please check your connection and try again.`);
      } else {
        toast.error(`Failed to request ${networkName} APT. Please try again later.`);
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const networkName = network === 'testnet' ? 'Testnet' : 'Devnet';
  const faucetAmount = network === 'devnet' ? '1 APT (100,000,000 Octas)' : 'Test APT';

  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Request {networkName.toLowerCase()} APT to test transactions. You can request once per minute.
          {network === 'devnet' && ' Each request provides 1 APT.'}
        </AlertDescription>
      </Alert>

      <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Droplet className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{networkName} Faucet</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Get free {networkName.toLowerCase()} APT to test your transactions
          </p>
          <p className="text-xs text-muted-foreground mb-6">
            Amount: {faucetAmount}
          </p>
          <Button
            onClick={handleRequest}
            disabled={!canRequest || isRequesting || !actor}
            size="lg"
            className="w-full max-w-xs"
          >
            {isRequesting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Requesting...
              </>
            ) : canRequest ? (
              <>
                <Droplet className="w-4 h-4 mr-2" />
                Request {networkName} APT
              </>
            ) : (
              'Wait 1 minute'
            )}
          </Button>
          {lastRequest && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Last request: {lastRequest.toLocaleTimeString()}
            </div>
          )}
          {!canRequest && lastRequest && (
            <div className="mt-2 text-xs text-muted-foreground">
              Next request available in {Math.ceil((60000 - (Date.now() - lastRequest.getTime())) / 1000)}s
            </div>
          )}
        </CardContent>
      </Card>

      {faucetResult && network === 'devnet' && faucetResult.transactionHash && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold mb-1">Transaction Submitted</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Transaction Hash:</p>
                    <code className="text-xs bg-background/50 px-2 py-1 rounded border border-border/50 break-all block">
                      {faucetResult.transactionHash}
                    </code>
                  </div>
                  {faucetResult.explorerUrl && (
                    <a
                      href={faucetResult.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      <span>View in Aptos Explorer</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Alert className="bg-muted/50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          <strong>Note:</strong> The faucet uses the Aptos {networkName} faucet API. 
          {network === 'devnet' && ' Devnet provides 1 APT (100,000,000 Octas) per request.'}
          {' '}If you don't receive tokens, please check the network status or try again later. The balance will update automatically after the transaction is processed.
        </AlertDescription>
      </Alert>
    </div>
  );
}
