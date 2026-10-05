// v1.5: set de íconos SVG (trazo, 24x24) que reemplaza a los emojis del menú
const I={
inicio:'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',noticias:'M4 5h13v14H6a2 2 0 01-2-2zM17 9h3v8a2 2 0 01-2 2M8 9h5M8 13h5',
competiciones:'M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',plantilla:'M9 11a3 3 0 100-6 3 3 0 000 6zM3 20c0-4 3-6 6-6s6 2 6 6M17 10a2.5 2.5 0 100-5M17 14c3 0 4 2 4 5',
vestuario:'M8 3l-5 3 2 4 3-1v11h8V9l3 1 2-4-5-3c-1 2-5 2-8 0z',tacticas:'M4 4h16v16H4zM12 4v16M4 12h16M9 4v3h6V4M9 20v-3h6v3',
entrenamiento:'M13 4a2 2 0 100 .01M9 20l2-6-3-3 3-3 3 2 3 1M11 14l4 2 1 4',calendario:'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
resultados:'M12 3a9 9 0 100 18 9 9 0 000-18zM12 8l3 2-1 4h-4l-1-4zM12 8V3M15 10l5-1M14 14l3 5M10 14l-3 5M9 10L4 9',
liga:'M7 4h10v5a5 5 0 01-10 0zM7 6H4v2a3 3 0 003 3M17 6h3v2a3 3 0 01-3 3M12 14v4M8 20h8',mercado:'M4 8h14l-3-3M20 16H6l3 3',
scouting:'M10 17a6 6 0 100-12 6 6 0 000 12zM15 15l5 5',cantera:'M12 21v-9M12 12c-5 0-7-4-7-8 5 0 7 3 7 8zM12 14c0-4 2-6 7-6 0 4-2 6-7 6',
comparar:'M12 3v18M6 7h12M6 7l-3 7a3 3 0 006 0zM18 7l-3 7a3 3 0 006 0z',mundo2:'M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
predio:'M3 20h18M5 20V9l5-3v14M10 20V4l9 4v12M13 11h3M13 15h3',instalaciones:'M4 20h16M6 20V10l6-5 6 5v10M10 20v-5h4v5',
patrocinios:'M3 12l5-5 4 3 4-3 5 5-9 8zM8 7l4 8',inversionistas:'M3 8h18v12H3zM8 8V5h8v3M3 13h18',finanzas:'M12 3v18M16 7c0-2-8-2-8 1 0 4 8 2 8 6 0 3-8 3-8 0',
mundo:'M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',carrera:'M12 3l3 7-3 11-3-11zM12 3v18M5 10h14',
premios:'M8 3h8v6a4 4 0 01-8 0zM12 13v4M8 21h8M10 17h4M16 5h3v2a3 3 0 01-3 3M8 5H5v2a3 3 0 003 3',logros:'M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.2l5.9-.9z',
salon:'M3 10l9-6 9 6M5 10v9M9 10v9M15 10v9M19 10v9M3 21h18',historia:'M3 20h18M5 16l4-5 3 3 6-8M14 6h4v4',
editor:'M4 20h4L19 9l-4-4L4 16zM13 7l4 4',guardar:'M12 9a3 3 0 100 6 3 3 0 000-6zM19 12a7 7 0 00-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 00-2-1.2L14 3h-4l-.6 2.7a7 7 0 00-2 1.2l-2.3-1-2 3.4 2 1.5a7 7 0 000 2.4l-2 1.5 2 3.4 2.3-1a7 7 0 002 1.2L10 21h4l.6-2.7a7 7 0 002-1.2l2.3 1 2-3.4-2-1.5A7 7 0 0019 12z',
seleccion:'M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z'};
export const icon=(k,fb='')=>I[k]?`<svg class="ic" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${I[k]}"/></svg>`:fb;
