const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(bodyParser.json());

// Exchange Cronofy authorization code for tokens
app.post("/api/exchange-token", async (req, res) => {
  const { code } = req.body;

  try {
    const tokenResponse = await axios.post(
      `${process.env.REACT_APP_CRONOFY_DATA_CENTER_URL}/oauth/token`,
      {
        client_id: process.env.REACT_APP_CRONOFY_CLIENT_ID,
        client_secret: process.env.REACT_APP_CRONOFY_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.REACT_APP_CRONOFY_REDIRECT_URI,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    res.json(tokenResponse.data);
  } catch (error) {
    console.error("Token Exchange Error:", error.response?.data || error);
    res.status(500).json({ error: "Failed to exchange token" });
  }
});

// Create a new calendar
app.post("/api/create-calendar", async (req, res) => {
  const { accessToken, profileId } = req.body;

  try {
    const calendarResponse = await axios.post(
      `${process.env.REACT_APP_CRONOFY_DATA_CENTER_URL}/v1/calendars`,
      {
        profile_id: profileId,
        name: "My Coaching Calendar",
        color: "#49BED8",
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(calendarResponse.data);
  } catch (error) {
    console.error("Create Calendar Error:", error.response?.data || error);
    res.status(500).json({ error: "Failed to create calendar" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
