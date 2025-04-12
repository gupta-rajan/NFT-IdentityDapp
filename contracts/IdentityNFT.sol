// SPDX-License-Identifier:  GPL-3.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract IdentityNFT is ERC721, Ownable {
    uint256 public currentTokenId;

    // Role differentiation: Student or Professor.
    enum Role {
        Student,
        Professor,
        Admin
    }

    // Identity structure now includes role and IPFS file ID for government document.
    struct Identity {
        string name;
        string dateOfBirth;
        Role role;
        string ipfsFileId;
    }

    // Mapping from tokenId to Identity details.
    mapping(uint256 => Identity) public identities;

    // Production-level efficient mapping: each address is linked to its Identity NFT.
    // Assumes one address may hold only one Identity NFT.
    mapping(address => uint256) public identityTokenByOwner;

    event IdentityIssued(
        uint256 tokenId,
        address owner,
        string name,
        Role role
    );

    constructor() ERC721("IITDharwadIdentity", "IITD-ID") Ownable(msg.sender) {
        mintIdentity(msg.sender, "Admin", "22-07-2003",Role.Admin,"");
    }

    /// @notice Mint a new Identity NFT.
    function mintIdentity(
        address to,
        string memory name,
        string memory dateOfBirth,
        Role role,
        string memory ipfsFileId
    ) public onlyOwner returns (uint256) {
        require(
            identityTokenByOwner[to] == 0,
            "Identity NFT already exists for this address"
        );

        uint256 newTokenId = ++currentTokenId;
        _mint(to, newTokenId);
        identities[newTokenId] = Identity(name, dateOfBirth, role, ipfsFileId);
        identityTokenByOwner[to] = newTokenId;
        emit IdentityIssued(newTokenId, to, name, role);
        return newTokenId;
    }
    
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override  {
        revert("Transfers are disabled");
    }
}