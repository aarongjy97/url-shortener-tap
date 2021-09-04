import { APIGatewayProxyResult } from "aws-lambda";
import md5 from "md5";
import moment from "moment";
import { Document } from "mongoose";
import { URL, URLModel } from "../schema/URL";
import { responseBuilder } from './responseBuilder';

export async function handleCreateURL(
    data: any
  ): Promise<APIGatewayProxyResult> {
    const { url }: { url: string } = data;
    const shortenedURL = generateShortenedURL(url);
  
    let check = await searchExistingURL(shortenedURL);
  
    if (check) {
      /* If the original URL is the same as DB, return shortenedURL */
      if (check.originalURL === url) {
        return responseBuilder(
          200,
          JSON.stringify({ shortenedURL: check.shortenedURL })
        );
      } else {
        const deconflictedURL = await deconflictURL(check, url);
        return responseBuilder(
          200,
          JSON.stringify({ shortenedURL: deconflictedURL })
        );
      }
    } else {
      await saveURL(shortenedURL, url);
      return responseBuilder(200, JSON.stringify({ shortenedURL: shortenedURL }));
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