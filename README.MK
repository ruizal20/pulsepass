# PulsePass — Plataforma de Eventos y Entradas

ESTUIANTES
*Rolando Ruiz Algarin
*Luz Torres Baslanoa

Caso de estudio académico enfocado en la implementación de la **Capa de Persistencia** utilizando Spring Boot, JPA, Flyway, PostgreSQL y Testcontainers.

## 1. Descripción del Proyecto
PulsePass es una plataforma diseñada para administrar venues (recintos), eventos, artistas, perfiles de usuario y la emisión de tickets. Este MVP académico prioriza la robustez de los datos, garantizando integridad referencial y soportando consultas frecuentes del negocio directamente a nivel de base de datos y ORM.

## 2. Tecnologías Utilizadas
- **Java 21**[cite: 2, 3]
- **Spring Boot 4.x**
- **Spring Data JPA / Hibernate** (con `ddl-auto: validate`)[cite: 2, 3]
- **PostgreSQL** (Motor relacional principal)[cite: 2, 3]
- **Flyway** (Gestión y control de versiones del esquema de base de datos)[cite: 2, 3]
- **Testcontainers** (Pruebas de integración reproducibles contra PostgreSQL real)[cite: 2, 3]

## 3. Modelo de Datos y Relaciones
El modelo relacional implementado consta de las siguientes asociaciones clave:
- **Venue (1) ──── (N) Event**: Un recinto aloja múltiples eventos.
- **Event (N) ──── (M) Artist**: Un evento cuenta con múltiples artistas asociados mediante la tabla intermedia `event_artists`.
- **User (1) ──── (1) UserProfile**: Cada usuario posee un perfil individual protegido con una restricción de unicidad estricta.
- **User (1) ──── (N) Ticket** y **Event (1) ──── (N) Ticket**: Los tickets relacionan a un usuario con un evento específico, almacenando datos transaccionales (código, tipo, estado y precio con precisión monetaria `BigDecimal`)[cite: 3].

## 4. Migraciones de Flyway (`db/migration`)
El esquema de la base de datos se despliega de forma automatizada mediante tres migraciones versionadas:
1. `V1__create_schema.sql`: Crea las tablas principales (`venues`, `events`, `artists`, `event_artists`, `users`, `user_profiles`, `tickets`) con sus respectivas llaves primarias, foráneas, constraints `UNIQUE` y validaciones `CHECK`[cite: 3].
2. `V2__insert_initial_artists.sql`: Inserta el catálogo inicial de artistas de prueba (*Solar Beat, Neon Waves, Caribbean Sound, Ocean Drive, Digital Pulse*)[cite: 3].
3. `V3__add_streaming_url_to_event.sql`: Agrega la columna opcional `streaming_url` a la tabla de eventos[cite: 3].

## 5. Instrucciones para Ejecutar las Pruebas
Las pruebas de integración validan tanto el comportamiento funcional como la integridad de las restricciones en PostgreSQL utilizando Testcontainers[cite: 3]. 

> **Requisito previo:** Asegúrate de tener **Docker Desktop** abierto y ejecutándose en tu computadora[cite: 3].

Para compilar el proyecto y ejecutar las pruebas de integración, utiliza el siguiente comando de Maven en tu terminal[cite: 2, 3]:
```bash
mvn clean test