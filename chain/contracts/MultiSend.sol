// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MultiSend
    is Ownable
{
    uint256 constant MAX_COUNT = 64;

    constructor()
        Ownable()
    {}
}
