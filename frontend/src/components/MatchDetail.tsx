import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useMatchStore } from '../store/matchStore';

export function MatchDetail() {
  const { selectedMatch, weather, analysis, fetchWeather, fetchAnalysis, clearSelection } = useMatchStore();

  useEffect(() => {
    if (selectedMatch?.city) {
      fetchWeather(selectedMatch.city);
    }
  }, [selectedMatch]);

  if (!selectedMatch) return null;

  const matchDate = new Date(selectedMatch.dateEvent);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">
              {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              ✕
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            {matchDate.toLocaleDateString()} • {selectedMatch.venue}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Teams */}
          <div className="flex items-center justify-around py-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              {selectedMatch.homeTeamBadge && (
                <img src={selectedMatch.homeTeamBadge} alt="" className="w-16 h-16 mx-auto mb-2" />
              )}
              <p className="font-bold">{selectedMatch.homeTeam}</p>
            </div>
            <div className="text-3xl font-bold">
              {selectedMatch.homeScore ?? '?'} - {selectedMatch.awayScore ?? '?'}
            </div>
            <div className="text-center">
              {selectedMatch.awayTeamBadge && (
                <img src={selectedMatch.awayTeamBadge} alt="" className="w-16 h-16 mx-auto mb-2" />
              )}
              <p className="font-bold">{selectedMatch.awayTeam}</p>
            </div>
          </div>

          {/* Weather */}
          <div>
            <h3 className="font-semibold mb-2">🌤️ Weather Conditions</h3>
            {weather ? (
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">{weather.temperature}°C</Badge>
                <Badge variant="outline">💨 {weather.windSpeed} km/h</Badge>
                <Badge variant="outline">💧 {weather.humidity}%</Badge>
                <Badge variant="outline">{weather.conditions}</Badge>
              </div>
            ) : (
              <Skeleton className="h-8 w-full" />
            )}
          </div>

          {/* AI Analysis */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">⚡ AI Analysis</h3>
              {!analysis && (
                <Button size="sm" onClick={() => fetchAnalysis(selectedMatch.id)}>
                  Generate Analysis
                </Button>
              )}
            </div>
            {analysis ? (
              <Card className="bg-blue-50">
                <CardContent className="p-4">
                  <p className="text-sm whitespace-pre-line">{analysis.analysis}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Model: {analysis.model}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <p className="text-sm text-gray-500">
                Click "Generate Analysis" to get AI predictions
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}