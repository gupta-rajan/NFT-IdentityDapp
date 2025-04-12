import React, { useState } from "react";
import { ethers } from "ethers";
import { COURSEREGISTRATION_ABI, COURSEREGISTRATION_ADDRESS } from "../config";

const AddCourse = () => {
  const [courseName, setCourseName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Function to handle form submission
  const handleAddCourse = async (e) => {
    e.preventDefault();
    
    if (!courseName) {
      setError("Course name cannot be empty.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        COURSEREGISTRATION_ADDRESS,
        COURSEREGISTRATION_ABI,
        signer
      );

      const tx = await contract.addCourse(courseName);
      await tx.wait(); // Wait for the transaction to be mined
      setSuccessMessage("Course added successfully!");
      setCourseName(""); // Clear the input field
    } catch (err) {
      console.error("Error adding course:", err);
      setError("Failed to add course. Ensure you are the contract owner.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Add New Course</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <form onSubmit={handleAddCourse}>
        <div className="mb-3">
          <label htmlFor="courseName" className="form-label">
            Course Name
          </label>
          <input
            type="text"
            className="form-control"
            id="courseName"
            placeholder="Enter course name"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? "Adding Course..." : "Add Course"}
        </button>
      </form>
    </div>
  );
};

export default AddCourse;