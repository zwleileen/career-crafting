const fs = require("fs");
const path = require("path");

module.exports = (req, res) => {
  const filePath = path.join(__dirname, "../public/favicon.ico");

  try {
    const fileContent = fs.readFileSync(filePath);
    res.setHeader("Content-Type", "image/x-icon");
    res.send(fileContent);
  } catch (error) {
    console.error("Error serving favicon:", error);
    res.status(404).send("Favicon not found");
  }
};
