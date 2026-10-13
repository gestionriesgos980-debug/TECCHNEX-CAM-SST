# TECCHNEX · CAM-SST-01C — Revisión UX de campo

Evolución quirúrgica de CAM-SST-01B. Se conserva la misma base IndexedDB y la estructura funcional.

## Cambios de este bloque
- Corrección del helper de transacciones IndexedDB para usar una sola transacción por operación.
- Indicador discreto de guardado local.
- Gestión SST compacta: los campos adicionales permanecen ocultos hasta marcar que el aspecto requiere gestión.
- Eliminación individual de fotografías desde el propio registro, para corregir una captura sin volver a la oficina.
- Mejoras responsive para celular: navegación sticky, botones a ancho completo y tarjetas de registros apiladas.
- Se mantiene la metodología SST abierta; no se agregan fórmulas de valoración.

## Criterio
Lo que sirve no se toca. CAM-SST-01C cambia solo UX y robustez del prototipo anterior; no modifica el sistema de Inspecciones estable.


## CAM-SST-02 — Modelo de información
- Formaliza el registro como contexto + aspecto + evidencia + gestión + acción + seguimiento.
- Mantiene la base de CAM-SST-01C.
- Versiona el registro como `CAM-SST-02` y normaliza registros existentes.
- Permite exportar la evaluación actual a JSON.
- No incorpora todavía metodología, fórmulas ni criterios de valoración SST.


## CAM-SST-02C — Evidencias interactivas
Este bloque agrega únicamente una vista de consulta sobre las fotografías que ya se almacenan:
- La tarjeta Fotografía del tablero abre la galería local.
- Se puede buscar por cliente, sede y aspecto.
- Cada imagen conserva su vínculo con el aspecto que la originó.
- Al pulsar una imagen se abre una vista ampliada.
No se cambia el modelo de almacenamiento ni la captura de fotografías.


## CAM-SST-02D — Tablero explícito
- La pantalla `home` sigue siendo el tablero principal.
- Se agregó el alias de navegación `dashboard` sin eliminar `home`.
- El logotipo TECCHNEX abre el tablero.
- La barra inferior tiene ahora una entrada explícita `Tablero`.
- Las vistas internas tienen un retorno directo al tablero.
- No se modifica el almacenamiento, el modelo de datos ni la captura de fotografías.


## CAM-SST-02E — Navegación estable
- Se corrigió el alias `dashboard` para abrir la vista `home` existente.
- Las métricas mantienen destinos determinísticos.
- La tarjeta de fotografías abre y refresca su galería.
- Registros tiene un retorno explícito al tablero.
- No se modifica almacenamiento, modelo de datos, captura fotográfica ni lógica de evaluación.


## CAM-SST-02F — Corrección de acceso a fotografías
Se corrigió la apertura de la tarjeta Fotográfias:
- La tarjeta tiene un destino explícito `evidenceView`.
- El enrutador abre y actualiza la galería al entrar.
- Se mantiene la vista `home` como tablero principal y `dashboard` como alias.
- No se cambia la estructura de almacenamiento ni la captura de fotografías.


## CAM-SST-02G — Conexiones del tablero
Conexiones activas:
- Evaluaciones → Registros
- Aspectos → Biblioteca
- Categorías → Biblioteca
- Fotografías → Fotografías y evidencias
- Núcleo común → detalle expandible
- Pendiente de confirmar → detalle expandible
- Modelo de información → detalle expandible
- Logo / Tablero → tablero principal

### Cómo abrir y probar
1. Extrae el ZIP en una carpeta.
2. Abre esa carpeta en VS Code.
3. Abre `index.html`.
4. Recomendado: usar la extensión **Live Server** de VS Code y pulsar **Go Live**.
5. La dirección local normalmente será algo como `http://127.0.0.1:5500/` o `http://localhost:5500/`.

También puedes abrir `index.html` directamente con Chrome/Edge, pero para este proyecto es preferible Live Server porque permite probar mejor la navegación y los módulos locales.


## CAM-SST-02H — Tarjetas funcionales
Se corrigió el inicializador de JavaScript que impedía cargar `app.js`. El archivo anterior contenía código duplicado después del manejador de tarjetas, provocando un error de sintaxis y dejando toda la interfaz sin eventos.
Se reconstruyó el bloque de inicialización sin modificar almacenamiento, modelo de datos, aspectos, fotografías ni rutas de trabajo.
También se eliminó un atributo `data-go` duplicado en la tarjeta Fotografías.

### Validación
- Sintaxis de `app.js` comprobada con Node.js.
- El tablero y las tarjetas se prueban ahora desde el mismo archivo servido por Live Server.


## CAM-SST-03A — Registros funcionales
- Resumen de evaluaciones, hallazgos, gestión SST y fotografías.
- Búsqueda por cliente, sede, lugar e inspector.
- Filtros por hallazgos, gestión SST y fotografías.
- Abrir una evaluación existente.
- Ver detalle rápido del registro.
- Eliminar una evaluación usando el flujo ya existente.
- No se modifica el almacenamiento ni el modelo de datos.


## CAM-SST-03B — Biblioteca funcional
La tarjeta Categorías ahora abre una biblioteca de trabajo:
- Muestra las categorías reales derivadas de los 50 aspectos.
- Permite buscar por categoría.
- Cada tarjeta abre una nueva evaluación directamente en el paso de aspectos, filtrada por esa categoría.
- La biblioteca no cambia la definición de los aspectos ni la metodología SST.


## CAM-SST-03C — Evidencias funcionales
La tarjeta Fotografías ahora abre una galería de trabajo:
- búsqueda por cliente, sede, lugar, inspector o aspecto;
- filtro por categoría;
- vista ampliada de la fotografía;
- fecha de captura/registro;
- vínculo directo para abrir la evaluación de origen;
- al abrirla, el usuario llega al paso de aspectos y se filtra por la categoría de la evidencia.

No se cambia el almacenamiento de fotografías ni se duplica el archivo.


## CAM-SST-03D — Color de tarjetas
Ajuste exclusivamente visual:
- Las cuatro tarjetas principales usan una acentuación de color distinta.
- Se mantienen colores suaves de fondo para conservar legibilidad.
- Las tarjetas de categorías adoptan un color de acento alternado.
- No se modifica navegación, almacenamiento, modelo de datos ni funciones.


## CAM-SST-03E — Estado de la evaluación
Se aprovecha el panel que estaba vacío en el tablero para mostrar:
- última evaluación guardada;
- estado preliminar: En proceso / Lista para revisión;
- cliente y sede;
- aspectos calificados;
- hallazgos;
- fotografías;
- fecha de actualización;
- acciones para abrir la evaluación o ver Registros.

Es un bloque informativo y de navegación. No modifica la metodología SST ni el almacenamiento.


## CAM-SST-03G — Pulido del tablero
- Compacta ligeramente el bloque principal para reducir espacio vacío.
- Reserva más espacio inferior para que la navegación fija no tape contenido.
- Actualiza la etiqueta visible a "GESTIÓN SST · PROTOTIPO".
- No modifica lógica, almacenamiento, fotografías ni navegación.


## CAM-SST-03H — Inicio guiado de nueva evaluación
El botón "+ Nueva evaluación" abre primero un paso breve de contexto:
- Cliente
- Sede / centro de trabajo
- Lugar / área
- Inspector / responsable
- Fecha
- Tipo de evaluación

El registro no se guarda hasta pulsar "Crear y continuar". Al confirmar, se crea la evaluación y se abre el formulario existente en el paso 1.
No se modifican los 50 aspectos, las fotografías, la navegación existente ni la metodología de valoración.


## CAM-SST-03I — Contexto validado
Después de "Crear y continuar", el contexto HSEQ se refleja en una barra visible dentro de la evaluación:
- Cliente
- Sede
- Área/lugar
- Inspector
- Fecha

Además:
- "Editar contexto" retorna al mismo registro.
- Editar el contexto no crea una evaluación duplicada.
- El tipo de evaluación queda fijo en "Inspección HSEQ general".
- Los 50 aspectos, fotografías y estructura de almacenamiento no se modifican.


## CAM-SST-03J — Corrección de Crear y continuar
Se corrigió específicamente el botón "Crear y continuar":
- El botón ahora tiene un `onclick` directo asignado al iniciar la aplicación.
- La operación está protegida con try/catch para mostrar un error claro si ocurre una excepción.
- El contexto HSEQ se guarda y después se abre la vista de evaluación.
- La barra de contexto ahora solo aparece dentro de la evaluación, no debajo del formulario de inicio.
- No se cambian los 50 aspectos, almacenamiento, fotografías ni la metodología.


## CAM-SST-03K — Corrección de selectores de componentes
Se corrigió un problema que impedía avanzar desde "Crear y continuar":
- Los selectores `$()` y `$$()` ahora aceptan correctamente un elemento padre.
- Esto permite que los controles creados dentro de cada tarjeta/aspecto se configuren sobre su propio componente.
- El fallo anterior ocurría al construir los aspectos: se buscaban controles dentro de todo el documento en lugar de dentro de la tarjeta recién creada, provocando una excepción antes de abrir la evaluación.
- No se modifica el almacenamiento, el modelo de datos ni la metodología.


## CAM-SST-03L — Consistencia visual de botones
Ajuste exclusivamente visual del tablero y módulos:
- botones principales con identidad TECCHNEX azul;
- botones secundarios con fondo blanco y borde suave;
- estados hover/focus consistentes;
- acciones de eliminación conservan su señal visual de riesgo;
- navegación inferior con estados más claros;
- no se modifican funciones, navegación, almacenamiento ni datos.


## CAM-SST-03M — Captura en campo
Se mejora únicamente la experiencia del Paso de aspectos:
- barra de progreso 0/50;
- estado "Capturado" / "Pendiente" por aspecto;
- filtro "Solo pendientes";
- botón "Siguiente pendiente";
- separación visual de aspectos capturados y pendientes;
- el porcentaje se basa solo en que exista calificación, hallazgo o fotografía; no implica cumplimiento normativo.
- no se modifica la estructura de datos ni la metodología de valoración.


## CAM-SST-03N — Resumen funcional
El paso 3 del flujo ahora presenta un resultado preliminar útil:
- título "Inspección HSEQ general";
- cliente y sede;
- aspectos capturados sobre 50;
- hallazgos;
- fotografías;
- no conformes;
- estado "En proceso" o "Lista para revisión".

El cálculo es solo de captura de información. No representa valoración de riesgo ni cumplimiento normativo.


## CAM-SST-03O — Ajuste del Paso 1
Corrección visual y de navegación del paso Contexto:
- el botón Continuar queda dentro de una fila de acciones claramente visible;
- en celular la fila se mantiene sobre la navegación inferior fija;
- se agrega un regreso directo al Tablero sin modificar los campos;
- no se cambia almacenamiento, modelo de datos, fotografías ni metodología.


## CAM-SST-03P — Aspectos de campo
Ajuste del Paso 2 para facilitar captura rápida:
- encabezado compacto del bloque;
- leyenda de pendiente/capturado;
- botones rápidos C / NC / NA;
- la selección rápida sincroniza con el campo de calificación existente;
- no se altera la metodología de valoración.


## CAM-SST-03Q — Botones principales un poco más grandes
Ajuste exclusivamente visual solicitado:
- botones del bloque principal un poco más grandes;
- botones del estado de evaluación ligeramente ampliados;
- mejor área táctil para celular;
- no se modifica ninguna función, navegación, almacenamiento ni datos.


## CAM-SST-03R — Aspectos con mejor área táctil
Ajuste exclusivamente visual del Paso 2:
- mayor área táctil para C / NC / NA;
- botones de fotografía más cómodos;
- campos con altura mínima más consistente;
- en celular los controles se apilan para facilitar la captura.
No se modifica JavaScript, almacenamiento, modelo de datos ni metodología.


## CAM-SST-03S — Captura de aspecto
Se refuerza la experiencia de captura del Paso 2:
- cada aspecto muestra que la información queda guardada localmente;
- C/NC/NA actualiza el estado sin reconstruir toda la lista;
- el hallazgo actualiza el estado de captura después del guardado;
- las fotografías actualizan el estado y el contador del aspecto;
- se mantiene la misma estructura de almacenamiento.
No se incorpora todavía valoración de riesgo ni metodología SST.


## CAM-SST-03T — Registros pulidos
Ajuste del módulo Registros:
- cada evaluación muestra estado "En proceso" o "Lista para revisión";
- muestra el avance de aspectos capturados;
- agrega inspector y fecha de actualización;
- Detalle incluye aspectos capturados, hallazgos, no conformes, fotografías y gestión SST;
- no se modifica ninguna acción existente ni el almacenamiento.


## CAM-SST-03U — Hallazgos funcionales
Primer módulo específico reutilizable del núcleo común:
- acceso desde "Núcleo común" → Hallazgos;
- resumen de hallazgos, no conformes, con fotografías e inspecciones;
- búsqueda y filtros;
- muestra categoría, aspecto, descripción, cliente, sede, lugar, fecha y fotografías;
- "Abrir evaluación" devuelve al registro de origen.
No se modifica el almacenamiento ni la estructura de los hallazgos existentes.


## CAM-SST-03V — Hallazgos pulidos
Ajuste exclusivamente visual del módulo Hallazgos:
- tarjetas ligeramente más compactas;
- mejor jerarquía del título y estado;
- descripción más legible sin ocupar tanto espacio;
- metadatos más discretos;
- acción "Abrir evaluación" más clara;
- se conserva la codificación naranja / rojo.
No se modifican datos, navegación, almacenamiento ni funciones.


## CAM-SST-03W — Seguimiento funcional
Se incorpora Seguimiento como módulo del núcleo común, leyendo únicamente los campos ya existentes:
- acción preliminar;
- responsable;
- fecha objetivo;
- estado de la acción;
- estado/resultado del seguimiento.

Incluye resumen, búsqueda, filtro por estado y retorno a la evaluación de origen.
No se modifican las estructuras existentes ni se inventan valores metodológicos.


## CAM-SST-04A — Acción desde hallazgo
Se habilita en cada aspecto un panel plegable "Gestión SST" que utiliza los campos ya preparados:
- requiere gestión;
- acción preliminar;
- responsable;
- fecha objetivo;
- estado;
- resultado/seguimiento.

La información se guarda dentro del mismo registro y alimenta el módulo Seguimiento.
No se define todavía ninguna fórmula ni metodología de valoración de riesgos.


## CAM-SST-04B — Gestión SST visible
Se mejora únicamente el descubrimiento del bloque de gestión:
- si un aspecto tiene hallazgo o está marcado NC, "Gestión SST" se abre automáticamente;
- se muestra una indicación cuando hay un hallazgo sin acción definida;
- el sistema no crea acciones automáticamente;
- el usuario debe definir la acción, responsable, fecha y estado;
- el módulo Seguimiento continuará leyendo esos datos existentes.


## CAM-SST-04C — Estado de seguimiento
Se normaliza el estado del seguimiento sin alterar la acción existente:
- Pendiente
- En seguimiento
- Verificado
- Cerrado

Los registros anteriores que ya tengan resultado o fecha de seguimiento, pero mantengan el estado "Pendiente", se presentan como "En seguimiento" para evitar la contradicción observada en la prueba.
El cierre/verificación no se asigna automáticamente: queda bajo decisión del usuario.


## CAM-SST-04D — Seguimiento normalizado
Corrección derivada de la prueba real:
- si existe resultado o fecha de seguimiento pero el estado aún es "Pendiente", el sistema lo normaliza a "En seguimiento";
- la normalización se persiste en el mismo registro;
- el módulo muestra por separado "Estado de acción" y "Estado de seguimiento";
- no se inventan estados de verificación/cierre.


## CAM-SST-05A — Roles y flujo
Se agrega una vista de diseño, sin autenticación ni permisos todavía:
- Perfil de trabajo "Inspector de campo".
- Perfil de trabajo "Responsable de gestión".
- Flujo específico para cada perfil.
- Métricas que se alimentan de los registros actuales.
- Acceso desde el Núcleo común.
Este bloque sirve para validar el reparto real del trabajo antes de implementar usuarios, permisos o cuentas.


## CAM-SST-05B — Verificación y cierre
Se completa el último tramo del ciclo de gestión:
- fecha de verificación;
- resultado de verificación;
- evidencia fotográfica de verificación;
- estados Verificado y Cerrado requieren fecha y resultado de verificación;
- Cerrado no se permite antes de registrar la verificación;
- las evidencias se guardan vinculadas al mismo aspecto/evaluación con `kind="verification"`.
No se cambian las evidencias existentes ni el historial de la acción.

## CAM-SST-06C — Informe primero, Word como recipiente

La plantilla maestra `templates/HSEQ_INFORME_TODO_EN_TABLA.docx` se conserva como recipiente documental: aporta configuración de página, estilos, encabezado y pie. El cuerpo completo del informe se construye desde los datos reales de CAM-SST.

El generador ya no depende de filas, tablas o fotografías de demostración preexistentes dentro del cuerpo del Word. Esto permite que el informe crezca de forma dinámica según el número real de aspectos, hallazgos y fotografías.

### Flujo
1. La evaluación se captura y guarda normalmente en IndexedDB.
2. En el paso 3 (`Resumen`) se pulsa **Generar informe Word**.
3. La aplicación toma la evaluación actual, los 50 aspectos y las fotografías asociadas.
4. La plantilla se carga solo al generar el informe y se utiliza como recipiente visual/documental; el cuerpo se construye desde cero con los datos de CAM-SST.
5. El resultado se descarga como `.docx`.

### Integración realizada
- Tabla maestra contenedora como estructura del informe.
- Datos del cliente integrados desde el inicio.
- Consolidado por categorías calculado desde los 50 aspectos.
- Estado de acciones calculado desde los registros guardados.
- Tabla de aspectos evaluados alimentada desde `data/aspects.js` y la evaluación actual.
- Fotografías vinculadas al aspecto insertadas en la misma fila.
- Hallazgos y gestión generados desde los aspectos con NC o descripción de hallazgo.
- Seguimiento, verificación y firmas alimentados con la información existente.
- Se eliminan del informe generado los textos de demostración de la maqueta.

### Regla de protección
`TECCHNEX_CAM-SST-05B_MASTER_CONGELADA` no se modifica. CAM-SST-06B se desarrolla sobre una copia derivada.


### CAM-SST-06B diagnóstico de generación
CAM-SST-06C abandona la dependencia de la plantilla de ejecución liviana. El recipiente es la plantilla maestra aprobada y el cuerpo del informe se genera completamente desde los datos reales, registrando la etapa exacta del proceso ante un error.


### CAM-SST-06B · Corrección 02
Se corrigió la expansión de la tabla de aspectos: la plantilla maestra contiene filas de ejemplo y el generador ahora las duplica hasta cubrir todos los aspectos reales antes de rellenarlos. También se reforzaron las validaciones de la plantilla gráfica de fotografías y de las relaciones XML para producir errores más precisos.
