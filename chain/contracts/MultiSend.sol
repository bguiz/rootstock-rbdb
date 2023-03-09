// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MultiSend
 * @dev This contract provides a single function to send
 * the native coin on the network, or ERC20 fungible tokens,
 * to multiple recipients using a single function invocation.
 */
contract MultiSend
    is Ownable
{
    /**
     * @dev The maximum number of recipients that may receive a transfer
     * within a single function invocation.
     */
    uint256 public constant MAX_COUNT = 64;

    constructor()
        Ownable()
    {}

    /**
     * @dev Sends ERC20 fungible tokens to multiple recipients.
     * @param token The address of the ERC20 token to be sent.
     * @param amount The amount of tokens to send.
     *  Note that exact amount should be used, will **not** multiply by exponent
     *  of `decimals()`.
     * @param recipients An array of addresses to receive the tokens.
     */
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
            token.allowance(msg.sender, address(this)) >=
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

    /**
     * @dev Sends native coin to multiple recipients.
     * @param amount The amount of coins to send.
     *  Note that exact amount should be used, will **not** multiply by exponent
     *  of smallest unit to "whole" unit (e.g. 10^18).
     * @param recipients An array of addresses to receive the coins.
     */
    function multiSendNativeCoinPush(
        uint256 amount,
        address payable[] calldata recipients
    )
        public
        payable
        onlyOwner
    {
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
            msg.value > (numRecipients * amount),
            "Insufficient ERC20 allowance"
        );
        for (uint256 idx = 0; idx < numRecipients; idx++) {
            // NOTE that `call` in combination with a re-entrancy guard is the
            // recommended method to use as of 2019/12.
            // `tansfer` and `send` are no longer considered secure.
            (bool didSend, /* bytes memory data */) =
                recipients[idx].call{value: amount}("");
            require(
                didSend,
                "Native coin transfer failed"
            );
        }
    }

    // TODO multiSendFungibleTokenPull
    // TODO multiSendNativeCoinPull
}
