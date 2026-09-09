'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUI } from '../context/UIContext';
import FooterMinimal from '../components/FooterMinimal';

const pasos = [
  {
    titulo: 'Kiq publica el montaje',
    texto: 'El cliente pide precio. Kiq revisa la ficha y la suelta al tablero. Tú no ves cotizaciones a medias.',
  },
  {
    titulo: 'Aceptas los de tu zona',
    texto: 'Indicas zona y teléfono. Aparecen los montajes que coinciden. Aceptas el que puedas hacer.',
  },
  {
    titulo: 'WhatsApp y cobro fuera',
    texto: 'Escribes al cliente, concreta el día y cobras Bizum o efectivo. Kiq no retiene el dinero.',
  },
];

export default function SoyMontadorPage() {
  const { openRegisterModal, openLoginModal, isLoggedIn, userProfile } = useUI();
  const router = useRouter();

  const yaEsMontador = isLoggedIn && userProfile?.tipo === 'montador';

  const handleStart = () => {
    if (yaEsMontador) {
      router.push('/panel-montador');
      return;
    }
    openRegisterModal('montador');
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-slate-950">
        <Image
          src="/images/montadoresWeb.png"
          alt="Montadores de Kiq"
          fill
          className="object-cover object-center"
          priority
          quality={70}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/80" />

        <div className="relative z-10 mx-auto w-full max-w-3xl px-[clamp(1rem,4vw,2.5rem)] py-28 text-center text-white">
          <p className="text-sm font-medium text-white/70">Para montadores · Málaga y Costa del Sol</p>
          <h1 className="font-titulo mt-4 text-[clamp(1.85rem,6vw,3.5rem)] font-extrabold leading-[1.15] tracking-tight">
            Montajes con precio y zona ya cerrados.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[clamp(1rem,2.4vw,1.2rem)] leading-relaxed text-white/80">
            Kiq filtra cada trabajo. Tú ves los de tu zona, aceptas, hablas por WhatsApp y cobras al terminar. Sin cuotas y sin pagar para entrar.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleStart}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-white px-8 text-base font-semibold text-slate-950 hover:bg-slate-100 sm:w-auto"
            >
              {yaEsMontador ? 'Ir a mi panel' : 'Crear cuenta de montador'}
            </button>
            {!yaEsMontador && (
              <button
                type="button"
                onClick={() => openLoginModal()}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full px-8 text-base font-medium text-white/80 ring-1 ring-white/25 hover:bg-white/10 sm:w-auto"
              >
                Ya tengo cuenta
              </button>
            )}
          </div>

          <p className="mt-6">
            <Link href="/" className="text-sm text-white/55 hover:text-white">
              ¿Buscas montaje para tu casa? Pedir precio
            </Link>
          </p>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="font-titulo text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              Así es el tablero ahora
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              MVP en Málaga: pocos montajes, bien filtrados. Cuando crezca, el mismo flujo sirve para más zona y más gente.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {pasos.map((paso, i) => (
              <article
                key={paso.titulo}
                className="rounded-2xl bg-white p-8 ring-1 ring-slate-200/80 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.18)]"
              >
                <p className="mb-3 text-sm font-semibold tabular-nums text-slate-400">0{i + 1}</p>
                <h3 className="font-titulo mb-3 text-xl font-bold text-slate-900">{paso.titulo}</h3>
                <p className="text-[15px] leading-relaxed text-slate-600">{paso.texto}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-6 py-24">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-titulo text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            Completa zona y teléfono
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-300">
            Sin eso no te llega el WhatsApp del cliente. El cobro sigue siendo Bizum o efectivo, fuera de la app.
          </p>
          <button
            type="button"
            onClick={handleStart}
            className="mt-10 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-white px-8 text-base font-semibold text-slate-950 hover:bg-slate-100 sm:w-auto"
          >
            {yaEsMontador ? 'Ir a mi panel' : 'Crear cuenta de montador'}
          </button>
        </div>
      </section>

      <FooterMinimal />
    </div>
  );
}
