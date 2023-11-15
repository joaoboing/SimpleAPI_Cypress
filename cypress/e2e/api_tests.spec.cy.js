/*
Teste feito em 15/11/2023 para a vaga de Analista de Testes de Automação para empresa SempreIT.
Autor: João Vitor Boing Corrêa.
Disclaimer:
Apenas por uma questão de pouco tempo para a implementação e por se tratar de um teste de conhecimento, todos os testCases foram feitos dentro do mesmo arquivo.
Sabe-se que o correto seria criar um TestCase para cada função da API em outro arquivo. Seguindo o modelo de um padrão de testes.
Também, foram utilizadas algumas informações inseridas de TestCases anteriores em outro Testcase:
como por exemplo na hora que inserimos uma order e depois verificamos em outro teste a lista de order com essa order. 

Tentei comentar o máximo possível para entedimento da minha lógica no teste.
*/

describe('Simple Books API Tests', () => {
  let accessToken; //accesstoken
  let r = (Math.random() + 1).toString(36).substring(7); //gera uma string aleatoria como usuario para passar no clientName/Email
  let orderId; //pega no teste que lista as orders.

  before(() => {
    //registra um cliente aleatorio pra obter acesstoken
    cy.request({
      method: 'POST',
      url: 'api-clients/',
      body: {
        clientName: r,
        clientEmail: r + '@example.com',
      },
    }).then(response => {
      expect(response.status).to.equal(201); //verifica retorno se usuario foi "Created";
      expect(response.body).to.have.property('accessToken');//verifica se a resposta tem o accesstoken
      accessToken = response.body.accessToken; //armazena o accesstoken para uso futuro
    });
  });

  it('should retrieve the status of the API', () => { //deve retornar o status da api
    cy.request('status').then(response => {
      expect(response.status).to.equal(200); //como esperamos que a api esteja ok, esperamos o status 200.
    });
  });

  it('should retrieve a list of books', () => { //deve retornar a lista de livros
    cy.request('/books').then(response => {
      expect(response.status).to.equal(200); //chamada ok
  
      //verificar se a api esta retornando o array de 6 esperado.
      expect(response.body).to.be.an('array').and.have.lengthOf(6);
  
      //verificar conteudo de uma lista de livros, neste caso feito apenas com o primeiro livro.
      const books = response.body;
      expect(books[0]).to.deep.include({
        id: 1,
        name: 'The Russian',
        type: 'fiction',
        available: true
      });
    });
  });

  it('should retrieve detailed information about a book', () => { //deve retornar informações detalhadas de um livro
    const bookId = 1; 
    cy.request(`/books/${bookId}`).then(response => {      
      expect(response.status).to.equal(200); //chamada ok
  
      //verificando se está com o retorno correto com base na nossa "massa de dados", neste caso, chumbada no código. 
      const expectedBookDetails = {
        id: 1,
        name: 'The Russian',
        author: 'James Patterson and James O. Born',
        isbn: '1780899475',
        type: 'fiction',
        price: 12.98,
        'current-stock': 12,
        available: true
      };
  
      expect(response.body).to.deep.equal(expectedBookDetails); //verifica se dentro do body tem as informações esperadas.
    });
  });

  it('should submit an order successfully', () => { //deve gerar uma order
    const orderData = {
      bookId: 1,
      customerName: 'John Doe',
    }; //dados da order

    cy.request({
      method: 'POST',
      url: '/orders',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: orderData,
    }).then(response => {
      expect(response.status).to.equal(201); //chamada ok
      expect(response.body).to.have.property('orderId'); //verificar se gerou um orderId.
    });
  });

  it('should retrieve all orders', () => { //deve retornar todas as orders, neste caso, esperada apenas 1 criada no teste anterior.
    cy.request({
      method: 'GET',
      url: '/orders',
      headers: {
        Authorization: `Bearer ${accessToken}`, 
      },
    }).then(response => {
      expect(response.status).to.equal(200);  //chamada ok
      expect(response.body).to.be.an('array').and.have.lengthOf(1); //verifica se tem apenas uma ordem criada 
      const orders = response.body; //manipulacao do body
      orderId = orders[0].id; //armazenar o orderid como variavel global para verificar no teste de ordem detalhada. Poderia ter sido armazenado o orderId no teste de criação também.
    });
  });

  it('should get details of a specific order', () => { ////obter detalhes de uma order especifica a partir de um ORderId    
    cy.request({
      method: 'GET',
      url: `/orders/${orderId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }).then(response => {
      expect(response.status).to.equal(200);//chamada ok

      //verifica se corresponde ao pedido que criamos anteriormente.
      expect(response.body).to.deep.include({
        bookId: 1,
        customerName: 'John Doe',
      });
    });
  });

  it('should update an order and verify the change', () => { //da update na order com novos dados e depois chamada GetOrder para verificar se alterou.
    const updatedOrderData = {
      customerName: 'john',
    }; //massa dados

    cy.request({
      method: 'PATCH',
      url: `/orders/${orderId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: updatedOrderData,
    }).then(updateResponse => {
      //verifica se o update foi success
      expect(updateResponse.status).to.equal(204);
    });

    cy.request({
      method: 'GET',
      url: `/orders/${orderId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }).then(getResponse => {
      expect(getResponse.status).to.equal(200);
      //verifica se deu update no nome
      expect(getResponse.body).to.deep.include({
        id: orderId,
        bookId: 1,
        customerName: 'john',        
      });
    });
  });

  it('should delete an order and verify the list is empty', () => {    //deleta uma order e depois chama a api da lista de orders para ver se esta zerada
    cy.request({
      method: 'DELETE',
      url: `/orders/${orderId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }).then(deleteResponse => {
      //verifica se excluimos o pedido
      expect(deleteResponse.status).to.equal(204);
    });

    //obter a nova lista de pedidos
    cy.request({
      method: 'GET',
      url: '/orders',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }).then(getResponse => {
      expect(getResponse.status).to.equal(200);
      //verifica se a lista de pedidos esta vazia
      expect(getResponse.body).to.be.an('array').and.have.lengthOf(0);
    });
  });  
  after(() => {
    
  });
});
