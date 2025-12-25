// import dotenv from "dotenv";
// dotenv.config();
import axios from "axios";

// Lấy access token
export const getPayPalAccessToken = async () => {
  console.log("CLIENT_ID:", process.env.PAYPAL_CLIENT_ID);
  console.log("SECRET:", process.env.PAYPAL_SECRET);
  // console.log("accessToken:", accessToken);
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
  ).toString("base64");

  const response = await axios.post(
    "https://api-m.sandbox.paypal.com/v1/oauth2/token",
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data.access_token;
};
