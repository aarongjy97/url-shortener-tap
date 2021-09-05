import axios from 'axios';
import * as dotenv from "dotenv";

dotenv.config();

// const API_GATEWAY = process.env.REACT_APP_CLOUD_API
const API_GATEWAY = process.env.REACT_APP_LOCAL_API;

export async function generateURL(url: string): Promise<string> {
  const response = await axios.post(`${API_GATEWAY}/create-link`, {
    url: url
  });
  const shortenedUrl: string = response.data.shortenedURL;
  return `${API_GATEWAY}/${shortenedUrl}`;
}
