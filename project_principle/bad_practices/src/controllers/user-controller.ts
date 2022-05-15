import { IncomingMessage, ServerResponse } from "http";
import fs from 'fs/promises';
import { IUserEntity } from '../models/user/user-interface';
import { User } from "../models/user/user-entity";

class UserController {
  store(request: IncomingMessage, response: ServerResponse) {
    request.on('data', async (data) => {
      const body = JSON.parse(data.toString());
      
      const mandatoryFields = ['name', 'email', 'password'];

      const missingFields = mandatoryFields.filter(field => !body[field]);

      if(missingFields.length > 0) {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.write(JSON.stringify({ error: `Missing fields: ${missingFields.join(', ')}` }));
        response.end();
        return;
      }

      const database = JSON.parse(await fs.readFile('./database.json', 'utf-8'));

      const emailExists = database.users.some((user: IUserEntity) => user.email === body.email);

      if(emailExists) {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.write(JSON.stringify({ error: 'Email already exists' }));
        response.end();
        return;
      }

      const user = new User({
        ...body,
        id: database.users.length + 1,
        created_at: new Date(), updated_at: new Date()
      })

      database.users.push(user);

      await fs.writeFile('./database.json', JSON.stringify(database, null, 2));

      user.password = undefined;
      response.writeHead(201, { 'Content-Type': 'application/json' });
      response.write(JSON.stringify(user));
      response.end();
    })
    .on('error', () => {
      response.writeHead(500, { 'Content-Type': 'application/json' });
      response.write(JSON.stringify({ error: 'Internal Server Error' }));
      response.end();
    });

  }

  async index(request: IncomingMessage, response: ServerResponse) {
    const database = JSON.parse(await fs.readFile('./database.json', 'utf-8'));
    
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify(database.users.map((user: IUserEntity) => new User(user).serialize())))
    response.end();
  }

  async show(request: IncomingMessage, response: ServerResponse) {
    const id = Number(request.url.split('/')[2]);
    const database = JSON.parse(await fs.readFile('./database.json', 'utf-8'));

    const user = database.users.find((user: IUserEntity) => user.id === id);

    if(!user) {
      response.writeHead(404, { 'Content-Type': 'application/json' });
      response.write(JSON.stringify({ error: 'User not found' }));
      response.end();
      return;
    }

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify((new User(user)).serialize()));
    response.end();
  }

  async update(request: IncomingMessage, response: ServerResponse) {
    const id = Number(request.url.split('/')[2]);
    const database = JSON.parse(await fs.readFile('./database.json', 'utf-8'));
    const userIndex = database.users.findIndex((user: IUserEntity) => user.id === id);

    if(userIndex === -1) {
      response.writeHead(404, { 'Content-Type': 'application/json' });
      response.write(JSON.stringify({ error: 'User not found' }));
      response.end();
      return;
    }

    request.on('data', async (data) => {
      const body = JSON.parse(data.toString());

      database.users[userIndex] = {
        email: body.email || database.users[userIndex].email,
        name: body.name || database.users[userIndex].name,
        updated_at: new Date(),
        created_at: database.users[userIndex].created_at,
        id: database.users[userIndex].id,
        password: database.users[userIndex].password
      }

      await fs.writeFile('./database.json', JSON.stringify(database, null, 2));

      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.write(JSON.stringify(new User(database.users[userIndex]).serialize()));
      response.end();
    }).on('error', () => {
      response.writeHead(500, { 'Content-Type': 'application/json' });
      response.write(JSON.stringify({ error: 'Internal Server Error' }));
      response.end();
    })
  }

  async destroy(request: IncomingMessage, response: ServerResponse) {
    const id = Number(request.url.split('/')[2]);
    const database = JSON.parse(await fs.readFile('./database.json', 'utf-8'));
    const userIndex = database.users.findIndex((user: IUserEntity) => user.id === id);

    if(userIndex === -1) {
      response.writeHead(404, { 'Content-Type': 'application/json' });
      response.write(JSON.stringify({ error: 'User not found' }));
      response.end();
      return;
    }

    database.users.splice(userIndex, 1);
    await fs.writeFile('./database.json', JSON.stringify(database, null, 2));

    response.writeHead(204, { 'Content-Type': 'application/json' });
    response.end();
  }
}

export const userController = new UserController();
