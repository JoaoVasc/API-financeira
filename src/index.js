const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

/*

GET - Buscar informações dentro do servidor
POST - Inserir uma informação no servidor
PUT - Atualizar uma informação ja existente do servidor
PUSH - Atualizar uma informação expecifica ja existente do servidor
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

const cliente = [];

//MIDLEWARE
function verifyIfExistsAccountCPF(request, response, next) {
  const { cpf } = request.headers;

  const customer = cliente.find((customer) => customer.cpf === cpf);

  if (!customer) {
    return response.status(400).json({ error: "Cliente inexistente" });
  }

  request.customer = customer;

  return next();
}

function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    operation === "credit"
      ? acc + operation.statement
      : acc - operation.statement;
  }, 0);
  return balance;
}

//app.use(verifyIfExistsAccountCPF); => uso de forma global

app.post("/account", (request, response) => {
  const { cpf, name } = request.body;

  const customerAlredyExists = cliente.some((customer) => customer.cpf === cpf);

  if (customerAlredyExists) {
    return response.status(400).json({ error: "cliente ja existe" });
  }

  cliente.push({
    cpf,
    name,
    id: uuidv4(),
    statement: [],
    balance: [],
  });

  return response.status(201).send("cliente criado com sucesso");
});

app.get("/statement", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;
  return response.json(customer.statement);
});

app.get("/statement/date", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;
  const { date } = request.query;

  const dateFormat = new Date(date + " 00:00");

  const statement = customer.statement.filter(
    (statement) =>
      statement.crated_at.toDateString() === new Date(dateFormat).toDateString()
  );

  return response.json(statement);
});

app.get("/user", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;
  return response.status(200).json(cliente);
});

app.post("/deposit", verifyIfExistsAccountCPF, (request, response) => {
  const { description, amount } = request.body;

  const { customer } = request;

  const statementOperation = {
    description,
    amount,
    crated_at: new Date(),
    type: "credit",
  };

  customer.statement.push(statementOperation);
  customer.balance.push(statementOperation.amount);

  return response.status(201).send();
});

app.post("/withdraw", verifyIfExistsAccountCPF, (request, response) => {
  const { amount } = request.body;
  const { customer } = request;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    return response.status(400).json({ error: "saldo insuficiente" });
  } else {
    const statementOperation = {
      amount,
      crated_at: new Date(),
      type: "debit",
    };

    customer.statement.push(statementOperation);
    customer.balance.push(statementOperation.amount * -1);

    return response.status(201).send();
  }
});

app.get("/balance", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;
  const valores = customer.balance;
  var soma = 0;
  for (let i = 0; i < valores.length; i++) {
    soma += valores[i];
  }

  return response.json(`SALDO ATUAL DE: ${soma}`);
});

app.put("/name", verifyIfExistsAccountCPF, (request, response) => {
  const { name } = request.body;
  const { customer } = request;

  customer.name = name;

  return response.status(201).send();
});

app.delete("/account", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;

  cliente.splice(customer, 1)
  return response.status(200).json(cliente)
});

app.listen(3333);
