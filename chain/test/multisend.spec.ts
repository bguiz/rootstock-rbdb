import hre from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { MultiSend__factory } from '../typechain-types/factories/contracts/MultiSend__factory';
import { MultiSend } from '../typechain-types/contracts/MultiSend';

describe('MultiSend', () => {
    let deployer: SignerWithAddress;
    let multiSendFactory: MultiSend__factory;
    let multiSend: MultiSend;

    before(async () => {
        [deployer] = await hre.ethers.getSigners();
        multiSendFactory = await hre.ethers.getContractFactory("MultiSend");
        multiSend = await multiSendFactory.deploy();
        await multiSend.deployTransaction.wait();
    });

    it('should access MAX_COUNT', async () => {
        const [maxCount] = await multiSend.functions.MAX_COUNT();
        expect(maxCount).to.equal(64);
    });
});
