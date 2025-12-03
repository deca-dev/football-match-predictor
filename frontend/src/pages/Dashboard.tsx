import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMatchStore } from "../store/matchStore";
import { useAuthStore } from "../store/authStore";
import { Header } from "../components/Header";
import { TeamDetail } from "../components/TeamDetail";

export function Dashboard() {
  const navigate = useNavigate();
  const { matches, fetchMatches, league, setLeague } = useMatchStore();
  const {
    user,
    favorites,
    fetchFavorites,
    addFavorite,
    removeFavorite,
    logout,
  } = useAuthStore();
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [teamSearch, setTeamSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<any>(null);

  // Season start date (La Liga typically starts mid-August)
  const nextSeasonStart = new Date("2026-08-14T20:00:00");

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    fetchMatches();
    fetchFavorites();
  }, [league, user]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = nextSeasonStart.getTime() - now.getTime();

      if (diff > 0) {
        setCountdown({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const isFavorite = (teamName: string) => {
    return favorites.some((f) => f.teamName === teamName);
  };

  // Get unique teams from matches
  const allTeams = Array.from(
    new Set(
      matches.flatMap((m) => [
        JSON.stringify({
          name: m.homeTeam,
          badge: m.homeTeamBadge,
          league: m.league,
        }),
        JSON.stringify({
          name: m.awayTeam,
          badge: m.awayTeamBadge,
          league: m.league,
        }),
      ])
    )
  )
    .map((t) => JSON.parse(t))
    .filter((t) => t.name);

  // Get upcoming matches for favorite teams
  const favoriteMatches = matches
    .filter((m) =>
      favorites.some(
        (f) => f.teamName === m.homeTeam || f.teamName === m.awayTeam
      )
    )
    .slice(0, 5);

  // Get next match overall
  const now = new Date();
  const upcomingMatches = matches
    .filter((m) => new Date(m.dateEvent) > now)
    .sort(
      (a, b) =>
        new Date(a.dateEvent).getTime() - new Date(b.dateEvent).getTime()
    );
  const nextMatch = upcomingMatches[0];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        isLoggedIn={!!user}
        userName={user?.name || ""}
        onLogout={() => {
          logout();
          navigate("/");
        }}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🏠 Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Countdown Card */}
            <Card className="bg-black text-white">
              <CardHeader>
                <CardTitle className="text-red-500">
                  ⏳ Next Season 2026/27
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <p className="text-3xl font-bold text-red-500">
                      {countdown.days}
                    </p>
                    <p className="text-sm text-gray-400">Days</p>
                  </div>
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <p className="text-3xl font-bold text-red-500">
                      {countdown.hours}
                    </p>
                    <p className="text-sm text-gray-400">Hours</p>
                  </div>
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <p className="text-3xl font-bold text-red-500">
                      {countdown.minutes}
                    </p>
                    <p className="text-sm text-gray-400">Minutes</p>
                  </div>
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <p className="text-3xl font-bold text-red-500">
                      {countdown.seconds}
                    </p>
                    <p className="text-sm text-gray-400">Seconds</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Match */}
            {nextMatch && (
              <Card>
                <CardHeader>
                  <CardTitle>🔜 Next Match</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {nextMatch.homeTeamBadge && (
                        <img
                          src={nextMatch.homeTeamBadge}
                          alt=""
                          className="w-12 h-12"
                        />
                      )}
                      <span className="font-bold">{nextMatch.homeTeam}</span>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">VS</p>
                      <p className="text-sm text-gray-500">
                        {new Date(nextMatch.dateEvent).toLocaleDateString(
                          "en-CA",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold">{nextMatch.awayTeam}</span>
                      {nextMatch.awayTeamBadge && (
                        <img
                          src={nextMatch.awayTeamBadge}
                          alt=""
                          className="w-12 h-12"
                        />
                      )}
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-500 mt-2">
                    📍 {nextMatch.venue}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Favorite Team Matches */}
            {favoriteMatches.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>⭐ Matches of my Teams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {favoriteMatches.map((match) => (
                      <div
                        key={match.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          {match.homeTeamBadge && (
                            <img
                              src={match.homeTeamBadge}
                              alt=""
                              className="w-8 h-8"
                            />
                          )}
                          <span className="font-medium">{match.homeTeam}</span>
                        </div>
                        <div className="text-center">
                          {match.homeScore !== null ? (
                            <span className="font-bold">
                              {match.homeScore} - {match.awayScore}
                            </span>
                          ) : (
                            <span className="text-gray-500">vs</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{match.awayTeam}</span>
                          {match.awayTeamBadge && (
                            <img
                              src={match.awayTeamBadge}
                              alt=""
                              className="w-8 h-8"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-red-500">
                    {matches.length}
                  </p>
                  <p className="text-sm text-gray-500">Total Matches</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-red-500">
                    {upcomingMatches.length}
                  </p>
                  <p className="text-sm text-gray-500">About to play</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-red-500">
                    {favorites.length}
                  </p>
                  <p className="text-sm text-gray-500">Favorite Teams</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-red-500">2</p>
                  <p className="text-sm text-gray-500">Active Leagues</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Favorites */}
          <div className="space-y-6">
            {/* My Favorites */}
            <Card>
              <CardHeader>
                <CardTitle>⭐ My favorite teams</CardTitle>
              </CardHeader>
              <CardContent>
                {favorites.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    You can add teams from the section below.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {favorites.map((team) => (
                      <div
                        key={team.teamName}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition"
                        onClick={() => setSelectedTeam(team)}
                      >
                        <div className="flex items-center gap-2">
                          {team.teamBadge && (
                            <img
                              src={team.teamBadge}
                              alt=""
                              className="w-8 h-8"
                            />
                          )}
                          <span className="font-medium text-sm">
                            {team.teamName}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFavorite(team.teamName);
                          }}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add Favorites */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>➕ Add Team</span>
                  <div className="flex gap-1">
                    <Badge
                      className={`cursor-pointer ${
                        league === "spanish" ? "bg-red-500" : "bg-gray-300"
                      }`}
                      onClick={() => setLeague("spanish")}
                    >
                      🇪🇸
                    </Badge>
                    <Badge
                      className={`cursor-pointer ${
                        league === "mls" ? "bg-red-500" : "bg-gray-300"
                      }`}
                      onClick={() => setLeague("mls")}
                    >
                      🇺🇸
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Search Input */}
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="🔍 Search team..."
                    value={teamSearch}
                    onChange={(e) => setTeamSearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {allTeams
                    .filter((team) =>
                      team.name.toLowerCase().includes(teamSearch.toLowerCase())
                    )
                    .map((team) => (
                      <div
                        key={team.name}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                          isFavorite(team.name)
                            ? "bg-red-50"
                            : "bg-gray-50 hover:bg-gray-100"
                        }`}
                        onClick={() =>
                          !isFavorite(team.name) &&
                          addFavorite(team.name, team.badge, team.league)
                        }
                      >
                        <div className="flex items-center gap-2">
                          {team.badge && (
                            <img src={team.badge} alt="" className="w-6 h-6" />
                          )}
                          <span className="text-sm">{team.name}</span>
                        </div>
                        {isFavorite(team.name) && (
                          <span className="text-red-500">⭐</span>
                        )}
                      </div>
                    ))}
                  {allTeams.filter((team) =>
                    team.name.toLowerCase().includes(teamSearch.toLowerCase())
                  ).length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-2">
                      No team found.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      {/* Team Detail Modal */}
      <TeamDetail
        team={selectedTeam}
        isOpen={!!selectedTeam}
        onClose={() => setSelectedTeam(null)}
      />
    </div>
  );
}
