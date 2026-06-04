import { usePlanner } from '../context/PlannerContext';
import GuestList from './GuestList';
import { IconChevron } from './icons';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { unseatedGuests } = usePlanner();

  return (
    <aside
      data-unseated-zone
      className={`relative flex shrink-0 flex-col border-r border-mist bg-parchment/60 backdrop-blur-sm transition-[width] duration-300 ${
        collapsed ? 'w-12' : 'w-[300px]'
      }`}
    >
      <button
        onClick={onToggle}
        className="absolute -right-3 top-5 z-10 grid h-6 w-6 place-items-center rounded-full border border-mist bg-cream text-charcoal/50 shadow-card hover:border-[#d4c9bf] hover:text-brass"
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        <IconChevron width={14} height={14} className={collapsed ? 'rotate-180' : ''} />
      </button>

      {collapsed ? (
        <div className="flex flex-1 flex-col items-center gap-3 pt-6">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-ember text-xs font-bold text-cream">
            {unseatedGuests.length}
          </span>
          <span className="mt-1 [writing-mode:vertical-rl] text-[11px] font-semibold uppercase tracking-widest text-charcoal/50">
            Unseated guests
          </span>
        </div>
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden p-4">
          <div className="mb-1 flex items-baseline justify-between">
            <h2 className="font-display text-lg font-normal text-charcoal/80">Unseated</h2>
            <span className="rounded-full bg-ember/10 px-2 py-0.5 text-xs font-semibold text-ember">
              {unseatedGuests.length}
            </span>
          </div>
          <p className="mb-3 text-[11px] text-charcoal/40">
            Drag guests onto a table to seat them.
          </p>
          <div className="min-h-0 flex-1">
            <GuestList
              guests={unseatedGuests}
              emptyHint="Import guests to get started."
            />
          </div>
        </div>
      )}
    </aside>
  );
}
