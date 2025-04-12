require('dotenv').config();

const express = require("express");
const multer = require("multer");
const FormData = require("form-data");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const cors = require("cors"); // ✅ CORS imported

const app = express();
app.use(cors()); 

// Multer setup to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      console.error("No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Log the file details to ensure it's being received correctly
    console.log("Received file:", req.file);

    // Create a new FormData object
    const formData = new FormData();
    
    // Append file buffer to FormData
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";

    const pinataApiKey = process.env.PINATA_API_KEY; // Add your Pinata API key here
    const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY; // Add your Pinata secret API key here

    // Log the API keys for debugging (only in a secure environment)
    console.log("Using Pinata API key:", pinataApiKey);

    // Send the form data to Pinata
    const response = await axios.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretApiKey,
        ...formData.getHeaders(), // Necessary to include the correct headers for FormData
      },
    });

    console.log("Pinata response:", response.data);

    // Return the IPFS hash of the uploaded file
    res.json({ IpfsHash: response.data.IpfsHash });
  } catch (err) {
    console.error("Error uploading to Pinata:", err);
    res.status(500).json({ error: "Failed to upload to IPFS" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
