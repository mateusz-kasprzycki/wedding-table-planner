import { usePlanner } from '../context/PlannerContext';

function Stat({ label, value, accent }: { label: string; value: number | string; accent?: string }) {
  return (
    <div className="flex min-w-[96px] flex-col rounded-xl border border-mist bg-cream/80 px-4 py-3 shadow-card backdrop-blur-sm">
      <span className={`font-display text-2xl font-normal leading-none ${accent ?? 'text-pine'}`}>
        {value}
      </span>
      <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-charcoal/50">
        {label}
      </span>
    </div>
  );
}

export default function SummaryDashboard() {
  const { state, unseatedGuests } = usePlanner();
  const seated = state.guests.length - unseatedGuests.length;

  return (
    <section className="mx-auto max-w-[1400px] border-b border-mist/60 px-6 py-4">
      <div className="flex flex-wrap items-stretch gap-3">
        <Stat label="Total guests" value={state.guests.length} />
        <Stat label="Seated" value={seated} />
        <Stat
          label="Unseated"
          value={unseatedGuests.length}
          accent={unseatedGuests.length ? 'text-ember' : 'text-pine'}
        />
        <Stat label="Tables" value={state.tables.length} />
      </div>
    </section>
  );
}
