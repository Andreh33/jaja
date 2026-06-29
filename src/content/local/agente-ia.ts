import type { LocalLanding } from './types';

// 15 ciudades con contenido único por ciudad (Opus 4.8 + ultrathink, Plan Task 4).
// Cada intro y bodyMarkdown está anclado al tejido de servicios real de la zona.
export const landings: LocalLanding[] = [
  {
    service: 'agente-ia',
    citySlug: 'madrid',
    title: 'Agente de IA en Madrid · 24-48h | Latech',
    description:
      'Agente de IA para empresas de Madrid: atiende llamadas y WhatsApp, agenda citas y reduce llamadas perdidas. En remoto, entrega en 24-48h y sin permanencia.',
    h1: 'Agente de IA para empresas de Madrid',
    intro:
      'En Madrid el teléfono no para: clínicas, despachos y consultoras reciben decenas de llamadas al día y cada una que se queda sin contestar es un cliente que llama al siguiente de la lista. Un agente de IA atiende esas llamadas y los mensajes de WhatsApp cuando tu equipo está ocupado o fuera de horario, filtra urgencias, agenda citas y deja la información lista para tu gente. Lo montamos en remoto desde Extremadura, con entrega en 24-48h y sin permanencia.',
    sectores: [
      { nombre: 'Clínicas y centros médicos', gancho: 'Gestionan reservas y recordatorios de cita sin saturar a recepción ni perder pacientes nuevos.' },
      { nombre: 'Despachos y consultoras', gancho: 'Filtran consultas, cualifican al cliente y agendan reuniones sin interrumpir el trabajo facturable.' },
      { nombre: 'Inmobiliarias', gancho: 'Responden a cada lead de portal al instante y reservan visitas antes que la competencia.' },
      { nombre: 'Servicios con alto volumen de llamadas', gancho: 'Atención al cliente 24/7 que descarga al equipo de las consultas repetitivas.' },
    ],
    faq: [
      { q: '¿El agente puede atender las llamadas y WhatsApp de mis clientes de Madrid si vosotros estáis en remoto?', a: 'Sí. El agente funciona en la nube: contesta el teléfono y los mensajes de tus clientes de Madrid a cualquier hora, sin importar dónde estemos nosotros. Lo configuramos, conectamos tu número y tu WhatsApp, y queda operativo. Las reuniones de puesta en marcha son por videollamada.' },
      { q: '¿Qué pasa con las llamadas que entran fuera de horario o cuando todos están ocupados?', a: 'Esas son justo las que más dinero pierden. El agente las coge igual: informa, agenda la cita o recoge los datos del cliente y te deja el aviso. Ninguna llamada se queda sin respuesta.' },
      { q: '¿El agente suena robótico o el cliente nota que no es una persona?', a: 'Usamos voz natural y respuestas conversacionales. La mayoría de clientes resuelve su gestión sin fricción. Y si la consulta se complica, el agente la deriva a una persona de tu equipo.' },
      { q: '¿Se integra con mi agenda y mis herramientas actuales?', a: 'Sí. Con automatizaciones n8n lo conectamos a tu calendario, tu CRM o tu hoja de reservas para que las citas entren directas, sin doble trabajo.' },
      { q: '¿Hay permanencia?', a: 'No. Sin permanencia y sin cuotas obligatorias. Definimos el alcance y lo que pagas es lo acordado.' },
    ],
    bodyMarkdown: `## Madrid llama mucho, y cada llamada perdida cuesta dinero

En un mercado tan competido como el de Madrid, el cliente que no consigue que le cojan el teléfono no espera: cuelga y prueba con el siguiente. Clínicas, despachos, consultoras e inmobiliarias trabajan con un volumen de contactos que recepción no siempre puede absorber, sobre todo en horas punta, en pausas o fuera de horario. Ahí es donde un [agente de IA](/tienda/agente-ia) marca la diferencia: contesta siempre, a la primera, sin hacer esperar.

### Qué hace un agente de IA por tu negocio

- **Atiende el teléfono y el WhatsApp** cuando tu equipo no puede, sin dejar a nadie en cola.
- **Agenda citas y reservas** directamente en tu calendario, con confirmación y recordatorio.
- **Filtra y cualifica** las consultas: distingue una urgencia de una duda y deriva solo lo que necesita una persona.
- **Responde lo repetitivo** (horarios, precios, ubicación, documentación) las 24 horas.

## Pensado para los sectores que mueven Madrid

Madrid concentra una densidad enorme de servicios profesionales y sanitarios. Una clínica que pierde tres primeras visitas al día por no coger el teléfono pierde pacientes que no vuelven a llamar. Un despacho que tarda en responder a una consulta deja que el cliente contrate al competidor que sí contestó. Y una inmobiliaria que no responde al lead del portal en el primer minuto ve cómo ese contacto se enfría.

El agente trabaja en estos frentes a la vez, sin descansos y sin coste de personal añadido. No sustituye a tu equipo: le quita de encima las tareas repetitivas para que se centren en lo que de verdad aporta valor.

### Automatizaciones a medida con n8n

Más allá de atender, automatizamos el flujo completo. Con n8n conectamos el agente a tu calendario, tu CRM o tu hoja de cálculo de reservas, enviamos confirmaciones por WhatsApp, avisamos a tu equipo de las citas nuevas y registramos cada contacto. El resultado es que la información entra ordenada, sin que nadie tenga que copiar datos a mano.

## La ventaja de trabajar en remoto

No necesitas una agencia con oficina en el centro de Madrid para tener tecnología de primer nivel. Somos un equipo de Extremadura que trabaja para empresas de toda España por videollamada. Eso significa el mismo resultado sin el recargo de una gran estructura, con entrega en 24-48h y sin permanencia. La puesta en marcha es sencilla: una reunión para entender tu negocio, configuramos el agente con tu información y tus procesos, lo conectamos a tu número y a tu WhatsApp, y empieza a trabajar.

## Cómo empezamos

Primero escuchamos cómo entran hoy las llamadas y los mensajes, dónde se pierden clientes y qué consultas se repiten. Con eso diseñamos un agente que hable como tu negocio y resuelva lo que tus clientes preguntan de verdad. Si además quieres reforzar tu presencia online, podemos sumar un [diseño web](/tienda/web) que convierta el tráfico en contactos que el agente atenderá al instante.

Cuéntanos tu caso y te decimos, sin humo, qué puede automatizar un agente de IA en tu empresa y qué no.`,
  },
  {
    service: 'agente-ia',
    citySlug: 'barcelona',
    title: 'Agente de IA en Barcelona · 24-48h | Latech',
    description:
      'Agente de IA para empresas de Barcelona: atiende llamadas y WhatsApp, gestiona reservas y automatiza la atención. En remoto, en 24-48h y sin permanencia.',
    h1: 'Agente de IA para negocios de Barcelona',
    intro:
      'Barcelona vive de un ritmo alto: clínicas estéticas y dentales, restauración, ecommerce y despachos manejan un flujo constante de reservas y consultas, muchas en varios idiomas y a deshora por el turismo. Un agente de IA atiende el teléfono y el WhatsApp cuando tu equipo está al límite, gestiona las reservas y responde lo repetitivo sin dejar a nadie esperando. Lo desarrollamos en remoto desde Extremadura, con entrega en 24-48h y sin permanencia.',
    sectores: [
      { nombre: 'Clínicas estéticas y dentales', gancho: 'Reservan tratamientos y resuelven dudas de precio y disponibilidad sin colapsar recepción.' },
      { nombre: 'Restauración y ocio', gancho: 'Gestionan reservas de mesa y grupos por WhatsApp, incluso en plena hora punta.' },
      { nombre: 'Ecommerce y retail', gancho: 'Resuelven seguimiento de pedidos, cambios y dudas de talla sin saturar al equipo.' },
      { nombre: 'Despachos y servicios profesionales', gancho: 'Cualifican consultas y agendan reuniones mientras el equipo factura.' },
      { nombre: 'Startups y tecnológicas', gancho: 'Atención al cliente escalable que crece sin disparar la plantilla.' },
    ],
    faq: [
      { q: '¿El agente atiende las llamadas y WhatsApp de mis clientes de Barcelona si trabajáis en remoto?', a: 'Sí. El agente vive en la nube y responde el teléfono y los mensajes de tus clientes de Barcelona a cualquier hora, estemos donde estemos. Conectamos tu número y tu WhatsApp, lo configuramos y queda funcionando. Las reuniones son por videollamada.' },
      { q: '¿Puede atender en catalán, castellano y a clientes extranjeros?', a: 'Sí. Configuramos el agente para que entienda y responda en varios idiomas, algo clave en una ciudad con tanto cliente internacional como Barcelona. Detecta el idioma y se adapta.' },
      { q: '¿Sirve para gestionar reservas en un restaurante o una clínica con mucho volumen?', a: 'Para eso destaca. Coge la reserva por teléfono o WhatsApp, comprueba disponibilidad real, la confirma y envía el recordatorio, descargando a tu equipo en las horas de máxima presión.' },
      { q: '¿Se conecta con mi sistema de reservas o mi CRM?', a: 'Sí, con automatizaciones n8n lo integramos con tu agenda, tu motor de reservas o tu CRM para que todo entre sincronizado y sin doble trabajo.' },
      { q: '¿Hay permanencia o cuotas obligatorias?', a: 'No. Sin permanencia. Acordamos el alcance y el precio por adelantado, sin sorpresas.' },
    ],
    bodyMarkdown: `## Barcelona no para, y tu atención tampoco debería

Barcelona combina un tejido de servicios muy intenso con una afluencia turística que dispara las consultas a cualquier hora y en varios idiomas. Una clínica estética que no responde el WhatsApp en el momento pierde la reserva del tratamiento; un restaurante que tiene el teléfono colapsado en plena hora punta pierde mesas; un ecommerce que tarda en contestar una duda de talla pierde el carrito. Un [agente de IA](/tienda/agente-ia) cubre justo esos huecos: contesta siempre, sin colas y sin descansos.

### Qué resuelve en el día a día

- **Gestiona reservas** de mesa, cita o tratamiento por teléfono y WhatsApp, con confirmación automática.
- **Atiende en varios idiomas**, imprescindible con el volumen de cliente internacional de la ciudad.
- **Responde lo repetitivo**: horarios, precios, ubicación, estado del pedido, disponibilidad.
- **Deriva a una persona** solo cuando la consulta lo requiere.

## Anclado a los sectores que definen la ciudad

El peso de la sanidad privada, la estética, la restauración, el comercio y las tecnológicas hace de Barcelona un terreno donde la rapidez de respuesta marca la conversión. En clínicas dentales y estéticas, la primera consulta suele entrar por WhatsApp y se gana o se pierde en minutos. En restauración, las reservas llegan en avalanchas concentradas. En ecommerce, la atención posventa decide si el cliente repite. El agente trabaja en todos esos frentes a la vez, sin coste de personal extra en las horas de pico.

### Automatización completa con n8n

No nos quedamos en contestar. Con n8n conectamos el agente a tu motor de reservas, tu CRM o tu plataforma de ecommerce, lanzamos confirmaciones y recordatorios por WhatsApp, avisamos al equipo de cada reserva y registramos cada contacto para que tu información esté siempre ordenada. Menos tareas manuales, menos errores, más tiempo para tu equipo.

## Remoto, sin el recargo de una gran agencia

Trabajamos para empresas de toda España desde Extremadura, por videollamada. En una ciudad cara como Barcelona, eso se nota: tecnología de primer nivel sin pagar la estructura de una agencia con oficina en pleno centro. Entrega en 24-48h, sin permanencia y con una puesta en marcha sencilla. Te escuchamos, configuramos el agente con tu información y tus procesos, lo conectamos a tu número y a tu WhatsApp, y empieza a atender.

## Empezamos por tus puntos de fuga

Analizamos cuándo y por qué se te escapan reservas y consultas hoy, y diseñamos un agente que hable como tu negocio. Si quieres además una web que canalice mejor las reservas, podemos montarte una [tienda online](/tienda/online) o un [diseño web](/tienda/web) que trabaje en equipo con el agente.

Escríbenos y te explicamos, con franqueza, qué puede automatizar un agente de IA en tu negocio de Barcelona.`,
  },
  {
    service: 'agente-ia',
    citySlug: 'valencia',
    title: 'Agente de IA en Valencia · 24-48h | Latech',
    description:
      'Agente de IA para empresas de Valencia: atiende llamadas y WhatsApp, gestiona pedidos y citas y automatiza con n8n. En remoto, en 24-48h y sin permanencia.',
    h1: 'Agente de IA para empresas de Valencia',
    intro:
      'Valencia mezcla agroexportación de cítricos, logística de puerto, hostelería y un comercio muy vivo, sectores donde el teléfono y el WhatsApp deciden pedidos, cargas y reservas a todas horas. Un agente de IA atiende esas llamadas y mensajes cuando tu equipo está en faena, recoge pedidos, agenda citas y automatiza la coordinación con n8n. Lo montamos en remoto desde Extremadura, con entrega en 24-48h y sin permanencia.',
    sectores: [
      { nombre: 'Agroalimentario y exportación', gancho: 'Atienden pedidos y consultas de clientes nacionales y de exportación sin parar la actividad del almacén.' },
      { nombre: 'Logística y transporte', gancho: 'Coordinan recogidas, entregas y avisos sin que el teléfono frene la operativa.' },
      { nombre: 'Hostelería y restauración', gancho: 'Gestionan reservas por WhatsApp en las horas de más presión.' },
      { nombre: 'Clínicas y servicios profesionales', gancho: 'Agendan citas y resuelven dudas sin saturar a recepción.' },
      { nombre: 'Comercio y reformas', gancho: 'Recogen peticiones de presupuesto y las cualifican al instante.' },
    ],
    faq: [
      { q: '¿El agente atiende llamadas y WhatsApp de mis clientes de Valencia estando vosotros en remoto?', a: 'Sí. El agente está en la nube y responde el teléfono y los mensajes de tus clientes de Valencia a cualquier hora, sin importar dónde estemos. Conectamos tu número y tu WhatsApp y queda operativo. Todo se coordina por videollamada.' },
      { q: '¿Puede recoger pedidos o peticiones cuando el almacén está en plena faena?', a: 'Sí. El agente coge el pedido o la consulta por teléfono o WhatsApp, registra los datos y avisa a tu equipo, justo cuando nadie puede soltar lo que está haciendo para atender el móvil.' },
      { q: '¿Funciona para reservas de restaurante en hora punta?', a: 'Sí. Atiende varias reservas a la vez, comprueba disponibilidad, confirma y envía recordatorio, sin colas ni llamadas perdidas en los momentos de más presión.' },
      { q: '¿Lo conectáis con mi sistema de gestión?', a: 'Sí. Con automatizaciones n8n lo integramos con tu ERP, tu CRM o tu agenda para que pedidos y citas entren sincronizados, sin copiar datos a mano.' },
      { q: '¿Hay permanencia?', a: 'No. Sin permanencia ni cuotas obligatorias. Acordamos alcance y precio desde el principio.' },
    ],
    bodyMarkdown: `## En Valencia, la actividad no espera al teléfono

El tejido económico valenciano gira en torno a la exportación agroalimentaria, la logística del puerto, la hostelería y un comercio muy activo. En todos ellos pasa lo mismo: cuando entra una llamada o un WhatsApp, el equipo suele estar en faena (cargando, atendiendo mesas, en el taller) y no puede parar para coger el móvil. Esa llamada que se queda sin contestar es un pedido, una reserva o un presupuesto que se va a otro. Un [agente de IA](/tienda/agente-ia) resuelve ese cuello de botella: atiende siempre, sin frenar tu operativa.

### Qué hace por tu negocio

- **Recoge pedidos y consultas** por teléfono y WhatsApp y se los pasa ordenados a tu equipo.
- **Agenda citas y reservas** con confirmación y recordatorio automáticos.
- **Coordina avisos** de recogida, entrega o disponibilidad.
- **Responde lo repetitivo** las 24 horas, también fuera de horario.

## Pensado para los sectores que tiran de Valencia

La exportación de cítricos y producto hortofrutícola vive de la rapidez: un cliente nacional o de fuera que pregunta por disponibilidad necesita respuesta ya. La logística no puede tener la línea bloqueada mientras se cuadran recogidas y entregas. La hostelería concentra reservas en avalanchas. Y el comercio y las reformas pierden presupuestos cuando nadie coge el teléfono. El agente trabaja en todos esos frentes sin descanso y sin sumar plantilla en los picos.

### Automatización con n8n de extremo a extremo

Atender es solo la mitad. Con n8n conectamos el agente a tu ERP, tu CRM o tu agenda para que cada pedido, cita o petición entre directa en tu sistema, con avisos a tu equipo y confirmaciones por WhatsApp. Menos teléfono colgado, menos datos copiados a mano y menos errores en la cadena.

## Remoto, con la misma cercanía

Somos un equipo de Extremadura que trabaja para empresas de toda España por videollamada. Para una pyme valenciana eso significa tecnología de primer nivel sin pagar la estructura de una agencia grande, con entrega en 24-48h y sin permanencia. La puesta en marcha es directa: te escuchamos, configuramos el agente con tu información y tus procesos, lo conectamos a tu número y a tu WhatsApp, y empieza a trabajar.

## Empezamos por donde pierdes clientes

Vemos contigo en qué momentos se te escapan pedidos, reservas o consultas, y diseñamos un agente que hable como tu negocio y resuelva lo que tus clientes de verdad preguntan. Si además quieres una web que recoja mejor esas peticiones, podemos sumar un [diseño web](/tienda/web) que trabaje en equipo con el agente.

Cuéntanos tu caso y te decimos, sin humo, qué puede automatizar un agente de IA en tu empresa de Valencia.`,
  },
  {
    service: 'agente-ia',
    citySlug: 'sevilla',
    title: 'Agente de IA en Sevilla · 24-48h | Latech',
    description:
      'Agente de IA para empresas de Sevilla: atiende llamadas y WhatsApp, gestiona reservas y citas y automatiza con n8n. En remoto, en 24-48h y sin permanencia.',
    h1: 'Agente de IA para negocios de Sevilla',
    intro:
      'Sevilla vive del turismo, la hostelería, los eventos y un sector servicios muy estacional: en feria, congresos o puente, las consultas y reservas se disparan y el teléfono se colapsa. Un agente de IA atiende esas llamadas y mensajes de WhatsApp cuando tu equipo no da abasto, gestiona reservas, resuelve dudas y deja la información lista. Lo desarrollamos en remoto desde Extremadura, con entrega en 24-48h y sin permanencia.',
    sectores: [
      { nombre: 'Hostelería y restauración', gancho: 'Gestionan reservas por WhatsApp en feria, puentes y horas punta sin perder mesas.' },
      { nombre: 'Turismo y eventos', gancho: 'Atienden consultas de visitantes, bodas y celebraciones a cualquier hora y en varios idiomas.' },
      { nombre: 'Talleres y servicios técnicos', gancho: 'Recogen avisos y agendan reparaciones sin que el teléfono pare el trabajo.' },
      { nombre: 'Despachos y gestorías', gancho: 'Filtran consultas y agendan citas mientras el equipo factura.' },
      { nombre: 'Comercio local', gancho: 'Resuelven dudas de disponibilidad y horario sin saturar al mostrador.' },
    ],
    faq: [
      { q: '¿El agente atiende las llamadas y WhatsApp de mis clientes de Sevilla aunque trabajéis en remoto?', a: 'Sí. El agente funciona en la nube y responde el teléfono y los mensajes de tus clientes de Sevilla a cualquier hora, sin importar dónde estemos. Conectamos tu número y tu WhatsApp y queda funcionando. Las reuniones son por videollamada.' },
      { q: '¿Aguanta los picos de feria, congresos o puentes?', a: 'Para eso brilla. El agente atiende muchas consultas y reservas a la vez sin colas, justo cuando tu equipo está desbordado y se pierden más clientes.' },
      { q: '¿Puede atender a turistas en otros idiomas?', a: 'Sí. Lo configuramos para responder en varios idiomas, útil con el volumen de visitantes que recibe Sevilla. Detecta el idioma y se adapta.' },
      { q: '¿Se integra con mi agenda o sistema de reservas?', a: 'Sí. Con automatizaciones n8n lo conectamos a tu motor de reservas, tu calendario o tu CRM para que todo entre sincronizado, sin doble trabajo.' },
      { q: '¿Hay permanencia?', a: 'No. Sin permanencia ni cuotas obligatorias. Acordamos alcance y precio desde el principio.' },
    ],
    bodyMarkdown: `## En Sevilla la demanda llega a oleadas

Pocas ciudades tienen una estacionalidad tan marcada como Sevilla. La feria, la Semana Santa, los congresos y los puentes disparan las consultas y reservas en cuestión de días, y el teléfono se colapsa justo cuando más clientes hay en juego. Un restaurante con la línea ocupada pierde mesas; un negocio turístico que no responde el WhatsApp pierde la visita; un taller que no coge el aviso pierde el trabajo. Un [agente de IA](/tienda/agente-ia) absorbe esas oleadas: atiende a varios clientes a la vez, sin colas y sin descansos.

### Qué hace por tu negocio

- **Gestiona reservas** de mesa, cita o servicio por teléfono y WhatsApp, con confirmación automática.
- **Atiende en varios idiomas** a los visitantes que llegan a la ciudad.
- **Recoge avisos y peticiones** de presupuesto y los cualifica al instante.
- **Responde lo repetitivo** (horarios, precios, ubicación, disponibilidad) las 24 horas.

## Anclado a la realidad sevillana

El peso del turismo, la hostelería y los eventos hace que en Sevilla la rapidez de respuesta sea decisiva, sobre todo en temporada alta. Pero también el día a día de talleres, gestorías y comercio se beneficia: son negocios donde el equipo no puede soltar lo que hace para coger el teléfono cada vez que suena. El agente cubre ese hueco sin sumar personal en los picos y sin dejar consultas sin atender en los valles.

### Automatización con n8n

Más allá de contestar, automatizamos el flujo completo. Con n8n conectamos el agente a tu motor de reservas, tu agenda o tu CRM, enviamos confirmaciones y recordatorios por WhatsApp, avisamos a tu equipo de cada reserva o aviso y registramos cada contacto. Así la información entra ordenada y nadie tiene que copiar datos a mano en plena temporada.

## Remoto, con resultado de agencia grande

Trabajamos para empresas de toda España desde Extremadura, por videollamada. Para un negocio sevillano eso significa la misma calidad sin pagar la estructura de una agencia con oficina, con entrega en 24-48h y sin permanencia. La puesta en marcha es sencilla: te escuchamos, configuramos el agente con tu información y tus procesos, lo conectamos a tu número y a tu WhatsApp, y empieza a atender.

## Empezamos antes de la próxima oleada

Analizamos cuándo se te colapsa la atención y dónde pierdes clientes, y preparamos un agente que hable como tu negocio y aguante los picos. Si quieres además una web que canalice mejor las reservas, podemos montarte un [diseño web](/tienda/web) que trabaje junto al agente.

Escríbenos y te contamos, sin humo, qué puede automatizar un agente de IA en tu negocio de Sevilla.`,
  },
  {
    service: 'agente-ia',
    citySlug: 'malaga',
    title: 'Agente de IA en Málaga · 24-48h | Latech',
    description:
      'Agente de IA para empresas de Málaga: atiende llamadas y WhatsApp en varios idiomas, gestiona reservas y automatiza con n8n. En remoto, en 24-48h, sin permanencia.',
    h1: 'Agente de IA para empresas de Málaga',
    intro:
      'Málaga vive del turismo intensivo de la Costa del Sol, una hostelería que no descansa, inmobiliarias con mucho cliente internacional y un polo tecnológico al alza. Aquí las consultas llegan a todas horas y en varios idiomas. Un agente de IA atiende llamadas y WhatsApp cuando tu equipo está al límite, gestiona reservas y responde en el idioma del cliente. Lo montamos en remoto desde Extremadura, con entrega en 24-48h y sin permanencia.',
    sectores: [
      { nombre: 'Hostelería y turismo', gancho: 'Gestionan reservas y consultas de visitantes en varios idiomas, todo el año.' },
      { nombre: 'Inmobiliarias y alquiler vacacional', gancho: 'Responden al instante a leads internacionales y reservan visitas antes que nadie.' },
      { nombre: 'Clínicas privadas y estética', gancho: 'Agendan tratamientos y atienden a pacientes extranjeros sin saturar recepción.' },
      { nombre: 'Tecnológicas y servicios', gancho: 'Atención al cliente escalable que crece sin disparar la plantilla.' },
      { nombre: 'Comercio y ocio', gancho: 'Resuelven dudas de horario, disponibilidad y precio las 24 horas.' },
    ],
    faq: [
      { q: '¿El agente atiende llamadas y WhatsApp de mis clientes de Málaga estando vosotros en remoto?', a: 'Sí. El agente vive en la nube y responde el teléfono y los mensajes de tus clientes de Málaga a cualquier hora, sin importar dónde estemos. Conectamos tu número y tu WhatsApp y queda operativo. Todo se coordina por videollamada.' },
      { q: '¿Puede atender a clientes extranjeros en su idioma?', a: 'Sí, y en Málaga es clave. Configuramos el agente para entender y responder en varios idiomas; detecta el idioma del cliente y se adapta, algo muy útil con el volumen internacional de la Costa del Sol.' },
      { q: '¿Sirve para gestionar reservas con mucho volumen en temporada alta?', a: 'Para eso destaca. Atiende muchas reservas y consultas a la vez, comprueba disponibilidad, confirma y envía recordatorio, sin colas en los meses de máxima afluencia.' },
      { q: '¿Lo conectáis con mi sistema de reservas o CRM?', a: 'Sí. Con automatizaciones n8n lo integramos con tu motor de reservas, tu calendario o tu CRM para que todo entre sincronizado y sin doble trabajo.' },
      { q: '¿Hay permanencia?', a: 'No. Sin permanencia ni cuotas obligatorias. Acordamos alcance y precio desde el principio.' },
    ],
    bodyMarkdown: `## En la Costa del Sol, atender bien es atender en su idioma

Málaga no tiene temporada baja como otras ciudades: el turismo, la hostelería, el alquiler vacacional y la sanidad privada reciben consultas durante todo el año y de clientes de medio mundo. Una inmobiliaria que tarda en responder al lead internacional pierde la operación; un restaurante con la línea colapsada pierde mesas; una clínica que no contesta el WhatsApp pierde el paciente. Y muchas de esas consultas llegan en inglés, alemán o francés. Un [agente de IA](/tienda/agente-ia) responde siempre, al instante y en el idioma del cliente.

### Qué hace por tu negocio

- **Atiende en varios idiomas**, imprescindible con el cliente internacional de la Costa del Sol.
- **Gestiona reservas** de mesa, cita, visita o tratamiento por teléfono y WhatsApp.
- **Responde al lead** de portal o anuncio en el primer minuto, cuando todavía está caliente.
- **Resuelve lo repetitivo** las 24 horas, también de madrugada o en festivo.

## Pensado para el tejido malagueño

El peso del turismo intensivo, la inmobiliaria internacional, la estética y el polo tecnológico hace de Málaga un terreno donde la velocidad y el idioma deciden la conversión. El agente trabaja en todos esos frentes a la vez: coge reservas en temporada alta sin sumar plantilla, atiende a pacientes y compradores extranjeros sin que tu equipo tenga que dominar cinco idiomas, y mantiene la atención abierta cuando tu negocio cierra.

### Automatización con n8n

No nos quedamos en contestar. Con n8n conectamos el agente a tu motor de reservas, tu CRM o tu calendario, lanzamos confirmaciones y recordatorios por WhatsApp, avisamos a tu equipo de cada lead o reserva y registramos cada contacto. La información entra ordenada y tu equipo deja de hacer trabajo manual repetitivo en plena temporada.

## Remoto, sin el recargo de la zona turística

Somos un equipo de Extremadura que trabaja para empresas de toda España por videollamada. En una plaza con costes al alza como Málaga, eso se nota: tecnología de primer nivel sin pagar una estructura cara, con entrega en 24-48h y sin permanencia. La puesta en marcha es directa: te escuchamos, configuramos el agente con tu información y tus idiomas, lo conectamos a tu número y a tu WhatsApp, y empieza a atender.

## Empezamos por tu temporada alta

Vemos contigo cuándo y en qué idiomas se te escapan reservas y leads, y diseñamos un agente que hable como tu negocio. Si quieres además una web multilingüe que canalice mejor las reservas, podemos sumar un [diseño web](/tienda/web) o una [tienda online](/tienda/online) que trabaje junto al agente.

Cuéntanos tu caso y te decimos, sin humo, qué puede automatizar un agente de IA en tu negocio de Málaga.`,
  },
  {
    service: 'agente-ia',
    citySlug: 'zaragoza',
    title: 'Agente de IA en Zaragoza · 24-48h | Latech',
    description:
      'Agente de IA para empresas de Zaragoza: atiende llamadas y WhatsApp, recoge pedidos y citas y automatiza con n8n. En remoto, en 24-48h y sin permanencia.',
    h1: 'Agente de IA para empresas de Zaragoza',
    intro:
      'Zaragoza es nudo logístico de España y tiene un fuerte peso industrial, agroalimentario y de talleres y despachos. Son negocios donde el equipo está en planta o en ruta y no puede parar para coger el teléfono. Un agente de IA atiende esas llamadas y mensajes de WhatsApp, recoge pedidos, agenda citas y coordina avisos con n8n. Lo desarrollamos en remoto desde Extremadura, con entrega en 24-48h y sin permanencia.',
    sectores: [
      { nombre: 'Logística y transporte', gancho: 'Coordinan recogidas, entregas y avisos sin que el teléfono frene la operativa.' },
      { nombre: 'Industria y talleres', gancho: 'Recogen peticiones y agendan trabajos sin parar la actividad de planta o taller.' },
      { nombre: 'Agroalimentario', gancho: 'Atienden pedidos y consultas de distribución sin saturar a la oficina.' },
      { nombre: 'Despachos y gestorías', gancho: 'Filtran consultas y agendan citas mientras el equipo factura.' },
      { nombre: 'Comercio y reformas', gancho: 'Cualifican peticiones de presupuesto al instante.' },
    ],
    faq: [
      { q: '¿El agente atiende llamadas y WhatsApp de mis clientes de Zaragoza estando vosotros en remoto?', a: 'Sí. El agente funciona en la nube y responde el teléfono y los mensajes de tus clientes de Zaragoza a cualquier hora, sin importar dónde estemos. Conectamos tu número y tu WhatsApp y queda operativo. Todo se coordina por videollamada.' },
      { q: '¿Puede recoger pedidos o avisos cuando el equipo está en planta o en ruta?', a: 'Sí. El agente coge el pedido, el aviso o la consulta por teléfono o WhatsApp, registra los datos y avisa a tu equipo, justo cuando nadie puede soltar lo que está haciendo para atender el móvil.' },
      { q: '¿Sirve para coordinar logística sin bloquear la línea?', a: 'Sí. Atiende varias llamadas a la vez, recoge la información de recogida o entrega y la pasa ordenada, sin tener la línea ocupada mientras se cuadra la operativa.' },
      { q: '¿Lo integráis con mi ERP o agenda?', a: 'Sí. Con automatizaciones n8n lo conectamos a tu ERP, tu CRM o tu calendario para que pedidos y citas entren sincronizados, sin copiar datos a mano.' },
      { q: '¿Hay permanencia?', a: 'No. Sin permanencia ni cuotas obligatorias. Acordamos alcance y precio desde el principio.' },
    ],
    bodyMarkdown: `## En Zaragoza, el teléfono compite con la operativa

Como gran nudo logístico y plaza industrial, Zaragoza está llena de negocios donde el equipo está en planta, en el almacén o en ruta, y el teléfono suena mientras nadie puede cogerlo. Cada llamada perdida es un pedido, un aviso o un presupuesto que se va a otro proveedor. Lo mismo pasa en talleres, despachos y comercio: la atención compite con el trabajo que de verdad factura. Un [agente de IA](/tienda/agente-ia) resuelve ese conflicto: coge el teléfono y el WhatsApp siempre, sin frenar tu actividad.

### Qué hace por tu negocio

- **Recoge pedidos, avisos y consultas** por teléfono y WhatsApp y los pasa ordenados a tu equipo.
- **Coordina logística**: recogidas, entregas y avisos sin bloquear la línea.
- **Agenda citas y trabajos** con confirmación y recordatorio automáticos.
- **Responde lo repetitivo** las 24 horas, también fuera de horario.

## Anclado al tejido aragonés

El protagonismo de la logística, la industria y el agroalimentario hace que en Zaragoza la atención telefónica sea un cuello de botella real: nadie quiere parar la cadena para coger el móvil, pero nadie quiere perder el pedido. El agente cubre ese hueco sin sumar personal de oficina y sin dejar que la operativa se resienta. Y en despachos, gestorías y comercio descarga al equipo de las consultas repetitivas para que se centren en lo que aporta valor.

### Automatización con n8n de extremo a extremo

Atender es solo el principio. Con n8n conectamos el agente a tu ERP, tu CRM o tu agenda para que cada pedido, aviso o cita entre directa en tu sistema, con avisos al equipo y confirmaciones por WhatsApp. Menos teléfono colgado, menos datos copiados a mano y menos errores en la cadena de información.

## Remoto, con la misma cercanía

Somos un equipo de Extremadura que trabaja para empresas de toda España por videollamada. Para una empresa zaragozana eso significa tecnología de primer nivel sin pagar la estructura de una agencia grande, con entrega en 24-48h y sin permanencia. La puesta en marcha es directa: te escuchamos, configuramos el agente con tu información y tus procesos, lo conectamos a tu número y a tu WhatsApp, y empieza a trabajar.

## Empezamos por tu cuello de botella

Vemos contigo en qué momentos se te escapan pedidos, avisos o consultas, y diseñamos un agente que hable como tu negocio. Si además quieres una web que recoja mejor esas peticiones, podemos sumar un [diseño web](/tienda/web) que trabaje en equipo con el agente.

Cuéntanos tu caso y te decimos, sin humo, qué puede automatizar un agente de IA en tu empresa de Zaragoza.`,
  },
  {
    service: 'agente-ia',
    citySlug: 'murcia',
    title: 'Agente de IA en Murcia · 24-48h | Latech',
    description:
      'Agente de IA para empresas de Murcia: atiende llamadas y WhatsApp, recoge pedidos y citas y automatiza con n8n. En remoto, en 24-48h y sin permanencia.',
    h1: 'Agente de IA para empresas de Murcia',
    intro:
      'Murcia es la huerta de Europa: agroexportación intensiva, conserveras, logística del frío y comercio mueven un volumen enorme de pedidos y consultas, muchas con clientes de fuera y a deshora. Cuando el equipo está en el campo, el almacén o el taller, el teléfono se queda sin contestar. Un agente de IA atiende llamadas y WhatsApp, recoge pedidos y coordina con n8n. Lo montamos en remoto desde Extremadura, con entrega en 24-48h y sin permanencia.',
    sectores: [
      { nombre: 'Agroalimentario y exportación', gancho: 'Atienden pedidos y consultas de clientes nacionales y de exportación sin parar el almacén.' },
      { nombre: 'Logística y transporte', gancho: 'Coordinan recogidas y entregas de producto perecedero sin bloquear la línea.' },
      { nombre: 'Talleres y servicios técnicos', gancho: 'Recogen avisos y agendan reparaciones sin parar el trabajo.' },
      { nombre: 'Hostelería y comercio', gancho: 'Gestionan reservas y consultas en las horas de más presión.' },
      { nombre: 'Clínicas y despachos', gancho: 'Agendan citas y filtran consultas sin saturar a recepción.' },
    ],
    faq: [
      { q: '¿El agente atiende llamadas y WhatsApp de mis clientes de Murcia estando vosotros en remoto?', a: 'Sí. El agente vive en la nube y responde el teléfono y los mensajes de tus clientes de Murcia a cualquier hora, sin importar dónde estemos. Conectamos tu número y tu WhatsApp y queda operativo. Todo se coordina por videollamada.' },
      { q: '¿Puede recoger pedidos cuando el equipo está en el campo o el almacén?', a: 'Sí. El agente coge el pedido o la consulta por teléfono o WhatsApp, registra los datos y avisa a tu equipo, justo cuando nadie puede parar la faena para atender el móvil.' },
      { q: '¿Atiende a clientes de exportación en otros idiomas?', a: 'Sí. Lo configuramos para responder en varios idiomas, útil para el cliente de exportación del sector hortofrutícola. Detecta el idioma y se adapta.' },
      { q: '¿Lo conectáis con mi sistema de gestión?', a: 'Sí. Con automatizaciones n8n lo integramos con tu ERP, tu CRM o tu agenda para que pedidos y citas entren sincronizados, sin doble trabajo.' },
      { q: '¿Hay permanencia?', a: 'No. Sin permanencia ni cuotas obligatorias. Acordamos alcance y precio desde el principio.' },
    ],
    bodyMarkdown: `## En la huerta de Europa, los pedidos no esperan

La economía murciana gira en torno a la agroexportación intensiva, las conserveras, la logística del frío y un comercio muy activo. Es un sector donde el equipo está en el campo, en el almacén o en ruta, y donde un pedido de producto perecedero no admite demoras. Cuando el teléfono suena y nadie puede cogerlo, ese pedido se va a otro proveedor que sí contestó. Un [agente de IA](/tienda/agente-ia) cierra ese hueco: atiende siempre, sin parar tu faena.

### Qué hace por tu negocio

- **Recoge pedidos y consultas** por teléfono y WhatsApp y los pasa ordenados a tu equipo.
- **Atiende al cliente de exportación** en su idioma.
- **Coordina recogidas y entregas** de producto sin bloquear la línea.
- **Agenda citas y avisos** con confirmación automática.

## Anclado a la realidad murciana

El peso del agroalimentario y la logística hace que en Murcia la atención telefónica sea crítica: el cliente que pregunta por disponibilidad de producto necesita respuesta inmediata, y la línea no puede estar ocupada mientras se cuadran cargas y rutas. El agente cubre ese frente sin sumar personal de oficina y atiende también al cliente internacional sin que tu equipo tenga que dominar idiomas. Y para talleres, clínicas, hostelería y despachos, descarga al equipo de las consultas repetitivas.

### Automatización con n8n de extremo a extremo

Atender es solo la mitad. Con n8n conectamos el agente a tu ERP, tu CRM o tu agenda para que cada pedido, aviso o cita entre directa en tu sistema, con avisos al equipo y confirmaciones por WhatsApp. Menos teléfono colgado, menos datos a mano y menos errores en plena campaña.

## Remoto, con la misma cercanía

Somos un equipo de Extremadura que trabaja para empresas de toda España por videollamada. Para una empresa murciana eso significa tecnología de primer nivel sin pagar la estructura de una agencia grande, con entrega en 24-48h y sin permanencia. La puesta en marcha es directa: te escuchamos, configuramos el agente con tu información y tus procesos, lo conectamos a tu número y a tu WhatsApp, y empieza a trabajar.

## Empezamos por tu campaña

Vemos contigo en qué momentos se te escapan pedidos y consultas, y diseñamos un agente que hable como tu negocio y atienda también al cliente de fuera. Si además quieres una web que recoja mejor esas peticiones, podemos sumar un [diseño web](/tienda/web) que trabaje junto al agente.

Cuéntanos tu caso y te decimos, sin humo, qué puede automatizar un agente de IA en tu empresa de Murcia.`,
  },
  {
    service: 'agente-ia',
    citySlug: 'bilbao',
    title: 'Agente de IA en Bilbao · 24-48h | Latech',
    description:
      'Agente de IA para empresas de Bilbao: atiende llamadas y WhatsApp, agenda citas y automatiza con n8n. En remoto, entrega en 24-48h y sin permanencia.',
    h1: 'Agente de IA para empresas de Bilbao',
    intro:
      'Bilbao combina industria e ingeniería de peso con un sector servicios potente: despachos, clínicas, hostelería de pintxos y comercio. Son negocios B2B y de atención donde el equipo está en proyecto, en consulta o en la barra y el teléfono se queda sin contestar. Un agente de IA atiende llamadas y WhatsApp, filtra consultas, agenda citas y automatiza con n8n. Lo desarrollamos en remoto desde Extremadura, con entrega en 24-48h y sin permanencia.',
    sectores: [
      { nombre: 'Industria e ingeniería', gancho: 'Filtran consultas técnicas y comerciales y agendan reuniones sin parar el proyecto.' },
      { nombre: 'Despachos y consultoras', gancho: 'Cualifican al cliente y agendan citas mientras el equipo factura.' },
      { nombre: 'Clínicas y centros médicos', gancho: 'Gestionan reservas y recordatorios sin saturar a recepción.' },
      { nombre: 'Hostelería y comercio', gancho: 'Gestionan reservas y consultas en las horas de más presión.' },
    ],
    faq: [
      { q: '¿El agente atiende llamadas y WhatsApp de mis clientes de Bilbao estando vosotros en remoto?', a: 'Sí. El agente funciona en la nube y responde el teléfono y los mensajes de tus clientes de Bilbao a cualquier hora, sin importar dónde estemos. Conectamos tu número y tu WhatsApp y queda operativo. Las reuniones son por videollamada.' },
      { q: '¿Puede atender en euskera y castellano?', a: 'Sí. Configuramos el agente para entender y responder en varios idiomas, también en euskera, algo que muchos clientes de Bilbao agradecen. Detecta el idioma y se adapta.' },
      { q: '¿Sirve para un negocio B2B con consultas técnicas?', a: 'Sí. El agente filtra y cualifica la consulta, recoge los datos del cliente y agenda la reunión con la persona adecuada, sin interrumpir el trabajo de proyecto.' },
      { q: '¿Se integra con mi agenda o CRM?', a: 'Sí. Con automatizaciones n8n lo conectamos a tu calendario, tu CRM o tu sistema de citas para que todo entre sincronizado, sin doble trabajo.' },
      { q: '¿Hay permanencia?', a: 'No. Sin permanencia ni cuotas obligatorias. Acordamos alcance y precio desde el principio.' },
    ],
    bodyMarkdown: `## En Bilbao, la atención compite con el proyecto

El tejido bilbaíno mezcla industria e ingeniería de alto valor con un sector servicios muy desarrollado. En el B2B industrial, el equipo está volcado en el proyecto y no puede parar cada vez que entra una consulta comercial o técnica; en despachos y clínicas, la atención repetitiva satura a recepción y resta tiempo facturable. La consecuencia es la misma: llamadas y mensajes que se quedan sin respuesta y clientes que se enfrían. Un [agente de IA](/tienda/agente-ia) atiende siempre, filtra lo importante y deja a tu equipo concentrado.

### Qué hace por tu negocio

- **Filtra y cualifica consultas** B2B, distinguiendo lo urgente de lo que puede esperar.
- **Agenda citas y reuniones** con la persona adecuada y recordatorio automático.
- **Atiende en varios idiomas**, también en euskera.
- **Responde lo repetitivo** las 24 horas, sin saturar a recepción.

## Anclado al tejido vizcaíno

El peso de la industria, la ingeniería y los servicios profesionales hace de Bilbao un terreno donde la atención bien filtrada vale más que la atención masiva: no se trata de coger todas las llamadas a cualquier coste, sino de cualificar cada contacto y agendar solo lo que merece una reunión. El agente hace ese trabajo de primer filtro sin sumar plantilla, y en clínicas, hostelería y comercio descarga al equipo de las consultas repetitivas.

### Automatización con n8n

Más allá de contestar, automatizamos el flujo. Con n8n conectamos el agente a tu calendario, tu CRM o tu sistema de citas, lanzamos confirmaciones y recordatorios por WhatsApp, avisamos a tu equipo de cada lead cualificado y registramos cada contacto. La información entra ordenada y tu equipo deja de hacer trabajo manual repetitivo.

## Remoto, sin el recargo de una gran agencia

Somos un equipo de Extremadura que trabaja para empresas de toda España por videollamada. Para una empresa bilbaína eso significa tecnología de primer nivel sin pagar una estructura cara, con entrega en 24-48h y sin permanencia. La puesta en marcha es directa: te escuchamos, configuramos el agente con tu información y tus procesos, lo conectamos a tu número y a tu WhatsApp, y empieza a trabajar.

## Empezamos por tus consultas

Vemos contigo qué consultas se repiten y cuáles merecen una reunión, y diseñamos un agente que hable como tu negocio y filtre bien. Si además quieres una web que canalice mejor los leads, podemos sumar un [diseño web](/tienda/web) que trabaje junto al agente.

Cuéntanos tu caso y te decimos, sin humo, qué puede automatizar un agente de IA en tu empresa de Bilbao.`,
  },
  {
    service: 'agente-ia',
    citySlug: 'alicante',
    title: 'Agente de IA en Alicante · 24-48h | Latech',
    description:
      'Agente de IA para empresas de Alicante: atiende llamadas y WhatsApp en varios idiomas, gestiona reservas y automatiza con n8n. En remoto, en 24-48h, sin permanencia.',
    h1: 'Agente de IA para negocios de Alicante',
    intro:
      'Alicante vive de la Costa Blanca: turismo, hostelería, inmobiliarias con mucho cliente extranjero y un comercio y una industria del calzado con tradición exportadora. Aquí las consultas llegan a todas horas y en varios idiomas. Un agente de IA atiende llamadas y WhatsApp cuando tu equipo no da abasto, gestiona reservas y responde en el idioma del cliente. Lo montamos en remoto desde Extremadura, con entrega en 24-48h y sin permanencia.',
    sectores: [
      { nombre: 'Hostelería y turismo', gancho: 'Gestionan reservas y consultas de visitantes en varios idiomas durante toda la temporada.' },
      { nombre: 'Inmobiliarias y alquiler vacacional', gancho: 'Responden al instante a leads internacionales y reservan visitas antes que la competencia.' },
      { nombre: 'Comercio y calzado', gancho: 'Atienden pedidos y consultas, también de exportación, sin saturar a la oficina.' },
      { nombre: 'Clínicas y servicios', gancho: 'Agendan citas y atienden a pacientes extranjeros sin colapsar recepción.' },
    ],
    faq: [
      { q: '¿El agente atiende llamadas y WhatsApp de mis clientes de Alicante estando vosotros en remoto?', a: 'Sí. El agente vive en la nube y responde el teléfono y los mensajes de tus clientes de Alicante a cualquier hora, sin importar dónde estemos. Conectamos tu número y tu WhatsApp y queda operativo. Todo se coordina por videollamada.' },
      { q: '¿Puede atender a clientes extranjeros en su idioma?', a: 'Sí, y en la Costa Blanca es esencial. Configuramos el agente para responder en varios idiomas; detecta el idioma del cliente y se adapta, muy útil con el volumen internacional de la zona.' },
      { q: '¿Sirve para reservas con mucho volumen en temporada alta?', a: 'Para eso destaca. Atiende muchas reservas y consultas a la vez, comprueba disponibilidad, confirma y envía recordatorio, sin colas en los meses de máxima afluencia.' },
      { q: '¿Lo conectáis con mi sistema de reservas o CRM?', a: 'Sí. Con automatizaciones n8n lo integramos con tu motor de reservas, tu calendario o tu CRM para que todo entre sincronizado y sin doble trabajo.' },
      { q: '¿Hay permanencia?', a: 'No. Sin permanencia ni cuotas obligatorias. Acordamos alcance y precio desde el principio.' },
    ],
    bodyMarkdown: `## En la Costa Blanca, atender es atender en su idioma

Alicante concentra turismo, hostelería, inmobiliaria internacional y una industria del calzado con vocación exportadora. En todos esos frentes, buena parte de las consultas llegan de clientes extranjeros y a cualquier hora. Una inmobiliaria que tarda en responder al lead internacional pierde la operación; un restaurante con la línea colapsada pierde mesas; un negocio que no contesta el WhatsApp en inglés o francés pierde la venta. Un [agente de IA](/tienda/agente-ia) responde siempre, al instante y en el idioma del cliente.

### Qué hace por tu negocio

- **Atiende en varios idiomas**, imprescindible con el cliente internacional de la Costa Blanca.
- **Gestiona reservas** de mesa, cita o visita por teléfono y WhatsApp.
- **Responde al lead** de portal o anuncio en el primer minuto.
- **Resuelve lo repetitivo** las 24 horas, también en festivo.

## Anclado a la realidad alicantina

El peso del turismo, la inmobiliaria internacional y el comercio exportador hace de Alicante un terreno donde la velocidad y el idioma deciden la conversión. El agente coge reservas en temporada alta sin sumar plantilla, atiende a compradores y pacientes extranjeros sin que tu equipo tenga que dominar idiomas, y para el comercio y el calzado recoge pedidos y consultas, también de exportación, sin saturar a la oficina.

### Automatización con n8n

No nos quedamos en contestar. Con n8n conectamos el agente a tu motor de reservas, tu CRM o tu calendario, lanzamos confirmaciones y recordatorios por WhatsApp, avisamos a tu equipo de cada lead o reserva y registramos cada contacto. La información entra ordenada y tu equipo deja de hacer trabajo manual en plena temporada.

## Remoto, sin el recargo de la zona turística

Somos un equipo de Extremadura que trabaja para empresas de toda España por videollamada. En una plaza turística como Alicante, eso se nota: tecnología de primer nivel sin pagar una estructura cara, con entrega en 24-48h y sin permanencia. La puesta en marcha es directa: te escuchamos, configuramos el agente con tu información y tus idiomas, lo conectamos a tu número y a tu WhatsApp, y empieza a atender.

## Empezamos por tu temporada alta

Vemos contigo cuándo y en qué idiomas se te escapan reservas y leads, y diseñamos un agente que hable como tu negocio. Si quieres además una web o tienda multilingüe que canalice mejor las reservas y ventas, podemos sumar un [diseño web](/tienda/web) o una [tienda online](/tienda/online) que trabaje junto al agente.

Cuéntanos tu caso y te decimos, sin humo, qué puede automatizar un agente de IA en tu negocio de Alicante.`,
  },
  {
    service: 'agente-ia',
    citySlug: 'cordoba',
    title: 'Agente de IA en Córdoba · 24-48h | Latech',
    description:
      'Agente de IA para empresas de Córdoba: atiende llamadas y WhatsApp, gestiona reservas y citas y automatiza con n8n. En remoto, en 24-48h y sin permanencia.',
    h1: 'Agente de IA para negocios de Córdoba',
    intro:
      'Córdoba combina turismo de patrimonio, hostelería, una joyería con tradición exportadora y un agro del olivar de gran peso. Son negocios donde las consultas y reservas llegan a oleadas, en feria o temporada alta, y el teléfono se colapsa. Un agente de IA atiende llamadas y WhatsApp cuando tu equipo no da abasto, gestiona reservas y responde lo repetitivo. Lo desarrollamos en remoto desde Extremadura, con entrega en 24-48h y sin permanencia.',
    sectores: [
      { nombre: 'Hostelería y turismo', gancho: 'Gestionan reservas por WhatsApp en feria y temporada alta sin perder mesas ni visitas.' },
      { nombre: 'Joyería y comercio', gancho: 'Atienden consultas y pedidos, también de fuera, sin saturar al mostrador.' },
      { nombre: 'Agroalimentario y olivar', gancho: 'Recogen pedidos y consultas de distribución sin parar la actividad.' },
      { nombre: 'Talleres y servicios', gancho: 'Recogen avisos y agendan reparaciones sin que el teléfono pare el trabajo.' },
      { nombre: 'Despachos y clínicas', gancho: 'Filtran consultas y agendan citas sin saturar a recepción.' },
    ],
    faq: [
      { q: '¿El agente atiende llamadas y WhatsApp de mis clientes de Córdoba estando vosotros en remoto?', a: 'Sí. El agente vive en la nube y responde el teléfono y los mensajes de tus clientes de Córdoba a cualquier hora, sin importar dónde estemos. Conectamos tu número y tu WhatsApp y queda operativo. Las reuniones son por videollamada.' },
      { q: '¿Aguanta los picos de feria o temporada alta?', a: 'Para eso brilla. El agente atiende muchas consultas y reservas a la vez sin colas, justo cuando tu equipo está desbordado y se pierden más clientes.' },
      { q: '¿Puede atender a turistas en otros idiomas?', a: 'Sí. Lo configuramos para responder en varios idiomas, útil con el volumen de visitantes que recibe Córdoba. Detecta el idioma y se adapta.' },
      { q: '¿Lo conectáis con mi agenda o sistema de reservas?', a: 'Sí. Con automatizaciones n8n lo integramos con tu motor de reservas, tu calendario o tu CRM para que todo entre sincronizado, sin doble trabajo.' },
      { q: '¿Hay permanencia?', a: 'No. Sin permanencia ni cuotas obligatorias. Acordamos alcance y precio desde el principio.' },
    ],
    bodyMarkdown: `## En Córdoba, la demanda llega a oleadas

Córdoba vive un turismo de patrimonio muy marcado por temporadas (los patios, la feria, la primavera), una hostelería intensa, una joyería con tradición exportadora y un agro del olivar de gran peso. En todos ellos, las consultas y reservas llegan concentradas y el teléfono se colapsa justo cuando más clientes hay en juego. Un restaurante con la línea ocupada pierde mesas; un negocio turístico que no responde el WhatsApp pierde la visita; un taller que no coge el aviso pierde el trabajo. Un [agente de IA](/tienda/agente-ia) absorbe esas oleadas: atiende a varios clientes a la vez, sin colas.

### Qué hace por tu negocio

- **Gestiona reservas** de mesa, cita o servicio por teléfono y WhatsApp.
- **Atiende en varios idiomas** a los visitantes que llegan a la ciudad.
- **Recoge pedidos y avisos** y los cualifica al instante.
- **Responde lo repetitivo** (horarios, precios, ubicación, disponibilidad) las 24 horas.

## Anclado a la realidad cordobesa

El peso del turismo y la hostelería hace que en Córdoba la rapidez de respuesta sea decisiva en temporada alta, pero el día a día de joyerías, comercio, talleres, agro y despachos también se beneficia: son negocios donde el equipo no puede soltar lo que hace cada vez que suena el teléfono. El agente cubre ese hueco sin sumar personal en los picos y sin dejar consultas sin atender en los valles.

### Automatización con n8n

Más allá de contestar, automatizamos el flujo. Con n8n conectamos el agente a tu motor de reservas, tu agenda o tu CRM, enviamos confirmaciones y recordatorios por WhatsApp, avisamos a tu equipo de cada reserva o aviso y registramos cada contacto. La información entra ordenada y nadie copia datos a mano en plena temporada.

## Remoto, con resultado de agencia grande

Somos un equipo de Extremadura, vecinos de Andalucía, que trabaja para empresas de toda España por videollamada. Para un negocio cordobés eso significa la misma calidad sin pagar la estructura de una agencia con oficina, con entrega en 24-48h y sin permanencia. La puesta en marcha es sencilla: te escuchamos, configuramos el agente con tu información, lo conectamos a tu número y a tu WhatsApp, y empieza a atender.

## Empezamos antes de la próxima oleada

Vemos contigo cuándo se te colapsa la atención y dónde pierdes clientes, y preparamos un agente que hable como tu negocio y aguante los picos. Si quieres además una web que canalice mejor las reservas, podemos sumar un [diseño web](/tienda/web) que trabaje junto al agente.

Escríbenos y te contamos, sin humo, qué puede automatizar un agente de IA en tu negocio de Córdoba.`,
  },
  {
    service: 'agente-ia',
    citySlug: 'valladolid',
    title: 'Agente de IA en Valladolid · 24-48h | Latech',
    description:
      'Agente de IA para empresas de Valladolid: atiende llamadas y WhatsApp, recoge pedidos y citas y automatiza con n8n. En remoto, en 24-48h y sin permanencia.',
    h1: 'Agente de IA para empresas de Valladolid',
    intro:
      'Valladolid tiene un fuerte peso industrial y de automoción, un agroalimentario de prestigio (con la vitivinicultura de Ribera y Rueda cerca) y un sector servicios consolidado de despachos y comercio. Son negocios donde el equipo está en planta, en bodega o en consulta y el teléfono se queda sin contestar. Un agente de IA atiende llamadas y WhatsApp, recoge pedidos y agenda citas con n8n. Lo montamos en remoto desde Extremadura, con entrega en 24-48h y sin permanencia.',
    sectores: [
      { nombre: 'Industria y automoción', gancho: 'Filtran consultas comerciales y de proveedores sin parar la actividad de planta.' },
      { nombre: 'Agroalimentario y vino', gancho: 'Atienden pedidos, visitas a bodega y consultas de distribución sin saturar a la oficina.' },
      { nombre: 'Despachos y gestorías', gancho: 'Filtran consultas y agendan citas mientras el equipo factura.' },
      { nombre: 'Comercio y reformas', gancho: 'Cualifican peticiones de presupuesto al instante.' },
      { nombre: 'Clínicas y servicios', gancho: 'Gestionan reservas y recordatorios sin colapsar recepción.' },
    ],
    faq: [
      { q: '¿El agente atiende llamadas y WhatsApp de mis clientes de Valladolid estando vosotros en remoto?', a: 'Sí. El agente funciona en la nube y responde el teléfono y los mensajes de tus clientes de Valladolid a cualquier hora, sin importar dónde estemos. Conectamos tu número y tu WhatsApp y queda operativo. Las reuniones son por videollamada.' },
      { q: '¿Puede recoger pedidos o consultas cuando el equipo está en planta o bodega?', a: 'Sí. El agente coge el pedido o la consulta por teléfono o WhatsApp, registra los datos y avisa a tu equipo, justo cuando nadie puede parar la faena para atender el móvil.' },
      { q: '¿Sirve para gestionar visitas a bodega o reservas?', a: 'Sí. Atiende las solicitudes, comprueba disponibilidad, confirma la visita o reserva y envía el recordatorio, sin colas ni llamadas perdidas.' },
      { q: '¿Lo integráis con mi ERP o agenda?', a: 'Sí. Con automatizaciones n8n lo conectamos a tu ERP, tu CRM o tu calendario para que pedidos y citas entren sincronizados, sin copiar datos a mano.' },
      { q: '¿Hay permanencia?', a: 'No. Sin permanencia ni cuotas obligatorias. Acordamos alcance y precio desde el principio.' },
    ],
    bodyMarkdown: `## En Valladolid, la atención compite con la planta y la bodega

El tejido vallisoletano mezcla industria y automoción de peso con un agroalimentario de prestigio (con la vitivinicultura de la zona como referencia) y un sector servicios consolidado. En todos ellos, el equipo está volcado en la planta, en la bodega o en la consulta, y el teléfono suena mientras nadie puede cogerlo. Cada llamada perdida es un pedido, una visita o un presupuesto que se va a otro. Un [agente de IA](/tienda/agente-ia) resuelve ese conflicto: atiende siempre, sin frenar tu actividad.

### Qué hace por tu negocio

- **Recoge pedidos y consultas** por teléfono y WhatsApp y los pasa ordenados a tu equipo.
- **Gestiona visitas y reservas** (a bodega, a tienda, a consulta) con confirmación automática.
- **Filtra consultas** comerciales y de proveedores en el B2B industrial.
- **Responde lo repetitivo** las 24 horas, también fuera de horario.

## Anclado al tejido vallisoletano

El protagonismo de la industria, la automoción y el agroalimentario hace que en Valladolid la atención bien gestionada marque la diferencia: en el B2B, filtrar y cualificar cada contacto vale más que coger todas las llamadas a cualquier coste; en el agro y el vino, atender pedidos y visitas sin parar la actividad evita perder ventas. El agente cubre esos frentes sin sumar plantilla, y en despachos, clínicas y comercio descarga al equipo de las consultas repetitivas.

### Automatización con n8n

Más allá de contestar, automatizamos el flujo. Con n8n conectamos el agente a tu ERP, tu CRM o tu agenda para que cada pedido, visita o cita entre directa en tu sistema, con avisos al equipo y confirmaciones por WhatsApp. Menos teléfono colgado, menos datos a mano y menos errores.

## Remoto, con la misma cercanía

Somos un equipo de Extremadura que trabaja para empresas de toda España por videollamada. Para una empresa vallisoletana eso significa tecnología de primer nivel sin pagar la estructura de una agencia grande, con entrega en 24-48h y sin permanencia. La puesta en marcha es directa: te escuchamos, configuramos el agente con tu información y tus procesos, lo conectamos a tu número y a tu WhatsApp, y empieza a trabajar.

## Empezamos por tu cuello de botella

Vemos contigo en qué momentos se te escapan pedidos, visitas o consultas, y diseñamos un agente que hable como tu negocio. Si además quieres una web que recoja mejor esas peticiones, podemos sumar un [diseño web](/tienda/web) que trabaje junto al agente.

Cuéntanos tu caso y te decimos, sin humo, qué puede automatizar un agente de IA en tu empresa de Valladolid.`,
  },
  {
    service: 'agente-ia',
    citySlug: 'vigo',
    title: 'Agente de IA en Vigo · 24-48h | Latech',
    description:
      'Agente de IA para empresas de Vigo: atiende llamadas y WhatsApp, recoge pedidos y citas y automatiza con n8n. En remoto, en 24-48h y sin permanencia.',
    h1: 'Agente de IA para empresas de Vigo',
    intro:
      'Vigo es motor industrial de Galicia: automoción, naval, pesca y conserva mueven mucho B2B, junto a un comercio y una hostelería potentes. Son negocios donde el equipo está en planta, en muelle o en ruta y el teléfono se queda sin contestar. Un agente de IA atiende llamadas y WhatsApp, recoge pedidos, agenda citas y coordina con n8n. Lo desarrollamos en remoto desde Extremadura, con entrega en 24-48h y sin permanencia.',
    sectores: [
      { nombre: 'Automoción e industria', gancho: 'Filtran consultas comerciales y de proveedores sin parar la actividad de planta.' },
      { nombre: 'Pesca, naval y conserva', gancho: 'Atienden pedidos y avisos de distribución sin bloquear la operativa.' },
      { nombre: 'Logística y transporte', gancho: 'Coordinan recogidas y entregas sin que el teléfono frene la operativa.' },
      { nombre: 'Hostelería y comercio', gancho: 'Gestionan reservas y consultas en las horas de más presión.' },
      { nombre: 'Talleres y servicios', gancho: 'Recogen avisos y agendan reparaciones sin parar el trabajo.' },
    ],
    faq: [
      { q: '¿El agente atiende llamadas y WhatsApp de mis clientes de Vigo estando vosotros en remoto?', a: 'Sí. El agente funciona en la nube y responde el teléfono y los mensajes de tus clientes de Vigo a cualquier hora, sin importar dónde estemos. Conectamos tu número y tu WhatsApp y queda operativo. Todo se coordina por videollamada.' },
      { q: '¿Puede atender en gallego y castellano?', a: 'Sí. Configuramos el agente para entender y responder en varios idiomas, también en gallego, algo que muchos clientes de Vigo agradecen. Detecta el idioma y se adapta.' },
      { q: '¿Puede recoger pedidos o avisos cuando el equipo está en planta o muelle?', a: 'Sí. El agente coge el pedido, el aviso o la consulta por teléfono o WhatsApp, registra los datos y avisa a tu equipo, justo cuando nadie puede soltar lo que está haciendo.' },
      { q: '¿Lo integráis con mi ERP o agenda?', a: 'Sí. Con automatizaciones n8n lo conectamos a tu ERP, tu CRM o tu calendario para que pedidos y citas entren sincronizados, sin copiar datos a mano.' },
      { q: '¿Hay permanencia?', a: 'No. Sin permanencia ni cuotas obligatorias. Acordamos alcance y precio desde el principio.' },
    ],
    bodyMarkdown: `## En Vigo, el teléfono compite con la planta y el muelle

Como motor industrial de Galicia, Vigo concentra automoción, naval, pesca y conserva, un B2B intenso donde el equipo está en planta, en muelle o en ruta y no puede parar para coger el teléfono. A eso se suman un comercio y una hostelería potentes. En todos esos frentes pasa lo mismo: la llamada o el WhatsApp que se queda sin contestar es un pedido, un aviso o una reserva que se va a otro. Un [agente de IA](/tienda/agente-ia) cubre ese hueco: atiende siempre, sin frenar tu operativa.

### Qué hace por tu negocio

- **Recoge pedidos, avisos y consultas** por teléfono y WhatsApp y los pasa ordenados a tu equipo.
- **Atiende en varios idiomas**, también en gallego.
- **Coordina logística** de recogidas y entregas sin bloquear la línea.
- **Gestiona reservas** y responde lo repetitivo las 24 horas.

## Anclado al tejido vigués

El peso de la automoción, el naval, la pesca y la conserva hace que en Vigo la atención telefónica sea un cuello de botella real: nadie quiere parar la cadena para coger el móvil, pero nadie quiere perder el pedido. El agente filtra y recoge sin sumar personal de oficina, y en comercio, hostelería y talleres descarga al equipo de las consultas repetitivas.

### Automatización con n8n de extremo a extremo

Atender es solo el principio. Con n8n conectamos el agente a tu ERP, tu CRM o tu agenda para que cada pedido, aviso o cita entre directa en tu sistema, con avisos al equipo y confirmaciones por WhatsApp. Menos teléfono colgado, menos datos a mano y menos errores en la cadena de información.

## Remoto, con la misma cercanía

Somos un equipo de Extremadura que trabaja para empresas de toda España por videollamada. Para una empresa viguesa eso significa tecnología de primer nivel sin pagar la estructura de una agencia grande, con entrega en 24-48h y sin permanencia. La puesta en marcha es directa: te escuchamos, configuramos el agente con tu información y tus procesos, lo conectamos a tu número y a tu WhatsApp, y empieza a trabajar.

## Empezamos por tu cuello de botella

Vemos contigo en qué momentos se te escapan pedidos, avisos o consultas, y diseñamos un agente que hable como tu negocio y atienda también en gallego. Si además quieres una web que recoja mejor esas peticiones, podemos sumar un [diseño web](/tienda/web) que trabaje junto al agente.

Cuéntanos tu caso y te decimos, sin humo, qué puede automatizar un agente de IA en tu empresa de Vigo.`,
  },
  {
    service: 'agente-ia',
    citySlug: 'granada',
    title: 'Agente de IA en Granada · 24-48h | Latech',
    description:
      'Agente de IA para empresas de Granada: atiende llamadas y WhatsApp, gestiona reservas y citas y automatiza con n8n. En remoto, en 24-48h y sin permanencia.',
    h1: 'Agente de IA para negocios de Granada',
    intro:
      'Granada vive del turismo de la Alhambra, una hostelería de tapeo muy viva, una gran universidad y un sector de clínicas y comercio en su entorno. Las consultas y reservas llegan a todas horas y en varios idiomas, y el teléfono se colapsa en temporada alta. Un agente de IA atiende llamadas y WhatsApp cuando tu equipo no da abasto, gestiona reservas y responde en el idioma del cliente. Lo montamos en remoto desde Extremadura, con entrega en 24-48h y sin permanencia.',
    sectores: [
      { nombre: 'Hostelería y tapeo', gancho: 'Gestionan reservas por WhatsApp en hora punta y temporada alta sin perder mesas.' },
      { nombre: 'Turismo y alojamiento', gancho: 'Atienden consultas de visitantes a cualquier hora y en varios idiomas.' },
      { nombre: 'Clínicas y servicios', gancho: 'Agendan citas y recordatorios sin saturar a recepción.' },
      { nombre: 'Comercio y servicios universitarios', gancho: 'Resuelven dudas de horario, disponibilidad y precio las 24 horas.' },
    ],
    faq: [
      { q: '¿El agente atiende llamadas y WhatsApp de mis clientes de Granada estando vosotros en remoto?', a: 'Sí. El agente vive en la nube y responde el teléfono y los mensajes de tus clientes de Granada a cualquier hora, sin importar dónde estemos. Conectamos tu número y tu WhatsApp y queda operativo. Las reuniones son por videollamada.' },
      { q: '¿Aguanta los picos de temporada alta y hora punta?', a: 'Para eso brilla. El agente atiende muchas reservas y consultas a la vez sin colas, justo cuando tu equipo está desbordado y se pierden más clientes.' },
      { q: '¿Puede atender a turistas en otros idiomas?', a: 'Sí. Lo configuramos para responder en varios idiomas, útil con el volumen de visitantes que recibe Granada. Detecta el idioma y se adapta.' },
      { q: '¿Lo conectáis con mi agenda o sistema de reservas?', a: 'Sí. Con automatizaciones n8n lo integramos con tu motor de reservas, tu calendario o tu CRM para que todo entre sincronizado, sin doble trabajo.' },
      { q: '¿Hay permanencia?', a: 'No. Sin permanencia ni cuotas obligatorias. Acordamos alcance y precio desde el principio.' },
    ],
    bodyMarkdown: `## En Granada, la reserva se gana en el momento

Granada combina un turismo de patrimonio muy intenso, una hostelería de tapeo que llena en hora punta, una gran población universitaria y un sector de clínicas y comercio a su alrededor. Las consultas y reservas llegan concentradas y en varios idiomas, y el teléfono se colapsa justo cuando más clientes hay en juego. Un bar con la línea ocupada pierde mesas; un alojamiento que no responde el WhatsApp pierde la noche; una clínica que no contesta pierde el paciente. Un [agente de IA](/tienda/agente-ia) atiende a varios clientes a la vez, sin colas y al instante.

### Qué hace por tu negocio

- **Gestiona reservas** de mesa, habitación o cita por teléfono y WhatsApp.
- **Atiende en varios idiomas** a los visitantes que llegan a la ciudad.
- **Agenda citas y recordatorios** en clínicas y servicios.
- **Responde lo repetitivo** (horarios, precios, ubicación, disponibilidad) las 24 horas.

## Anclado a la realidad granadina

El peso del turismo y la hostelería hace que en Granada la rapidez de respuesta sea decisiva en temporada alta y en cada hora punta del tapeo. Pero también clínicas, comercio y servicios ligados a la universidad se benefician: son negocios donde el equipo no puede parar cada vez que suena el teléfono. El agente cubre ese hueco sin sumar personal en los picos y sin dejar consultas sin atender en los valles.

### Automatización con n8n

Más allá de contestar, automatizamos el flujo. Con n8n conectamos el agente a tu motor de reservas, tu agenda o tu CRM, enviamos confirmaciones y recordatorios por WhatsApp, avisamos a tu equipo de cada reserva o cita y registramos cada contacto. La información entra ordenada y nadie copia datos a mano en plena temporada.

## Remoto, con resultado de agencia grande

Somos un equipo de Extremadura, vecinos de Andalucía, que trabaja para empresas de toda España por videollamada. Para un negocio granadino eso significa la misma calidad sin pagar la estructura de una agencia con oficina, con entrega en 24-48h y sin permanencia. La puesta en marcha es sencilla: te escuchamos, configuramos el agente con tu información, lo conectamos a tu número y a tu WhatsApp, y empieza a atender.

## Empezamos antes de la próxima oleada

Vemos contigo cuándo se te colapsa la atención y dónde pierdes clientes, y preparamos un agente que hable como tu negocio y aguante los picos. Si quieres además una web que canalice mejor las reservas, podemos sumar un [diseño web](/tienda/web) que trabaje junto al agente.

Escríbenos y te contamos, sin humo, qué puede automatizar un agente de IA en tu negocio de Granada.`,
  },
  {
    service: 'agente-ia',
    citySlug: 'a-coruna',
    title: 'Agente de IA en A Coruña · 24-48h | Latech',
    description:
      'Agente de IA para empresas de A Coruña: atiende llamadas y WhatsApp, gestiona pedidos y citas y automatiza con n8n. En remoto, en 24-48h y sin permanencia.',
    h1: 'Agente de IA para empresas de A Coruña',
    intro:
      'A Coruña tiene un comercio y un retail muy fuertes (es cuna del textil), junto a pesca, servicios y una hostelería viva. Son negocios donde la atención al cliente y los pedidos no paran, pero el equipo está en tienda, en muelle o atendiendo y el teléfono se queda sin contestar. Un agente de IA atiende llamadas y WhatsApp, gestiona pedidos y citas y automatiza con n8n. Lo desarrollamos en remoto desde Extremadura, con entrega en 24-48h y sin permanencia.',
    sectores: [
      { nombre: 'Comercio y retail', gancho: 'Resuelven dudas de disponibilidad, cambios y pedidos sin saturar al equipo de tienda.' },
      { nombre: 'Pesca y distribución', gancho: 'Atienden pedidos y avisos de producto sin bloquear la operativa.' },
      { nombre: 'Hostelería y turismo', gancho: 'Gestionan reservas por WhatsApp en las horas de más presión.' },
      { nombre: 'Despachos y servicios', gancho: 'Filtran consultas y agendan citas mientras el equipo factura.' },
      { nombre: 'Clínicas y centros', gancho: 'Gestionan reservas y recordatorios sin colapsar recepción.' },
    ],
    faq: [
      { q: '¿El agente atiende llamadas y WhatsApp de mis clientes de A Coruña estando vosotros en remoto?', a: 'Sí. El agente funciona en la nube y responde el teléfono y los mensajes de tus clientes de A Coruña a cualquier hora, sin importar dónde estemos. Conectamos tu número y tu WhatsApp y queda operativo. Todo se coordina por videollamada.' },
      { q: '¿Puede atender en gallego y castellano?', a: 'Sí. Configuramos el agente para entender y responder en varios idiomas, también en gallego, algo que muchos clientes de A Coruña agradecen. Detecta el idioma y se adapta.' },
      { q: '¿Sirve para atención posventa y dudas de pedidos en comercio?', a: 'Sí. El agente resuelve seguimiento de pedidos, cambios, disponibilidad y dudas frecuentes por teléfono y WhatsApp, descargando al equipo de tienda en las horas de más trabajo.' },
      { q: '¿Lo integráis con mi sistema de gestión?', a: 'Sí. Con automatizaciones n8n lo conectamos a tu CRM, tu ERP o tu agenda para que pedidos y citas entren sincronizados, sin copiar datos a mano.' },
      { q: '¿Hay permanencia?', a: 'No. Sin permanencia ni cuotas obligatorias. Acordamos alcance y precio desde el principio.' },
    ],
    bodyMarkdown: `## En A Coruña, la atención no puede parar

Cuna del textil y plaza de comercio y retail muy potente, A Coruña combina tiendas, distribución, pesca, servicios y hostelería. En todos esos negocios la atención al cliente y los pedidos no paran, pero el equipo está en la tienda, en el muelle o atendiendo al mostrador, y el teléfono suena mientras nadie puede cogerlo. Cada llamada o WhatsApp sin contestar es una venta, un pedido o una reserva que se va a otro. Un [agente de IA](/tienda/agente-ia) cubre ese hueco: atiende siempre, sin frenar tu actividad.

### Qué hace por tu negocio

- **Resuelve dudas de pedidos** y posventa (seguimiento, cambios, disponibilidad) por teléfono y WhatsApp.
- **Atiende en varios idiomas**, también en gallego.
- **Gestiona reservas y citas** con confirmación y recordatorio automáticos.
- **Recoge pedidos y avisos** y los pasa ordenados a tu equipo.

## Anclado a la realidad coruñesa

El peso del comercio y el retail hace que en A Coruña la atención posventa y la resolución de dudas marquen la diferencia entre un cliente que repite y uno que no vuelve. En las horas de más trabajo, el equipo de tienda no puede atender el teléfono y vender a la vez; el agente cubre ese frente sin sumar plantilla. Y en pesca, distribución, hostelería, despachos y clínicas, recoge pedidos y agenda citas sin que la operativa se resienta.

### Automatización con n8n

Más allá de contestar, automatizamos el flujo. Con n8n conectamos el agente a tu CRM, tu ERP o tu agenda para que cada pedido, consulta o cita entre directa en tu sistema, con avisos al equipo y confirmaciones por WhatsApp. Menos teléfono colgado, menos datos a mano y menos errores.

## Remoto, con la misma cercanía

Somos un equipo de Extremadura que trabaja para empresas de toda España por videollamada. Para una empresa coruñesa eso significa tecnología de primer nivel sin pagar la estructura de una agencia grande, con entrega en 24-48h y sin permanencia. La puesta en marcha es directa: te escuchamos, configuramos el agente con tu información y tus procesos, lo conectamos a tu número y a tu WhatsApp, y empieza a trabajar.

## Empezamos por tu atención

Vemos contigo qué consultas se repiten y dónde pierdes ventas o pedidos, y diseñamos un agente que hable como tu negocio y atienda también en gallego. Si además quieres vender online o canalizar mejor los pedidos, podemos sumar una [tienda online](/tienda/online) o un [diseño web](/tienda/web) que trabaje junto al agente.

Cuéntanos tu caso y te decimos, sin humo, qué puede automatizar un agente de IA en tu empresa de A Coruña.`,
  },
  {
    service: 'agente-ia',
    citySlug: 'badajoz',
    title: 'Agente de IA en Badajoz · 24-48h | Latech',
    description:
      'Agente de IA para empresas de Badajoz: atiende llamadas y WhatsApp, recoge pedidos y citas y automatiza con n8n. Somos de Extremadura. En 24-48h, sin permanencia.',
    h1: 'Agente de IA para empresas de Badajoz',
    intro:
      'Badajoz es nuestra tierra: aquí trabajamos y conocemos su tejido de cerca. Agroalimentario de la dehesa y el ibérico, comercio, servicios y negocios con un pie en la frontera de Portugal mueven pedidos y consultas a todas horas, mientras el equipo está en faena. Un agente de IA atiende llamadas y WhatsApp, recoge pedidos y agenda citas con n8n. Lo desarrollamos en remoto, con entrega en 24-48h y sin permanencia.',
    sectores: [
      { nombre: 'Agroalimentario y dehesa', gancho: 'Atienden pedidos y consultas de ibérico y producto, también de Portugal, sin parar la actividad.' },
      { nombre: 'Comercio y servicios', gancho: 'Resuelven dudas de disponibilidad, horario y pedidos sin saturar al mostrador.' },
      { nombre: 'Talleres y reformas', gancho: 'Recogen avisos y agendan trabajos sin que el teléfono pare la faena.' },
      { nombre: 'Hostelería', gancho: 'Gestionan reservas por WhatsApp en las horas de más presión.' },
      { nombre: 'Despachos y clínicas', gancho: 'Filtran consultas y agendan citas sin saturar a recepción.' },
    ],
    faq: [
      { q: '¿El agente atiende llamadas y WhatsApp de mis clientes de Badajoz estando vosotros en remoto?', a: 'Sí, y además somos de Extremadura, así que conocemos bien el tejido de la zona. El agente funciona en la nube y responde el teléfono y los mensajes de tus clientes de Badajoz a cualquier hora. Conectamos tu número y tu WhatsApp y queda operativo. Las reuniones son por videollamada o, si lo prefieres, en persona.' },
      { q: '¿Puede atender a clientes de Portugal en portugués?', a: 'Sí. Lo configuramos para responder en varios idiomas, también en portugués, muy útil por la cercanía de la frontera y el cliente luso. Detecta el idioma y se adapta.' },
      { q: '¿Puede recoger pedidos cuando el equipo está en faena?', a: 'Sí. El agente coge el pedido o la consulta por teléfono o WhatsApp, registra los datos y avisa a tu equipo, justo cuando nadie puede parar para atender el móvil.' },
      { q: '¿Lo integráis con mi sistema de gestión?', a: 'Sí. Con automatizaciones n8n lo conectamos a tu ERP, tu CRM o tu agenda para que pedidos y citas entren sincronizados, sin copiar datos a mano.' },
      { q: '¿Hay permanencia?', a: 'No. Sin permanencia ni cuotas obligatorias. Acordamos alcance y precio desde el principio.' },
    ],
    bodyMarkdown: `## Badajoz es nuestra tierra, y la conocemos bien

Somos un equipo de Extremadura, así que el tejido de Badajoz no nos lo cuentan: lo vivimos. El agroalimentario de la dehesa y el ibérico, el comercio, los servicios y los negocios con un pie en la frontera de Portugal mueven pedidos y consultas a todas horas, mientras el equipo está en faena, en el campo o en la tienda. Cada llamada o WhatsApp sin contestar es un pedido o un cliente que se va a otro. Un [agente de IA](/tienda/agente-ia) cubre ese hueco: atiende siempre, sin frenar tu actividad.

### Qué hace por tu negocio

- **Recoge pedidos y consultas** por teléfono y WhatsApp y los pasa ordenados a tu equipo.
- **Atiende al cliente de Portugal** en portugués, clave por la cercanía de la frontera.
- **Agenda citas, trabajos y reservas** con confirmación y recordatorio automáticos.
- **Responde lo repetitivo** las 24 horas, también fuera de horario.

## Anclado a la realidad pacense

El peso del agroalimentario y el comercio, junto a la cercanía de Portugal, hace que en Badajoz la atención multilingüe y la rapidez marquen la diferencia. Un productor de ibérico que atiende pedidos del otro lado de la frontera, un comercio que no quiere perder ventas por tener el teléfono ocupado, un taller que no puede parar cada vez que suena: en todos esos casos el agente trabaja sin sumar plantilla y sin dejar consultas sin atender.

### Automatización con n8n

Más allá de contestar, automatizamos el flujo. Con n8n conectamos el agente a tu ERP, tu CRM o tu agenda para que cada pedido, aviso o cita entre directa en tu sistema, con avisos al equipo y confirmaciones por WhatsApp. Menos teléfono colgado, menos datos a mano y menos errores.

## Cercanía de verdad, no solo remoto

Trabajamos en remoto para toda España, pero en Badajoz jugamos en casa: si quieres vernos en persona, podemos. Eso significa tecnología de primer nivel con trato cercano, entrega en 24-48h y sin permanencia. La puesta en marcha es directa: te escuchamos, configuramos el agente con tu información y tus procesos, lo conectamos a tu número y a tu WhatsApp, y empieza a trabajar.

## Empezamos por tu día a día

Vemos contigo en qué momentos se te escapan pedidos y consultas, y diseñamos un agente que hable como tu negocio y atienda también en portugués. Si además quieres una web que recoja mejor esas peticiones o vender online, podemos sumar un [diseño web](/tienda/web) o una [tienda online](/tienda/online) que trabaje junto al agente.

Cuéntanos tu caso y te decimos, sin humo, qué puede automatizar un agente de IA en tu empresa de Badajoz.`,
  },
];
