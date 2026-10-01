# Manager Argentina v0.1
## Ejecutar en Windows
1. Instalá Python 3 (python.org, tildando "Add to PATH") o Node.js.
2. Doble clic en `iniciar.bat` y se abre http://localhost:8000.
## Estructura
- `data/`: clubes, jugadores, ligas y competiciones (JSON). `tools/generate_data.py` los regenera.
- `js/tactics|players|matches|league`: lógica pura. `game.js` orquesta, `transfers.js` mercado, `save.js` LocalStorage, `ui.js` interfaz.
## Próximos pasos
Ascensos y descensos, varias divisiones, Copa Argentina, contratos y renovaciones, evolución de jugadores por edad, lesiones y entrenamiento más profundos, juveniles, scouting, sponsors, prensa, otros países.
## Datos reales (v0.2)
- `data/clubs_reales.csv`: clubes reales por división (secciones `#Nombre`). Agregá una sección nueva (ej. `#Federal A`) y se crea esa liga sola. Las listas son de memoria y pueden diferir de la temporada actual: editalas.
- `python tools/generate_data.py` regenera clubes, ligas y jugadores ficticios desde ese CSV.
- `python tools/import_players.py data/jugadores_reales.csv` reemplaza la plantilla de los clubes que aparezcan en el CSV (columnas en `data/plantilla_importacion.csv`; atributos opcionales). Correrlo después de generate_data.
## v0.3: ciclo de temporada
Al terminar todas las ligas aparece "Cerrar temporada": ascienden y descienden 2 equipos por categoría, los jugadores envejecen y evolucionan (los jóvenes tienden a su potencial, los veteranos bajan), se retiran los mayores, vencen contratos (renová desde Plantilla), entran juveniles y agentes libres, y se acreditan ingresos por sponsors. Las ligas de más de 24 clubes se juegan a una sola rueda.
