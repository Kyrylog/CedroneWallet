# CedroneWallet
Cedra network wallet app
// Built for APTOS for test purposes
Overview
A cryptocurrency wallet application for managing APTOS (APT) tokens, other tokens, and NFTs with network switching capabilities and price information.

Core Features
Wallet Management
Create new wallet: Generate a new APTOS wallet with private key and mnemonic phrase
Mnemonic phrase must contain exactly 12 unique words selected from the official BIP39 English word list
No two words in the mnemonic can start with the same letter
Validation to prevent duplicate words and enforce starting letter constraint
Import existing wallet: Import wallet using mnemonic phrase or private key
Display wallet address and QR code for receiving funds
Copy to clipboard functionality for wallet address on main screen
Copy to clipboard functionality for mnemonic phrase during wallet setup and backup with reliable cross-browser support and clear user feedback on success or failure
Balance Display
Show APT balance in the wallet
Display balances for other tokens held in the wallet
Real-time balance updates
Automatic balance refresh after successful faucet transactions to ensure accurate display
Balance card and wallet dashboard must update immediately after Devnet faucet requests complete successfully
Transaction Features
Send APT: Transfer APT to other addresses with amount input and recipient address
Send tokens: Transfer other tokens to other addresses
Receive funds: Display wallet address and QR code for incoming transactions
Transaction history display
NFT Management
Display owned NFTs in a gallery view
Show NFT metadata including name, description, and image
View individual NFT details
Network Management
Network selector with mainnet, testnet, and devnet options
Switch between networks with appropriate balance and transaction updates
Network-specific transaction handling
Price Information
Integrate oracle to fetch APT/USDC price from Binance
Display current APT price in USD
Real-time price updates
Testnet and Devnet Features
Faucet tab visible only when testnet or devnet is selected
Request testnet APT functionality using testnet faucet
Request devnet APT functionality using POST request to https://faucet.devnet.aptoslabs.com/mint?amount=100000000&address=wallet_address
Faucet request status and confirmation with clear user feedback
Display appropriate error messages if faucet requests fail
After successful devnet faucet request, display the transaction hash returned by the API
Show clickable link to view the transaction in Aptos Devnet explorer using the transaction hash
Faucet tab UI clearly displays both transaction hash and explorer link after successful devnet faucet requests
Trigger automatic APT balance refresh after successful Devnet faucet transactions to update wallet dashboard and balance display
Backend Data Storage
Store wallet connection preferences
Cache price data from Binance oracle
Store network selection preferences (mainnet, testnet, devnet)
Store the complete BIP39 English word list (2048 words) for mnemonic generation and validation
Store mnemonic generation state and validation rules
Backend Operations
Fetch APT/USDC price from Binance API
Handle faucet requests for testnet and devnet networks using correct API endpoints
Make POST requests to devnet faucet API at https://faucet.devnet.aptoslabs.com/mint?amount=100000000&address=wallet_address
Parse and return transaction hash from devnet faucet API response
Generate Aptos Devnet explorer URLs using transaction hashes
Manage network configuration data for mainnet, testnet, and devnet
Load and manage the official BIP39 English word list from the standard 2048-word collection
Generate mnemonic phrases using BIP39 words with unique words and unique starting letters constraint
Provide mnemonic word validation services using the BIP39 word list
Efficiently store and retrieve BIP39 words for mnemonic operations
Implement robust and reliable mnemonic generation algorithm that guarantees valid 12-word phrases with no duplicate words and no two words starting with the same letter, ensuring 100% success rate even with the full 2048-word BIP39 list
Fix and improve the generateAndValidateMultiple function (or similar) to ensure it reliably produces valid 12-word mnemonic phrases with unique words and unique starting letters using the full BIP39 list
Include comprehensive automated test suite for mnemonic generation logic with extensive test cases covering edge cases, boundary conditions, and stress testing to verify correctness and reliability across all possible scenarios using the full BIP39 word list
Automated tests must verify that mnemonic generation never fails, always returns exactly 12 unique words, and enforces the unique starting letter constraint in all cases
Enhanced automated tests specifically for the generateAndValidateMultiple function to catch any edge cases or failures and ensure robust mnemonic generation for wallet creation
