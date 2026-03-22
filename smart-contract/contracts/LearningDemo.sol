// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract LearningDemo {
    uint256 public count;
    string public message;
    address public owner;

    event CountIncremented(address indexed caller, uint256 newCount);
    event MessageUpdated(address indexed caller, string newMessage);

    constructor(string memory initialMessage) {
        owner = msg.sender;
        message = initialMessage;
    }

    function increment() external {
        count += 1;
        emit CountIncremented(msg.sender, count);
    }

    function setMessage(string calldata newMessage) external {
        message = newMessage;
        emit MessageUpdated(msg.sender, newMessage);
    }
}

