pragma solidity ^0.4.2;

import "./ERC20.sol";

contract Hodl {

    mapping(address => mapping(address => uint)) private amounts;
    mapping(address => mapping(address => uint)) private timestamps;

    event Hodling(address indexed sender, address indexed tokenAddress, uint256 amount);
    event TokenReturn(address indexed sender, address indexed tokenAddress, uint256 amount);

    function hodlTokens(address tokenAddress, uint256 amount, uint timestamp) public {
        assert(tokenAddress != address(0));
        assert(amount != uint256(0));
        assert(timestamp != uint(0));
        assert(amounts[msg.sender][tokenAddress] == 0);

        amounts[msg.sender][tokenAddress] = amount;
        timestamps[msg.sender][tokenAddress] = timestamp;

        ERC20 erc20 = ERC20(tokenAddress);
        assert(erc20.transferFrom(msg.sender, this, amount) == true);

        Hodling(msg.sender, tokenAddress, amount);
    }

    function getTokens(address tokenAddress) public {
        assert(tokenAddress != address(0));
        assert(amounts[msg.sender][tokenAddress] > 0);
        assert(now >= timestamps[msg.sender][tokenAddress]);

        ERC20 erc20 = ERC20(tokenAddress);
        uint256 amount = amounts[msg.sender][tokenAddress];

        delete amounts[msg.sender][tokenAddress];
        delete timestamps[msg.sender][tokenAddress];
        assert(erc20.transfer(msg.sender, amount) == true);

        TokenReturn(msg.sender, tokenAddress, amount);
    }

    function getTimestamp(address tokenAddress) public view returns (uint) {
        return timestamps[msg.sender][tokenAddress];
    }

}