// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "forge-std/Script.sol";
import "../src/IdentityRegistry.sol";
import "../src/InvoiceToken.sol";
import "../src/InvoiceVault.sol";
import "../src/MockUSDC.sol";

contract DeployInvoiceSystem is Script {
    function run() external {
        vm.startBroadcast();

        // Deploy MockUSDC (In production, use real USDC address)
        MockUSDC usdc = new MockUSDC();
        console.log("MockUSDC deployed to:", address(usdc));

        // Deploy System
        IdentityRegistry identity = new IdentityRegistry();
        InvoiceToken token = new InvoiceToken(address(identity));
        
        // Vault uses USDC as the asset
        InvoiceVault vault = new InvoiceVault(IERC20(address(usdc)), address(token), address(identity));

        console.log("IdentityRegistry deployed to:", address(identity));
        console.log("InvoiceToken deployed to:", address(token));
        console.log("InvoiceVault deployed to:", address(vault));
        
        // Setup Permissions
        // Register the deployer
        identity.register(msg.sender);
        
        vm.stopBroadcast();
    }
}
