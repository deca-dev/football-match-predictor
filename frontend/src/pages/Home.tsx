import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { MatchCard } from "../components/MatchCard";
import { MatchDetail } from "../components/MatchDetail";
import { LoginModal } from "../components/LoginModal";
import { useMatchStore } from "../store/matchStore";
import { useAuthStore } from "../store/authStore";

export function Home() {
  const {
    matches,
    loading,
    error,
    league,
    setLeague,
    fetchMatches,
    selectMatch,
    selectedMatch,
  } = useMatchStore();
  const { user, loadFromStorage, logout } = useAuthStore();
  const [showLogin, setShowLogin] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    fetchMatches();
    loadFromStorage();
  }, []);

  const handleLogin = () => {
    setShowLogin(false);
    setShowWelcome(true);
    setTimeout(() => setShowWelcome(false), 3000);
  };

  const handleRegister = () => {
    setShowLogin(false);
    setShowWelcome(true);
    setTimeout(() => setShowWelcome(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header
        onLoginClick={() => setShowLogin(true)}
        isLoggedIn={!!user}
        userName={user?.name || ""}
        onLogout={logout}
      />

      {/* Hero Section */}
      <Hero />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Message */}
        {showWelcome && user && (
          <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-6 border border-green-200 animate-pulse">
            Welcome, <strong>{user.name}</strong>! 🎉
          </div>
        )}

        {/* Section Title */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Coming up matches
          </h2>
        </div>

        {/* League Tabs */}
        <Tabs value={league} className="mb-6">
          <TabsList>
            <TabsTrigger value="spanish" onClick={() => setLeague("spanish")}>
              🇪🇸 La Liga
            </TabsTrigger>
            <TabsTrigger value="mls" onClick={() => setLeague("mls")}>
              🇺🇸 MLS
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Error State */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
            Error: {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        )}

        {/* Matches Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onClick={() => selectMatch(match)}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && matches.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No matches found
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            MatchPredictor.mx is operated under the permits of David S.A. de
            C.V., a company registered in Mexico and authorized and regulated by
            the Ministry of the Interior – Directorate of Games and Draws –
            United Mexican States (SEGOB DGG/SP/101/65). © 2025
            MatchPredictor.mx. All Rights Reserved. PLAY RESPONSIBLY. GAMBLING
            IS PROHIBITED FOR MINORS.
          </p>
        </div>
      </footer>
      {/* Modals */}
      {selectedMatch && <MatchDetail />}
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    </div>
  );
}
