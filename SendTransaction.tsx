import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SendTransactionProps {
  network: 'mainnet' | 'testnet' | 'devnet';
  walletData: {
    address: string;
    privateKey: string;
  };
}

export default function SendTransaction({ network, walletData }: SendTransactionProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!recipient || !amount) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!recipient.startsWith('0x') || recipient.length !== 66) {
      toast.error('Invalid recipient address');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Invalid amount');
      return;
    }

    setIsSending(true);
    // Simulate transaction
    setTimeout(() => {
      toast.success('Transaction sent successfully!');
      setRecipient('');
      setAmount('');
      setIsSending(false);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Make sure you have enough APT to cover the transaction fee.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="recipient">Recipient Address</Label>
          <Input
            id="recipient"
            placeholder="0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount (APT)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <Card className="border-border/50 bg-muted/50">
          <CardContent className="p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Network Fee</span>
              <span>~0.0001 APT</span>
            </div>
            <div className="flex justify-between text-sm font-semibold">
              <span>Total</span>
              <span>{amount ? (parseFloat(amount) + 0.0001).toFixed(4) : '0.0000'} APT</span>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleSend}
          disabled={isSending || !recipient || !amount}
          className="w-full"
          size="lg"
        >
          {isSending ? (
            'Sending...'
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Transaction
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
