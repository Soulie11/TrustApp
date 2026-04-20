export function FindingList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="finding-list">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
