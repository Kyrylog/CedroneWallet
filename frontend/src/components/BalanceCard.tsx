//need to fix bug with 0.00 balance and check FA token balances

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAptPrice, useAptBalance } from '../hooks/useQueries';

interface BalanceCardProps {
  network: 'mainnet' | 'testnet' | 'devnet';
  address: string;
}

export default function BalanceCard({ network, address }: BalanceCardProps) {
  const { data: priceData, isLoading: isPriceLoading, refetch: refetchPrice } = useAptPrice();
  const { data: balanceData, isLoading: isBalanceLoading, refetch: refetchBalance } = useAptBalance(address, network);

  const aptBalance = balanceData?.balanceInApt || 0;
  const price = priceData ? parseFloat(priceData) : 0;
  const usdValue = aptBalance * price;

  const handleRefresh = () => {
    refetchPrice();
    refetchBalance();
  };

  const isLoading = isPriceLoading || isBalanceLoading;

  return (
    <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
            <h2 className="text-4xl font-bold">
              {isBalanceLoading ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                `${aptBalance.toFixed(2)} APT`
              )}
            </h2>
            <p className="text-lg text-muted-foreground mt-1">
              {isLoading ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                `$${usdValue.toFixed(2)} USD`
              )}
            </p>
          </div>
          <Badge variant="outline" className="capitalize">
            {network}
          </Badge>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              APT Price: {isPriceLoading ? 'Loading...' : `$${price.toFixed(4)}`}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
