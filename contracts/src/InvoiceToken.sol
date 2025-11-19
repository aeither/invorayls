// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./IdentityRegistry.sol";

/// Permissioned Invoice token (ERC-3643 inspired, not full ERC-721)
contract InvoiceToken {
    struct Invoice {
        uint256 amount;
        address issuer;
        address payer;
        uint256 dueDate;
        bool paid;
    }

    IdentityRegistry public identity;
    Invoice[] public invoices;
    mapping(uint256 => address) public invoiceOwner;
    mapping(address => uint256[]) public ownedInvoices;
    address public admin;
    bool public paused;
    mapping(address => bool) public frozen;

    event InvoiceMinted(uint256 indexed invoiceId, address indexed issuer, address payer, uint256 amount, uint256 dueDate);
    event InvoicePaid(uint256 indexed invoiceId, uint256 amount);
    event Transfer(uint256 indexed invoiceId, address from, address to);

    constructor(address _identity) {
        identity = IdentityRegistry(_identity);
        admin = msg.sender;
    }

    modifier onlyVerified() {
        require(identity.isVerified(msg.sender), "Not verified");
        _;
    }

    modifier notPaused() {
        require(!paused, "Contract paused");
        require(!frozen[msg.sender], "Account frozen");
        _;
    }

    function pause(bool _state) external {
        require(msg.sender == admin, "Only admin");
        paused = _state;
    }

    function freeze(address user, bool _state) external {
        require(msg.sender == admin, "Only admin");
        frozen[user] = _state;
    }

    function mintInvoice(address payer, uint256 amount, uint256 dueDate) external onlyVerified notPaused {
        uint256 id = invoices.length;
        invoices.push(Invoice(amount, msg.sender, payer, dueDate, false));
        invoiceOwner[id] = msg.sender;
        ownedInvoices[msg.sender].push(id);
        emit InvoiceMinted(id, msg.sender, payer, amount, dueDate);
    }

    function transferInvoice(uint256 id, address to) external onlyVerified notPaused {
        require(invoiceOwner[id] == msg.sender, "Not owner");
        require(identity.isVerified(to), "To not verified");
        
        invoiceOwner[id] = to;
        ownedInvoices[to].push(id);
        emit Transfer(id, msg.sender, to);
    }

    function markPaid(uint256 id) external onlyVerified notPaused {
        require(invoiceOwner[id] == msg.sender, "Not owner");
        invoices[id].paid = true;
        emit InvoicePaid(id, invoices[id].amount);
    }

    function recoverInvoice(uint256 id, address newOwner) external {
        require(msg.sender == admin, "Only admin");
        invoiceOwner[id] = newOwner;
    }

    function invoiceInfo(uint256 id) external view returns (Invoice memory, address owner) {
        return (invoices[id], invoiceOwner[id]);
    }

    function getInvoiceCount() external view returns (uint256) {
        return invoices.length;
    }
}



