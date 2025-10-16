import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Copy, QrCode, Check } from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard } from '@/lib/clipboard';

interface ReceiveDialogProps {
  address: string;
}

export default function ReceiveDialog({ address }: ReceiveDialogProps) {
  const [open, setOpen] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = async () => {
    setIsCopying(true);
    const result = await copyToClipboard(address);
    setIsCopying(false);
    
    if (result.success) {
      toast.success('Address copied to clipboard');
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } else {
      toast.error(result.error || 'Failed to copy address to clipboard');
      console.error('Copy failed:', result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Receive
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Receive APT</DialogTitle>
          <DialogDescription>Share your address to receive APT and tokens</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-center p-6 bg-muted rounded-lg">
            <div className="w-48 h-48 bg-background rounded-lg flex items-center justify-center border-2 border-border">
              <QrCode className="w-24 h-24 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input value={address} readOnly className="font-mono text-sm" />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleCopy}
                disabled={isCopying}
              >
                {copySuccess ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className={`w-4 h-4 ${isCopying ? 'animate-pulse' : ''}`} />
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
