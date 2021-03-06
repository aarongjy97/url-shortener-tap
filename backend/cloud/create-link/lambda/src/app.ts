import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as dotenv from "dotenv";
import { connect, connection } from "mongoose";
import { handleCreateURL } from "./util/handleCreateUrl";
import { responseBuilder } from "./util/responseBuilder";

dotenv.config();
const MONGODB_CONNECTION_URI = process.env.MONGODB_CONNECTION_URI;

export const lambdaHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log(event);
    console.log(MONGODB_CONNECTION_URI);
    switch (event.httpMethod) {
      case "POST":
        await connect(MONGODB_CONNECTION_URI, { autoCreate: false });
        const response = await handleCreateURL(JSON.parse(event.body));
        await connection.close();
        return response;
      default:
        return responseBuilder(404, "Method not found");
    }
  } catch (error) {
    console.log(error);
    return error.isAxiosError
      ? responseBuilder(500, "Invalid URL")
      : error.message
      ? responseBuilder(500, error.message)
      : responseBuilder(500, "Unexpected Error");
  }
};
