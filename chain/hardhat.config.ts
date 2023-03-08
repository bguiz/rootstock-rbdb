import { HardhatUserConfig } from 'hardhat/config';
import { HardhatNetworkAccountsUserConfig } from 'hardhat/src/types/config';

const accounts: HardhatNetworkAccountsUserConfig = {
  mnemonic: '', // TODO seedphrase
  path: "m/44'/60'/0'/0",
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
  },
  mocha: {
    timeout: 6000000,
  },
};

export default hardhatConfig;
