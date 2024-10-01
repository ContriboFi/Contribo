// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Campaign is ERC20, Ownable {
    using SafeERC20 for IERC20;

    uint256 public maxSupply;
    uint256 public Rate;
    IERC20 public Stable;
    IERC20 public Token;
    bool public isActive;

    event TokenInformationSet(address token, uint256 rate);
    event Participation(address indexed participant, uint256 stableAmount, uint256 mintedAmount);
    event StablesWithdrawn(address indexed owner, uint256 amount);
    event Redeemed(address indexed participant, uint256 amount, uint256 tokenAmount);

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 supply_,
        address owner_,
        address stableAddress
    ) ERC20(name_, symbol_) Ownable(owner_) {
        maxSupply = supply_;
        Stable = IERC20(stableAddress);
        Rate = 0;
        isActive = false;
    }

    function changeOwner(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner is the zero address");
        transferOwnership(newOwner);
    }

    function setTokenInformation(address token, uint256 rate) public onlyOwner {
        require(token != address(0), "Token address is the zero address");
        require(rate > 0, "Rate must be greater than 0");
        Token = IERC20(token);
        Rate = rate;
        isActive = true;
        emit TokenInformationSet(token, rate);
    }

    function participate(uint256 stableAmount) public {
        require(stableAmount > 0, "You need to send some stable tokens");
        
        uint256 shareAmount = stableAmount; 
        uint256 currentSupply = totalSupply();
        require(currentSupply + shareAmount <= maxSupply, "Exceeds max supply");

        Stable.safeTransferFrom(msg.sender, address(this), stableAmount);
        _mint(msg.sender, shareAmount);

        emit Participation(msg.sender, stableAmount, shareAmount);
    }

    function withdrawStables(uint256 amount) public onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        Stable.safeTransfer(owner(), amount);
        emit StablesWithdrawn(owner(), amount);
    }

    function redeem(uint256 amount) public {
        require(isActive, "Claim is not active");
        require(amount > 0, "You need to redeem a positive amount");
        
        uint256 tokenAmount;
        unchecked {
            tokenAmount = amount * Rate;
        }

        _burn(msg.sender, amount);
        Token.safeTransferFrom(address(this), msg.sender, tokenAmount);
        emit Redeemed(msg.sender, amount, tokenAmount);
    }
}

