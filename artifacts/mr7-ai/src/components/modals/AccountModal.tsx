import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Crown, MessageSquare, Coins, Calendar } from "lucide-react";
import { useStore } from "@/lib/store";

export function AccountModal({
  open,
  onOpenChange,
  onUpgrade,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUpgrade: () => void;
}) {
  const { state } = useStore();
  const totalChats = state.chats.length;
  const totalTokens = state.chats.reduce((acc, c) => acc + c.messages.reduce((a, m) => a + m.content.length, 0), 0);
  const stats = [
    { icon: MessageSquare, label: "Total chats", value: totalChats.toString() },
    { icon: Coins, label: "Tokens used", value: `${(totalTokens / 1000).toFixed(1)}K` },
    { icon: Calendar, label: "Joined", value: "Apr 2026" },
  ];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border w-[96vw] max-w-md">
        <DialogHeader>
          <DialogTitle>Account</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl border border-white/10">
            A
          </div>
          <div>
            <div className="font-bold text-lg leading-tight">Ali Noej</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <span className="px-1.5 py-0.5 rounded-full border border-border bg-background">Free plan</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-background border border-border p-3 text-center">
              <s.icon className="w-4 h-4 mx-auto text-primary mb-1.5" />
              <div className="font-mono text-sm font-bold">{s.value}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
        <button
          onClick={onUpgrade}
          className="w-full py-3 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 flex items-center justify-center gap-2"
        >
          <Crown className="w-4 h-4" /> Upgrade plan
        </button>
      </DialogContent>
    </Dialog>
  );
}
