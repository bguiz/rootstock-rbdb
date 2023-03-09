import hre from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe('MultiSend', () => {
    let deployer: SignerWithAddress;
    let multiSendFactory: any;
    let multiSend: any; // TODO get types from typechain

    before(async () => {
        console.log('running before');
        [deployer] = await hre.ethers.getSigners();
        multiSendFactory = await hre.ethers.getContractFactory("MultiSend");
        multiSend = await multiSendFactory.deploy([]);
        await multiSend.deployTransaction.wait();
    });
});
