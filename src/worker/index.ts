import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  authMiddleware,
  getOAuthRedirectUrl,
  exchangeCodeForSessionToken,
  deleteSession,
  getCurrentUser,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";
import { getCookie, setCookie } from "hono/cookie";
import { zValidator } from "@hono/zod-validator";
import {
  CreateInventarioSchema,
  CreateActuacionSchema,
  CreateProgramaSchema,
  CreateEjecucionSchema,
} from "@/shared/types";
import z from "zod";

// Extend Env interface
interface ExtendedEnv extends Env {
  MOCHA_USERS_SERVICE_API_URL: string;
  MOCHA_USERS_SERVICE_API_KEY: string;
}

// Extend Hono context to include app_user
declare module 'hono' {
  interface ContextVariableMap {
    app_user?: any;
  }
}

const app = new Hono<{ Bindings: ExtendedEnv }>();

app.use("/*", cors());

// ===== AUTH ENDPOINTS =====

app.get("/api/oauth/google/redirect_url", async (c) => {
  const redirectUrl = await getOAuthRedirectUrl("google", {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });
  return c.json({ redirectUrl }, 200);
});

app.post("/api/sessions", async (c) => {
  const body = await c.req.json();
  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }

  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60,
  });

  return c.json({ success: true }, 200);
});

app.get("/api/users/me", authMiddleware, async (c) => {
  const user = c.get("user");
  
  // Check if user is allowed
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM usuarios WHERE email = ?"
  ).bind(user!.email).all();

  if (results.length === 0) {
    return c.json({ error: "User not authorized" }, 403);
  }

  return c.json({ ...user, app_user: results[0] });
});

app.get("/api/logout", async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
  if (typeof sessionToken === "string") {
    await deleteSession(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });
  }
  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 0,
  });
  return c.json({ success: true }, 200);
});

// Helper middleware to check authorization
const checkAuth = async (c: any, next: any) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
  
  if (!sessionToken) {
    return c.json({ error: "Not authenticated" }, 401);
  }

  const currentUser = await getCurrentUser(sessionToken, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  if (!currentUser) {
    return c.json({ error: "Invalid session" }, 401);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM usuarios WHERE email = ?"
  ).bind(currentUser.email).all();

  if (results.length === 0) {
    return c.json({ error: "User not authorized" }, 403);
  }

  c.set("app_user", results[0]);
  await next();
};

// ===== DISTRITOS =====

app.get("/api/distritos", checkAuth, async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM distritos ORDER BY nombre"
  ).all();
  return c.json(results);
});

// ===== USUARIOS =====

app.get("/api/usuarios", checkAuth, async (c) => {
  const appUser = c.get("app_user") as any;
  if (!appUser.is_admin) {
    return c.json({ error: "Admin access required" }, 403);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM usuarios ORDER BY email"
  ).all();
  return c.json(results);
});

app.post("/api/usuarios", checkAuth, zValidator("json", z.object({
  email: z.string().email(),
  nombre: z.string().optional(),
  is_admin: z.boolean().optional(),
})), async (c) => {
  const appUser = c.get("app_user") as any;
  if (!appUser.is_admin) {
    return c.json({ error: "Admin access required" }, 403);
  }

  const body = c.req.valid("json");
  await c.env.DB.prepare(
    "INSERT INTO usuarios (email, nombre, is_admin) VALUES (?, ?, ?)"
  ).bind(body.email, body.nombre || null, body.is_admin ? 1 : 0).run();

  return c.json({ success: true });
});

app.delete("/api/usuarios/:id", checkAuth, async (c) => {
  const appUser = c.get("app_user") as any;
  if (!appUser.is_admin) {
    return c.json({ error: "Admin access required" }, 403);
  }

  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM usuarios WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// ===== INVENTARIO =====

app.get("/api/inventario", checkAuth, async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT i.*, d.nombre as distrito_nombre FROM mint_sve i LEFT JOIN distritos d ON i.distrito_id = d.id ORDER BY i.created_at DESC"
  ).all();
  return c.json(results);
});

app.post("/api/inventario", checkAuth, zValidator("json", CreateInventarioSchema), async (c) => {
  const body = c.req.valid("json");
  const result = await c.env.DB.prepare(
    "INSERT INTO mint_sve (id_elemento, nombre_elemento, tipo_inventario, distrito_id) VALUES (?, ?, ?, ?)"
  ).bind(body.id_elemento, body.nombre_elemento, body.tipo_inventario, body.distrito_id || null).run();

  return c.json({ success: true, id: result.meta.last_row_id });
});

app.put("/api/inventario/:id", checkAuth, zValidator("json", CreateInventarioSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");
  
  await c.env.DB.prepare(
    "UPDATE mint_sve SET id_elemento = ?, nombre_elemento = ?, tipo_inventario = ?, distrito_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(body.id_elemento, body.nombre_elemento, body.tipo_inventario, body.distrito_id || null, id).run();

  return c.json({ success: true });
});

app.delete("/api/inventario/:id", checkAuth, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM mint_sve WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

app.post("/api/inventario/bulk", checkAuth, async (c) => {
  const appUser = c.get("app_user") as any;
  if (!appUser.is_admin) {
    return c.json({ error: "Admin access required" }, 403);
  }

  const items = await c.req.json();
  
  for (const item of items) {
    await c.env.DB.prepare(
      "INSERT INTO mint_sve (id_elemento, nombre_elemento, tipo_inventario, distrito_id) VALUES (?, ?, ?, ?)"
    ).bind(item.id_elemento, item.nombre_elemento, item.tipo_inventario, item.distrito_id || null).run();
  }

  return c.json({ success: true, count: items.length });
});

// ===== ACTUACIONES =====

app.get("/api/actuaciones", checkAuth, async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT a.*, d.nombre as distrito_nombre FROM actuaciones a LEFT JOIN distritos d ON a.distrito_id = d.id ORDER BY a.nombre_actuacion"
  ).all();
  return c.json(results);
});

app.post("/api/actuaciones", checkAuth, zValidator("json", CreateActuacionSchema), async (c) => {
  const body = c.req.valid("json");
  const result = await c.env.DB.prepare(
    "INSERT INTO actuaciones (nombre_actuacion, distrito_id) VALUES (?, ?)"
  ).bind(body.nombre_actuacion, body.distrito_id || null).run();

  return c.json({ success: true, id: result.meta.last_row_id });
});

app.put("/api/actuaciones/:id", checkAuth, zValidator("json", CreateActuacionSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");
  
  await c.env.DB.prepare(
    "UPDATE actuaciones SET nombre_actuacion = ?, distrito_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(body.nombre_actuacion, body.distrito_id || null, id).run();

  return c.json({ success: true });
});

app.delete("/api/actuaciones/:id", checkAuth, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM actuaciones WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// ===== PROGRAMAS =====

app.get("/api/programas", checkAuth, async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT p.*, a.nombre_actuacion, d.nombre as distrito_nombre 
    FROM programas p 
    LEFT JOIN actuaciones a ON p.id_actuacion = a.id 
    LEFT JOIN distritos d ON p.distrito_id = d.id 
    ORDER BY p.created_at DESC
  `).all();
  return c.json(results);
});

app.post("/api/programas", checkAuth, zValidator("json", CreateProgramaSchema), async (c) => {
  const body = c.req.valid("json");
  const result = await c.env.DB.prepare(
    "INSERT INTO programas (nombre_programa, id_actuacion, fecha_inicio, fecha_fin, distrito_id) VALUES (?, ?, ?, ?, ?)"
  ).bind(body.nombre_programa, body.id_actuacion, body.fecha_inicio || null, body.fecha_fin || null, body.distrito_id || null).run();

  return c.json({ success: true, id: result.meta.last_row_id });
});

app.put("/api/programas/:id", checkAuth, zValidator("json", CreateProgramaSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");
  
  await c.env.DB.prepare(
    "UPDATE programas SET nombre_programa = ?, id_actuacion = ?, fecha_inicio = ?, fecha_fin = ?, distrito_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(body.nombre_programa, body.id_actuacion, body.fecha_inicio || null, body.fecha_fin || null, body.distrito_id || null, id).run();

  return c.json({ success: true });
});

app.delete("/api/programas/:id", checkAuth, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM programas WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// ===== EJECUCIONES =====

app.get("/api/ejecuciones", checkAuth, async (c) => {
  const appUser = c.get("app_user") as any;
  
  let query = `
    SELECT e.*, 
           p.nombre_programa, p.id_actuacion,
           a.nombre_actuacion,
           i.nombre_elemento, i.id_elemento, i.tipo_inventario,
           d.nombre as distrito_nombre
    FROM ejecuciones_programadas e
    LEFT JOIN programas p ON e.id_programa = p.id
    LEFT JOIN actuaciones a ON p.id_actuacion = a.id
    LEFT JOIN mint_sve i ON e.id_elemento = i.id
    LEFT JOIN distritos d ON e.distrito_id = d.id
  `;

  // Filter by assigned user if not admin
  if (!appUser.is_admin) {
    query += ` WHERE e.asignado_a = ?`;
    const { results } = await c.env.DB.prepare(query + " ORDER BY e.fecha_inicio DESC").bind(appUser.email).all();
    return c.json(results);
  }

  const { results } = await c.env.DB.prepare(query + " ORDER BY e.fecha_inicio DESC").all();
  return c.json(results);
});

app.post("/api/ejecuciones", checkAuth, zValidator("json", CreateEjecucionSchema), async (c) => {
  const body = c.req.valid("json");
  const result = await c.env.DB.prepare(
    `INSERT INTO ejecuciones_programadas 
    (id_programa, id_elemento, fecha_inicio, fecha_fin, periodicidad, repeticiones_max, estado, asignado_a, notas, imagen_1_url, imagen_2_url, distrito_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    body.id_programa,
    body.id_elemento || null,
    body.fecha_inicio,
    body.fecha_fin || null,
    body.periodicidad,
    body.repeticiones_max || null,
    body.estado,
    body.asignado_a || null,
    body.notas || null,
    body.imagen_1_url || null,
    body.imagen_2_url || null,
    body.distrito_id || null
  ).run();

  return c.json({ success: true, id: result.meta.last_row_id });
});

app.put("/api/ejecuciones/:id", checkAuth, zValidator("json", CreateEjecucionSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");
  
  await c.env.DB.prepare(
    `UPDATE ejecuciones_programadas SET 
    id_programa = ?, id_elemento = ?, fecha_inicio = ?, fecha_fin = ?, periodicidad = ?, 
    repeticiones_max = ?, estado = ?, asignado_a = ?, notas = ?, imagen_1_url = ?, imagen_2_url = ?, distrito_id = ?,
    updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?`
  ).bind(
    body.id_programa,
    body.id_elemento || null,
    body.fecha_inicio,
    body.fecha_fin || null,
    body.periodicidad,
    body.repeticiones_max || null,
    body.estado,
    body.asignado_a || null,
    body.notas || null,
    body.imagen_1_url || null,
    body.imagen_2_url || null,
    body.distrito_id || null,
    id
  ).run();

  return c.json({ success: true });
});

app.delete("/api/ejecuciones/:id", checkAuth, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM ejecuciones_programadas WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// ===== ADMIN: SQL QUERIES =====

app.post("/api/admin/query", checkAuth, async (c) => {
  const appUser = c.get("app_user") as any;
  if (!appUser.is_admin) {
    return c.json({ error: "Admin access required" }, 403);
  }

  const { sql } = await c.req.json();
  try {
    const { results } = await c.env.DB.prepare(sql).all();
    return c.json({ results });
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});

app.get("/api/admin/tables", checkAuth, async (c) => {
  const appUser = c.get("app_user") as any;
  if (!appUser.is_admin) {
    return c.json({ error: "Admin access required" }, 403);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
  ).all();
  return c.json(results);
});

export default app;
