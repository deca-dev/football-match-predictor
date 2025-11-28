import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "../components/Header";
import { MatchDetail } from "../components/MatchDetail";
import { MatchCard } from "../components/MatchCard";
import { useMatchStore } from "../store/matchStore";
import { useAuthStore } from "../store/authStore";
import { LoginModal } from "../components/LoginModal";

export function Matches() {
  const {
    matches,
    loading,
    error,
    fetchMatches,
    selectMatch,
    selectedMatch,
    setLeague,
  } = useMatchStore();
  const { user, logout } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeague, setSelectedLeague] = useState<
    "all" | "spanish" | "mls"
  >("all");
  const [dateFilter, setDateFilter] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (selectedLeague === "all") {
      // Fetch spanish first, then MLS
      const fetchAll = async () => {
        setLeague("spanish");
        await fetchMatches();
      };
      fetchAll();
    } else {
      setLeague(selectedLeague);
      fetchMatches();
    }
  }, [selectedLeague]);

  // Use matches from store
  const displayMatches = matches;

  // Filter matches
  const filteredMatches = displayMatches.filter((match) => {
    const matchesSearch =
      match.homeTeam?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.awayTeam?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.venue?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLeague =
      selectedLeague === "all" || match.league === selectedLeague;

    const matchesDate = !dateFilter || match.dateEvent?.includes(dateFilter);

    return matchesSearch && matchesLeague && matchesDate;
  });

  // Sort by date
  const sortedMatches = [...filteredMatches].sort(
    (a, b) => new Date(b.dateEvent).getTime() - new Date(a.dateEvent).getTime()
  );

  // Group matches by date
  const groupedMatches = sortedMatches.reduce((groups: any, match) => {
    const date = match.dateEvent?.split("T")[0] || "Sin fecha";
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(match);
    return groups;
  }, {});

  const formatDate = (dateStr: string) => {
    if (dateStr === "Sin fecha") return dateStr;
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        isLoggedIn={!!user}
        userName={user?.name || ""}
        onLogout={logout}
        onLoginClick={() => setShowLogin(true)}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            ⚽ Todos los Partidos
          </h1>
          <p className="text-gray-600">
            Busca y explora partidos de La Liga y MLS
          </p>
        </div>

        {/* Search & Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Input */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  🔍 Buscar
                </label>
                <input
                  type="text"
                  placeholder="Buscar por equipo o estadio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* League Filter */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  🏆 Liga
                </label>
                <select
                  value={selectedLeague}
                  onChange={(e) =>
                    setSelectedLeague(
                      e.target.value as "all" | "spanish" | "mls"
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">Todas las Ligas</option>
                  <option value="spanish">🇪🇸 La Liga</option>
                  <option value="mls">🇺🇸 MLS</option>
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  📅 Fecha
                </label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Clear Filters */}
            {(searchTerm || selectedLeague !== "all" || dateFilter) && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {sortedMatches.length} resultados encontrados
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedLeague("all");
                    setDateFilter("");
                  }}
                >
                  ✕ Limpiar filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
            Error: {error}
          </div>
        )}

        {/* Loading  */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        )}

        {/* Matches Grouped by Date */}
        {!loading && Object.keys(groupedMatches).length > 0 && (
          <div className="space-y-6">
            {Object.entries(groupedMatches).map(
              ([date, dateMatches]: [string, any]) => (
                <div key={date}>
                  <h2 className="text-lg font-semibold text-gray-700 mb-3 capitalize">
                    📅 {formatDate(date)}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dateMatches.map((match: any) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        onClick={() => selectMatch(match)}
                      />
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && sortedMatches.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron partidos</p>
            <p className="text-gray-400">
              Intenta con otros filtros de búsqueda
            </p>
          </div>
        )}
      </main>

      {/* Match Detail Modal */}
      {selectedMatch && <MatchDetail />}

      {/* Login Modal */}
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLogin={() => setShowLogin(false)}
        onRegister={() => setShowLogin(false)}
      />
    </div>
  );
}
