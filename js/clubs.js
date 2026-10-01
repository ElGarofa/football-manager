export const squadOf = (g, id) => g.clubs[id].plantilla.map(i => g.players[i]);
export const squadValue = (g, id) => squadOf(g, id).reduce((s, p) => s + p.val, 0);
export const wageBill = (g, id) => squadOf(g, id).reduce((s, p) => s + p.sal, 0);
export async function loadData(base = 'data/') { const [clubs, players, leagues, competitions] = await Promise.all(['clubs', 'players', 'leagues', 'competitions'].map(n => fetch(base + n + '.json').then(r => r.json()))); return { clubs, players, leagues, competitions }; }
