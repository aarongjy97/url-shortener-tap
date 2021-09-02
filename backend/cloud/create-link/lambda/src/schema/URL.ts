import { model, Schema, set } from "mongoose";

export interface URL {
  shortenedURL: string;
  originalURL: string;
  expiryDate: Date;
}

const URLSchema = new Schema<URL>(
  {
    shortenedURL: { type: String, required: true, unique: true, index: true },
    originalURL: { type: String, required: true },
    expiryDate: { type: Date, required: true },
  },
  { timestamps: true }
);

set('autoIndex', true);
export const URLModel = model<URL>("URL", URLSchema);