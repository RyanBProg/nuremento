import { NewMemoryForm } from "@/components/NewMemoryForm";

export default function Home() {
  return (
    <section className="mt-10 mb-20 mx-auto rounded-xl border p-6">
      <h2 className="text-xl font-semibold">Log a new memory</h2>
      <p className="mt-2 text-sm">
        Capture the moment while it is still fresh. You can always enrich it
        later with more details and photos.
      </p>
      <div className="mt-6">
        <NewMemoryForm />
      </div>
    </section>
  );
}
