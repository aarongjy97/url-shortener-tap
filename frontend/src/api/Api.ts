import axios from 'axios';
import * as dotenv from "dotenv";

dotenv.config();

const API_GATEWAY = process.env.REACT_APP_CLOUD_API
// const API_GATEWAY = process.env.REACT_APP_LOCAL_API;

interface URLResponse {
  shortenedUrl: string;
  fullShortenedUrl: string;
}

export async function generateURL(url: string, customUrl: string): Promise<URLResponse> {
  const response = await axios.post(`${API_GATEWAY}/create-link`, {
    url: url,
    customUrl: customUrl
  });
  const shortenedUrl: string = response.data.shortenedURL;
  return {
    shortenedUrl: shortenedUrl,
    fullShortenedUrl: `${API_GATEWAY}/${shortenedUrl}`
  };
}
