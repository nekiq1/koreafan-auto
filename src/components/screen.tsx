import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MessageCircle, Send, UserRound, X } from "lucide-react";
import { useState } from "react";
import { sendNotify } from "@/lib/notify";
import { useRehydrate, useStudio } from "@/lib/store";

export function Screen({
  children,
  tone = "blue",
}: {
  children: React.ReactNode;
  tone?: "blue" | "orange";
}) {
  useRehydrate();
  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-md px-4 pt-3 pb-28">
      {children}
      <SiteFooter />
      <ChatFab tone={tone} />
    </div>
  );
}

export function BrandRow() {
  const short = useStudio((s) => s.brandShort);
  const logo = useStudio((s) => s.logoImage);
  return (
    <div className="mb-4 flex items-center gap-3">
      <Link to="/" className="flex min-w-0 flex-1 items-center gap-3">
        {logo ? (
          <img src={logo} alt="" className="size-12 rounded-2xl object-cover ring-1 ring-line" />
        ) : (
          <img src="/favicon.svg" alt="" className="size-12 rounded-2xl ring-1 ring-line" />
        )}
        <span className="truncate text-lg font-semibold tracking-tight">{short}</span>
      </Link>
      <Link
        to="/mine"
        aria-label="Профиль и записи"
        className="grid size-11 place-items-center rounded-full bg-card text-fg ring-1 ring-line"
      >
        <UserRound className="size-5" />
      </Link>
    </div>
  );
}

export function SectionTitle({
  title,
  action,
  to,
}: {
  title: string;
  action?: string;
  to?: "/services" | "/works";
}) {
  return (
    <div className="mt-8 mb-3 flex items-end justify-between gap-3">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      {action && to ? (
        <Link to={to} className="mb-1 flex items-center gap-1 text-sm text-muted">
          {action} <ArrowUpRight className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}

export function FrameImage({
  src,
  alt,
  scale,
  x,
  y,
}: {
  src: string;
  alt: string;
  scale: number;
  x: number;
  y: number;
}) {
  return (
    <div className="h-52 overflow-hidden">
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        style={{ transform: `translate(${x}px, ${y}px) scale(${scale})`, transformOrigin: "center" }}
      />
    </div>
  );
}

function ChatFab({ tone }: { tone: "blue" | "orange" }) {
  const [open, setOpen] = useState(false);
  const studio = useStudio();
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [personalConsent, setPersonalConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const glow = tone === "orange" ? "var(--color-orange)" : "var(--color-blue)";
  const btn = tone === "orange" ? "bg-orange text-on-orange" : "bg-blue text-on-blue";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    if (!personalConsent) { setNote("Подтвердите согласие на обработку персональных данных."); return; }
    setBusy(true);
    setNote("");
    try {
      const res = await sendNotify({
        data: {
          kind: "message",
          title: "KoreaFan Auto — сообщение с витрины",
          lines: [`Имя: ${name || "—"}`, `Телефон: ${phone || "—"}`, text.trim()],
        },
      });
      setNote(
        res.delivered
          ? "Ушло в выбранный канал."
          : "Канал не настроен: NOTIFY_CHANNEL, токен и chat/peer в окружении сервера.",
      );
      if (res.delivered) setText("");
    } catch {
      setNote("Не удалось отправить. Напишите в Telegram или VK.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Написать в студию"
        onClick={() => setOpen(true)}
        style={{ ["--glow" as string]: glow }}
        className={`fab-glow fab-pos grid size-14 place-items-center rounded-full ${btn}`}
      >
        <MessageCircle className="size-7" />
      </button>
      {open ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-bg/70 px-3 pb-3">
          <div className="w-full max-w-md rounded-card bg-card-2 p-4 ring-1 ring-line">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Написать в студию</h2>
              <button
                type="button"
                aria-label="Закрыть"
                onClick={() => setOpen(false)}
                className="grid size-10 place-items-center rounded-full bg-card"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="mb-3 grid grid-cols-3 gap-2 text-sm">
              <a className="rounded-pill bg-card px-2 py-3 text-center ring-1 ring-line" href={studio.telegram} target="_blank" rel="noreferrer">
                Telegram
              </a>
              <a className="rounded-pill bg-card px-2 py-3 text-center ring-1 ring-line" href={studio.vk} target="_blank" rel="noreferrer">
                VK
              </a>
              <a className="rounded-pill bg-card px-2 py-3 text-center ring-1 ring-line" href={studio.whatsapp} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            </div>
            <form onSubmit={submit} className="space-y-2">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя" className="w-full rounded-pill bg-card px-4 py-3 ring-1 ring-line outline-none" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Телефон" className="w-full rounded-pill bg-card px-4 py-3 ring-1 ring-line outline-none" />
              <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Вопрос по Hyundai, Kia или записи" rows={3} className="w-full resize-none rounded-card bg-card px-4 py-3 ring-1 ring-line outline-none" />
              <label className="flex items-start gap-2 text-xs leading-relaxed text-muted"><input type="checkbox" checked={personalConsent} onChange={(e) => setPersonalConsent(e.target.checked)} className="mt-0.5" />Согласен на обработку данных для ответа на обращение. <Link to="/legal" className="underline">Политика</Link>.</label>
              {note ? <p className="text-sm text-muted">{note}</p> : null}
              <button type="submit" disabled={busy} className={`flex h-12 w-full items-center justify-center gap-2 rounded-full font-semibold ${btn} disabled:opacity-60`}>
                <Send className="size-4" />
                {busy ? "Отправляем" : "Отправить"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}


function SiteFooter() {
  const studio = useStudio();
  return (
    <footer className="mt-10 border-t border-line pt-5 text-sm text-muted">
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold text-fg">{studio.brandFull}</span>
        <a href={studio.vk || "https://vk.com/koreafanauto"} target="_blank" rel="noreferrer" className="rounded-full bg-card px-3 py-2 ring-1 ring-line">ВКонтакте ↗</a>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        <Link to="/mine">Профиль и записи</Link>
        <Link to="/legal">Документы и политика</Link>
        <Link to="/admin">Вход для администратора</Link>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-dim">© {new Date().getFullYear()} {studio.brandFull}. Информация об услугах и стоимости уточняется при обращении.</p>
    </footer>
  );
}
