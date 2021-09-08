import axios from "axios";
import md5 from "md5";
import moment from "moment";
import { query, transact } from "./db";

interface URLSchema {
  shortenedurl: string;
  originalurl: string;
  expirydate: Date;
}

export async function handleCreateURLSql(data: any): Promise<string> {
  const customUrl: string = data?.customUrl;

  const url: string = !/^https?:\/\//i.test(data.url)
    ? `http://${data.url}`
    : data.url;

  const endpoint = await axios.get(url);

  if (customUrl && customUrl.length > 0) {
    return await handleCustomURLCreation(url, customUrl, endpoint.status);
  } else {
    return await handleDefaultURLCreation(url, endpoint.status);
  }
}

export async function handleCustomURLCreation(
  url: string,
  customUrl: string,
  endpointStatus: number
): Promise<string> {
  const check = await searchExistingURL(customUrl);

  if (!check && endpointStatus === 200) {
    await saveURL(customUrl, url);
    return customUrl;
  } else {
    throw new Error("Custom URL already taken");
  }
}

export async function handleDefaultURLCreation(
  url: string,
  endpointStatus: number
): Promise<string> {
  const shortenedURL = generateShortenedURL(url);

  let check = await searchExistingURL(shortenedURL);

    if (check && endpointStatus === 200) {
      /* If the original URL is the same as DB, return shortenedURL */
      if (check.originalurl === url) {
        return shortenedURL;
      } else {
        const deconflictedURL = await deconflictURL(check, url);
        return deconflictedURL;
      }
    } else {
      await saveURL(shortenedURL, url);
      return shortenedURL;
    }
}

export async function deconflictURL(check: URLSchema, url: string): Promise<string> {
  let concatedURL = url;
  let deconflictShortURL = "";

  while (check && check.originalurl !== url) {
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

export async function searchExistingURL(shortenedURL: string): Promise<URLSchema> {
  const result: any = await query(`select * from URL where shortenedURL=$1`, [
    shortenedURL,
  ]);
  return result ? result.rows[0] : undefined;
}

export async function saveURL(
  shortenedURL: string,
  originalURL: string
): Promise<void> {
  await transact(async () => {
    await query(
      `insert into URL (shortenedURL, originalURL, expiryDate) values
            ($1, $2, $3)
            `,
      [shortenedURL, originalURL, moment().add(2, "weeks").toDate()]
    );
  });
}
