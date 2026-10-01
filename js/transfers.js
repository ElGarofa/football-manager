import { fmt } from './players.js';
const R = (a, b) => a + Math.random() * (b - a), ask = p => p.val * (.9 + ((p.id * 37) % 30) / 100);
export const search = (g, f) => Object.values(g.players).filter(p => p.clubId !== g.userClubId && (!f.pos || p.pos === f.pos) && (!f.q || p.nombre.toLowerCase().includes(f.q.toLowerCase())) && p.ovr >= (f.min || 0)).sort((a, b) => b.ovr - a.ovr).slice(0, 40);
function move(g, p, to, amt) { const f = g.clubs[p.clubId], t = g.clubs[to]; if (f) {
    f.plantilla = f.plantilla.filter(i => i !== p.id);
    f.presupuesto += amt;
} t.plantilla.push(p.id); t.presupuesto -= amt; p.clubId = to; p.contrato = +g.date.slice(0, 4) + 3; g.fixLineup(); }
export function buy(g, id, amt) {
    const p = g.players[id], me = g.clubs[g.userClubId], from = g.clubs[p.clubId];
    if (p.clubId === 0) {
        if (me.plantilla.length >= 30)
            return [false, 'Plantilla completa (máx. 30)'];
        move(g, p, me.id, 0);
        return [true, `${p.nombre} firmó como agente libre`];
    }
    if (!(amt > 0))
        return [false, 'Ingresá un monto válido'];
    if (amt > me.presupuesto)
        return [false, 'Presupuesto insuficiente'];
    if (me.plantilla.length >= 30)
        return [false, 'Plantilla completa (máx. 30)'];
    if (from.plantilla.length <= 16)
        return [false, `${from.nombre} no puede quedarse con menos de 16 jugadores`];
    if (amt < ask(p))
        return [false, `${from.nombre} rechazó la oferta por ${p.nombre}`];
    move(g, p, me.id, amt);
    return [true, `Fichaje cerrado: ${p.nombre} por ${fmt(amt)}`];
}
export function sellOffer(g, id) {
    const p = g.players[id], me = g.clubs[g.userClubId];
    if (me.plantilla.length <= 16)
        return null;
    const price = Math.round(p.val * R(.8, 1.1) / 1e3) * 1e3, bs = Object.values(g.clubs).filter(c => c.id !== me.id && c.presupuesto >= price && c.plantilla.length < 30);
    return bs.length ? { to: bs[Math.random() * bs.length | 0].id, price } : null;
}
export function sell(g, id, o) { move(g, g.players[id], o.to, o.price); return [true, `Vendido por ${fmt(o.price)}`]; }
