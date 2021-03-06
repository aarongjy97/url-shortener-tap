import * as dotenv from "dotenv";
import { connect, connection } from "mongoose";
import {
  deconflictURL,
  generateShortenedURL, handleCreateURL, handleCustomURLCreation, saveURL,
  searchExistingURL
} from "../util/handleCreateUrl";
import { deleteURL } from "./utils/utils";

dotenv.config();
const MONGODB_CONNECTION_URI = process.env.MONGODB_CONNECTION_URI;

describe("URL Shortener Tests", () => {
  it("Test connection to database", async () => {
    try {
      await connect(MONGODB_CONNECTION_URI, { autoCreate: false });
    } catch (error) {
      expect(error).toBeNull();
    }

    await connection.close();
  });

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
        await connect(MONGODB_CONNECTION_URI, { autoCreate: false });

        /* Save URL */
        await saveURL(generateShortenedURL(url), url);

        /* Retrieve URL */
        const result = await searchExistingURL(generateShortenedURL(url));
        expect(result).not.toBeNull();
        expect(result.originalURL).toBe(url);

        /* Delete URL */
        await deleteURL(generateShortenedURL(url));
        const cleanup = await searchExistingURL(generateShortenedURL(url));
        expect(cleanup).toBeNull();
      } catch (error) {
        expect(error).toBeNull();
      } finally {
        await connection.close();
      }
    });
  });

  describe("Default generation of url", () => {
    describe("Test deconflicting of url", () => {
      const conflict = "http://govtech.com.sg/conflict";
      const url = "http://govtech.com.sg/";
      const newHash = generateShortenedURL(url + url);

      beforeAll(async () => {
        await connect(MONGODB_CONNECTION_URI, { autoCreate: false });
      });

      it("Save hash with different original URL", async () => {
        try {
          /* Using the hash of URL, save conflict */
          await saveURL(generateShortenedURL(url), conflict);

          /* Retrieve URL */
          const result = await searchExistingURL(generateShortenedURL(url));
          expect(result).not.toBeNull();
          expect(result.originalURL).toBe(conflict);
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
          expect(result.originalURL).toBe(url);
        } catch (error) {
          expect(error).toBeNull();
        }
      });

      it("Cleanup deconflict", async () => {
        await deleteURL(newHash);
        await deleteURL(generateShortenedURL(url));
        const conflict = await searchExistingURL(generateShortenedURL(url));
        const deconflict = await searchExistingURL(newHash);
        expect(conflict).toBeNull();
        expect(deconflict).toBeNull();
      });
    });

    describe("Test deconflicting of url twice", () => {
      const conflict = "http://govtech.com.sg/conflict";
      const url = "http://govtech.com.sg/";
      const newHash1 = generateShortenedURL(url + url);
      const newHash2 = generateShortenedURL(url + url + url);

      beforeAll(async () => {
        await connect(MONGODB_CONNECTION_URI, { autoCreate: false });
      });

      it("Save original hash with different original URL", async () => {
        try {
          /* Using the hash of URL, save conflict */
          await saveURL(generateShortenedURL(url), conflict);

          /* Retrieve URL */
          const result = await searchExistingURL(generateShortenedURL(url));
          expect(result).not.toBeNull();
          expect(result.originalURL).toBe(conflict);
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
          expect(result.originalURL).toBe(conflict);
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
          expect(result.originalURL).toBe(conflict);
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
        expect(conflict).toBeNull();
        expect(deconflict1).toBeNull();
        expect(deconflict2).toBeNull();
      });
    });

    describe("Creating existing URL, with 2 conflicts", () => {
      const conflict = "http://govtech.com.sg/conflict";
      const url = "http://govtech.com.sg/";
      const newHash1 = generateShortenedURL(url + url);
      const newHash2 = generateShortenedURL(url + url + url);

      beforeAll(async () => {
        await connect(MONGODB_CONNECTION_URI, { autoCreate: false });
      });

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
          expect(conflict1.originalURL).toBe(conflict);
          expect(conflict2).not.toBeNull();
          expect(conflict2.originalURL).toBe(conflict);
          expect(found).not.toBeNull();
          expect(found.originalURL).toBe(url);
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
        expect(conflict).toBeNull();
        expect(deconflict1).toBeNull();
        expect(deconflict2).toBeNull();
      });
    });

    describe("Test entire flow", () => {

      it("Save URL with unresolvable endpoint", async () => {
        try {
          const data = {
            url: "http://a",
            customUrl: ""
          }
          await handleCreateURL(data);
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

          const result = await handleCreateURL(data);
          const shortenedURL = JSON.parse(result.body).shortenedURL;
          expect(shortenedURL).toBe(expected);

          /* Retrieve URL */
          const dbEntry = await searchExistingURL(expected);
          expect(dbEntry).not.toBeNull();
          expect(dbEntry.originalURL).toBe(data.url);
        } catch (error) {
          expect(error).toBeNull();
        }
      })

      it("Cleanup save URL with resolvable endpoint", async () => {
        const expected = generateShortenedURL('http://google.com');
        await deleteURL(expected);
        const result = await searchExistingURL(expected);
        expect(result).toBeNull();
      })
    })
  });

  describe("Custom generation of url", () => {

    const url = "http://google.com";
    const customUrl = "ggle";
    const endpointStatus = 200;

    beforeAll(async () => {
      await connect(MONGODB_CONNECTION_URI, { autoCreate: false });
    });

    it("Test generation with custom url", async () => {
      try {
        await handleCustomURLCreation(url, customUrl, endpointStatus);
        const result = await searchExistingURL(customUrl);
        expect(result.originalURL).toBe(url);
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
      expect(result).toBeNull();
    })
  });

  afterAll(async () => {
    await connection.close();
  });
});
