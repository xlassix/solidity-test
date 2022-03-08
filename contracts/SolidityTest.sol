//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract SolidityTest {
    uint public constant PRICE = 1 ether / 10;
    uint public constant MAX_SUPPLY = 1000;
    uint public constant MAX_PER_TX = 5;

    // YOUR CODE HERE
    // ---
    address owner;
    uint accumulatedFees;
    mapping (uint=>address) public nftToOwner;
    uint nftsMinted;

    constructor() {
        owner=msg.sender;
    }

    function claim() external{
        require(msg.sender==owner);
        uint total=accumulatedFees;
        accumulatedFees=0;
        (bool sent,) = payable(owner).call{value: total}("");
        require(sent, "couldn't to send Ether");
    }

    function _mint() internal{
        nftsMinted+=1;
        nftToOwner[nftsMinted]=msg.sender;
    }
    function mint(uint256 amount) external payable {
        require(msg.value>=PRICE*amount,"Insufficent Trancation fee");
        require(amount>0 && amount<=5,"amount must be greater then 0 and less or equal to 5");
        accumulatedFees+=msg.value;
        for (uint _id=0;_id<amount;_id++){
            _mint();
        }
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        return nftToOwner[tokenId];
    }
}
