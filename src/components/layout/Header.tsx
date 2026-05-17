
export default function Header({ title }: { title: string }) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
    </header>
  );
}
