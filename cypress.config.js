const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {    
    baseUrl: 'https://simple-books-api.glitch.me'
  },
});
