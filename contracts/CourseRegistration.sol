// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Interface to interact with the IdentityNFT contract.
interface IIdentityNFT {
    function identityTokenByOwner(
        address owner
    ) external view returns (uint256);
}

/// @notice Interface to interact with the FeePayment contract.
interface IFeePayment {
    function isFeePaid(address account) external view returns (bool);
}

contract CourseRegistration is Ownable {
    IIdentityNFT public identityNFT;
    IFeePayment public feePayment;

    struct Course {
        uint256 courseId;
        string courseName;
        bool isActive;
    }

    mapping(uint256 => Course) public courses;
    uint256 public currentCourseId;

    mapping(uint256 => address[]) public courseRegistrants;

    event CourseAdded(uint256 courseId, string courseName);
    event StudentRegistered(uint256 courseId, address student);

    /// @notice Constructor requires addresses for IdentityNFT and FeePayment.
    constructor(
        address _identityNFTAddress,
        address _feePaymentAddress
    ) Ownable(msg.sender) {
        identityNFT = IIdentityNFT(_identityNFTAddress);
        feePayment = IFeePayment(_feePaymentAddress);
    }

    /// @notice Add a new course (only owner).
    function addCourse(string memory courseName) public onlyOwner {
        currentCourseId++;
        courses[currentCourseId] = Course(currentCourseId, courseName, true);
        emit CourseAdded(currentCourseId, courseName);
    }

    /// @notice Register for a course.
    function registerCourse(uint256 courseId) public {
        require(courses[courseId].isActive, "Course is not active");
        require(
            identityNFT.identityTokenByOwner(msg.sender) != 0,
            "No valid Identity NFT found"
        );
        require(feePayment.isFeePaid(msg.sender), "Fee not paid");

        // Check if the user has already registered
        for (uint i = 0; i < courseRegistrants[courseId].length; i++) {
            require(
                courseRegistrants[courseId][i] != msg.sender,
                "Already registered for this course"
            );
        }

        courseRegistrants[courseId].push(msg.sender);
        emit StudentRegistered(courseId, msg.sender);
    }

    /// @notice Check if a user is already registered for a given course.
    function isRegistered(
        uint256 courseId,
        address user
    ) public view returns (bool) {
        address[] memory registrants = courseRegistrants[courseId];
        for (uint i = 0; i < registrants.length; i++) {
            if (registrants[i] == user) {
                return true;
            }
        }
        return false;
    }
}
