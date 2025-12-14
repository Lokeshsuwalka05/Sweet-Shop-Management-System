const { connectDB } = require("./config/Database");
const { app } = require("./app");
require("dotenv").config();
// Use conventional uppercase PORT, fallback to 3000
const port = Number(process.env.port) || 3000;
connectDB()
  .then(() => {
    console.log("Database connection established....");
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((e) => console.log(e));
