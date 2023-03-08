// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RbdbFungibleToken
    is ERC20, Ownable
{
    constructor()
        ERC20(
            "Rootstock Billion Dollar Block fungible token",
            "RBDB"
        )
        Ownable()
    {
        // NOTE that total supply is hardcoded at 1 billion,
        // true to its name
        _mint(msg.sender, 1_000_000_000 * (10 ** decimals()));
    }
}
