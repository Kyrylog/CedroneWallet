import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';

interface NetworkSelectorProps {
  network: 'mainnet' | 'testnet' | 'devnet';
  onNetworkChange: (network: 'mainnet' | 'testnet' | 'devnet') => void;
}

export default function NetworkSelector({ network, onNetworkChange }: NetworkSelectorProps) {
  return (
    <Select value={network} onValueChange={(value) => onNetworkChange(value as 'mainnet' | 'testnet' | 'devnet')}>
      <SelectTrigger className="w-[140px]">
        <Globe className="w-4 h-4 mr-2" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="mainnet">Mainnet</SelectItem>
        <SelectItem value="testnet">Testnet</SelectItem>
        <SelectItem value="devnet">Devnet</SelectItem>
      </SelectContent>
    </Select>
  );
}
