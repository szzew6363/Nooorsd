export type PipelineItem = {
  id: string;
  source: string;
  sourceColor: string;
  label: string;
  content: string;
  timestamp: string;
};

export type PipelineHistoryEntry = PipelineItem & {
  destination: string | null;
  destinationColor: string | null;
  routedAt: string | null;
};

type Listener = () => void;

let _items: PipelineItem[] = [];
let _history: PipelineHistoryEntry[] = [];
const _listeners = new Set<Listener>();
const _histListeners = new Set<Listener>();

function notify() { _listeners.forEach((fn) => fn()); }
function notifyHistory() { _histListeners.forEach((fn) => fn()); }

export const pipeline = {
  getItems(): PipelineItem[] {
    return [..._items];
  },

  push(item: Omit<PipelineItem, "id" | "timestamp">) {
    const entry: PipelineItem = {
      ...item,
      id: Math.random().toString(36).slice(2, 9),
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
    };
    _items = [entry, ..._items.slice(0, 9)];
    _history = [
      { ...entry, destination: null, destinationColor: null, routedAt: null },
      ..._history.slice(0, 49),
    ];
    notify();
    notifyHistory();
    return entry;
  },

  recordRoute(id: string, destination: string, destinationColor: string) {
    _history = _history.map((h) =>
      h.id === id
        ? { ...h, destination, destinationColor, routedAt: new Date().toLocaleTimeString("en-US", { hour12: false }) }
        : h
    );
    notifyHistory();
  },

  remove(id: string) {
    _items = _items.filter((i) => i.id !== id);
    notify();
  },

  clear() {
    _items = [];
    notify();
  },

  clearHistory() {
    _history = [];
    notifyHistory();
  },

  latest(): PipelineItem | null {
    return _items[0] ?? null;
  },

  getHistory(): PipelineHistoryEntry[] {
    return [..._history];
  },

  subscribe(fn: Listener): () => void {
    _listeners.add(fn);
    return () => { _listeners.delete(fn); };
  },

  subscribeHistory(fn: Listener): () => void {
    _histListeners.add(fn);
    return () => { _histListeners.delete(fn); };
  },
};
