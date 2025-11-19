// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/// Identity Registry (simple: address => verified)
contract IdentityRegistry {
    mapping(address => bool) public verified;

    function register(address user) external {
        // You'd want real admin logic, but demo for hackathon
        verified[user] = true;
    }

    function isVerified(address user) external view returns (bool) {
        return verified[user];
    }
}



