import { searchExistingURL } from "./handleCreateUrlSql";

export async function handleRedirectURLSql(data: any): Promise<string> {
  const { url }: { url: string } = data;
  let check = await searchExistingURL(url);
  return check.originalurl;
}