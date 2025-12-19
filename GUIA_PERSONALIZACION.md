# ⚡ Guía Rápida de Personalización

## 🎯 Ediciones Más Comunes (5 minutos)

### 1. Cambiar Nombres
**Archivo:** `index.html`
- **Línea 47-48**: Nombres principales del hero
- **Línea 359**: Footer

```html
<!-- Buscar y reemplazar: -->
"María Phia" → Tu nombre
"Javier" → Tu nombre
```

### 2. Cambiar Fechas
**Archivo:** `index.html`
- **Línea 64-65**: Fechas hero
- **Línea 76**: Fecha Daimiel
- **Línea 98**: Fecha Arequipa
- **Línea 152**: Fecha completa Daimiel
- **Línea 205**: Fecha completa Arequipa

**Archivo:** `script.js`
- **Línea 11-50**: Itinerario con horas
- **Línea 53-70**: Eventos para calendario

### 3. Cambiar Ubicaciones
**Archivo:** `index.html`
- **Línea 163-169**: Ceremonia Daimiel
- **Línea 178-184**: Celebración Daimiel
- Buscar: "Iglesia de San Pedro", "Bodega Pago del Vicario"

### 4. Configurar Formulario
**Archivo:** `script.js`
- **Línea 9**: URL de Google Apps Script
- **Línea 12**: URL de WhatsApp

**Archivo:** `Code.gs`
- **Línea 27**: SHEET_ID de tu Google Sheet

---

## 🎨 Personalización de Estilo

### Cambiar Paleta de Colores
**Archivo:** `styles.css` (líneas 7-20)

```css
:root {
    --color-terracota: #E75829;  /* Color principal (CTA, sellos) */
    --color-orange: #DC8636;      /* Color secundario (links, títulos) */
    --color-green: #99A66F;       /* Color acento (textos suaves) */
    --color-peach: #F3D6C1;       /* Color fondo suave */
    --color-blue: #C4DFE9;        /* Color fondo alternativo */
}
```

**Recomendación:** Cambia solo estos 5 colores, el resto se ajustará automáticamente.

### Cambiar Tipografías
**Archivo:** `index.html` (línea 12)
1. Ve a [Google Fonts](https://fonts.google.com)
2. Elige 2 fuentes: una script (elegante) y una serif (legible)
3. Copia el `<link>` y reemplaza el existente
4. En `styles.css` (líneas 22-24):

```css
--font-script: 'Tu-Fuente-Script', cursive;
--font-serif: 'Tu-Fuente-Serif', serif;
```

---

## 📝 Editar Itinerario

**Archivo:** `script.js` (línea 14)

```javascript
itinerarioDaimiel: [
    {
        time: '17:00',                    // Hora (formato 24h)
        title: 'Ceremonia Religiosa',     // Título del hito
        description: 'Iglesia de...'      // Descripción breve
    },
    // Añade más objetos para más hitos
    {
        time: '23:30',
        title: 'Cierre con Fuegos',
        description: 'Espectáculo pirotécnico'
    }
]
```

---

## 🚌 Configurar Rutas de Bus

**Archivo:** `index.html` (líneas 192-216)

Para cambiar las rutas, edita:
1. `<strong>Ciudad Real → Daimiel</strong>` (línea 202)
2. Descripción: `<p>Salida antes de la ceremonia</p>`

Añade más rutas copiando el bloque completo:

```html
<div class="bus-route">
    <span class="bus-route-number">4</span>
    <div class="bus-route-info">
        <strong>Nueva Ruta → Destino</strong>
        <p>Descripción de la ruta</p>
    </div>
</div>
```

Y actualiza el formulario en la línea 291:

```html
<label class="checkbox-label">
    <input type="checkbox" name="bus" value="nueva-ruta">
    <span class="checkbox-custom"></span>
    Nueva Ruta → Destino
</label>
```

---

## 🌍 Añadir Más Países al Selector de Teléfono

**Archivo:** `index.html` (línea 256)

```html
<option value="+52" data-flag="🇲🇽">🇲🇽 México (+52)</option>
<option value="+54" data-flag="🇦🇷">🇦🇷 Argentina (+54)</option>
<!-- Añade más -->
```

**Orden actual:**
1. 🇵🇪 Perú (+51)
2. 🇪🇸 España (+34)
3. Otros alfabéticamente

---

## 🎉 Completar Detalles de Arequipa

Cuando tengas la información completa:

1. **Elimina la sección "coming-soon"** en `index.html` (líneas 220-248)

2. **Copia la estructura de Daimiel** (líneas 146-217) y pégala

3. **Cambia los textos**:
   - Ubicaciones
   - Horarios
   - Enlaces de mapa

4. **Crea itinerario en `script.js`**:

```javascript
itinerarioArequipa: [
    {
        time: '18:00',
        title: 'Recepción',
        description: 'Lugar en Arequipa'
    },
    // ...
]
```

5. **Llama a la función de timeline** en `initTimeline()`:

```javascript
function initTimeline() {
    const timelineDaimiel = document.getElementById('timeline-daimiel');
    const timelineArequipa = document.getElementById('timeline-arequipa');
    
    // Renderizar ambos
    CONFIG.itinerarioDaimiel.forEach(...);
    CONFIG.itinerarioArequipa.forEach(...);
}
```

---

## 📱 Configurar WhatsApp

**Archivo:** `script.js` (línea 12)

### Opción 1: Comunidad de WhatsApp
1. Crea una comunidad en WhatsApp
2. Ve a configuración > Invitar via enlace
3. Copia el enlace: `https://chat.whatsapp.com/ABC123`
4. Pégalo en `WHATSAPP_COMMUNITY_URL`

### Opción 2: Número directo
Si prefieres que te escriban directamente:

```javascript
WHATSAPP_COMMUNITY_URL: 'https://wa.me/34612345678?text=Hola,%20confirmo%20mi%20asistencia'
```

Reemplaza `34612345678` con tu número (código país + número sin +)

---

## 🗓️ Fechas del Calendario

**Archivo:** `script.js` (líneas 53-70)

```javascript
eventos: {
    daimiel: {
        date: '2026-07-04',  // Formato: YYYY-MM-DD
        time: '17:00',       // Formato: HH:mm (24h)
        duration: 6          // Duración en horas
    }
}
```

El archivo .ics se generará automáticamente con esta info.

---

## 🎨 Modificar Ornamentos Florales

**Archivo:** `index.html` (líneas 383-450)

Los SVGs están en la sección `<svg width="0" height="0">`.

### Para cambiar colores de flores:

Busca `fill="#F3D6C1"` y cámbialo por tu color.

### Para añadir más flores:

```html
<g id="mi-flor-nueva">
    <circle cx="50" cy="50" r="15" fill="#E8C0A0" opacity="0.6"/>
    <circle cx="55" cy="45" r="12" fill="#EE8083" opacity="0.5"/>
    <!-- Más elementos -->
</g>
```

Úsalo en el HTML:

```html
<svg viewBox="0 0 100 100">
    <use href="#mi-flor-nueva"></use>
</svg>
```

---

## 📊 Ver Respuestas del Formulario

### Método 1: Google Sheets
1. Abre tu Google Sheet
2. Todas las respuestas aparecen automáticamente

### Método 2: Estadísticas
1. Abre Google Apps Script (Extensiones > Apps Script)
2. Selecciona función: `generateStats`
3. Haz clic en "Ejecutar"
4. Ve "Registros" para ver el resumen

### Método 3: Hoja de Resumen
1. En Apps Script, ejecuta: `createSummarySheet`
2. Se creará una pestaña "Resumen" con estadísticas visuales

---

## 🔄 Actualizar Cambios en GitHub Pages

Después de hacer cambios locales:

```bash
# 1. Ver qué cambió
git status

# 2. Añadir cambios
git add .

# 3. Guardar cambios
git commit -m "Actualizar horarios del evento"

# 4. Subir a GitHub
git push

# En 1-2 minutos se actualizará automáticamente en tu web
```

O desde GitHub.com:
1. Ve a tu repositorio
2. Haz clic en el archivo a editar
3. Clic en el lápiz (editar)
4. Haz cambios
5. Commit changes

---

## 🚨 Checklist Pre-Lanzamiento

Antes de compartir la URL:

- [ ] Nombres correctos en hero y footer
- [ ] Fechas actualizadas en todos los lugares
- [ ] Ubicaciones completas con enlaces a mapas
- [ ] Google Apps Script configurado y probado
- [ ] ENDPOINT_URL correcto en script.js
- [ ] WhatsApp URL configurada
- [ ] Itinerario con horarios finales
- [ ] Selector de teléfono con países correctos
- [ ] Probar formulario completo (enviar test)
- [ ] Verificar que llegue a Google Sheet
- [ ] Revisar responsive en móvil
- [ ] Probar botón de calendario
- [ ] Probar en Chrome, Firefox, Safari

---

## 💡 Tips Profesionales

### Rendimiento
- Las imágenes están en SVG: son ligeras y escalables
- No añadas fotos pesadas, la web debe cargar rápido
- Si necesitas fotos, comprímelas con [TinyPNG](https://tinypng.com)

### Accesibilidad
- No elimines los atributos `aria-*`
- Mantén buen contraste de colores
- Prueba navegación por teclado (Tab)

### SEO (opcional)
En `index.html` línea 6, personaliza:

```html
<meta name="description" content="Tu descripción aquí">
<title>Tu Título | Boda</title>
```

### Analytics (opcional)
Si quieres saber cuántas visitas tienes, añade Google Analytics:

1. Crea cuenta en [analytics.google.com](https://analytics.google.com)
2. Obtén tu código de seguimiento
3. Pégalo antes del `</head>` en index.html

---

## 🆘 Problemas Comunes

| Problema | Solución |
|----------|----------|
| Formulario no envía | Verifica ENDPOINT_URL y SHEET_ID |
| Estilos no cargan | Limpia caché (Ctrl+Shift+R) |
| Timeline no anima | Haz scroll hasta la sección |
| Banderas no se ven | Usa navegador moderno |
| GitHub Pages no funciona | Espera 2-3 minutos tras el push |

---

## 📞 Ayuda Rápida

**Edición urgente de último minuto:**

1. Ve a tu repositorio en GitHub
2. Edita el archivo directamente en web
3. Commit changes
4. Refresca la página en 2 minutos

**Cambiar URL de última hora:**

Si cambias de dominio, solo actualiza:
- `Code.gs` línea 140 (CORS): añade tu nueva URL
- No hace falta más

---

¡Listo! Con estas notas rápidas podrás personalizar todo sin problemas. 🎉