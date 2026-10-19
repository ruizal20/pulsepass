Checklist de ejecución manual E2E
Ambiente: ____________________  runId: ____________________  Fecha: ____________________
Ejecutor/a: ____________________  Versión/commit del backend: ____________________
Antes de iniciar, selecciona PulsePass-local y revisa tests/e2e/README.md. No uses Collection Runner.
Preflight
- [ ] Aplicación Spring Boot arrancada con perfil/configuración principal.
- [ ] DB_URL apunta a la base dedicada pulsepass_e2e.
- [ ] Flyway completó las migraciones V1-V4.
- [ ] PULSEPASS_JWT_SECRET_BASE64 configurada fuera del repositorio, mínimo 32 bytes aleatorios en Base64.
- [ ] Colección y ambiente importados en Postman.
- [ ] Contraseñas de prueba cargadas solo localmente como valores secretos.
- [ ] V2 muestra artistas; se copiaron artistId y artistStageName reales.
- [ ] Usuarios A/B/admin/staff/inactivo registrados; ejecutado el seed exclusivo E2E.
- [ ] venueActiveCode obtenido por GET; login renovado para ADMIN y STAFF; roles comprobados en /api/auth/me.
- [ ] eventDate es una fecha futura aceptada por el backend.
Rutas nominales (22)
ID	Ruta / operación	Actor	Esperado	Resultado	Evidencia/nota
VEN-01	GET /api/venues/active	Anónimo	200	NOT RUN	
VEN-02	GET /api/venues/{code}	Anónimo	200	NOT RUN	
ART-01	GET /api/artists/active	Anónimo	200	NOT RUN	
ART-02	GET /api/artists/{id}	Anónimo	200	NOT RUN	
ART-03	GET /api/artists/by-stage-name	Anónimo	200	NOT RUN	
USR-01	POST /api/users	Anónimo	201	NOT RUN	
AUTH-01	POST /api/auth/login	USER_A	200	NOT RUN	
AUTH-02	GET /api/auth/me	USER_A	200	NOT RUN	
USR-02	GET /api/users/by-email	Propietario/ADMIN	200	NOT RUN	
USR-03	GET /api/users/by-username	Propietario/ADMIN	200	NOT RUN	
EVT-01	POST /api/events	ADMIN	201	NOT RUN	
EVT-02	GET /api/events/{eventCode}	Público publicado / autorizado	200	NOT RUN	
EVT-03	GET /api/events/published	Anónimo	200	NOT RUN	
EVT-04	PATCH /api/events/{eventCode}/publish	ADMIN	200	NOT RUN	
EVT-05	POST /api/events/{eventCode}/artists/{artistId}	ADMIN	200	NOT RUN	
EVT-06	GET /api/events/by-artist	Anónimo	200	NOT RUN	
TKT-01	POST /api/tickets	USER_A propietario	201	NOT RUN	
TKT-02	GET /api/tickets/{ticketCode}	Propietario/STAFF/ADMIN	200	NOT RUN	
TKT-03	GET /api/tickets/by-user	Propietario/ADMIN	200	NOT RUN	
TKT-04	GET /api/events/{eventCode}/tickets/paid	STAFF/ADMIN	200	NOT RUN	
TKT-05	PATCH /api/tickets/{ticketCode}/cancel	Propietario/ADMIN	200	NOT RUN	
TKT-06	PATCH /api/tickets/{ticketCode}/use	STAFF/ADMIN	200	NOT RUN	


Casos negativos mínimos
- [ ] Login con contraseña incorrecta: 401 uniforme.
- [ ] Token ausente en endpoint protegido: 401.
- [ ] Token inválido/malformado en /api/auth/me: 401.
- [ ] Login por email y por username: 200 para USER_A.
- [ ] Identificador inexistente: 401 genérico.
- [ ] Token manipulado, token en query y Bearer inválido en ruta pública: denegación esperada.
- [ ] Token expirado e identidad inactiva (incluido token previo): 401; si no se preparó/preparó token, marcar BLOCKED.
- [ ] Token con otra firma/issuer: 401 o BLOCKED si falta token de prueba seguro.
- [ ] USER intenta crear/publicar evento y asociar artista: 403.
- [ ] Visitante intenta consultar evento DRAFT: denegación, sin datos del borrador.
- [ ] USER_B consulta usuario de USER_A por email y username: 403/contrato establecido.
- [ ] USER_A compra usando email de USER_B: denegación, sin ticket creado.
- [ ] USER_B consulta/cancela ticket de USER_A: denegación y estado sin cambios.
- [ ] USER intenta listar tickets pagados del evento: 403.
- [ ] USER_B intenta marcar ticket como usado antes del uso válido: 403 y estado sigue PAID.
- [ ] Registro inválido: 400; ErrorResponse coherente.
- [ ] Registro duplicado: 409.
- [ ] Registrar con role=ADMIN no concede ese rol.
- [ ] Segunda cancelación de ticket: 409; permanece CANCELLED.
- [ ] Segundo uso de ticket: 409; permanece USED.
Comprobación por caso
- [ ] Status HTTP exacto coincide con el contrato.
- [ ] Body corresponde al DTO real.
- [ ] ErrorResponse tiene timestamp, status, error, message, details en errores.
- [ ] No aparecen passwords, hashes, tokens ni stack traces en respuestas.
- [ ] Las mutaciones denegadas no modificaron la base de datos (lectura posterior con actor autorizado).
- [ ] Se copiaron IDs/códigos manualmente solo después de revisar la respuesta.
- [ ] Las pestañas Pre-request Script y Tests/Post-response están vacías.
- [ ] Se usó Send individual; no Collection Runner/Newman.
- [ ] Bitácora completada; casos no ejecutados no están marcados PASS.
Resumen: PASS ____ | FAIL ____ | BLOCKED ____ | NOT RUN ____
Defectos/bloqueos abiertos:
-