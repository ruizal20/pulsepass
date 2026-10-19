Registro de ejecución manual E2E — PulsePass
Esta bitácora es una plantilla. 

Fecha de ejecución: ____________________
Ejecutor/a: ____________________
Commit/versión desplegada: ____________________
Base E2E: pulsepass_e2e
Ambiente Postman: PulsePass-local
runId: ____________________
Estados permitidos: PASS = respuesta y efecto observados coinciden; FAIL = hay discrepancia/500 inesperado; BLOCKED = falta precondición; NOT RUN = no se ejecutó.
ID	Fecha/hora	Actor	Solicitud	HTTP esperado	HTTP observado	Body/estado observado	Resultado	Evidencia / observación
VEN-01	—	ANONYMOUS	GET /api/venues/active	200	—	—	NOT RUN	—
VEN-02	—	ANONYMOUS	GET /api/venues/{code}	200	—	—	NOT RUN	—
ART-01	—	ANONYMOUS	GET /api/artists/active	200	—	—	NOT RUN	—
ART-02	—	ANONYMOUS	GET /api/artists/{id}	200	—	—	NOT RUN	—
ART-03	—	ANONYMOUS	GET /api/artists/by-stage-name	200	—	—	NOT RUN	—
USR-01	—	ANONYMOUS	POST /api/users	201	—	—	NOT RUN	—
AUTH-01	—	USER_A	POST /api/auth/login	200	—	—	NOT RUN	—
AUTH-02	—	USER_A	GET /api/auth/me	200	—	—	NOT RUN	—
USR-02	—	OWNER/ADMIN	GET /api/users/by-email	200	—	—	NOT RUN	—
USR-03	—	OWNER/ADMIN	GET /api/users/by-username	200	—	—	NOT RUN	—
EVT-01	—	ADMIN	POST /api/events	201	—	—	NOT RUN	—
EVT-02	—	PUBLIC PUBLISHED / AUTHORIZED	GET /api/events/{eventCode}	200	—	—	NOT RUN	—
EVT-03	—	ANONYMOUS	GET /api/events/published	200	—	—	NOT RUN	—
EVT-04	—	ADMIN	PATCH /api/events/{eventCode}/publish	200	—	—	NOT RUN	—
EVT-05	—	ADMIN	POST /api/events/{eventCode}/artists/{artistId}	200	—	—	NOT RUN	—
EVT-06	—	ANONYMOUS	GET /api/events/by-artist	200	—	—	NOT RUN	—
TKT-01	—	USER_A OWNER	POST /api/tickets	201	—	—	NOT RUN	—
TKT-02	—	OWNER/STAFF/ADMIN	GET /api/tickets/{ticketCode}	200	—	—	NOT RUN	—
TKT-03	—	OWNER/ADMIN	GET /api/tickets/by-user	200	—	—	NOT RUN	—
TKT-04	—	STAFF/ADMIN	GET /api/events/{eventCode}/tickets/paid	200	—	—	NOT RUN	—
TKT-05	—	OWNER/ADMIN	PATCH /api/tickets/{ticketCode}/cancel	200	—	—	NOT RUN	—
TKT-06	—	STAFF/ADMIN	PATCH /api/tickets/{ticketCode}/use	200	—	—	NOT RUN	—
SEC-01	—	ANONYMOUS	POST /api/events sin token	401	—	—	NOT RUN	—
SEC-02	—	USER_A	POST /api/events	403	—	—	NOT RUN	—
SEC-03	—	USER_A	PATCH /api/events/{code}/publish	403	—	—	NOT RUN	—
SEC-04	—	USER_A	POST /api/events/{code}/artists/{id}	403	—	—	NOT RUN	—
SEC-05	—	ANONYMOUS	GET evento DRAFT	401	—	—	NOT RUN	—
SEC-06	—	USER_B	GET usuario USER_A por email	403	—	—	NOT RUN	—
SEC-07	—	USER_B	GET usuario USER_A por username	403	—	—	NOT RUN	—
SEC-08	—	USER_A	Comprar ticket para USER_B	403	—	—	NOT RUN	—
SEC-09	—	USER_B	GET ticket de USER_A	403	—	—	NOT RUN	—
SEC-10	—	USER_B	GET tickets de USER_A	403	—	—	NOT RUN	—
SEC-11	—	USER_B	Cancelar ticket de USER_A	403	—	—	NOT RUN	—
SEC-12	—	USER_A	GET entradas pagadas	403	—	—	NOT RUN	—
SEC-13	—	USER_B	Marcar ticket ajeno como usado	403	—	—	NOT RUN	—
AUTH-ERR-01	—	ANONYMOUS	POST /api/auth/login contraseña incorrecta	401	—	—	NOT RUN	—
AUTH-NEG-01	—	ANONYMOUS	GET /api/auth/me sin token	401	—	—	NOT RUN	—
AUTH-NEG-02	—	ANONYMOUS	Login identificador inexistente	401	—	—	NOT RUN	—
AUTH-NEG-03	—	USER_A	Login por email	200	—	—	NOT RUN	—
AUTH-NEG-04	—	USER_A	JWT manipulado	401	—	—	NOT RUN	—
AUTH-NEG-05	—	ANONYMOUS	Token en query string	401	—	—	NOT RUN	—
AUTH-NEG-06	—	ANONYMOUS	Bearer inválido en ruta pública	401	—	—	NOT RUN	—
AUTH-NEG-07	—	INACTIVE_USER	Login usuario inactivo	401	—	—	NOT RUN	—
AUTH-NEG-08	—	INACTIVE_USER	Token previo tras inactivar usuario	401	—	—	NOT RUN	—
AUTH-NEG-09	—	USER_A	JWT expirado	401	—	—	NOT RUN	—
AUTH-NEG-10	—	ANONYMOUS	Firma/issuer diferente	401 o BLOCKED	—	—	NOT RUN	—
HTTP-01	—	ANONYMOUS	POST /api/users payload inválido	400	—	—	NOT RUN	—
HTTP-02	—	ANONYMOUS	POST /api/users duplicado	409	—	—	NOT RUN	—
BIZ-01	—	OWNER	Segunda cancelación	409	—	—	NOT RUN	—
BIZ-02	—	STAFF	Segundo uso de ticket	409	—	—	NOT RUN	—
SEC-14	—	ANONYMOUS	Inyección de role=ADMIN en registro	201 o 400; jamás ADMIN	—	—	NOT RUN	—


Resumen al cierre
- PASS: ____
- FAIL: ____
- BLOCKED: ____
- NOT RUN: ____
- Rutas nominales únicas cubiertas de 22: ____ / 22
- Defectos registrados: ____
- Capturas/evidencias anexas (sin secretos): ____
Defectos / incompatibilidades encontrados
ID	Caso	Comportamiento esperado	Comportamiento observado	Pasos para reproducir	Severidad/estado
D-01	—	—	—	—	—


Observaciones:
- Nunca pegar aquí contraseñas, hashes BCrypt, accessToken, PULSEPASS_JWT_SECRET_BASE64 ni información personal real.
- Para una denegación a una operación que modifica datos, anotar la respuesta y la lectura posterior que demuestra que no hubo mutación.
- Si una respuesta difiere del PRD, registrar el caso como FAIL hasta analizar el contrato; no ajustar la expectativa solamente para hacer pasar la prueba.