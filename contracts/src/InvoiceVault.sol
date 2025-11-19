// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./IdentityRegistry.sol";
import "./InvoiceToken.sol";

/// Vault for Investors and invoice funding
contract InvoiceVault {
    IdentityRegistry public identity;
    InvoiceToken public token;

    mapping(uint256 => bool) public fundedInvoices;  // invoiceId => funded
    mapping(address => uint256) public investorBalance;
    uint256 public totalFunds;

    address public admin;

    event Funded(uint256 indexed invoiceId, address indexed investor, uint256 amount);

    constructor(address _identity, address _token) {
        identity = IdentityRegistry(_identity);
        token = InvoiceToken(_token);
        admin = msg.sender;
    }

    modifier onlyVerified() {
        require(identity.isVerified(msg.sender), "Not verified");
        _;
    }

    function fundInvoice(uint256 invoiceId) external payable onlyVerified {
        (InvoiceToken.Invoice memory invoice, address owner) = token.invoiceInfo(invoiceId);
        
        require(!invoice.paid, "Invoice already paid");
        require(!fundedInvoices[invoiceId], "Already funded");
        require(msg.value == invoice.amount, "Incorrect amount");

        fundedInvoices[invoiceId] = true;
        investorBalance[msg.sender] += msg.value;
        totalFunds += msg.value;

        // Pay the invoice owner
        payable(owner).transfer(msg.value);

        emit Funded(invoiceId, msg.sender, msg.value);
    }

    function recommendInvoices() external view onlyVerified returns (uint256[] memory) {
        uint256 total = token.getInvoiceCount();
        
        // First pass to count
        uint256 count = 0;
        for (uint i = 0; i < total; i++) {
            (InvoiceToken.Invoice memory invoice, ) = token.invoiceInfo(i);
            if (!invoice.paid && !fundedInvoices[i]) {
                count++;
            }
        }

        uint256[] memory recommended = new uint256[](count);
        uint index = 0;
        for (uint i = 0; i < total; i++) {
            (InvoiceToken.Invoice memory invoice, ) = token.invoiceInfo(i);
            if (!invoice.paid && !fundedInvoices[i]) {
                recommended[index++] = i;
            }
        }

        return recommended;
    }
}



