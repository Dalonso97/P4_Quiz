
const fs = require("fs");
// Nombre del fichero donde se guardan las preguntas
// Es un fichero de texto con el JSON de quizzes
const DB_FILENAME = "quizzes.json";

// modelo de datos
// En est variable se mantienen todos los quizzes existentes
// es un array de objetos, donde cada objeto tiene los atributos question
// y answer para guardar el texto de la pregunta y el de la respuesta

// AL arrancar la aplicacion, esta variable contiene estas cuatro preguntas
//pero al fina del modulo se llama a load() para cargar las preguntas
// guardadas en el fichero DB_FILENAME

let quizzes = [
    {
        question: "Capital de Italia ",
        answer:"Roma"
    },
    {
        question: "Capital de Francia ",
        answer:"París"
    },
    {
        question: "Capital de España ",
        answer:"Madrid"
    },
    {
        question: "Capital de Portugal ",
        answer:"Lisboa"
    }
];

/**
 * Carga las preguntas guardadas en el fichero
 * Este metodo carga el contenido del fichero DB_FILENAME enla variable
 * quizzes. El contenido de este fichero esta en formato .JSON.
 * La primera vez que se ejecute este metodo, el fichero DB_FILENAME no
 * existe, y se producira el eror ENOENT. En este caso se salva el
 * contenido inicial almacenado en quizzes.
 * Si se produce otro tipo de error, se lanza una excepcion que abortara
 * la ejecucion del programa
 */

const load = () => {
    fs.readFile(DB_FILENAME, (err,data)=>{
        if(err){
            if(err.code=== "ENOENT"){// error cuando no existe el fichero
                save();
                return;
            }
            throw err;
        }
        let json =JSON.parse(data);// cojo los datos que se caban de leer, lo parseo  y se lo asigno a mi array quizzes
        if(json){
            quizzes = json;
        }
    });

};

/**
 * Guarda las preguntas del fichero
 *
 *
 * Gurada en formato JSON el valor de quizzes en el fichero DB_FILENAME.
 * Si se produce algun tipo de error se lanza excepcion que abortara
 * la ejecucion del programa
 */

const save =()=> {
    fs.writeFile(DB_FILENAME, // escribe el fichero
        JSON.stringify(quizzes),
        err=>{
            if(err) throw err;

        });
};






//
/**
 * devuelve el numero total de preguntas existentes.
 * @returns {number} numero total de preguntas existentes.
 */
exports.count = () => quizzes.length;

/**
 * Añade un nuevo quiz
 * @param question String con la pregunta
 * @param answer String con la respuesta
 */

exports.add = (question, answer)=>{
    quizzes.push({
        question: (question ||"").trim(),
        answer:(answer ||"").trim()
    });
    save();
};

/**
 * Actualiza el quiz situado en la posicion index
 * @param id Clave que identifica el quiz a actuaizar
 * @param question String con la pregunta
 * @param answer String con la respuesta
 */
exports.update =(id, question, answer)=>{
    const quiz = quizzes[id];
    if(typeof quiz === "undefined"){
        throw new Error(`El valor del parametro id no es valido.`);
    }
    quizzes.splice(id,1,{
        question:(question ||"").trim(),
        answer:(answer ||"").trim()
    });
    save();
};

/**
 * Devuelve todos los quizzes existentes.
 *
 * devuelve un clon del valor guardado en la variable quizzes, e decir devuelve
 * un objeto nuevo con todas las preguntas existenntes.
 * Para clonar quizzes se usa stringify + parse.
 * @returns {any}
 */
exports.getAll = () => JSON.parse(JSON.stringify(quizzes));

/**
 * Devuelve un clon del quiz almacenado en la posicon dada.
 * Para clonar el quiz se usa Stringify + parse.
 * @param id Clave que identifica el quiz a devolver
 * @returns {question, answer} Devuelve el objeto quiz en la posicion dada
 */
exports.getByIndex = id =>{

    const quiz = quizzes[id];
    if (typeof quiz === "undefined"){
        throw new Error(`El valor del parametro id no es valido`);
    }
    return JSON.parse(JSON.stringify(quiz));
};

/**
 * Elimina el quiz situado en la posicin dada
 * @param id Clave que identifica el quiz a borrar
 */
exports.deleteByIndex = id => {
    const quiz = quizzes[id];
    if (typeof quiz === "undefined"){
        throw new Error(`El valor del parametro id no es valido.`);
    }
    quizzes.splice(id,1);
    save();
};

// Carga los quizzes almacenados en el fichero

load();

