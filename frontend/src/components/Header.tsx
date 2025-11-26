import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  onLoginClick?: () => void;
  isLoggedIn?: boolean;
  userName?: string;
}

export function Header({ onLoginClick, isLoggedIn, userName }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

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
            <span
              onClick={() => navigate('/')}
              className={`cursor-pointer hover:text-red-500 transition ${location.pathname === '/' ? 'text-red-500' : ''}`}
            >
              Inicio
            </span>
            {isLoggedIn && (
              <span
                onClick={() => navigate('/dashboard')}
                className={`cursor-pointer hover:text-red-500 transition ${location.pathname === '/dashboard' ? 'text-red-500' : ''}`}
              >
                Dashboard
              </span>
            )}
            <span className="cursor-pointer hover:text-red-500 transition">Partidos</span>
            <span className="cursor-pointer hover:text-red-500 transition">Predicciones</span>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <span className="text-sm text-gray-300">Hola, {userName}</span>
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => navigate('/dashboard')}
                >
                  Mi Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="text-white hover:text-red-500" onClick={onLoginClick}>
                  Login
                </Button>
                <Button className="bg-red-600 hover:bg-red-700" onClick={onLoginClick}>
                  Registro
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}