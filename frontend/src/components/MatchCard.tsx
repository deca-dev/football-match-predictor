import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Match } from '../services/api';

interface MatchCardProps {
  match: Match;
  onClick: () => void;
}

export function MatchCard({ match, onClick }: MatchCardProps) {
  const matchDate = new Date(match.dateEvent);
  const isFinished = match.status === 'Match Finished';

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <Badge variant={isFinished ? 'secondary' : 'default'}>
            {isFinished ? 'Finalizó' : 'A continuación'}
          </Badge>
          <span className="text-sm text-gray-500">
            {matchDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 text-center">
            {match.homeTeamBadge && (
              <img
                src={match.homeTeamBadge}
                alt={match.homeTeam}
                className="w-12 h-12 mx-auto mb-2 object-contain"
              />
            )}
            <p className="font-semibold text-sm">{match.homeTeam}</p>
          </div>

          <div className="text-center">
            {isFinished ? (
              <p className="text-2xl font-bold">
                {match.homeScore} - {match.awayScore}
              </p>
            ) : (
              <p className="text-lg font-medium text-gray-400">vs</p>
            )}
          </div>

          <div className="flex-1 text-center">
            {match.awayTeamBadge && (
              <img
                src={match.awayTeamBadge}
                alt={match.awayTeam}
                className="w-12 h-12 mx-auto mb-2 object-contain"
              />
            )}
            <p className="font-semibold text-sm">{match.awayTeam}</p>
          </div>
        </div>

        {match.venue && (
          <p className="text-xs text-gray-500 text-center mt-3">
            📍 {match.venue}
          </p>
        )}
      </CardContent>
    </Card>
  );
}