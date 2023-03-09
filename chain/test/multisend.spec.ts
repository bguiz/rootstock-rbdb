import { ethers, waffle } from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import multiSendBuildArtefact from '../artifacts/contracts/MultiSend.sol/MultiSend.json';

describe('MultiSend', () => {
    let deployer: SignerWithAddress;
    let multiSend: any; // TODO get types from typechain

    before(async () => {
        [deployer] = await ethers.getSigners();
        multiSend = await waffle.deployContract(deployer, multiSendBuildArtefact, []);
        await multiSend.deployed();
    });
});
