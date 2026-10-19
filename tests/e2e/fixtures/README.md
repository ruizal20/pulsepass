Fixtures E2E de PulsePass
Propósito
Preparar datos locales para la ejecución manual de Postman sin añadir endpoints administrativos a la API. Este seed es solo para una base PostgreSQL local llamada pulsepass_e2e.
Orden de uso
1. Arranca PulsePass contra pulsepass_e2e para que Flyway cree el esquema.
2. Registra desde POST /api/users las cuentas USER_A, USER_B, ADMIN fixture, STAFF fixture e INACTIVE_USER usando las variables declaradas en PulsePass-local.
3. Conecta tu cliente SQL a pulsepass_e2e explícitamente.
4. Ejecuta seed-e2e.sql.
5. Consulta /api/venues/active; copia VEN-E2E-001 a venueActiveCode.
6. Haz login nuevo para ADMIN y STAFF, y copia los tokens manualmente.
El seed usa los correos iniciales de PulsePass-local.postman_environment.json (runId e2e001). Si cambias esos correos o el runId, ajusta el SQL para hacerlos coincidir.
Prueba de token previo de usuario inactivo
El seed deja pulsepass.inactive.e2e001@example.test inactivo. Para comprobar que un JWT emitido antes de desactivar la cuenta deja de funcionar, en la base pulsepass_e2e (y solo allí):
1. Reactiva temporalmente al usuario con UPDATE users SET active = TRUE WHERE email = 'pulsepass.inactive.e2e001@example.test';.
2. En Postman envía el login de ese usuario y copia accessToken a inactiveToken.
3. Vuelve a desactivarlo con UPDATE users SET active = FALSE WHERE email = 'pulsepass.inactive.e2e001@example.test';.
4. Envía AUTH-NEG-08 — Token previo tras inactivar usuario; se espera 401.
Antes de cualquiera de esas sentencias, verifica que la conexión sigue siendo pulsepass_e2e; no ejecutes estos updates en otras bases.
Seguridad
El archivo tiene una guarda por nombre de base de datos que aborta si la base actual no es pulsepass_e2e. Aun así, confirma visualmente la conexión en tu cliente SQL antes de ejecutarlo. No ejecutes el seed en desarrollo compartido, staging o producción.
Las contraseñas se establecen mediante el registro HTTP, y la aplicación usa BCrypt. El seed no establece ni imprime contraseñas ni hashes.