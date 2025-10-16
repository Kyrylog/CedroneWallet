/**
 * Aptos blockchain client utilities for fetching account data
 */

export interface AptosBalance {
  balance: string; // Balance in Octas (1 APT = 100,000,000 Octas)
  balanceInApt: number; // Balance converted to APT
}

const OCTAS_PER_APT = 100_000_000;

/**
 * Get the Aptos node URL based on network
 */
export function getAptosNodeUrl(network: 'mainnet' | 'testnet' | 'devnet'): string {
  switch (network) {
    case 'mainnet':
      return 'https://fullnode.mainnet.aptoslabs.com/v1';
    case 'testnet':
      return 'https://fullnode.testnet.aptoslabs.com/v1';
    case 'devnet':
      return 'https://fullnode.devnet.aptoslabs.com/v1';
    default:
      return 'https://fullnode.mainnet.aptoslabs.com/v1';
  }
}

/**
 * Fetch APT balance for an address from Aptos blockchain
 */
export async function fetchAptBalance(
  address: string,
  network: 'mainnet' | 'testnet' | 'devnet'
): Promise<AptosBalance> {
  const nodeUrl = getAptosNodeUrl(network);
  
  try {
    // Fetch account resource for 0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>
    const response = await fetch(
      `${nodeUrl}/accounts/${address}/resource/0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      // Account might not exist or have no balance
      if (response.status === 404) {
        return {
          balance: '0',
          balanceInApt: 0,
        };
      }
      throw new Error(`Failed to fetch balance: ${response.statusText}`);
    }

    const data = await response.json();
    const balance = data?.data?.coin?.value || '0';
    const balanceInApt = parseInt(balance) / OCTAS_PER_APT;

    return {
      balance,
      balanceInApt,
    };
  } catch (error) {
    console.error('Error fetching APT balance:', error);
    // Return zero balance on error instead of throwing
    return {
      balance: '0',
      balanceInApt: 0,
    };
  }
}

/**
 * Check if an account exists on the blockchain
 */
export async function checkAccountExists(
  address: string,
  network: 'mainnet' | 'testnet' | 'devnet'
): Promise<boolean> {
  const nodeUrl = getAptosNodeUrl(network);
  
  try {
    const response = await fetch(`${nodeUrl}/accounts/${address}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Error checking account existence:', error);
    return false;
  }
}
