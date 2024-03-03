// types.d.ts

import 'express-session';

declare module 'express-session' {
  export interface SessionData {
    user?: { id: number; username: string }; // Ajusta los tipos según tus necesidades
  }
}