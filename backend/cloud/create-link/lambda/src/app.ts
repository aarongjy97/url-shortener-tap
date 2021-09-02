import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as dotenv from "dotenv";
import md5 from "md5";
import moment from "moment";
import { connect, connection, Document } from "mongoose";
import { URL, URLModel } from "./schema/URL";

dotenv.config();
const MONGODB_CONNECTION_URI = process.env.MONGODB_CONNECTION_URI;

export const lambdaHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {    
    switch (event.httpMethod) {
      case "POST":
        await connect(MONGODB_CONNECTION_URI, { autoCreate: false })
        await connection.close();
        return handleCreateURL(JSON.parse(event.body));
      default:
        return responseBuilder(404, "Method not found");
    }
  } catch (error) {
    console.log(error);
    return responseBuilder(500, error.message);
  }
};

export async function handleCreateURL(data: any): Promise<APIGatewayProxyResult> {

  const { url } : { url: string } = data;
  const shortenedURL = generateShortenedURL(url);

  let check = await searchExistingURL(shortenedURL);

  if (check) {

    /* If the original URL is the same as DB, return shortenedURL */
    if (check.originalURL === url) {
      return responseBuilder(200, JSON.stringify({ shortenedURL: check.shortenedURL }))
    } else {
      const deconflictedURL = await deconflictURL(check, url);
      return responseBuilder(200, JSON.stringify({ shortenedURL: deconflictedURL }));
    }

  } else {

    await saveURL(shortenedURL, url);
    return responseBuilder(200, JSON.stringify({ shortenedURL: shortenedURL }));

  }
  
}

export async function deconflictURL(check: Document<any, any, URL> & URL, url: string): Promise<string>  {
  let concatedURL = url;
  let deconflictShortURL = '';

  while (check && check.originalURL !== url) {
    concatedURL += url;
    deconflictShortURL = generateShortenedURL(concatedURL);
    check = await searchExistingURL(deconflictShortURL)
  }

  if (!check) {
    await saveURL(deconflictShortURL, url);
  } 

  return deconflictShortURL;
}

export function generateShortenedURL(url: string): string {
  return md5(url).substring(0, 6);
}

export async function searchExistingURL(shortenedURL: string): Promise<Document<any, any, URL> & URL> {
  return await URLModel.findOne({ shortenedURL: shortenedURL }).exec();
}

export async function saveURL(shortenedURL: string, originalURL: string) {
  const url: URL = {
    shortenedURL: shortenedURL,
    originalURL: originalURL,
    expiryDate: moment().add(2, 'weeks').toDate()
  }

  const urlModel = new URLModel(url);
  await urlModel.save();
}

function responseBuilder(
  statusCode: number,
  msg: string
): APIGatewayProxyResult {
  return {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers":
      "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
    },
    body: msg,
  };
}
