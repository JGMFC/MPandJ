# 🔍 Diagnóstico: Botón "Confirmar" no funciona

## Paso 1: Abrir la Consola del Navegador

1. Abre tu página web (`index.html`)
2. Presiona **F12** o **Ctrl+Shift+I**
3. Ve a la pestaña **Console**

## Paso 2: Rellenar y Enviar el Formulario

1. Rellena el formulario con datos de prueba
2. Haz clic en "Confirmar Asistencia"
3. **Observa qué mensajes aparecen en la consola**

## Errores Comunes y Soluciones

### ❌ Error 1: "Failed to fetch" o "NetworkError"
**Causa**: La URL del Apps Script no está configurada o es incorrecta

**Solución**:
1. Ve a tu Google Sheet
2. Extensiones → Apps Script
3. Copia TODO el contenido de `Code.gs` y pégalo
4. Implementar → Nueva implementación
5. Copia la URL que termina en `/exec`
6. Pégala en `script.js` línea 7:
   ```javascript
   ENDPOINT_URL: 'TU_URL_AQUI',
   ```

### ❌ Error 2: "El nombre es obligatorio" o "El teléfono es obligatorio"
**Causa**: Validación del formulario (esto es normal si no rellenaste todos los campos)

**Solución**: Asegúrate de rellenar:
- Nombre y apellidos completos (mínimo 2 palabras)
- Prefijo de teléfono
- Número de teléfono (solo números)
- Marcar la casilla de consentimiento

### ❌ Error 3: No pasa nada (no hay errores en consola)
**Causa**: Problema con JavaScript

**Solución**: 
1. Verifica que `script.js` esté enlazado correctamente en `index.html`
2. Busca en consola errores de sintaxis

### ❌ Error 4: "CORS policy" o "Access-Control-Allow-Origin"
**Causa**: Modo CORS (este error es NORMAL con `mode: 'no-cors'`)

**Solución**: No te preocupes, el formulario debería enviarse igualmente. Verifica tu Google Sheet para confirmar.

## Paso 3: Verificar en Google Sheet

Después de enviar el formulario:

1. Abre tu Google Sheet
2. Verifica si aparece una nueva fila con los datos
3. Si NO aparece:
   - El Apps Script puede no estar desplegado correctamente
   - El SHEET_ID puede ser incorrecto

## Paso 4: Probar el Apps Script Manualmente

1. Abre el editor de Apps Script
2. Ve a la función `doPost`
3. Crea una función de prueba:

```javascript
function testEndpoint() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        evento: 'daimiel',
        busOptions: [],
        personas: [{
          nombre_apellidos: 'Juan Pérez García',
          prefijo: '+34',
          telefono: '600123456',
          alergias: '',
          es_principal: true,
          consentimiento: 'Sí',
          origen_url: 'test',
          user_agent: 'test'
        }]
      })
    }
  };
  
  const result = doPost(testData);
  Logger.log(result);
}
```

4. Ejecuta `testEndpoint`
5. Ve a "Ejecuciones" para ver si hay errores

## Checklist de Configuración

- [ ] `Code.gs` tiene el SHEET_ID correcto: `1YiDqTnu_Ctn3KR-XMvwZmp5SSRs1_C6fkC8UEQkb6oc`
- [ ] Apps Script está desplegado como "Aplicación web"
- [ ] La URL del Apps Script está en `script.js` (línea 7)
- [ ] La URL termina en `/exec` (no `/dev`)
- [ ] Los archivos `index.html`, `script.js` y `styles.css` están en la misma carpeta

## ¿Necesitas Ayuda?

Copia el mensaje de error de la consola y compártelo para poder ayudarte mejor.
