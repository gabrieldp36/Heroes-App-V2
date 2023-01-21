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
        $sql = "SELECT u.id, u.nombre, u.correo, u.url_foto, u.estado FROM usuario u WHERE u.admin != 1";
        $resultado = mysqli_query($link, $sql);
        if($resultado === false) {
            print "Falló la consulta" . mysqli_error($link);
            outputError(500);
        }
        //Extraemos la información que arroja la consulta.
        $data= [];
        while( $fila = mysqli_fetch_assoc($resultado) ) {
            settype($fila['id'], 'integer');
            settype($fila['estado'], 'boolean');
            $data[] = [
                'id' => $fila['id'],
                'nombre' => $fila['nombre'],
                'correo' => $fila['correo'],
                'url_foto' => $fila['url_foto'],
                'estado' => $fila['estado'],
            ];
        }
        // array_unshift($data, ['total' => count($data)]);
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
        $sql = "SELECT u.id, u.nombre, u.correo, u.url_foto, u.estado FROM usuario u WHERE estado = 0 AND admin != 1 ";
        $resultado = mysqli_query($link, $sql);
        if($resultado === false) {
            print "Falló la consulta" . mysqli_error($link);
            outputError(500);
        }
        //Extraemos la información que arroja la consulta.
        $data= [];
        while( $fila = mysqli_fetch_assoc($resultado) ) {
            settype($fila['id'], 'integer');
            settype($fila['estado'], 'boolean');
            $data[] = [

                'id' => $fila['id'],
                'nombre' => $fila['nombre'],
                'correo' => $fila['correo'],
                'url_foto' => $fila['url_foto'],
                'estado' => $fila['estado'],
            ];
        }
        // array_unshift($data, ['total' => count($data)]);
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
        $sql = "SELECT u.id, u.nombre, u.correo, u.url_foto, u.admin, u.estado FROM usuario u WHERE id = $id";
        $resultado = mysqli_query($link, $sql);
        if($resultado === false) {
            print "Falló la consulta" . mysqli_error($link);
            outputError(500);
        }
        if( mysqli_num_rows($resultado) == 0) {
            outputError(404, "No se ha encontrado un usuario con el id ingresado.");
        }
        //Extraemos la información que arroja la consulta.
        $data = mysqli_fetch_assoc($resultado);
        settype($data['id'], 'integer');
        settype($data['admin'], 'boolean');
        settype($data['estado'], 'boolean');
        mysqli_free_result($resultado);
        mysqli_close($link);
        outputJson($data);
    }

    /*******************************************CONSULTAR HÉROES*****************************************/

    function getHeroes() {
        // Se requiere el envío de un token válido.
        requiereAutorizacion();
        // Conectamos con la base de datos.
        $link = conectarBD();
        // Realizamos consulta.
        $sql = "SELECT * FROM heroe";
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
        $sql = "SELECT * FROM heroe WHERE id = $id";
        $resultado = mysqli_query($link, $sql);
        if($resultado === false) {
            print "Falló la consulta" . mysqli_error($link);
            outputError(500);
        }
        if( mysqli_num_rows($resultado) == 0) {
            outputError(404, "No se ha encontrado un heroe con el id ingresado.");
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


    /************************************CREACIÓN DE HÉROES***************************************/

    function postHeroes() { 
        // Se requiere el envío de un token válido.
        requiereAutorizacion();
        // Obtenemos la info que es enviada en el body de la request.
        $data = json_decode( file_get_contents( 'php://input' ), true );
        // Revisamos que el formato sea correcto.
        if (json_last_error()) {
            outputError(400, "El formato de datos es incorrecto");
        };
        // Validamos que se indique el id del usuario que crea el héroe.
        if(!isset($data['id_usuario'])) {
            outputError(400, "Por favor indique el id del usuario que crea el héroe");
        }
        // Convertimos id a integer.
        $id_usuario = $data['id_usuario'];
        // Establecemos conexión con la base de datos.
        $link = conectarBD();
        // Realizamos una consulta para validar que se envíe el id de un usuario registrado.
        $sql = "SELECT id FROM usuario WHERE id = $id_usuario";
        $resultado = mysqli_query($link, $sql);
        if($resultado === false) {
            print "Falló la consulta" . mysqli_error($link);
            outputError(500);
        }
        if( mysqli_num_rows($resultado) == 0) {
            outputError(404, "No se ha encontrado un usuario con el id ingresado");
        }
        mysqli_free_result($resultado);
        // Validamos la información.
        if( !isset($data['superhero']) || trim($data['superhero']) == "" || $data['superhero'] == null ) {
            outputError(400, "El nombre del héroe es obligatorio.");
        };
        if ( !isset($data['alter_ego']) || trim($data['alter_ego']) == "" || $data['alter_ego'] == null ) {
            outputError(400, "El Alter Ego del héroe es obligatorio.");
        };
        if ( !isset($data['habilities']) || trim($data['habilities']) == "" || $data['habilities'] == null ) {
            outputError(400, "Las habilidades del héroe son obligatorias.");
        };
        // Sanitizamos la información recibida.
        $superhero = trim(mysqli_real_escape_string($link, $data['superhero']));
        $alter_ego = trim(mysqli_real_escape_string($link, $data['alter_ego']));
        $habilities = trim(mysqli_real_escape_string($link, $data['habilities']));
        // Validamos que no exista un heroe con el mismo nombre.
        $sql = "SELECT id FROM heroe WHERE superhero = '$superhero'";
        $result = mysqli_query($link, $sql);
        if ($result === false) {
            outputError( 500, "Falló la consulta: " . mysqli_error($link));
        };
        if (mysqli_num_rows($result) != 0) {
            outputError(400, "El nombre del héroe ya se encuentra registrado. Elija un nombre diferente");
        }
        mysqli_free_result($result);
        // Validaciones especiales de datos optativos.
        if( !isset($data['publisher']) || trim($data['publisher']) == "" || $data['publisher'] == null ) {
            $publisher = "''";
        } else {
            $publisher =  "'" . mysqli_real_escape_string( $link, trim($data['publisher']) ) . "'";
        }
        if( !isset($data['first_appearance']) || trim($data['first_appearance']) == "" || $data['first_appearance'] == null ) {
            $first_appearance = "''";
        } else {
            $first_appearance =  "'" . mysqli_real_escape_string( $link, trim($data['first_appearance']) ) . "'";
        }
        if( !isset($data['characters']) || trim($data['characters']) == "" || $data['characters'] == null ) {
            $characters = "''";
        } else {
            $characters =  "'" . mysqli_real_escape_string( $link, trim($data['characters']) ) . "'";
        }
         if( !isset($data['alt_img']) || trim($data['alt_img']) == "" || $data['alt_img'] == null ) {
            $alt_img = "''";
        } else {
            $alt_img =  "'" . mysqli_real_escape_string( $link, trim($data['alt_img']) ) . "'";
        }
        // Guardamos al usuario en base de datos.
        $sql = "INSERT INTO heroe (superhero, publisher, alter_ego, first_appearance, characters, habilities, alt_img, assets_img, id_usuario) VALUES ('$superhero', $publisher, '$alter_ego', $first_appearance, $characters, '$habilities', $alt_img, 0, $id_usuario)";
        $result = mysqli_query($link, $sql);
        if ($result === false) {
            outputError( 500, "Falló la consulta: " . mysqli_error($link));
        };
        $id = mysqli_insert_id($link);
        // Generamos la información que se envía como respuesta, luego de crear al héroe.
        $sql = "SELECT * FROM heroe WHERE id = $id";
        $resultado = mysqli_query($link, $sql);
        if($resultado === false) {
            print "Falló la consulta" . mysqli_error($link);
            outputError(500);
        }
        $response = mysqli_fetch_assoc($resultado);
        settype($response['id'], 'integer');
        settype($response['assets_img'], 'boolean');
        settype($response['id_usuario'], 'integer');
        mysqli_free_result($resultado);
        mysqli_close($link);
        outputJson($response, 201);
    };

    /************************************ACTUALIZACIÓN DE HÉROES***************************************/

    function patchHeroes($id) { 
        // Se requiere el envío de un token válido.
        requiereAutorizacion();
        //Validamos que se indique el id del héroe a actualizar.
        if(!$id) {
            outputError(400, "Por favor indique el id del héroe que desea actualizar");
        }
        // Convertimos id a integer.
        settype($id, 'integer');
        // Obtenemos la info que es enviada en el body de la request.
        $data = json_decode( file_get_contents( 'php://input' ), true );
        // Revisamos que el formato sea correcto.
        if (json_last_error()) {
            outputError(400, "El formato de datos es incorrecto");
        };
        // Establecemos conexión con la base de datos.
        $link = conectarBD();
        // Realizamos una consulta para validar que se envíe el id de un héroe creado.
        $sql = "SELECT id FROM heroe WHERE id = $id";
        $resultado = mysqli_query($link, $sql);
        if($resultado === false) {
            print "Falló la consulta" . mysqli_error($link);
            outputError(500);
        }
        if( mysqli_num_rows($resultado) == 0) {
            outputError(404, "No se ha encontrado un héroe con el id ingresado");
        }
        mysqli_free_result($resultado);
        // Validamos la información.
        if( !isset($data['superhero']) || trim($data['superhero']) == "" || $data['superhero'] == null ) {
            outputError(400, "El nombre del héroe es obligatorio.");
        };
        if ( !isset($data['alter_ego']) || trim($data['alter_ego']) == "" || $data['alter_ego'] == null ) {
            outputError(400, "El Alter Ego del héroe es obligatorio.");
        };
        if ( !isset($data['habilities']) || trim($data['habilities']) == "" || $data['habilities'] == null ) {
            outputError(400, "Las habilidades del héroe son obligatorias.");
        };
        // Sanitizamos la información recibida.
        $superhero = trim(mysqli_real_escape_string($link, $data['superhero']));
        $alter_ego = trim(mysqli_real_escape_string($link, $data['alter_ego']));
        $habilities = trim(mysqli_real_escape_string($link, $data['habilities']));
        // Validamos que no exista un heroe con el mismo nombre.
        $sql = "SELECT id FROM heroe WHERE superhero = '$superhero'";
        $result = mysqli_query($link, $sql);
        if ($result === false) {
            outputError( 500, "Falló la consulta: " . mysqli_error($link));
        };
        $id_heroe = mysqli_fetch_assoc($result);
        if (mysqli_num_rows($result) != 0 && $id_heroe['id'] != $id) {
            outputError(400, "El nombre del héroe ya se encuentra registrado. Elija un nombre diferente");
        }
        mysqli_free_result($result);
        // Validaciones especiales de datos optativos.
        if( !isset($data['publisher']) || trim($data['publisher']) == "" || $data['publisher'] == null ) {
            $publisher = "''";
        } else {
            $publisher =  "'" . mysqli_real_escape_string( $link, trim($data['publisher']) ) . "'";
        }
        if( !isset($data['first_appearance']) || trim($data['first_appearance']) == "" || $data['first_appearance'] == null ) {
            $first_appearance = "''";
        } else {
            $first_appearance =  "'" . mysqli_real_escape_string( $link, trim($data['first_appearance']) ) . "'";
        }
        if( !isset($data['characters']) || trim($data['characters']) == "" || $data['characters'] == null ) {
            $characters = "''";
        } else {
            $characters =  "'" . mysqli_real_escape_string( $link, trim($data['characters']) ) . "'";
        }
         if( !isset($data['alt_img']) || trim($data['alt_img']) == "" || $data['alt_img'] == null ) {
            $alt_img = "''";
        } else {
            $alt_img =  "'" . mysqli_real_escape_string( $link, trim($data['alt_img']) ) . "'";
        }
        // Actualizamos al héroe en base de datos.
        $sql = "UPDATE heroe SET superhero = '$superhero', 
                                 publisher = $publisher,
                                 alter_ego = '$alter_ego',
                                 first_appearance = $first_appearance,
                                 characters = $characters,
                                 habilities = '$habilities',
                                 alt_img = $alt_img WHERE id = $id";
        $result = mysqli_query($link, $sql);
        if ($result === false) {
            outputError( 500, "Falló la consulta: " . mysqli_error($link));
        };
        // Generamos la información que se envía como respuesta, luego de crear al héroe.
        $sql = "SELECT * FROM heroe WHERE id = $id";
        $resultado = mysqli_query($link, $sql);
        if($resultado === false) {
            print "Falló la consulta" . mysqli_error($link);
            outputError(500);
        }
        $response = mysqli_fetch_assoc($resultado);
        settype($response['id'], 'integer');
        settype($response['assets_img'], 'boolean');
        settype($response['id_usuario'], 'integer');
        mysqli_free_result($resultado);
        mysqli_close($link);
        outputJson($response, 201);
    };

    /***********************************ELIMINAR HÉROE******************************************/

    function deleteHeroes($id) {
        // Esta petición requiere el envío de un token válido.
        requiereAutorizacion();
        //Validamos que se indique el id del héroe a eliminar.
        if(!$id) {
            outputError(400, "Por favor indique el id del héroe que desea eliminar");
        }
        // Convertimos id a integer.
        settype($id, 'integer');
        // Establecemos conexión con la base de datos.
        $link = conectarBD();
        // Validamos si existe un héroe con el id enviado.
        $sql = "SELECT id FROM heroe where id = $id";
        $resultado = mysqli_query($link, $sql);
        if($resultado === false) {
            print "Falló la consulta" . mysqli_error($link);
            outputError(500);
        }
        if( mysqli_num_rows($resultado) == 0 ) {
            outputError(404, "No existe un héroe con el id ingresado");
        }
        // Limpiamos de memoria la consulta que acabamos de realizar.
        mysqli_free_result($resultado);
        // Borramos al héroe de la base de datos.
        $sql = "DELETE FROM heroe WHERE id = $id";
        $resultado = mysqli_query($link, $sql);
        if($resultado === false) {
            print "Falló la consulta" . mysqli_error($link);
            outputError(500);
        }
        mysqli_close($link);
        outputJson(new stdClass(), 202);
    }

    /******************************************BUSCAR HÉROES**********************************************/

    function getBuscar() {

        // Esta petición requiere el envío de un token válido.
        requiereAutorizacion();
        // Establecemos conexión con la base de datos.
        $link = conectarBD();
        // Obtenemos los query params de la petición http y los sanitizamos.
        $termino = mysqli_real_escape_string( $link, strtolower($_GET['termino'] ?? ''));
        $limite = mysqli_real_escape_string( $link, strtolower($_GET['limite'] ?? ''));
        settype($limite, 'integer');
        // Realizamos consulta.
        $sql = "SELECT * FROM heroe h WHERE h.superhero LIKE '%$termino%' 
                                            OR h.alter_ego LIKE '%$termino%' 
                                            OR h.characters LIKE '%$termino%' 
                                            OR h.habilities LIKE '%$termino%'
                                            LIMIT $limite;";
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


    /******************************************HÉROES POR USUARIO**********************************************/

    function getPropiosConParametros($id) {
        // Esta petición requiere el envío de un token propio.
        $payload = requiereAutorizacion();
        if( ($payload->id+=0) != $id) {
            outputError(401, "Se requiere el envío de un token propio.");
        };
        //Validamos que se indique el id del usuario a buscar.
        if(!$id) {
            outputError(400, "Por favor indique el id del usuario");
        }
        // Convertimos id a integer.
        settype($id, 'integer');
        // Conectamos con la Base de datos.
        $link = conectarBD();
        // Definimos juego de caracteres.
        mysqli_set_charset($link, "utf8");
        // Realizamos consulta.
        $sql = "SELECT id FROM usuario WHERE id = $id";
        $resultado = mysqli_query($link, $sql);
        if($resultado === false) {
            print "Falló la consulta" . mysqli_error($link);
            outputError(500);
        }
        if( mysqli_num_rows($resultado) == 0) {
            outputError(404, "No se ha encontrado un usuario con el id ingresado.");
        }
        mysqli_free_result($resultado);
        // Realizamos la búsqueda de los heroes creados por el usuario cuyo id se envía.
        $sql = "SELECT h.id, h.superhero, h.publisher, h.alter_ego, h.first_appearance, h.characters, h.habilities, h.alt_img, h.assets_img, h.id_usuario FROM heroe h INNER JOIN usuario u ON u.id = h.id_usuario WHERE h.id_usuario = $id;";
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

    /******************************************CONSULTAR COMENTARIOS**********************************************/

    function getComentariosConParametros($id) {
        // Esta petición requiere el envío de un token válido.
        $payload = requiereAutorizacion();
        //Validamos que se indique el id del héroe cuyos conmentarios se deseean consultar.
        if(!$id) {
            outputError(400, "Por favor indique el id del héroe");
        }
        // Convertimos id a integer.
        settype($id, 'integer');
        // Conectamos con la Base de datos.
        $link = conectarBD();
        // Definimos juego de caracteres.
        mysqli_set_charset($link, "utf8");
        // Realizamos consulta.
        $sql = "SELECT id FROM heroe WHERE id = $id";
        $resultado = mysqli_query($link, $sql);
        if($resultado === false) {
            print "Falló la consulta" . mysqli_error($link);
            outputError(500);
        }
        if( mysqli_num_rows($resultado) == 0) {
            outputError(404, "No se ha encontrado un héroe con el id ingresado.");
        }
        mysqli_free_result($resultado);
        // Realizamos la búsqueda de los comentarios.
        $sql = "SELECT c.id AS id_comentario, u.id, u.url_foto, u.nombre, c.descripcion 
                FROM usuario u INNER JOIN comentario c 
                ON c.id_usuario = u.id WHERE c.id_heroe = $id;";
        $resultado = mysqli_query($link, $sql);
        if($resultado === false) {
            print "Falló la consulta" . mysqli_error($link);
            outputError(500);
        }
        //Extraemos la información que arroja la consulta.
        $data= [];
        while( $fila = mysqli_fetch_assoc($resultado) ) {
            $data[] = [
                'id_comentario' => $fila['id_comentario']+=0,
                'id_usuario' => $fila['id']+=0,
                'url_foto' => $fila['url_foto'],
                'nombre' => $fila['nombre'],
                'descripcion' => $fila['descripcion'],
            ];
        }
        // Enviamos la información.
        mysqli_free_result($resultado);
        mysqli_close($link);
        outputJson($data);
    }


    /***********************************ELIMINAR COMENTARIO******************************************/

    function deleteComentarios($id) {
        // Esta petición requiere el envío de un token válido.
        $payload = requiereAutorizacion();
        //Validamos que se indique el id del comentario a eliminar.
        if(!$id) {
            outputError(400, "Por favor indique el id del comentario que desea eliminar");
        }
        // Convertimos id a integer.
        settype($id, 'integer');
        // Establecemos conexión con la base de datos.
        $link = conectarBD();
        // Validamos si existe un comentario con el id enviado.
        $sql = "SELECT id FROM comentario where id = $id";
        $resultado = mysqli_query($link, $sql);
        if($resultado === false) {
            print "Falló la consulta" . mysqli_error($link);
            outputError(500);
        }
        if( mysqli_num_rows($resultado) == 0 ) {
            outputError(404, "No existe un comentario con el id ingresado");
        }
        $fila = mysqli_fetch_assoc($resultado);
        // Verificamos que el token sea propio (un usuario sólo puede eliminar comentarios propios).
        // En caso de no ser un comentario propio, corroboramos que el token sea de un administrador.
        if( $payload->id != $id ) {
            if( ($payload->admin+=0) != 1) {
                outputError(401, "Sólo un administrador puede eliminar comentarios ajenos.");
            }
        };
        // Limpiamos de memoria la consulta que acabamos de realizar.
        mysqli_free_result($resultado);
        // Borramos al héroe de la base de datos.
        $sql = "DELETE FROM comentario WHERE id = $id";
        $resultado = mysqli_query($link, $sql);
        if($resultado === false) {
            print "Falló la consulta" . mysqli_error($link);
            outputError(500);
        }
        mysqli_close($link);
        outputJson([], 202);
    }

   /************************************CREACIÓN DE HÉROES***************************************/

    function postComentarios() { 
        // Se requiere el envío de un token válido.
        requiereAutorizacion();
        // Obtenemos la info que es enviada en el body de la request.
        $data = json_decode( file_get_contents( 'php://input' ), true );
        // Revisamos que el formato sea correcto.
        if (json_last_error()) {
            outputError(400, "El formato de datos es incorrecto");
        };
        // Validamos que se indique el id del usuario que postea el comentario.
        if(!isset($data['id_usuario'])) {
            outputError(400, "Por favor indique el id del usuario que postea el comentario");
        }
         // Validamos que se indique el id del héroe al cual corresponde el comentario.
        if(!isset($data['id_heroe'])) {
            outputError(400, "Por favor indique el id del héroe al cual corresponde el comentario");
        }
        // Convertimos id del usuario a integer.
        $id_usuario = $data['id_usuario'];
         // Convertimos id del héroe a integer.
        $id_heroe = $data['id_heroe'];
        // Establecemos conexión con la base de datos.
        $link = conectarBD();
        // Realizamos una consulta para validar que se envíe el id de un usuario registrado.
        $sql = "SELECT id FROM usuario WHERE id = $id_usuario";
        $resultado = mysqli_query($link, $sql);
        if($resultado === false) {
            print "Falló la consulta" . mysqli_error($link);
            outputError(500);
        }
        if( mysqli_num_rows($resultado) == 0) {
            outputError(404, "No se ha encontrado un usuario con el id ingresado");
        }
        mysqli_free_result($resultado);
        // Realizamos una consulta para validar que se envíe el id de un héroe creado.
        $sql = "SELECT id FROM heroe WHERE id = $id_heroe";
        $resultado = mysqli_query($link, $sql);
        if($resultado === false) {
            print "Falló la consulta" . mysqli_error($link);
            outputError(500);
        }
        if( mysqli_num_rows($resultado) == 0) {
            outputError(404, "No se ha encontrado un heroe con el id ingresado");
        }
        mysqli_free_result($resultado);
        // Validamos la información.
        if( !isset($data['comentario']) || trim($data['comentario']) == "" || $data['comentario'] == null ) {
            outputError(400, "El comentario es obligatorio.");
        };
        // Sanitizamos la información recibida.
        $comentario = trim(mysqli_real_escape_string($link, $data['comentario']));
        // Guardamos al usuario en base de datos.
        $sql = "INSERT INTO comentario (id_usuario, id_heroe, descripcion) VALUES ($id_usuario, $id_heroe, '$comentario')";
        $result = mysqli_query($link, $sql);
        if ($result === false) {
            outputError( 500, "Falló la consulta: " . mysqli_error($link));
        };
        $id = mysqli_insert_id($link);
        mysqli_close($link);
        outputJson(['id' => $id], 201);
    };
