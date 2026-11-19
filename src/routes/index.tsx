import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, LayoutGrid, Tag, Wrench, Mail } from "lucide-react";
import { useState } from "react";
import { subscribeNewsletter } from "@/lib/notify";
import { BrandRow, FrameImage, Screen, SectionTitle } from "@/components/screen";
import { useStudio } from "@/lib/store";
import {
  MAPS_URL,
  PAYMENTS,
  RATING,
  REVIEWS,
  activeServices,
  bayLoad,
  dur,
  hoursLabel,
  minPrice,
  rub,
  startOfWeek,
} from "@/lib/studio";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const data = useStudio();
  const services = activeServices(data);
  const price = minPrice(data);
  const promo = data.promos.find((p) => p.active);
  const load = bayLoad(data, startOfWeek(new Date()));
  const max = Math.max(data.boxes, ...load.map((d) => d.count), 1);
  const hero = data.works[0];
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [newsletterBusy, setNewsletterBusy] = useState(false);

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    setNewsletterMessage("");
    if (!newsletterConsent) { setNewsletterMessage("Для подписки отметьте отдельное согласие на рассылку."); return; }
    setNewsletterBusy(true);
    try { await subscribeNewsletter({ data: { email: newsletterEmail, consent: true } }); setNewsletterMessage("Адрес добавлен в список подписчиков."); setNewsletterEmail(""); setNewsletterConsent(false); }
    catch { setNewsletterMessage("Не удалось сохранить адрес. Проверьте подключение базы данных PostgreSQL."); }
    finally { setNewsletterBusy(false); }
  }

  return (
    <Screen>
      <BrandRow />
      <section className="rise overflow-hidden rounded-card bg-card ring-1 ring-line">
        <div className="relative h-56 overflow-hidden">
          <img
            src={data.hero}
            alt="Иллюстрация автомобиля для KoreaFan Auto"
            className="hero-ken h-full w-full object-cover"
            style={{
              transformOrigin: "center",
              objectPosition: `${50 + data.heroX}% ${50 + data.heroY}%`,
              scale: String(data.heroScale),
            }}
          />
        </div>
        <Link
          to="/book"
          className="flex items-center justify-between px-4 py-4 text-base font-medium"
        >
          Записаться
          <ArrowUpRight className="size-5 text-muted" />
        </Link>
      </section>

      {promo ? (
        <div className="rise mt-3 rounded-pill bg-blue px-4 py-3 text-on-blue">
          <p className="font-semibold">{promo.title}</p>
          <p className="text-sm opacity-90">{promo.text}</p>
        </div>
      ) : null}

      <h1 className="rise mt-6 text-4xl font-bold tracking-tight">{data.brandFull}</h1>
      <p className="rise mt-2 text-lg leading-snug text-muted">{data.tagline}</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <article className="rise rounded-card bg-card px-4 py-4 ring-1 ring-line">
          <div className="flex items-center gap-2 text-3xl font-semibold">
            <Wrench className="size-5 text-muted" />
            {services.length}
          </div>
          <p className="mt-3 text-sm text-dim">{data.cardServiceLabel}</p>
        </article>
        <article className="rise rounded-card bg-card px-4 py-4 ring-1 ring-line">
          <div className="flex items-center gap-2 text-3xl font-semibold">
            <LayoutGrid className="size-5 text-muted" />
            {RATING.score}
          </div>
          <p className="mt-3 text-sm text-dim">рейтинг в Яндекс Картах · {RATING.ratings} оценок</p>
        </article>
      </div>

      <div className="rise mt-3 flex items-center justify-between rounded-pill bg-card px-4 py-4 ring-1 ring-line">
        <div className="flex items-center gap-2 text-xl font-semibold">
          <Tag className="size-5 text-muted" />
          {price > 0 ? `от ${rub(price)}` : "Цена по запросу"}
        </div>
        <span className="text-sm text-dim">{data.cardPriceLabel}</span>
      </div>

      <SectionTitle title="Услуги" action="Все услуги" to="/services" />
      <div className="overflow-hidden rounded-card bg-card ring-1 ring-line">
        {services.map((s, i) => (
          <div key={s.id} className={i ? "border-t border-line" : ""}>
            <div className="flex items-start justify-between gap-3 px-4 pt-4">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="mt-1 text-sm text-dim">{dur(s.minutes)}</p>
              </div>
              <p className="text-right font-semibold">{rub(s.price)}</p>
            </div>
            <div className="flex justify-end px-4 pb-3">
              <Link to="/book" search={{ service: s.id }} className="flex items-center gap-1 text-sm text-muted">
                Выбрать <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="text-2xl font-bold tracking-tight">Неделя боксов</h2>
        <p className="mt-1 text-sm text-muted">Загрузка по записям, потолок — число боксов.</p>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {load.map((d, i) => (
            <div key={d.day.toISOString()} className="rounded-2xl bg-card px-1 py-3 text-center ring-1 ring-line">
              <div className="mx-auto flex h-16 w-3 items-end overflow-hidden rounded-full bg-card-2">
                <div
                  className="bar-in w-full rounded-full bg-blue"
                  style={{ height: `${Math.max(8, (d.count / max) * 100)}%`, animationDelay: `${i * 70}ms` }}
                />
              </div>
              <p className="mt-2 text-xs text-dim">{["Пн", "Вт", "Ср", "Чт", "Пт"][i]}</p>
              <p className="text-sm font-semibold">{d.count}</p>
            </div>
          ))}
        </div>
      </section>

      <SectionTitle title="Работы студии" action="Все" to="/works" />
      {hero ? (
        <Link to="/works" className="block overflow-hidden rounded-card bg-card ring-1 ring-line">
          <FrameImage src={hero.image} alt={hero.title} scale={hero.scale} x={hero.x} y={hero.y} />
          <p className="px-4 py-3 text-sm text-muted">{hero.title}</p>
        </Link>
      ) : null}

      <section className="mt-8">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Отзывы</h2>
          <p className="text-sm text-muted">
            {RATING.score} · {RATING.ratings} оценок
          </p>
        </div>
        <div className="mt-3 space-y-3">
          {REVIEWS.map((r) => (
            <article key={r.name} className="rounded-card bg-card px-4 py-4 ring-1 ring-line">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-medium">{r.name}</p>
                <p className="text-xs text-dim">{r.date}</p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">{r.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-card bg-card p-4 ring-1 ring-line">
        <div className="flex items-center gap-2"><Mail className="size-5 text-blue" /><h2 className="text-xl font-bold">Новости и предложения</h2></div>
        <p className="mt-2 text-sm text-muted">Оставьте почту, чтобы подписаться на новости и специальные предложения KoreaFan Auto.</p>
        <form onSubmit={subscribe} className="mt-3 space-y-3">
          <input type="email" required value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} placeholder="Электронная почта" autoComplete="email" className="w-full rounded-pill bg-card-2 px-4 py-3 ring-1 ring-line outline-none" />
          <label className="flex items-start gap-2 text-xs leading-relaxed text-muted"><input type="checkbox" checked={newsletterConsent} onChange={(e) => setNewsletterConsent(e.target.checked)} className="mt-0.5" />Я отдельно соглашаюсь получать новости и рекламные сообщения на указанную почту. Согласие добровольное, его можно отозвать.</label>
          <p className="text-xs text-dim">Отправляя адрес, вы также подтверждаете ознакомление с <Link to="/legal" className="underline">политикой обработки данных</Link>.</p>
          {newsletterMessage ? <p role="status" className="text-sm text-muted">{newsletterMessage}</p> : null}
          <button disabled={newsletterBusy} className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-blue font-semibold text-on-blue disabled:opacity-60">{newsletterBusy ? "Сохраняем…" : "Подписаться"}</button>
        </form>
      </section>

      <section className="mt-8 rounded-card bg-card px-4 py-4 ring-1 ring-line">
        <p className="text-sm text-dim">{data.district}</p>
        <h2 className="mt-1 text-xl font-bold">{data.address}</h2>
        <p className="mt-2 text-sm text-muted">{hoursLabel(data)}</p>
        <a href={`tel:${data.phone.replace(/[^\d+]/g, "")}`} className="mt-3 block text-lg font-semibold">
          {data.phone}
        </a>
        <div className="mt-3 flex flex-wrap gap-2">
          {PAYMENTS.map((p) => (
            <span key={p} className="rounded-full bg-card-2 px-3 py-1 text-xs text-muted ring-1 ring-line">
              {p}
            </span>
          ))}
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-line">
          <iframe title="KoreaFan Auto на карте" src="https://yandex.ru/map-widget/v1/?ll=30.466641%2C60.012743&z=14&pt=30.466641%2C60.012743%2Cpm2rdm" width="100%" height="210" frameBorder="0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
        <a href={MAPS_URL} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm text-blue">
          Открыть на карте <ArrowUpRight className="size-4" />
        </a>
        <Link to="/admin" className="mt-3 block text-sm text-dim">
          Расписание студии
        </Link>
      </section>
    </Screen>
  );
}

