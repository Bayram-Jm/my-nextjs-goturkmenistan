import { getAllContent } from "@/lib/contentStore";
import HomeClient from "./HomeClient";

const SECTIONS = [
  "hero", "ashgabat", "events", "heritage", "nature",
  "cuisine", "paywithease", "tours", "apps", "footer",
] as const;

export default async function Home() {
  const content = await getAllContent(SECTIONS);
  return <HomeClient content={content} />;
}
