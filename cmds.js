const {log, biglog, errorlog,colorize}= require("./out");
const model = require('./model');


/**
 *Muestra la ayuda.
 */
exports.helpCmd = rl => {
    log('Comandos:');
    log("h|help - Muestra esta ayuda.");
    log("list - Listar los quizzes existentes.");
    log("show <id> - Muestra la pregunta y la respuesta del quiz indicado");
    log("add - Añadir un nuevo quiz interactivamente.");
    log("delete <id> - Borrar el quiz indicado. ");
    log("edit <id> - Editar el quiz indicado.");
    log("test <id> - Probar el quiz indicaddo.");
    log("p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
    log("credits - Creditos.");
    log(" q|quit - Salir del programa.");
    rl.prompt();
};


/**
 *Lista todos los quizzes existentes en el modelo.
 */
exports.listCmd = rl => {

    model.getAll().forEach((quiz, id) => {
        log(`[${colorize(id, 'magenta')}]: ${quiz.question}`);
    });
    rl.prompt();
};

/**
 *Muestra el quiz indicado en el parametro: la pregunta y la respuesta.
 * @param id Clave del quiz a mostrar.
 */
exports.showCmd = (rl,id) => {
    if (typeof id === "undefined"){ // no me pasan id
        errorlog(`Falta el parametro id.`);
    }else{
        try{
            const quiz = model.getByIndex(id); // del modelo accedo a la posicion id y lo guardo en quiz
            log(`[${colorize(id,'magenta')}]: ${quiz.question}${colorize('=>','magenta')}${quiz.answer}`);
        }catch(error){
            errorlog(error.message);
        }
    }

    rl.prompt();
};



/**
 *Añade un nuevo quiz el modelo
 * Pregunta interactivamente por la pregunta y por la respuesta
 */
exports.addCmd = rl => {
    rl.question(colorize('Introduzca una pregunta: ', 'red'),question =>{ // hazme una pregunta con este texto
        rl.question(colorize('Introduzca la respuesta ', 'red'), answer =>{// pongo la resuesta y hasta que no de enter no sigue
            model.add(question,answer);
            log(`${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>','magenta')} ${answer}`);
            rl.prompt();
        });
    });

};


/**
 *Borra un quiz del modelo
 * @param id Clave del quiz a borrar.
 */
exports.deleteCmd = (rl,id)  => {
    if (typeof id === "undefined"){ // si el arametro es raro error
        errorlog(`Falta el parametro id.`);
    }else{
        try{
            model.deleteByIndex(id); // borra el elemento en la posicion id

        }catch(error){
            errorlog(error.message);
        }
    }

    rl.prompt();
};

/**
 *Edita un quiz del modelo
 * @param id Clave del quiz a editar.
 */
exports.editCmd = (rl,id) => {
    if (typeof id === "undefined"){ // si el id es indefinido => eror
        errorlog(`Falta el parametro id.`);
        rl.prompt();
    }else{
        try{
            const quiz = model.getByIndex(id); // llama al elemento en la posicion id
            process.stdout.isTTY && setTimeout(()=> {rl.write(quiz.question)},0);// quiero que ecribas por la entrada standar lo que haya en quiz.question

            rl.question(colorize('Introduzca una pregunta: ', 'red'),question =>{
                process.stdout.isTTY && setTimeout(()=> {rl.write(quiz.answer)},0); // escribe el texto de la respuesta y lo que habria que hacer es editar sobre el.
                rl.question(colorize('Introduzca la respuesta ' ,'red'), answer =>{
                    model.update(id,question, answer);// en la posicion id se actualiza pregunta y respuesta
                    log(`Se ha cambiado el qiz ${colorize(id,'magenta')} por: ${question}${colorize('=>','magenta')} ${answer}`);
                    rl.prompt();


                });
            });
        }catch (error){
            errorlog(error.message);
            rl.prompt();
        }
    }
};

/**
 *Pregunta todos los quizzes existente en el modelo en orden aleatorio
 * se gana si contesta a todos satisfactoriamente
 */
exports.playCmd = rl =>{
    let score = 0;
    let toBeResolved = [];
     for(let i=0; i<model.count() ;i++){
         toBeResolved.push(model.getByIndex(i));
     }
     const playOne = () => {
         if (toBeResolved.length === 0) {
             log(`No hay mas preguntas`);
             log(`Fin del juego. Aciertos:`)
             biglog(score, 'magenta');
             rl.prompt();

         }

         else {
             let id = Math.trunc(Math.random() * (toBeResolved.length));
             let quiz = toBeResolved[id];
             toBeResolved.splice(id, 1);

             rl.question(colorize(`${quiz.question}?`, 'red'), resp => {
                 if (resp.toLowerCase().trim() === quiz.answer.toLowerCase().trim()) {

                     score++
                     log(`CORRECTO - Lleva ${score} aciertos.`);

                     playOne();

                 }


                 else {
                     log('INCORRECTO.');
                     log(`Fin del juego. Aciertos: ${score}`)
                     biglog(score, 'magenta');
                     rl.prompt()


                 }
             });
         }
     }
     playOne();
}




/**
 *Prueba un quiz, es decir, hace una pregunta del modelo que debemos contestar
 * @param id Clave del quiz a probar
 */

exports.testCmd = (rl,id) =>{
    if (typeof id === "undefined"){ // si el id es indefinido => eror
        errorlog(`Falta el parametro id.`);
        rl.prompt();
    }else{
        try {
            const quiz = model.getByIndex(id);
            rl.question(colorize(quiz.question, 'red') ,resp =>{

                if (resp.toLowerCase().trim() === quiz.answer.toLowerCase().trim()) {
                    log('Su respuesta es correcta');
                    biglog('CORRECTO', 'green');
                    rl.prompt()
                }


                else {
                    biglog('INCORRECTO', 'red');
                    log('Su respuesta es incorrecta');
                    rl.prompt()
                }

                });


        }catch(error){
            errorlog(error.message);
            rl.prompt
        }
    }


                   };

/**
 *Muestra el noombre del autor de la practica
 */

exports.creditsCmd = rl => {
    log('Autores de la practica:')
    log('DAVID');
    rl.prompt();
};

/**
 * Terminar el programa
 */
exports.quitCmd = rl =>{
    rl.close();
};

