import type { Comment } from "../../types/Comment";
import { host } from "./Config";

export class StateChangeResourceRequest {
  resourceName!: string;
  httpVerb!: "PUT" | "POST" | "DELETE";

  constructor(resourceName: string, httpVerb: "PUT" | "POST" | "DELETE") {
    this.resourceName = resourceName;
    this.httpVerb = httpVerb;
  }

  async fetch({ comment_id, text, author, likes, image }: Comment) {
    const requestBody = {
      comment_id,
      text,
      author,
      likes,
      image,
    };

    const data = await fetch(`${host}/${this.resourceName}`, {
      method: this.httpVerb,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })
      .then((data) => data.json())
      .catch((error) => {
        return {
          error: error?.message || "Unknown error",
        };
      });

    return data;
  }
}
