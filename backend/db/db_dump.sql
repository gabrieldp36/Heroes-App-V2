-- ******************************************************* --
-- *** IMPORTANTE: NO BORRAR NI MODIFICAR ESTE ARCHIVO *** --
-- ******************************************************* --

-- CREACIÓN DE BASE DE DATOS Y USUARIO.

DROP DATABASE IF EXISTS heroes;
DROP USER IF EXISTS 'final'@'localhost';
CREATE USER 'final'@'localhost' IDENTIFIED BY 'final';
GRANT USAGE ON *.* TO 'final'@'localhost';
CREATE DATABASE IF NOT EXISTS heroes DEFAULT CHARACTER SET utf8 DEFAULT COLLATE utf8_general_ci;
GRANT ALL PRIVILEGES ON heroes.* TO 'final'@'localhost';

USE heroes;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;

START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- CREACIÓN DE TABLAS.

CREATE TABLE IF NOT EXISTS usuario (
	id INTEGER(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
	nombre VARCHAR(255) NOT NULL,
	correo VARCHAR(255) NOT NULL,
	`password` VARCHAR(255) NOT NULL,
	url_foto TEXT,
    `admin` TINYINT(1) NOT NULL DEFAULT 0,
    estado TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS heroe (
	id INTEGER(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
	superhero VARCHAR(300) NOT NULL,
	publisher VARCHAR(255) DEFAULT '',
	alter_ego VARCHAR(300) NOT NULL,
    first_appearance VARCHAR(800) DEFAULT '',
    characters VARCHAR(1500) DEFAULT '',
    habilities TEXT NOT NULL,
	alt_img TEXT,
    assets_img TINYINT(1) NOT NULL DEFAULT 0,
    id_usuario INT NOT NULL,
    CONSTRAINT FOREIGN KEY fk_usuario(id_usuario) REFERENCES usuario(id)
);

CREATE TABLE IF NOT EXISTS comentario (
	id INTEGER(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
	id_usuario INTEGER(11) NOT NULL,
	id_heroe INTEGER(11) NOT NULL,
	descripcion TEXT,
    CONSTRAINT FOREIGN KEY fk_usuario_comentario(id_usuario) REFERENCES usuario(id),
    CONSTRAINT FOREIGN KEY fk_heroe_comentario(id_usuario) REFERENCES heroe(id)
);

-- INSERTS INICIALES.

INSERT INTO usuario (nombre, correo,  `password`, url_foto, `admin`, estado) VALUES
('Spike Spiegel', 'admin@gmail.com', '$2y$10$jNJW.psoxBgXHmndgnlD0uguwBA22ru7pwkcu8B1rN5r58aySeG9q', 'https://imgix.ranker.com/user_node_img/50088/1001742623/original/whatever-happens-photo-u1?auto=format&q=60&fit=crop&fm=pjpg&dpr=2&w=650', 1, 1),
('Hitokiri Battousai', 'admin2@gmail.com', '$2y$10$tvWBr8/NRDZewj.BZxh5xOq4dHiBSduo8PIQZJBoeCAkZ7vBniQEm', 'https://somoskudasai.com/wp-content/uploads/2022/12/portada_rurouni-kenshin-6.jpg', 1, 1),
('Rogelio Pérez', 'rogelio@gmail.com', '$2y$10$g.ARYFlCvYsyZ3/4T8Mjc.0MuqxoFskLa/tKl7nclzheYoqS/yMhK', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80', '0', '1'),
('Paula Pratt', 'pau@gmail.com', '$2y$10$jNJW.psoxBgXHmndgnlD0uguwBA22ru7pwkcu8B1rN5r58aySeG9q', 'https://images.unsplash.com/photo-1581403341630-a6e0b9d2d257?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80', '0', '1'),
('Manuel Rodríguez', 'manu@gmail.com', '$2y$10$jNJW.psoxBgXHmndgnlD0uguwBA22ru7pwkcu8B1rN5r58aySeG9q', '', '0', '1'),
('Carolina Gómez', 'caro@gmail.com', '$2y$10$jNJW.psoxBgXHmndgnlD0uguwBA22ru7pwkcu8B1rN5r58aySeG9q', 'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=489&q=80', '0', '1'),
('Valentina Taboada', 'valen@gmail.com', '$2y$10$jNJW.psoxBgXHmndgnlD0uguwBA22ru7pwkcu8B1rN5r58aySeG9q', 'https://images.unsplash.com/photo-1526510747491-58f928ec870f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80', '0', '1'),
('Martín Palermo', 'martin@gmail.com', '$2y$10$jNJW.psoxBgXHmndgnlD0uguwBA22ru7pwkcu8B1rN5r58aySeG9q', '', '0', '1'),
('Tomás Canaletti', 'tomas@gmail.com', '$2y$10$jNJW.psoxBgXHmndgnlD0uguwBA22ru7pwkcu8B1rN5r58aySeG9q', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80', '0', '1'),
('Paulo Juez', 'paulo@gmail.com', '$2y$10$jNJW.psoxBgXHmndgnlD0uguwBA22ru7pwkcu8B1rN5r58aySeG9q', 'https://images.unsplash.com/photo-1614289371518-722f2615943d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80', '0', '1'),
('Lionel Ricardo', 'lionel@gmail.com', '$2y$10$jNJW.psoxBgXHmndgnlD0uguwBA22ru7pwkcu8B1rN5r58aySeG9q', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80', '0', '1'),
('Martina Alonzo', 'martu@gmail.com', '$2y$10$jNJW.psoxBgXHmndgnlD0uguwBA22ru7pwkcu8B1rN5r58aySeG9q', 'https://images.unsplash.com/photo-1554423443-d9b73c9b7ced?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=518&q=80', '0', '1'),
('Delfina Sanz', 'delfi@gmail.com', '$2y$10$jNJW.psoxBgXHmndgnlD0uguwBA22ru7pwkcu8B1rN5r58aySeG9q', 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80', '0', '1'),
('Pia Marín', 'pia@gmail.com', '$2y$10$jNJW.psoxBgXHmndgnlD0uguwBA22ru7pwkcu8B1rN5r58aySeG9q', '', '0', '1');

INSERT INTO heroe (superhero, publisher, alter_ego, first_appearance, characters, habilities, alt_img, assets_img, id_usuario) VALUES
('Batman', 'DC Comics', 'Bruce Wayne', 'Detective Comics #27', 'Bruce Wayne', 'detective, intelecto nivel genio, brillante estratega y acróbata experto, dominio de artes marciales y técnicas de sigilo e intimidación, escapismo, uso de equipamiento, dispositivos y armamento de alta tecnología', '' , 1, 1 ),
('Superman', 'DC Comics', 'Kal-El', 'Action Comics #1', 'Kal-El', 'detective súper fuerza, velocidad, resistencia, agilidad, reflejos, durabilidad, sentidos y longevidad, poderes oculares, agudeza sobrehumana, visión de calor, visión del espectro, electromagnético, visión microscópica, visión de rayos x, visión telescópica, visión infrarroja, aliento sobrehumano, aliento helado, aliento de viento, invulnerabilidad, factor de curación rápida y vuelo', '' , 1, 1 ),
('Flash', 'DC Comics', 'Jay Garrick', 'Flash Comics #1', 'Jay Garrick, Barry Allen, Wally West, Bart Allen', 'sus poderes se basan en la Súper-velocidad, los cuales obtiene de la “Fuerza de velocidad”. Entre ellos se destacan: capacidad de correr más rápido que la luz, reflejos sobrehumanos, factor curativo que le otorga regeneración casi instantánea, puede traspasar materia, crear remanentes del tiempo con su gran velocidad, lanzar energía con sus manos y viajar en el tiempo con su super-velocidad', '' , 1, 1 ),
('Green Lantern', 'DC Comics', 'Alan Scott', 'All-American Comics #16', 'Alan Scott, Hal Jordan, Guy Gardner, John Stewart, Kyle Raynor, Jade, Sinestro, Simon Baz', 'gracias al anillo de poder que posee, tiene la capacidad de crear manifestaciones de luz sólida mediante la utilización del pensamiento', '' , 1, 1 ),
('Green Arrow', 'DC Comics', 'Oliver Queen', 'More Fun Comics #73', 'Oliver Queen', 'posee una gran habilidad como arquero y tiene un amplio arsenal de flechas. Es experto en las artes marciales, habilidades ninjas y la espada. Excelente rastreador, manejo de armas y piloto aviador. Amplios recursos financieros. Inmejorable estratega', '' , 1, 1 ),
('Wonder Woman', 'DC Comics', 'Princess Diana', 'All Star Comics #8', 'Princess Diana', 'súper vuelo, súper fuerza, súper velocidad, inmortalidad, factor de curación, reflejos, resistencia, habilidad de lucha altamente desarrollada, capacidad de hablar con los animales y en el idioma de cualquier persona que se encuentre', '' , 1, 1 ),
('Martian Manhunter', 'DC Comics', 'J\'onn J\'onzz', 'Detective Comics #225', 'Martian Manhunter', 'súper fuerza, velocidad sobrehumana, telepatía, telekinesis, regeneración acelerada, intangibilidad, invisibilidad, cambio de forma, capacidad de volar, visión láser y nueve sentidos aumentados', '' , 1, 1 ),
('Robin/Nightwing', 'DC Comics', 'Dick Grayson', 'Detective Comics #38', 'Dick Grayson', 'artista marcial experto, estrategias de combate, tecnología avanzada y habilidad gimnástica', '' , 1, 1 ),
('Blue Beetle', 'DC Comics', 'Dan Garret', 'Mystery Men Comics #1', 'Dan Garret, Ted Kord, Jaime Reyes', 'su armadura alienígena le concede: la capacidad de volar, resistencia y durabilidad mejoradas, creación de armas y traducción de idiomas alienígenas', '' , 1, 1 ),
('Black Canary', 'DC Comics', 'Dinah Drake', 'Flash Comics #86', 'Dinah Drake, Dinah Lance', 'experta en artes marciales, grito ultrasónico, tenaz aviadora y motociclista, gran estratega, reflejos, resistencia y agilidad sobrehumanos', '' , 1, 1 ),
('Aquaman', 'DC Comics', 'Arthur Curry', 'More Fun Comics #73', 'Arthur Curry', 'adaptación acuática-anfibia, telepatía, dominación psiónica de la vida marina, factor de curación, sentidos mejorados. Fuerza, agilidad, destreza, velocidad, resistencia y durabilidad sobrehumanas. Portador del tridente de Poseidón. Camuflaje submarino, creación y lanzamiento de rayos de agua dura', '' , 1, 1 ),
('Cyborg', 'DC Comics', 'Victor Stone', 'DC Comics Presents #26', 'Victor Stone', 'intelecto nivel genio, experto en combate cuerpo a cuerpo, fuerza sobrehumana, inmersión en el ciberespacio, tecnopatía, capacidad de volar, sensores y armamento avanzado', '' , 1, 1 ),
('Catwoman', 'DC Comics', 'Selina Kyle', 'DC Comics Batman #1', 'Selina Kyle', 'gran atleta, experta ladrona, agilidad propia de un gato, excelente combatiendo mano a mano. Utiliza un látigo como arma', '' , 1, 1 ),
('Raven', 'DC Comics', 'Rachel Roth', 'DC Comics Presents #26', 'Rachel Roth', 'empatía, manipulación emocional, curación empática, telequinesis, teletransportación, vuelo, control de la energía mística y proyección astral', '' , 1, 1 ),
('Etrigan', 'DC Comics', 'Jason Blood', 'DC Comics The Demon #1', 'Jason Blood', 'atributos físicos y poderes sensoriales sobrehumanos, capacidad de regeneración, poderes mágicos, precognición, telepatía, inmortalidad, puede lanzar llamas de fuego místico y tiene la capacidad de volar', '' , 1, 1 ),
('Spider Man', 'Marvel Comics', 'Peter Benjamin Parker', 'Amazing Fantasy #15', 'Peter Benjamin Parker', 'intelecto nivel genio, competente científico e inventor, fuerza, velocidad, agilidad, sentidos, reflejos, coordinación, equilibrio y resistencia sobrehumanos, sentido arácnido, se aferra a la mayoría de las superficies sólidas, utiliza muñequeras para disparar telarañas', '' , 1, 2 ),
('Captain America', 'Marvel Comics', 'Steve Rogers', 'Captain America Comics #1', 'Steve Rogers', 'sentidos, agilidad, velocidad y fuerza sobrehumanas, gran habilidad con su escudo, instinto de liderazgo, gran resistencia, inmune a gases y enfermedades, curación y regeneración acelerada, genio táctico, artista marcial, acróbata experto', '' , 1, 2 ),
('Iron Man', 'Marvel Comics', 'Tony Stark', 'Tales of Suspense #39', 'Tony Stark', 'cómo Tony Stark: intelecto nivel genio, experto científico e ingeniero. Cómo Iron Man: fuerza sobrehumana y durabilidad, vuelo supersónico, repulsor de energía y misiles de proyección, regenerativo soporte vital, uso de equipamiento, dispositivos y armamento de alta tecnología', '' , 1, 2 ),
('Thor', 'Marvel Comics', 'Thor Odinson', 'Journey into Myster #83', 'Thor Odinson', 'fuerza sobrehumana, velocidad, durabilidad y longevidad. Habilidades a través de Mjolnir: teletransportación interdimensional, manipulación eléctrica, vuelo y manipulación del tiempo', '' , 1, 2),
('Hulk', 'Marvel Comics', 'Bruce Banner', 'The Incredible Hulk #1', 'Bruce Banner', 'súper fuerza, velocidad, resistencia y salto, invulnerabilidad, longevidad, factor de curación rápida, capacidad de respirar bajo el agua, respirar en el espacio y ver fantasmas y otras entidades astrales. Todas sus habilidades aumentan en relación a su furia y emociones negativas tales como la ira, el miedo, e incluso los celos', '' , 1, 2),
('Wolverine', 'Marvel Comics', 'James Logan', 'The Incredible Hulk #180', 'James Logan', 'factor de curación mutante, regeneración intensificada, resistencia a poderes psíquicos, garras retráctiles, esqueleto recubierto de adamantium, sentidos animales, capacidad física sobrehumana', '' , 1, 2),
('Daredevil', 'Marvel Comics', 'Matthew Michael Murdock', 'Daredevil #1', 'Matthew Michael Murdock', 'ecolocalización, acróbata experto y maestro en artes marciales, tirador de precisión perfecta carencia del sentido del miedo', '' , 1, 2),
('Hawkeye', 'Marvel Comics', 'Clinton Francis Barton', 'Tales of Suspense #57', 'Clinton Francis Barton', 'Arquero excepcional, con una puntería perfecta, excelente percepción y reflejos extraordinarios. Acróbata experto. Buen combatiente cuerpo a cuerpo. Arcos fabricados por industrias Stark, uno corto, otro largo y otro compuesto. Flechas multiusos', '' , 1, 2),
('Cyclops', 'Marvel Comics', 'Scott Summers', 'X-Men #1', 'Scott Summers', 'rayos ópticos contusivos de energía solar, maestro táctico, artista marcial experto, excelente combatiente cuerpo a cuerpo e inmunidad a los poderes de sus hermanos', '' , 1, 2),
('Silver Surfer', 'Marvel Comics', 'Norrin Radd', 'The Fantastic Four #48', 'Norrin Radd', 'puede volar también sin su tabla, agilidad, fuerza y reflejos sobrehumanos, piel plateada casi impenetrable, absorbe energía cósmica de gran potencia,  tiene la capacidad rastrear pequeños objetos perdidos en el espacio, puede transformar la materia en energía cósmica y viceversa, crear armas o utensilios, curar heridas, ver el pasado, regenerarse, posee manipulación molecular y transportación interdimensional', '' , 1, 2),
('Dr. Strange', 'Marvel Comics', 'Stephen Strange', 'Strange Tales #110', 'Stephen Strange, Stephen Sanders, Vincent Stevens', 'poderes místicos tales como teletransportación, generación de ilusiones y proyección de energía. Puede invocar las llamas de los Faltine, las bandas carmesíes de Cyttorak y el escudo de los serafin. Tiene la capacidad de practicar el viaje astral, durante el cual es invisible e intangible, y solo puede ser dañado mediante rituales místicos más elaborados, sin embargo su cuerpo es vulnerable por estar en un trance similar a la muerte. En caso de que su cuerpo físico muriese durante dicho viaje, Stephen estaría en forma astral por siempre. Posee una esperanza de vida prolongada por el Ankh de la Vida y es dueño del Ojo de Agamotto', '' , 1, 2),
('Black Widow', 'Marvel Comics', 'Natasha Romanoff', 'Tales of Suspense #52', 'Natasha Romanoff, Natalie Rushman, Laura Matthers, Mary Farrell, Oktober, Yelena Belova', 'experta táctica, excelente combatiente cuerpo a cuerpo y agente secreta, envejecimiento lento y sistema inmunológico súper mejorado, tiradora experta y gran dominio de armas de filo e impacto', '' , 1, 2),
('Vision', 'Marvel Comics', 'Victor Shade', 'Avengers #57', 'Victor Shade', 'habilidades físicas sobrehumanas, inteligencia superior, vuelo, control de densidad, intangibilidad, regeneración, proyección de energía solar, tecnopatía', '' , 1, 2),
('Star Lord', 'Marvel Comics', 'Peter Jason Quill', 'Marvel Spotlight (vol. 2) #6', 'Peter Jason Quill', 'fuerza sobrehumana y vuelo (gracias a su traje), arma elemental y tirador experto', '' , 1, 2),
('Ant Man', 'Marvel Comics', 'Scott Lang', 'Tales to Astonish #27', 'Scott Lang, Hank Pym, Eric O\'Grady', 'cambios de tamaño desde casi microscópico a ~ 100 pies, mantiene la fuerza del tamaño normal en estado reducido, proyección de bioenergía, también conocida como Bio-Sting, fuerza y agilidad', '' , 1, 2),
('Groot', 'Marvel Comics', 'Monarca Planeta X', 'Tales to Astonish #13', 'Monarca Planeta X', 'succión de madera, resistente al fuego, capacidad de controlar los árboles, factor de curación acelerado y posee nivel intelectual de genio', 'https://i.pinimg.com/564x/ed/6a/ee/ed6aeeb286bcb02c85cf2ae92fb9be3d.jpg' , 0, 3),
('Storm', 'Marvel Comics', 'Ororo Iqadi Munroe', 'Giant Size X-Men # 1', 'Ororo Iqadi Munroe', 'capacidad psiónica de controlar todos los aspectos naturales del universo, entre ellos el clima. Puede manipular el viento, crear relámpagos, y generar todo tipo de fenómenos climáticos naturales. Además, Storm puede reducir o elevar la temperatura de su ambiente. También puede manipular el viento para elevarse a sí misma y volar a altas velocidades. Es inmune a los efectos del clima, a los relámpagos, al calor extremo y al frío. Entre las manifestaciones más insólitas de su poder se encuentra la fusión de agentes contaminadores tóxicos atmosféricos en la niebla ácida o lluvias tóxicas', 'https://i.pinimg.com/564x/06/85/48/068548b2fb8b95a3d594473952908d6f.jpg' , 0, 3),
('Él - Magnus', 'Marvel Comics', 'Adam Warlock', 'Fantastic Four n.º 66', 'Adam Warlock', 'posee varios poderes y características sobrehumanas derivadas de su estructura genética artificial, como fuerza y resistencia aumentadas, así como la capacidad de transformar energía cósmica con diferentes efectos y usos', 'https://i.annihil.us/u/prod/marvel/i/mg/4/00/5c9d29256c960/clean.jpg' , 0, 3);

INSERT INTO comentario (id_usuario, id_heroe, descripcion) VALUES
(6,1, 'The GOAT...'),
(7,1, 'Nuestra mayor gloria no consiste en no caer nunca... sino en caer y levantarnos constantemente'),
(8,1, 'Smoke Machine!'),
(9,1, 'Muy buen héroe, buen aporte.'),
(10,1, 'No te la bancas batman...'),
(4,1, 'No naciste para morir siendo igual que los demás...'),
(5,1, 'El más flojito... Wolverine se lo morfa...'),
(3,1, 'El batman de crónica... El mejor de todo los tiempos!!'),
(1,1, 'Batman el auténtico caballero de la noche!!'),
(2,1, '¿Qué le regaló batman a su mamá en su cumpleaños? Una Bati-Dora...');

INSERT INTO comentario (id_usuario, id_heroe, descripcion) VALUES
(1,2, 'Superman el más groso!!'),
(8,2, 'Kryptonita...'),
(4,2, 'Todo gran poder conlleva una gran responsabilidad'),
(2,2, 'Lo peor de ser fuerte es que nadie te pregunta si estás bien... Crack');

COMMIT;
