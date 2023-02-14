# Héroes App V2.

Esta aplicación permite coleccionar tus héroes favoritos de DC-Comics y Marvel-Comics y realizar tus propias creciones, pudiendo escoger en qué editorial afiliarla. La misma fue completamente diseñada con Material Design, Angular Flex Layout y Bootstrap, para brindar al usuario una vista amigable y estilizada de la aplicación, junto con una experencia responsive.

Los usuarios podrán registrarse, creándose para ello una cuenta única, la cual puede ser personalizada, editada o eliminada. Por razones de seguridad la contraseña del usuario se guarda encriptada. Asimismo, en cada login se le otorga un token único al usuario mediante el cual se validará su sesión y permanencia en la aplicación.

Por otra parte, los usuarios pueden consultar la galería de héroes, sus propios héroes creados, agregar nuevos personajes a la galería y editar o borrar sólo sus creaciones. También podrán dejar comentarios personalizados en cada uno de los héroes que integren la galegaría, pudiendo editar o borrar únicamente sus propios comentarios.

También se incluye un panel de control, desde el cual un usuario con privilegios de administrador puede moderar usuarios, héroes y comentarios. 

Los administradores tienen la capacidad de bloquear o reactivar usuarios y editar o eliminar héroes o comentarios. Cómo medida de seguridad el sistema no permite que los administradores se bloqueen o reactiven entre sí. Asimismo, un usuario administrador puede también desarrollar todas la actividades propias de un usuario común (crear héroes, dejar comentarios, etc.). 

La aplicación también permite realizar búsquedas con sugerencias en tiempo real, por nombre de héroe, alter ego o habilidades del personaje.

A continuación les copio el link a la documentación del backend que sirve de guía para comprender el uso de cada uno de los servicios implementados: https://documenter.getpostman.com/view/17109440/2s935rKNsC.

## Notas:

Este proyecto fue generado con [Angular CLI] versión 13.3.12.

Para probar la app en desarrollo:

Primero deben ejecutar el archivo "db_dump.sql" en algún cliente de mysql, para reconstruir la base de datos que consume la aplicación.

Para levantar el backend, pueden instalar xampp. En dicho caso, deben copiar la carpeta del proyecto en el directorio 'xampp/htdocs' e iniciar el apache.

Por último, desde la consola, estando posicionado en la carpeta fronted 'xampp/htdocs/heroesApp-V2/frontend', deben ejecutar los siguientes comandos:


```
npm install
```

```
ng serve -o
```

Para construir el build, recuerden:

```
ng build --configuration=production
```