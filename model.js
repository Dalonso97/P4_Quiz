const Sequelize = require('sequelize'); //carga el modulo sequelize

const sequelize = new Sequelize ("sqLite:quizzes.sqLite", {logging: false});// genero una instancia de sequelize para acceder a una base de datos que contiene ese fichero
//logging false es para eliminar trazas
sequelize.define('quiz', { // defino un modeo de datos
    question: {
        type: Sequelize.STRING,
        unique:{msg: "Ya existe esta pregunta"}, //pregunta unica
        validate: {notEmpty: {msg: "La pregunta no puede estar vacia"}}
    },
    answer:{
        type: Sequelize.STRING,
        validate: {notEmpty: {msg: "La respuesta no puede estar vacia"}}
    }
});

sequelize.sync() //sincronizar
    .then(() => sequelize.models.quiz.count()) // dentro de sequelize accede a models
    .then(count => {
        if(!count){
            return sequelize.models.quiz.bulkCreate([ // crea quizzes
                { question: "Capital de Italia", answer: "Roma"},
                { question: "Capital de Francia", answer: "París"},
                { question: "Capital de España", answer: "Madrid"},
                { question: "Capital de Portugal", answer: "Lisboa"}
            ]);
        }
    })
    .catch(error => {
        console.log(error);
    });

module.exports = sequelize;


