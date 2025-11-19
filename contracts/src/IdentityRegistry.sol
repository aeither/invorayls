// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/// @title Identity Registry (Simplified ERC-3643 Style)
/// @notice A simplified identity registry for permissioned tokens.
contract IdentityRegistry {
    mapping(address => bool) private _verified;
    address public admin;

    event IdentityVerified(address indexed user);
    event IdentityRemoved(address indexed user);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "IdentityRegistry: only admin");
        _;
    }

    /// @notice Registers a user as verified (Simulating KYC/AML check)
    function register(address user) external onlyAdmin {
        _verified[user] = true;
        emit IdentityVerified(user);
    }

    /// @notice Removes a user's verification
    function remove(address user) external onlyAdmin {
        _verified[user] = false;
        emit IdentityRemoved(user);
    }

    /// @notice Checks if a user is verified
    /// @dev This matches the ISecurityToken registry check style
    function isVerified(address user) external view returns (bool) {
        return _verified[user];
    }
}
