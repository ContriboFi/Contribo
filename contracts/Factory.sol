// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "./Campaign.sol";

contract CampaignFactory {

    Campaign[] public campaigns;
    address public owner;

    event CampaignCreated(address indexed campaignAddress, address indexed owner, string name, string symbol, uint256 supply, address stableAddress);

    modifier onlyOwner() {
        require(msg.sender == owner, "You should be the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createCampaign(
        string memory name_,
        string memory symbol_,
        uint256 supply_,
        address stableAddress
    ) external onlyOwner {
        Campaign newCampaign = new Campaign(name_, symbol_, supply_, msg.sender, stableAddress);
        campaigns.push(newCampaign);
        emit CampaignCreated(address(newCampaign), msg.sender, name_, symbol_, supply_, stableAddress);
    }

    function changeOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be the zero address");
        owner = newOwner;
    }
}

