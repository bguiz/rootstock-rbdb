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

    function multiSendFungibleTokenPush(
        IERC20 token,
        uint256 amount,
        address[] calldata recipients
    )
        public
        onlyOwner
    {
        require(
            address(token) != address(0),
            "Invalid ERC20 address"
        );
        require(
            amount > 0,
            "Zero amount"
        );
        uint256 numRecipients = recipients.length;
        require(
            (numRecipients > 1) &&
                (numRecipients <= MAX_COUNT),
            "Invalid number of recipients"
        );
        // NOTE fail-fast approach - we can know upfront
        // if the loop will throw part-way through
        require(
            token.allowance(msg.sender, address(this)) >
                (numRecipients * amount),
            "Insufficient ERC20 allowance"
        );
        for (uint256 idx = 0; idx < numRecipients; idx++) {
            require(
                token.transferFrom(
                    msg.sender,
                    recipients[idx],
                    amount
                ),
                "ERC20 transfer failed"
            );
        }
    }
}
