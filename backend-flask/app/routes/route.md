## 📑 Endpoints Backend Flask

| Método   | URL                                                       | Descripción                          |
|----------|-----------------------------------------------------------|-------------- 
| POST     | `/auth/login`                                             | Iniciar sesión                       |
| POST     | `/auth/logout`                                            | Cerrar sesión                        |
| PUT      | `/auth/cambiar-password`                                  | Cambiar contraseña                   |
| GET      | `/usuarios/`                                              | Obtener todos los usuarios           |
| GET      | `/usuarios/<id>`                                          | Obtener usuario por ID               |
| POST     | `/usuarios/`                                              | Crear usuario                        |
| PUT      | `/usuarios/<id>`                                          | Actualizar usuario                   |
| DELETE   | `/usuarios/<id>`                                          | Eliminar usuario                     |
| GET      | `/cuidadores/`                                            | Obtener todos los cuidadores         |
| GET      | `/cuidadores/<id>`                                        | Obtener cuidador por ID              |
| POST     | `/cuidadores/`                                            | Crear cuidador                       |
| PUT      | `/cuidadores/<id>`                                        | Actualizar cuidador                  |
| DELETE   | `/cuidadores/<id>`                                        | Eliminar cuidador                    |
| GET      | `/pacientes/`                                             | Obtener todos los pacientes          |
| GET      | `/pacientes/<id>`                                         | Obtener paciente por ID              |
| POST     | `/pacientes/`                                             | Crear paciente                       |
| PUT      | `/pacientes/<id>`                                         | Actualizar paciente                  |
| DELETE   | `/pacientes/<id>`                                         | Eliminar paciente                    |
| GET      | `/guardias/`                                              | Obtener todas las guardias           |
| GET      | `/guardias/<id>`                                          | Obtener guardia por ID               |
| GET      | `/guardias/cuidador/<cuidador_id>`                        | Guardias por cuidador                |
| GET      | `/guardias/paciente/<paciente_id>`                        | Guardias por paciente                |
| POST     | `/guardias/`                                              | Crear guardia                        |
| PUT      | `/guardias/<id>`                                          | Actualizar guardia                   |
| DELETE   | `/guardias/<id>`                                          | Eliminar guardia                     |
| GET      | `/guardias/horas/cuidador/<cuidador_id>`                  | Horas por cuidador                   |
| GET      | `/guardias/horas/cuidador/<cuidador_id>/paciente/<paciente_id>` | Horas por cuidador y paciente |
| GET      | `/pagos/`                                                 | Obtener todos los pagos              |
| GET      | `/pagos/<id>`                                             | Obtener pago por ID                  |
| GET      | `/pagos/cuidador/<cuidador_id>`                           | Pagos por cuidador                   |
| POST     | `/pagos/`                                                 | Crear pago                           |
| PUT      | `/pagos/<id>`                                             | Actualizar pago                      |
| DELETE   | `/pagos/<id>`                                             | Eliminar pago                        |
| PUT      | `/pagos/<id>/confirmar`                                   | Confirmar pago                       |
| POST     | `/documentos/cuidador/<cuidador_id>`                      | Subir documento                      |
| GET      | `/documentos/cuidador/<cuidador_id>`                      | Obtener documentos de cuidador       |
| DELETE   | `/documentos/<id>`                                        | Eliminar documento                   |
| GET      | `/reportes/resumen`                                       | Resumen general                      |
| GET      | `/reportes/cuidadores`                                    | Reporte de cuidadores                |
| GET      | `/reportes/pagos`                                         | Reporte de pagos                     |
| GET      | `/reportes/guardias`                                      | Reporte de guardias por fecha        |

---