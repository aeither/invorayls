// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "forge-std/Script.sol";
import "../src/IdentityRegistry.sol";
import "../src/InvoiceToken.sol";
import "../src/InvoiceVault.sol";

contract DeployInvoiceSystem is Script {
    function run() external {
        vm.startBroadcast();

        IdentityRegistry identity = new IdentityRegistry();
        InvoiceToken token = new InvoiceToken(address(identity));
        InvoiceVault vault = new InvoiceVault(address(identity), address(token));

        console.log("IdentityRegistry deployed to:", address(identity));
        console.log("InvoiceToken deployed to:", address(token));
        console.log("InvoiceVault deployed to:", address(vault));
        
        // Register the msg.sender (deployer) so they can interact
        identity.register(msg.sender);

        vm.stopBroadcast();
    }
}



