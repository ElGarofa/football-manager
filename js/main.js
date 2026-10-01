import { loadData } from './clubs.js';
import { UI } from './ui.js';
const app = document.getElementById('app'), ui = new UI(app);
try {
    ui.data = await loadData();
    ui.start();
}
catch (e) {
    app.innerHTML = '<div class="err"><h2>No se pudieron cargar los datos</h2><p>Abrí el juego con <b>iniciar.bat</b>. No funciona haciendo doble clic en index.html.</p></div>';
}
