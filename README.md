# Web de Boda - María Phia & Javier 💕

Una hermosa web de boda móvil moderna con animaciones y formulario de confirmación integrado con Google Sheets.

## 🎨 Características

- **Diseño Responsive**: Optimizado para dispositivos móviles
- **Animación de Calabaza**: La calabaza se mueve mientras haces scroll
- **Dos Celebraciones**: 
  - Daimiel, España - 4 de julio de 2026
  - Arequipa, Perú - 19 de Diciembre 2026
- **Formulario de Confirmación**: Los invitados pueden confirmar su asistencia
- **Integración con Google Sheets**: Las respuestas se guardan automáticamente en hojas separadas

## 📋 Configuración de Google Sheets

Para que el formulario funcione y guarde las respuestas en Google Sheets, sigue estos pasos:

### 1. Crear las Hojas de Cálculo

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea dos hojas de cálculo nuevas:
   - Una para "Daimiel - España"
   - Otra para "Arequipa - Perú"

### 2. Configurar las Columnas

En cada hoja, crea las siguientes columnas en la primera fila:

| Timestamp | Evento | Nombre | Email | Teléfono | Asistencia | Acompañantes | Restricciones | Mensaje |
|-----------|---------|---------|-------|----------|------------|--------------|---------------|----------|

### 3. Crear el Google Apps Script

Para cada hoja de cálculo:

1. Abre la hoja de cálculo
2. Ve a **Extensiones → Apps Script**
3. Borra el código existente y pega el siguiente:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      data.timestamp,
      data.evento,
      data.nombre,
      data.email,
      data.telefono,
      data.asistencia,
      data.acompanantes,
      data.restricciones,
      data.mensaje
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'success'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Guarda el proyecto con un nombre descriptivo (ej: "Webhook Daimiel" o "Webhook Arequipa")
5. Haz clic en **Implementar → Nueva implementación**
6. Selecciona el tipo: **Aplicación web**
7. Configura:
   - **Ejecutar como**: Tu cuenta
   - **Quién tiene acceso**: Cualquier persona
8. Haz clic en **Implementar**
9. **Copia la URL** que te proporciona (es la URL de la aplicación web)

### 4. Configurar las URLs en el Código

1. Abre el archivo `script.js`
2. En la parte superior, reemplaza las URLs:

```javascript
const CONFIG = {
    DAIMIEL_SHEET_URL: 'PEGA_AQUI_LA_URL_DE_DAIMIEL',
    AREQUIPA_SHEET_URL: 'PEGA_AQUI_LA_URL_DE_AREQUIPA'
};
```

## 🚀 Cómo Usar

1. Abre el archivo `index.html` en tu navegador
2. Haz scroll para ver las animaciones
3. Haz clic en cualquier tarjeta de evento para abrir el formulario
4. Completa el formulario y envía

## 📱 Vista Previa

La web incluye:
- Portada con los nombres de los novios
- Sección de historia
- Timeline animado con calabaza
- Tarjetas de eventos clicables
- Formulario modal responsive

## 🎨 Personalización

### Colores

Puedes cambiar los colores editando las variables CSS en `styles.css`:

```css
:root {
    --primary-color: #d4a574;
    --secondary-color: #f5e6d3;
    --text-dark: #654321;
    --text-light: #8b7355;
}
```

### Imágenes

Actualmente usa imágenes SVG placeholder. Puedes reemplazarlas con imágenes reales:

1. Guarda tus imágenes en la carpeta del proyecto
2. Actualiza las rutas en `index.html`:

```html
<img src="tu-imagen-daimiel.jpg" alt="Daimiel - España">
<img src="tu-imagen-arequipa.jpg" alt="Arequipa - Perú">
```

## 🌐 Publicación

Para publicar tu web:

### Opción 1: GitHub Pages (Gratis)
1. Sube los archivos a un repositorio de GitHub
2. Ve a Settings → Pages
3. Activa GitHub Pages

### Opción 2: Netlify (Gratis)
1. Arrastra la carpeta del proyecto a [Netlify Drop](https://app.netlify.com/drop)
2. Tu web estará en línea instantáneamente

### Opción 3: Vercel (Gratis)
1. Sube a GitHub
2. Importa el proyecto en [Vercel](https://vercel.com)

## 📞 Soporte

Si tienes algún problema con la configuración:
- Verifica que las URLs de Google Apps Script estén correctamente copiadas
- Asegúrate de que los permisos estén en "Cualquier persona"
- Revisa la consola del navegador (F12) para ver posibles errores

## ❤️ ¡Felicidades por su boda!

María Phia y Javier, que disfruten de este día especial en ambas celebraciones.

---

Desarrollado con 💕 para María Phia & Javier
