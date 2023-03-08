import { HardhatUserConfig } from 'hardhat/config';
import { HardhatNetworkAccountsUserConfig } from 'hardhat/src/types/config';
import * as fs from 'fs';

/*
Issue the following command to generate a BIP-39 seed phrase
and save it to file:

npx mnemonics@1.1.3 > .rsk-seed-phrase
*/
const rskTestnetSeedPhrase: string = fs
  .readFileSync('.rsk-seed-phrase', 'utf8')
  .toString()
  .trim();
if (!rskTestnetSeedPhrase || rskTestnetSeedPhrase.split(' ').length !== 12) {
  throw new Error(
    'Put valid BIP-39 seed phrase in a file ".rsk-seed-phrase"',
  );
}

/*
Issue the following command to query RSK Testnet
for its latest block, and save the response to file:

curl \
  -X POST \
  --silent \
  -H "Content-Type:application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["latest", false],"id":1}' \
  https://public-node.testnet.rsk.co/ > .rsk-testnet-block-rpc-response.json
*/
const rskTestnetBlockRpcResponse: string = fs
  .readFileSync('.rsk-testnet-block-rpc-response.json')
  .toString()
  .trim();
const rskTestnetMinimumGasPrice: number = parseInt(
  JSON.parse(rskTestnetBlockRpcResponse).result.minimumGasPrice,
  16,
);
if (
  typeof rskTestnetMinimumGasPrice !== 'number' ||
  isNaN(rskTestnetMinimumGasPrice)
) {
  throw new Error(
    'unable to retrieve network gas price from .rsk-testnet-block-rpc-response.json',
  );
}
console.log("Minimum gas price for RSK Testnet: " + rskTestnetMinimumGasPrice);

const rskTestnetGasMultiplier: number = 1.1;

const accounts: HardhatNetworkAccountsUserConfig = {
  mnemonic: rskTestnetSeedPhrase,
  // Ref: https://developers.rsk.co/rsk/architecture/account-based/#derivation-path-info
  path: "m/44'/60'/0'/0",
  // path: "m/44'/37310'/0'/0",
  initialIndex: 0,
  count: 10,
};

const hardhatConfig: HardhatUserConfig = {
  solidity: {
    version: '0.8.17',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      accounts,
    },
    rskregtest: {
      url: 'http://localhost:4444',
      accounts,
    },
    rsktestnet: {
      chainId: 31,
      url: 'https://public-node.testnet.rsk.co/',
      gasPrice: rskTestnetMinimumGasPrice,
      gasMultiplier: rskTestnetGasMultiplier,
      accounts,
    },
  },
  mocha: {
    timeout: 6000000,
  },
};

export default hardhatConfig;

/*
To verify that we're able to connect to RSK Testnet successfully:

npx hardhat console --network rsktestnet

// latest block number
(await require('hardhat').network.provider.send('eth_getBlockByNumber', ['latest', false])).number

// the default EOA that will be used in deployment transactions
(await require('hardhat').ethers.getSigners())[0].address

.exit
*/
