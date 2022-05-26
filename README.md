# Skatepark

En este ejercicio se ejercicio se presenta un sitio web que permite el registro de participantes para una competencia de Skate.

- La estructura del sitio es manejada con la dependencia express-handlebars, que permite ordenar mejor el código y manejar variables enviadas desde el servidor de forma directa.
- También se ha usado la dependencia jsonwebtoken para el control de inicio de sesión de los usuarios y una base de datos con postgreSQL para el registro de los mismos.
- Además, se hace uso de express-fileupload para manejar la foto de perfil subida por el usuario y de 'filesystem' para eliminarla de los archivos almacenados, si el usuario decide eliminar su perfil.
Nota: Las imágenes subidas a los servidores de heroku son limpiadas en distintos momentos del día, por lo que no persisten en la aplicación.
- Hay una vista específica para el administrador, a la cual se accede con el correo 'admin@mail.com' y con la clave 'admin123', en la cual se puede cambiar el estado de checkeo de los participantes.


El sitio en cuestion ha sido desplegado en: https://skatepark-tdigital.herokuapp.com/
