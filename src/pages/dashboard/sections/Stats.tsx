const stats = [
  { value: "10,000+", label: "Từ vựng" },
  { value: "2,000+", label: "Kanji" },
  { value: "500+", label: "Bài ngữ pháp" },
  { value: "50,000+", label: "Người đang học" },
];

type Status = {
  value: string;
  label: string;
};

export function Stats() {
  return (
    <section className="border-y border-slate-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          <StatusCard stats={stats} />
        </div>
      </div>
    </section>
  );
}

const StatusCard = ({ stats }: { stats: Status[] }) => {
  return (<>{stats.map((s) => (
    <div key={s.label} className="text-center">
      <div className="bg-gradient-to-r from-rose-600 to-rose-500 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
        {s.value}
      </div>
      <div className="mt-2 text-sm font-medium text-slate-600">{s.label}</div>
    </div>
  ))}</>)
}