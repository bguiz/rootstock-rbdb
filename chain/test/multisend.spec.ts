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
    let acc1: SignerWithAddress;
    let acc2: SignerWithAddress;
    let acc3: SignerWithAddress;
    let acc4: SignerWithAddress;
    let multiSendFactory: MultiSend__factory;
    let multiSend: MultiSend;

    before(async () => {
        [deployer, acc1, acc2, acc3, acc4] = await hre.ethers.getSigners();
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

        describe('with IERC20', () => {
            let rbdbFactory: RbdbFungibleToken__factory;
            let rbdb: RbdbFungibleToken;
            let deployerInitialBalance: bigint;
            let recipients: string[];

            before(async () => {
                recipients = [
                    acc1.address,
                    acc2.address,
                    acc3.address,
                    acc4.address,
                ];
                rbdbFactory = await hre.ethers.getContractFactory("RbdbFungibleToken");
                rbdb = await rbdbFactory.deploy();
                deployerInitialBalance = 1000_000_000n * 1_000_000_000_000_000_000n;
                await rbdb.deployTransaction.wait();
            });

            it('should check deployer allowance before approval', async () => {
                let deployerAllowance: BigNumber;
                [deployerAllowance] =
                    await rbdb.functions.allowance(deployer.address, multiSend.address);
                expect(deployerAllowance).to.equal(0);
            });

            it('should fail when an attempting to transfer before approval', async () => {
                const invocation = multiSend.multiSendFungibleTokenPush(
                    rbdb.address,
                    100,
                    recipients,
                );
                await expect(invocation).to.be.revertedWith('Insufficient ERC20 allowance');
            });

            it('should approve rbdb balance of deployer by multisend', async () => {
                // it is approved to spend *all* of the tokens
                await rbdb.functions.approve(
                    multiSend.address,
                    BigNumber.from(deployerInitialBalance),
                );
            });

            it('should check deployer allowance after approval', async () => {
                let deployerAllowance: BigNumber;
                [deployerAllowance] =
                    await rbdb.functions.allowance(deployer.address, multiSend.address);
                expect(deployerAllowance).to.equal(deployerInitialBalance);
            });

            let successfulInvocation: Promise<ContractTransaction>;
            it('should begin the successful invocation', async () => {
                successfulInvocation = multiSend.multiSendFungibleTokenPush(
                    rbdb.address,
                    100,
                    recipients,
                );
            });

            it('should allow transfer after approval', async () => {
                await expect(successfulInvocation).not.to.be.reverted;
            });

            it('should emit transfer events', async () => {
                recipients.forEach(async (recipientAddress) => {
                    // event Transfer(address indexed from, address indexed to, uint256 value);
                    await expect(successfulInvocation).to.emit(
                        rbdb,
                        'Transfer'
                    ).withArgs(
                        deployer.address,
                        recipientAddress,
                        100,
                    );
                });
            });

            it('should change balances', async () => {
                await expect(successfulInvocation).to.changeTokenBalances(
                    rbdb,
                    [deployer.address, ...recipients],
                    [-400, 100, 100, 100, 100],
                );
            });

            it('should complete the successful invocation', async () => {
                await successfulInvocation;
            });

            it('should decrement allowance of deployer', async () => {
                let deployerAllowance: BigNumber;
                [deployerAllowance] =
                    await rbdb.functions.allowance(deployer.address, multiSend.address);
                expect(deployerAllowance).to.equal(deployerInitialBalance - 400n);
            });

            // NOTE the scenario of the recipient address rejecting an incoming ERC20 transfer
            // does not exist, as this is not possible to do, hence no test for it.
            // This scenario does exist for the native coin transfers though.
        });
    });

});
