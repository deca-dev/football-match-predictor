import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '../store/authStore';

interface Favorite {
  id: string;
  teamName: string;
  teamBadge?: string;
  league: string;
  teamId?: string;
  stadium?: string;
  stadiumCapacity?: string;
  foundedYear?: string;
  teamDescription?: string;
  website?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
}

interface TeamDetailProps {
  team: Favorite | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TeamDetail({ team, isOpen, onClose }: TeamDetailProps) {
  const { getNextMatch, getLastMatches } = useAuthStore();
  const [nextMatch, setNextMatch] = useState<any>(null);
  const [lastMatches, setLastMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Early return if no team or not open
    if (!isOpen || !team || !team.teamId) {
      return;
    }

    const fetchTeamData = async () => {
      setLoading(true);
      try {
        const [next, last] = await Promise.all([
          getNextMatch(team.teamId!),
          getLastMatches(team.teamId!)
        ]);
        setNextMatch(next);
        setLastMatches(last || []);
      } catch (error) {
        console.error('Error fetching team data:', error);
      }
      setLoading(false);
    };
    
    fetchTeamData();
  }, [isOpen, team]);

  // Don't render if not open or no team
  if (!isOpen || !team) {
    return null;
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-2xl bg-white border-0 shadow-2xl my-8">
        {/* Header */}
        <CardHeader className="bg-black text-white rounded-t-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {team.teamBadge && (
                <img src={team.teamBadge} alt="" className="w-16 h-16" />
              )}
              <div>
                <CardTitle className="text-xl">{team.teamName}</CardTitle>
                <Badge className="bg-red-500 mt-1">
                  {team.league === 'spanish' ? '🇪🇸 La Liga' : '🇺🇸 MLS'}
                </Badge>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:text-red-500"
              onClick={onClose}
            >
              ✕
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Team Info */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {team.stadium && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">🏟️ Stadium</p>
                <p className="font-semibold text-sm">{team.stadium}</p>
              </div>
            )}
            {team.stadiumCapacity && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">👥 Capacity</p>
                <p className="font-semibold text-sm">{Number(team.stadiumCapacity).toLocaleString()}</p>
              </div>
            )}
            {team.foundedYear && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">📅 Founded</p>
                <p className="font-semibold text-sm">{team.foundedYear}</p>
              </div>
            )}
          </div>

          {/* Description */}
          {team.teamDescription && (
            <div>
              <h3 className="font-semibold mb-2">📖 About the team</h3>
              <p className="text-sm text-gray-600 line-clamp-4">
                {team.teamDescription}
              </p>
            </div>
          )}

          {/* Social Media */}
          {(team.website || team.twitter || team.instagram || team.facebook) && (
            <div>
              <h3 className="font-semibold mb-2">🌐 Social Media</h3>
              <div className="flex flex-wrap gap-2">
                {team.website && (
                  <a 
                    href={`https://${team.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition"
                  >
                    🔗 Website
                  </a>
                )}
                {team.twitter && (
                  <a 
                    href={`https://twitter.com/${team.twitter}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded-full text-sm transition"
                  >
                    𝕏 Twitter
                  </a>
                )}
                {team.instagram && (
                  <a 
                    href={`https://instagram.com/${team.instagram}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-pink-100 hover:bg-pink-200 rounded-full text-sm transition"
                  >
                    Instagram
                  </a>
                )}
                {team.facebook && (
                  <a 
                    href={`https://facebook.com/${team.facebook}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded-full text-sm transition"
                  >
                    Facebook
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Next Match */}
          {loading ? (
            <div className="text-center py-4 text-gray-500">Loading Matches...</div>
          ) : nextMatch && (
            <div>
              <h3 className="font-semibold mb-2">🔜 Next Match</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {nextMatch.strHomeTeamBadge && (
                      <img src={nextMatch.strHomeTeamBadge} alt="" className="w-8 h-8" />
                    )}
                    <span className="font-medium">{nextMatch.strHomeTeam}</span>
                  </div>
                  <div className="text-center">
                    <p className="font-bold">VS</p>
                    <p className="text-xs text-gray-500">{formatDate(nextMatch.dateEvent)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{nextMatch.strAwayTeam}</span>
                    {nextMatch.strAwayTeamBadge && (
                      <img src={nextMatch.strAwayTeamBadge} alt="" className="w-8 h-8" />
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">
                  📍 {nextMatch.strVenue}
                </p>
              </div>
            </div>
          )}

          {/* Last Matches */}
          {!loading && lastMatches.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">📊 Latest Results</h3>
              <div className="space-y-2">
                {lastMatches.slice(0, 5).map((match: any, index: number) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-sm truncate">{match.strHomeTeam}</span>
                    </div>
                    <div className="px-3">
                      <span className="font-bold">
                        {match.intHomeScore} - {match.intAwayScore}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <span className="text-sm truncate">{match.strAwayTeam}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}