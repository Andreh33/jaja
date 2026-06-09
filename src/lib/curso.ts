/**
 * Helpers de servidor para la plataforma de formación: módulos + progreso
 * del comercial y cálculo del bloqueo secuencial.
 *
 * Regla de bloqueo: el módulo N está desbloqueado si N es el primero (orden 0)
 * o si el módulo anterior está `completed`. El examen se desbloquea solo cuando
 * los 6 módulos están completados.
 */

import { db, schema } from '@/lib/db';
import { eq, asc } from 'drizzle-orm';
import type { CourseModule } from '../../drizzle/schema';

export type ModuleWithState = CourseModule & {
  completed: boolean;
  watchedSeconds: number;
  unlocked: boolean;
};

export type CourseState = {
  modules: ModuleWithState[];
  examUnlocked: boolean;
  completedCount: number;
};

export async function getCourseState(commercialId: string): Promise<CourseState> {
  const mods = await db
    .select()
    .from(schema.courseModules)
    .orderBy(asc(schema.courseModules.order));

  const prog = await db
    .select()
    .from(schema.courseProgress)
    .where(eq(schema.courseProgress.commercialId, commercialId));

  const progMap = new Map(prog.map((p) => [p.moduleId, p]));

  let prevCompleted = true; // el primer módulo siempre está desbloqueado
  const modules: ModuleWithState[] = mods.map((m) => {
    const p = progMap.get(m.id);
    const completed = !!p?.completed;
    const unlocked = prevCompleted;
    prevCompleted = completed;
    return { ...m, completed, watchedSeconds: p?.watchedSeconds ?? 0, unlocked };
  });

  const completedCount = modules.filter((m) => m.completed).length;
  const examUnlocked = modules.length > 0 && completedCount === modules.length;

  return { modules, examUnlocked, completedCount };
}

/** Estado de un módulo concreto (para la página de módulo + check de acceso). */
export async function getModuleState(
  commercialId: string,
  moduleId: string,
): Promise<{ state: CourseState; current: ModuleWithState | undefined; index: number }> {
  const state = await getCourseState(commercialId);
  const index = state.modules.findIndex((m) => m.id === moduleId);
  return { state, current: state.modules[index], index };
}

/** Nombre del comercial (para cabecera). */
export async function getCommercialName(commercialId: string): Promise<string | null> {
  const rows = await db
    .select({ name: schema.commercials.name })
    .from(schema.commercials)
    .where(eq(schema.commercials.id, commercialId))
    .limit(1);
  return rows[0]?.name ?? null;
}
