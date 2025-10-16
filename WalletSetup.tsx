import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, Download, AlertCircle, Eye, EyeOff, RefreshCw, TestTube, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useGenerateMnemonic, useValidateMnemonic, useTestMnemonicGeneration } from '@/hooks/useQueries';
import { copyToClipboard } from '@/lib/clipboard';

interface WalletSetupProps {
  onWalletCreated: (data: { address: string; privateKey: string; mnemonic?: string }) => void;
}

export default function WalletSetup({ onWalletCreated }: WalletSetupProps) {
  const [mnemonic, setMnemonic] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [generatedMnemonic, setGeneratedMnemonic] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const generateMnemonic = useGenerateMnemonic();
  const validateMnemonic = useValidateMnemonic();
  const testMnemonicGeneration = useTestMnemonicGeneration();

  const handleGenerateMnemonic = async () => {
    try {
      const words = await generateMnemonic.mutateAsync();
      if (words && words.length === 12) {
        setGeneratedMnemonic(words.join(' '));
        setCopySuccess(false);
      } else {
        toast.error('Failed to generate mnemonic. Please try again.');
      }
    } catch (error) {
      toast.error('Failed to generate mnemonic');
      console.error('Mnemonic generation error:', error);
    }
  };

  const handleTestGeneration = async () => {
    try {
      toast.info('Testing mnemonic generation (100 iterations)...');
      const result = await testMnemonicGeneration.mutateAsync(100);
      
      if (result.success) {
        toast.success(`✓ All ${result.totalGenerated} mnemonics generated successfully!`);
      } else {
        toast.error(`✗ ${result.errors.length} failures out of ${result.totalGenerated} generations`);
        console.error('Test failures:', result.errors);
      }
    } catch (error) {
      toast.error('Test failed');
      console.error('Test error:', error);
    }
  };

  const handleCopyMnemonic = async () => {
    if (!generatedMnemonic) return;
    
    setIsCopying(true);
    const result = await copyToClipboard(generatedMnemonic);
    setIsCopying(false);
    
    if (result.success) {
      toast.success('Mnemonic copied to clipboard');
      setCopySuccess(true);
      // Reset success indicator after 2 seconds
      setTimeout(() => setCopySuccess(false), 2000);
    } else {
      toast.error(result.error || 'Failed to copy mnemonic to clipboard');
      console.error('Copy failed:', result.error);
    }
  };

  const handleCreateWallet = async () => {
    if (!generatedMnemonic) {
      await handleGenerateMnemonic();
      return;
    }

    // Validate the generated mnemonic
    const words = generatedMnemonic.split(' ');
    try {
      const isValid = await validateMnemonic.mutateAsync(words);
      if (!isValid) {
        toast.error('Generated mnemonic is invalid. Please regenerate.');
        setGeneratedMnemonic('');
        return;
      }
    } catch (error) {
      toast.error('Failed to validate mnemonic');
      return;
    }

    setIsCreating(true);
    // Simulate wallet creation
    setTimeout(() => {
      const mockAddress = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const mockPrivateKey = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      
      onWalletCreated({
        address: mockAddress,
        privateKey: mockPrivateKey,
        mnemonic: generatedMnemonic
      });
      toast.success('Wallet created successfully!');
      setIsCreating(false);
    }, 1000);
  };

  const handleImportMnemonic = async () => {
    if (!mnemonic.trim()) {
      toast.error('Please enter a valid mnemonic phrase');
      return;
    }

    const words = mnemonic.trim().split(/\s+/);
    if (words.length !== 12 && words.length !== 24) {
      toast.error('Mnemonic must be 12 or 24 words');
      return;
    }

    // Validate imported mnemonic if it's 12 words
    if (words.length === 12) {
      try {
        const isValid = await validateMnemonic.mutateAsync(words);
        if (!isValid) {
          toast.error('Invalid mnemonic: must have 12 unique words with unique starting letters');
          return;
        }
      } catch (error) {
        toast.error('Failed to validate mnemonic');
        return;
      }
    }

    setIsCreating(true);
    setTimeout(() => {
      const mockAddress = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const mockPrivateKey = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      
      onWalletCreated({
        address: mockAddress,
        privateKey: mockPrivateKey,
        mnemonic: mnemonic.trim()
      });
      toast.success('Wallet imported successfully!');
      setIsCreating(false);
    }, 1000);
  };

  const handleImportPrivateKey = () => {
    if (!privateKey.trim()) {
      toast.error('Please enter a valid private key');
      return;
    }

    if (!privateKey.startsWith('0x') || privateKey.length !== 66) {
      toast.error('Private key must start with 0x and be 64 hex characters');
      return;
    }

    setIsCreating(true);
    setTimeout(() => {
      const mockAddress = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      
      onWalletCreated({
        address: mockAddress,
        privateKey: privateKey.trim()
      });
      toast.success('Wallet imported successfully!');
      setIsCreating(false);
    }, 1000);
  };

  const isGenerating = generateMnemonic.isPending;
  const isValidating = validateMnemonic.isPending;
  const isTesting = testMnemonicGeneration.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <img src="/assets/generated/aptos-logo-transparent.dim_64x64.png" alt="APTOS" className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            APTOS Wallet
          </h1>
          <p className="text-muted-foreground">Create or import your wallet to get started</p>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Wallet Setup
            </CardTitle>
            <CardDescription>Choose how you want to access your wallet</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="create" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">Create New</TabsTrigger>
                <TabsTrigger value="import">Import Existing</TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-4 mt-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your mnemonic will have 12 unique words from the BIP39 standard word list with unique starting letters. Save it securely to recover your wallet.
                  </AlertDescription>
                </Alert>

                {generatedMnemonic && (
                  <div className="space-y-2">
                    <Label>Your Mnemonic Phrase</Label>
                    <div className="p-4 bg-muted rounded-lg border border-border">
                      <p className="text-sm font-mono leading-relaxed">{generatedMnemonic}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={handleCopyMnemonic}
                        disabled={isCopying}
                      >
                        {copySuccess ? (
                          <>
                            <Check className="w-4 h-4 mr-2 text-green-500" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className={`w-4 h-4 mr-2 ${isCopying ? 'animate-pulse' : ''}`} />
                            {isCopying ? 'Copying...' : 'Copy to Clipboard'}
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setGeneratedMnemonic('');
                          setCopySuccess(false);
                          handleGenerateMnemonic();
                        }}
                        disabled={isGenerating}
                      >
                        <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleCreateWallet}
                  disabled={isCreating || isValidating || isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isCreating ? 'Creating...' : isValidating ? 'Validating...' : isGenerating ? 'Generating...' : generatedMnemonic ? 'Confirm & Create Wallet' : 'Generate Mnemonic'}
                </Button>

                <Button
                  onClick={handleTestGeneration}
                  disabled={isTesting}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  <TestTube className={`w-4 h-4 mr-2 ${isTesting ? 'animate-pulse' : ''}`} />
                  {isTesting ? 'Testing...' : 'Test Generation (100x)'}
                </Button>
              </TabsContent>

              <TabsContent value="import" className="space-y-4 mt-4">
                <Tabs defaultValue="mnemonic" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="mnemonic">Mnemonic</TabsTrigger>
                    <TabsTrigger value="privatekey">Private Key</TabsTrigger>
                  </TabsList>

                  <TabsContent value="mnemonic" className="space-y-4 mt-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        12-word mnemonics must have unique words with unique starting letters from the BIP39 word list.
                      </AlertDescription>
                    </Alert>
                    <div className="space-y-2">
                      <Label htmlFor="mnemonic">Mnemonic Phrase</Label>
                      <Input
                        id="mnemonic"
                        placeholder="Enter your 12 or 24 word mnemonic phrase"
                        value={mnemonic}
                        onChange={(e) => setMnemonic(e.target.value)}
                        className="font-mono text-sm"
                      />
                    </div>
                    <Button
                      onClick={handleImportMnemonic}
                      disabled={isCreating || isValidating}
                      className="w-full"
                      size="lg"
                    >
                      {isCreating ? 'Importing...' : isValidating ? 'Validating...' : 'Import Wallet'}
                    </Button>
                  </TabsContent>

                  <TabsContent value="privatekey" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="privatekey">Private Key</Label>
                      <div className="relative">
                        <Input
                          id="privatekey"
                          type={showPrivateKey ? 'text' : 'password'}
                          placeholder="0x..."
                          value={privateKey}
                          onChange={(e) => setPrivateKey(e.target.value)}
                          className="font-mono text-sm pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPrivateKey(!showPrivateKey)}
                        >
                          {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button
                      onClick={handleImportPrivateKey}
                      disabled={isCreating}
                      className="w-full"
                      size="lg"
                    >
                      {isCreating ? 'Importing...' : 'Import Wallet'}
                    </Button>
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <footer className="text-center mt-8 text-sm text-muted-foreground">
          © 2025. Built with <span className="text-destructive">♥</span> using{' '}
          <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
            caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}
