import { League, addDays } from './league.js';
import { squadOf } from './clubs.js';
import { autoLineup } from './tactics.js';
import { marketValue, mkPlayer } from './players.js';
const R = (a, b) => a + Math.random() * (b - a), C = (x, a, b) => Math.max(a, Math.min(b, Math.round(x)));
const TPL = 'POR POR DFC DFC DFC DFC LI LI LD LD MCD MC MC MCO MI MD EI ED DC DC'.split(' ');
const need = sq => { const t = [...TPL]; sq.forEach(p => { const i = t.indexOf(p.pos); if (i >= 0)
    t.splice(i, 1); }); return t[0] || 'MC'; };
export function renew(g, p) { if (p.mor < 45)
    return `${p.nombre} no quiere renovar`; p.sal = Math.round(p.sal * 1.1 / 1000) * 1000; p.contrato = g.year + (p.edad >= 33 ? 1 : 3); return `${p.nombre} renovó hasta ${p.contrato}`; }
function grow(p) {
    const a = p.edad, d = a <= 23 ? (p.pot - p.ovr) * R(.15, .45) + R(0, 1.5) : a <= 28 ? R(-1.5, 1.5) : a <= 31 ? -R(0, 2) : -R(1, 4.5), dl = Math.round(d);
    p.edad++;
    p.ovr = C(p.ovr + dl, 30, 95);
    for (const k of ['vel', 'ace', 'pas', 'tec', 'tir', 'def', 'fis', 'res', 'men'])
        p[k] = C(p[k] + dl + R(-1, 1) - (a >= 30 && 'vel ace res fis'.includes(k) ? 1 : 0), 20, 99);
    p.exp = C(p.exp + 2, 10, 95);
    p.pot = a >= 26 ? p.ovr : Math.max(p.pot, p.ovr);
    p.val = marketValue(p);
    p.sal = Math.floor(p.val * .18 / 1000) * 1000;
    p.mor = 70;
    p.cond = 100;
    p.lesion = 0;
    p.gol = 0;
    p.pj = 0;
}
export function endSeason(g) {
    const Ls = Object.values(g.leagues), Y = g.year, u = g.userClubId, say = m => g.news.push(m), cn = id => g.clubs[id].nombre;
    for (const p of Object.values(g.players))
        if (!p.clubId)
            delete g.players[p.id];
    g.hist.push({ y: Y, camp: cn(Ls[0].sorted()[0].id) });
    const ord = Ls.map(L => L.sorted().map(r => r.id)), ids = ord.map(o => [...o]);
    for (let k = 0; k < Ls.length - 1; k++) {
        const down = ord[k].slice(-2), up = ord[k + 1].slice(0, 2);
        ids[k] = ids[k].filter(i => !down.includes(i)).concat(up);
        ids[k + 1] = ids[k + 1].filter(i => !up.includes(i)).concat(down);
    }
    ids.forEach((a, k) => a.forEach(id => { const c = g.clubs[id]; if (c.liga !== Ls[k].def.id) {
        if (id == u)
            say(`${Ls.findIndex(l => l.def.id == c.liga) > k ? '🎉 ¡Ascendiste' : '⬇️ Descendiste'} a ${Ls[k].def.nombre}!`);
        c.liga = Ls[k].def.id;
        c.division = Ls[k].def.nombre;
    } }));
    for (const p of Object.values(g.players)) {
        grow(p);
        if (p.edad >= 36 || (p.edad >= 34 && Math.random() < .35)) {
            const c = g.clubs[p.clubId];
            if (c) {
                c.plantilla = c.plantilla.filter(i => i !== p.id);
                if (p.clubId == u)
                    say(`${p.nombre} se retiró (${p.edad} años)`);
            }
            delete g.players[p.id];
        }
    }
    for (const p of Object.values(g.players)) {
        const c = g.clubs[p.clubId];
        if (c && p.contrato <= Y) {
            if (p.clubId == u || (Math.random() < .15 && c.plantilla.length > 18)) {
                c.plantilla = c.plantilla.filter(i => i !== p.id);
                p.clubId = 0;
                if (c.id == u)
                    say(`${p.nombre} dejó el club (contrato vencido)`);
            }
            else
                p.contrato = Y + Math.round(R(1, 3));
        }
    }
    const free = Object.values(g.players).filter(p => !p.clubId).sort((a, b) => b.ovr - a.ovr);
    let nid = Math.max(...Object.keys(g.players).map(Number)) + 1;
    for (const c of Object.values(g.clubs)) {
        while (c.plantilla.length < (c.id === u ? 18 : 20)) {
            const pos = need(squadOf(g, c.id)), i = c.id === u || Math.random() < .5 ? -1 : free.findIndex(p => p.pos === pos), p = i >= 0 ? free.splice(i, 1)[0] : mkPlayer(nid++, c.id, c.reputacion, pos);
            g.players[p.id] = p;
            p.clubId = c.id;
            p.contrato = Y + Math.round(R(1, 3));
            c.plantilla.push(p.id);
        }
        c.presupuesto += Math.round(c.reputacion ** 2 * 500);
    }
    const ini = addDays(Ls[0].def.inicio, 364);
    Ls.forEach((L, k) => { g.leagues[L.def.id] = new League({ ...L.def, inicio: ini, clubes: ids[k] }, ids[k]); });
    g.lineup = autoLineup(squadOf(g, u), g.tactic.formacion);
    g.news = g.news.slice(-40);
    say(`Comienza la temporada ${g.year}`);
}
