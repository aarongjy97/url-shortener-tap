import * as dotenv from "dotenv";
import { pool } from '../util/db';
import {
  deconflictURL, generateShortenedURL, handleCreateURLSql, handleCustomURLCreation, saveURL,
  searchExistingURL
} from "../util/handleCreateUrlSql";
import { deleteURL } from './utils/utils';

dotenv.config();

describe("URL Shortener Tests", () => {

  it("Test generation of short URL", () => {
    const hash = "qiGyPICG";
    const url = "http://govtech.com.sg/";
    const shortURL = generateShortenedURL(url);
    expect(hash).toBe(shortURL);
  });

  describe("Test database operations", () => {
    it("Test saving, retriving and deleting record", async () => {
      const url = "http://govtech.com.sg/";
      try {
        /* Save URL */
        await saveURL(generateShortenedURL(url), url);

        /* Retrieve URL */
        const result = await searchExistingURL(generateShortenedURL(url));
        expect(result).not.toBeNull();
        expect(result.originalurl).toBe(url);

        /* Delete URL */
        await deleteURL(generateShortenedURL(url));
        const cleanup = await searchExistingURL(generateShortenedURL(url));
        expect(cleanup).toBeUndefined();
      } catch (error) {
        expect(error).toBeNull();
      } 
    });
  });

  describe("Default generation of url", () => {
    describe("Test deconflicting of url", () => {
      const conflict = "http://govtech.com.sg/conflict";
      const url = "http://govtech.com.sg/";
      const newHash = generateShortenedURL(url + url);

      it("Save hash with different original URL", async () => {
        try {
          /* Using the hash of URL, save conflict */
          await saveURL(generateShortenedURL(url), conflict);

          /* Retrieve URL */
          const result = await searchExistingURL(generateShortenedURL(url));
          expect(result).not.toBeNull();
          expect(result.originalurl).toBe(conflict);
        } catch (error) {
          expect(error).toBeNull();
        }
      });

      it("Test creation of new hash with original URL", async () => {
        try {
          /* Obtain check with hash */
          const check = await searchExistingURL(generateShortenedURL(url));

          /* Generate new deconflicted hash */
          const deconflict = await deconflictURL(check, url);
          expect(deconflict).toBe(newHash);

          /* Retrieve new hash */
          const result = await searchExistingURL(newHash);
          expect(result.originalurl).toBe(url);
        } catch (error) {
          expect(error).toBeNull();
        }
      });

      it("Cleanup deconflict", async () => {
        await deleteURL(newHash);
        await deleteURL(generateShortenedURL(url));
        const conflict = await searchExistingURL(generateShortenedURL(url));
        const deconflict = await searchExistingURL(newHash);
        expect(conflict).toBeUndefined();
        expect(deconflict).toBeUndefined();
      });
    });

    describe("Test deconflicting of url twice", () => {
      const conflict = "http://govtech.com.sg/conflict";
      const url = "http://govtech.com.sg/";
      const newHash1 = generateShortenedURL(url + url);
      const newHash2 = generateShortenedURL(url + url + url);

      it("Save original hash with different original URL", async () => {
        try {
          /* Using the hash of URL, save conflict */
          await saveURL(generateShortenedURL(url), conflict);

          /* Retrieve URL */
          const result = await searchExistingURL(generateShortenedURL(url));
          expect(result).not.toBeNull();
          expect(result.originalurl).toBe(conflict);
        } catch (error) {
          expect(error).toBeNull();
        }
      });

      it("Save hash 1 with different original URL", async () => {
        try {
          /* Using the conflicted hash (newHash1), save conflict */
          await saveURL(newHash1, conflict);

          /* Retrieve URL */
          const result = await searchExistingURL(newHash1);
          expect(result).not.toBeNull();
          expect(result.originalurl).toBe(conflict);
        } catch (error) {
          expect(error).toBeNull();
        }
      });

      it("Test creation of new hash 2 with original URL", async () => {
        try {
          /* Obtain check with hash */
          const check = await searchExistingURL(generateShortenedURL(url));

          /* Generate new deconflicted hash */
          const deconflict = await deconflictURL(check, url);
          expect(deconflict).toBe(newHash2);

          /* Retrieve new hash */
          const result = await searchExistingURL(newHash1);
          expect(result.originalurl).toBe(conflict);
        } catch (error) {
          expect(error).toBeNull();
        }
      });

      it("Cleanup deconflict", async () => {
        await deleteURL(newHash1);
        await deleteURL(newHash2);
        await deleteURL(generateShortenedURL(url));
        const conflict = await searchExistingURL(generateShortenedURL(url));
        const deconflict1 = await searchExistingURL(newHash1);
        const deconflict2 = await searchExistingURL(newHash2);
        expect(conflict).toBeUndefined();
        expect(deconflict1).toBeUndefined();
        expect(deconflict2).toBeUndefined();
      });
    });

    describe("Creating existing URL, with 2 conflicts", () => {
      const conflict = "http://govtech.com.sg/conflict";
      const url = "http://govtech.com.sg/";
      const newHash1 = generateShortenedURL(url + url);
      const newHash2 = generateShortenedURL(url + url + url);

      it("Creation of 2 conflicts and original", async () => {
        try {
          /* Using the hash of URL, save conflict */
          await saveURL(generateShortenedURL(url), conflict);
          await saveURL(newHash1, conflict);
          await saveURL(newHash2, url);

          /* Retrieve URL */
          const conflict1 = await searchExistingURL(generateShortenedURL(url));
          const conflict2 = await searchExistingURL(newHash1);
          const found = await searchExistingURL(newHash2);
          expect(conflict1).not.toBeNull();
          expect(conflict1.originalurl).toBe(conflict);
          expect(conflict2).not.toBeNull();
          expect(conflict2.originalurl).toBe(conflict);
          expect(found).not.toBeNull();
          expect(found.originalurl).toBe(url);
        } catch (error) {
          expect(error).toBeNull();
        }
      });

      it("Test searching for deconflict", async () => {
        try {
          const check = await searchExistingURL(generateShortenedURL(url));
          const deconflict = await deconflictURL(check, url);
          expect(deconflict).toBe(newHash2);
        } catch (error) {
          expect(error).toBeNull();
        }
      });

      it("Cleanup deconflict", async () => {
        await deleteURL(newHash1);
        await deleteURL(newHash2);
        await deleteURL(generateShortenedURL(url));
        const conflict = await searchExistingURL(generateShortenedURL(url));
        const deconflict1 = await searchExistingURL(newHash1);
        const deconflict2 = await searchExistingURL(newHash2);
        expect(conflict).toBeUndefined();
        expect(deconflict1).toBeUndefined();
        expect(deconflict2).toBeUndefined();
      });
    });

    describe("Test entire flow", () => {

      it("Save URL with unresolvable endpoint", async () => {
        try {
          const data = {
            url: "http://a",
            customUrl: ""
          }
          await handleCreateURLSql(data);
        } catch (error) {
          expect(error).toBeDefined();
          expect(error.isAxiosError).toBeTruthy();
        } 
      });

      it("Save URL with resolvable endpoint", async () => {
        try {
          const data = {
            url: 'http://google.com'
          }
          const expected = generateShortenedURL(data.url);

          const result = await handleCreateURLSql(data);
          expect(result).toBe(expected);

          /* Retrieve URL */
          const dbEntry = await searchExistingURL(expected);
          expect(dbEntry).not.toBeNull();
          expect(dbEntry.originalurl).toBe(data.url);
        } catch (error) {
          expect(error).toBeNull();
        }
      })

      it("Cleanup save URL with resolvable endpoint", async () => {
        const expected = generateShortenedURL('http://google.com');
        await deleteURL(expected);
        const result = await searchExistingURL(expected);
        expect(result).toBeUndefined();
      })
    })
  });

  describe("Custom generation of url", () => {

    const url = "http://google.com";
    const customUrl = "ggle";
    const endpointStatus = 200;

    it("Test generation with custom url", async () => {
      try {
        await handleCustomURLCreation(url, customUrl, endpointStatus);
        const result = await searchExistingURL(customUrl);
        expect(result.originalurl).toBe(url);
      } catch (error) {
        expect(error).toBeNull();
      }
    })

    it("Test generation with existing custom url", async () => {
      try {
        await handleCustomURLCreation(url, customUrl, endpointStatus);
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toBe("Custom URL already taken");
      }
    })

    it("Custom URL clean up", async () => {
      await deleteURL(customUrl);
      const result = await searchExistingURL(customUrl);
      expect(result).toBeUndefined();
    })
  });

  afterAll(async () => {
    await pool.end();
  })
});
