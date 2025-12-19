# 💒 Invitación de Boda - María Phia & Javier

Web estática de invitación de boda con estilo acuarela, diseñada para GitHub Pages. Incluye formulario RSVP con integración a Google Sheets.

## 🎨 Características

- **Diseño acuarela premium**: Paleta pastel, ornamentos florales SVG, tipografías elegantes
- **Timeline animado con mapas**: Itinerario del día con efecto de "revelado pintado" + botones de Google Maps
- **Formularios RSVP separados**: Un formulario por evento con validación completa
- **Acompañantes obligatorios**: Campos requeridos para nombre y apellidos completos
- **Selector de países con banderas**: Prefijos telefónicos ordenados estratégicamente
- **Integración Google Sheets**: Guarda respuestas automáticamente con formato estructurado
- **100% responsive**: Optimizado para móviles, tablets y desktop
- **Sin frameworks**: HTML/CSS/JS vanilla puro
- **Accesibilidad**: Etiquetas ARIA, contraste adecuado, navegación por teclado

## 📁 Estructura del Proyecto

```
Web_10/
├── index.html          # Página principal
├── styles.css          # Estilos completos
├── script.js           # Lógica front-end
├── Code.gs             # Google Apps Script (backend)
└── README.md           # Este archivo
```

## 🚀 Instalación Local

### Requisitos
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Editor de código (VS Code, Sublime, etc.)

### Pasos

1. **Clonar o descargar el proyecto**
   ```bash
   # Si tienes Git
   git clone https://github.com/tu-usuario/tu-repo.git
   
   # O descarga el ZIP y descomprímelo
   ```

2. **Abrir en navegador**
   - Simplemente abre `index.html` en tu navegador
   - O usa un servidor local:
   
   ```bash
   # Con Python 3
   python -m http.server 8000
   
   # Con Node.js (npx)
   npx serve
   
   # Con VS Code
   # Instala la extensión "Live Server" y haz clic derecho > Open with Live Server
   ```

3. **Ver en navegador**
   - Visita: `http://localhost:8000` (o el puerto que uses)

## 📝 Configuración

### 1. Editar Contenido Básico

Abre `script.js` y modifica el objeto `CONFIG`:

```javascript
const CONFIG = {
    // URL del Google Apps Script (ver sección siguiente)
    ENDPOINT_URL: 'TU_URL_AQUI',
    
    // URL de tu comunidad de WhatsApp
    WHATSAPP_COMMUNITY_URL: 'https://chat.whatsapp.com/TU_LINK_AQUI',
    
    // Editar horarios del itinerario
    itinerarioDaimiel: [
        {
            time: '17:00',
            title: 'Ceremonia Religiosa',
            description: 'Iglesia de San Pedro, Daimiel'
        },
        // ... añade o modifica hitos
    ],
    
    // Configurar eventos para calendario
    eventos: {
        daimiel: {
            date: '2026-07-04',
            time: '17:00',
            // ...
        },
        arequipa: {
            date: '2026-12-19',
            time: '18:00',
            // ...
        }
    }
};
```

### 2. Configurar Google Sheets (OBLIGATORIO para formulario)

#### Paso 1: Crear Google Sheet

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja
3. Nómbrala: "Confirmaciones Boda María Phia & Javier"
4. Copia el **ID** de la URL:
   ```
   https://docs.google.com/spreadsheets/d/ABC123XYZ456/edit
                                          ^^^^^^^^^^^^
                                          Este es el ID
   ```

#### Paso 2: Configurar Apps Script

1. En la Sheet, ve a **Extensiones > Apps Script**
2. Borra el código por defecto
3. Copia TODO el contenido de `Code.gs` y pégalo
4. En la línea 27, reemplaza `SHEET_ID`:
   ```javascript
   const SHEET_ID = 'ABC123XYZ456'; // Tu ID aquí
   ```
5. Guarda el proyecto (Ctrl+S)

#### Paso 3: Desplegar como Web App

1. Haz clic en **Implementar** > **Nueva implementación**
2. Configurar:
   - **Tipo**: Aplicación web
   - **Ejecutar como**: Yo (tu cuenta)
   - **Quién tiene acceso**: Cualquier persona
3. Haz clic en **Implementar**
4. Autoriza los permisos (Google te pedirá acceso a Sheets)
5. **Copia la URL** que te da (algo como):
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```

#### Paso 4: Conectar Front-end con Backend

1. Abre `script.js`
2. En la línea 9, pega la URL:
   ```javascript
   ENDPOINT_URL: 'https://script.google.com/macros/s/AKfycbx.../exec',
   ```
3. Guarda el archivo

#### Paso 5: Probar

1. Abre tu web local
2. Rellena y envía el formulario
3. Verifica que aparezca una fila nueva en tu Google Sheet

### 3. Personalizar Estilos

Para cambiar colores, edita las variables CSS en `styles.css`:

```css
:root {
    /* Paleta de colores */
    --color-paper: #FAF8F4;
    --color-terracota: #E75829;
    --color-orange: #DC8636;
    --color-green: #99A66F;
    /* ... más colores */
}
```

### 4. Modificar Textos

Los textos principales están en `index.html`. Busca y reemplaza:

- **Nombres**: Busca "María Phia" y "Javier"
- **Fechas**: Busca "4 de julio" y "19 de diciembre"
- **Ubicaciones**: Busca "Daimiel", "Arequipa", "Iglesia de San Pedro", etc.

## 🌐 Publicar en GitHub Pages

### Método 1: Desde GitHub.com

1. **Crear repositorio**
   - Ve a [GitHub](https://github.com) e inicia sesión
   - Haz clic en "New repository"
   - Nombre: `boda-mariaphia-javier` (o el que quieras)
   - Público
   - Crear

2. **Subir archivos**
   - En el repositorio, haz clic en "Add file" > "Upload files"
   - Arrastra todos los archivos (`index.html`, `styles.css`, `script.js`)
   - Haz clic en "Commit changes"

3. **Activar GitHub Pages**
   - Ve a Settings > Pages
   - Source: Deploy from a branch
   - Branch: `main` o `master`, carpeta: `/ (root)`
   - Guardar

4. **Ver tu web**
   - En 1-2 minutos estará lista en:
   ```
   https://tu-usuario.github.io/boda-mariaphia-javier/
   ```

### Método 2: Desde Git (Terminal)

```bash
# Inicializar repositorio
git init
git add .
git commit -m "Invitación de boda inicial"

# Conectar con GitHub (crea el repo primero en GitHub)
git remote add origin https://github.com/tu-usuario/tu-repo.git
git branch -M main
git push -u origin main

# GitHub Pages se activará automáticamente o lo configuras en Settings
```

## 🔧 Personalización Avanzada

### Añadir más flores/ornamentos

Edita el SVG en `index.html`, sección `<svg width="0" height="0">`:

```html
<g id="mi-flor-nueva">
    <circle cx="50" cy="50" r="20" fill="#F3D6C1" opacity="0.7"/>
    <!-- Más elementos SVG -->
</g>
```

Úsalo con:
```html
<svg><use href="#mi-flor-nueva"></use></svg>
```

### Cambiar tipografías

1. Ve a [Google Fonts](https://fonts.google.com)
2. Elige tus fuentes
3. Copia el `<link>` en el `<head>` de `index.html`
4. Actualiza las variables en `styles.css`:
   ```css
   --font-script: 'Tu-Fuente-Script', cursive;
   --font-serif: 'Tu-Fuente-Serif', serif;
   ```

### 3. Añadir más eventos al itinerario

En `script.js`, dentro de `CONFIG.itinerarioDaimiel`:

```javascript
{
    time: '00:30',
    title: 'Cierre con Fuegos Artificiales',
    description: 'Espectáculo pirotécnico',
    mapsQuery: 'Bodega Pago del Vicario, Ciudad Real, España' // Opcional
}
```

**Nota**: Puedes añadir `mapsQuery` o `mapsUrl` a cualquier hito:
- `mapsQuery`: Búsqueda en Google Maps (ej: "Iglesia San Pedro Daimiel")
- `mapsUrl`: URL directa de Google Maps
- `isBus: true`: Aplica estilo especial para rutas de transporte

### Crear versión para Arequipa

Cuando tengas los detalles:

1. En `index.html`, reemplaza la sección `.coming-soon` con contenido similar a Daimiel
2. En `script.js`, crea `CONFIG.itinerarioArequipa` y llama a `initTimeline()` también para Arequipa

## 📊 Ver Estadísticas de Confirmaciones

En Google Apps Script, puedes ejecutar funciones manualmente:

1. Abre el editor de Apps Script
2. Selecciona la función `generateStats` en el desplegable
3. Haz clic en "Ejecutar"
4. Ve los resultados en "Registros" (icono de documento)

O crea una hoja de resumen:

```javascript
// Ejecutar createSummarySheet() para crear pestaña con stats
```

## 🐛 Solución de Problemas

### El formulario no se envía

1. **Verifica la URL del Apps Script**: Debe terminar en `/exec`, no `/dev`
2. **Revisa la consola del navegador** (F12): ¿Hay errores CORS?
3. **Comprueba el SHEET_ID** en `Code.gs`: ¿Es correcto?
4. **Permisos**: ¿Autorizaste el Apps Script?

### Los estilos se ven mal

1. **Verifica que `styles.css` esté en la misma carpeta** que `index.html`
2. **Limpia la caché** del navegador (Ctrl+Shift+R)
3. **Revisa la consola**: ¿Hay errores 404?

### El timeline no se anima

1. **Abre la consola** del navegador
2. **Verifica que `script.js` cargue sin errores**
3. **Haz scroll** hasta la sección del timeline (la animación se activa al hacer scroll)

### Las banderas no se ven

Las banderas son emojis nativos del navegador. Si no se ven:
- Usa Chrome, Firefox o Safari (Edge también funciona)
- Algunos sistemas antiguos pueden no tener emojis modernos

## 📱 Compartir la Invitación

Una vez publicada en GitHub Pages:

1. **Copia la URL**:
   ```
   https://tu-usuario.github.io/tu-repo/
   ```

2. **Crea un mensaje para WhatsApp**:
   ```
   🎊 ¡Nos casamos! 🎊
   
   Te invitamos a celebrar con nosotros.
   Por favor, confirma tu asistencia aquí:
   https://tu-usuario.github.io/tu-repo/
   
   ¡Te esperamos! 💒
   María Phia & Javier
   ```

3. **Envía por**:
   - WhatsApp
   - Email
   - Redes sociales
   - QR code (genera uno con la URL)

## 🎨 Paleta de Colores

```
Papel/Fondo:    #FAF8F4, #F0F1ED
Melocotón/Rosa: #F3D6C1, #E8C0A0, #EE8083
Terracota:      #E75829, #DC8636, #E29D16, #E8AC4A
Verde Hoja:     #99A66F, #7B8157, #50563A
Azul Suave:     #C4DFE9, #9EC1D5
```

## 📄 Licencia

Este proyecto es de código abierto para uso personal. Puedes modificarlo y adaptarlo para tu boda.

## 💌 Contacto

¿Preguntas o problemas? Abre un issue en el repositorio o contacta directamente con los desarrolladores.

---

**¡Feliz boda! 🎉💒🥂**

*Hecho con amor y código por el equipo de desarrollo*