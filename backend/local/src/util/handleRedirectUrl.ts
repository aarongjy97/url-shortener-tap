import { Document } from "mongoose";
import { URL, URLModel } from "../schema/URL";

export async function handleRedirectURL(
    data: any
  ): Promise<string> {
    const { url }: { url: string } = data;
    let check = await searchExistingURL(url);
    return check.originalURL;
  }
  
  export async function searchExistingURL(
    shortenedURL: string
  ): Promise<Document<any, any, URL> & URL> {
    return await URLModel.findOne({ shortenedURL: shortenedURL }).exec();
  }