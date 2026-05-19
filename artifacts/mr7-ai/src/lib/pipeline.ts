export type PipelineItem = {
  id: string;
  source: string;
  sourceColor: string;
  label: string;
  content: string;
  timestamp: string;
};

type Listener = () => void;

let _items: PipelineItem[] = [];
const _listeners = new Set<Listener>();

function notify() {
  _listeners.forEach((fn) => fn());
}

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
    notify();
    return entry;
  },

  remove(id: string) {
    _items = _items.filter((i) => i.id !== id);
    notify();
  },

  clear() {
    _items = [];
    notify();
  },

  latest(): PipelineItem | null {
    return _items[0] ?? null;
  },

  subscribe(fn: Listener): () => void {
    _listeners.add(fn);
    return () => { _listeners.delete(fn); };
  },
};
