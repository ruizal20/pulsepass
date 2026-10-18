# PulsePass — Plataforma de Eventos y Entradas

**Estudiantes**
- Rolando Ruiz Algarín G2
- Luz Torres Baslanoa G3

---

## 1. Descripción del proyecto

PulsePass es una API REST diseñada para administrar recintos, eventos, artistas, usuarios, perfiles y entradas para eventos.

El proyecto se desarrolla con Java y Spring Boot, utilizando PostgreSQL como sistema de gestión de bases de datos relacionales. Su arquitectura busca mantener la integridad de los datos, separar las responsabilidades de cada componente y facilitar la evolución del sistema.

El desarrollo comprende dos componentes principales:

- **Capa de persistencia:** gestión de entidades, relaciones, consultas, restricciones de integridad y migraciones de base de datos.
- **Capa de seguridad:** autenticación mediante JSON Web Tokens (JWT), almacenamiento seguro de contraseñas y autorización de operaciones según el rol y la identidad del usuario.

PulsePass también incorpora pruebas automatizadas para verificar el funcionamiento de la aplicación y su integración con PostgreSQL.

## 2. Tecnologías utilizadas

| Tecnología | Uso en el proyecto |
|---|---|
| Java 21 | Lenguaje de programación. |
| Spring Boot 4.1.1 | Configuración y ejecución de la aplicación. |
| Spring Web MVC | Implementación de los endpoints REST. |
| Spring Data JPA | Persistencia y consultas a la base de datos. |
| Hibernate | Implementación del mapeo objeto-relacional. |
| PostgreSQL | Sistema de gestión de bases de datos. |
| Flyway | Control de versiones del esquema de la base de datos. |
| Spring Security | Autenticación y autorización de solicitudes. |
| JJWT 0.13.0 | Generación, firma y validación de tokens JWT. |
| BCrypt | Codificación segura de contraseñas. |
| MapStruct 1.6.3 | Conversión entre entidades y objetos DTO. |
| Jakarta Bean Validation | Validación de los datos recibidos por la API. |
| Maven | Gestión de dependencias y construcción del proyecto. |
| JUnit 5 y Spring Boot Test | Pruebas automatizadas. |
| Testcontainers | Pruebas de integración utilizando una instancia real de PostgreSQL en un contenedor. |

## 3. Arquitectura general

La aplicación organiza sus responsabilidades en paquetes para facilitar el mantenimiento y la separación de responsabilidades.

- `controller`: expone los endpoints HTTP y recibe las solicitudes.
- `service`: contiene los servicios y las reglas de negocio.
- `repository`: proporciona el acceso a los datos mediante Spring Data JPA.
- `domain`: contiene las entidades y enumeraciones del modelo.
- `dto`: define los objetos de solicitud y respuesta de la API.
- `mapper`: transforma entidades del dominio en objetos de transferencia de datos.
- `security`: contiene la configuración de Spring Security, los servicios JWT, el filtro de autenticación y los componentes relacionados con la identidad del usuario.
- `exception`: centraliza el manejo de excepciones de la aplicación.
- `src/main/resources/db/migration`: contiene las migraciones SQL administradas por Flyway.

La clase principal de la aplicación es `PulsepassApplication`.

## 4. Modelo de datos y relaciones

El modelo relacional está compuesto por las siguientes entidades:

| Entidad | Descripción |
|---|---|
| `Venue` | Representa los recintos en los que se realizan los eventos. |
| `Event` | Contiene la información de los eventos, sus fechas, estados y recintos asociados. |
| `Artist` | Representa los artistas que pueden participar en los eventos. |
| `User` | Almacena los datos básicos, las credenciales y el rol de cada usuario. |
| `UserProfile` | Contiene la información complementaria del usuario. |
| `Ticket` | Representa las entradas adquiridas para un evento. |

### Relaciones principales

- **Venue (1:N) Event:** un recinto puede albergar varios eventos, pero cada evento está asociado a un recinto.
- **Event (N:M) Artist:** un evento puede contar con varios artistas y un artista puede participar en distintos eventos. La relación se implementa mediante `event_artists`.
- **User (1:1) UserProfile:** cada usuario puede tener un único perfil, cuya relación se protege con una restricción de unicidad sobre `user_id`.
- **User (1:N) Ticket:** un usuario puede adquirir varias entradas.
- **Event (1:N) Ticket:** un evento puede tener varias entradas asociadas.

### Integridad de los datos

El esquema utiliza claves primarias, claves foráneas, restricciones `UNIQUE` y validaciones `CHECK` para proteger la integridad de los datos.

Entre las restricciones implementadas se encuentran:

- Los códigos de recintos, eventos y entradas deben ser únicos.
- La capacidad de un recinto debe ser mayor que cero.
- El precio de una entrada no puede ser negativo.
- Los usuarios deben tener nombres de usuario y correos electrónicos únicos.
- Cada perfil debe estar asociado a un único usuario.
- Los roles de los usuarios están limitados a los valores permitidos por la base de datos.

Hibernate utiliza `ddl-auto: validate` para comprobar que las entidades sean compatibles con el esquema existente, mientras Flyway se encarga de administrar las migraciones.

## 5. Migraciones de Flyway

Las migraciones se encuentran en:

`src/main/resources/db/migration/`

Cada archivo representa una versión del esquema de la base de datos.

| Migración | Descripción |
|---|---|
| `V1__create_schema.sql` | Crea las tablas principales, relaciones, índices y restricciones de integridad. |
| `V2__insert_initial_artist.sql` | Registra los artistas iniciales utilizados en el proyecto. |
| `V3__add_streaming_url_to_event.sql` | Agrega el campo opcional `streaming_url` a la tabla de eventos. |
| `V4__security_credentials_roles.sql` | Incorpora el hash de la contraseña y el rol del usuario, junto con una restricción para los valores de rol permitidos. |

La primera migración crea las tablas `venues`, `events`, `artists`, `event_artists`, `users`, `user_profiles` y `tickets`.

La segunda inserta los siguientes artistas iniciales:

- Solar Beat
- Neon Waves
- Caribbean Sound
- Ocean Drive
- Digital Pulse

La cuarta migración incorpora los campos `password_hash` y `role` a la tabla `users`. Los cambios del esquema se aplican automáticamente al iniciar la aplicación, siempre que Flyway esté habilitado y la conexión a PostgreSQL esté disponible.

**Importante:** las migraciones aplicadas no deben modificarse para cambiar el esquema de una base de datos existente. Los cambios posteriores deben incorporarse en una nueva migración versionada.

## 6. Capa de seguridad

PulsePass incorpora Spring Security y JWT para proteger las operaciones de la API sin depender de sesiones HTTP tradicionales.

### 6.1. Autenticación

El proceso de autenticación funciona de la siguiente manera:

1. El usuario se registra con sus datos personales y una contraseña.
2. La aplicación valida los datos recibidos.
3. La contraseña se codifica mediante BCrypt antes de almacenarse.
4. El usuario inicia sesión utilizando su nombre de usuario o correo electrónico y su contraseña.
5. Spring Security valida las credenciales.
6. Si son correctas, la aplicación genera un token JWT firmado.
7. El cliente envía ese token en las solicitudes que requieren autenticación.

Las contraseñas no se almacenan como texto plano.

### 6.2. JSON Web Tokens

Los tokens JWT contienen información de emisión y expiración y se firman mediante HMAC-SHA-256.

La aplicación valida la firma, el emisor, la expiración y los campos necesarios del token antes de establecer la autenticación del usuario.

La duración predeterminada del token de acceso es de **15 minutos**, configurable mediante `pulsepass.security.jwt.access-token-ttl`.

La autenticación es *stateless*: cada solicitud protegida debe incluir un token válido en lugar de depender de una sesión de servidor.

### 6.3. Roles

La aplicación contempla los siguientes roles:

| Rol | Responsabilidades generales |
|---|---|
| `USER` | Consultar la información permitida de su cuenta, comprar entradas y acceder a sus propias entradas conforme a las reglas de autorización. |
| `STAFF` | Ejecutar operaciones operativas autorizadas, como marcar entradas como utilizadas y consultar determinadas entradas o información no publicada. |
| `ADMIN` | Ejecutar operaciones administrativas autorizadas, como crear y publicar eventos, asociar artistas y acceder a determinadas consultas administrativas. |

Los permisos efectivos dependen de las reglas de autorización configuradas para cada endpoint. Las operaciones sobre recursos personales incluyen comprobaciones de identidad y pertenencia cuando corresponde.

El registro público de usuarios crea cuentas con el rol `USER`. No se debe asumir que existe una cuenta administrativa predeterminada.

### 6.4. Manejo de solicitudes no autorizadas

La configuración de seguridad diferencia entre solicitudes no autenticadas y solicitudes autenticadas que no cuentan con los permisos necesarios.

- **401 Unauthorized:** la solicitud requiere autenticación válida y no se ha proporcionado una credencial válida.
- **403 Forbidden:** el usuario está autenticado, pero no tiene los permisos requeridos.

La aplicación utiliza componentes de manejo de errores para responder a este tipo de situaciones.

### 6.5. Endpoints de autenticación

| Método | Endpoint | Acceso |
|---|---|---|
| `POST` | `/api/auth/login` | Público. |
| `GET` | `/api/auth/me` | Requiere autenticación. |
| `POST` | `/api/users` | Público para el registro de usuarios. |

#### Ejemplo de inicio de sesión

Solicitud a `POST /api/auth/login`:

```json
{
  "identifier": "usuario_o_correo",
  "password": "tu_contraseña"
}
```

Respuesta ilustrativa:

```json
{
  "accessToken": "TOKEN_JWT_GENERADO",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

El valor de `expiresIn` representa la duración del token en segundos. El token mostrado es únicamente ilustrativo.

#### Consultar el usuario autenticado

Enviar una solicitud `GET /api/auth/me` con la cabecera:

```http
Authorization: Bearer TOKEN_JWT_GENERADO
```

La respuesta contiene información del usuario autenticado, como su identificador, nombre de usuario, correo electrónico y rol.

### 6.6. Protección de credenciales

La clave de firma JWT se obtiene mediante una variable de entorno y no debe guardarse en el repositorio.

La clave debe ser aleatoria, contener al menos 32 bytes antes de codificarse en Base64 y mantenerse fuera de archivos públicos.

Las credenciales de la base de datos y las claves criptográficas deben gestionarse mediante variables de entorno o un mecanismo seguro equivalente, de acuerdo con el entorno de ejecución.

## 7. Endpoints principales de la API

Los endpoints disponibles se agrupan por recurso.

### Recintos — `/api/venues`

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/venues/active` | Consulta los recintos activos. |
| `GET` | `/api/venues/{code}` | Consulta un recinto por su código. |

### Artistas — `/api/artists`

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/artists/active` | Consulta los artistas activos. |
| `GET` | `/api/artists/{id}` | Consulta un artista por su identificador. |
| `GET` | `/api/artists/by-stage-name?stageName={stageName}` | Consulta un artista por su nombre artístico. |

### Eventos — `/api/events`

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/events` | Crea un evento; requiere rol `ADMIN`. |
| `GET` | `/api/events/published` | Consulta eventos publicados. |
| `GET` | `/api/events/{eventCode}` | Consulta un evento por su código, sujeto a autorización. |
| `GET` | `/api/events/by-artist?stageName={stageName}` | Consulta eventos por artista, aplicando las reglas de visibilidad. |
| `PATCH` | `/api/events/{eventCode}/publish` | Publica un evento; requiere rol `ADMIN`. |
| `POST` | `/api/events/{eventCode}/artists/{artistId}` | Asocia un artista a un evento; requiere rol `ADMIN`. |
| `GET` | `/api/events/{eventCode}/tickets/paid` | Consulta las entradas pagadas de un evento; requiere rol `STAFF` o `ADMIN`. |

### Usuarios — `/api/users`

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/users` | Registra un usuario. |
| `GET` | `/api/users/by-email?email={email}` | Consulta un usuario por correo, sujeto a autorización. |
| `GET` | `/api/users/by-username?username={username}` | Consulta un usuario por nombre de usuario, sujeto a autorización. |

### Entradas — `/api/tickets`

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/tickets` | Compra una entrada, con validación de identidad y permisos. |
| `GET` | `/api/tickets/{ticketCode}` | Consulta una entrada por código, sujeto a autorización. |
| `GET` | `/api/tickets/by-user?email={email}` | Consulta las entradas de un usuario autorizado. |
| `PATCH` | `/api/tickets/{ticketCode}/cancel` | Cancela una entrada, sujeto a las reglas de propiedad y negocio. |
| `PATCH` | `/api/tickets/{ticketCode}/use` | Marca una entrada como utilizada; requiere rol `STAFF` o `ADMIN`. |

La existencia de un endpoint no implica acceso público. Las solicitudes están sujetas a las reglas globales de Spring Security y a las comprobaciones de autorización implementadas en cada operación.

## 8. Reglas de negocio de las entradas

El servicio de entradas incorpora validaciones para proteger la integridad de las transacciones.

Entre las reglas implementadas se incluyen:

- El usuario debe existir y estar activo.
- La compra debe corresponder a un evento existente y publicado.
- No se permite comprar entradas para eventos que ya ocurrieron.
- Se verifica la edad mínima del evento cuando se dispone de la fecha de nacimiento del usuario.
- Se comprueba la capacidad disponible del recinto a partir de las entradas pagadas.
- El precio se determina en el backend según el tipo de entrada.
- El precio se representa mediante `BigDecimal` para manejar valores monetarios.
- Cuando se completa la capacidad disponible, el evento puede pasar al estado `SOLD_OUT`.
- Solo pueden cancelarse entradas que cumplan las reglas de cancelación.
- Una entrada solo puede marcarse como utilizada cuando su estado lo permite.

Los tipos de entrada contemplados en el servicio incluyen `GENERAL`, `VIP`, `BACKSTAGE` y `STUDENT`.

Estas validaciones se ejecutan en la capa de servicios y complementan las restricciones definidas en la base de datos.

## 9. Requisitos previos

Para ejecutar el proyecto localmente, se necesita:

- Java Development Kit (JDK) 21.
- Docker Desktop instalado y en ejecución para las pruebas que utilizan Testcontainers.
- Git, para clonar el repositorio.
- Una instancia de PostgreSQL accesible para ejecutar la aplicación fuera del entorno de pruebas.
- Maven Wrapper, incluido en el repositorio.

Puedes verificar Java con:

```powershell
java -version
```

Y comprobar la versión de Maven utilizada por el proyecto con:

```powershell
.\mvnw.cmd --version
```

## 10. Configuración del entorno

### 10.1. Conexión a PostgreSQL

La aplicación obtiene los datos de conexión mediante estas variables de entorno:

| Variable | Descripción | Valor predeterminado |
|---|---|---|
| `DB_URL` | URL JDBC de PostgreSQL. | `jdbc:postgresql://localhost:5432/pulsepass` |
| `DB_USER` | Usuario de PostgreSQL. | `postgres` |
| `DB_PASSWORD` | Contraseña de PostgreSQL. | `postgres` |

Los valores predeterminados son adecuados únicamente para un entorno local en el que coincidan con la configuración real de PostgreSQL.

Si la conexión requiere otros datos, configúralos antes de iniciar la aplicación. La base de datos `pulsepass` debe existir y el usuario configurado debe tener los permisos necesarios.

### 10.2. Configuración de JWT

La aplicación utiliza estas propiedades:

| Variable de entorno | Descripción |
|---|---|
| `PULSEPASS_JWT_ISSUER` | Identificador del emisor de los tokens. |
| `PULSEPASS_JWT_SECRET_BASE64` | Clave aleatoria de firma, codificada en Base64. |

La duración del token se configura mediante `pulsepass.security.jwt.access-token-ttl`, cuyo valor predeterminado en la clase de propiedades es `PT15M`.

### 10.3. Generar una clave JWT en PowerShell

Puedes generar una clave aleatoria de 32 bytes para desarrollo local con el siguiente comando:

```powershell
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)

$env:PULSEPASS_JWT_SECRET_BASE64 = [Convert]::ToBase64String($bytes)
$env:PULSEPASS_JWT_ISSUER = "pulsepass-api"

$rng.Dispose()
```

La clave queda definida como variable de entorno para la sesión actual de PowerShell. Si abres una terminal nueva, tendrás que configurar de nuevo las variables, salvo que las gestiones mediante un mecanismo de configuración persistente apropiado.

No publiques el valor de la clave ni lo incluyas en el README, en el código fuente o en archivos versionados.

## 11. Instalación y ejecución local

### Paso 1. Clonar el repositorio

```powershell
git clone https://github.com/ruizal20/pulsepass.git
cd pulsepass
```

### Paso 2. Preparar PostgreSQL

Asegúrate de tener una instancia de PostgreSQL en ejecución y una base de datos llamada `pulsepass`, o configura `DB_URL`, `DB_USER` y `DB_PASSWORD` para apuntar a una base de datos existente.

### Paso 3. Configurar las variables de entorno

Genera la clave JWT descrita en la sección anterior y configura las credenciales de conexión a la base de datos según tu entorno.

### Paso 4. Compilar y ejecutar las pruebas

```powershell
.\mvnw.cmd clean test
```

Este comando limpia los archivos de compilaciones anteriores, compila el proyecto y ejecuta la suite de pruebas automatizadas.

### Paso 5. Iniciar la aplicación

Cuando la base de datos y la configuración estén preparadas, ejecuta:

```powershell
.\mvnw.cmd spring-boot:run
```

La aplicación utiliza el puerto predeterminado de Spring Boot, `8080`, salvo que se configure otro.

Los endpoints pueden consultarse localmente a través de `http://localhost:8080`.

Flyway administra las migraciones y Hibernate valida la compatibilidad del mapeo de entidades con el esquema de base de datos al iniciar la aplicación.

## 12. Pruebas automatizadas

PulsePass incluye pruebas unitarias y pruebas de integración para verificar el comportamiento de los servicios, los controladores, la seguridad y la persistencia.

Las pruebas de integración utilizan Testcontainers para ejecutar PostgreSQL en un contenedor, de manera que pueden verificarse operaciones reales de base de datos en lugar de depender exclusivamente de una simulación.

### Ejecutar todas las pruebas

En Windows:

```powershell
.\mvnw.cmd clean test
```

### Ejecutar una clase de pruebas específica

Por ejemplo:

```powershell
.\mvnw.cmd "-Dtest=PulsepassApplicationTests" test
```

Para las pruebas de integración que utilizan Testcontainers, Docker Desktop debe estar iniciado y el entorno debe permitir ejecutar contenedores.

La ejecución correcta de las pruebas ayuda a comprobar, entre otros aspectos:

- El arranque del contexto de Spring.
- La creación y validación del esquema mediante Flyway.
- La persistencia de entidades y sus relaciones.
- Las restricciones de integridad de PostgreSQL.
- La autenticación y la autorización de solicitudes HTTP.
- El comportamiento de los endpoints protegidos.

## 13. Seguridad y buenas prácticas

Para proteger el proyecto durante su desarrollo y despliegue:

- Nunca almacenes contraseñas de usuarios en texto plano.
- No publiques claves JWT ni contraseñas de base de datos.
- Mantén los secretos fuera del repositorio y de los archivos de configuración versionados.
- Utiliza una clave aleatoria adecuada para la firma JWT.
- Conserva la validación del emisor, la firma y la expiración de los tokens.
- Aplica el principio de mínimo privilegio al asignar roles.
- No permitas que un usuario modifique o consulte recursos de otros usuarios sin autorización.
- Mantén las migraciones de Flyway versionadas.
- Ejecuta las pruebas antes de integrar cambios en la rama principal de desarrollo.

Las variables y los valores de ejemplo documentados aquí están destinados a la configuración local. Un entorno de producción necesita gestionar los secretos mediante un mecanismo seguro y emplear credenciales apropiadas para ese entorno.

## 14. Estado del desarrollo

El proyecto incorpora funcionalidades de persistencia, reglas de negocio para eventos y entradas, y una capa de autenticación y autorización mediante Spring Security y JWT.

La rama de trabajo asociada a la implementación de seguridad es `feature/capa-seguridad`.

Los cambios deben revisarse y validarse mediante pruebas automatizadas antes de integrarlos en `develop`.
