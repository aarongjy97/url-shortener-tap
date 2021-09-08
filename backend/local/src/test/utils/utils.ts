import { query } from "../../util/db";
export async function deleteURL(shortenedURL: string): Promise<void> {
  await query(
    `delete from url
        where shortenedurl=$1`,
    [shortenedURL]
  );
}