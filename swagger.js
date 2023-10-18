const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  swaggerDefinition: {
    info: {
      title: 'Crash Gambling Game',
      version: '1.0.0',
      description: 'Crashgambling game API',
    },
  },
  apis: ['./server.js'], 
};

const specs = swaggerJsdoc(options);

module.exports = specs;
