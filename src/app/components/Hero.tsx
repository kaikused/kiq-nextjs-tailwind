// En: src/app/components/Hero.tsx
export default function Hero() {
  return (
    <section 
      id="inicio" 
      className="relative flex h-[90vh] items-center justify-center bg-cover bg-center text-center" 
      style={{ backgroundImage: "url('/images/montadoresMiniatura-movil.webp')" }}
    >
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      <div className="relative z-10 max-w-2xl px-4 text-superficie">
        <h2 className="font-titulo text-5xl font-bold text-superficie md:text-6xl">
          Montaje de Muebles en Málaga
        </h2>
        <p className="font-especial mt-4 text-3xl text-acento md:text-4xl">
          ¡Olvídate de las instrucciones complicadas!
        </p>
        <a 
          href="/presupuesto" 
          className="mt-8 inline-block rounded-md bg-acento px-6 py-3 font-bold text-primario-oscuro transition-opacity hover:opacity-90"
        >
          Estimar Presupuesto
        </a>
      </div>
    </section>
  );
}