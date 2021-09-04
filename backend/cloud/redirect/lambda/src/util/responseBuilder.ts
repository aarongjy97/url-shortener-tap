import { APIGatewayProxyResult } from "aws-lambda";

export function responseBuilder(
  statusCode: number,
  location?: string
): APIGatewayProxyResult {
  return statusCode === 301
    ? {
        statusCode: statusCode,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
          Location: location,
        },
        body: "",
      }
    : {
        statusCode: statusCode,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
        },
        body: "",
      };
}
