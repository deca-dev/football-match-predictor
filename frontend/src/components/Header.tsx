import { Button } from '@/components/ui/button';

interface HeaderProps {
  onLoginClick: () => void;
}

export function Header({ onLoginClick }: HeaderProps) {
  return (
    <header className="bg-black text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚽</span>
            <span className="text-xl font-bold">Match Predictor</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="hover:text-red-500 transition">Home</a>
            <a href="#" className="hover:text-red-500 transition">Partidos</a>
            <a href="#" className="hover:text-red-500 transition">Predicciones</a>
            <a href="#" className="hover:text-red-500 transition">Estadísticas</a>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-white hover:text-red-500" onClick={onLoginClick}>
              Login
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}