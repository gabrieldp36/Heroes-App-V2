<?php
    //Importaciones.
    require_once(__DIR__ . '/../config/config.php');
    require_once(__DIR__ . '/../config/cors.php');

    /************************************* BBDD ****************************************/

    function conectarBD()
    {
        $link = mysqli_connect(DBHOST, DBUSER, DBPASS, DBBASE);
        if ($link === false) {
            print 'Error al conectarse a la Base de Datos: ' . mysqli_connect_error();
            outputError(500);
        };
        mysqli_set_charset($link, 'utf8');
        return $link;
    };

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {    
       return 0;    
    };

    date_default_timezone_set('America/Argentina/Buenos_Aires');

    /***************************************CONFIG JWT*************************************/

    define('JWT_KEY', 'DayR7RxvEM4T4efkoEZBSV4E5E47DArq8vxiB3O_zeL0yjMpogyFIV0pTqJv6llMkCOJK'); // Secret or Private Key.
    define('JWT_ALG', 'HS256'); // Algoritmos de encriptación.
    define('JWT_EXP', 10800); // El token posee un tiempo de duración de 3h.

    /***************************************SEGURIDAD*************************************/

    if (!function_exists('getallheaders')) {
        function getallheaders() {
            $headers = array();
            $copy_server = array(
                'CONTENT_TYPE'   => 'Content-Type',
                'CONTENT_LENGTH' => 'Content-Length',
                'CONTENT_MD5'    => 'Content-Md5',
            );
            foreach ($_SERVER as $key => $value) {
                if (substr($key, 0, 5) === 'HTTP_') {
                    $key = substr($key, 5);
                    if (!isset($copy_server[$key]) || !isset($_SERVER[$key])) {
                        $key = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', $key))));
                        $headers[$key] = $value;
                    };
                } elseif (isset($copy_server[$key])) {
                    $headers[$copy_server[$key]] = $value;
                };
            };
            if (!isset($headers['Authorization'])) {
                if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
                    $headers['Authorization'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
                } elseif (isset($_SERVER['PHP_AUTH_USER'])) {
                    $basic_pass = isset($_SERVER['PHP_AUTH_PW']) ? $_SERVER['PHP_AUTH_PW'] : '';
                    $headers['Authorization'] = 'Basic ' . base64_encode($_SERVER['PHP_AUTH_USER'] . ':' . $basic_pass);
                } elseif (isset($_SERVER['PHP_AUTH_DIGEST'])) {
                    $headers['Authorization'] = $_SERVER['PHP_AUTH_DIGEST'];
                };
            };
            return $headers;
        };
    };

    spl_autoload_register(function ($nombre_clase) {
        include __DIR__.'/'.str_replace('\\', '/', $nombre_clase) . '.php';
    });

    /****************************USO LIBRERÍA JWT**************************/

    use \Firebase\JWT\JWT;

    /***************************** RUTEO *********************************/

    $metodo = strtolower($_SERVER['REQUEST_METHOD']);
    $comandos = explode('/', strtolower($_GET['comando']));
    $funcionNombre = $metodo.ucfirst($comandos[0]);

    $parametros = array_slice($comandos, 1);
    if(count($parametros) >0 && $metodo == 'get'){
    	$funcionNombre = $funcionNombre.'ConParametros';
    };
    if(function_exists($funcionNombre)) {
    	call_user_func_array ($funcionNombre, $parametros);
    }
    else {
    	header(' ', true, 400);
    };

    /***************************** SALIDA ********************************/

    function output($val, $headerStatus = 200) {
    	header(' ', true, $headerStatus);
    	header('Content-Type: application/json');
    	print json_encode($val);
    	die;
    };

    function outputError($headerStatus, $mensaje="") {
    	header(' ', true, $headerStatus);
    	header('Content-Type: application/json');
    	print json_encode([ 'ok' => false, 'msg' => $mensaje]);
    	die;
    };

    function outputJson($data, $codigo = 200) {
        header('', true, $codigo);
        header('Content-type: application/json');
        print json_encode($data);
        die;
    };

    /*************************AUTENTICACIÓN Y LOGUEO DE USUARIOS*****************************/

    function autenticar($correo, $password) {
        // Establecemos conexión con la base de datos.
    	$link = conectarBD();
        // Verificamos que en la BD exista un usuario con el correo ingresado.
        $sql = "SELECT * FROM usuario WHERE correo = '$correo'";
        $result = mysqli_query($link, $sql);
        if ($result === false) {
            outputError( 500, "Falló la consulta: " . mysqli_error($link));
        };
        if (mysqli_num_rows($result) == 0) {
            return false;
        };
    	$fila = mysqli_fetch_assoc($result);
        // Realizamos la verificación del password.
        if (!hash_equals($fila['password'], crypt($password, $fila['password']))) {
            return false;
        };
        // Enviamos los datos del usuario autenticado.
    	return [
            'id' => $fila['id'],
            'nombre' => $fila['nombre'],
    		'correo' => $fila['correo'],
            'url_foto' => $fila['url_foto'],
            'admin' => $fila['admin'],
            'estado' => $fila['estado'],
    	];
    };

    function postLogin() {
        // Establecemos conexión con la base de datos.
        $link = conectarBD();
        // Obtenemos la info que es enviada en el body de la request.
    	$data = json_decode(file_get_contents("php://input"), true);
        // Revisamos que el formato sea correcto.
        if (json_last_error()) {
            outputError(400, "El formato de datos es incorrecto");
        };
        // Validamos que se envíen credenciales de acceso.
        if ( !isset($data['correo']) || trim($data['correo']) == "" || $data['correo'] == null ) {
            outputError(400, "El correo es obligatorio.");
        };
        if ( !isset($data['password']) || trim($data['password']) == "" || $data['password'] == null ) {
            outputError(400, "La contraseña es obligatoria.");
        };
        // Guardamos la data recibida, haciendo la debida sanitización de la misma.
        $correo = mysqli_real_escape_string($link, $data['correo']);
        $password = mysqli_real_escape_string($link, $data['password']);
        // Autenticamos al usuario que intenta loguearse.
    	$usuario = autenticar($correo, $password);
    	if($usuario === false) {
    		outputError(401, "Correo y/o password incorrectos");
    	}
        if($usuario['estado'] == 0) {
            outputError(401, "Usuario bloqueado o eliminado. Consulte con el administrador.");
        }
        // Generamos el Payload del JWT
    	$payload = [
    		'id' => $usuario['id'],
            'nombre' => $usuario['nombre'],
            'correo' => $usuario['correo'],
            'url_foto' => $usuario['url_foto'],
            'admin' => $usuario['admin'],
    		'exp' => time() + JWT_EXP,
    	];
        // Creamos el JWT.
    	$jwt = JWT::encode($payload, JWT_KEY, JWT_ALG);
        // Respondemos con el JWT generado.
        mysqli_close($link);
    	output(['ok' => true, 'jwt'=> $jwt]);
    };

    /*******************************CREACIÓN DE USUARIOS***********************************/

    function postUsuarios() {
        // Establecemos conexión con la base de datos.
        $link = conectarBD();
        // Obtenemos la info que es enviada en el body de la request.
        $data = json_decode( file_get_contents( 'php://input' ), true );
        // Revisamos que el formato sea correcto.
        if (json_last_error()) {
            outputError(400, "El formato de datos es incorrecto");
        };
        // Validamos la información.
        if( !isset($data['nombre']) || trim($data['nombre']) == "" || $data['nombre'] == null ) {
            outputError(400, "El nombre es obligatorio.");
        };
        if ( !isset($data['correo']) || trim($data['correo']) == "" || $data['correo'] == null ) {
            outputError(400, "El correo es obligatorio.");
        };
        if ( !isset($data['password']) || trim($data['password']) == "" || $data['password'] == null ) {
            outputError(400, "La contraseña es obligatoria.");
        };
        // Validación especial nombre.
        $matches = null;
        if( (preg_match_all("/^(?:[\x{00c0}-\x{01ffa}-zA-Z'-]){2,}(?:\s[\x{00c0}-\x{01ffa}-zA-Z'-]{2,})+$/ui", trim($data['nombre']), $matches) < 1) ) {
            outputError(400, "Ingrese un nombre válido.");
        };
        // Validación especial correo.
        $matches = null;
        if( !(preg_match('/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{1,3})+$/', $data['correo'], $matches) === 1) ) {
            outputError(400, "Ingrese un correo válido.");
        };
        // Validación especial password.
        $matches = null;
        if( !(preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/', $data['password'], $matches) === 1) ) {
            outputError(400, "La contraseña debe contener mínimo ocho caracteres, al menos una letra mayúscula, una letra minúscula y un número, sin caracteres especiales.");
        };
        // Sanitizamos la información recibida.
        $nombre = trim(mysqli_real_escape_string($link, $data['nombre']));
        $correo = trim(mysqli_real_escape_string($link, $data['correo']));
        $password = trim(mysqli_real_escape_string($link, $data['password']));
        // Se verifica que no exista un usuario registrado con el mismo correo.
        $sql = "SELECT * FROM usuario WHERE correo = '$correo'";
        $result = mysqli_query($link, $sql);
        if ($result === false) {
            outputError( 500, "Falló la consulta: " . mysqli_error($link));
        };
        if (mysqli_num_rows($result) != 0) {
            outputError(400, "El correo ingresado ya se encuentra registrado.");
        }
        mysqli_free_result($result);
        // Encriptamos la contraseña.
        $password_encript = password_hash($password, PASSWORD_DEFAULT);
        // Guardamos al usuario en base de datos.
        $sql = "INSERT INTO usuario (nombre, correo, password, url_foto, admin, estado) 
                    VALUES ('$nombre','$correo','$password_encript', '', 0, 1)";
        $result = mysqli_query($link, $sql);
        if ($result === false) {
            outputError( 500, "Falló la consulta: " . mysqli_error($link));
        };
        $id = mysqli_insert_id($link);
         // Generamos el Payload del JWT
        $payload = [
            'id' => $id,
            'nombre' => $nombre,
            'correo' => $correo,
            'url_foto' => '',
            'admin' => 0,
            'exp' => time() + JWT_EXP,
        ];
        // Creamos el JWT.
        $jwt = JWT::encode($payload, JWT_KEY, JWT_ALG);
        // Respondemos con el JWT generado.
        mysqli_close($link);
        outputJson(['ok' => true, 'jwt'=> $jwt], 201);
    };

    /***********************************ACTUALIZACIÓN DE USUARIOS******************************************/

    function patchUsuarios($id) {
        // Esta petición requiere el envío de un token válido que pertenezca al usuario el cual se intenta actualizar.
        $payload = requiereAutorizacion();
        if( ($payload->id+=0) != $id) {
            outputError(401, "Se requiere el envío de un token propio.");
        };
        //Validamos que se indique el id del usuario a actualizar.
        if(!$id) {
            outputError(400, "Por favor indique el id del usuario que desea actualizar");
        }
        // Convertimos id a integer.
        settype($id, 'integer');
        // Establecemos conexión con la base de datos.
        $link = conectarBD();
        // Verificamos que exista un usuario con el id ingresado.
        $sql = "SELECT id FROM usuario WHERE id = $id";
        $result = mysqli_query($link, $sql);
        if ($result === false) {
            outputError( 500, "Falló la consulta: " . mysqli_error($link));
        };
        if (mysqli_num_rows($result) == 0) {
            outputError(404, "No se ha encontrado un usuario con el id ingresado.");
        };
        mysqli_free_result($result);
        // Obtenemos la info que es enviada en el body de la request.
        $data = json_decode( file_get_contents( 'php://input' ), true );
        // Revisamos que el formato sea correcto.
        if (json_last_error()) {
            outputError(400, "El formato de datos es incorrecto");
        };
        // Validamos la información obligatoria.
        if( !isset($data['nombre']) || trim($data['nombre']) == "" || $data['nombre'] == null ) {
            outputError(400, "El nombre es obligatorio.");
        };
        if ( !isset($data['correo']) || trim($data['correo']) == "" || $data['correo'] == null ) {
            outputError(400, "El correo es obligatorio.");
        };
        if ( !isset($data['url_foto']) ) {
            outputError(400, "La url_foto es obligatoria.");
        };
        // Validación especial nombre.
        $matches = null;
        if( (preg_match_all("/^(?:[\x{00c0}-\x{01ffa}-zA-Z'-]){2,}(?:\s[\x{00c0}-\x{01ffa}-zA-Z'-]{2,})+$/ui", trim($data['nombre']), $matches) < 1) ) {
            outputError(400, "Ingrese un nombre válido.");
        };
        // Validación especial correo.
        $matches = null;
        if( !(preg_match('/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{1,3})+$/', $data['correo'], $matches) === 1) ) {
            outputError(400, "Ingrese un correo válido.");
        };
        // Sanitizamos la información recibida.
        $nombre = trim(mysqli_real_escape_string($link, $data['nombre']));
        $correo = trim(mysqli_real_escape_string($link, $data['correo']));
        $url_foto = mysqli_real_escape_string($link, $data['url_foto']);
        // Se verifica que no exista un usuario registrado con el mismo correo.
        $sql = "SELECT * FROM usuario WHERE correo = '$correo'";
        $result = mysqli_query($link, $sql);
        if ($result === false) {
            outputError( 500, "Falló la consulta: " . mysqli_error($link));
        };
        $fila = mysqli_fetch_assoc($result);
        if (mysqli_num_rows($result) != 0 && ($fila['id'] != $id)) {
            outputError(400, "El correo ingresado ya se encuentra registrado.");
        };
        mysqli_free_result($result);
        // Validación especial password y UPDATE sólo si se envía.
        if (isset($data['password'])) {
            if ( trim($data['password']) != "" || $data['password'] != null  ) {
                $matches = null;
                if( !(preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/', $data['password'], $matches) === 1) ) {
                    outputError(400, "La contraseña debe contener mínimo ocho caracteres, al menos una letra mayúscula, una letra minúscula y un número, sin caracteres especiales.");
                };
                // Sanitizamos la información recibida.
                $password = trim(mysqli_real_escape_string($link, $data['password']));
                // Encriptamos la contraseña.
                $password_encript = password_hash($password, PASSWORD_DEFAULT);
                // Actualizamos la contraseña.
                $sql = "UPDATE usuario SET password = '$password_encript' WHERE id = $id";
                $result = mysqli_query($link, $sql);
                if ($result === false) {
                    outputError( 500, "Falló la consulta: " . mysqli_error($link));
                };
            };
        };
        // Actualizamos la información obligatoria del usuario.
        $sql = "UPDATE usuario SET nombre = '$nombre', correo = '$correo', url_foto = '$url_foto' WHERE id = $id";
        $result = mysqli_query($link, $sql);
        if ($result === false) {
            outputError( 500, "Falló la consulta: " . mysqli_error($link));
        };
        // Cerramos conexión y enviamos respuesta.
        mysqli_close($link);
        outputJson(['ok' => true]);
    };

    /***********************************ELIMINAR USUARIO******************************************/

    function deleteUsuarios($id) {
        // Esta petición requiere el envío de un token propio o de ADMINISTRADOR válido.
        $payload = requiereAutorizacion();
        //Validamos que se indique el id del usuario a eliminar.
        if(!$id) {
            outputError(400, "Por favor indique el id del usuario que desea eliminar");
        }
        // Convertimos id a integer.
        settype($id, 'integer');
        // Establecemos conexión con la base de datos.
        $link = conectarBD();
        // Validamos si existe un usuario con el id enviado.
        $sql = "SELECT id FROM usuario where id = $id";
        $resultado = mysqli_query($link, $sql);
        if($resultado === false) {
            print "Falló la consulta" . mysqli_error($link);
            outputError(500);
        }
        if( mysqli_num_rows($resultado) == 0 ) {
            outputError(404, "No existe un usuario con el id ingresado");
        }
        $fila = mysqli_fetch_assoc($resultado);
        // Verificamos que el token sea propio (un usuario se puede eliminar así mismo).
        // En caso de no ser propio, corroboramos que el token sea de un administrador.
        if( $payload->id != $id ) {
            if( ($payload->admin+=0) != 1) {
                outputError(401, "Sólo un administrador puede eliminar a otros usuarios.");
            }
        };
        // Limpiamos de memoria la consulta que acabamos de realizar.
        mysqli_free_result($resultado);
        // Borramos al usuario indicando que su estado ahora es false (0).
        $sql = "UPDATE usuario SET estado = 0 WHERE id = $id";
        $resultado = mysqli_query($link, $sql);
        if($resultado === false) {
            print "Falló la consulta" . mysqli_error($link);
            outputError(500);
        }
        mysqli_close($link);
        outputJson(['ok' => true], 202);
    }

    /****************************************REACTIVAR USUARIO*****************************************/

    function patchReactivar($id) {
        // Esta petición requiere el envío de un token de ADMINISTRADOR válido.
        $payload = requiereAutorizacion();
        if( ($payload->admin+=0) != 1) {
            outputError(401, "Sólo un administrador puede utilizar este servicio.");
        };
        //Validamos que se indique el id del usuario a reactivar.
        if(!$id) {
            outputError(400, "Por favor indique el id del usuario que desea reactivar");
        }
        // Convertimos id a integer.
        settype($id, 'integer');
        // Establecemos conexión con la base de datos.
        $link = conectarBD();
        // Verificamos que exista un usuario con el id ingresado.
        $sql = "SELECT id FROM usuario WHERE id = $id";
        $result = mysqli_query($link, $sql);
        if ($result === false) {
            outputError( 500, "Falló la consulta: " . mysqli_error($link));
        };
        if (mysqli_num_rows($result) == 0) {
            outputError(404, "No se ha encontrado un usuario con el id ingresado.");
        };
        // Limpiamos de memoria la consulta que acabamos de realizar.
        mysqli_free_result($result);
        // Reactivamos al usuario indicando que su estado ahora es true (1).
        $sql = "UPDATE usuario SET estado = 1 WHERE id = $id";
        $resultado = mysqli_query($link, $sql);
        if($resultado === false) {
            print "Falló la consulta" . mysqli_error($link);
            outputError(500);
        }
        mysqli_close($link);
        outputJson(['ok' => true], 201);
    };

    /*******************************************CONSULTAR USUARIOS*****************************************/

    function getUsuarios() {
        // Esta petición requiere el envío de un token de ADMINISTRADOR válido.
        $payload = requiereAutorizacion();
        if( ($payload->admin+=0) != 1) {
            outputError(401, "Sólo un administrador puede utilizar este servicio.");
        };
        // Conectamos con la base de datos.
        $link = conectarBD();
        // Realizamos consulta.
        $sql = "SELECT * FROM usuario WHERE estado = 1";
        $resultado = mysqli_query($link, $sql);
        if($resultado === false) {
            print "Falló la consulta" . mysqli_error($link);
            outputError(500);
        }
        //Extraemos la información que arroja la consulta.
        $data= [];
        while( $fila = mysqli_fetch_assoc($resultado) ) {
            $data[] = [

                'id' => $fila['id'],
                'nombre' => $fila['nombre'],
                'correo' => $fila['correo'],
                'password' => $fila['password'],
                'url_foto' => $fila['url_foto'],
                'admin' => $fila['admin'],
                'estado' => $fila['estado'],
            ];
        }
        array_unshift($data, ['total' => count($data)]);
        // Enviamos la información.
        mysqli_free_result($resultado);
        mysqli_close($link);
        outputJson($data);
    }

    function getInactivos() {
        // Esta petición requiere el envío de un token de ADMINISTRADOR válido.
        $payload = requiereAutorizacion();
        if( ($payload->admin+=0) != 1) {
            outputError(401, "Sólo un administrador puede utilizar este servicio.");
        };
        // Conectamos con la base de datos.
        $link = conectarBD();
        // Realizamos consulta.
        $sql = "SELECT * FROM usuario WHERE estado = 0";
        $resultado = mysqli_query($link, $sql);
        if($resultado === false) {
            print "Falló la consulta" . mysqli_error($link);
            outputError(500);
        }
        //Extraemos la información que arroja la consulta.
        $data= [];
        while( $fila = mysqli_fetch_assoc($resultado) ) {
            $data[] = [

                'id' => $fila['id'],
                'nombre' => $fila['nombre'],
                'correo' => $fila['correo'],
                'password' => $fila['password'],
                'url_foto' => $fila['url_foto'],
                'admin' => $fila['admin'],
                'estado' => $fila['estado'],
            ];
        }
        array_unshift($data, ['total' => count($data)]);
        // Enviamos la información.
        mysqli_free_result($resultado);
        mysqli_close($link);
        outputJson($data);
    }

    function getUsuariosConParametros($id) {
       // Esta petición requiere el envío de un token propio.
        $payload = requiereAutorizacion();
        if( ($payload->id+=0) != $id) {
            outputError(401, "Se requiere el envío de un token propio.");
        };
        //Validamos que se indique el id del usuario a buscar.
        if(!$id) {
            outputError(400, "Por favor indique el id del usuario que desea consultar");
        }
        // Convertimos id a integer.
        settype($id, 'integer');
        // Conectamos con la Base de datos.
        $link = conectarBD();
        // Definimos juego de caracteres.
        mysqli_set_charset($link, "utf8");
        // Realizamos consulta.
        $sql = "SELECT * FROM usuario WHERE id = $id";
        $resultado = mysqli_query($link, $sql);
        if($resultado === false) {
            print "Falló la consulta" . mysqli_error($link);
            outputError(500);
        }
        if( mysqli_num_rows($resultado) == 0) {
            print "No se ha encontrado un contacto con el id ingresado.";
            outputError(404);
        }
        //Extraemos la información que arroja la consulta.
        $data = mysqli_fetch_assoc($resultado);
        mysqli_free_result($resultado);
        mysqli_close($link);
        outputJson($data);
    }

    /*******************************************CONSULTAR HEROES*****************************************/

    function getHeroes() {
        // Se requiere el envío de un token válido.
        requiereAutorizacion();
        // Conectamos con la base de datos.
        $link = conectarBD();
        // Realizamos consulta.
        $sql = "SELECT * FROM heroes";
        $resultado = mysqli_query($link, $sql);
        if($resultado === false) {
            print "Falló la consulta" . mysqli_error($link);
            outputError(500);
        }
        //Extraemos la información que arroja la consulta.
        $data= [];
        while( $fila = mysqli_fetch_assoc($resultado) ) {
            $data[] = [

                'id' => $fila['id']+=0,
                'superhero' => $fila['superhero'],
                'publisher' => $fila['publisher'],
                'alter_ego' => $fila['alter_ego'],
                'first_appearance' => $fila['first_appearance'],
                'characters' => $fila['characters'],
                'habilities' => $fila['habilities'],
                'alt_img' => $fila['alt_img'],
                'assets_img' => ( ($fila['assets_img']+=0) === 0) ? false : true,
                'id_usuario' => $fila['id_usuario']+=0,
            ];
        }
        // Enviamos la información.
        mysqli_free_result($resultado);
        mysqli_close($link);
        outputJson($data);
    }

    function getHeroesConParametros($id) {
        // Se requiere el envío de un token válido.
        requiereAutorizacion();
        //Validamos que se indique el id del usuario a buscar.
        if(!$id) {
            outputError(400, "Por favor indique el id del heroe que desea consultar");
        }
        // Convertimos id a integer.
        settype($id, 'integer');
        // Conectamos con la Base de datos.
        $link = conectarBD();
        // Definimos juego de caracteres.
        mysqli_set_charset($link, "utf8");
        // Realizamos consulta.
        $sql = "SELECT * FROM heroes WHERE id = $id";
        $resultado = mysqli_query($link, $sql);
        if($resultado === false) {
            print "Falló la consulta" . mysqli_error($link);
            outputError(500);
        }
        if( mysqli_num_rows($resultado) == 0) {
            print "No se ha encontrado un heroe con el id ingresado.";
            outputError(404);
        }
        //Extraemos la información que arroja la consulta.
        $data = mysqli_fetch_assoc($resultado);
        settype($data['id'], 'integer');
        settype($data['assets_img'], 'boolean');
        settype($data['id_usuario'], 'integer');
        mysqli_free_result($resultado);
        mysqli_close($link);
        outputJson($data);
    }

    /****************************************VALIDAR TOKEN ENVIADO*****************************************/

    function requiereAutorizacion() {
        try {
            $headers = getallheaders();
            if (!isset($headers['Authorization'])) {
                outputError(401, "No se han enviado un token en la petición");
            };
            list($jwt) = sscanf($headers['Authorization'], 'Bearer %s');
            $decoded = JWT::decode($jwt, JWT_KEY, [JWT_ALG]);
        } catch(Exception $e) {
            outputError(401, "Token Inválido"); //$e->getMessage(). Para obtener el mensaje de la excepción.
        };
        return $decoded;
    };

    /************************OBTENER INFO DEL USUARIO A PARTIR DEL TOKEN GENERADO**************************/

    function getUinfo() {
        $payload = requiereAutorizacion();
        output(['id'=>$payload->id+=0, 'nombre'=>$payload->nombre, 'correo'=>$payload->correo, 'url_foto' => $payload->url_foto, 'admin'=>$payload->admin+=0]);
    };

    /*****************************VALIDAR TOKEN USUARIO****************************/

    function getValidar() {
        $payload = requiereAutorizacion();
        output(['ok'=> true]);
    };

   