# Modelo logico MongoDB Atlas

Este proyecto usa MongoDB Atlas, una base de datos NoSQL documental. Por eso el modelo logico se expresa como colecciones de documentos, referencias `ObjectId`, indices y pipelines de agregacion, no como tablas SQL.

## Colecciones documentales

| Coleccion | Proposito | Relaciones |
| --- | --- | --- |
| `campus` | Documentos de sedes academicas | Referenciado por `promociones` y `profesores` |
| `promociones` | Documentos de cohortes de bootcamp | Guarda `campus: ObjectId` |
| `profesores` | Documentos de docentes | Guarda `campus: ObjectId` y `promociones: ObjectId[]` |
| `alumnos` | Documentos de estudiantes | Guarda `promocion: ObjectId` |
| `proyectos` | Documentos de entregas evaluables | Guarda `promocion: ObjectId` y `profesor: ObjectId` |
| `notas` | Documentos de evaluaciones | Guarda `alumno`, `proyecto` y `profesor` como `ObjectId` |
| `users` | Documentos de autenticacion y roles | Referencia opcional a `profesores` o `alumnos` |

## Indices clave

- `users.email` unico.
- `alumnos.email` unico.
- `profesores.email` unico.
- `promociones.codigo` unico.
- `notas` con indice unico `{ alumno: 1, proyecto: 1 }`.
- Indices por `deletedAt` para soft delete.
- Indices por `campus`, `promocion`, `profesor`, `apto` para filtros y analiticas.

## Relaciones cruzadas pertinentes

- `notas` cruza `alumnos`, `proyectos` y `profesores`. Es la coleccion puente de evaluacion: evita duplicar notas dentro de alumnos o proyectos y permite controlar que un profesor solo modifique notas propias.
- `proyectos` cruza `promociones` y `profesores`. Asi cada entrega queda contextualizada en una cohorte y asignada a un responsable docente.
- `profesores` cruza `campus` y `promociones[]`, porque un profesor pertenece a un campus pero puede participar en varias promociones.
- `users` cruza autenticacion con dominio academico mediante `profesor` o `alumno` opcional, segun el rol.
- Los endpoints analiticos cruzan `notas -> proyectos -> promociones -> campus` con `$lookup`.

## Criterio de modelado NoSQL

Se usan referencias por `ObjectId` para mantener documentos pequenos e independientes, facilitar CRUD por recurso y permitir reporting con pipelines de agregacion. Las agregaciones conectan `notas` con `proyectos`, `promociones` y `campus` usando `$lookup`.

Se evita embeber notas dentro de alumnos porque una nota pertenece simultaneamente a alumno, proyecto y profesor; si se embebiera, habria duplicacion y actualizaciones mas fragiles.
