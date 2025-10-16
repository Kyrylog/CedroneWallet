import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image } from 'lucide-react';

interface NFTGalleryProps {
  network: 'mainnet' | 'testnet' | 'devnet';
  address: string;
}

export default function NFTGallery({ network, address }: NFTGalleryProps) {
  // Mock NFT data
  const nfts = [
    {
      id: '1',
      name: 'Aptos Monkey #1234',
      collection: 'Aptos Monkeys',
      image: '/assets/generated/nft-placeholder.dim_200x200.png'
    },
    {
      id: '2',
      name: 'Aptos Punk #5678',
      collection: 'Aptos Punks',
      image: '/assets/generated/nft-placeholder.dim_200x200.png'
    }
  ];

  if (nfts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <Image className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No NFTs Found</h3>
        <p className="text-sm text-muted-foreground">Your NFT collection will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Your NFTs</h3>
        <Badge variant="outline">{nfts.length} items</Badge>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {nfts.map((nft) => (
          <Card key={nft.id} className="border-border/50 overflow-hidden hover:border-primary/50 transition-colors cursor-pointer">
            <div className="aspect-square bg-muted relative">
              <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
            </div>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-1">{nft.name}</h4>
              <p className="text-sm text-muted-foreground">{nft.collection}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
