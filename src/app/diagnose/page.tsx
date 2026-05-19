import Link from "next/link";
import DiagnoseChat from "./DiagnoseChat";

export default function DiagnosePage() {
  return (
    <main className="flex-1 flex flex-col">
      <header className="bg-gradient-to-r from-[#10B981] to-[#34D399] text-white px-6 py-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-white/70 hover:text-white">
            ← 戻る
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-3xl">🛡</span>
            <h1 className="text-2xl font-bold">LP診断 AI対話</h1>
          </div>
        </div>
      </header>

      <section className="flex-1 flex flex-col bg-[#F9FAFB]">
        <DiagnoseChat />
      </section>
    </main>
  );
}
