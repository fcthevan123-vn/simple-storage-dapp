const hre = require("hardhat");

async function main() {
  const contractFactory = await hre.ethers.getContractFactory("LearningDemo");
  const contract = await contractFactory.deploy("Hello from Sepolia");

  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("LearningDemo deployed to:", address);
  console.log("Copy this address into frontend/.env.local as NEXT_PUBLIC_CONTRACT_ADDRESS");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

