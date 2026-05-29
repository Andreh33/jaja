import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import bcrypt from 'bcryptjs';
import { users, posts } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});
const db = drizzle(client);

async function main() {
  console.log('🌱 Seeding...');

  // Admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@latech.es';
  const adminPwd = process.env.ADMIN_PASSWORD || 'LatechAdmin2026!';
  const hashed = await bcrypt.hash(adminPwd, 10);

  const existing = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
  if (existing.length === 0) {
    await db.insert(users).values({
      email: adminEmail,
      password: hashed,
      name: 'Admin Latech',
      role: 'ADMIN',
    });
    console.log(`✅ Admin creado: ${adminEmail}`);
  } else {
    await db.update(users).set({ password: hashed, role: 'ADMIN' }).where(eq(users.email, adminEmail));
    console.log(`♻️  Admin actualizado: ${adminEmail}`);
  }

  // Demo client
  const demoEmail = 'demo@cliente.es';
  const demoPwdHash = await bcrypt.hash('demo1234', 10);
  const existingDemo = await db.select().from(users).where(eq(users.email, demoEmail)).limit(1);
  if (existingDemo.length === 0) {
    await db.insert(users).values({
      email: demoEmail,
      password: demoPwdHash,
      name: 'Cliente Demo',
      phone: '+34 600 00 00 00',
      role: 'CLIENT',
    });
    console.log(`✅ Cliente demo: ${demoEmail} / demo1234`);
  }

  // Posts
  const seededPosts = [
    {
      slug: 'web-actual-perdiendo-clientes',
      title: 'Por qué tu web actual está perdiendo clientes (y cómo solucionarlo)',
      category: 'Diseño Web',
      excerpt: 'Si tu web tarda más de 3 segundos en cargar, no es responsive o no aparece en Google, estás regalando clientes a la competencia. Te contamos las señales claras y el plan de acción.',
      cover: '/og/post-1.svg',
      readingMinutes: 7,
      content: `## El cliente decide en 3 segundos

Antes de leer tu propuesta, antes de ver tus precios, antes incluso de saber qué haces — tu posible cliente decide si te toma en serio. Y esa decisión la toma en los primeros tres segundos viendo tu web.

Si tu web tarda más de tres segundos en cargar, **el 53% de los visitantes la abandonan**. Esto no es opinión: es lo que Google publica año tras año. Y cada visitante que se va es un cliente que la competencia recibe gratis.

## 7 señales claras de que tu web está obsoleta

Repasa esta checklist con sinceridad:

- **No es responsive.** En el móvil se ve cortada, hay que hacer zoom o los botones no se pulsan bien.
- **Tarda más de 3 segundos en cargar** la página principal en una conexión 4G.
- **No tiene certificado SSL.** Aparece "No seguro" en la barra del navegador.
- **No estás en la primera página de Google** cuando alguien busca tu servicio en tu ciudad.
- **No tiene formulario de contacto** o el que tiene no llega a tu email.
- **Las imágenes pesan megas.** No están optimizadas y disparan el tiempo de carga.
- **El diseño está claramente fuera de época** — fondos con texturas, tipografías Comic Sans-vibe, animaciones de los 2010.

Si reconoces tres o más, tu web está sangrando ventas.

## Por qué la velocidad lo es todo

Google penaliza explícitamente las webs lentas en su ranking — desde 2021 con la actualización de Core Web Vitals. Esto significa que aunque tu copy y tu SEO sean perfectos, si la web tarda en cargar, **bajas posiciones**.

Y no solo Google: el comportamiento humano. Una web que carga al instante transmite profesionalidad. Una web que se queda pensando da la sensación de empresa pequeña, descuidada, "made in 2012".

> "El 79% de compradores online que no están satisfechos con la velocidad de una web no vuelven a comprar en ella." — Akamai Research

## SEO técnico: más que palabras clave

Mucha gente piensa que el SEO es "rellenar palabras clave en los textos". El SEO real va mucho más allá:

- **Estructura de encabezados** (H1, H2, H3) coherente y semántica.
- **Meta descripciones** únicas en cada página.
- **Datos estructurados** (Schema.org) para que Google entienda qué tipo de negocio eres.
- **Sitemap.xml** y **robots.txt** correctamente configurados.
- **Canonical URLs** para evitar contenido duplicado.
- **Alt text** descriptivo en imágenes.

Si tu web no cumple estos puntos, es como tener un escaparate maravilloso pero con la persiana medio bajada — Google no puede verte bien.

## Mobile-first o muerte digital

El 68% del tráfico web mundial viene de móvil. Para negocios locales (restaurantes, peluquerías, talleres) esa cifra sube al 85%.

Si tu web "se ve mal en el móvil", no es un problema cosmético: es un problema comercial. Estás perdiendo a 8 de cada 10 personas que te buscan.

## Cómo auditar tu web ahora mismo (5 minutos)

Aquí tienes el protocolo rápido:

1. **PageSpeed Insights** — Ve a [pagespeed.web.dev](https://pagespeed.web.dev), pega tu URL, espera. Si sacas menos de 75 en móvil, hay trabajo.
2. **Mobile-Friendly Test** — Comprueba en search.google.com/test/mobile-friendly que tu web sea apta para móviles.
3. **SSL Check** — En la barra de tu navegador, ¿aparece el candado? Si no, urgencia.
4. **Búsqueda Google** — Busca "[tu negocio] [tu ciudad]". ¿Apareces? ¿En qué posición?
5. **Velocidad real** — Cronometra cuánto tarda en cargar tu home en 4G real.

## El plan de acción

Si tu web falla en varios puntos, tienes dos opciones:

**Opción A — Parchear:** invertir en cada problema por separado. Caro, lento y suele acabar en frustración.

**Opción B — Rehacerla bien:** una web nueva, técnicamente impecable, en 24-48h. Esto es exactamente lo que hacemos en Latech.

Una web premium ya no cuesta lo que costaba hace 5 años. Con stack moderno (Next.js, Vercel, Tailwind), un equipo experto entrega una web profesional, optimizada y segura por **60€/mes**, sin permanencia.

¿Quieres que auditemos la tuya gratis? [Hablemos por WhatsApp](https://wa.me/34684739091).`,
    },
    {
      slug: 'tienda-online-vs-marketplace',
      title: 'Tienda online vs marketplace: qué elegir para tu negocio en 2026',
      category: 'Tiendas Online',
      excerpt: 'Amazon, Etsy, Wallapop... la comodidad tiene un precio. Analizamos cuándo conviene un marketplace y cuándo es mejor tu propia tienda online.',
      cover: '/og/post-2.svg',
      readingMinutes: 9,
      content: `## La pregunta del millón

"¿Vendo en Amazon o me hago mi tienda?" Es la pregunta que todo emprendedor digital se hace en algún momento. Y la respuesta corta es: **depende de tu margen, tu marca y tu estrategia a 3 años**.

La respuesta larga es lo que viene a continuación.

## El espejismo del marketplace

Vender en Amazon, Etsy, Wallapop o eBay parece la solución perfecta cuando empiezas. **Tráfico instantáneo, sistema de pagos integrado, logística resuelta**. ¿Qué puede salir mal?

Mucho. Repasemos lo que NO te cuentan al darte de alta:

### 1. Comisiones que devoran tu margen

- **Amazon:** entre 8% y 15% por venta + tarifas de logística (FBA) que pueden duplicar el coste.
- **Etsy:** 6.5% por transacción + 0.20€ por listado + comisiones de pago.
- **eBay:** 11-13% más comisiones de pago.

Si vendes un producto a 50€ y tu margen bruto era de 20€, después de comisiones puede que te queden 8-10€. Y eso sin contar marketing dentro de la plataforma.

### 2. No es tu cliente, es de Amazon

Cuando alguien te compra en Amazon, **Amazon NO te da los datos del cliente**. Ni email, ni teléfono, ni nada. Lo que significa que:

- No puedes hacer email marketing.
- No puedes fidelizarlo.
- No puedes vender productos complementarios después.
- Si Amazon decide cerrarte la cuenta, pierdes todo.

### 3. La trampa de la guerra de precios

En un marketplace estás compitiendo en una lista plana junto a 50 competidores. La forma más rápida de aparecer arriba es **bajar el precio**. Y cuando todos hacen lo mismo, los márgenes desaparecen.

### 4. No construyes marca

Amazon es la marca. Tú eres "vendedor #4587". Tu logo, tu propuesta de valor, tu identidad — todo se diluye en la plantilla genérica del marketplace.

## Cuándo SÍ tiene sentido un marketplace

No todo es malo. Un marketplace tiene sentido cuando:

- **Empiezas y necesitas validar el producto** sin invertir en infraestructura.
- **Vendes productos commodity** (ej. baterías genéricas, fundas de móvil) donde el precio es el único diferenciador.
- **Quieres complementar** una tienda propia ya consolidada.
- **El margen es muy alto** y absorbes la comisión cómodamente.

## La tienda online propia: por qué es la jugada a largo plazo

Una tienda propia (Shopify, WooCommerce, o como las que hacemos en Latech con Next.js + Stripe) cambia el juego:

### 1. Margen completo

No pagas comisiones a un marketplace. Solo pagas la pasarela de pago (Stripe ~1.4% + 0.25€) y el hosting. **El resto es tuyo**.

### 2. Tienes el cliente

Email, teléfono, historial de compras. Puedes hacer:
- Email marketing (newsletter, ofertas, abandono de carrito).
- WhatsApp marketing.
- Programas de fidelización.
- Cross-selling con cada compra.

### 3. Construyes activo digital

Una tienda propia con tráfico, reviews y SEO **es un activo que se puede vender**. Webs de e-commerce se venden por 2-5x el beneficio anual. Una cuenta de Amazon, no.

### 4. Branding sin límites

Diseño, copy, fotos, packaging digital — todo lo controlas tú. Construyes marca real.

### 5. SEO como motor

Una tienda bien optimizada empieza a recibir tráfico orgánico que es gratis y compuesto: cuanto más antiguo el dominio, más posicionas. Es el activo más rentable a largo plazo.

## La estrategia híbrida (lo que hacen los que ganan)

Los emprendedores serios no eligen una u otra. Hacen **estrategia híbrida**:

- **Tienda propia** como buque insignia: branding, márgenes altos, clientes fieles.
- **Amazon** como canal complementario: visibilidad, productos commodity, ventas adicionales.

Ambos canales se alimentan: la confianza de Amazon te da credibilidad, y tu tienda propia construye marca.

## ¿Cuánto cuesta una tienda profesional en 2026?

Aquí está la sorpresa. Una tienda online profesional, con:
- Diseño premium adaptado a tu marca
- Stripe + Bizum + transferencia
- Catálogo gestionado
- SEO técnico
- Analítica integrada (GA4, Meta Pixel)
- Velocidad y seguridad de máximo nivel

...cuesta **80€/mes + 400€ de creación inicial**. Sin permanencia. En Latech la entregamos en 48h.

Comparado con vender en Amazon, donde pierdes el 15% de cada venta y nunca tienes el cliente, **una tienda propia se amortiza con 5 ventas al mes**.

## La decisión

Si vendes algo con margen razonable y quieres construir un negocio (no solo "ganar un poco") — **tienda online propia**, sin discusión.

Si quieres validar rápido o vender commodity — empieza en Amazon, pero ten clara la salida.

Y si quieres lo mejor de ambos — **estrategia híbrida**: tienda propia como base, marketplace como canal extra.

¿Te ayudamos a montar la tuya? [Hablemos](https://wa.me/34684739091).`,
    },
    {
      slug: 'agentes-ia-n8n-pymes',
      title: 'Agentes de IA con n8n: la nueva revolución para pymes',
      category: 'IA',
      excerpt: 'Mientras las grandes empresas hablan de IA, las pymes ya la están usando para atender llamadas 24/7, gestionar reservas y cobrar — sin contratar a nadie.',
      cover: '/og/post-3.svg',
      readingMinutes: 8,
      content: `## El cambio silencioso

Mientras los medios hablan de ChatGPT y Sora, una revolución mucho más práctica está ocurriendo en los pequeños negocios de España: **los agentes de IA conectados con n8n están reemplazando recepcionistas, asistentes y operadores telefónicos**.

Y no es ciencia ficción. Es real, está funcionando, y los pioneros ya están llevándose la ventaja.

## ¿Qué es n8n y por qué importa?

**n8n** (se pronuncia "n-eight-n") es una plataforma de automatización de flujos de trabajo open-source. Conecta APIs, servicios y sistemas como si fuesen piezas de Lego.

Hace lo mismo que Zapier o Make, pero con dos diferencias críticas:

1. **Es self-hostable** — puedes montarlo en tu propio servidor. Tus datos no salen de Europa.
2. **Es infinitamente más potente** — soporta lógica compleja, código JavaScript custom, y se integra con cualquier API.

¿Por qué importa para una pyme? Porque combinado con un LLM (ChatGPT, Claude, Gemini), permite construir **agentes de IA personalizados** que:

- Atienden llamadas con voz natural.
- Acceden a tu base de datos de clientes.
- Generan facturas y enlaces de pago.
- Mandan WhatsApps automáticamente.
- Crean tickets en tu CRM.
- Aprenden y mejoran con el tiempo.

## Caso real: Restaurante en Badajoz

Un cliente nuestro, restaurante de 40 cubiertos, perdía aproximadamente **15-20 llamadas al día** entre las horas punta. Cada llamada perdida era una reserva potencial.

Solución implementada:
- Agente IA conectado por n8n al número de teléfono.
- Acceso al sistema de reservas.
- Integración con WhatsApp Business para confirmaciones.
- Memoria de clientes habituales ("Mesa de Juan, los lunes a las 14:00").

**Resultado al mes:**
- 0 llamadas perdidas.
- 28 reservas extra cada mes que antes se perdían.
- Tiempo del personal liberado para servicio.
- Coste: 150€/mes (vs 1.400€ de un recepcionista part-time).

## Casos de uso por sector

### Peluquerías y estética
- Reservas y cancelaciones por voz.
- Recordatorios automáticos 24h antes.
- Lista de espera dinámica.
- Cobro de señales con Stripe durante la llamada.

### Talleres mecánicos
- Diagnóstico inicial por descripción del cliente.
- Cita de revisión + matrícula + datos del coche.
- Aviso cuando el coche está listo.
- Seguimiento post-servicio.

### Inmobiliarias
- Filtrado de leads con preguntas inteligentes.
- Información detallada sobre cada inmueble.
- Agenda de visitas automatizada.

### Despachos profesionales
- Pre-screening de consultas.
- Cita con el abogado/asesor adecuado.
- Recordatorios de documentación pendiente.

### E-commerce
- Atención al cliente 24/7.
- Tracking de pedidos por voz.
- Devoluciones gestionadas automáticamente.

## ¿Qué puede hacer un agente IA bien hecho?

No es un chatbot tonto. Es un asistente real:

- **Voz natural** — la persona al otro lado no nota que está hablando con una IA.
- **20 llamadas simultáneas** — picos de tráfico cubiertos sin esperas.
- **Memoria** — "Lo de siempre" funciona de verdad.
- **Multi-canal** — la misma lógica en llamada, WhatsApp, web y email.
- **Reportes automáticos** — al final del día tienes un resumen completo.
- **Pagos integrados** — genera link de Stripe en segundos durante la llamada.

## El ROI: las cuentas claras

Hagamos las matemáticas con un negocio mediano:

**Escenario:** Recepcionista part-time, 4h al día, 5 días a la semana. Coste mensual ~ **1.200€** (con SS y vacaciones).

**Cobertura humana:**
- 20 horas a la semana.
- 0 horas fines de semana ni festivos.
- Bajas, vacaciones, imprevistos no cubiertos.

**Agente IA con n8n:**
- 24/7 todos los días del año.
- 20 llamadas simultáneas.
- Sin baja, sin vacaciones, sin enfado.
- Coste: ~**150€/mes**.

**Ahorro:** 1.050€/mes = **12.600€/año**.

Y esto sin contar el aumento de ventas por no perder llamadas.

## ¿Es difícil de implementar?

Solo si lo intentas hacer tú. La curva de aprendizaje de n8n + LLMs + voz + integraciones es de varios meses para un técnico.

Por eso en Latech hemos empaquetado todo el setup. **En menos de 72 horas** tienes:

1. Tu agente entrenado con tu información (carta, horarios, precios, clientes habituales).
2. Tu número actual conectado al agente — sin cambiar nada para el cliente.
3. Integraciones con WhatsApp, email, CRM, Stripe.
4. Panel de control para revisar llamadas y métricas.
5. Mejora continua semanal.

## El momento es ahora

Cada mes que pasa sin un agente IA, tus competidores que ya lo tienen están **atendiendo a tus clientes potenciales** mientras tú no contestas.

Esto no es una tendencia futura. Es lo que está pasando hoy. Y como con todas las revoluciones tecnológicas (web en los 90, móvil en los 2010, redes sociales para empresas en los 2015), los primeros se llevan la ventaja desproporcionada.

¿Quieres una demo de un agente real? [Escúchalo aquí](/tienda/agente-ia) o [habla con nosotros por WhatsApp](https://wa.me/34684739091).`,
    },
    {
      slug: 'seo-local-badajoz',
      title: 'SEO local en Badajoz: cómo aparecer primero en Google',
      category: 'SEO',
      excerpt: 'Si tienes un negocio físico en Badajoz, aparecer primero cuando alguien busca "tu servicio + Badajoz" multiplica tus clientes. Te enseñamos el plan exacto.',
      cover: '/og/post-4.svg',
      readingMinutes: 8,
      content: `## Por qué el SEO local cambió el juego

Si tienes un negocio físico en Badajoz —peluquería, restaurante, taller, despacho, lo que sea—, hay una verdad que no se discute: **el 76% de las búsquedas locales acaban en visita o llamada en menos de 24h**.

Y "búsqueda local" significa cosas como:
- "peluquería cerca de mí"
- "restaurante Badajoz centro"
- "abogado divorcio Badajoz"
- "taller mecánico Puebla de la Calzada"

Si en esas búsquedas no apareces, el cliente va a la competencia. Punto.

## La regla del top 3

En el mapa de Google (el famoso "pack local"), solo aparecen **3 negocios destacados**. Esos 3 se llevan el **70% de los clics**. Los del puesto 4-10, prácticamente nada.

Tu objetivo está claro: **estar en ese top 3 para tus búsquedas clave**.

## La pieza más subestimada: Google Business Profile

Si solo vas a hacer una cosa este mes, que sea esta: **optimizar tu ficha de Google Business Profile** (antes Google My Business).

### Checklist de ficha perfecta

- ✅ **Categoría principal exacta**. No pongas "Restaurante" si eres "Restaurante asador". La especificidad multiplica posicionamiento.
- ✅ **Descripción de 750 caracteres** con tus 3-5 palabras clave principales naturalmente integradas.
- ✅ **Horarios actualizados** incluyendo festivos especiales.
- ✅ **Mínimo 10 fotos**: exterior, interior, equipo, productos, momentos.
- ✅ **Posts semanales**. Sí, semanales. Google Business Profile es como una mini red social — quien publica más, posiciona más.
- ✅ **Productos y servicios** detallados con foto, precio y descripción.
- ✅ **Atributos**: WiFi gratis, accesibilidad, terraza, parking, etc.
- ✅ **Q&A activa**. Responde tú mismo las preguntas frecuentes para tener control del contenido.

### El factor reviews

**Las reviews son el factor #1 de SEO local.** Más que la web, más que los enlaces, más que cualquier otra cosa.

Plan de acción:
1. **Pide reviews sistemáticamente.** Cada cliente satisfecho es una oportunidad.
2. **Responde a TODAS las reviews**, especialmente las negativas. Una respuesta profesional a una review mala convence más que 10 reviews buenas.
3. **Apunta a 50+ reviews con 4.5+ estrellas** como mínimo competitivo en Badajoz.

## Palabras clave locales: el oro escondido

Mucha gente intenta posicionar para "peluquería" a secas. Es un suicidio: compites contra Madrid, Barcelona, todos.

La estrategia ganadora son las **long-tails locales**:

- "peluquería caballero badajoz centro"
- "barbería con cita previa badajoz"
- "corte de pelo niños badajoz domingo"

Cada una de estas tiene poco volumen, pero juntas suman muchísimo. Y son **mucho más fáciles de posicionar**.

### Cómo encontrarlas

1. **Google Suggest** — escribe en Google "peluquería en " y mira las sugerencias.
2. **Búsquedas relacionadas** — al final de la página de resultados.
3. **AnswerThePublic** — herramienta gratuita que da preguntas reales.
4. **Google Search Console** — si ya tienes web, mira por qué términos te encuentran.

## Contenido geolocalizado: la web como aliada

Tu web debe complementar tu ficha de Google. Y para SEO local, hay que hacer cosas específicas:

### 1. Página por servicio + ubicación

No tengas una sola página "Servicios". Crea una página para cada servicio principal con la ubicación incorporada:
- /peluqueria-caballero-badajoz
- /coloracion-mujer-badajoz
- /barberia-puebla-de-la-calzada

Cada una con contenido único, fotos, precios, testimonios locales.

### 2. Schema markup de LocalBusiness

Es código que se incrusta en tu web y le dice a Google: "soy un negocio en esta dirección, con este teléfono, estos horarios, esta categoría". Multiplica tu posicionamiento local.

### 3. Página de blog con contenido local

Posts como "Las 5 mejores zonas para vivir en Badajoz" si eres inmobiliaria, o "Recetas extremeñas de temporada" si eres restaurante. **Geolocaliza el contenido**.

## Backlinks locales: la cereza

Los enlaces que apuntan a tu web desde otras webs locales son oro:
- **Diarios locales** (HOY, El Periódico Extremadura).
- **Blogs de Badajoz**.
- **Asociaciones de comerciantes**.
- **Patrocinios** locales (deportivos, culturales).
- **Directorios sectoriales** + el directorio del Ayuntamiento.

Cada enlace local es una señal a Google de que eres un negocio relevante en la zona.

## Errores que matan el SEO local

Lo que NO debes hacer:

❌ **Inconsistencia de NAP** (Nombre, Dirección, Teléfono) entre tu web, Google, Facebook, Instagram y directorios. Google compara y si ve diferencias, **te penaliza**.

❌ **Stuffing de palabras clave** en la descripción. Google detecta el espam.

❌ **Categorías genéricas**. Sé específico.

❌ **Comprar reviews**. Detección automática + suspensión de ficha.

❌ **No responder reviews negativas**. Mata la confianza de los demás visitantes.

❌ **Fotos genéricas de stock**. Pon fotos REALES, hechas en tu local, mostrando tu equipo y tus productos.

## El plan de 30 días

Si quieres un roadmap concreto:

**Semana 1:**
- Optimizar ficha Google Business Profile al 100%.
- Hacer 20 fotos profesionales del local.
- Pedir 10 reviews a clientes recientes.

**Semana 2:**
- Auditoría de palabras clave locales (encontrar 30-50 long-tails).
- Crear página por servicio + ubicación en la web.
- Implementar schema LocalBusiness.

**Semana 3:**
- 3 posts en blog con contenido local.
- Empezar con posts semanales en Google Business.
- Conseguir 5 backlinks locales.

**Semana 4:**
- Configurar seguimiento (Google Search Console + Analytics).
- Pedir 10 reviews más.
- Auditoría de competencia local: ver qué hacen los del top 3 y mejorarlo.

A los 60 días deberías ver resultados claros en posicionamiento. A los 90, el top 3 está al alcance.

## Conclusión

El SEO local en Badajoz **no es brujería**. Es trabajo bien hecho, sistemático, y con la perspectiva correcta. Quien lo hace bien, gana cuota de mercado mes a mes mientras la competencia sigue confiando en el "boca a boca".

¿Quieres que te ayudemos? En Latech incluimos auditoría SEO local y optimización completa en nuestro plan web. [Escríbenos](https://wa.me/34684739091).`,
    },
    {
      slug: 'stripe-empresas-guia-pagos-online',
      title: 'Stripe para empresas: guía completa de pagos online',
      category: 'Tutoriales',
      excerpt: 'Stripe es el estándar mundial para cobrar online. Guía práctica de cómo funciona, qué cuesta, cuándo usar Payment Links vs Checkout y cómo facturar bien.',
      cover: '/og/post-5.svg',
      readingMinutes: 7,
      content: `## El estándar de facto

Si vas a cobrar online en 2026, hay un nombre que vas a escuchar en todas partes: **Stripe**. Es la pasarela de pago que utilizan desde Amazon hasta tu tienda local de Badajoz, pasando por OpenAI, Shopify, Vercel y miles de SaaS.

¿Por qué se ha comido el mercado? Porque hizo bien tres cosas:

1. **API limpia y documentada** — para desarrolladores, es un sueño.
2. **Soporte multi-país, multi-divisa** — sin papeleo.
3. **UX impecable** para el cliente final.

Vamos al grano: cómo usar Stripe en tu empresa, qué cuesta, y cuáles son las opciones.

## Las 4 formas de cobrar con Stripe

### 1. Payment Links (la más sencilla)

Un **Payment Link** es exactamente lo que parece: una URL que abre una página de pago. Lo creas en 30 segundos desde el dashboard de Stripe, y lo compartes por:
- WhatsApp
- Email
- Redes sociales
- Botón en tu web

**Ventajas:** ninguna integración técnica. Cero código. Lo monta cualquier persona en 5 minutos.

**Cuándo usarlo:**
- Cobros puntuales (presupuestos aceptados).
- Suscripciones simples sin lógica custom.
- Productos digitales con catálogo pequeño.
- Servicios de alto ticket donde no quieres una tienda completa.

En Latech, los planes de Página Web y Tienda Online se pagan con Payment Links — exactamente este caso.

### 2. Checkout (la sesión hosted)

Stripe Checkout es una página de pago que tú generas dinámicamente desde tu web. Cuando el cliente pulsa "Comprar", tu backend habla con Stripe y devuelve una URL temporal a la que rediriges.

**Ventajas:**
- Mantienes carrito, totales, descuentos, IVA.
- Stripe se encarga de toda la seguridad y la UX.
- Soporta Apple Pay, Google Pay, Bizum, transferencia.

**Cuándo usarlo:**
- Tiendas online con catálogo dinámico.
- Productos con variantes.
- Cuando necesitas calcular envíos en tiempo real.

### 3. Stripe Elements (integrado en tu web)

Aquí el formulario de pago vive **dentro de tu web**. Es el más customizable y el más complejo de implementar.

**Cuándo usarlo:** SaaS, marketplaces, plataformas que necesitan UX completamente integrada.

### 4. Stripe Connect (para marketplaces)

Si tu plataforma cobra a clientes y reparte ingresos a vendedores (Etsy-like, Glovo-like), Connect es la herramienta. Es la opción más avanzada.

## Cuánto cuesta Stripe en España

Las tarifas estándar para España (2026):

- **Tarjetas europeas (EEE):** 1.4% + 0.25€ por transacción.
- **Tarjetas no europeas:** 2.9% + 0.25€.
- **SEPA Direct Debit:** 0.8% (max 5€).
- **Bizum:** 1.5%.
- **Suscripciones:** mismo coste por cobro.
- **Reembolsos:** gratis (te devuelven la comisión solo si reembolsas el 100%).

**Sin cuotas mensuales.** Solo pagas por lo que cobras. Esto es brutal — comparado con TPVs físicos donde pagas 30-50€/mes solo por tener el aparato.

## Suscripciones: el modelo de negocio del futuro

Si tu negocio puede tener un componente recurrente (mantenimiento, soporte, contenido, software), montar suscripciones con Stripe Billing es **una jugada estratégica**.

Ventajas del modelo recurrente:
- Ingresos predecibles.
- Mejor valoración del negocio (los SaaS se venden por 5-10x ingresos anuales recurrentes).
- Relaciones a largo plazo con clientes.

Stripe Billing maneja:
- Cobros mensuales/anuales automáticos.
- Reintentos cuando una tarjeta falla.
- Facturas automáticas con IVA.
- Cancelaciones, upgrades, downgrades.
- Pruebas gratuitas con conversión automática.

## Bizum y Stripe: ya están integrados

Buenas noticias para España: desde 2024, **Bizum está integrado en Stripe**. Esto significa que en el mismo checkout, el cliente ve la opción de pagar con Bizum.

Es un game-changer para e-commerce local en España, donde Bizum tiene **40+ millones de usuarios** y mucha confianza.

## Facturación: lo que NO te explican

Cobrar online es la mitad. La otra mitad es **facturar bien para no tener problemas con Hacienda**.

Opciones:

### Opción 1: Stripe Tax + Invoicing
Stripe genera facturas automáticas con IVA correcto. Coste extra pero comodísimo.

### Opción 2: Integración con tu software de facturación
Conectar Stripe a Holded, Quaderno, Sage o Contasimple vía Zapier/n8n. Cada cobro Stripe genera factura automáticamente en tu sistema.

### Opción 3: Manual
Solo si tienes pocas transacciones. Ineficiente a partir de 10 ventas al mes.

## Seguridad y cumplimiento

Stripe es **PCI DSS Level 1**, el nivel más alto de seguridad de pagos. Esto significa:

- Tu negocio no necesita certificarse en PCI (Stripe lo hace por ti).
- Las tarjetas nunca tocan tu servidor — todo viaja directo a Stripe.
- Tienes detección de fraude automática (Radar).
- Cumplimiento RGPD por defecto.

## Errores comunes a evitar

❌ **Vincular Stripe a tu cuenta personal en lugar de la empresa.** Pesadilla fiscal.

❌ **No activar Radar** (detección de fraude). Pequeñas pymes pierden miles de euros al año por chargebacks.

❌ **No configurar webhooks** para automatizar los flujos post-pago.

❌ **Olvidar Stripe Tax** si vendes a clientes en otros países UE — tienes obligaciones de IVA distintas.

❌ **No tener suficiente liquidez** durante el periodo de retención inicial. Stripe puede retener fondos los primeros días/semanas como garantía. Planifícalo.

## Stripe vs otras opciones

¿Y si no fuese Stripe? Veamos competencia:

- **PayPal:** comisiones más altas (3.4% en general). UX peor. Suele perder en comparativas técnicas.
- **Redsys (TPV banco):** comisiones a veces mejores en volumen, pero integración técnica es del 1995. UX del cliente, regular. Solo recomendado si tu banco te da condiciones brutales.
- **Adyen:** muy bueno para empresas grandes (Uber, Spotify). Caro y complejo para pymes.
- **Mollie:** competidor europeo de Stripe. Buena alternativa, especialmente fuerte en Países Bajos. Para España, Stripe sigue ganando.

## Conclusión

Para 99% de las pymes españolas, **Stripe es la opción correcta**. Comisiones competitivas, integración técnica impecable, soporte de Bizum, facturación automatizable y seguridad de máximo nivel.

Si vas a montar tienda online o cobros recurrentes, no le des más vueltas. Stripe.

En Latech integramos Stripe en todas las tiendas online y planes recurrentes que desarrollamos. ¿Quieres una demo? [Hablemos](https://wa.me/34684739091).`,
    },
    {
      slug: 'elegir-empresa-diseno-web',
      title: 'Cómo elegir la empresa de diseño web perfecta (señales que la mayoría ignora)',
      category: 'Diseño Web',
      excerpt: 'Una mala decisión aquí cuesta meses de trabajo y miles de euros. Las 7 señales que separan a una empresa premium de una mediocre.',
      cover: '/og/post-6.svg',
      readingMinutes: 7,
      content: `## La decisión que más cuesta deshacer

Contratar una empresa de diseño web es como contratar un mecánico para tu coche: si eliges mal, no solo pierdes dinero — pierdes **meses de trabajo, oportunidades comerciales y energía emocional**.

Y aquí está la trampa: la mayoría de criterios que la gente usa para elegir agencia (precio, recomendación de un amigo, lo que vio en su Instagram) son los menos importantes.

Te cuento los criterios que SÍ importan, según años trabajando en este sector y viendo proyectos rotos heredados de otras agencias.

## 1. Mira el portfolio. Pero mira BIEN.

Casi todas las agencias presumen de portfolio. La pregunta no es **cuántos proyectos** tienen, sino **cómo son esos proyectos**.

Cosas a hacer:

### Test de velocidad
Coge 3-5 webs del portfolio y pásalas por **PageSpeed Insights**. Si los proyectos de la agencia están a 60 puntos en móvil, tu web acabará igual.

### Test de móvil
Abre los proyectos en tu móvil. ¿Se ven bien? ¿Carga rápido? ¿Funcionan los formularios? Si la agencia no cuida sus mejores proyectos en móvil, el tuyo no será mejor.

### Test de profundidad
No mires solo la home. Entra en páginas internas, blog, productos. Las webs malas son las que tienen una home espectacular y secundarias improvisadas.

### Test de antigüedad
Pregunta cuándo se entregó cada proyecto. Una web que el cliente sigue actualizando tres años después es **una buena señal**. Una web abandonada en 6 meses indica problema de relación cliente-agencia.

## 2. Pregunta por el stack tecnológico

Si tu única respuesta es "WordPress", **alarma roja**. No porque WordPress sea malo, sino porque para muchas agencias es lo único que saben hacer, y eso significa:

- Limitaciones técnicas.
- Webs lentas a medio plazo.
- Plugins de pago para cosas que deberían ser nativas.
- Mantenimiento eterno.

**Las agencias premium en 2026** trabajan con stacks modernos: Next.js, React, Vercel, Tailwind, headless CMS. Y saben **cuándo** usar cada uno.

Si vas a un sitio simple (cinco páginas estáticas), está bien WordPress o un site builder. Si vas a algo serio (e-commerce, app, plataforma), exige stack moderno.

## 3. ¿Quién va a hacer tu web realmente?

Pregunta directa: **"¿La persona que diseñó este proyecto del portfolio es la misma que va a hacer el mío?"**

En agencias grandes, los seniors **venden el proyecto** y luego lo pasan a juniors o subcontratan. El resultado es desigual.

En agencias pequeñas y especialistas, la persona con la que hablas es la que va a tocar el código. Eso garantiza calidad consistente.

## 4. ¿Tienen permanencia, contratos largos o "fees ocultos"?

Aquí filtras al 80% de agencias mediocres. Las señales de alarma:

❌ **Permanencia de 12 meses** o más.
❌ **Contrato de exclusividad** ("solo nosotros podemos modificar tu web").
❌ **Tarifas ocultas** ("cualquier cambio son 80€/hora").
❌ **No te dan acceso al código** ni al hosting.
❌ **No te transfieren el dominio**.

Una empresa de diseño web profesional debería:
- Sin permanencia.
- Cambios menores incluidos.
- Acceso completo a código, hosting y dominio.
- Transferibilidad total.

Si te encadenan, es porque saben que su producto no es bueno y necesitan retenerte por contrato.

## 5. Cómo hablan de SEO

Pregunta: **"¿Qué SEO incluye el proyecto?"**

**Mal SEO (huye):**
- "Te ponemos las metas y palabras clave."
- "Te damos de alta en 100 directorios."
- "Posicionamos en 30 días garantizados." (Promesas falsas.)

**Buen SEO:**
- "Auditoría técnica completa antes y después."
- "Análisis de competencia local específica."
- "Implementación de schema markup."
- "Core Web Vitals optimizados."
- "Estrategia de contenidos a 6-12 meses."

El SEO real es trabajo técnico + estrategia, no posicionamiento mágico.

## 6. ¿Qué pasa después de la entrega?

Esta es la pregunta clave: **"¿Y si necesito cambios en 3 meses?"**

Tres respuestas tipo:

**Tipo A:** "Eso son nuevos proyectos, te paso presupuesto." (Te van a sangrar.)

**Tipo B:** "Te lo hacemos por horas, son 60-80€/hora." (Cambios pequeños te costarán fortunas.)

**Tipo C:** "Cambios menores incluidos en la cuota mensual. Cambios grandes son proyectos aparte y te avisamos." (La buena.)

En Latech aplicamos el modelo C: cambios menores (textos, imágenes, ajustes de diseño puntuales) están dentro del plan mensual.

## 7. ¿Trabajan con herramientas profesionales o "improvisan"?

Pregunta cómo gestionan el proyecto:

**Mal:**
- "Te mando emails con avances."
- "Hacemos llamadas cuando haga falta."

**Bien:**
- Tablero de proyecto compartido (Notion, Linear, Trello).
- Reuniones periódicas pactadas.
- Documentación técnica escrita.
- Acceso a panel cliente para subir materiales.

Las agencias que improvisan, te improvisan el proyecto. Y al final acabas tú haciendo seguimiento mil veces.

## La señal definitiva: ¿son transparentes con los precios?

Una empresa con un producto sólido **publica precios**.

Cuando una agencia te dice "depende, mándame qué quieres y te paso presupuesto", suele significar:

- No tienen un proceso estandarizado.
- Te van a poner el precio según cuánto vean que puedes pagar.
- El precio puede triplicar entre clientes con necesidades parecidas.

Una agencia premium con proceso optimizado **dice claramente**: "Plan web 60€/mes + 400€ de creación. Plan tienda 80€/mes + 400€. Plan IA desde 150€/mes." Y cumple.

## Bandera roja final: cómo te tratan ANTES de cobrarte

La forma en que una agencia se comunica antes de tener tu dinero **es la mejor versión que vas a ver**. Si ya antes de pagar tardan días en contestar, no contestan dudas, te presionan para cerrar...

...después de pagar va a ser peor.

## Conclusión: la empresa correcta es la que...

- ...tiene proyectos rápidos, mobile-friendly y bien mantenidos.
- ...trabaja con stack moderno y te lo explica.
- ...la persona con la que hablas es la que toca el código.
- ...sin permanencia, con cambios incluidos, con transferibilidad total.
- ...habla de SEO con seriedad técnica, no con promesas.
- ...tiene precios públicos, claros y consistentes.
- ...te responde rápido y bien antes de cobrarte un euro.

Si encuentras una empresa que cumple los 7 puntos, **contrátala sin dudarlo**. Si te falta alguno, sigue buscando.

¿Quieres ver cómo aplicamos esto en Latech? [Mira nuestros planes](/tienda) o [escríbenos](https://wa.me/34684739091).`,
    },
  ];

  const extraPosts = [
    {
      slug: 'automatizaciones-n8n-pymes-12-procesos',
      title: 'Automatizaciones con n8n para pymes: 12 procesos que puedes delegar hoy',
      category: 'IA',
      excerpt: '12 procesos reales que una pyme puede automatizar con n8n esta semana: facturación, leads, recordatorios, reseñas y más. Con ejemplos.',
      cover: '/og/post-7.svg',
      readingMinutes: 9,
      publishedAt: new Date('2026-03-14T10:00:00Z'),
      content: `## Por qué n8n es la herramienta secreta de las pymes que crecen

Mientras los gigantes hablan de "transformación digital", las pymes que sí están creciendo hacen algo mucho más aburrido: **automatizan**. Tareas repetitivas que comen 10-15 horas a la semana del equipo, ejecutadas sin tocar un dedo. La herramienta que está moviendo esto en 2026 se llama **n8n**.

Y la mejor noticia: cualquier pyme puede empezar esta semana. No hace falta un departamento de IT. No hace falta saber programar. Hace falta querer dejar de hacer trabajo de chimpancé.

## Qué es n8n en 60 segundos

**n8n** (se pronuncia "n-eight-n") es una plataforma de automatización low-code. Conectas APIs y servicios como piezas de Lego: cuando pasa **X**, ejecutas **Y**.

Tres cosas la separan de Zapier o Make:

* **Es self-hostable.** Lo montas en tu servidor o en la nube europea. Tus datos no salen de la UE.
* **Es infinitamente más potente.** Soporta JavaScript custom y se integra con cualquier API, no solo las que aparecen en el menú.
* **El precio escala bien.** Self-hosted es gratis. La versión cloud cuesta una fracción de Zapier cuando subes a miles de ejecuciones.

¿Por qué importa para una pyme? Porque combina lo barato con lo serio. **Sin barrera de entrada y sin techo cuando creces.**

## Los 12 procesos automatizables

### 1. Lead → CRM → WhatsApp de bienvenida

Alguien rellena el formulario de contacto. n8n recibe el evento, crea el contacto en tu CRM (HubSpot, Pipedrive, Notion), le manda un WhatsApp de bienvenida con tu agenda y avisa al comercial en Slack. **Antes:** 5 minutos por lead, perdidos a las 23:00. **Ahora:** 0 segundos.

### 2. Factura recibida → Drive → contabilidad

Un proveedor te manda una factura por email. n8n la guarda en Google Drive con nombre normalizado, extrae los datos con IA (OCR + LLM) y los empuja a tu hoja de contabilidad o a Holded.

### 3. Reserva web → Google Calendar → SMS recordatorio

El cliente reserva en tu web. n8n bloquea el hueco en Calendar, manda email de confirmación inmediato y un SMS recordatorio 24h antes. **Las reservas con recordatorio tienen menos de la mitad de no-shows.**

### 4. Pedido tienda → Stripe → albarán PDF → email

Llega un pedido. n8n cobra con Stripe, genera el albarán en PDF (Carbone, PDFmonkey o un template HTML) y lo envía al cliente, al almacén y a contabilidad. Cero intervención humana.

### 5. Reseña Google → Slack del equipo

Cualquier reseña nueva en tu ficha de Google llega al canal de Slack al instante. Si es 4★ o menos, salta una alerta roja para que respondas en menos de una hora — el momento clave.

### 6. Formulario contacto → Notion + email comercial

Cada lead aterriza en una base Notion clasificada por tipo de servicio. n8n añade etiquetas, asigna comercial según reglas (ciudad, tamaño, sector) y prepara un email comercial pre-redactado listo para revisar.

### 7. Cliente recurrente → cumpleaños → cupón

Si un cliente lleva más de 6 meses comprando, el día de su cumpleaños recibe un cupón personal por WhatsApp. **Cuesta cero. La fidelidad que construye, no.**

### 8. Stock bajo → email proveedor automático

Cuando un SKU baja del umbral, n8n manda email al proveedor con el pedido pre-rellenado. Tú confirmas con un clic. Adiós a las roturas de stock por despiste.

### 9. Llamada perdida → WhatsApp de respuesta

El cliente llama a tu fijo y no contestas. n8n detecta la llamada perdida (vía Twilio o tu PBX), envía WhatsApp inmediato con tu agenda online y crea ticket de seguimiento. **No vuelves a perder un lead por no estar.**

### 10. Nuevo gasto → categorización IA → hoja contable

Un ticket de gasto entra por email. n8n lo lee con un LLM (GPT-4 / Claude), categoriza, valida con IVA y lo escribe en tu hoja contable. **Lo que tu gestor cobraba por hacer en 5 minutos, en 5 segundos.**

### 11. Alta empleado → onboarding documental

Cuando un nuevo empleado entra, n8n genera contrato desde plantilla, lo manda a firma electrónica, crea su email corporativo, le da acceso a herramientas y le envía un kit de bienvenida. **Lo que tarda 3 días, hecho en 30 minutos.**

### 12. Encuesta NPS post-servicio

Tres días después de un servicio, el cliente recibe una mini-encuesta de una pregunta. Si vota 9-10, n8n le pide una reseña en Google. Si vota menos, alerta al equipo para llamar. **Acelera reseñas y atrapa quejas antes de que crezcan.**

## Errores típicos al empezar con n8n

❌ **Empezar por el flujo más complicado.** Empieza por algo que se ejecute 50 veces al día y que ya pierdas tiempo en él. Wins rápidos, no proyectos de 3 meses.

❌ **Confundir n8n con un CRM.** n8n es la fontanería que conecta sistemas. No guardes datos críticos en él — guárdalos en tu CRM, ERP o base de datos.

❌ **No documentar.** Cada flujo necesita un README de dos líneas: qué hace, quién es el dueño. Sin eso, en 6 meses nadie sabe por qué se manda un WhatsApp a las 9:00 todos los lunes.

❌ **Ignorar el manejo de errores.** Cada nodo crítico necesita un fallback. Si Stripe cae 30 segundos, no quieres perder un pago.

❌ **Hacerlo todo en cloud cuando manejas datos sensibles.** Si tratas datos de salud, abogados o ERP, **self-host en servidor europeo**.

## Plan de implantación de 30 días

**Semana 1 — Mapear:**

* Lista de 20 tareas repetitivas del equipo (con tiempo estimado al mes).
* Marca las 5 que más duelen.
* Verifica que tienen API o webhook de entrada.

**Semana 2 — Montar dos flujos sencillos:**

* Lead → CRM → WhatsApp.
* Reseña Google → Slack.
* Probar con casos reales antes de "switch on".

**Semana 3 — Conectar Stripe / facturación:**

* Pedido → albarán PDF → email.
* Stock bajo → proveedor.

**Semana 4 — IA y revisar:**

* Sumar un flujo con LLM (categorización de gastos, respuestas borrador).
* Auditar lo construido: errores, fallbacks, coste.
* Documentar y entregar al equipo.

A los 30 días deberías estar ahorrando **20-30 horas semanales** acumuladas. A los 90, esa cifra se duplica.

## Conclusión

n8n no es una moda. Es lo que separa a las pymes que escalan sin romperse de las que se quedan atascadas en el "no me da la vida". **El primer flujo que montas te paga el resto del año.** Brujería no es. Es así.

Si quieres que montemos los 12 contigo, [hablamos por WhatsApp](https://wa.me/34684739091).`,
    },
    {
      slug: 'whatsapp-business-api-automatizacion',
      title: 'WhatsApp Business API: cómo automatizar tu atención al cliente sin perder humanidad',
      category: 'Tutoriales',
      excerpt: 'Diferencias entre WhatsApp Business y la API, cuándo conviene cada una, costes reales y cómo conectarla con n8n para responder 24/7.',
      cover: '/og/post-8.svg',
      readingMinutes: 8,
      publishedAt: new Date('2026-03-21T10:00:00Z'),
      content: `## App vs Business vs API: tres productos distintos

Cuando alguien dice "tengo WhatsApp para mi negocio", puede estar hablando de tres cosas radicalmente diferentes. Y elegir mal te cuesta tiempo, dinero o directamente que Meta te cierre la cuenta.

* **WhatsApp normal.** La app del móvil personal. Prohibido por términos de servicio si la usas para vender. Te pueden bloquear y se ha visto cuentas baneadas por hacer "broadcasts" comerciales.
* **WhatsApp Business (la app verde).** Gratis, instala en un móvil. Catálogo, respuestas rápidas, etiquetas. Hecha para autónomos y micro-negocios. **Una sola persona puede atenderla a la vez.**
* **WhatsApp Business API (Cloud API).** Es el motor "industrial". Multi-agente, automatizable, conectable a CRM, n8n, chatbots. Es lo que usan las empresas que reciben más de 10-15 mensajes al día.

¿Cuál necesitas? Lo siguiente.

## Cuándo necesitas la API (la regla de las 3 señales)

No todo el mundo necesita WhatsApp API. Es overkill para muchos. La regla simple — **necesitas API cuando se cumple al menos una de estas 3 señales**:

1. **Más de un agente** atiende WhatsApp simultáneamente.
2. **Quieres automatizar** (chatbot, recordatorios, confirmaciones).
3. **Necesitas integrar con CRM, e-commerce o ERP.**

Si no, la app Business clásica te llega y sobra.

## Costes reales en España (tarifas Meta 2026)

WhatsApp Cloud API no se paga por mensaje individual exactamente — se paga por **conversación de 24 horas** abierta con un cliente, según categoría. Para España (zona EUR):

| Categoría | Coste por conversación 24h |
|---|---|
| Servicio (cliente inicia) | gratis las primeras 1.000/mes |
| Utility (factura, recordatorio) | ~0,03 € |
| Authentication (OTP) | ~0,02 € |
| Marketing | ~0,06 € |

Esto significa que **una pyme con 500 conversaciones de servicio al mes paga 0 €** en mensajería. Solo paga marketing y utility, que son las que tú inicias.

A esto se suman:
* La cuota mensual del **Business Solution Provider** (BSP) que te conecta — 0 a 50 €/mes según proveedor.
* La WABA (WhatsApp Business Account) **es gratis** crear.

Comparado con SMS (0,06 € por mensaje en España, sin "ventana de 24h"), **WhatsApp es brutal en relación coste-impacto**.

## Plantillas de mensaje: lo que Meta sí aprueba y lo que no

Aquí está la trampa que pillas si no lees la doc. **No puedes mandar mensajes libres a alguien que no te ha escrito en las últimas 24 horas.** Si quieres iniciar la conversación (recordatorio de cita, oferta), tienes que usar una **plantilla aprobada por Meta**.

✅ **Sí aprueba:**

* Recordatorios de cita ("Tu cita es mañana a las 11:00").
* Confirmaciones de pedido y envío.
* Notificaciones transaccionales (factura lista, pago recibido).
* OTPs.
* Mensajes de marketing claros, opt-in, identificando al remitente.

❌ **No aprueba:**

* Mensajes vagos ("Hola, ¿cómo estás?").
* Spam disfrazado de cuestionario.
* Promesas exageradas ("Gana 1000€ ahora").
* Sin opción clara de baja en marketing.

Para pasar la revisión, **escribe la plantilla como un humano formal**, indica el remitente y da contexto en una sola frase.

## Conectar WhatsApp API con n8n (esquema del flujo)

Una arquitectura típica se ve así:

1. **Cliente escribe a tu WhatsApp.** Llega a Meta Cloud.
2. **Meta dispara un webhook** a tu n8n.
3. **n8n decide** según el mensaje:
   * ¿Es una pregunta frecuente? Responde con plantilla o IA.
   * ¿Es una reserva? Comprueba calendar y agenda.
   * ¿Necesita humano? Asigna ticket y avisa al equipo.
4. **n8n responde** a través de la API de Meta.
5. **Todo queda registrado** en tu CRM con histórico completo.

El truco: combina automatización con escalado humano. **El bot resuelve el 70%; lo demás va a una persona con todo el contexto ya cargado.**

## Errores que te pueden vetar la cuenta

Meta es estricta. Estos son los errores que más cuentas hunden:

❌ **Mensajes masivos sin opt-in.** Importar tu agenda y enviarles a todos un mensaje promocional es la forma más rápida de quedar baneado.

❌ **Bot que se hace pasar por humano.** Identifica claramente que es un asistente automático en el primer mensaje.

❌ **No respetar la hora de baja.** Si alguien dice "STOP" o "BAJA", quitar inmediatamente. Si reincides, Meta te penaliza.

❌ **Cambiar el número asociado a la WABA varias veces.** Levanta sospecha y bloqueo temporal.

❌ **Plantillas con contenido prohibido.** Apuestas, criptomonedas no reguladas, productos médicos sin aprobación. Lectura obligada del [WhatsApp Commerce Policy](https://www.whatsapp.com/legal/commerce-policy).

## Conclusión

WhatsApp Business API ha dejado de ser cosa de empresas grandes. Una pyme con 200 clientes activos al mes ya tiene caso de uso claro: **menos llamadas, menos no-shows, más conversión, atención 24/7**.

El error es montarlo casero con la app del móvil y un voluntario. **Si vas a usar WhatsApp como canal de negocio serio, móntalo en serio.** Es así.

¿Quieres que te conectemos WhatsApp API a tu CRM y a n8n? [Hablamos](https://wa.me/34684739091).`,
    },
    {
      slug: 'core-web-vitals-velocidad-web-ventas',
      title: 'Core Web Vitals: cómo la velocidad de tu web afecta a tus ventas (datos 2026)',
      category: 'Diseño Web',
      excerpt: 'LCP, INP y CLS explicados sin jerga. Cuánto cuesta cada segundo de carga, cómo medir tu web hoy y qué tocar primero para subir conversión.',
      cover: '/og/post-9.svg',
      readingMinutes: 7,
      publishedAt: new Date('2026-03-28T10:00:00Z'),
      content: `## La regla de los 3 segundos

En e-commerce hay un dato que se repite hasta el aburrimiento porque sigue siendo cierto: **por cada segundo extra de carga, la conversión baja entre un 7% y un 12%**. Y no es que la gente "tenga prisa". Es que el cerebro humano procesa la espera como sospecha.

Y mira esto: a los **3 segundos**, más de la mitad de visitantes en móvil abandonan. **A los 5 segundos**, casi todos. Una web lenta no es solo "incómoda" — es una sangría literal de ingresos.

Si tu Shopify, WooCommerce o web custom carga a 4-5 segundos, **estás perdiendo el 30-40% de tus ventas potenciales**. Punto.

## Qué son LCP, INP y CLS (en lenguaje humano)

Google ya no se conforma con "que cargue rápido". Mide tres cosas concretas — los **Core Web Vitals**:

* **LCP (Largest Contentful Paint).** Cuánto tarda en aparecer el elemento principal de la página (la foto hero, el título). **Objetivo: menos de 2,5s.**
* **INP (Interaction to Next Paint).** Cuánto tarda la web en responder cuando el usuario hace clic, tap o teclea. Sustituyó a FID en marzo de 2024. **Objetivo: menos de 200ms.**
* **CLS (Cumulative Layout Shift).** Cuánto se mueve la página mientras carga (ese momento en que vas a pulsar un botón y se desplaza). **Objetivo: menos de 0,1.**

Estas tres métricas son **factores de ranking en Google**. Una web mala en CWV no posiciona, por mucho que el contenido sea bueno.

## Cómo medir tu web hoy

Hay tres herramientas honestas:

### 1. PageSpeed Insights

Ve a [pagespeed.web.dev](https://pagespeed.web.dev). Pega tu URL. Mira los dos bloques:

* **Field data.** Datos reales de Chrome de los últimos 28 días — esto es lo que Google usa para ranking.
* **Lab data.** Test simulado en ese momento, útil para diagnóstico pero no es lo que pondera el ranking.

### 2. Search Console

En tu Search Console, sección "Experiencia → Core Web Vitals", ves qué páginas tienen problemas y cuántos usuarios reales los están sufriendo.

### 3. CrUX Report

El [Chrome User Experience Report](https://developer.chrome.com/docs/crux) tiene los datos de campo de cualquier dominio público. Útil para auditar a la competencia.

**No te quedes con los datos de lab**. Lo que cuenta es el campo (lo que vive el usuario real).

## Las 8 optimizaciones con mayor ROI

Por orden de impacto/esfuerzo:

1. **Imágenes en WebP/AVIF y dimensionadas** según el viewport. Una foto hero pasa de 1,5 MB a 80 KB sin perder calidad.
2. **Lazy load de todo lo que no es above-the-fold**. Imágenes, iframes, vídeos, hasta scripts.
3. **Pre-conectar a dominios externos críticos** con preconnect. Ahorra 100-300 ms en cada conexión.
4. **Reducir JavaScript no esencial.** Cargas innecesarias de chat widgets, analytics dobles, librerías legacy. Auditoría con Lighthouse.
5. **Fonts con font-display: swap** y subset latino. Las webfonts mal cargadas son el #1 de CLS.
6. **CDN siempre.** Vercel, Cloudflare, Fastly. Servir desde Madrid a un usuario de Madrid es 10× más rápido que desde Virginia.
7. **Cache HTTP correcto** para assets versionados (max-age largo, immutable).
8. **Server Components / SSG** cuando se pueda. Renderizar HTML en servidor reduce LCP y trabajo del navegador.

Las 4 primeras suelen mover el 80% del marcador.

## Errores que matan la velocidad

❌ **Imágenes "optimizadas" en Photoshop a 100% calidad.** Un JPG de 4 MB en una home no se arregla con CDN.

❌ **Plugins de WordPress acumulados.** 30 plugins suman 30 archivos JS y CSS bloqueantes. Cada uno suma latencia.

❌ **Sliders y carruseles auto-play en hero.** Mueven el LCP a la zona roja siempre.

❌ **Vídeos auto-play sin compresión.** Mata móviles y 4G.

❌ **Tag managers cargando 12 scripts de marketing**. Cada uno inyecta JS que bloquea el thread principal.

❌ **No reservar dimensiones para imágenes** (sin width/height). Es el principal causante de CLS.

## Plan de mejora de 30 días

**Semana 1 — Auditoría:**

* Sacar el report de PageSpeed Insights de las 5 páginas con más tráfico.
* Anotar LCP, INP y CLS de campo en cada una.
* Listar problemas con prioridad (alto/medio/bajo).

**Semana 2 — Imágenes y fuentes:**

* Convertir todas las imágenes a WebP/AVIF.
* Añadir width/height en cada imagen.
* font-display: swap + preconnect en fuentes externas.

**Semana 3 — JavaScript y third-party:**

* Auditar scripts cargados. Eliminar los muertos.
* Diferir analytics no críticos.
* Cargar tag manager con async.

**Semana 4 — Cache, CDN y verificación:**

* Configurar cache HTTP de assets.
* Migrar a un CDN serio si no lo tenías.
* Re-medir todas las páginas. Comparar con la línea base.

A los 30 días deberías estar en zona verde en Core Web Vitals para tus páginas principales. Y verás el efecto en el funnel: **las páginas rápidas convierten más, sin tocar copy ni precio**.

## Conclusión

La velocidad web ya no es "una nice-to-have de SEO". Es **el primer factor de conversión que tienes en tu mano**, y depende solo de decisiones técnicas claras. La buena noticia: con stack moderno (Next.js, imágenes optimizadas, CDN europeo), una web premium ya viene rápida desde el día uno.

¿Quieres que auditemos tu web gratis? [Escríbenos por WhatsApp](https://wa.me/34684739091).`,
    },
    {
      slug: 'ia-restaurantes-bares-playbook',
      title: 'Inteligencia Artificial para restaurantes y bares: el playbook completo',
      category: 'IA',
      excerpt: 'Reservas por voz, recordatorios automáticos, cartas digitales con IA, control de no-shows y reseñas. El plan de IA para hostelería paso a paso.',
      cover: '/og/post-10.svg',
      readingMinutes: 9,
      publishedAt: new Date('2026-04-04T10:00:00Z'),
      content: `## La economía de un restaurante medio en 2026

Un restaurante de 40-60 cubiertos en España trabaja con un margen neto entre el **5% y el 12%**. Cada euro mal gestionado pesa. Y los tres dolores que más sangran no están en la cocina — están en la operativa:

* **Llamadas perdidas en hora punta.** 10-15 reservas potenciales al día se quedan sin contestar.
* **No-shows (clientes que no aparecen).** Promedio del sector: **15-20%**. Un viernes lleno con 18% de no-shows son 4-5 mesas vacías y 250-400 € en humo.
* **Reseñas no gestionadas.** Una mala reseña sin respuesta vale menos cinco buenas.

Aquí entra la IA. No como sustituto del trato humano, sino como **el equipo de oficina que el restaurante nunca tuvo**.

## Los 6 puntos donde la IA dispara beneficio

### 1. Reservas por voz 24/7

Un agente IA conectado al teléfono atiende las llamadas que tu equipo no puede coger. Toma datos, comprueba mesa libre, confirma. **20 llamadas simultáneas, sin esperas.**

Caso real (anonimizado): restaurante en el centro de Badajoz, 50 cubiertos. Pasaron de **15 llamadas perdidas/día a cero**. Equivalente a 4-5 reservas extra cada día = ~+8.000 € de facturación al mes.

### 2. Confirmación + recordatorio automático (corta no-shows)

Un día antes, el cliente recibe WhatsApp con su reserva, link de cancelación y opción de modificar. **Esto solo recorta el no-show del 18% al 4-5%**.

Mismo ejemplo: 4-5 mesas extra ocupadas un viernes son ~300-400 € por servicio. Multiplica por 8-10 servicios al mes y aparece la verdadera mejora del margen.

### 3. Carta digital con recomendaciones IA

QR en mesa → carta web con buscador, alérgenos, vídeos de plato y un asistente que sugiere: *"si te gusta el atún rojo, prueba también el tartar de gambas"*. **Eleva el ticket medio entre un 8% y un 15%**.

Bonus: la carta se actualiza desde un panel; cambias precio o quitas un plato sin reimprimir nada.

### 4. Atención multilingüe

Para zonas turísticas y eventos, el agente IA de voz responde en **español, inglés, portugués, francés, alemán e italiano**. Sin contratar a nadie. La carta digital traduce automáticamente.

### 5. Reseñas: alertas + respuesta asistida

n8n vigila tu ficha de Google, TripAdvisor y The Fork. Cuando entra una reseña, alerta en Slack/WhatsApp. Si es ★★★★★, IA prepara borrador de respuesta agradeciendo. Si es ≤ 3, alerta urgente con borrador empático listo para revisar.

**Resultado:** subes de 4,2 a 4,7-4,8 en 6 meses. La diferencia entre vacío y lleno los viernes.

### 6. Control de stock y mermas con visión IA

Cámaras en cocina + visión por computadora identifican cuando una merma se sale de lo normal. Aviso al chef, registro automático. **Reduces mermas un 5-8%** en operativas medianas.

## Stack técnico real

No es magia ni se monta en un fin de semana, pero tampoco es nuclear. La arquitectura habitual:

* **Voicebot** (ElevenLabs / Vapi) conectado a tu número actual con portabilidad o desvío.
* **n8n** como orquestador.
* **Calendario / sistema de reservas** (Cover Manager, The Fork, Restoo o tu propio gestor).
* **WhatsApp Business API** para recordatorios.
* **Stripe** para señales de reserva en eventos.
* **LLM** (Claude, GPT-4) para razonamiento y multilingüe.
* **Notion / Airtable** para histórico de clientes y "lo de siempre".

Todo dockerizado en servidor europeo. **Cumple RGPD por construcción**.

## Caso real (hipotético) tipo "La Colmena": antes y después

Restaurante 50 cubiertos, ticket medio 32 €, 7 servicios/semana.

**Antes:**

* Reservas por móvil personal del jefe de sala. 12-15 llamadas perdidas/día.
* No-shows del 18%.
* 1 reseña respondida de cada 5.
* Carta en papel con cambios cada 4 meses (porque cambiarla cuesta).
* Ticket medio estancado.

**Después (3 meses con el playbook):**

* 0 llamadas perdidas.
* No-shows en 4-5%.
* 100% de reseñas respondidas en menos de 4 horas.
* Carta digital con recomendaciones → ticket medio +11%.
* Reservas internacionales en aumento por atención multilingüe.

**Inversión mensual estimada:** 200-350 € (según volumen).
**Retorno mensual estimado:** 5.000-9.000 € extra.

## Errores típicos al implantar IA en hostelería

❌ **Querer que la IA "lo haga todo" desde el día 1.** Se va por fases: primero agente IA en llamadas perdidas; luego recordatorios; luego carta digital. **Iteración, no big-bang.**

❌ **Voz robotizada de los 2010.** Si suena artificial, el cliente cuelga. Hay que invertir en voces sintéticas modernas y en **prompt engineering serio**.

❌ **No alimentar el agente con tu identidad real.** Sin tu carta, tus horarios, tu tono, tus clientes habituales, el agente da respuestas genéricas y eso se nota.

❌ **No tener un humano de respaldo.** El agente debe saber pasar a humano cuando el cliente lo pide o el caso es complejo.

❌ **Pensar que esto sustituye al equipo.** No. **Libera al equipo de la oficina para que esté en sala**, que es donde se gana la batalla.

## Plan de implantación de 30 días

**Semana 1:**

* Agente IA en llamadas perdidas (después del horario y picos).
* Recordatorios WhatsApp 24h antes con link de cancelación.

**Semana 2:**

* Carta digital con QR en mesa.
* Conectar reseñas a Slack/WhatsApp.

**Semana 3:**

* Multilingüe activado.
* Sistema de "lo de siempre" para clientes habituales.

**Semana 4:**

* Auditoría: KPIs antes/después.
* Ajustes de prompt y de templates.
* Decisión sobre fase 2 (visión en cocina, fidelización).

## Conclusión

La IA en hostelería no es ciencia ficción. Es operativa, rentable y se monta en semanas. **Los restaurantes que la adoptan en 2026 cogen ventaja antes de que sea estándar**. Brujería no es. Es así.

¿Quieres tu playbook personalizado? [Hablamos por WhatsApp](https://wa.me/34684739091).`,
    },
    {
      slug: 'pasarelas-pago-espana-comparativa-2026',
      title: 'Pasarelas de pago en España 2026: Stripe vs Redsys vs Bizum vs PayPal',
      category: 'Tutoriales',
      excerpt: 'Comisiones reales, integración, conversión y fraude: la comparativa honesta de pasarelas de pago para empresas españolas en 2026.',
      cover: '/og/post-11.svg',
      readingMinutes: 8,
      publishedAt: new Date('2026-04-11T10:00:00Z'),
      content: `## Lo que de verdad importa al elegir pasarela (no es el precio)

La mayoría elige pasarela mirando solo la comisión. Y se equivoca. **El coste real de una pasarela tiene cinco componentes**, no uno:

1. **Comisión por transacción.** Lo que sale en la factura.
2. **Comisión oculta.** Tipo de cambio si vendes en otra divisa, fees del banco al cobrar a tu cuenta.
3. **Tasa de conversión del checkout.** Una pasarela que pierde 8% en redirección caduca con un 1% extra de comisión.
4. **Integración técnica.** Horas de desarrollo y mantenimiento.
5. **Fraude y chargebacks.** Las que tienen detección automática (Radar de Stripe) ahorran miles al año.

Con esa lente, vamos a las cuatro grandes en España.

## Stripe: el estándar global

**Comisión:** 1,4% + 0,25 € (tarjetas EEE), 2,9% + 0,25 € (no-EEE).
**Alta:** online, 24-48h.
**Integración:** API limpia, SDKs en todos los lenguajes.
**Conversión:** alta — Apple Pay, Google Pay, Bizum, link de un clic. Los pagos pasan en 3-4 segundos.
**Fraude:** Radar automático incluido.

✅ Multi-país, multi-divisa, sin papeleo.
✅ Suscripciones (Stripe Billing) como reloj.
✅ Documentación obscena de buena.
❌ El primer mes pueden retener fondos como garantía.
❌ Soporte humano lento si no estás en plan grande.

**Cuándo elegirla:** SaaS, e-commerce serio, suscripciones, marketplaces.

## Redsys: la pasarela de los bancos españoles

Es el procesador que está detrás de los TPV virtuales que te ofrece tu banco (Santander, BBVA, Sabadell, CaixaBank).

**Comisión:** la negocia tu banco. Para volúmenes medios suele ser **0,5%-0,9%**, mejor que Stripe en términos de fee bruto. Pero ojo: añade cuotas mensuales del TPV (10-30 €/mes).
**Alta:** semanas, papeleo del banco.
**Integración:** API estilo "1995". Documentación pública mejorable. Pasarela hospedada con redirección.
**Conversión:** menor que Stripe (la página redirigida transmite menos confianza).
**Fraude:** depende del banco.

✅ Comisiones bajas para volumen alto.
✅ Si ya tienes relación buena con tu banco, ahorras.
❌ UX del checkout en zonas grises.
❌ Integración técnica costosa.

**Cuándo elegirla:** comercios con volumen alto y relación bancaria muy fuerte; sectores donde el banco premia con condiciones especiales.

## Bizum para empresas: el caballo ganador en España

Bizum no es una pasarela en sí — funciona **a través de Stripe, Redsys o Mollie**. Pero merece sección propia porque en España es decisivo.

**Comisión:** ~1,5% (vía Stripe).
**Alta:** automática si ya tienes Stripe.
**Conversión:** **brutal** en e-commerce de bajo ticket (<60 €). Un tap, cobrado.
**Limitaciones:** importes hasta 1.000 € por operación.

✅ **40+ millones de usuarios** en España.
✅ Confianza altísima entre clientes mayores de 35.
✅ UX de un solo clic en móvil.
❌ Solo funciona dentro de España.
❌ No para B2B grande.

**Cuándo activarlo:** **siempre** si vendes B2C en España. Sin debate.

## PayPal: cuándo sigue teniendo sentido

**Comisión:** 3,4% + 0,35 € (España, doméstico).
**Alta:** online, rápida.
**Integración:** sencilla.
**Conversión:** alta solo en demografías concretas (>45 años, compra internacional).
**Fraude:** PayPal protege al comprador agresivamente — los chargebacks suelen perderlos los vendedores.

✅ Confianza de marca para cierto público.
✅ Pago internacional cómodo.
❌ Comisiones altas.
❌ Reservas y bloqueos sin previo aviso (bug histórico).
❌ Política de chargebacks pro-comprador.

**Cuándo elegirla:** como **opción complementaria** si tu público es internacional o mayor, no como pasarela principal.

## Tabla comparativa (resumen)

* **Stripe** — 1,4% + 0,25 € · alta 24-48h · integración top · UX top.
* **Redsys** — 0,5-0,9% + cuota TPV · alta lenta · integración regular · UX regular.
* **Bizum (vía Stripe)** — 1,5% · alta automática · UX top en móvil España.
* **PayPal** — 3,4% + 0,35 € · alta 24h · integración buena · UX regular.

## La combinación que recomendamos en Latech

Para 90% de las pymes españolas con e-commerce o servicios online, esta combinación gana:

* **Stripe como motor principal.** Tarjeta, Apple Pay, Google Pay, suscripciones.
* **Bizum activado en Stripe.** Para conversión doméstica.
* **PayPal solo si el público lo pide.** Como opción secundaria.
* **Redsys** únicamente cuando tu banco te ofrezca condiciones que compensan la peor UX.

¿Por qué? Porque **lo que importa no es solo la comisión, es ingreso × conversión − coste**. Y en esa ecuación, Stripe + Bizum suele ganar. Más sobre Stripe en concreto en nuestra [guía completa de Stripe para empresas](/blog/stripe-empresas-guia-pagos-online).

## Conclusión

No hay "la mejor pasarela en abstracto". Hay la mejor para tu modelo de negocio. **Pero la combinación Stripe + Bizum cubre 9 de cada 10 casos** en España y es lo que ofrecemos por defecto en las tiendas que montamos.

¿Te ayudamos a configurar pagos online sin perder ventas? [Hablemos](https://wa.me/34684739091).`,
    },
    {
      slug: 'seo-tienda-online-ecommerce-paso-a-paso',
      title: 'SEO para tiendas online: cómo posicionar un e-commerce paso a paso',
      category: 'SEO',
      excerpt: 'Arquitectura, fichas de producto, schema, contenido, enlaces y velocidad. Guía completa para posicionar una tienda online en Google en 2026.',
      cover: '/og/post-12.svg',
      readingMinutes: 10,
      publishedAt: new Date('2026-04-18T10:00:00Z'),
      content: `## Por qué el SEO de un e-commerce es diferente

Posicionar una web corporativa de cinco páginas y posicionar una tienda online con 800 referencias **no se parece en nada**. La diferencia clave: en un e-commerce hay tres tipos de página que compiten por intenciones distintas, y cada una necesita su propio tratamiento.

* **Categorías y subcategorías** → intención comparativa ("zapatillas running mujer").
* **Fichas de producto** → intención transaccional ("Nike Pegasus 41 talla 38").
* **Blog** → intención informacional ("cómo elegir zapatilla para correr").

Confundir las tres es la principal razón por la que muchos shops no posicionan: ponen artículos en el blog optimizados para palabras transaccionales, o categorías sin contenido. Vamos al orden correcto.

## Arquitectura: la jerarquía categoría → subcategoría → producto

Todo empieza por la **arquitectura de URLs**. Reglas:

1. **Profundidad máxima 3 clics** desde la home. Cualquier producto a más de 3 clics, Google lo descubre tarde y los usuarios no lo encuentran.
2. **URLs limpias y semánticas**. \`/zapatillas-running-mujer/nike-pegasus-41\` mejor que \`/p?id=8473\`.
3. **Breadcrumbs visibles y con schema BreadcrumbList**. Refuerzan jerarquía y mejoran CTR.
4. **Una URL canonical por contenido**. Filtros que generan duplicados → \`rel="canonical"\` apuntando a la categoría madre.
5. **Categorías indexables, filtros faceted no** (regla general). Solo abre a indexación los filtros que tienen volumen real de búsqueda.

## Fichas de producto que posicionan (plantilla copiable)

Una buena ficha tiene 8 bloques. Faltarte uno te tira posiciones:

1. **Título H1** = nombre de producto + atributo clave (color/talla/material).
2. **Galería** con mínimo 4 fotos (más vídeo si vendes algo "en uso").
3. **Descripción larga, original, de 300-600 palabras**. Nada de copiar la del fabricante.
4. **Especificaciones técnicas** estructuradas en lista o tabla.
5. **Preguntas frecuentes** con 4-6 entradas (schema FAQPage opcional).
6. **Reviews de clientes** reales (schema AggregateRating).
7. **Productos relacionados** (cross-selling y enlazado interno).
8. **CTA y disponibilidad** clara: stock, envío, plazo.

> **Regla de oro:** si la descripción de tu ficha es la misma que tienen otras 200 tiendas, **Google la ignora**. Reescribe.

## Schema Product, Offer, Review y BreadcrumbList

Implementar datos estructurados no es opcional en e-commerce. Son los que disparan los **rich snippets** (precio, stock, estrellas) en Google y suben CTR un 20-30%.

Mínimo imprescindible por ficha:

* \`Product\` con nombre, imagen, descripción, marca y SKU.
* \`Offer\` con precio, moneda, disponibilidad (\`InStock\` / \`OutOfStock\`) y URL.
* \`AggregateRating\` con valoración media y número de reviews (si existen).
* \`BreadcrumbList\` con la jerarquía completa.

Para categorías: \`CollectionPage\` + \`BreadcrumbList\`.

Validar con [Schema Markup Validator](https://validator.schema.org) y con la herramienta de pruebas de resultados enriquecidos de Google.

## Contenido transaccional vs informacional (blog del shop)

El blog de un e-commerce **no sirve para vender directo**. Sirve para **capturar intenciones informacionales y empujarlas al funnel**.

Estructura típica:

* **Posts informacionales** ("cómo elegir X", "guía de talla Y", "diferencias entre A y B").
* **Cada post enlaza a 2-3 categorías o productos** relacionados.
* **Lead magnet** (descuento, guía PDF) para capturar email.

Ejemplo: si vendes café, un post "Cómo dosificar café para una V60" lleva a la categoría \`/molinillos\` y al producto \`Hario V60\`. Cierras la venta más adelante con email marketing.

## Velocidad y Core Web Vitals: factor multiplicador

En e-commerce, **una mejora de 1 segundo en LCP suele subir conversión 5-10%**. Y posicionas más en móvil. Es un dos por uno.

Quick wins:

* Imágenes en WebP/AVIF + lazy load + dimensiones explícitas.
* CDN europeo (Vercel, Cloudflare).
* Renderizado en servidor (SSG / ISR / SSR) para listados y fichas.
* Eliminar plugins innecesarios. Las tiendas con 25 plugins WooCommerce son el manual de cómo no hacer SEO.

Más detalle en nuestra [guía de Core Web Vitals](/blog/core-web-vitals-velocidad-web-ventas).

## Errores que penalizan tiendas

❌ **Productos descatalogados con 404**. El histórico de enlaces que apuntan a esas URLs se pierde. Mejor: redirección 301 a la categoría madre o variante actual.

❌ **Filtros que generan miles de URLs indexadas**. Talla × color × marca → explosión combinatoria que Google ve como contenido duplicado. Bloquea con \`robots\` o canonical.

❌ **Descripciones copiadas del fabricante**. Penalización por contenido duplicado. Reescribe siempre.

❌ **Mismo title tag en todas las fichas** ("Comprar [producto] - Tu Tienda"). Cada ficha necesita title único.

❌ **No tener sitemap.xml dinámico**. Google necesita pista de qué productos están vivos.

❌ **No optimizar imágenes con \`alt\` descriptivo**. Pierdes tráfico de búsquedas en Google Imágenes (15-20% del total en moda).

❌ **No medir nada**. Sin Search Console + Analytics + Tag Manager bien configurados, posicionar es a ciegas.

## Plan de 90 días

**Mes 1 — Cimientos técnicos:**

* Auditoría con Screaming Frog. Listar errores 404, redirecciones encadenadas, duplicados.
* Implementar arquitectura limpia y breadcrumbs.
* Schema Product + Offer + AggregateRating + BreadcrumbList en todas las fichas.
* Optimización de Core Web Vitals.

**Mes 2 — Contenido y enlazado:**

* Reescribir descripciones de las **50 fichas más visitadas**.
* Crear contenido para las **5 categorías top** (300-500 palabras introductorias en cada una).
* Lanzar blog con 6-8 posts informacionales clave.
* Enlazado interno: blog → categorías → fichas.

**Mes 3 — Autoridad y conversión:**

* Conseguir 5-10 backlinks de calidad (medios, blogs sectoriales, influencers).
* Implementar reviews automáticas (post-compra → email/WhatsApp).
* A/B test de fichas con mejor CTR en SERP.
* Auditoría final y plan de meses 4-6.

A los 90 días, en una tienda mediana, deberías ver **+30-50% de tráfico orgánico** y mejora notable en posiciones para tus categorías clave.

## Conclusión

El SEO para e-commerce no es magia. Es **arquitectura limpia, schema serio, contenido único y velocidad de competición**. Quien lo trata como afterthought, sigue dependiendo de Ads para vender. Quien lo monta bien, **construye un activo que vende solo**.

Más contexto local en nuestra [guía de SEO local en Badajoz](/blog/seo-local-badajoz) y comparativa de [tienda propia vs marketplace](/blog/tienda-online-vs-marketplace).

¿Quieres que auditemos tu tienda? [Escríbenos](https://wa.me/34684739091).`,
    },
    {
      slug: 'agente-ia-voz-vs-chatbot',
      title: 'Agente de IA por voz vs chatbot: ¿cuál necesita realmente tu negocio?',
      category: 'IA',
      excerpt: 'Agente de voz, chatbot de texto o ambos. Casos donde cada uno gana, costes mensuales y cómo decidir según tu volumen y tipo de cliente.',
      cover: '/og/post-13.svg',
      readingMinutes: 7,
      publishedAt: new Date('2026-04-25T10:00:00Z'),
      content: `## La diferencia que casi nadie explica bien

"Quiero un asistente de IA para mi negocio". Esa frase puede significar cosas muy distintas, y elegir mal cuesta tiempo y dinero. Hay dos arquitecturas separadas que la gente mete en el mismo saco:

* **Agente de IA por voz.** Atiende llamadas. Habla en tiempo real con un cliente humano. Necesita latencia bajísima, voz natural, comprensión auditiva.
* **Chatbot de texto.** Atiende mensajes (web, WhatsApp, Instagram). El cliente escribe; el bot responde. Sin presión de tiempo real estricto.

No son la misma tecnología, ni cuestan lo mismo, ni resuelven los mismos problemas. Vamos al criterio.

## Cuándo gana el chatbot de texto

✅ **Tu cliente prefiere escribir.** Demografía joven, B2B, cualquier sector donde el WhatsApp ya es el canal principal.

✅ **Las consultas son largas o detalladas.** Catálogos, pedidos con muchas variables, documentación.

✅ **Necesitas adjuntar archivos.** Imágenes, PDFs, links. La voz no los soporta bien.

✅ **El volumen es alto pero asíncrono.** 500 mensajes al día que no exigen respuesta en 5 segundos.

✅ **Coste por interacción muy bajo.** Un chatbot LLM cuesta céntimos por conversación. Un agente de voz, varias veces más.

**Casos típicos:** e-commerce con dudas de talla, soporte SaaS, FAQ legal de un despacho, servicio al cliente post-venta.

## Cuándo gana el agente de voz

✅ **Tu cliente prefiere llamar.** Hostelería, talleres, inmobiliarias, salud, +50 años.

✅ **La consulta es corta y necesita resolución inmediata.** Reservar mesa, agendar cita, comprobar disponibilidad.

✅ **No quieres perder llamadas en horario fuera de oficina.** Cuando el negocio está cerrado, tu agente sigue.

✅ **Tienes picos de llamadas simultáneas.** El equipo humano coge 1-2 a la vez; el agente, 20.

✅ **Multilingüe sin contratar plantilla extra.** Eventos, turismo, sectores internacionales.

**Casos típicos:** restaurantes, peluquerías, clínicas, talleres, despachos profesionales con consulta inicial.

## Cuándo conviene tener los dos

La mayoría de negocios maduros acaban con **ambos**, y tiene sentido cuando:

* Tienes **canal telefónico fuerte** (clientes que llaman) **y canal digital fuerte** (clientes que escriben).
* El **mismo cerebro** (CRM, base de datos, knowledge base) alimenta los dos.
* Quieres **trazabilidad omnicanal**: la conversación empieza en WhatsApp, sigue por teléfono y se cierra en email — todo unificado.

Aquí n8n y un buen orquestador de IA hacen la magia: un único stack, dos interfaces.

## Coste real al mes (con horquillas)

Para una pyme media en España (~1.500 conversaciones/mes):

| Tipo | Coste mensual |
|---|---|
| Chatbot de texto + LLM (web + WhatsApp) | **80-200 €/mes** |
| Agente de voz IA (1.500 minutos, voz premium) | **250-450 €/mes** |
| Stack omnicanal (voz + texto + n8n + CRM) | **400-800 €/mes** |

Comparado con coste humano:

* **Recepcionista part-time:** ~1.200 €/mes (20h/semana, sin festivos ni vacaciones cubiertos).
* **Agente full-time atención al cliente:** 1.800-2.400 €/mes.

**El ROI suele aparecer al primer mes** si la implantación está bien hecha.

## Cómo medir el ROI en 30 días

No lances "para ver qué tal". Define KPIs antes:

1. **Llamadas recibidas / contestadas / perdidas** (línea base).
2. **Mensajes web/WhatsApp recibidos / contestados < 5 minutos**.
3. **Tasa de conversión de consulta a venta o cita.**
4. **Coste medio por interacción** humano vs IA.
5. **Reseñas / NPS** después de la implantación.

A los 30 días, comparas. Si no estás superando la base humana en al menos uno de los KPIs, hay algo mal montado. Itera.

## Errores que hunden el proyecto

❌ **Usar voz robotizada de los 2010.** Los clientes cuelgan en 5 segundos. Invierte en TTS moderno (ElevenLabs, Cartesia).

❌ **No alimentar al agente con tu información real.** Sin tu catálogo, horarios, FAQs y tono, da respuestas genéricas.

❌ **No prever la entrega a humano.** El agente debe saber detectar "lo necesito hablar con alguien" y transferir con el contexto.

❌ **Confundir un chatbot con un agente con tools.** Un chatbot moderno **ejecuta acciones** (consulta calendar, reserva mesa, genera enlace de pago). Si solo "habla", se quedó corto.

❌ **Implantar sin métricas.** Sin medir, no puedes mejorar ni justificar el coste.

## Conclusión

La regla simple: **si tu cliente llama, agente de voz. Si escribe, chatbot. Si hace ambos, stack omnicanal.** Lo que no funciona es montar el que no es por copiar a otro.

Y un detalle que los proveedores baratos no cuentan: **un agente bueno se sigue afinando los primeros 3 meses**. La IA aprende de las llamadas reales, los prompts se ajustan, las integraciones se pulen. Quien venda "esto se entrega y funciona perfecto desde el día 1" miente.

¿Quieres una demo real de un agente IA, voz o chat? [Escúchalo aquí](/tienda/agente-ia) o [escríbenos por WhatsApp](https://wa.me/34684739091).`,
    },
    {
      slug: 'mantenimiento-web-inversion',
      title: 'Mantenimiento web: por qué pagar cada mes no es un gasto, es una inversión',
      category: 'Diseño Web',
      excerpt: 'Qué incluye un buen mantenimiento web, cuánto cuesta una caída, qué pasa si no actualizas y por qué el modelo mensual sin permanencia gana al pago único.',
      cover: '/og/post-14.svg',
      readingMinutes: 7,
      publishedAt: new Date('2026-05-02T10:00:00Z'),
      content: `## Lo que cuesta una web caída 24h (cifras reales)

Si tu web genera 50 visitas al día y el 2% acaban en presupuesto o venta, una caída de 24 horas son **1 lead perdido directo + posicionamiento dañado + confianza erosionada**. Para un e-commerce mediano, una caída de un día equivale a **600-2.000 € de venta perdida** sin contar el daño SEO.

Pero el dato realmente incómodo no es la caída — es **lo que pasa cuando "no se cae" pero está rota a medias**: formulario que no envía, pago que falla en móvil, certificado SSL caducado, plugin que rompe el carrito en Safari. Esos errores **no los notas tú**: los nota el cliente que se va sin avisar.

**Una web sin mantenimiento es una web sangrando ingresos en silencio.**

## Qué incluye un mantenimiento serio (8 puntos)

No todos los "mantenimientos" son iguales. Lo que **sí** debe incluir:

1. **Backups diarios automáticos** con retención mínima 30 días, en ubicación distinta al hosting.
2. **Actualizaciones de dependencias y CMS**, probadas en staging antes de producción.
3. **Monitorización 24/7** (uptime + Core Web Vitals) con alerta inmediata.
4. **Certificado SSL renovado y verificado** mensualmente.
5. **Seguridad activa**: WAF, escaneo de malware, hardening, mitigación de bots.
6. **Cambios menores incluidos**: textos, imágenes, ajustes pequeños — sin presupuestar cada vez.
7. **Reporte mensual** con métricas reales (tráfico, velocidad, incidencias).
8. **Soporte humano accesible** vía WhatsApp/email con SLA claro.

Si tu mantenimiento actual es "te haré cosas cuando las pidas", no es mantenimiento — es atención on-demand mal pagada.

## Pago único vs cuota mensual: la mentira del "ahorro"

El modelo viejo: te entregan la web y "ya es tuya". Cuando algo falla, te cobran por horas.

**Trampa real:** una web sin mantenimiento se degrada en 6-18 meses. Plugins desactualizados, vulnerabilidades, fuentes que cargan mal, certificados caducados, navegadores que dejan de soportar X. Cuando pides ayuda, el coste por hora compensa con creces lo que habrías pagado en mensualidad.

Y lo peor: **mientras tanto, has estado perdiendo clientes** sin enterarte.

Compara honestamente:

* **Pago único + arreglos esporádicos:** 1.500 € iniciales + 60 € hora × ~8 horas/año = **~1.980 €/año** y web siempre desactualizada.
* **Cuota mensual modelo Latech:** 60 € × 12 = **720 €/año** + cambios incluidos + monitorización 24/7 + actualización constante.

El modelo mensual no es más caro — es **menos caro y más seguro**.

## Sin permanencia, sin sustos: el modelo Latech

Aquí está la pregunta clave: **si el modelo mensual es tan bueno, ¿por qué necesitan los proveedores atarte 12-24 meses?**

Respuesta: porque saben que su producto no aguanta una baja voluntaria del cliente.

Latech opera al revés. **Sin permanencia. Te quedas porque el servicio funciona, no porque firmaste un contrato.**

Si en algún mes no estás contento, te das de baja, te llevas el dominio, el código y el hosting. Se acabó. Esto es lo que un cliente serio espera. Y, paradójicamente, **es lo que hace que casi nadie se vaya** — la libertad genera fidelidad real.

## Errores que ves cuando alguien no mantiene su web

❌ **Plugins WordPress de 2019** con vulnerabilidades públicas conocidas. Es como dejar la puerta abierta.

❌ **PHP 7.4 o anterior** todavía corriendo. Sin soporte de seguridad, dispara latencia y rompe librerías modernas.

❌ **Imágenes pesadísimas** subidas tal cual desde el móvil. La home pesa 12 MB.

❌ **Formulario de contacto que no llega a nadie** porque el SMTP cambió hace meses.

❌ **Certificado SSL caducado** y el navegador muestra "No seguro". Adiós conversiones.

❌ **404 acumulados** de URLs antiguas que nunca redirigieron.

❌ **Sin backup reciente**. Cuando pasa lo malo, no hay recuperación posible.

Si reconoces tres o más, **estás operando con riesgo significativo**.

## Checklist mensual del mantenimiento

Esto es lo que hacemos cada mes en Latech (y deberías exigir a cualquier proveedor):

* ✅ Verificar backups íntegros (restore test ocasional).
* ✅ Aplicar actualizaciones de seguridad probadas en staging.
* ✅ Revisar logs y alertas: errores 5xx, picos anómalos, intentos de intrusión.
* ✅ Auditoría de Core Web Vitals + plan de optimización si baja.
* ✅ Comprobar todos los formularios y CTAs principales.
* ✅ Validar pasarela de pago si es e-commerce.
* ✅ Renovar certificados SSL (automatizado pero verificado).
* ✅ Reporte al cliente: lo hecho, lo medido, lo pendiente.

## Conclusión

Una web sin mantenimiento no es "una web más barata". Es un **activo digital sin garantía**, que se degrada solo y te deja vulnerable cuando peor te viene.

Pagar 60-120 € al mes por mantenimiento profesional **es uno de los gastos con mejor ROI silencioso** que tiene una pyme. Punto.

Si tu web está ahora mismo sin mantenimiento profesional, **el momento de moverse es antes del próximo problema, no después**. ¿Te ayudamos? [Escríbenos](https://wa.me/34684739091).`,
    },
    {
      slug: 'diseno-web-clinicas-despachos-consultas',
      title: 'Diseño web para clínicas, despachos y consultas: confianza desde el primer clic',
      category: 'Diseño Web',
      excerpt: 'Cómo diseñar una web que transmita autoridad para clínicas, abogados, fisioterapeutas y consultorías. Estructura, contenido, SEO y RGPD.',
      cover: '/og/post-15.svg',
      readingMinutes: 8,
      publishedAt: new Date('2026-05-09T10:00:00Z'),
      content: `## La paradoja de los servicios profesionales: cuanto más serio, más vendes

En productos de consumo, el diseño "vibrante" funciona. Para servicios profesionales — clínicas, despachos, consultorías — pasa lo contrario. **El cliente no busca la web más llamativa. Busca la que más confianza transmite.**

Y la confianza visual es muy concreta:

* Espacios amplios, sin ruido.
* Tipografía sobria, legible.
* Colores claros y un solo acento.
* Foto real del equipo, no stock.
* Información relevante visible sin scroll infinito.

Una web "diseñada para sectores de confianza" no es la más impresionante en Behance. Es **la que hace que el visitante deje de comparar y coja el teléfono**.

## Las 6 secciones que no pueden faltar

### 1. Especialidades / áreas de práctica

Una rejilla clara con cada área. Cada una con su página dedicada (clave para SEO). Ejemplo, despacho de abogados:

* Civil
* Mercantil
* Laboral
* Familia
* Penal económico

Cada subpágina debe tener su propio H1, descripción y casos. **Sin esto, posicionas para "abogado" en abstracto y no para tu especialidad real.**

### 2. Equipo con foto y bio real

El elemento que más sube conversión en sectores profesionales. **Foto profesional + nombre + colegiado/experiencia + bio breve**.

Detalles que importan:

* Foto natural, fondo neutro, vestuario coherente.
* Nada de stock — se nota a la legua.
* Si hay número de colegiado, ponlo. Es señal de credibilidad.

### 3. Casos / experiencia (sin romper confidencialidad)

No hace falta dar nombres. Pero sí mostrar tipología:

* "Litigio mercantil para empresa familiar 8M€ — desestimación de la demanda contraria."
* "Acompañamiento fiscal a clínica con 3 sedes y 14 trabajadores."

**Nada vende como demostrar resultados sin romper el secreto profesional.**

### 4. Reserva online (cita previa)

Aquí está la diferencia entre una web del 2014 y una del 2026. **Cita previa online**, conectada a tu calendario, con recordatorio automático por email/SMS.

Ventajas:

* Eliminar fricción de "llamar para reservar".
* Reducir no-shows con recordatorios.
* Capturar reservas fuera de horario (40-60% del total).
* Liberar a recepción de la gestión telefónica básica.

### 5. Aviso legal sectorial + RGPD reforzado

En sanidad, abogacía, asesoría: **el aviso legal y la política de privacidad no son cláusulas estándar copy-paste**. Hay normativa específica:

* **Sanidad:** LOPDGDD, RGPD, Ley 14/2007 de Investigación Biomédica si aplica.
* **Abogacía:** secreto profesional reforzado, datos sensibles.
* **Cualquiera:** LSSI-CE, política de cookies con consentimiento explícito, registro de actividades de tratamiento.

**Una clínica con aviso legal genérico arriesga sanción de la AEPD**. Y se ve.

### 6. Contacto con teléfono visible

El teléfono **siempre arriba a la derecha**, con icono y formato click-to-call en móvil. Para muchos clientes mayores, es el canal preferido y no quieres que tengan que buscarlo.

Acompaña con dirección clara, horarios y mapa Google Maps embebido.

## SEO local específico (clínica + ciudad + especialidad)

Las búsquedas en este sector son hiperlocales:

* "fisioterapeuta badajoz centro"
* "abogado divorcio extremadura"
* "clínica dental urgencia badajoz domingo"

La estrategia que gana:

1. **Página por especialidad + ciudad**. \`/fisioterapia-badajoz\`, \`/clinica-dental-badajoz\`, \`/abogado-mercantil-badajoz\`.
2. **Schema MedicalBusiness, LegalService o LocalBusiness** según corresponda.
3. **Google Business Profile optimizado** (foto del equipo, posts semanales, atributos).
4. **Reviews sistemáticas** post-consulta (con permiso explícito y protegidas por RGPD).
5. **Backlinks locales**: prensa local, asociaciones profesionales, colegios.

Más detalle en nuestra [guía de SEO local en Badajoz](/blog/seo-local-badajoz).

## Cumplimiento: LOPD, RGPD sanitario, LSSI

Repasemos lo no negociable:

* **Banner de cookies** con configuración granular (no botón "Aceptar todo" como única opción).
* **Política de privacidad** específica al tipo de datos que tratas.
* **Registro de actividades de tratamiento** (interno, pero accesible).
* **Cifrado en formularios** (HTTPS obligatorio + campos sensibles tratados en servidor seguro).
* **Anonimización de testimonios** y casos.
* **DPO designado** si tratas datos sensibles a escala.
* **Aviso legal con DNI/CIF, colegiado y datos profesionales** según ley.

En clínicas, **datos de salud = categoría especial**. Sanción por filtración va de 20.000 € a 600.000 € + cierre temporal. **Esto no es decoración, es supervivencia.**

## Errores típicos en webs de profesionales

❌ **Foto stock de "doctor sonriente con bata".** El visitante lo huele en 2 segundos.

❌ **Aviso legal copiado de plantilla genérica**. Ilegal y arriesgado.

❌ **Sin formulario seguro**. Datos enviados por email en claro = brecha de seguridad.

❌ **No tener cita online en 2026.** El cliente joven directamente se va a la competencia que sí la tiene.

❌ **Web no responsive**. Más del 70% del tráfico de búsqueda local es móvil. Si en móvil se ve mal, se va.

❌ **Mucho "nosotros" y poco "tú".** Al cliente le importa su problema, no tu historia. Habla de su dolor primero.

## Plan de lanzamiento en 30 días

**Semana 1 — Estrategia:**

* Definir áreas/especialidades y su página dedicada.
* Sesión de fotos del equipo (1 día con fotógrafo profesional).
* Auditoría de aviso legal con asesoría legal.

**Semana 2 — Construcción:**

* Wireframe y diseño en stack moderno (Next.js + Tailwind).
* Implementar reserva online con calendario.
* Setup RGPD: cookies, política, registro de tratamiento.

**Semana 3 — Contenido y SEO:**

* Bio del equipo + casos representativos anonimizados.
* Schema markup específico del sector.
* Optimización Core Web Vitals.

**Semana 4 — Lanzamiento:**

* Google Business Profile alineado con la web.
* Sistema de captura de reseñas post-consulta.
* Analytics + Search Console + monitorización.

A los 30 días, web operativa. A los 90, **primeras posiciones para tus búsquedas locales clave**.

## Conclusión

Una web para clínica, despacho o consulta no es un ejercicio de creatividad. Es un **ejercicio de credibilidad**. Cuanto más sobria, mejor traducida normativamente, más conectada con la operativa real, **más vende**. Es así.

Si quieres que montemos la tuya, [hablamos por WhatsApp](https://wa.me/34684739091).`,
    },
    {
      slug: 'verifactu-obligatorio-2027-guia',
      title: 'Verifactu: qué es, cuándo es obligatorio y cómo lo dejamos resuelto en tu negocio',
      category: 'Tiendas Online',
      excerpt: 'Verifactu cambia cómo factura toda España: registros inalterables, QR obligatorio y plazos que llegan en 2027. Te explicamos qué es, a quién obliga, qué multas hay y cómo lo gestionamos por ti para que no tengas que preocuparte.',
      cover: '/og/post-16.svg',
      readingMinutes: 9,
      publishedAt: new Date('2026-05-28T10:00:00Z'),
      content: `## Qué es Verifactu (y por qué te afecta aunque no lo hayas pedido)

Verifactu es el nuevo sistema con el que Hacienda quiere acabar con el fraude en la facturación. La idea es simple: que ninguna factura se pueda borrar ni manipular después de emitirse. Cada factura que generes con un programa informático tiene que quedar registrada de forma íntegra, trazable e inalterable, encadenada con la anterior mediante una huella digital.

No es una recomendación ni una moda. Es un reglamento (el **Real Decreto 1007/2023**, modificado por el RD 254/2025) que desarrolla la Ley Antifraude de 2021. Y afecta a prácticamente cualquier empresario o autónomo que emita facturas con un software, no con un talonario de papel.

Lo importante: **no tienes que entender la letra pequeña, pero sí asegurarte de que tu software cumple**. Si emites facturas desde tu tienda online, tu TPV, tu programa de gestión o una hoja de cálculo, esto te toca de lleno.

## A quién obliga exactamente (autónomos, sociedades y quién queda fuera)

La norma alcanza a todos los empresarios y profesionales que usen un programa o sistema informático para facturar:

- **Autónomos** en estimación directa que emitan facturas con cualquier software.
- **Sociedades** y demás personas jurídicas sujetas al Impuesto sobre Sociedades.
- **Entidades en atribución de rentas** y no residentes con establecimiento permanente en España.

¿Y quién queda fuera? Principalmente, **quien ya está en el SII** (el Suministro Inmediato de Información del IVA, obligatorio para grandes empresas y grupos de IVA), que tiene su propio sistema y queda exento del reglamento Verifactu. También quedan al margen quienes facturan exclusivamente en papel, aunque a estas alturas son una rareza.

Si tienes una tienda online, una pyme o eres autónomo y facturas con software, la respuesta corta es: **sí, te obliga**.

## Las fechas que de verdad importan: los plazos hasta 2027

Aquí ha habido movimiento, así que olvida lo que leíste hace un año. Tras la última prórroga, el calendario vigente es este:

- **29 de julio de 2025** — Los fabricantes y desarrolladores de software de facturación solo pueden vender o licenciar programas ya adaptados a Verifactu. Es decir, el software nuevo del mercado ya debería cumplir.
- **1 de enero de 2027** — Fecha límite para que las **sociedades** (contribuyentes del Impuesto sobre Sociedades) tengan sus sistemas adaptados.
- **1 de julio de 2027** — Fecha límite para el **resto de obligados**: autónomos en IRPF, entidades en atribución de rentas y no residentes con establecimiento permanente.

> La entrada en vigor para empresas y autónomos se retrasó a 2027 para permitir una implantación ordenada. Pero el software ya tiene que cumplir desde julio de 2025: el plazo extra es para ti, no para que sigas usando un programa obsoleto.

Traducción práctica: tienes margen, pero el reloj corre. Y cuanto antes lo dejes resuelto, menos prisas y menos riesgo de elegir mal con la fecha encima.

## Qué tiene que cumplir tu facturación para ser Verifactu

Estos son los requisitos técnicos que tu sistema de facturación debe garantizar. No hace falta que los implementes tú, pero conviene que sepas qué estás exigiendo:

- **Integridad e inalterabilidad.** Una vez emitida, la factura no se puede modificar ni borrar sin dejar rastro.
- **Huella o hash encadenado.** Cada registro lleva una huella digital que lo enlaza con el anterior, formando una cadena que delata cualquier manipulación.
- **Trazabilidad y registro de eventos.** El sistema guarda un historial de todo lo que pasa: emisión, anulación, rectificación.
- **Código QR obligatorio** en cada factura, para que cliente y Hacienda puedan verificarla.
- **Leyenda legal** en la factura: la mención "Factura verificable en la Sede electrónica de la AEAT" o "VERI*FACTU" según la modalidad.
- **Firma electrónica** de los registros cuando proceda.
- **Declaración responsable** del fabricante que certifica que el software cumple el reglamento.

Si tu programa actual no hace todo esto, no es Verifactu, por mucho que el comercial te diga lo contrario.

## Las dos formas de cumplir: con envío o sin envío a Hacienda

El reglamento permite dos modalidades, y conviene entender la diferencia:

- **Con remisión automática (la que da nombre al sistema, VERI*FACTU).** El software envía cada registro de facturación a la AEAT en el momento de emitir. A cambio de ese envío, tus obligaciones de conservación se simplifican: Hacienda ya tiene la copia.
- **Sin remisión (no verificable).** El sistema no envía nada en tiempo real, pero debe cumplir requisitos más estrictos de conservación, firma e inalterabilidad, y estar siempre disponible para una inspección.

Para la mayoría de pymes y tiendas online, la modalidad con envío suele ser la más cómoda: menos cosas que custodiar y la tranquilidad de que el registro ya está en Hacienda. Pero la decisión depende de tu caso, y es justo lo que ayudamos a definir.

## Qué pasa si no cumples: las sanciones

Esto no es papel mojado. La Ley Antifraude introdujo un régimen sancionador específico (artículo 201 bis de la Ley General Tributaria):

- **Hasta 50.000 € por ejercicio** para quien use o tenga un sistema de facturación que no cumpla el reglamento. Y es por cada año: dos ejercicios incumpliendo pueden ser 100.000 €.
- **Hasta 150.000 € por ejercicio y tipo de software** para fabricantes y comercializadores que vendan programas no conformes.

La multa al usuario es fija y no depende de que hayas defraudado: basta con usar software inadecuado. Por eso lo barato sale caro si el programa no está homologado.

## Cómo lo gestionamos nosotros (para que tú no tengas que pensar en ello)

Aquí está la parte buena: **Verifactu es un problema técnico, y lo técnico es lo nuestro**. Si trabajas con Latech, no tienes que convertirte en experto en facturación electrónica. Te lo dejamos resuelto de principio a fin:

- **Tu tienda online o tu web nacen Verifactu-ready.** Cuando construimos un e-commerce o un sistema a medida, la facturación se integra ya conforme al reglamento: registros inalterables, huella encadenada, QR y leyenda legal incluidos.
- **Si ya tienes negocio, lo conectamos con software de facturación homologado.** Integramos tu operativa con soluciones certificadas que sí cumplen, sin que tengas que cambiar tu forma de trabajar.
- **Elegimos por ti la modalidad correcta** (con o sin remisión a la AEAT) según tu volumen, tu sector y tus necesidades de conservación.
- **Dejamos todo verificado y documentado:** facturas con QR válido, declaración de conformidad en regla y nada que temer en una inspección.
- **Sin permanencia y con acompañamiento.** Si la norma cambia otra vez —y en esto ha cambiado ya varias veces—, nos encargamos de mantener tu sistema al día.

En resumen: tú facturas con normalidad y nosotros nos aseguramos de que cada factura cumpla la ley. Cero quebraderos de cabeza, cero riesgo de sanción por software inadecuado.

## Conclusión

Verifactu no es el fin del mundo, pero sí es de obligado cumplimiento, con multas serias y plazos que llegan en 2027. La diferencia entre vivirlo como una pesadilla burocrática o como un trámite invisible está en una sola decisión: **con quién montas tu facturación**.

Si quieres que tu tienda online o tu sistema de facturación cumplan Verifactu sin que tengas que entender una sola línea del reglamento, [hablamos por WhatsApp](https://wa.me/34684739091) y lo dejamos resuelto.`,
    },
  ];

  const allPosts: Array<typeof seededPosts[number] & { publishedAt?: Date }> = [
    ...seededPosts,
    ...extraPosts,
  ];

  for (const p of allPosts) {
    const exists = await db.select().from(posts).where(eq(posts.slug, p.slug)).limit(1);
    if (exists.length === 0) {
      let publishedAt: Date;
      if (p.publishedAt) {
        publishedAt = p.publishedAt;
      } else {
        const monthsAgo = Math.floor(Math.random() * 4);
        const daysAgo = Math.floor(Math.random() * 30);
        publishedAt = new Date();
        publishedAt.setMonth(publishedAt.getMonth() - monthsAgo);
        publishedAt.setDate(publishedAt.getDate() - daysAgo);
      }
      await db.insert(posts).values({
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        category: p.category,
        cover: p.cover,
        author: 'Equipo Latech',
        readingMinutes: p.readingMinutes,
        published: true,
        publishedAt,
      });
      console.log(`✅ Post: ${p.slug}`);
    }
  }

  console.log('🎉 Seed completo.');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
