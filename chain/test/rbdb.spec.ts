import hre from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { RbdbFungibleToken__factory } from '../typechain-types/factories/contracts/RbdbFungibleToken__factory';
import { RbdbFungibleToken } from '../typechain-types/contracts/RbdbFungibleToken';

describe('Rbdb', () => {
    let deployer: SignerWithAddress;
    let rbdbFactory: RbdbFungibleToken__factory;
    let rbdb: RbdbFungibleToken;

    before(async () => {
        [deployer] = await hre.ethers.getSigners();
        rbdbFactory = await hre.ethers.getContractFactory("RbdbFungibleToken");
        rbdb = await rbdbFactory.deploy();
        await rbdb.deployTransaction.wait();
    });

    it('should access decimals', async () => {
        const [decimals] = await rbdb.functions.decimals();
        expect(decimals).to.equal(18);
    });

    it('should access totalSupply', async () => {
        const [totalSupply] = await rbdb.functions.totalSupply();
        // 1 billion "whole" units with 18 decimals
        const expectedValue = 1_000_000_000n * 1_000_000_000_000_000_000n;
        expect(totalSupply).to.equal(expectedValue); 
    });

    it('should access balanceOf for deployer', async () => {
        const [balanceOfDeployer] = await rbdb.functions.balanceOf(deployer.address);
        // the entire total supply
        const expectedValue = 1_000_000_000n * 1_000_000_000_000_000_000n;
        expect(balanceOfDeployer).to.equal(expectedValue); 
    });
});
