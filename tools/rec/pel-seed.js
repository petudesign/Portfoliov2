// Demo data for Peluutin recordings: two teams, an active match and a drill, written before the app loads.
module.exports = ({ sport = 'football', match = true, theme = 'dark' } = {}) => {
  const names = ['Aino', 'Leo', 'Sofia', 'Miro', 'Eeli', 'Noel', 'Onni', 'Iida', 'Sisu', 'Venla', 'Elias', 'Lumi'];
  const players = names.map((name, i) => ({ id: 'p' + (i + 1), name, number: [1, 4, 7, 10, 5, 8, 11, 9, 3, 6, 14, 2][i] }));
  const teams = [
    { id: 't1', name: 'FC Kallio P12', sport: 'football', players, formations: [], fieldUnits: [], history: [] },
    { id: 't2', name: 'FC Kallio futsal', sport: 'futsal', players: players.slice(0, 9), formations: [], fieldUnits: [], history: [] },
  ];
  const team = sport === 'futsal' ? teams[1] : teams[0];
  const size = sport === 'futsal' ? 5 : 8;
  const ids = team.players.map(p => p.id);
  const lineup = ids.slice(0, size);
  const minutes = Object.fromEntries(ids.map((id, i) => [id, i < size ? 1520 - i * 40 : 300 + i * 30]));
  const active = { teamId: team.id, opponent: 'PK-35', venue: 'home', activePlayerIds: ids, formation: sport === 'futsal' ? '5-1–2–1' : '8-2–3–2', lineup, seconds: 1580, score: [2, 1], minutes, goals: { p8: 1, p4: 1 }, clockRunning: false };
  const markers = [
    { id: 'b1', kind: 'player', team: 'blue', role: 'defender', name: 'Aino', number: 4, x: -3.8, z: 1.8 },
    { id: 'b2', kind: 'player', team: 'blue', role: 'midfielder', name: 'Leo', number: 7, x: -1.2, z: -1.6 },
    { id: 'b3', kind: 'player', team: 'blue', role: 'attacker', name: 'Sofia', number: 9, x: 1.4, z: 1.4 },
    { id: 'r1', kind: 'player', team: 'red', role: 'midfielder', name: 'Miro', number: 5, x: -0.6, z: 0.6 },
    { id: 'r2', kind: 'player', team: 'red', role: 'defender', name: 'Eeli', number: 3, x: 3.2, z: -0.4 },
    { id: 'ball', kind: 'ball', name: 'Pallo', x: -3.5, z: 1.5 },
    { id: 'c1', kind: 'cone', name: 'Tötsä', x: -2.4, z: 3 }, { id: 'c2', kind: 'cone', name: 'Tötsä', x: 0, z: 3 }, { id: 'c3', kind: 'cone', name: 'Tötsä', x: 2.4, z: 3 },
    { id: 'c4', kind: 'cone', name: 'Tötsä', x: -2.4, z: -3 }, { id: 'c5', kind: 'cone', name: 'Tötsä', x: 0, z: -3 }, { id: 'c6', kind: 'cone', name: 'Tötsä', x: 2.4, z: -3 },
  ];
  const paths = [
    { id: 'path-1', kind: 'pass', fromId: 'b1', toId: 'b2', startMs: 0 },
    { id: 'path-2', kind: 'run', fromId: 'b3', toPoint: { x: 3.6, z: 2.2 }, startMs: 600 },
    { id: 'path-3', kind: 'dribble', fromId: 'b2', toPoint: { x: 1.2, z: -1.8 }, startMs: 1500 },
    { id: 'path-4', kind: 'pass', fromId: 'b2', toId: 'b3', startMs: 2900 },
    { id: 'path-5', kind: 'shot', fromId: 'b3', toPoint: { x: 5.6, z: 0.3 }, startMs: 4100 },
  ];
  const draft = { name: 'Kolmen pelaajan hyökkäys', notes: '', exerciseTheme: 'Syöttö ja liike', coachingPoints: '', keyQuestions: '', markers, paths, annotations: [], goalSize: 'youth', pitchPreset: 'training', pitchOrientation: 'landscape', pitchStyle: theme === 'dark' ? 'dark' : 'grass', updatedAt: new Date().toISOString() };
  return { teams, active: match ? active : null, draft, sport, theme };
};
