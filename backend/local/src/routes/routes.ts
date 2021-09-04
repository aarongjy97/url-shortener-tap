import express from "express";
import { handleCreateURL } from "../util/handleCreateUrl";
import { handleRedirectURL } from "../util/handleRedirectUrl";

const router = express.Router();

router.post("/create-link", async (req, res, next) => {
  try {
    const result = await handleCreateURL(req.body);
    return res.status(200).send({ shortenedURL: result });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

router.get("/:shortenedURL", async (req, res, next) => {
  try {
    const shortenedURL = req.params.shortenedURL;
    const originalURL = await handleRedirectURL({ url: shortenedURL });
    return originalURL ? res.redirect(originalURL) : res.status(404);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

export default router;
