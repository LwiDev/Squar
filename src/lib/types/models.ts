import type { ObjectId } from "mongodb";

export type BlockType =
  | "text"
  | "link"
  | "image"
  | "video"
  | "embed"
  | "divider"
  | "heading";

export interface Block {
  id: string;
  type: BlockType;
  x: number;
  y: number;
  w: number;
  h: number;
  data: Record<string, any>;
}

export interface PageSettings {
  title: string;
  description?: string;
  theme: "light" | "cream" | "dark" | "slate" | "midnight";
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };
  profilePhoto?: {
    url?: string;
    filename?: string;
    position: "left" | "center" | "right";
    size: "small" | "medium" | "large";
    shape: "circle" | "square" | "rounded";
    visibility: "photo" | "letter" | "hidden";
    layout?: "vertical" | "horizontal-left" | "horizontal-right";
  };
  titleSize?: "small" | "medium" | "large";
}

export interface Page {
  _id?: ObjectId;
  id: string;
  userId: string;
  slug: string;
  settings: PageSettings;
  layout: Block[];
  published: boolean;
  updatedAt: Date;
  createdAt: Date;
}

export interface User {
  _id?: ObjectId;
  id: string;
  email: string;
  createdAt: Date;
}
