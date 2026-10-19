-- PulsePass - fixtures exclusivos de E2E manual.
-- PRECONDICION: conexión actual a la base pulsepass_e2e.
-- Registra primero las cuentas mediante POST /api/users.

DO $$
BEGIN
    IF current_database() <> 'pulsepass_e2e' THEN
        RAISE EXCEPTION 'SEGURIDAD: seed-e2e.sql solo puede ejecutarse en pulsepass_e2e. Base actual: %', current_database();
    END IF;
END $$;

-- Recinto controlado para los eventos creados por Postman.
INSERT INTO venues (code, name, city, address, capacity, active)
VALUES ('VEN-E2E-001', 'Recinto PulsePass E2E', 'Santa Marta', 'Dirección ficticia E2E', 500, TRUE)
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    address = EXCLUDED.address,
    capacity = EXCLUDED.capacity,
    active = TRUE;

-- Rechazar seed parcial: los usuarios deben haberse registrado previamente por la API.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'pulsepass.admin.e2e001@example.test') THEN
        RAISE EXCEPTION 'Falta registrar ADMIN fixture por POST /api/users.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'pulsepass.staff.e2e001@example.test') THEN
        RAISE EXCEPTION 'Falta registrar STAFF fixture por POST /api/users.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'pulsepass.inactive.e2e001@example.test') THEN
        RAISE EXCEPTION 'Falta registrar INACTIVE_USER por POST /api/users.';
    END IF;
END $$;

UPDATE users SET role = 'ADMIN', active = TRUE
WHERE email = 'pulsepass.admin.e2e001@example.test';

UPDATE users SET role = 'STAFF', active = TRUE
WHERE email = 'pulsepass.staff.e2e001@example.test';

UPDATE users SET role = 'USER', active = FALSE
WHERE email = 'pulsepass.inactive.e2e001@example.test';

-- Intencionalmente no se almacenan ni imprimen contraseñas o tokens en este archivo.
