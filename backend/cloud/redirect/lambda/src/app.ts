import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as dotenv from "dotenv";
import { connect, connection } from 'mongoose';
import { handleRedirectURL } from "./handleRedirectUrl";
import { responseBuilder } from './util/responseBuilder';

dotenv.config();
const MONGODB_CONNECTION_URI = process.env.MONGODB_CONNECTION_URI;

export const lambdaHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    await connect(MONGODB_CONNECTION_URI, { autoCreate: false });
    const shortenedURL: string = event.pathParameters.proxy;
    const response = await handleRedirectURL({ url: shortenedURL });
    await connection.close()
    return response;
  } catch (error) {
    console.log(error);
    return responseBuilder(500, error.message);
  }
};
