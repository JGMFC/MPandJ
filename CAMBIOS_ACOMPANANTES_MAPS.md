# 📋 Cambios Implementados - Acompañantes Obligatorios + Maps en Timeline

## ✅ CAMBIO 1: Acompañantes Obligatorios

### Modificaciones Realizadas

#### 1. Formularios (HTML)
✅ **Sin cambios en HTML** - Los campos se generan dinámicamente vía JavaScript

#### 2. JavaScript (`script.js`)

##### `updateCompanionsFields(count, eventId)`
**Antes:**
```javascript
<input type="text" ... placeholder="Nombre completo (opcional)">
```

**Ahora:**
```javascript
<label>Nombre y apellidos del acompañante X <span class="required">*</span></label>
<input type="text" ... required data-companion-index="${i}">
<span class="error-message" id="error-companion-${eventId}-${i}"></span>
```

**Cambios:**
- ✅ Label actualizado: "Nombre y apellidos del acompañante X"
- ✅ Asterisco rojo (*) indicando obligatorio
- ✅ Atributo `required` añadido
- ✅ Mensaje de error individual por cada acompañante
- ✅ Hint explicativo: "Por favor, proporciona el nombre completo de cada acompañante"

##### `validateForm(formData, eventId)`
**Nueva validación añadida:**
```javascript
if (formData.companions > 0) {
    // Verificar que todos los campos estén llenos
    for (let i = 0; i < formData.companionsNames.length; i++) {
        if (!formData.companionsNames[i] || !formData.companionsNames[i].trim()) {
            errors[`companion-${i + 1}`] = 'Este campo es obligatorio';
        } else {
            // Validar formato: nombre + apellido (mínimo 2 palabras)
            const nameParts = formData.companionsNames[i].trim().split(/\s+/);
            if (nameParts.length < 2) {
                errors[`companion-${i + 1}`] = 'Introduce nombre y apellidos completos';
            }
        }
    }
    
    // Verificar que coincida el número
    if (formData.companionsNames.filter(n => n && n.trim()).length < formData.companions) {
        errors.companions = `Debes proporcionar los nombres de todos los ${formData.companions} acompañantes`;
    }
}
```

**Validaciones implementadas:**
1. ✅ Campo no puede estar vacío
2. ✅ Debe contener al menos 2 palabras (nombre + apellido)
3. ✅ El número de acompañantes con nombres debe coincidir con N

##### `showErrors(errors, eventId)`
**Actualizado para manejar errores específicos:**
```javascript
if (field.startsWith('companion-')) {
    const errorEl = document.getElementById(`error-${field}-${eventId}`);
    const inputEl = document.getElementById(`${field}-${eventId}`);
    // Mostrar error específico para cada acompañante
}
```

##### `handleFormSubmit(e, eventId)`
**Antes:**
```javascript
if (companionInput && companionInput.value.trim()) {
    formData.companionsNames.push(...);
}
```

**Ahora:**
```javascript
// SIEMPRE recopila todos los valores (serán validados después)
if (companionInput) {
    formData.companionsNames.push(companionInput.value.trim());
}
```

**Formato de guardado mejorado:**
```javascript
// Formato: "1) Juan Pérez | 2) María García | 3) Luis Martínez"
const acompanantesFormateados = formData.companionsNames
    .filter(name => name && name.trim())
    .map((name, index) => `${index + 1}) ${name}`)
    .join(' | ');

const payload = {
    ...
    num_acompanantes: formData.companions,
    acompanantes: acompanantesFormateados,          // Formato legible
    acompanantes_json: JSON.stringify(formData.companionsNames), // JSON para procesamiento
    ...
};
```

#### 3. Google Apps Script (`Code.gs`)

**Columnas actualizadas:**
```javascript
const COLUMNS = [
    'timestamp',
    'evento',
    'nombre_apellidos',
    'num_acompanantes',
    'acompanantes',           // Nuevo: formato "1) Nombre | 2) Nombre"
    'acompanantes_json',      // Nuevo: array JSON
    'prefijo',
    'telefono',
    'alergias',
    'bus_tramos',
    'consentimiento',
    'origen_url',
    'user_agent'
];
```

**Ejemplo de datos en Google Sheets:**

| num_acompanantes | acompanantes | acompanantes_json |
|------------------|--------------|-------------------|
| 3 | 1) Juan Pérez \| 2) María García \| 3) Luis Martínez | ["Juan Pérez","María García","Luis Martínez"] |
| 0 | | [] |
| 1 | 1) Ana López | ["Ana López"] |

#### 4. CSS (`styles.css`)

**Estilos mejorados para companions-names:**
```css
.companions-names {
    /* Borde destacado */
    border-left: 4px solid var(--color-orange);
    
    /* Efecto acuarela de fondo */
    &::before {
        background: linear-gradient(135deg, var(--color-peach) 0%, var(--color-blue) 100%);
        opacity: 0.1;
        filter: blur(10px);
    }
}

.companions-names .form-hint {
    color: var(--color-orange-light);
}
```

---

## ✅ CAMBIO 2: Timeline con Google Maps

### Modificaciones Realizadas

#### 1. Configuración (`script.js`)

**Estructura del itinerario actualizada:**
```javascript
itinerarioDaimiel: [
    {
        time: '18:00',
        title: 'Ceremonia Religiosa',
        description: 'Iglesia de San Pedro, Daimiel',
        mapsQuery: 'Iglesia de San Pedro, Daimiel, Ciudad Real, España'  // NUEVO
    },
    {
        time: '19:00',
        title: 'Traslado a Celebración',
        description: 'Viaje hacia Bodega Pago del Vicario',
        mapsQuery: 'Bodega Pago del Vicario, Ciudad Real, España'       // NUEVO
    },
    {
        time: '19:30',
        title: 'Bus: Ciudad Real → Daimiel',
        description: 'Salida desde Ciudad Real hacia Daimiel',
        mapsQuery: 'Ciudad Real, España',
        isBus: true  // NUEVO: Marca como ruta de transporte
    },
    // ... más hitos
]
```

**Campos disponibles por hito:**
- `time` (string): Hora en formato "HH:MM"
- `title` (string): Título del hito
- `description` (string): Descripción detallada
- `mapsQuery` (string, opcional): Búsqueda para Google Maps
- `mapsUrl` (string, opcional): URL directa de Google Maps
- `isBus` (boolean, opcional): Si es true, aplica estilo de transporte

#### 2. Renderizado (`initTimeline()`)

**Función actualizada:**
```javascript
function initTimeline() {
    const timelineContainer = document.getElementById('timeline-daimiel');
    
    CONFIG.itinerarioDaimiel.forEach((item, index) => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        
        // NUEVO: Generar botón de mapa si existe mapsQuery o mapsUrl
        let mapsButton = '';
        if (item.mapsQuery || item.mapsUrl) {
            const mapsLink = item.mapsUrl || 
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.mapsQuery)}`;
            const busClass = item.isBus ? 'maps-btn-bus' : '';
            
            mapsButton = `
                <a href="${mapsLink}" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="timeline-maps-btn ${busClass}">
                    <svg>...</svg>
                    Ver en mapa
                </a>
            `;
        }
        
        timelineItem.innerHTML = `
            <div class="timeline-content">
                <div class="timeline-time">${item.time}</div>
                <h4 class="timeline-title-item">${item.title}</h4>
                <p class="timeline-description">${item.description}</p>
                ${mapsButton}  <!-- NUEVO: Botón insertado aquí -->
            </div>
        `;
        timelineContainer.appendChild(timelineItem);
    });
}
```

**Lógica:**
1. Por cada hito, verifica si tiene `mapsQuery` o `mapsUrl`
2. Si existe, genera URL de Google Maps:
   - Con `mapsQuery`: `https://www.google.com/maps/search/?api=1&query=ENCODED`
   - Con `mapsUrl`: Usa la URL tal cual
3. Aplica clase adicional `.maps-btn-bus` si `isBus: true`
4. Inserta botón al final del contenido del hito

#### 3. Estilos CSS

**Nuevo componente: `.timeline-maps-btn`**
```css
.timeline-maps-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    margin-top: var(--spacing-sm);
    background: linear-gradient(135deg, var(--color-orange) 0%, var(--color-terracota) 100%);
    color: white;
    font-family: var(--font-serif);
    font-size: 0.9rem;
    font-weight: 500;
    border-radius: 20px;
    box-shadow: 0 3px 10px rgba(231, 88, 41, 0.3);
    transition: var(--transition-smooth);
    
    /* Efecto shimmer al hover */
    &::before {
        content: '';
        position: absolute;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        transition: left 0.5s;
    }
    
    &:hover::before {
        left: 100%;  /* Animación de brillo */
    }
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(231, 88, 41, 0.4);
    }
}

/* Variante para rutas de bus */
.timeline-maps-btn.maps-btn-bus {
    background: linear-gradient(135deg, var(--color-blue-dark) 0%, var(--color-green) 100%);
    box-shadow: 0 3px 10px rgba(158, 193, 213, 0.3);
}
```

**Características visuales:**
- ✅ Gradiente naranja-terracota para ubicaciones normales
- ✅ Gradiente azul-verde para rutas de bus
- ✅ Efecto shimmer (brillo) al pasar el mouse
- ✅ Elevación suave al hover
- ✅ Icono de pin de ubicación (SVG)
- ✅ Bordes redondeados (20px) estilo acuarela
- ✅ Sombra difuminada con color del gradiente

#### 4. Itinerario Completo Implementado

**Hitos configurados:**

| Hora | Hito | Ubicación en Maps |
|------|------|-------------------|
| 15:30 | Bus: Ciudad Real → Daimiel | Ciudad Real |
| 17:00 | Ceremonia Religiosa | Iglesia San Pedro, Daimiel |
| 18:00 | Bus: Daimiel → Pago del Vicario | Daimiel |
| 18:30 | Traslado a Celebración | Pago del Vicario |
| 19:30 | Cóctel de Bienvenida | Pago del Vicario |
| 21:00 | Cena | Pago del Vicario |
| 23:00 | Baile y Celebración | Pago del Vicario |
| 02:00 | Bus: Pago del Vicario → Daimiel | Pago del Vicario |

**Nota:** Los hitos de bus aparecen ordenados cronológicamente en el timeline.

---

## 🎨 Integración con Estilo Acuarela

### Botones de Mapa
- **Mantienen estética watercolor**: Gradientes suaves, bordes redondeados
- **Animación shimmer**: Efecto de brillo al hover coherente con revelado pintado
- **Colores diferenciados**: Naranja para eventos, azul para transporte
- **No rompen el flujo**: Se integran naturalmente en las tarjetas del timeline

### Campos de Acompañantes
- **Fondo con efecto blur**: Degradado acuarela difuminado
- **Borde destacado**: Línea lateral naranja
- **Hint estilizado**: Color dorado claro para instrucciones
- **Errores suaves**: Mensajes con tipografía serif coherente

---

## 📊 Formato de Datos en Google Sheets

### Ejemplo de Fila Completa

```
timestamp: 2026-06-15T14:32:10.123Z
evento: daimiel
nombre_apellidos: María González López
num_acompanantes: 2
acompanantes: 1) Juan Pérez García | 2) Ana Martínez Ruiz
acompanantes_json: ["Juan Pérez García","Ana Martínez Ruiz"]
prefijo: +34
telefono: 612345678
alergias: Intolerancia al gluten
bus_tramos: ciudad-real-daimiel, daimiel-vicario
consentimiento: Sí
origen_url: https://ejemplo.github.io/
user_agent: Mozilla/5.0...
```

### Ventajas del Formato

1. **`acompanantes` (legible)**: Fácil de leer en la hoja
   - Formato: "1) Nombre | 2) Nombre | 3) Nombre"
   
2. **`acompanantes_json` (procesable)**: Fácil de procesar con scripts
   - Formato: Array JSON string
   - Ejemplo uso: `JSON.parse(acompanantes_json)` → Array

3. **Doble utilidad**: 
   - Humanos leen `acompanantes`
   - Scripts procesan `acompanantes_json`

---

## ✅ Testing Checklist

### Acompañantes
- [ ] Campo "Número de acompañantes" funciona (0-10)
- [ ] Si N=0, no se muestran campos adicionales
- [ ] Si N>0, aparecen exactamente N campos
- [ ] Cada campo tiene label "Nombre y apellidos del acompañante X *"
- [ ] Cada campo tiene asterisco rojo
- [ ] Intentar enviar con campos vacíos → error individual
- [ ] Intentar enviar solo nombre (sin apellido) → error "Introduce nombre y apellidos completos"
- [ ] Enviar correctamente → datos formateados en Sheet como "1) X | 2) Y"
- [ ] Columna `acompanantes_json` contiene array JSON válido

### Timeline con Mapas
- [ ] Todos los hitos del timeline se muestran correctamente
- [ ] Hitos con `mapsQuery` muestran botón "Ver en mapa"
- [ ] Hitos sin `mapsQuery` NO muestran botón
- [ ] Clic en botón abre Google Maps en nueva pestaña
- [ ] Búsqueda de Google Maps usa la query correcta
- [ ] Hitos con `isBus: true` tienen botón azul-verde
- [ ] Hitos normales tienen botón naranja-terracota
- [ ] Efecto shimmer funciona al hover
- [ ] Botones tienen elevación suave al hover
- [ ] En móvil, botones son responsive

### Integración
- [ ] Estética acuarela se mantiene
- [ ] Timeline sigue animándose con scroll
- [ ] Formularios Daimiel y Arequipa funcionan independientemente
- [ ] No hay errores en consola del navegador
- [ ] Google Sheets recibe datos correctamente

---

## 🚀 Cómo Personalizar

### Añadir más hitos con mapas

```javascript
// En script.js, CONFIG.itinerarioDaimiel
{
    time: '00:30',
    title: 'Fuegos Artificiales',
    description: 'Espectáculo pirotécnico de cierre',
    mapsQuery: 'Bodega Pago del Vicario, Ciudad Real, España'
}
```

### Usar URL directa de Maps

```javascript
{
    time: '12:00',
    title: 'Punto de Encuentro',
    description: 'Nos reunimos en la plaza',
    mapsUrl: 'https://goo.gl/maps/ABC123XYZ'  // Link corto de Google Maps
}
```

### Cambiar colores de botones

```css
/* En styles.css */
.timeline-maps-btn {
    background: linear-gradient(135deg, TU_COLOR_1, TU_COLOR_2);
}

.timeline-maps-btn.maps-btn-bus {
    background: linear-gradient(135deg, TU_COLOR_3, TU_COLOR_4);
}
```

---

**✨ Cambios completados con éxito. La web ahora tiene acompañantes obligatorios validados y timeline interactivo con Google Maps.**