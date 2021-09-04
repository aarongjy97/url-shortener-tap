import { APIGatewayProxyResult } from "aws-lambda";
import { Document } from "mongoose";
import { URL, URLModel } from "./schema/URL";
import { responseBuilder } from './util/responseBuilder';

export async function handleRedirectURL(
    data: any
  ): Promise<APIGatewayProxyResult> {
    const { url }: { url: string } = data;
  
    let check = await searchExistingURL(url);
  
    if (check) {
      return responseBuilder(301, check.originalURL);
    } else {
      return responseBuilder(404);
    }
  }
  
  export async function searchExistingURL(
    shortenedURL: string
  ): Promise<Document<any, any, URL> & URL> {
    return await URLModel.findOne({ shortenedURL: shortenedURL }).exec();
  }