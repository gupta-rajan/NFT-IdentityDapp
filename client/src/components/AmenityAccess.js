import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { AMENITYACCESS_ABI, AMENITYACCESS_ADDRESS } from "../config";

const AmenityAccess = () => {
  const [amenities, setAmenities] = useState([]);
  const [newAmenity, setNewAmenity] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [userAddress, setUserAddress] = useState("");
  const [accessStatus, setAccessStatus] = useState({});

  // Function to load amenities using the updated smart contract function
  const loadAmenities = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(
      AMENITYACCESS_ADDRESS,
      AMENITYACCESS_ABI,
      provider
    );

    const signer = await provider.getSigner();
    const addr = await signer.getAddress();
    setUserAddress(addr);

    const owner = await contract.owner();
    setIsOwner(owner.toLowerCase() === addr.toLowerCase());

    // Fetch all amenities using getAllAmenities function
    try {
      const [ids, names] = await contract.getAllAmenities();
      const temp = ids.map((id, idx) => ({
        id: id.toString(),
        name: names[idx],
      }));
      setAmenities(temp);
    } catch (err) {
      console.error("Error loading amenities:", err);
    }
  };

  // Check if the user has access to an amenity
  const checkAccess = async (amenityId) => {
    try {
      // Use BrowserProvider and then get a signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        AMENITYACCESS_ADDRESS,
        AMENITYACCESS_ABI,
        signer // use signer instead of provider
      );
      const hasAccess = await contract.hasAccess(amenityId);
      console.log(`Access check for amenity ${amenityId} by ${userAddress}: ${hasAccess}`);
      setAccessStatus((prev) => ({ ...prev, [amenityId]: hasAccess }));
    } catch (err) {
      console.error("Error checking access:", err);
    }
  };  

  // Attempt to access an amenity
  const tryAccessAmenity = async (amenityId) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      AMENITYACCESS_ADDRESS,
      AMENITYACCESS_ABI,
      signer
    );
    try {
      const tx = await contract.accessAmenity(amenityId);
      await tx.wait();
      checkAccess(amenityId); // Check access status after attempting access
    } catch (err) {
      console.error("Error accessing amenity:", err);
    }
  };

  // Add a new amenity (only for the owner)
  const addAmenity = async () => {
    if (!newAmenity) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      AMENITYACCESS_ADDRESS,
      AMENITYACCESS_ABI,
      signer
    );
    try {
      const tx = await contract.addAmenity(newAmenity);
      await tx.wait();
      setNewAmenity("");
      loadAmenities(); // Reload amenities after adding a new one
    } catch (err) {
      console.error("Error adding amenity:", err);
    }
  };

  useEffect(() => {
    loadAmenities();
  }, []);

  return (
    <div className="container mt-4">
      <h2>🏫 Amenity Access</h2>

      {isOwner && (
        <div className="mb-4">
          <h5>Add New Amenity</h5>
          <input
            type="text"
            placeholder="e.g., Library"
            className="form-control mb-2"
            value={newAmenity}
            onChange={(e) => setNewAmenity(e.target.value)}
          />
          <button className="btn btn-primary" onClick={addAmenity}>
            ➕ Add Amenity
          </button>
        </div>
      )}

      <h5 className="mt-4">Available Amenities</h5>
      {amenities.length === 0 ? (
        <p>No amenities added yet.</p>
      ) : (
        <ul className="list-group">
          {amenities.map((a) => (
            <li
              key={a.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <strong>{a.name}</strong> (ID: {a.id})
              </div>
              <div>
                <button
                  className="btn btn-outline-success btn-sm me-2"
                  onClick={() => tryAccessAmenity(a.id)}
                >
                  🚪 Attempt Access
                </button>
                {accessStatus[a.id] !== undefined && (
                  <span
                    className={`badge ${
                      accessStatus[a.id] ? "bg-success" : "bg-danger"
                    }`}
                  >
                    {accessStatus[a.id]
                      ? "Access Granted"
                      : "Access Denied"}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AmenityAccess;
