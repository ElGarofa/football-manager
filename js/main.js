import {loadData} from './clubs.js';
import {setConfig} from './config.js';
import {UI} from './ui.js';
const app=document.getElementById('app'),ui=new UI(app);window.__ui=ui;
try{ui.data=await loadData();setConfig(ui.data);ui.start()}catch(e){app.innerHTML='<div class="err"><h2>No se pudieron cargar los datos</h2><p>Abrí el juego con <b>iniciar.bat</b>. No funciona haciendo doble clic en index.html.</p></div>'}
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1'))navigator.serviceWorker.register('sw.js').catch(()=>{});
