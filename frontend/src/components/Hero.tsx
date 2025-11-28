import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const slides = [
  {
    title: "Predicciones de Partidos con IA",
    description:
      "Obtén predicciones inteligentes basadas en el rendimiento de los equipos, las condiciones climáticas y datos históricos.",
    icon: "🤖",
  },
  {
    title: "Análisis Meteorológico en Tiempo Real",
    description:
      "Descubre cómo las condiciones del clima como viento, lluvia y temperatura pueden afectar los resultados del partido.",
    icon: "🌤️",
  },
  {
    title: "Cobertura de La Liga y la MLS",
    description:
      "Cobertura completa de la Liga Española y la MLS estadounidense con actualizaciones en vivo.",
    icon: "⚽",
  },
  {
    title: "Estadísticas Detalladas del Partido",
    description:
      "Accede a estadísticas completas, alineaciones y registros cara a cara de cada partido.",
    icon: "📊",
  },
];

function AnimatedCounter({
  target,
  suffix = "",
  duration = 2000,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

export function Hero() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative bg-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Carousel Content */}
          <div className="flex-1 space-y-6">
            <div className="min-h-[200px]">
              <div className="text-6xl mb-4">{slides[currentSlide].icon}</div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                <span className="text-red-500">
                  {slides[currentSlide].title}
                </span>
              </h1>
              <p className="text-lg text-gray-300 max-w-lg mt-4">
                {slides[currentSlide].description}
              </p>
            </div>

            {/* Carousel Dots */}
            <div className="flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    currentSlide === index
                      ? "bg-red-500 w-8"
                      : "bg-gray-600 hover:bg-gray-500"
                  }`}
                />
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 z-10"
                onClick={() => navigate("/partidos")}
              >
                Ver Partidos
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-black border-white text-white hover:bg-gray-900 hover:text-white z-10"
                onClick={() => navigate("/partidos")}
              >
                Más Info
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="flex-1 grid grid-cols-2 gap-4 max-w-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-red-500">
                <AnimatedCounter target={500} suffix="+" />
              </p>
              <p className="text-sm text-gray-300">Partidos Analizados</p>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-red-500">
                <AnimatedCounter target={95} suffix="%" />
              </p>
              <p className="text-sm text-gray-300">Tasa de Precisión</p>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-red-500">
                <AnimatedCounter target={2} duration={1000} />
              </p>
              <p className="text-sm text-gray-300">Ligas</p>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-red-500">24/7</p>
              <p className="text-sm text-gray-300">Actualizaciones en vivo</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="#f3f4f6"
          />
        </svg>
      </div>
    </section>
  );
}
