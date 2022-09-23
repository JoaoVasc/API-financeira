const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

/*

GET - Buscar informações dentro do servidor
POST - Inserir uma informação no servidor
PUT - Atualizar uma informação ja existente do servidor
PUT - Atualizar uma informação expecifica ja existente do servidor
DELETE - Deletar uma informação do servidor

*/

/*

  TIPOS DE PARÂMETROS

  routes Params => identificar um recurso editar/deletar/buscar
  
  Query Params => Paginação e filtros
  
  Body Params => Objetos p/ inserção / alteração de recursos
  
*/

/*

  definição de conta para usuário
  cpf = string
  nome = string
  id = uuid
  statement = []

*/

const customers = [];

app.post("/account", (request, response) => {
  const { cpf, name } = request.body;

  const customerAlredyExists = customers.some(
    (customer) => customer.cpf === cpf
  );

  if (customerAlredyExists) {
    return response.status(400).json({ error: "cliente ja existe" });
  }

  customers.push({
    cpf,
    name,
    id: uuidv4(),
    statemant: [],
  });

  return response.status(201).send();
});

app.get("/statement/:cpf", (request, response) => {
  const { cpf } = request.params;

  const customer = customers.find((customer) => customer.cpf === cpf)

  if(!customer) {
    return response.status(400).json({ error: "Cliente inexistente" });
  }

  return response.json(customer.statemant)
});

app.listen(3333);
