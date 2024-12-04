import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: process.env.DOMAIN!,
      lastModified: new Date(),
    },
  ];
}
