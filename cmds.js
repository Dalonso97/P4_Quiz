const Sequelize = require('sequelize');

const {log, biglog, errorlog,colorize}= require("./out");
const {models} = require('./model');


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

    models.quiz.findAll() // promesa que me devlvera todos los quizzes existentes
        .each(quiz => {

                log(`[${colorize(quiz.id, 'magenta')}]:  ${quiz.question}`);

        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });

};
/**
 * Esta funcion devuelve una promesa que :
 * valida que se ha introducido un valor para el prametro.
 * converte el parametro en un numero entero.
 * si todo va bien, la promesa satisface y devuelve el valor id
 *
 * @param id parametro con el indice a validar.
 */

const validateId = id => { // funcion que pasa id como parametro
    return new Sequelize.Promise((resolve, reject) => {
        if (typeof id === "undefined") {
            reject(new Error(`Falta el parametro <id>.`));
        } else {
            id = parseInt(id); // coge la parte entera y descartar lo demas
            if (Number.isNaN(id)){
                reject(new Error(`El valor del parametro <id> no es un numero.`))
            }else {
                resolve(id);
            }
        }
    });
};


/**
 *Muestra el quiz indicado en el parametro: la pregunta y la respuesta.
 * @param id Clave del quiz a mostrar.
 */
exports.showCmd = (rl,id) => {
    validateId(id) // llamo a una funcion que me devuelve una promesa
        .then(id => models.quiz.findById(id)) // busco quiz por id
        .then(quiz => {
            if (!quiz) {
                throw new Error(`No existe un quiz asociado al id=${id}.`);
            }
            log(` [${colorize(quiz.id, 'magenta')}]:  ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });
};

const makeQuestion = (rl, text) => {

    return new Sequelize.Promise((resolve, reject) => {
        rl.question(colorize(text, 'red'), answer => {
            resolve(answer.trim());
        });
    });
};


/**
 *Añade un nuevo quiz el modelo
 * Pregunta interactivamente por la pregunta y por la respuesta
 */
exports.addCmd = rl => {
    makeQuestion(rl, 'Introduzca una pregunta: ')
        .then(q=> {
            return makeQuestion(rl, 'Introduzca la respuesta ' )
                .then(a => {
                    return {question: q, answer: a};
                });
        })
        .then(quiz => {
            return models.quiz.create(quiz);
        })
        .then((quiz) => {
            log(`${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>','magenta')} ${answer}`);
        })
        .catch(Sequelize.ValidationError, error => {
            errorlog('El quiz es erroneo:');
            error.errors.forEach(({message}) => errorlog(message));
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });

};


/**
 *Borra un quiz del modelo
 * @param id Clave del quiz a borrar.
 */
exports.deleteCmd = (rl,id)  => {

    validateId(id)
        .then(id => models.quiz.destroy({where: {id}}))
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });
};

/**
 *Edita un quiz del modelo
 * @param id Clave del quiz a editar.
 */
exports.editCmd = (rl,id) => {
    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if(!quiz) {
                throw new Error(`No existe un quiz asociado a id=${id}.`);
            }
            process.stdout.isTTY && setTimeout(()=> {rl.write(quiz.question)},0);
            return makeQuestion(rl, 'Introduzca la pregunta:')
                .then(q => {
                    process.stdout.isTTY && setTimeout(()=> {rl.write(quiz.answer)},0);
                    return makeQuestion(rl, 'Introduzca la resuesta')
                        .then(a => {
                            quiz.question = q;
                            quiz.answer = a;
                            return quiz;
                        });
                    ;
                })
                .then (quiz => {
                    return quiz.save();
                })
                .then(quiz => {
                    log(`Se ha cambiado el qiz ${colorize(id,'magenta')} por: ${question}${colorize('=>','magenta')} ${answer}`);
                })

                .catch(Sequelize.ValidationError, error => {

                    errorlog('El quiz es erronea:');
                    error.errors.forEach(({message}) => errorlog(message));
                })
                .catch(error => {
                    errorlog(error.message);
                })
                .then(() => {
                    rl.prompt();
                });
        });
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
    models.quiz.findAll({raw: true})
        .then(quizzes => {
            toBeResolved=quizzes;
            const playOne = () => {
                if (toBeResolved.length <= 0) {
                    log("No hay nada más que preguntar.");
                    log(`Fin del juego. Aciertos: ${score}`);
                    biglog(`${score}`, 'magenta');
                    rl.prompt();
                }
                else
                {
                    let id = Math.trunc(Math.random() * toBeResolved.length);
                    let quiz = toBeResolved[id];
                    toBeResolved.splice(id, 1);
                    return makeQuestion(rl, ` ${quiz.question} `)
                        .then(resp => {
                            if (resp.trim().toLowerCase() === quiz.answer.trim().toLowerCase()) {
                                score++;
                                log(`CORRECTO - Lleva ${score} aciertos.`);
                                playOne();
                            } else {
                                log('INCORRECTO');
                                log(`Fin del juego. Aciertos: ${score}`);
                                biglog(`${score}`, 'magenta');
                            }
                        })
                        .catch(error => {
                            errorlog(error.message);
                        })
                        .then(() => {
                            rl.prompt();
                        });
                }
            };
            playOne();
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });
        };






/**
 *Prueba un quiz, es decir, hace una pregunta del modelo que debemos contestar
 * @param id Clave del quiz a probar
 */

exports.testCmd = (rl,id) =>{
   validateId(id)
       .then(id => models.quiz.findById(id))
       .then(quiz => {
           if(!quiz){
               throw new Error(`No existe ese quiz`)
           }
           return makeQuestion(rl, `${quiz.question}`)
               .then(resp => {
                   if(resp.trim().toLowerCase() === quiz.answer.trim().toLowerCase()){
                       log('Su resuesta es correcta');
                       biglog('CORRECTA', 'green');
                   } else{
                       log('Su respuesta e incorrecta');
                       biglog('INCORRECTA', 'red');
                   }
               });
       })
       .catch(error => {
           errorlog(error.message);
       })
       .then(()=>{
           rl.prompt();
       });

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

