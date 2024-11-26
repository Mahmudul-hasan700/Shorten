import { LinksList } from "@/components/LinksList";

export default function LinksPage() {
  return (
    <div className="max-w-screen-md mx-auto p-5">
      <h1 className="mb-6 text-3xl font-bold">Your Links</h1>
      <LinksList />
    </div>
  );
}
