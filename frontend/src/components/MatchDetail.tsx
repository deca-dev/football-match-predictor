import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useMatchStore } from '../store/matchStore';

export function MatchDetail() {
  const { selectedMatch, weather, analysis, matchDetails, fetchWeather, fetchAnalysis, clearSelection } = useMatchStore();

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
            {matchDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })} • {selectedMatch.venue}
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
            <h3 className="font-semibold mb-2">🌤️ Condiciones climatológicas</h3>
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
              <h3 className="font-semibold">Análisis de IA</h3>
              {!analysis && (
                <Button size="sm" onClick={() => fetchAnalysis(selectedMatch.id)}>
                  Generar análisis
                </Button>
              )}
            </div>
            {analysis ? (
              <Card className="bg-blue-50">
                <CardContent className="p-4">
                  <p className="text-sm whitespace-pre-line">{analysis.analysis}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Modelo: {analysis.model}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <p className="text-sm text-gray-500">
                Haz click en "Generar análisis" para ver la predicción de IA.
              </p>
            )}
          </div>
          {/* Team Stats */}
          {matchDetails && (matchDetails.homeTeamStats || matchDetails.awayTeamStats) && (
            <div>
              <h3 className="font-semibold mb-3">📊 Información de Equipos</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Home Team */}
                {matchDetails.homeTeamStats && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-bold text-sm mb-2">{matchDetails.homeTeamStats.name}</p>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>🏟️ {matchDetails.homeTeamStats.stadium}</p>
                      {matchDetails.homeTeamStats.stadiumCapacity && (
                        <p>👥 Capacidad: {Number(matchDetails.homeTeamStats.stadiumCapacity).toLocaleString()}</p>
                      )}
                      {matchDetails.homeTeamStats.founded && (
                        <p>📅 Fundado: {matchDetails.homeTeamStats.founded}</p>
                      )}
                    </div>
                  </div>
                )}
                {/* Away Team */}
                {matchDetails.awayTeamStats && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-bold text-sm mb-2">{matchDetails.awayTeamStats.name}</p>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>🏟️ {matchDetails.awayTeamStats.stadium}</p>
                      {matchDetails.awayTeamStats.stadiumCapacity && (
                        <p>👥 Capacity: {Number(matchDetails.awayTeamStats.stadiumCapacity).toLocaleString()}</p>
                      )}
                      {matchDetails.awayTeamStats.founded && (
                        <p>📅 Founded: {matchDetails.awayTeamStats.founded}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Head to Head */}
          {matchDetails?.headToHead && matchDetails.headToHead.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">⚔️ Historial de enfrentamientos</h3>
              <div className="space-y-2">
                {matchDetails.headToHead.map((h2h: any, index: number) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded text-sm">
                    <span className="text-gray-500 text-xs">{h2h.date}</span>
                    <div className="flex items-center gap-2">
                      <span className={h2h.homeScore > h2h.awayScore ? 'font-bold' : ''}>{h2h.homeTeam}</span>
                      <span className="bg-black text-white px-2 py-1 rounded text-xs">
                        {h2h.homeScore} - {h2h.awayScore}
                      </span>
                      <span className={h2h.awayScore > h2h.homeScore ? 'font-bold' : ''}>{h2h.awayTeam}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading state for details */}
          {!matchDetails && (
            <div>
              <Skeleton className="h-32 w-full" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}