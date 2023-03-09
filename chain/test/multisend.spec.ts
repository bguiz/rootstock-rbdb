import hre from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { MultiSend__factory } from '../typechain-types/factories/contracts/MultiSend__factory';
import { MultiSend } from '../typechain-types/contracts/MultiSend';
import { RbdbFungibleToken__factory } from '../typechain-types/factories/contracts/RbdbFungibleToken__factory';
import { RbdbFungibleToken } from '../typechain-types/contracts/RbdbFungibleToken';
import { BigNumber, ContractTransaction } from 'ethers';

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

    describe('multiSendFungibleTokenPush', () => {

        it('should fail when zero-address is passed as the token parameter', async () => {
            const zeroAddress = hre.ethers.constants.AddressZero;
            const invocation = multiSend.multiSendFungibleTokenPush(
                zeroAddress,
                0,
                [deployer.address],
            );
            await expect(invocation).to.be.revertedWith('Invalid ERC20 address');
        });

        it('should fail when zero amount is passed as the token parameter', async () => {
            const invocation = multiSend.multiSendFungibleTokenPush(
                deployer.address,
                0,
                [deployer.address],
            );
            await expect(invocation).to.be.revertedWith('Zero amount');
        });

        it('should fail when an invalid number of recipients is passed', async () => {
            const recipients = Array.from({ length: 65 }, (_, i) => deployer.address);
            const invocation = multiSend.multiSendFungibleTokenPush(
                deployer.address,
                1,
                recipients,
            );
            await expect(invocation).to.be.revertedWith('Invalid number of recipients');
        });

        it('should fail when an invalid number of recipients is passed', async () => {
            const recipients = Array.from({ length: 1 }, (_, i) => deployer.address);
            const invocation = multiSend.multiSendFungibleTokenPush(
                deployer.address,
                1,
                recipients,
            );
            await expect(invocation).to.be.revertedWith('Invalid number of recipients');
        });
    });

});
