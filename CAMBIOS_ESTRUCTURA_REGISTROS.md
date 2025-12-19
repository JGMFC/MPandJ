# 🔄 Cambios Estructurales - Nueva Arquitectura de Registros

## 📊 Cambio Principal: De Invitado con Lista → Registros Individuales

### Antes (Estructura Antigua)
```
1 Formulario enviado = 1 Fila en Google Sheets

| Nombre Principal | Num Acompañantes | Lista Acompañantes | Teléfono | Alergias |
|------------------|------------------|-------------------|----------|----------|
| Juan Pérez | 2 | 1) Ana López \| 2) Luis García | +34612345678 | Gluten |
```

**Problema**: No podíamos tener teléfono y alergias individuales por acompañante.

---

### Ahora (Nueva Estructura)
```
1 Formulario enviado = N Filas en Google Sheets (1 por persona)

| Nombre | Teléfono | Alergias | Es Principal |
|--------|----------|----------|--------------|
| Juan Pérez | +34612345678 | Gluten | Sí |
| Ana López | +34623456789 | Lactosa | No |
| Luis García | +34634567890 | | No |
```

**Ventaja**: Cada persona tiene su propia información de contacto y restricciones alimentarias.

---

## ✅ Cambios Implementados

### 1. HTML - Formularios Reestructurados

#### ❌ Eliminado:
- Sección completa de autobús (`bus-section`)
- Campo "Número de acompañantes"
- Lista dinámica de nombres de acompañantes
- Checkboxes de tramos de autobús

#### ✅ Nuevo:
- **Tarjeta de Invitado Principal** con campos individuales:
  - Nombre y apellidos
  - Teléfono (prefijo + número)
  - Alergias/intolerancias

- **Sección de Acompañantes** con:
  - Botón "Añadir acompañante" 
  - Cada acompañante tiene su propia tarjeta con los mismos campos
  - Botón "Eliminar" por acompañante

**Ejemplo de HTML generado dinámicamente:**
```html
<!-- Invitado Principal -->
<div class="person-card" data-person-index="0" data-is-main="true">
    <input name="name-0" id="name-daimiel-0" ...>
    <input name="phone-0" id="phone-daimiel-0" ...>
    <textarea name="allergies-0" id="allergies-daimiel-0" ...>
</div>

<!-- Acompañante #1 (dinámico) -->
<div class="person-card companion-card" data-person-index="1" data-is-main="false">
    <button class="remove-companion-btn">Eliminar</button>
    <input name="name-1" id="name-daimiel-1" ...>
    <input name="phone-1" id="phone-daimiel-1" ...>
    <textarea name="allergies-1" id="allergies-daimiel-1" ...>
</div>
```

---

### 2. JavaScript - Lógica Completamente Nueva

#### Nuevas Funciones Principales:

##### `addCompanion(eventId)`
```javascript
// Añade dinámicamente una nueva tarjeta de acompañante
// - Clona estructura HTML
// - Asigna IDs únicos (person-index)
// - Scroll suave hasta el nuevo campo
```

##### `removeCompanion(eventId, index)`
```javascript
// Elimina un acompañante con animación
// - Fade out + scale down
// - Remueve del DOM
// - Renumera acompañantes restantes
```

##### `collectFormData(form, eventId)`
```javascript
// Recopila todos los datos del formulario
// ANTES: 1 objeto con arrays de acompañantes
// AHORA: Array de objetos (1 por persona)

return {
    persons: [
        {
            nombre_apellidos: "Juan Pérez",
            prefijo: "+34",
            telefono: "612345678",
            alergias: "Gluten",
            es_principal: true
        },
        {
            nombre_apellidos: "Ana López",
            prefijo: "+34",
            telefono: "623456789",
            alergias: "",
            es_principal: false
        }
    ],
    consent: true,
    event: "daimiel"
}
```

##### `validateForm(formData, eventId)`
```javascript
// Valida cada persona individualmente
formData.persons.forEach((person, index) => {
    // Nombre: obligatorio y mínimo 2 palabras
    // Teléfono: obligatorio y solo números
});
```

##### `handleFormSubmit(e, eventId)`
```javascript
// Envía payload con array de personas a Google Apps Script
const payload = {
    evento: eventId,
    personas: formData.persons.map(person => ({
        ...person,
        consentimiento: formData.consent ? 'Sí' : 'No',
        origen_url: window.location.href,
        user_agent: navigator.userAgent
    }))
};

fetch(CONFIG.ENDPOINT_URL, {
    method: 'POST',
    body: JSON.stringify(payload)
});
```

#### Variables Globales:
```javascript
let companionCounters = {
    daimiel: 1,  // Empieza en 1 (0 es principal)
    arequipa: 1
};
```

---

### 3. CSS - Nuevos Estilos

#### ❌ Eliminado:
- `.bus-section`, `.bus-route`, `.bus-route-number`, `.bus-route-info`
- `.bus-options` (del formulario)
- `.bus-description`, `.bus-title`
- Responsive para rutas de bus

#### ✅ Nuevo:

##### Tarjetas de Personas (`.person-card`)
```css
.person-card {
    padding: 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    border-left: 4px solid var(--color-orange);
    transition: all 0.4s;
}

.person-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.person-card[data-is-main="true"] {
    border-left-color: var(--color-terracota);
    background: linear-gradient(135deg, rgba(243, 214, 193, 0.1) 0%, white 50%);
}
```

##### Botón Añadir Acompañante (`.add-companion-btn`)
```css
.add-companion-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, var(--color-green) 0%, var(--color-green-dark) 100%);
    color: white;
    border-radius: 25px;
    box-shadow: 0 4px 12px rgba(153, 166, 111, 0.3);
}

.add-companion-btn:hover svg {
    transform: rotate(90deg);  /* Animación del icono + */
}
```

##### Botón Eliminar Acompañante (`.remove-companion-btn`)
```css
.remove-companion-btn {
    background: linear-gradient(135deg, var(--color-coral) 0%, var(--color-terracota) 100%);
    color: white;
    border-radius: 20px;
    box-shadow: 0 3px 10px rgba(238, 128, 131, 0.3);
}
```

##### Header de Acompañante (`.companion-header`)
```css
.companion-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1rem;
    border-bottom: 2px solid var(--color-peach);
}
```

#### Responsive:
```css
@media (max-width: 768px) {
    .companions-header {
        flex-direction: column;
        align-items: stretch;
    }
    
    .add-companion-btn {
        width: 100%;
        justify-content: center;
    }
}
```

---

### 4. Google Apps Script - Backend Multiregistro

#### Nueva Estructura de Columnas:
```javascript
const COLUMNS = [
    'timestamp',
    'evento',
    'nombre_apellidos',
    'prefijo',
    'telefono',
    'alergias',
    'es_principal',        // NUEVO: Identifica al invitado principal
    'consentimiento',
    'origen_url',
    'user_agent'
];
```

**Columnas Eliminadas:**
- `num_acompanantes`
- `acompanantes`
- `acompanantes_json`
- `bus_tramos`

#### Función `doPost()` Actualizada:
```javascript
function doPost(e) {
    const data = JSON.parse(e.postData.contents);
    
    // Validar que venga array de personas
    if (!Array.isArray(data.personas)) {
        return createResponse(400, { error: 'Estructura inválida' });
    }
    
    const sheet = getOrCreateSheet(data.evento);
    
    // CREAR UNA FILA POR CADA PERSONA
    data.personas.forEach((person, index) => {
        const row = [
            new Date().toISOString(),
            data.evento,
            person.nombre_apellidos || '',
            person.prefijo || '+34',
            person.telefono || '',
            person.alergias || '',
            person.es_principal ? 'Sí' : 'No',  // Marca principal vs acompañante
            person.consentimiento || 'No',
            person.origen_url || '',
            person.user_agent || ''
        ];
        
        sheet.appendRow(row);
    });
    
    return createResponse(200, {
        success: true,
        message: `${data.personas.length} persona(s) registrada(s)`
    });
}
```

---

## 📋 Ejemplo de Flujo Completo

### Usuario en la Web:
1. Completa su información (Juan Pérez, +34612345678, "Gluten")
2. Hace clic en "Añadir acompañante"
3. Completa info de Ana López (+34623456789, "Lactosa")
4. Hace clic en "Añadir acompañante"
5. Completa info de Luis García (+34634567890, sin alergias)
6. Hace clic en "Confirmar Asistencia"

### Envío al Backend:
```json
{
  "evento": "daimiel",
  "personas": [
    {
      "nombre_apellidos": "Juan Pérez García",
      "prefijo": "+34",
      "telefono": "612345678",
      "alergias": "Gluten",
      "es_principal": true,
      "consentimiento": "Sí",
      "origen_url": "https://...",
      "user_agent": "Mozilla..."
    },
    {
      "nombre_apellidos": "Ana López Ruiz",
      "prefijo": "+34",
      "telefono": "623456789",
      "alergias": "Lactosa",
      "es_principal": false,
      "consentimiento": "Sí",
      "origen_url": "https://...",
      "user_agent": "Mozilla..."
    },
    {
      "nombre_apellidos": "Luis García Martín",
      "prefijo": "+34",
      "telefono": "634567890",
      "alergias": "",
      "es_principal": false,
      "consentimiento": "Sí",
      "origen_url": "https://...",
      "user_agent": "Mozilla..."
    }
  ]
}
```

### Resultado en Google Sheets (Hoja "daimiel"):
| TIMESTAMP | EVENTO | NOMBRE APELLIDOS | PREFIJO | TELEFONO | ALERGIAS | ES PRINCIPAL | CONSENTIMIENTO |
|-----------|---------|------------------|---------|----------|----------|--------------|----------------|
| 2026-01-15T10:30:00.000Z | daimiel | Juan Pérez García | +34 | 612345678 | Gluten | Sí | Sí |
| 2026-01-15T10:30:00.000Z | daimiel | Ana López Ruiz | +34 | 623456789 | Lactosa | No | Sí |
| 2026-01-15T10:30:00.000Z | daimiel | Luis García Martín | +34 | 634567890 | | No | Sí |

**✅ 3 filas creadas (1 por persona)**

---

## 🎯 Ventajas de la Nueva Estructura

### 1. **Datos Completos por Persona**
- ✅ Cada acompañante tiene su propio teléfono
- ✅ Cada acompañante puede especificar sus alergias
- ✅ Fácil de contactar individualmente

### 2. **Análisis Más Sencillo**
```javascript
// Filtrar todos los principales
=FILTER(A:J, G:G="Sí")

// Contar acompañantes
=COUNTIF(G:G, "No")

// Todas las personas con alergias
=FILTER(A:J, F:F<>"")

// Agrupar por teléfono (familias)
=UNIQUE(D:D)
```

### 3. **Exportación Directa**
- ✅ No necesita parsear JSON
- ✅ Cada fila es una persona → perfecto para etiquetas, mesas, etc.
- ✅ Importación directa a CRM/Excel

### 4. **Sin Límite de Acompañantes**
- ✅ Añade tantos como quieras
- ✅ No hay campo de "número máximo"
- ✅ Interfaz más intuitiva

---

## 🔧 Configuración Post-Despliegue

### 1. Actualizar Google Apps Script
```
1. Abre Google Sheets
2. Extensiones → Apps Script
3. BORRA el código antiguo
4. Pega el contenido de Code.gs (nuevo)
5. Reemplaza SHEET_ID
6. Implementar → Nueva implementación
7. Copia la URL del webhook
```

### 2. Actualizar script.js
```javascript
const CONFIG = {
    ENDPOINT_URL: 'https://script.google.com/macros/s/TU_URL/exec',  // ← Pegar aquí
    WHATSAPP_COMMUNITY_URL: 'https://chat.whatsapp.com/TU_LINK',
    // ...
};
```

### 3. Probar Localmente
```bash
# En c:\Users\JavierGarcía\Downloads\Web_10\
python -m http.server 8000

# Abrir http://localhost:8000
# Llenar formulario con 1 principal + 2 acompañantes
# Verificar que se crean 3 filas en Sheets
```

---

## 📊 Comparativa de Archivos

| Archivo | Cambios | Líneas Modificadas |
|---------|---------|-------------------|
| `index.html` | Reestructuración completa de formularios | ~150 líneas |
| `script.js` | Nueva lógica de gestión de personas | Completo reescrito |
| `styles.css` | Eliminados estilos bus, añadidos person-card | ~200 líneas |
| `Code.gs` | Nueva estructura de columnas y bucle | Completo reescrito |

---

## ✅ Testing Checklist

### Formulario
- [ ] Invitado principal aparece correctamente
- [ ] Botón "Añadir acompañante" funciona
- [ ] Cada acompañante tiene campos independientes
- [ ] Botón "Eliminar" remueve acompañante
- [ ] Renumeración automática funciona
- [ ] Validación de nombre (min 2 palabras) funciona
- [ ] Validación de teléfono (solo números) funciona

### Backend
- [ ] Google Apps Script desplegado correctamente
- [ ] SHEET_ID actualizado en Code.gs
- [ ] URL del webhook copiada a script.js
- [ ] Envío de formulario crea múltiples filas
- [ ] Columna "ES PRINCIPAL" correcta (Sí/No)
- [ ] Timestamps idénticos para el mismo grupo

### UI/UX
- [ ] Tarjetas de personas se ven bien
- [ ] Animaciones de añadir/eliminar fluidas
- [ ] Responsive en móvil
- [ ] Scroll automático al añadir funciona
- [ ] Colores coherentes con tema acuarela

---

## 🚀 Próximos Pasos Opcionales

1. **Agrupación Visual en Sheets**
   - Añadir columna "grupo_id" para identificar familias
   - Mismo timestamp o UUID para el mismo envío

2. **Confirmación Individual**
   - Email/SMS a cada persona con su QR único
   - Tracking individual de asistencia

3. **Dashboard de Estadísticas**
   - Total de personas registradas
   - Distribución de alergias
   - Gráficos por evento

---

**✨ Migración completada con éxito. La web ahora maneja cada persona como un registro independiente con su propia información de contacto y restricciones alimentarias.**
