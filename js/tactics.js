export const FORMATIONS = { '4-4-2': ['POR', 'LD', 'DFC', 'DFC', 'LI', 'MD', 'MC', 'MC', 'MI', 'DC', 'DC'], '4-3-3': ['POR', 'LD', 'DFC', 'DFC', 'LI', 'MCD', 'MC', 'MC', 'ED', 'DC', 'EI'], '4-2-3-1': ['POR', 'LD', 'DFC', 'DFC', 'LI', 'MCD', 'MC', 'MCO', 'ED', 'EI', 'DC'], '3-5-2': ['POR', 'DFC', 'DFC', 'DFC', 'MD', 'MC', 'MCD', 'MC', 'MI', 'DC', 'DC'] };
export const OPTIONS = { mentalidad: ['Defensiva', 'Equilibrada', 'Ofensiva'], presion: ['Baja', 'Media', 'Alta'], pase: ['Corto', 'Mixto', 'Largo'], linea: ['Baja', 'Media', 'Alta'], ritmo: ['Lento', 'Normal', 'Rápido'], actitud: ['Conservadora', 'Normal', 'Arriesgada'] };
export const LBL = { mentalidad: 'Mentalidad', presion: 'Presión', pase: 'Estilo de pase', linea: 'Línea defensiva', ritmo: 'Ritmo', actitud: 'Actitud' };
export const DEFAULT_TACTIC = { formacion: '4-4-2', mentalidad: 'Equilibrada', presion: 'Media', pase: 'Mixto', linea: 'Media', ritmo: 'Normal', actitud: 'Normal' };
const LINE = { POR: 'G', DFC: 'D', LI: 'D', LD: 'D', MCD: 'M', MC: 'M', MCO: 'M', MI: 'M', MD: 'M', EI: 'A', ED: 'A', DC: 'A' };
export const lineOf = p => LINE[p];
export const fit = (p, s) => p === s ? 1 : LINE[p] === LINE[s] ? .92 : (LINE[p] === 'G' || LINE[s] === 'G') ? .4 : .8;
export function autoLineup(squad, form) {
    const used = new Set(), xi = [];
    for (const slot of FORMATIONS[form]) {
        let best = null, b = -1;
        for (const p of squad) {
            if (used.has(p.id) || p.lesion > 0)
                continue;
            const s = p.ovr * fit(p.pos, slot) * (.7 + .3 * p.cond / 100);
            if (s > b) {
                b = s;
                best = p;
            }
        }
        best = best || squad.find(p => !used.has(p.id));
        used.add(best.id);
        xi.push(best.id);
    }
    return { xi, bench: squad.filter(p => !used.has(p.id) && p.lesion <= 0).sort((a, b) => b.ovr - a.ovr).slice(0, 7).map(p => p.id) };
}
const E = { mentalidad: { Defensiva: { att: .92, def: 1.08 }, Ofensiva: { att: 1.08, def: .92 } }, actitud: { Conservadora: { att: .97, def: 1.03 }, Arriesgada: { att: 1.04, def: .96, foul: 1.1 } }, presion: { Alta: { mid: 1.05, fat: 1.2, foul: 1.25 }, Baja: { mid: .96, fat: .85, foul: .8 } }, pase: { Corto: { poss: .04, att: .98 }, Largo: { poss: -.04, tempo: 1.05 } }, linea: { Alta: { def: .97, mid: 1.03, att: 1.02 }, Baja: { def: 1.03, att: .97 } }, ritmo: { Lento: { tempo: .88, fat: .9 }, Rápido: { tempo: 1.12, fat: 1.15 } } };
export function mods(t) { const m = { att: 1, mid: 1, def: 1, poss: 0, tempo: 1, foul: 1, fat: 1 }; for (const k in E) {
    const e = E[k][t[k]];
    if (e)
        for (const x in e)
            x === 'poss' ? m.poss += e[x] : m[x] *= e[x];
} return m; }
