const https = require('https');

const RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com';
const NETWORK_CONTRACT = '0xa9870f477E6362E0810948fd87c0398c2c0a4F55';
const USER_ADDRESS = '0xf30A499031746d708d36769956F9c60600Be6865'; // From logs

// valideContent(uint256) selector: keccak256("valideContent(uint256)") = 0x3e47158c
const VALIDATE_SELECTOR = '0x3e47158c';
const TOKEN_ID = '96';

function makeRpcCall(method, params) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      jsonrpc: '2.0',
      method: method,
      params: params,
      id: 1
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };

    const req = https.request(RPC_URL, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log(`\n🔍 Simulating validation for Token ID ${TOKEN_ID}...`);
  console.log('='.repeat(60));

  try {
    // Encode token ID as uint256 (32 bytes, padded)
    const tokenIdHex = '0x' + '0'.repeat(64 - TOKEN_ID.length) + TOKEN_ID;
    const callData = VALIDATE_SELECTOR + tokenIdHex.slice(2);
    
    console.log(`\n📝 Transaction details:`);
    console.log(`   From: ${USER_ADDRESS}`);
    console.log(`   To: ${NETWORK_CONTRACT}`);
    console.log(`   Data: ${callData}`);
    
    // Estimate gas
    const gasEstimate = await makeRpcCall('eth_estimateGas', [{
      from: USER_ADDRESS,
      to: NETWORK_CONTRACT,
      data: callData
    }]);
    
    if (gasEstimate.error) {
      console.error(`\n❌ Transaction would REVERT!`);
      console.error(`   Reason: ${gasEstimate.error.message}`);
      
      // Try to decode the error
      if (gasEstimate.error.data) {
        console.error(`   Error data: ${gasEstimate.error.data}`);
      }
      return;
    }
    
    const gasNeeded = parseInt(gasEstimate.result, 16);
    console.log(`\n✅ Transaction would succeed!`);
    console.log(`   Estimated gas: ${gasNeeded.toLocaleString()} gas`);
    
    // Get current gas price
    const gasPriceResult = await makeRpcCall('eth_gasPrice', []);
    const gasPrice = parseInt(gasPriceResult.result, 16);
    const gasPriceGwei = gasPrice / 1e9;
    
    const costWei = gasNeeded * gasPrice;
    const costEth = costWei / 1e18;
    
    console.log(`   Current gas price: ${gasPriceGwei.toFixed(2)} Gwei`);
    console.log(`   Total cost: ${costEth.toFixed(6)} SepoliaETH`);
    
    if (gasNeeded > 500000) {
      console.log(`\n⚠️  WARNING: Gas usage is higher than expected!`);
      console.log(`   Normal 1st validation should be ~30,000-50,000 gas`);
      console.log(`   This transaction needs ${gasNeeded.toLocaleString()} gas`);
    } else {
      console.log(`\n✅ Gas usage is NORMAL for a validation`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(60));
}

main();
