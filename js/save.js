import {Game} from './game.js';
const K='fm_argentina_v04';
export const hasSave=()=>!!localStorage.getItem(K);
export const save=g=>{try{localStorage.setItem(K,JSON.stringify(g));return true}catch(e){return false}};
export const load=()=>{const s=localStorage.getItem(K);return s?Game.from(JSON.parse(s)):null};
