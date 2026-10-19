PulsePass — Pruebas E2E manuales con Postman
Fase 5 del proyecto académico. Esta carpeta implementa los artefactos de ejecución manual previstos en PRD_PulsePass_Pruebas_E2E_Postman_Manual.pdf.
Entregables incluidos
- postman/PulsePass-Manual-E2E.postman_collection.json: colección Postman v2.1 con las 22 rutas de negocio/autenticación organizadas por dominio y escenarios de seguridad/validación duplicados donde es necesario.
- postman/PulsePass-local.postman_environment.json: plantilla sin contraseñas ni JWT (incluye wrongPassword vacío para que ingreses una contraseña de prueba incorrecta localmente).
- fixtures/README.md: preparación, roles privilegiados y seguridad del ambiente.
- fixtures/seed-e2e.sql: fixture exclusivo para la base pulsepass_e2e; inserta un recinto y promueve cuentas de prueba a ADMIN/STAFF o inactiva una cuenta.
- checklist-e2e-manual.md: lista de ejecución manual.
- registro-ejecucion-manual.md: bitácora rellenable; no declara pruebas como aprobadas anticipadamente.
- matriz-cobertura-e2e.md: relación entre rutas, actores, expectativas y evidencia.
- .gitignore: exclusión de exportaciones privadas/secretos.
Reglas obligatorias del PRD
1. Ejecuta cada solicitud manualmente desde la interfaz de Postman pulsando Send.
2. No usar Collection Runner, Newman, Postman CLI ni scripts.
3. Las pestañas Pre-request Script y Tests/Post-response deben permanecer vacías.
4. Inspecciona Status, Headers y Body. Un 200 no basta: confirma campos, rol, visibilidad y estado persistido con una lectura posterior.
5. Marca PASS, FAIL, BLOCKED o NOT RUN en la bitácora. No marques como PASS algo que no enviaste.
6. Nunca compartas una exportación de entorno que contenga contraseñas o tokens.
1. Requisitos
- JDK 21 y Maven Wrapper del repositorio.
- Docker Desktop iniciado si las pruebas automatizadas usan Testcontainers.
- PostgreSQL local.
- Postman Desktop o Postman Web con agente de escritorio.
- Permiso para crear una base de datos local de pruebas y ejecutar SQL en ella.
2. Preparar una base E2E separada
Usa una base dedicada, llamada pulsepass_e2e. No uses una base de producción, staging, desarrollo compartido ni la base de tu curso con información que necesites conservar.
Ejemplo en psql con usuario que pueda crear bases de datos:
CREATE DATABASE pulsepass_e2e;
Configura en la sesión de PowerShell desde donde iniciarás PulsePass:
$env:DB_URL = 'jdbc:postgresql://localhost:5432/pulsepass_e2e'
$env:DB_USER = 'postgres'
$env:DB_PASSWORD = 'TU_PASSWORD_LOCAL'
Define también el emisor y genera una clave aleatoria solo para el ambiente local E2E:
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$env:PULSEPASS_JWT_SECRET_BASE64 = [Convert]::ToBase64String($bytes)
$env:PULSEPASS_JWT_ISSUER = 'pulsepass-api'
$rng.Dispose()
No escribas el valor de la clave en el repositorio, README, colección, capturas o bitácora.
3. Arrancar la aplicación
Desde la raíz del proyecto en otra terminal, con esas variables establecidas:
.\mvnw.cmd spring-boot:run
Espera a que Spring Boot termine de iniciar y confirme la conexión con PostgreSQL/Flyway. Mantén esa terminal abierta.
Importante para el código actual: comprueba que src/main/resources/application.yaml tenga pulsepass: al nivel raíz, fuera de spring:, y que la aplicación arranque con las variables del ambiente principal. Las pruebas con src/test/resources/application.yaml no sustituyen esta verificación.

4. Importar en Postman
1. Abre Postman.
2. Usa Import.
3. Importa postman/PulsePass-Manual-E2E.postman_collection.json.
4. Importa postman/PulsePass-local.postman_environment.json.
5. Selecciona el ambiente PulsePass-local en el selector de ambientes.
6. Abre Environments y rellena las variables secret (userAPassword, userBPassword, adminPassword, staffPassword, inactivePassword). Usa contraseñas de prueba de 12–72 caracteres, nunca contraseñas personales/reales.
7. Comprueba baseUrl=http://localhost:8080. Puedes cambiarlo si la app está en otro host.
8. Antes de compartir/commitear un environment exportado, asegúrate de que las variables de contraseña y tokens sigan vacías.
La plantilla no guarda contraseñas ni tokens. Los JWT se copian manualmente del accessToken de la respuesta de login a su variable local (userAToken, userBToken, adminToken, staffToken). No hay scripts de captura automática.
5. Preparar datos y actores
5.1 Artistas
La migración V2 crea artistas de catálogo, entre ellos Solar Beat. No asumas sus IDs; envía GET /api/artists/active, copia el ID real y el stageName exacto a artistId y artistStageName.
5.2 Registrar usuarios de prueba
Envía manualmente estas peticiones de la carpeta 03A Preparación de actores / fixtures:
1. Registrar USER_B.
2. Registrar ADMIN fixture como usuario normal.
3. Registrar STAFF fixture como usuario normal.
4. Registrar usuario que se inactivará.
La primera carpeta 03 Auth / usuarios contiene el registro de USER_A. Todos los cuerpos se basan en RegisterUserRequest (incluyen phone y city). Cada password debe tener entre 12 y 72 caracteres.
5.3 Recinto y roles privilegiados
Después del registro, ejecuta fixtures/seed-e2e.sql conectándote explícitamente a pulsepass_e2e. El script se detiene si la base de datos actual no se llama exactamente pulsepass_e2e. Inserta/actualiza un recinto de prueba y convierte las cuentas ADMIN/STAFF a los roles correspondientes; marca el usuario de prueba como inactivo.
Después del SQL:
1. Envía GET /api/venues/active y copia el code del recinto VEN-E2E-001 a venueActiveCode.
2. Envía GET /api/artists/active; copia id y stageName reales.
3. Haz login de nuevo como ADMIN y STAFF después del cambio de rol; copia sus tokens en adminToken y staffToken.
4. Revisa GET /api/auth/me por cada actor; el campo role debe ser el esperado.
El registro público debe asignar USER. No envíes un role para conseguir privilegios; el script SQL se limita al entorno E2E.
6. Secuencia recomendada de pruebas
1. Venues y artistas: ejecutar todos los requests de 01 y 02, identificar valores reales y completar variables.
2. Registro y login: registro de USER_A y USER_B, sus logins y /api/auth/me. Repetir login para ADMIN/STAFF tras el seed.
3. Usuarios/propiedad: consultar USER_A por email/username; luego ejecutar como USER_B las pruebas negativas de acceso ajeno.
4. Eventos: con ADMIN crea el evento eventToPublishCode en borrador; asocia artista; publícalo; copia el código publicado en publishedEventCode; confirma que aparece en /published y en búsqueda por artista.
5. Borradores: crea draftEventCode separado y prueba visibilidad con visitante y USER. No publiques ese evento antes de terminar las verificaciones negativas.
6. Compra de entradas: como USER_A compra dos entradas PAID independientes: copia una a ticketCancelableCode y la otra a ticketUsableCode.
7. Antes de mutar estados, ejecuta los casos negativos de propiedad: USER_B intenta consultar/cancelar ticket de A y marcarlo como usado; USER_A intenta comprar usando email de B. Comprueba que siguen sin cambios antes de continuar.
8. Ciclo de vida válido: consulta/lista entradas, como STAFF consulta entradas pagadas, USER_A cancela la entrada cancelable y STAFF marca la otra como USED. Comprueba cada transición con una lectura posterior.
9. Errores y transiciones repetidas: ejecuta validaciones, duplicados y repetición de cancelación/uso solo después de la transición válida correspondiente.
10. Bitácora: registrar status esperado/observado, campos, estado, evidencia y resultado. Lo omitido queda NOT RUN; lo que no puede ejecutarse por prerrequisito queda BLOCKED.
Tokens
- userAToken: solo tras login de USER_A.
- userBToken: solo tras login de USER_B.
- adminToken: login después de promover la cuenta a ADMIN.
- staffToken: login después de promover la cuenta a STAFF.
Los tokens de acceso duran normalmente 900 segundos (15 minutos). Si expiran, vuelve a iniciar sesión y reemplaza manualmente la variable. No compartas tokens.
7. Contratos que se inspeccionan
Éxito: código exacto esperado (200 o 201), Content-Type JSON cuando corresponda, DTO real y efectos de negocio persistidos.
Error: inspecciona los campos del ErrorResponse: timestamp, status, error, message, details. El status debe coincidir con HTTP y no deben revelarse stack traces, hashes, passwords o secretos.
Escenarios importantes:
- visitante anónimo frente a endpoint protegido: 401;
- usuario autenticado en operación ADMIN/STAFF: 403;
- USER_B frente a usuario/ticket de USER_A: denegación definida por el contrato (para la implementación actual de AuthorizationService, espera 403 en los casos encontrados por ID/correo);
- datos inválidos: 400;
- registros duplicados o transición de negocio no permitida: 409;
- recurso inexistente: 404.
Usa el resultado real del servidor y el contrato. No aceptes 403/404 indiscriminadamente; si el código observado difiere, márcalo FAIL hasta revisar la regla aplicable.
8. Restablecer y repetir
La forma más sencilla de repetir todo de forma limpia es utilizar una base pulsepass_e2e desechable y recrearla solo después de confirmar que estás conectado a esa base. Al recrearla, reaplicarás Flyway y deberás volver a crear las cuentas de prueba y ejecutar el seed. Nunca hagas resets sobre otras bases.
Si no vas a borrar la base, cambia usernames/correos y códigos de evento de forma consistente, y adapta el SQL de fixtures. Los endpoints de GET no crean datos; las peticiones POST, PATCH cancel y PATCH use sí pueden cambiar el estado y requieren un plan de repetición.
9. Resultado de la entrega
La colección está preparada para importar y ejecutar manualmente, pero la evidencia de ejecución debe llenarse durante la sesión real de Postman. No se considera aprobada ninguna ruta que no haya sido enviada y verificada. Entrega los archivos bajo tests/e2e/ junto con la colección, la plantilla de environment, checklist, bitácora diligenciada y matriz de cobertura.