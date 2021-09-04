import { APIGatewayProxyResult } from "aws-lambda";

export function responseBuilder(
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
