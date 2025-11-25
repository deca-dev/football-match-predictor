import { useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { MatchCard } from '../components/MatchCard';
import { MatchDetail } from '../components/MatchDetail';
import { useMatchStore } from '../store/matchStore';

export function Home() {
  const { matches, loading, error, league, setLeague, fetchMatches, selectMatch, selectedMatch } = useMatchStore();

  useEffect(() => {
    fetchMatches();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">
            ⚽ Football Match Predictor
          </h1>
          <p className="text-gray-600">
            AI-powered match analysis with weather conditions
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* League Tabs */}
        <Tabs value={league} className="mb-6">
          <TabsList>
            <TabsTrigger value="spanish" onClick={() => setLeague('spanish')}>
              🇪🇸 La Liga
            </TabsTrigger>
            <TabsTrigger value="mls" onClick={() => setLeague('mls')}>
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

      {/* Match Detail Modal */}
      {selectedMatch && <MatchDetail />}
    </div>
  );
}