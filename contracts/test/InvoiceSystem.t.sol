// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "forge-std/Test.sol";
import "../src/IdentityRegistry.sol";
import "../src/InvoiceToken.sol";
import "../src/InvoiceVault.sol";

contract InvoiceSystemTest is Test {
    IdentityRegistry public identity;
    InvoiceToken public token;
    InvoiceVault public vault;

    address public admin = address(1);
    address public issuer = address(2);
    address public payer = address(3);
    address public investor = address(4);
    address public unverified = address(5);

    function setUp() public {
        // Admin deploys and registers
        vm.startPrank(admin);
        identity = new IdentityRegistry();
        token = new InvoiceToken(address(identity));
        vault = new InvoiceVault(address(identity), address(token));
        
        // Register users
        identity.register(admin);
        identity.register(issuer);
        identity.register(investor);
        identity.register(payer); 
        vm.stopPrank();
        
        // Fund investor
        vm.deal(investor, 100 ether);
    }

    function testMintInvoice() public {
        vm.startPrank(issuer);
        token.mintInvoice(payer, 1 ether, block.timestamp + 30 days);
        
        (InvoiceToken.Invoice memory invoice, address owner) = token.invoiceInfo(0);
        assertEq(invoice.amount, 1 ether);
        assertEq(invoice.issuer, issuer);
        assertEq(invoice.payer, payer);
        assertEq(owner, issuer);
        assertEq(token.getInvoiceCount(), 1);
        vm.stopPrank();
    }

    function testMintUnverifiedReverts() public {
        vm.startPrank(unverified);
        vm.expectRevert("Not verified");
        token.mintInvoice(payer, 1 ether, block.timestamp + 30 days);
        vm.stopPrank();
    }

    function testTransferInvoice() public {
        vm.startPrank(issuer);
        token.mintInvoice(payer, 1 ether, block.timestamp + 30 days);
        token.transferInvoice(0, payer); 
        
        (, address owner) = token.invoiceInfo(0);
        assertEq(owner, payer);
        vm.stopPrank();
    }

    function testFundInvoice() public {
        vm.startPrank(issuer);
        token.mintInvoice(payer, 1 ether, block.timestamp + 30 days);
        vm.stopPrank();

        vm.startPrank(investor);
        vault.fundInvoice{value: 1 ether}(0);
        
        assertEq(vault.fundedInvoices(0), true);
        assertEq(vault.investorBalance(investor), 1 ether);
        assertEq(issuer.balance, 1 ether); // Issuer gets the funds
        vm.stopPrank();
    }

    function testRecommendInvoices() public {
        vm.startPrank(issuer);
        token.mintInvoice(payer, 1 ether, block.timestamp + 30 days); // ID 0
        token.mintInvoice(payer, 2 ether, block.timestamp + 30 days); // ID 1
        vm.stopPrank();

        vm.startPrank(investor);
        // Fund first one
        vault.fundInvoice{value: 1 ether}(0);
        
        uint256[] memory recommended = vault.recommendInvoices();
        assertEq(recommended.length, 1);
        assertEq(recommended[0], 1); // Should return ID 1
        vm.stopPrank();
    }
}

