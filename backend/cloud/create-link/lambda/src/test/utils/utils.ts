import { URLModel } from "../../schema/URL";

export async function deleteURL(shortenedURL: string) : Promise<void> {
    await URLModel.deleteOne({ shortenedURL: shortenedURL }).exec()
}