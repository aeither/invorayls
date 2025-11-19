// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "openzeppelin-contracts/contracts/token/ERC20/extensions/ERC4626.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "./InvoiceToken.sol";
import "./IdentityRegistry.sol";

/// @title Invoice Vault (ERC-4626 Compliant)
/// @notice A pool that accepts USDC and invests in Invoices.
contract InvoiceVault is ERC4626, Ownable {
    InvoiceToken public invoiceToken;
    IdentityRegistry public identityRegistry;
    
    // Keep track of invoices funded by the vault
    mapping(uint256 => bool) public fundedInvoices;

    event InvoiceFunded(uint256 indexed invoiceId, uint256 amount);
    event IncomeReceived(uint256 amount);

    constructor(
        IERC20 _asset, 
        address _invoiceToken, 
        address _identityRegistry
    ) ERC4626(_asset) ERC20("Invoice Vault Token", "ivUSDC") {
        invoiceToken = InvoiceToken(_invoiceToken);
        identityRegistry = IdentityRegistry(_identityRegistry);
    }

    /// @notice Fund a specific invoice using Vault Assets
    /// @dev Only admin can decide which invoice to fund (for safety in this demo)
    function fundInvoice(uint256 invoiceId) external onlyOwner {
        require(!fundedInvoices[invoiceId], "Already funded");
        
        InvoiceToken.Invoice memory invoice = invoiceToken.getInvoice(invoiceId);
        require(!invoice.paid, "Invoice already paid");
        require(totalAssets() >= invoice.amount, "Insufficient vault funds");

        fundedInvoices[invoiceId] = true;
        
        // Transfer USDC from Vault to Issuer
        IERC20(asset()).transfer(invoice.issuer, invoice.amount);

        emit InvoiceFunded(invoiceId, invoice.amount);
    }

    /// @dev Override required by ERC4626 to include idle assets + any other tracking?
    function totalAssets() public view override returns (uint256) {
        return IERC20(asset()).balanceOf(address(this)); 
    }
}
