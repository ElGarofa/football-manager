import { League, addDays } from './league.js';
import { autoLineup, DEFAULT_TACTIC, FORMATIONS } from './tactics.js';
import { simulate } from './matches.js';
import { squadOf, wageBill } from './clubs.js';
export class Game {
    static create(data, cid) {
        const g = new Game(), lg = data.leagues[0], fs = Object.keys(FORMATIONS);
        g.clubs = Object.fromEntries(data.clubs.map(c => [c.id, c]));
        g.players = Object.fromEntries(data.players.map(p => [p.id, p]));
        Object.values(g.clubs).forEach(c => c.formacion = fs[c.id % fs.length]);
        g.leagues = Object.fromEntries(data.leagues.map(l => [l.id, new League(l, l.clubes)]));
        g.date = addDays(data.leagues[0].inicio, -6);
        g.userClubId = cid;
        g.tactic = { ...DEFAULT_TACTIC };
        g.lineup = autoLineup(squadOf(g, cid), g.tactic.formacion);
        g.training = 'Equilibrado';
        g.news = ['Bienvenido, míster.'];
        g.fin = { ing: 0, gas: 0 };
        g.hist = [];
        return g;
    }
    static from(o) { const g = Object.assign(new Game(), o); g.leagues = {}; for (const k in o.leagues)
        g.leagues[k] = Object.assign(new League(o.leagues[k].def, o.leagues[k].ids), o.leagues[k]); return g; }
    get league() { return this.leagues[this.clubs[this.userClubId].liga]; }
    get year() { return +this.league.def.inicio.slice(0, 4); }
    get allDone() { return Object.values(this.leagues).every(l => l.done); }
    expiring() { return squadOf(this, this.userClubId).filter(p => p.contrato <= this.year); }
    fixLineup() {
        const u = this.userClubId, ok = id => this.players[id] && this.players[id].clubId == u, L = this.lineup;
        if (L.xi.some(id => !ok(id) || this.players[id].lesion > 0)) {
            this.lineup = autoLineup(squadOf(this, u), this.tactic.formacion);
            this.news.push('Se ajustó la alineación por bajas o lesiones.');
        }
        else
            L.bench = L.bench.filter(ok);
    }
    setup(id) {
        const c = this.clubs[id], pl = a => a.map(i => this.players[i]);
        if (id == this.userClubId) {
            this.fixLineup();
            return { club: c, xi: pl(this.lineup.xi), bench: pl(this.lineup.bench).filter(p => p.lesion <= 0), tactic: this.tactic };
        }
        const t = { ...DEFAULT_TACTIC, formacion: c.formacion, mentalidad: c.reputacion > 75 ? 'Ofensiva' : c.reputacion < 55 ? 'Defensiva' : 'Equilibrada' }, l = autoLineup(squadOf(this, id), t.formacion);
        return { club: c, xi: pl(l.xi), bench: pl(l.bench), tactic: t };
    }
    advanceDay() {
        if (this.allDone)
            return false;
        let played = false;
        for (const L of Object.values(this.leagues))
            if (!L.done && this.date == L.date(L.j)) {
                this.playMatchday(L);
                if (L === this.league)
                    played = true;
            }
        this.date = addDays(this.date, 1);
        for (const p of Object.values(this.players)) {
            const mine = p.clubId == this.userClubId;
            p.cond = Math.min(100, p.cond + 4 + (mine && this.training == 'Descanso' ? 4 : 0));
            if (p.lesion > 0)
                p.lesion--;
            if (mine && Math.random() < .03 * (p.edad < 29 ? 1 : .3)) {
                const k = { Físico: ['fis', 'res', 'vel'], Técnico: ['tec', 'pas', 'tir'], Equilibrado: ['fis', 'tec', 'pas', 'def'] }[this.training];
                if (k) {
                    const a = k[Math.random() * k.length | 0];
                    if (p[a] < 99)
                        p[a]++;
                }
            }
        }
        return played;
    }
    playMatchday(L) {
        const j = L.j, u = this.userClubId, n = id => this.clubs[id].nombre;
        for (const m of L.fixtures[j]) {
            const r = simulate(this.setup(m.h), this.setup(m.a));
            r.j = j + 1;
            r.date = this.date;
            L.record(r);
            this.after(r);
            if (L !== this.league) {
                delete r.ev;
                delete r.top;
                delete r.played;
                delete r.inj;
                delete r.gl;
            }
            if (m.h == u || m.a == u)
                this.news.push(`J${j + 1}: ${n(r.h)} ${r.hg}-${r.ag} ${n(r.a)}`);
        }
        L.j++;
        for (const id of L.ids) {
            const w = wageBill(this, id) / L.fixtures.length;
            this.clubs[id].presupuesto -= w;
            if (id == u)
                this.fin.gas += w;
        }
        if (L.done && L === this.league)
            this.news.push('¡Terminó la temporada! Campeón: ' + n(L.sorted()[0].id));
    }
    after(r) {
        const hc = this.clubs[r.h], inc = hc.capacidad * .6 * hc.reputacion / 100 * 10;
        hc.presupuesto += inc;
        if (r.h == this.userClubId)
            this.fin.ing += inc;
        r.played.forEach(([id, fat]) => { const p = this.players[id], s = p.clubId == r.h ? Math.sign(r.hg - r.ag) : Math.sign(r.ag - r.hg); p.cond = Math.max(30, p.cond - fat); p.pj = (p.pj || 0) + 1; p.mor = Math.max(20, Math.min(100, p.mor + s * 3)); });
        r.inj.forEach(([id, d]) => { const p = this.players[id]; p.lesion = d; if (p.clubId == this.userClubId)
            this.news.push(`🩹 ${p.nombre} estará lesionado ${d} días`); });
        r.gl.forEach(id => { const p = this.players[id]; p.gol = (p.gol || 0) + 1; });
    }
}
