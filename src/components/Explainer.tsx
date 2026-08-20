import { Card } from "@/components/ui/Card";

/* Prose block that gives each secondary page something substantive to be about.
 * The page bodies are mostly live numbers and links, which reads as thin to a
 * crawler and answers none of the questions a first-time visitor arrives with. */
export function Explainer({
  title,
  items,
}: {
  title: string;
  items: readonly { readonly title: string; readonly desc: string }[];
}) {
  return (
    <section className="mt-16">
      <h2 className="font-heading text-2xl font-bold">{title}</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <Card key={item.title}>
            <h3 className="font-heading text-lg font-bold">{item.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
