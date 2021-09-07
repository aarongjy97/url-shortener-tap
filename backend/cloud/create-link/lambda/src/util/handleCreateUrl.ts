import { APIGatewayProxyResult } from "aws-lambda";
import axios from "axios";
import md5 from "md5";
import moment from "moment";
import { Document } from "mongoose";
import { URL, URLModel } from "../schema/URL";
import { responseBuilder } from "./responseBuilder";

export async function handleCreateURL(
  data: any
): Promise<APIGatewayProxyResult> {
  const customUrl: string = data?.customUrl;

  const url: string = !/^https?:\/\//i.test(data.url)
    ? `http://${data.url}`
    : data.url;

  const endpoint = await axios.get(url);

  const shortenedURL =
    customUrl && customUrl.length > 0
      ? await handleCustomURLCreation(url, customUrl, endpoint.status)
      : await handleDefaultURLCreation(url, endpoint.status);

  return responseBuilder(200, JSON.stringify({ shortenedURL: shortenedURL }));
}

export async function handleCustomURLCreation(
  url: string,
  customUrl: string,
  endpointStatus: number
): Promise<string> {
  const check = await searchExistingURL(customUrl);

  if (!check && endpointStatus === 200) {
    await saveURL(customUrl, url);
    return customUrl;
  } else {
    throw new Error("Custom URL already taken");
  }
}

export async function handleDefaultURLCreation(
  url: string,
  endpointStatus: number
): Promise<string> {
  const shortenedURL = generateShortenedURL(url);

  let check = await searchExistingURL(shortenedURL);

  if (check && endpointStatus === 200) {
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
  return md5(url).substring(0, 6);
}

export async function searchExistingURL(
  shortenedURL: string
): Promise<Document<any, any, URL> & URL> {
  return await URLModel.findOne({ shortenedURL: shortenedURL }).exec();
}

export async function saveURL(shortenedURL: string, originalURL: string) {
  const url: URL = {
    shortenedURL: shortenedURL,
    originalURL: originalURL,
    expiryDate: moment().add(2, "weeks").toDate(),
  };

  const urlModel = new URLModel(url);
  await urlModel.save();
}
