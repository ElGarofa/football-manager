# Manager Argentina v1.5
## Ejecutar en Windows
1. Instalá Python 3 (python.org, tildando "Add to PATH") o Node.js.
2. Doble clic en `iniciar.bat` y se abre http://localhost:8000.
## Estructura
- `data/`: clubes, jugadores, ligas y competiciones (JSON). `tools/generate_data.py` los regenera.
- `js/tactics|players|matches|league`: lógica pura. `game.js` orquesta, `transfers.js` mercado, `save.js` LocalStorage, `ui.js` interfaz.
## Próximos pasos (v1.0: pulido y balance)
Ascensos y descensos, varias divisiones, Copa Argentina, contratos y renovaciones, evolución de jugadores por edad, lesiones y entrenamiento más profundos, juveniles, scouting, sponsors, prensa, otros países.
## Datos reales (v0.2)
- `data/clubs_reales.csv`: clubes reales por división (secciones `#Nombre`). Agregá una sección nueva (ej. `#Federal A`) y se crea esa liga sola. Las listas son de memoria y pueden diferir de la temporada actual: editalas.
- `python tools/generate_data.py` regenera clubes, ligas y jugadores ficticios desde ese CSV.
- `python tools/import_players.py data/jugadores_reales.csv` reemplaza la plantilla de los clubes que aparezcan en el CSV (columnas en `data/plantilla_importacion.csv`; atributos opcionales). Correrlo después de generate_data.
## v0.3: ciclo de temporada
Al terminar todas las ligas aparece "Cerrar temporada": ascienden y descienden 2 equipos por categoría, los jugadores envejecen y evolucionan (los jóvenes tienden a su potencial, los veteranos bajan), se retiran los mayores, vencen contratos (renová desde Plantilla), entran juveniles y agentes libres, y se acreditan ingresos por sponsors. Las ligas de más de 24 clubes se juegan a una sola rueda.
## v0.4 y v0.5
- Partido en vivo con pausa (táctica y cambios). Rasgos de jugador (Goleador, Gambeteador, Pasador, Muro, Reflejos, Incansable, Capitán, Frágil). Lesiones por tipo, con vuelta al 70% de condición. Rotación de cansados.
- Mercado: contraofertas, cláusulas de rescisión, préstamos (entrada y salida), ofertas por tus jugadores y fichajes entre clubes de IA.
- Directiva: objetivo por temporada y confianza (te pueden despedir). Instalaciones y cuerpo técnico con efecto, mejorables desde Finanzas.
## v0.6
Nuevo estilo visual y escudos SVG propios (iniciales y colores por club). Cancha cenital en el partido en vivo (22 círculos numerados que se mueven según posesión, táctica y jugadas). Pizarra táctica en Tácticas: arrastrá jugadores para armar formaciones libres (ej. 4-2-1-2-1), elegí jugadores desde la lista y guardá formaciones con nombre.
## v0.7: negocios, scouting y nuevo estilo
- **Instalaciones**: 9 zonas (médica, entrenamiento, cantera, estadio, concentración, tienda, palcos, oficinas, scouting), niveles 1-10, obras con tiempo y costo (máx. 2 a la vez), mantenimiento anual y tope de nivel según la división. El cuerpo técnico (entrenador, ayudante, preparador) se mejora ahí; el ayudante acelera la recuperación de moral tras una derrota. Datos en `data/facilities.json`.
- **Scouting**: 1 a 6 ojeadores según el nivel de la oficina; misiones por región, tipo y posición; informes con rangos estimados, jugadores seguidos (☆) y promesas para la cantera. Niebla de información opcional (Partida y ajustes). Lógica en `js/scouting.js`.
- **Patrocinios**: 4 espacios, ~25 marcas ficticias (`data/sponsors.json`), ofertas con duración, bonos y cláusula de descenso; se puede negociar (+10/25/50%, con riesgo de que la marca se retire).
- **Inversionistas**: préstamo, socio, mecenas (exige posición y veta la venta de tus 3 mejores) y fondo de derechos (`data/investors.json`). La deuda alta bloquea fichajes.
- **Finanzas**: desglose de ingresos y gastos por categoría, historial por temporada, precio de entradas, TV y premios, tope salarial de la directiva. Los clubes de la IA usan las mismas reglas (`data/economy.json`, `js/finance.js`).
- **Estilo**: tema oscuro vivo, claro o color del club; escudo y acento por club; barras y colores de atributos, zonas de la tabla, forma reciente.
- Las partidas de v0.6 se migran solas al cargarlas.
- Probado: simulaciones de 20 temporadas, migración de una partida vieja, y recorrido de todas las vistas en Chromium headless.
## v0.8: copas, competiciones internacionales, ficha de jugador y gráficos
- **Copa Argentina** (`js/comp.js`): eliminación directa a partido único con los 110 clubes (los 18 mejores por reputación arrancan en la segunda ronda), penales si hay empate, premios por ronda y entradas propias. Se juega a mitad de semana.
- **Copa Libertadores** (32 equipos, 8 grupos, octavos y cuartos y semis a ida y vuelta, final a partido único) y **Copa Sudamericana** (16 equipos, 4 grupos). Clasifican 4 argentinos a cada una (los 3 primeros de Primera y el campeón de la Copa Argentina a la Libertadores; los siguientes a la Sudamericana). Los 48 clubes extranjeros son ficticios (`data/ext.json`), con plantillas generadas al jugar.
- **Ficha de jugador**: tocá el nombre de cualquier jugador. Radar de atributos, evolución de OVR y potencial por temporada, estadísticas y contrato. Respeta la niebla de información.
- **Historia y gráficos**: posición por jornada, presupuesto, trayectoria en la pirámide, ingresos y gastos por temporada, carrera del club y palmarés.
- Los partidos de copa se pueden jugar en vivo con la cancha cenital. Las partidas de v0.7 se migran solas (si ya avanzó la temporada, las copas arrancan la siguiente).
- Los rivales de IA en copas se resuelven con una simulación rápida (no hay estadísticas individuales de esos partidos).
## v0.9: personas, cantera, mercado, carrera y mundo vivo
**Vestuario** (`js/people.js`): personalidades (Líder, Profesional, Ambicioso, Leal, Conflictivo, Vago), capitán, clima del grupo, charla diaria, charla previa y de entretiempo en los partidos en vivo, conferencias de prensa, quejas por minutos (prometer, ignorar, vender), conflictos (mediar, multar), rumores, tarjetas, suspensiones y multas. Prórroga en las copas.
**Cantera** (`js/youth.js`): Reserva y Sub-17 con torneos propios, subir al plantel, mentores, red de captación (5 niveles), convenios con clubes chicos y Sudamericano Sub-20.
**Mercado** (`js/market.js`, `js/transfers.js`): 14 representantes con carácter, comisiones, dos ventanas de pases (enero-febrero y 1/7-15/8) con último día, cláusulas de rescisión, bonos por partido y gol, reventa, opción de renovación, préstamos con opción u obligación de compra, trueques y filtros de búsqueda.
**Carrera** (`js/career.js`, `js/nacional.js`): reputación como entrenador, licencias C/B/A/Pro, cuerpo técnico propio por especialidad, ofertas de otros clubes, renuncia y despido con nuevas ofertas, negociación de objetivos y pedidos de presupuesto. Selección: convocatorias en fechas FIFA, Eliminatorias, Mundial con rivales ficticios y seguro de lesiones.
**Mundo y tácticas** (`js/world.js`): plan semanal con planes guardados, familiaridad táctica, entrenamiento individual (atributo, posición, rasgo), encargados de pelota parada, análisis del rival, Plan B automático en el partido, clima y estado de la cancha, socios y cuota, elecciones del club, clásicos, barras, ampliación y estadio nuevo, eventos aleatorios y quiebras o fusiones de clubes (los reemplaza un club del Federal).
**Comodidades**: avisos en Inicio, «⏩ Hasta lo importante» (para ante clásicos, copas, cierre de mercado o decisiones pendientes), filtros y orden en Plantilla, filtros en Calendario y Mercado, Noticias por tema, Comparador de jugadores, atajos de teclado (Espacio, `.`, I P T M C V F N E L).
- Las partidas de v0.8 se migran solas. Los partidos en vivo ahora arrancan en pausa para dar la charla previa.
- Probado: simulaciones de 20-25 temporadas (economía estable, quiebras y Mundiales), migración de una partida v0.8 y recorrido de todas las pantallas en Chromium headless.
## v1.0: móvil, instalable, guardado y pulido
- **Celulares**: barra de navegación inferior y menú lateral deslizable, tablas compactas (se ocultan columnas secundarias, el detalle está en la ficha), botones grandes y pizarra táctil.
- **App instalable (PWA)**: `manifest.webmanifest` + `sw.js` + íconos. Publicá la carpeta en un hosting estático con https (por ejemplo GitHub Pages) y desde el navegador del celular elegí “Agregar a pantalla de inicio”; funciona sin conexión. Al publicar cambios subí `VERSION` en `sw.js`.
- **Guardado**: 3 ranuras + autoguardado en IndexedDB (sin el límite de 5 MB de LocalStorage), exportar e importar la partida como archivo.
- **Visual**: camisetas por club (6 diseños), caras de jugadores generadas, sombras, estela de la pelota y confeti en los goles.
- **Sonido** sintetizado (gol, pitazos, tarjetas, logros), tutorial inicial, 21 logros, estadísticas de carrera, resumen de fin de temporada, tamaño de texto, animaciones reducidas.
- **Balance**: la caída de confianza por no cumplir el objetivo ahora depende de cuánto te falta.
## v1.1: más mecánicas y comodidades
- **Roles** de jugador por posición (rinden más si tienen el atributo del rol), **ventas a Europa** con opción de reventa, **tratamiento intensivo** para lesiones largas, **ex jugadores como staff**, **desafíos** (Salvar al club, De abajo a Primera, Club de cantera) y **Salón de la fama** con récords e ídolos.
- **Comodidades**: editor de datos, búsqueda global (`/`), estadio dibujado que crece con la capacidad, goles por período, autoguardado y logros visibles.
- Las partidas de v0.8 y v0.9 se migran solas. Los partidos en vivo arrancan en pausa.


## v1.2 — pantallas y predio
- **Elegir equipo**: ahora son tarjetas con buscador (antes la tabla tapaba el botón "Elegir").
- **Tablas anchas** (Mercado, Plantilla, Cantera, Vestuario…): la columna de acciones queda fija a la derecha, siempre visible.
- **Predio del club** (menú Negocios → Predio): mapa con estadio, canchas de entrenamiento y cantera, zona médica, palcos, tienda, oficinas, scouting y concentración. Los edificios crecen con el nivel; tocás uno y lo mejorás. Durante la obra aparecen andamio, grúa y barra de progreso.

## Hoja de ruta: todo el mundo
Se hace por tandas, cada una con sus clubes, divisiones y jugadores ficticios: (1) arquitectura multi-país (ligas jugables fuera de Argentina, ascensos y descensos por país), (2) Sudamérica, (3) Europa top, (4) resto de Europa, (5) América del Norte/Central, Asia, África y Oceanía.


## v1.2 — base de datos mundial
- `data/mundo/<ISO3>.json`: 215 países, ~3.800 clubes reales con sus divisiones (esquema y validador en `tools/validar_mundo.py`). Los jugadores siguen siendo ficticios.
- Explorador **🌍 Mundo** (botón en el inicio y entrada en el menú): continente → país → división → clubes.
- Los datos están escritos de memoria, sin fuente externa: muchas divisiones están marcadas como **lista parcial** (`completo:false`) y pueden estar desactualizadas. Revisar y completar con `python3 tools/validar_mundo.py`.
- Solo Argentina es jugable; dirigir clubes de otros países queda para próximas versiones.


## v1.3 — todo el mundo jugable + premios
- **Podés dirigir un club de cualquiera de los 215 países** de `data/mundo/`: en el inicio tocá “🌍 Explorar el mundo”, elegí continente → país → división y “Dirigir”. El país se arma en el momento (`js/gen.js`): sus clubes y divisiones reales, jugadores ficticios con nombres de la región, ascensos/descensos según el tamaño de cada división, copa nacional, copas continentales de su confederación con clubes reales y Eliminatorias/Mundial con su selección.
- Si una división tiene menos de 8 clubes se completa con clubes ficticios (marcados `ficticio`).
- **Premios** (menú Premios): Balón de Oro, Yashin, Kopa, Bota de Oro, Puskás, Entrenador y Club del año, Equipo ideal mundial; premios de tu liga (mejor jugador, goleador, arquero, joven, equipo ideal), historial, tus premios/títulos y una tabla de premios en dinero por competición. Si ganás alguno, tu jugador sube de valor y el club de reputación.
- Limitaciones conocidas: el calendario es el mismo para todos los países (arranca en febrero); los jugadores de otros clubes del mundo para los premios son un “pool de estrellas” simulado, no jugadores de carne y hueso del juego; la economía depende de la reputación, no del país; los datos de clubes están escritos de memoria y muchas divisiones son listas parciales.

## v1.4 — gráficos
- Escudos únicos por club (6 formas × 6 patrones × 6 símbolos) y colores reales de los clubes conocidos; camisetas titular/alternativa/tercera (`kit(c,s,alt)`); caras con más tonos de piel, peinados y barbas.
- Partido en vivo: jugadores con camiseta y número, animación de carrera, camiseta alternativa si los colores chocan, clima (lluvia/niebla), partido nocturno con reflectores, público en tribunas según capacidad, vistas Calor / Tiros / Pases.
- Ficha de jugador con radar de atributos.
- Accesibilidad: modo daltonismo y alto contraste (Partida y ajustes → Visión).


## v1.5 — gráficos, parte 2
- Menú con íconos SVG (reemplazan a los emojis; Selección conserva la bandera).
- Predio en vista isométrica con modo día/noche, estadio que crece con nivel y capacidad, obras con andamio, grúa y barra de progreso.
- Partido en vivo: repetición del gol (cámara lenta), botón de zoom que sigue la pelota y sonido de público que ruge con los goles (WebAudio, respeta el ajuste de sonido).
- Ficha de jugador: gráfico de evolución del valor de mercado (se completa al cierre de cada temporada) y botón "Descargar figurita" (PNG).
- Presentación animada al fichar un jugador y ceremonia de premios al cerrar la temporada.
- Los números de las tarjetas resumen se animan al cambiar de pantalla (se desactiva con Animaciones: Reducidas).
- El comparador de jugadores ya existía (radar + tabla).
- Pendiente: tarjetas de jugador pensadas para móvil, pulir la vista isométrica en pantallas muy chicas.
