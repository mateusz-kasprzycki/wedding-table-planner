import { useState } from 'react';
import { DndContext, DragOverlay, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { usePlanner } from './context/PlannerContext';
import Header from './components/Header';
import SummaryDashboard from './components/SummaryDashboard';
import Sidebar from './components/Sidebar';
import RoomCanvas from './components/RoomCanvas';
import ImportModal from './components/ImportModal';
import RestoreModal from './components/RestoreModal';

function AppInner() {
  const { state, assignGuest } = usePlanner();
  const [importOpen, setImportOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeGuestId, setActiveGuestId] = useState<string | null>(null);

  const activeGuest = activeGuestId ? state.guests.find((g) => g.id === activeGuestId) : null;

  function handleDragStart(e: DragStartEvent) {
    setActiveGuestId(String(e.active.id));
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveGuestId(null);
    if (e.over) {
      assignGuest(String(e.active.id), String(e.over.id));
    }
  }

  const initials =
    activeGuest?.name
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0].toUpperCase())
      .slice(0, 2)
      .join('') ?? '';

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-screen flex-col">
        <Header onImportClick={() => setImportOpen(true)} onRestoreClick={() => setRestoreOpen(true)} />
        <SummaryDashboard />

        <main className="mx-auto flex min-h-0 w-full max-w-[1400px] flex-1 gap-0 overflow-hidden px-0 pb-0 sm:px-5">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((c) => !c)}
          />
          <section className="min-w-0 flex-1 overflow-hidden p-5">
            <RoomCanvas />
          </section>
        </main>

        <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
        <RestoreModal open={restoreOpen} onClose={() => setRestoreOpen(false)} />
      </div>

      <DragOverlay>
        {activeGuest && (
          <div className="rounded-full bg-brass px-3 py-1.5 text-xs font-semibold text-cream shadow-lift">
            {initials || activeGuest.name}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

export default function App() {
  return <AppInner />;
}
