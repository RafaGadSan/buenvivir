import express, { Express, Request, Response } from "express";
import session from "express-session";
import bcrypt from "bcrypt";
import { open } from "sqlite";
import sqlite3 from "sqlite3";

import { openDb } from "./database";
import { hashPassword } from "./auth";

const app: Express = express();

app.use(
  session({
    secret: "Elsecretoesbuenvivir",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: !true }, // `true` en producción con HTTPS, `false` para desarrollo
  })
);
const route = express.Router();

app.use(express.json());

route.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello World with TypeScript" });
});

route.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("Username and password are required");
  }

  try {
    const db = await openDb();
    const user = await db.get("SELECT * FROM user WHERE user = ?", username);

    if (user && (await bcrypt.compare(password, user.password))) {
      req.session.user = { id: user.id, username: user.username };
      res.json({
        message: "Login successful",
        user: {
          kcal_limit: user.kcal_limit,
          kcal_recommended: user.kcal_recommended,
        },
      });
    } else {
      res.status(401).send({ message: "Authentication failed" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});
//Editar y crear meals, que son del usuario (hace falta su referencia)
//editar y crear ingested_meals, que son las comidas ingeridas por el usuario
route.post("/meal", async (req: Request, res: Response) => {
  if (!req.session.user) {
    return res.status(401).send("Not authorized");
  }
  const { name, kcal, date } = req.body;
  if (!name || !kcal) {
    return res.status(400).send("Invalid params.");
  }

  try {
    const db = await openDb();
    const meal = await db.get("SELECT * FROM meal WHERE name = ?, id_user=", [
      name,
      req.session.user.id,
    ]);
    if (meal) {
      return res.status(400).send("Meal already exists.");
    } else {
      await db.run("INSERT INTO meal (name, kcal, id_user) VALUES (?, ?, ?)", [
        name,
        kcal,
        req.session.user.id,
      ]);
      const meal = await db.get("SELECT * FROM meal WHERE name = ?, id_user=", [
        name,
        req.session.user.id,
      ]);
      if (!meal) {
        res.json({ message: "ERROR: Meal not created" });
      } else {
        if (date) {
          await db.run(
            "INSERT INTO ingested_meal (id_user, id_meal, date) VALUES (?, ?, ?)",
            [req.session.user.id, meal.id_meal, date]
          );
        }
      }
      res.json({ message: "Meal created successful" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

route.put("/meal", async (req: Request, res: Response) => {
  const { name, kcal, id_meal } = req.body;

  if (!name || !kcal) {
    return res.status(400).send("Invalid params.");
  }

  try {
    const db = await openDb();
    // Verificar si el registro ya existe

    const meal = await db.get("SELECT * FROM meal WHERE id_meal = ?", [
      id_meal,
    ]);

    if (meal) {
      // Actualizar el registro existente
      await db.run("UPDATE meal SET name = ?, kcal = ? WHERE id_meal = ?", [
        name,
        kcal,
        id_meal,
      ]);
      res.json({ message: "Meal updated successfully" });
    } else {
      res.json({ message: "Meal not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.use(route);

const PORT = 3333;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
