import { useEffect } from "react";

interface Props {
  title?: string;
  content?: string;
  imageURL?: string;
  postId?: string;
}

export const StoryMetaTags = ({ title, content, imageURL, postId }: Props) => {
  const description = (content || "").slice(0, 150);
  const siteTitle = title || "Story Spark AI";
  const image = imageURL || `${window.location.origin}/og-image.jpg`;
  const url = postId
    ? `${window.location.origin}/post/${postId}`
    : window.location.href;

  useEffect(() => {
    const previousTitle = document.title;
    document.title = siteTitle;

    const upsertMeta = (
      selector: string,
      attrs: Record<string, string>,
      contentValue: string
    ) => {
      let tag = document.head.querySelector<HTMLMetaElement>(selector);
      if (!tag) {
        tag = document.createElement("meta");
        Object.entries(attrs).forEach(([key, value]) => tag?.setAttribute(key, value));
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", contentValue);
    };

    upsertMeta('meta[property="og:title"]', { property: "og:title" }, siteTitle);
    upsertMeta(
      'meta[property="og:description"]',
      { property: "og:description" },
      description
    );
    upsertMeta('meta[property="og:image"]', { property: "og:image" }, image);
    upsertMeta('meta[property="og:url"]', { property: "og:url" }, url);
    upsertMeta('meta[property="og:type"]', { property: "og:type" }, "article");
    upsertMeta("meta[name=\"twitter:card\"]", { name: "twitter:card" }, "summary_large_image");
    upsertMeta("meta[name=\"twitter:title\"]", { name: "twitter:title" }, siteTitle);
    upsertMeta(
      "meta[name=\"twitter:description\"]",
      { name: "twitter:description" },
      description
    );
    upsertMeta("meta[name=\"twitter:image\"]", { name: "twitter:image" }, image);

    return () => {
      document.title = previousTitle;
    };
  }, [description, image, siteTitle, url]);

  return null;
};
