// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "forge-std/Test.sol";
import "../src/IdentityRegistry.sol";
import "../src/InvoiceToken.sol";
import "../src/InvoiceVault.sol";
import "../src/MockUSDC.sol";

contract InvoiceSystemTest is Test {
    IdentityRegistry public identity;
    InvoiceToken public token;
    InvoiceVault public vault;
    MockUSDC public usdc;

    address public admin = address(1);
    address public issuer = address(2);
    address public payer = address(3);
    address public investor = address(4);
    address public unverified = address(5);

    // Helper to format USDC amounts (6 decimals)
    function toUSDC(uint256 amount) internal pure returns (uint256) {
        return amount * 1e6;
    }

    function setUp() public {
        // Admin deploys and registers
        vm.startPrank(admin);
        
        usdc = new MockUSDC();
        identity = new IdentityRegistry();
        token = new InvoiceToken(address(identity));
        vault = new InvoiceVault(IERC20(address(usdc)), address(token), address(identity));
        
        // Register users (KYC simulation)
        identity.register(admin);
        identity.register(issuer);
        identity.register(investor);
        identity.register(payer); 
        
        vm.stopPrank();
        
        // Mint USDC to investor and payer
        vm.startPrank(admin); // Assuming admin can mint mock USDC
        // Actually MockUSDC.mint is public in our implementation
        vm.stopPrank();
        
        vm.startPrank(investor);
        usdc.mint(investor, toUSDC(10000)); // 10k USDC
        usdc.approve(address(vault), type(uint256).max);
        vm.stopPrank();
        
        vm.startPrank(payer);
        usdc.mint(payer, toUSDC(5000)); // 5k USDC
        usdc.approve(address(vault), type(uint256).max);
        vm.stopPrank();
    }

    function testMintInvoice() public {
        vm.startPrank(issuer);
        token.mintInvoice(payer, toUSDC(1000), block.timestamp + 30 days, "ipfs://metadata");
        
        InvoiceToken.Invoice memory invoice = token.getInvoice(0);
        assertEq(invoice.amount, toUSDC(1000));
        assertEq(invoice.issuer, issuer);
        assertEq(invoice.payer, payer);
        assertEq(token.ownerOf(0), issuer);
        vm.stopPrank();
    }

    function testMintUnverifiedReverts() public {
        vm.startPrank(unverified);
        vm.expectRevert("InvoiceToken: Issuer not verified");
        token.mintInvoice(payer, toUSDC(1000), block.timestamp + 30 days, "ipfs://metadata");
        vm.stopPrank();
    }

    function testTransferInvoice() public {
        vm.startPrank(issuer);
        token.mintInvoice(payer, toUSDC(1000), block.timestamp + 30 days, "uri");
        
        token.safeTransferFrom(issuer, payer, 0);
        
        assertEq(token.ownerOf(0), payer);
        vm.stopPrank();
    }

    function testTransferToUnverifiedReverts() public {
        vm.startPrank(issuer);
        token.mintInvoice(payer, toUSDC(1000), block.timestamp + 30 days, "uri");
        
        vm.expectRevert("InvoiceToken: Transfer to unverified address");
        token.safeTransferFrom(issuer, unverified, 0);
        vm.stopPrank();
    }

    function testVaultDepositAndFund() public {
        // 1. Issuer creates Invoice for 1000 USDC
        vm.startPrank(issuer);
        token.mintInvoice(payer, toUSDC(1000), block.timestamp + 30 days, "uri");
        vm.stopPrank();

        // 2. Investor deposits 5000 USDC into Vault
        vm.startPrank(investor);
        uint256 shares = vault.deposit(toUSDC(5000), investor);
        
        assertEq(shares, toUSDC(5000)); 
        assertEq(vault.totalAssets(), toUSDC(5000));
        vm.stopPrank();

        // 3. Admin funds the Invoice
        vm.startPrank(admin);
        uint256 issuerUsdcBefore = usdc.balanceOf(issuer);
        
        vault.fundInvoice(0);
        
        assertEq(vault.fundedInvoices(0), true);
        // Vault assets decrease (cash basis)
        assertEq(vault.totalAssets(), toUSDC(4000)); 
        
        // Issuer received USDC
        assertEq(usdc.balanceOf(issuer), issuerUsdcBefore + toUSDC(1000));
        vm.stopPrank();
    }
    
    function testVaultIncomeAndWithdraw() public {
        // 1. Setup: Investor funds vault with 10k USDC
        vm.startPrank(investor);
        vault.deposit(toUSDC(10000), investor);
        vm.stopPrank();
        
        // 2. Simulate Income: Payer pays back manually to vault
        // (In a real system, this would likely go through an invoice repayment function,
        // but direct transfer works for the Vault's accounting if we just check balance)
        vm.startPrank(payer);
        usdc.transfer(address(vault), toUSDC(1100)); // 1.1k USDC
        vm.stopPrank();
        
        // Vault assets: 10000 + 1100 = 11100
        assertEq(vault.totalAssets(), toUSDC(11100));
        
        // 3. Investor withdraws everything
        vm.startPrank(investor);
        uint256 sharesToBurn = vault.balanceOf(investor);
        uint256 assetsReceived = vault.redeem(sharesToBurn, investor, investor);
        
        assertEq(assetsReceived, toUSDC(11100));
        assertEq(usdc.balanceOf(investor), toUSDC(11100));
        vm.stopPrank();
    }
}
