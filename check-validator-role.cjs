const https = require('https');

const RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com';
const NETWORK_CONTRACT = '0xa9870f477E6362E0810948fd87c0398c2c0a4F55';
const USER_ADDRESS = '0xf30A499031746d708d36769956F9c60600Be6865';
const TOKEN_ID = '96';

// Function selectors
const HAS_ROLE = '0x91d14854'; // hasRole(bytes32,address)
const NB_VALIDATION = '0x4913c2fa'; // nbValidation(uint256)
const CONTENT_VALIDATOR = '0x7b1c7aae'; // contentValidator(uint256,address)
const GET_STATUS = '0x5c622a0e'; // status(uint256)

const VALIDATOR_ROLE = '0x21702c8af46127c7fa207f89d0b0a8441bb32959a0ac7df790e9ab1a25c98926';

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
  console.log(`\n🔍 Diagnostic de validation pour Token ID ${TOKEN_ID}...`);
  console.log('='.repeat(70));

  try {
    // 1. Check if user has VALIDATOR role
    const roleData = HAS_ROLE + VALIDATOR_ROLE.slice(2) + USER_ADDRESS.slice(2).padStart(64, '0');
    const hasRoleResult = await makeRpcCall('eth_call', [{
      to: NETWORK_CONTRACT,
      data: roleData
    }, 'latest']);
    
    const hasRole = hasRoleResult.result === '0x0000000000000000000000000000000000000000000000000000000000000001';
    console.log(`\n1️⃣  Rôle VALIDATOR:`);
    console.log(`   ${hasRole ? '✅' : '❌'} Utilisateur ${hasRole ? 'possède' : 'NE possède PAS'} le rôle VALIDATOR`);
    
    // 2. Check validation count
    const tokenIdHex = '0x' + '0'.repeat(64 - TOKEN_ID.length) + TOKEN_ID;
    const nbValData = NB_VALIDATION + tokenIdHex.slice(2);
    const nbValResult = await makeRpcCall('eth_call', [{
      to: NETWORK_CONTRACT,
      data: nbValData
    }, 'latest']);
    
    const nbValidations = parseInt(nbValResult.result, 16);
    console.log(`\n2️⃣  Nombre de validations:`);
    console.log(`   ℹ️  ${nbValidations}/4 validations`);
    
    // 3. Check if user already validated
    const validatorData = CONTENT_VALIDATOR + tokenIdHex.slice(2) + USER_ADDRESS.slice(2).padStart(64, '0');
    const validatorResult = await makeRpcCall('eth_call', [{
      to: NETWORK_CONTRACT,
      data: validatorData
    }, 'latest']);
    
    const alreadyValidated = validatorResult.result === '0x0000000000000000000000000000000000000000000000000000000000000001';
    console.log(`\n3️⃣  Validation précédente:`);
    console.log(`   ${alreadyValidated ? '❌' : '✅'} Utilisateur ${alreadyValidated ? 'a DÉJÀ validé' : "n'a PAS encore validé"}`);
    
    // 4. Check document status
    const statusData = GET_STATUS + tokenIdHex.slice(2);
    const statusResult = await makeRpcCall('eth_call', [{
      to: NETWORK_CONTRACT,
      data: statusData
    }, 'latest']);
    
    const statusInt = parseInt(statusResult.result, 16);
    const statusNames = ['draft', 'submitted', 'validated'];
    console.log(`\n4️⃣  Statut du document:`);
    console.log(`   ℹ️  Statut actuel: ${statusNames[statusInt] || 'inconnu'} (${statusInt})`);
    
    console.log(`\n${'='.repeat(70)}`);
    console.log(`\n📋 RÉSUMÉ:`);
    
    if (!hasRole) {
      console.log(`   ❌ ÉCHEC: L'utilisateur n'a pas le rôle VALIDATOR`);
      console.log(`   💡 Solution: Ajouter le rôle VALIDATOR à ${USER_ADDRESS}`);
    } else if (alreadyValidated) {
      console.log(`   ❌ ÉCHEC: L'utilisateur a déjà validé ce document`);
      console.log(`   💡 Solution: Utiliser un autre compte validateur`);
    } else if (statusInt === 2) {
      console.log(`   ❌ ÉCHEC: Le document est déjà publié (validated)`);
      console.log(`   💡 Solution: Ce document ne peut plus être validé`);
    } else {
      console.log(`   ✅ Tout semble OK - le problème est ailleurs`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(70) + '\n');
}

main();
