import axios, { AxiosResponse } from "axios";
import { enc, SHA256 } from 'crypto-js';
import moment from "moment";
import { Document } from "mongoose";
import { URL, URLModel } from "../schema/URL";

export async function handleCreateURL(data: any): Promise<string> {

  const customUrl: string = data?.customUrl;

  const url: string = !/^https?:\/\//i.test(data.url)
    ? `http://${data.url}`
    : data.url;

  const endpoint = await axios.get(url);

  if (customUrl && customUrl.length > 0) {
    return await handleCustomURLCreation(url, customUrl, endpoint);
  } else {
    return await handleDefaultURLCreation(url, endpoint);
  }
}

export async function handleCustomURLCreation(url: string, customUrl: string, endpoint: AxiosResponse<any>): Promise<string> {
  const check = await searchExistingURL(customUrl);

  if (!check && endpoint.status === 200) {
    await saveURL(customUrl, url);
    return customUrl;
  } else {
    throw new Error("Custom URL already taken")
  }
}

export async function handleDefaultURLCreation(url: string, endpoint: AxiosResponse<any>): Promise<string> {
  const shortenedURL = generateShortenedURL(url);

  let check = await searchExistingURL(shortenedURL);

  if (check && endpoint.status === 200) {
    /* If the original URL is the same as DB, return shortenedURL */
    if (check.originalURL === url) {
      return shortenedURL;
    } else {
      const deconflictedURL = await deconflictURL(check, url);
      return deconflictedURL;
    }
  } else {
    await saveURL(shortenedURL, url);
    return shortenedURL;
  }
}

export async function deconflictURL(
  check: Document<any, any, URL> & URL,
  url: string
): Promise<string> {
  let concatedURL = url;
  let deconflictShortURL = "";

  while (check && check.originalURL !== url) {
    concatedURL += url;
    deconflictShortURL = generateShortenedURL(concatedURL);
    check = await searchExistingURL(deconflictShortURL);
  }

  if (!check) {
    await saveURL(deconflictShortURL, url);
  }

  return deconflictShortURL;
}

export function generateShortenedURL(url: string): string {
  return enc.Base64.stringify(SHA256('')).substring(0, 8);
}

export async function searchExistingURL(
  shortenedURL: string
): Promise<Document<any, any, URL> & URL> {
  return await URLModel.findOne({ shortenedURL: shortenedURL }).exec();
}

export async function saveURL(shortenedURL: string, originalURL: string): Promise<void> {
  const url: URL = {
    shortenedURL: shortenedURL,
    originalURL: originalURL,
    expiryDate: moment().add(2, "weeks").toDate(),
  };

  const urlModel = new URLModel(url);
  await urlModel.save();
}
