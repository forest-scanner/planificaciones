import z from "zod";

// Distrito
export const DistritoSchema = z.object({
  id: z.number(),
  nombre: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Distrito = z.infer<typeof DistritoSchema>;

// Usuario
export const UsuarioSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  nombre: z.string().nullable(),
  is_admin: z.number().int(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Usuario = z.infer<typeof UsuarioSchema>;

// Inventario (mint_sve)
export const InventarioSchema = z.object({
  id: z.number(),
  id_elemento: z.string(),
  nombre_elemento: z.string(),
  tipo_inventario: z.string(),
  distrito_id: z.number().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Inventario = z.infer<typeof InventarioSchema>;

export const CreateInventarioSchema = z.object({
  id_elemento: z.string().min(1),
  nombre_elemento: z.string().min(1),
  tipo_inventario: z.string().min(1),
  distrito_id: z.number().optional(),
});

export type CreateInventario = z.infer<typeof CreateInventarioSchema>;

// Actuación
export const ActuacionSchema = z.object({
  id: z.number(),
  nombre_actuacion: z.string(),
  distrito_id: z.number().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Actuacion = z.infer<typeof ActuacionSchema>;

export const CreateActuacionSchema = z.object({
  nombre_actuacion: z.string().min(1),
  distrito_id: z.number().optional(),
});

export type CreateActuacion = z.infer<typeof CreateActuacionSchema>;

// Programa
export const ProgramaSchema = z.object({
  id: z.number(),
  nombre_programa: z.string(),
  id_actuacion: z.number(),
  fecha_inicio: z.string().nullable(),
  fecha_fin: z.string().nullable(),
  distrito_id: z.number().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Programa = z.infer<typeof ProgramaSchema>;

export const CreateProgramaSchema = z.object({
  nombre_programa: z.string().min(1),
  id_actuacion: z.number(),
  fecha_inicio: z.string().optional(),
  fecha_fin: z.string().optional(),
  distrito_id: z.number().optional(),
});

export type CreatePrograma = z.infer<typeof CreateProgramaSchema>;

// Ejecución programada
export const EjecucionProgramadaSchema = z.object({
  id: z.number(),
  id_programa: z.number(),
  id_elemento: z.number().nullable(),
  fecha_inicio: z.string(),
  fecha_fin: z.string().nullable(),
  periodicidad: z.string(),
  repeticiones_max: z.number().nullable(),
  estado: z.string(),
  asignado_a: z.string().nullable(),
  notas: z.string().nullable(),
  imagen_1_url: z.string().nullable(),
  imagen_2_url: z.string().nullable(),
  distrito_id: z.number().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type EjecucionProgramada = z.infer<typeof EjecucionProgramadaSchema>;

export const CreateEjecucionSchema = z.object({
  id_programa: z.number(),
  id_elemento: z.number().optional(),
  fecha_inicio: z.string(),
  fecha_fin: z.string().optional(),
  periodicidad: z.enum(['Única', 'Diaria', 'Semanal', 'Quincenal', 'Mensual', 'Anual']).default('Única'),
  repeticiones_max: z.number().optional(),
  estado: z.enum(['Pendiente', 'En Progreso', 'Completada', 'Completado-Informado Mint', 'Cancelada']).default('Pendiente'),
  asignado_a: z.string().optional(),
  notas: z.string().optional(),
  imagen_1_url: z.string().optional(),
  imagen_2_url: z.string().optional(),
  distrito_id: z.number().optional(),
});

export type CreateEjecucion = z.infer<typeof CreateEjecucionSchema>;

// Ejecución completa con datos relacionados
export interface EjecucionCompleta extends EjecucionProgramada {
  programa?: Programa & { actuacion?: Actuacion };
  elemento?: Inventario;
  distrito?: Distrito;
}
