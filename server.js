require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(cors({
  origin: '*',  // Adjust this to allow your specific frontend domain
}));

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// API route to fetch images from a specific subfolder in Cloudinary
app.get("/api/images/:folder", async (req, res) => {
  try {
    const folderPath = `jakedcl/${req.params.folder}`; 
    const { resources } = await cloudinary.search
      .expression(`folder:${folderPath}`)
      .sort_by("public_id", "desc")
      .max_results(30)
      .execute();

    const images = resources.map((file) => ({
      url: file.secure_url,
      public_id: file.public_id,
      tags: file.tags || [],
      metadata: file.context ? file.context.custom : {}, // Fetch custom metadata if available
    }));
    
    res.json({ images });
  } catch (error) {
    console.error("Error fetching images:", error.message);
    res.status(500).send("Error fetching images");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});