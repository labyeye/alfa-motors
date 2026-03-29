require("dotenv").config({ path: "./alfa-dashboard/backend/.env" });
const axios = require("axios");
const jwt = require("jsonwebtoken");

async function testDashboard() {
  try {
    const userId = 1; // Assuming admin user ID is 1
    const token = jwt.sign(
      { id: userId, role: "admin" },
      process.env.JWT_SECRET,
    );

    // Test the dashboard API directly
    const response = await axios.get(
      "https://alfa-motors-9bk6.vercel.app/api/dashboard",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log(
      "Dashboard Data:",
      JSON.stringify(response.data.data.carStats, null, 2),
    );
    process.exit(0);
  } catch (err) {
    console.error("API Test Error:", err.message);
    if (err.response) {
      console.error("Response Data:", err.response.data);
    }
    process.exit(1);
  }
}

testDashboard();
