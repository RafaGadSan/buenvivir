import express, { Express, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

import { openDb } from './database';
import { hashPassword } from './auth';

const app: Express = express();
const route = express.Router();

app.use(express.json());

route.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello World with TypeScript' });
});

route.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }

  try {
    const db = await openDb();
    const user = await db.get('SELECT * FROM user WHERE user = ?', username);

    if (user && await bcrypt.compare(password, user.password)) {
      res.json({ message: 'Login successful', user: {kcal_limit: user.kcal_limit, kcal_recommended: user.kcal_recommended}});
    } else {
      res.status(401).send({message: "Authentication failed"});
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

app.use(route);

const PORT = 3333;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});