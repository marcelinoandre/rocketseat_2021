const express = require('express');
const { v4: uuid } = require('uuid');

const app = express();

app.use(express.json());

const customers = [];

// Middleware
function verifyIfExistsAccountCPF(request, response, next) {
  const { cpf } = request.headers;

  const customer = customers.find(customer => customer.cpf === cpf);

  if (!customer)
    return response.status(400).json({ error: 'Customer not found' });

  request.customer = customer;
  return next();
}

function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === 'credit') {
      return acc + operation.amount;
    }

    return acc - operation.amount;
  }, 0);

  return balance;
}

app.post('/account', (request, response) => {
  const { cpf, name } = request.body;

  const customerAlreadyExistis = customers.some(
    customer => customer.cpf === cpf
  );

  if (customerAlreadyExistis)
    return response.status(400).json({ error: 'Customer already exists!' });

  customers.push({
    id: uuid(),
    cpf,
    name,
    statement: []
  });

  return response.status(201).send();
});

app.use(verifyIfExistsAccountCPF);

app.get('/account', (request, response) => {
  const { customer } = request;

  return response.json(customer);
});

app.get('/statement', (request, response) => {
  const { customer } = request;

  return response.json(customer.statement);
});



app.get('/statement/date', (request, response) => {
  const { customer } = request;
  const { date } = request.query;

  const dateFormat = new Date(date + ' 00:00').toDateString();

  const statement = customer.statement.filter(
    statement => statement.created_at.toDateString() === dateFormat
  );

  return response.json(statement);
});


app.post('/deposit', (request, response) => {
  const { description, amount } = request.body;

  const { customer } = request;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: 'credit'
  };

  customer.statement.push(statementOperation);

  return response.status(201).send();
});

app.post('/withdraw', (request, response) => {
  const { amount } = request.body;
  const { customer } = request;

  const balance = getBalance(customer.statement);

  if (balance < amount)
    return response.status(400).json({ error: 'Insufficient funds!' });

    const statementOperation = {
      amount,
      created_at: new Date(),
      type: 'debit'
    };

    customer.statement.push(statementOperation)

    return response.status(201).send()
});

app.patch('/account', (request, response) => {
  const { name } = request.body;
  const { customer } = request;

  customer.name = name;

  return response.status(201).send();
});

app.get('/accounts', (request, response) => {
  return response.json({ customers });
});

app.delete('/account', (request, response) => {
  const { customer } = request;

  if (!customer) customers.splice(customer, 1);

  return response.status(200).json({ customers });
});

app.get('/balance', (request, response) => {
  const { customer } = request;

  const balance = getBalance(customer.statement);

  return response.json({ balance });
});


app.listen(3333, () => {
  console.log('🚀 Server running in port 3333');
});
