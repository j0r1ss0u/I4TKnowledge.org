const https = require('https');

const RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com';
const TOKEN_CONTRACT = '0x06Fc114E58b8Be5d03b5B7b03ab7f0D3C9605288';
const TOKEN_ID = '96';

// getLengthContrib(uint256) selector
const GET_LENGTH_SELECTOR = '0x2d50cf78';
// getcontributions(uint256) selector  
const GET_CONTRIB_SELECTOR = '0xc6c8f9a1';

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
  console.log(`\n🔍 Checking Token ID ${TOKEN_ID} on Sepolia...`);
  console.log('='.repeat(60));

  try {
    // Encode token ID as uint256 (32 bytes, padded)
    const tokenIdHex = '0x' + '0'.repeat(64 - TOKEN_ID.length) + TOKEN_ID;
    
    // Call getLengthContrib
    const lengthData = GET_LENGTH_SELECTOR + tokenIdHex.slice(2);
    const lengthResult = await makeRpcCall('eth_call', [{
      to: TOKEN_CONTRACT,
      data: lengthData
    }, 'latest']);
    
    if (lengthResult.error) {
      console.error('❌ Error:', lengthResult.error.message);
      return;
    }
    
    const length = parseInt(lengthResult.result, 16);
    console.log(`\n📊 Number of contributions: ${length}`);
    
    if (length > 100) {
      console.log(`\n⚠️  WARNING: This token has ${length} contributions!`);
      console.log('    This explains the high gas cost (~50,000 gas per contribution)');
      console.log(`    Expected gas for distribution: ~${length * 50000} gas`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(60));
}

main();
