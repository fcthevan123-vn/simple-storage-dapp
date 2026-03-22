# Smart Contract + Frontend Demo

This starter project helps you learn the full workflow:

1. Write and deploy a smart contract to the Sepolia testnet
2. Build a frontend that connects to MetaMask
3. Read/write data with the smart contract
4. Deploy the frontend to Vercel

## Structure

```text
smart-contract/   # Hardhat + Solidity
frontend/         # Next.js + wagmi + viem
```

## 1. Prerequisites

You need:

- Node.js 20+
- MetaMask
- A wallet with some Sepolia ETH
- A Sepolia RPC URL (from Alchemy or Infura)
- A private key from a test wallet for deployment

Recommended:

- Use a test wallet only, not your main wallet
- For learning and experimentation purposes only

## 2. Deploy smart contract to Sepolia

### Step 1: Install dependencies

```bash
cd smart-contract
npm install
```

### Step 2: Create `.env`

Copy from the sample file:

```bash
cp .env.example .env
```

Update with your values:

```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-key
PRIVATE_KEY=your_wallet_private_key_without_0x
ETHERSCAN_API_KEY=optional_if_you_want_verify
```

### Step 3: Compile contract

```bash
npm run compile
```

### Step 4: Deploy

```bash
npm run deploy:sepolia
```

If successful, you will receive a contract address. Save that address.

## 3. Run frontend locally

### Step 1: Install dependencies

```bash
cd ../frontend
npm install
```

### Step 2: Create `.env.local`

```bash
cp .env.example .env.local
```

Fill in the deployed contract address:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

### Step 3: Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 4. Supported frontend actions

The starter frontend already includes:

- Connect MetaMask
- Show contract address
- Read `count`
- Read `message`
- Call `increment()` to increase count
- Call `setMessage(string)` to update message

## 5. Deploy frontend to Vercel

### Fastest way

1. Push code to GitHub
2. Log in to Vercel
3. Import the `frontend` project
4. Add environment variable:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

5. Deploy

### Important notes

- Root Directory in Vercel must be `frontend`
- `NEXT_PUBLIC_CONTRACT_ADDRESS` must be set in Vercel
- MetaMask only works in the end user's browser, so the deployed site interacts with each visitor's wallet

## 6. Demo flow after deployment

1. Open the deployed site on Vercel
2. Connect MetaMask and switch to Sepolia
3. Click `Increment Count`
4. Enter a new message and click `Update Message`
5. Confirm transaction in MetaMask
6. Reload or wait for frontend to refresh data

## 7. Useful commands

In `smart-contract/`:

```bash
npm run compile
npm run deploy:sepolia
npm run verify:sepolia -- --constructor-args scripts/args.js
```

In `frontend/`:

```bash
npm run dev
npm run build
npm run start
```

## 8. Suggested learning path

If you want to go from easy to advanced:

1. Deploy contract first
2. Test with Etherscan or a block explorer
3. Put contract address into frontend
4. Run locally
5. Deploy frontend to Vercel

## 9. Security notes

- Never commit private keys
- Never use a wallet holding real assets
- Use testnet and wallets intended for learning only

## 10. Next extensions

After everything works, you can upgrade by:

- Adding events to the contract
- Showing transaction history
- Improving loading/error states
- Verifying contract on Etherscan
- Moving to CI/CD deployment scripts
