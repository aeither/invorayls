// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "./IdentityRegistry.sol";

/// @title Invoice Token (ERC-721 with ERC-3643 Style Permissions)
/// @notice Represents Real World Asset Invoices as unique tokens.
/// @dev Implements permissioned transfers via IdentityRegistry.
contract InvoiceToken is ERC721URIStorage, Ownable {
    struct Invoice {
        uint256 amount;
        address issuer;
        address payer;
        uint256 dueDate;
        bool paid;
        bool exists;
    }

    IdentityRegistry public identityRegistry;
    
    // Mapping from token ID to Invoice details
    mapping(uint256 => Invoice) public invoices;
    uint256 private _nextTokenId;

    event InvoiceMinted(uint256 indexed invoiceId, address indexed issuer, address payer, uint256 amount, uint256 dueDate);
    event InvoicePaid(uint256 indexed invoiceId, uint256 amount);

    constructor(address _identityRegistry) ERC721("InvoiceToken", "INVC") {
        identityRegistry = IdentityRegistry(_identityRegistry);
    }

    function setIdentityRegistry(address _identityRegistry) external onlyOwner {
        identityRegistry = IdentityRegistry(_identityRegistry);
    }

    /// @notice Mints a new Invoice Token
    /// @dev Only verified users can mint
    function mintInvoice(
        address payer, 
        uint256 amount, 
        uint256 dueDate,
        string memory uri
    ) external {
        require(identityRegistry.isVerified(msg.sender), "InvoiceToken: Issuer not verified");
        
        uint256 tokenId = _nextTokenId++;
        
        invoices[tokenId] = Invoice({
            amount: amount,
            issuer: msg.sender,
            payer: payer,
            dueDate: dueDate,
            paid: false,
            exists: true
        });

        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);

        emit InvoiceMinted(tokenId, msg.sender, payer, amount, dueDate);
    }

    /// @notice Marks an invoice as paid
    function markPaid(uint256 tokenId) external {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "InvoiceToken: Not owner or approved");
        require(invoices[tokenId].exists, "InvoiceToken: Non-existent invoice");
        
        invoices[tokenId].paid = true;
        emit InvoicePaid(tokenId, invoices[tokenId].amount);
    }

    /// @notice Getter for invoice details
    function getInvoice(uint256 tokenId) external view returns (Invoice memory) {
        require(invoices[tokenId].exists, "InvoiceToken: Non-existent invoice");
        return invoices[tokenId];
    }

    /// @notice Hook to enforce Identity checks on transfers (ERC-3643 Style)
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 /* tokenId */,
        uint256 /* batchSize */
    ) internal view override {
        // Skip check for minting (from == 0) if we check in mint function, 
        // but let's enforce that 'to' must be verified for all transfers including mints/burns
        if (to != address(0)) {
            require(identityRegistry.isVerified(to), "InvoiceToken: Transfer to unverified address");
        }
        
        // Optionally check 'from' if not minting
        if (from != address(0)) {
             // In strictly permissioned systems, sender might also need to be verified or compliant
             require(identityRegistry.isVerified(from), "InvoiceToken: Transfer from unverified address");
        }
    }
}
