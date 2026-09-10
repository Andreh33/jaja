import { z } from 'zod';

export const CONTACT_SERVICES = ['web', 'tienda', 'ia', 'otro'] as const;

// One contract for the browser and the API; trim before checking minimums.
export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Escribe al menos 2 caracteres.').max(120, 'El nombre no puede superar 120 caracteres.'),
  email: z.string().trim().email('Escribe un email válido.').max(254, 'El email es demasiado largo.'),
  phone: z.string().trim().max(40, 'El teléfono no puede superar 40 caracteres.').optional(),
  service: z.enum(CONTACT_SERVICES, { error: 'Elige uno de los servicios disponibles.' }).optional(),
  message: z.string().trim().min(10, 'Cuéntanos un poco más: al menos 10 caracteres.').max(4000, 'El mensaje no puede superar 4000 caracteres.'),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ContactField = keyof ContactInput;
export type ContactErrors = Partial<Record<ContactField, string>>;

export function contactFieldErrors(error: z.ZodError): ContactErrors {
  const fields: ContactErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as ContactField;
    if (field in contactSchema.shape && !fields[field]) fields[field] = issue.message;
  }
  return fields;
}

export async function submitContact(
  input: unknown,
  save: (message: ContactInput) => Promise<void>,
): Promise<{ ok: true } | { ok: false; fields: ContactErrors }> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fields: contactFieldErrors(parsed.error) };
  await save(parsed.data);
  return { ok: true };
}
