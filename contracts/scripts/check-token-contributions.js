const hre = require("hardhat");

async function main() {
  const tokenId = 96;
  
  const I4TKdocToken = await hre.ethers.getContractAt(
    "I4TKdocToken",
    "0x06Fc114E58b8Be5d03b5B7b03ab7f0D3C9605288"
  );
  
  console.log(`\n🔍 Checking Token ID ${tokenId} contributions...`);
  console.log("=" .repeat(50));
  
  try {
    const length = await I4TKdocToken.getLengthContrib(tokenId);
    console.log(`\n📊 Number of contributions: ${length.toString()}`);
    
    if (length > 0) {
      const contributions = await I4TKdocToken.getcontributions(tokenId);
      console.log(`\n📋 Contribution details:`);
      contributions.forEach((contrib, index) => {
        console.log(`  ${index + 1}. Token ID: ${contrib[0].toString()}, Weight: ${contrib[1].toString()}`);
      });
    }
    
    const references = await I4TKdocToken.getTokenIdReferences(tokenId);
    console.log(`\n🔗 Direct references: ${references.length}`);
    references.forEach((ref, index) => {
      console.log(`  ${index + 1}. Reference Token ID: ${ref.toString()}`);
    });
    
    const creator = await I4TKdocToken.getTokenCreator(tokenId);
    console.log(`\n👤 Creator: ${creator}`);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
  
  console.log("\n" + "=".repeat(50));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
