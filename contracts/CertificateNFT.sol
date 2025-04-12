// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CertificateNFT is ERC721, Ownable {
    uint256 public currentCertificateId;

    struct Certificate {
        uint256 courseId;  // Use 0 for final degree certificates.
        string certificateType; // e.g. "Course Completion" or "Degree"
        string ipfsFileId;  // ID for the certificate stored in IPFS
    }

    mapping(address => uint256[]) private _ownedTokens;
    
    mapping(uint256 => Certificate) public certificates;
    event CertificateIssued(uint256 certificateId, address to, uint256 courseId, string certificateType);

    constructor() ERC721("IITDharwadCertificate", "IITDH-CERT") Ownable(msg.sender) {}

    // @notice Mint a new certificate NFT.
    function mintCertificate(
        address to,
        uint256 courseId,
        string memory certificateType,
        string memory ipfsFileId
    ) public onlyOwner returns (uint256) {
        uint256 newCertificateId = ++currentCertificateId;
        _mint(to, newCertificateId);
        certificates[newCertificateId] = Certificate(courseId, certificateType, ipfsFileId);
        _ownedTokens[to].push(newCertificateId);
        emit CertificateIssued(newCertificateId, to, courseId, certificateType);
        return newCertificateId;
    }

    // Disabling transfer if this NFT
    function transferFrom(address from, address to, uint256 tokenId) public virtual override {
        revert("Transfers are disabled");
    }

    function listCertificates(address owner) public view returns (uint256[] memory) {
        return _ownedTokens[owner];
    }

}