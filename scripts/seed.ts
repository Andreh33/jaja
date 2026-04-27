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

  for (const p of seededPosts) {
    const exists = await db.select().from(posts).where(eq(posts.slug, p.slug)).limit(1);
    if (exists.length === 0) {
      const monthsAgo = Math.floor(Math.random() * 4);
      const daysAgo = Math.floor(Math.random() * 30);
      const publishedAt = new Date();
      publishedAt.setMonth(publishedAt.getMonth() - monthsAgo);
      publishedAt.setDate(publishedAt.getDate() - daysAgo);
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
