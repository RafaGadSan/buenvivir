import sqlite3 from 'sqlite3';
import { open } from 'sqlite'; 

const dbPath = './nodejs-sqlite/buenvivir.db';

export async function openDb() {
    return open({
      filename: dbPath,
      driver: sqlite3.Database
    });
  }