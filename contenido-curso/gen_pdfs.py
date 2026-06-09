"""
Genera un PDF descargable por módulo (resumen estructurado + puntos clave)
para la plataforma de formación de comerciales de Latech.

- Limpio y legible en móvil (A4, una columna, tipografía amplia).
- Contenido 100% basado en las transcripciones de cada vídeo.
- Salida: contenido-curso/pdfs/modulo-N.pdf (ignorados en git; acaban en Blob).

Uso:  python gen_pdfs.py
"""

import os

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem, HRFlowable,
)

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "pdfs")

PURPLE = HexColor("#8B5CF6")
DARK = HexColor("#1A1530")
GREY = HexColor("#444444")
ORANGE = HexColor("#F97316")

MODULES = [
    {
        "n": 0,
        "title": "Bienvenida y quiénes somos",
        "resumen": "Primer módulo de inicio. Conoces quién es la empresa (Servicios Online Web / "
                   "Latech), qué hace, qué espera de ti como comercial y cuál es tu papel dentro "
                   "del equipo. La empresa está especializada en soluciones digitales para empresas "
                   "y profesionales: ayuda a sus clientes a mejorar su presencia online, captar "
                   "nuevos clientes y aumentar sus ventas. Su objetivo es ser un socio estratégico "
                   "que aporta soluciones reales con resultados medibles.",
        "puntos": [
            "<b>Qué hacemos:</b> diseño y desarrollo web, tiendas online, posicionamiento SEO, "
            "marketing digital y publicidad online, gestión de redes sociales, automatización de "
            "procesos comerciales y soluciones tecnológicas.",
            "<b>Valores:</b> excelencia en el servicio, profesionalidad, honestidad y "
            "transparencia, innovación constante y orientación a resultados.",
            "<b>Perfil que buscamos en ti:</b> proactividad, responsabilidad, organización, "
            "persistencia, orientación a objetivos y capacidad de aprender continuamente. "
            "Más allá de la experiencia, valoramos especialmente la <b>actitud</b>.",
            "<b>Mentalidad de crecimiento:</b> no todas las conversaciones terminan en venta. "
            "Aprende de cada experiencia, gestiona el rechazo de forma constructiva y mantén la "
            "motivación a largo plazo.",
            "<b>Tu papel:</b> eres la primera imagen de la empresa ante los clientes. Tu misión es "
            "detectar oportunidades, entender necesidades, presentar soluciones con claridad, "
            "generar confianza y fidelizar.",
        ],
        "frases": [],
    },
    {
        "n": 1,
        "title": "Los servicios que vendemos: web, tienda online y asistente IA",
        "resumen": "En Latech no vendemos páginas web: vendemos soluciones para que las empresas "
                   "consigan más clientes, generen más ventas y transmitan una imagen profesional. "
                   "Nunca te centres en las características técnicas; habla siempre del beneficio que "
                   "obtiene el cliente. Este módulo explica los tres servicios principales.",
        "puntos": [
            "<b>Página web</b> = el escaparate digital de la empresa, abierto 24 h los 365 días. "
            "Beneficios: genera confianza y profesionalidad, consigue más clientes potenciales, "
            "está siempre disponible, muestra productos y servicios, ayuda a diferenciarse de la "
            "competencia y facilita el contacto.",
            "<b>Tienda online</b> = permite comprar directamente (carrito, pagos y gestión "
            "automática de pedidos). Beneficios: vender 24 h, llegar a clientes de toda España e "
            "incluso internacional, reducir costes, automatizar ventas, mostrar todo el catálogo y "
            "aumentar la facturación.",
            "<b>Asistente IA</b> = un empleado digital que atiende llamadas y consultas, recoge "
            "información y gestiona reservas las 24 h. No se cansa y atiende a varios clientes a la "
            "vez. Evita que la empresa pierda oportunidades por no atender a tiempo (cuando un "
            "cliente no recibe respuesta, llama a la competencia).",
        ],
        "frases": [
            "Web: «Le ayudo a que sus clientes le encuentren fácilmente y confíen en su empresa "
            "desde el primer momento».",
            "Tienda online: «Le ayudo a vender sus productos por Internet las 24 horas, ampliando "
            "su mercado y generando nuevas oportunidades».",
            "Asistente IA: «Le ayudo a que ningún cliente se quede sin respuesta y a que cada "
            "llamada pueda convertirse en una venta».",
        ],
    },
    {
        "n": 2,
        "title": "Cómo entrarle al cliente por teléfono",
        "resumen": "El objetivo de la primera llamada NO es vender, sino conseguir una reunión, una "
                   "demostración o una segunda conversación. Si intentas vender en la primera "
                   "llamada, el cliente se pone a la defensiva. Investiga el negocio 5 segundos "
                   "antes de marcar y capta la atención en los primeros segundos con una apertura "
                   "natural que genere curiosidad.",
        "puntos": [
            "<b>Estructura de la llamada (4 pasos):</b> Presentación → Gancho → Pregunta → Cita.",
            "<b>Gancho:</b> habla siempre de oportunidades de mejora, nunca de problemas.",
            "<b>Evita</b> frases como «le llamo para venderle», «quería informarle» o «le ofrezco». "
            "Mejor: «Hola Juan, soy Antonio de Latech, una pregunta rápida…».",
            "<b>Las objeciones son normales:</b> no significan que el cliente no quiera comprar, "
            "sino que necesita más información. No las discutas, resuélvelas.",
            "<b>Las 5 objeciones típicas:</b> «ya tengo web», «no me interesa», «mándame un email», "
            "«no tengo tiempo» y «¿cuál es el precio?» — cada una con su respuesta orientada a "
            "conseguir la reunión.",
            "<b>El embudo:</b> la llamada consigue la reunión; la reunión detecta necesidades; la "
            "propuesta presenta la solución; y la venta llega como consecuencia del proceso.",
        ],
        "frases": [
            "«Creo que podría enseñarte algunas ideas que pueden ayudaros. ¿Te parece si hacemos "
            "una videollamada de 15 minutos esta semana?»",
        ],
    },
    {
        "n": 3,
        "title": "Cómo entrarle al cliente en persona",
        "resumen": "No entras a vender, entras a iniciar una conversación. La mayoría de "
                   "propietarios están acostumbrados a recibir visitas comerciales; la diferencia "
                   "está en cómo entras, cómo te presentas y cómo inicias la conversación. Genera "
                   "una buena primera impresión y abre puertas de forma profesional.",
        "puntos": [
            "<b>Lenguaje corporal:</b> mantén contacto visual, sonríe de forma natural y habla con "
            "claridad. Evita cruzar los brazos, mirar el móvil o invadir el espacio personal.",
            "<b>Entrada natural:</b> «Buenos días, soy Sonia de Latech. He estado viendo vuestro "
            "negocio y quería comentaros una idea que creo que os puede interesar».",
            "<b>Para llegar al responsable:</b> no digas «quiero hablar con el jefe» (suena "
            "brusco). Mejor: «¿Podría indicarme quién se encarga de la parte comercial o digital?».",
            "<b>Haz preguntas y escucha</b> más de lo que hablas: así descubres necesidades reales. "
            "Los mejores comerciales son grandes escuchadores.",
            "<b>Objetivo de la visita:</b> avanzar al siguiente paso (una reunión de 15 minutos), "
            "no cerrar la venta en cinco minutos. Las personas compran a quienes les inspiran "
            "confianza.",
        ],
        "frases": [],
    },
    {
        "n": 4,
        "title": "Acceso y uso del CRM",
        "resumen": "El CRM es la herramienta donde trabajas con los clientes. Se accede desde "
                   "ServiciosOnlineWeb.com, botón «Iniciar sesión» (apartado de trabajadores), con "
                   "tu usuario y contraseña. En el menú lateral izquierdo encontrarás los apartados "
                   "principales.",
        "puntos": [
            "<b>CRM:</b> apartado principal para gestionar contactos, leads, llamadas, seguimientos "
            "y oportunidades comerciales.",
            "<b>Calendario:</b> avisos, tareas y recordatorios que tú programas; fundamental para "
            "no olvidar llamadas, reuniones o acciones pendientes.",
            "<b>Avisos:</b> canal oficial donde la dirección comunica información importante a todo "
            "el equipo. Revísalo a diario.",
            "<b>Registro tras cada llamada:</b> abre la ficha del lead, añade una nota y registra la "
            "fecha, el resultado, la información relevante y la siguiente acción de seguimiento "
            "(crea un aviso en el Calendario).",
            "<b>Regla de oro:</b> nunca termines una llamada sin dejar registrada la información y "
            "la próxima acción programada.",
            "<b>Soporte:</b> ante cualquier duda del back office, contacta con Luis o Andrés.",
        ],
        "frases": [],
    },
    {
        "n": 5,
        "title": "Consejos de venta y cierre",
        "resumen": "Vender no consiste en convencer a todo el mundo, sino en encontrar a las "
                   "personas adecuadas, entender sus necesidades y acompañarlas hasta una decisión. "
                   "Estos son los principios clave que usan los vendedores más efectivos.",
        "puntos": [
            "<b>Constancia y números:</b> la venta es un juego de volumen y estadísticas. Cuantas "
            "más personas contactes, más oportunidades generarás. La persistencia suele superar al "
            "talento cuando se aplica de forma consistente.",
            "<b>El seguimiento:</b> la mayoría de las ventas se producen entre el segundo y el "
            "cuarto seguimiento. Muchos abandonan tras el primer contacto: aporta valor en cada "
            "contacto sin resultar insistente.",
            "<b>Mentalidad ante el «no»:</b> no lo tomes como algo personal. El rechazo es temporal "
            "y cada «no» te acerca a un futuro «sí».",
            "<b>Los 5 hábitos para vender más:</b> mantener la constancia, escuchar activamente, "
            "generar urgencia de forma honesta, realizar seguimiento y desarrollar una mentalidad "
            "resiliente.",
        ],
        "frases": [],
    },
]


def build_styles():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        "Kicker", parent=styles["Normal"], fontName="Helvetica-Bold",
        fontSize=10, textColor=PURPLE, spaceAfter=2, leading=12,
        alignment=TA_LEFT,
    ))
    styles.add(ParagraphStyle(
        "TitleBig", parent=styles["Title"], fontName="Helvetica-Bold",
        fontSize=22, textColor=DARK, spaceAfter=4, leading=26, alignment=TA_LEFT,
    ))
    styles.add(ParagraphStyle(
        "Section", parent=styles["Heading2"], fontName="Helvetica-Bold",
        fontSize=13, textColor=PURPLE, spaceBefore=14, spaceAfter=6, leading=16,
    ))
    styles.add(ParagraphStyle(
        "Body", parent=styles["Normal"], fontName="Helvetica",
        fontSize=11.5, textColor=GREY, leading=17, spaceAfter=6,
    ))
    styles.add(ParagraphStyle(
        "LtBullet", parent=styles["Normal"], fontName="Helvetica",
        fontSize=11.5, textColor=GREY, leading=16,
    ))
    styles.add(ParagraphStyle(
        "Quote", parent=styles["Normal"], fontName="Helvetica-Oblique",
        fontSize=11.5, textColor=DARK, leading=16, leftIndent=8,
        borderColor=ORANGE, borderWidth=0, spaceAfter=6,
    ))
    styles.add(ParagraphStyle(
        "Foot", parent=styles["Normal"], fontName="Helvetica",
        fontSize=8.5, textColor=HexColor("#999999"), leading=11,
    ))
    return styles


def build_module(m, styles):
    story = []
    story.append(Paragraph(f"LATECH · FORMACIÓN COMERCIAL · MÓDULO {m['n']}", styles["Kicker"]))
    story.append(Paragraph(m["title"], styles["TitleBig"]))
    story.append(HRFlowable(width="100%", thickness=2, color=PURPLE, spaceBefore=4, spaceAfter=10))

    story.append(Paragraph("Resumen", styles["Section"]))
    story.append(Paragraph(m["resumen"], styles["Body"]))

    story.append(Paragraph("Puntos clave", styles["Section"]))
    items = [ListItem(Paragraph(p, styles["LtBullet"]), value="circle") for p in m["puntos"]]
    story.append(ListFlowable(items, bulletType="bullet", bulletColor=PURPLE,
                              leftIndent=14, spaceAfter=2))

    if m["frases"]:
        story.append(Paragraph("Frases clave", styles["Section"]))
        for fr in m["frases"]:
            story.append(Paragraph(fr, styles["Quote"]))

    story.append(Spacer(1, 16))
    story.append(HRFlowable(width="100%", thickness=0.6, color=HexColor("#DDDDDD"),
                            spaceBefore=2, spaceAfter=6))
    story.append(Paragraph(
        "Material de formación interna de Latech (Servicios Online Web). "
        "Repasa estos puntos antes del examen final.", styles["Foot"]))
    return story


def main():
    os.makedirs(OUT, exist_ok=True)
    styles = build_styles()
    for m in MODULES:
        path = os.path.join(OUT, f"modulo-{m['n']}.pdf")
        doc = SimpleDocTemplate(
            path, pagesize=A4,
            leftMargin=18 * mm, rightMargin=18 * mm,
            topMargin=18 * mm, bottomMargin=16 * mm,
            title=f"Módulo {m['n']} — {m['title']}",
            author="Latech",
        )
        doc.build(build_module(m, styles))
        print(f"OK  modulo-{m['n']}.pdf")


if __name__ == "__main__":
    main()
