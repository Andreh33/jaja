## Qué decidir antes de integrar los pagos

Para cobrar por Internet necesitas conectar el pedido, el pago y la entrega. Antes de elegir una herramienta, concreta qué vendes, en qué países, si cobrarás una vez o cada mes y quién resolverá devoluciones e incidencias. Una web de servicios que envía presupuestos tiene necesidades distintas de una tienda con stock, variantes y envíos.

Stripe ofrece distintas formas de integrar pagos. La elección debe encajar con ese recorrido y con el mantenimiento que puedas asumir. En Latech revisamos estas decisiones al preparar una [tienda online](/tienda/online), antes de conectar el cobro real.

## Enlace de pago, Checkout o formulario integrado

Un enlace de pago resulta útil cuando ya has acordado el producto o servicio y quieres compartir una página de cobro. Para un catálogo con carrito necesitas que la web calcule y compruebe productos, cantidades y disponibilidad antes de iniciar el pago.

[Stripe Checkout](https://docs.stripe.com/payments/checkout) permite usar una página de pago alojada o una experiencia integrada. Elements ofrece más control sobre la presentación. Más personalización también implica más estados que diseñar y comprobar: carga, errores, autenticación del banco, cancelación y regreso a la tienda.

Un marketplace que reparte ingresos entre vendedores necesita un análisis adicional de cuentas, responsabilidades y liquidaciones. No conviene tratarlo como una tienda de un único vendedor.

## Comisiones: calcula con tu tipo de operación

La [tarifa pública de Stripe para España](https://stripe.com/es/pricing), consultada el 29 de septiembre de 2026, indica **1,5 % + 0,25 € para tarjetas estándar del Espacio Económico Europeo**. No es una tarifa universal: otras tarjetas, divisas, métodos y servicios tienen condiciones diferentes.

Con esa tarifa concreta, una venta de 50 € tendría una comisión de 1 €: 0,75 € del porcentaje y 0,25 € de la parte fija. Es un ejemplo del procesamiento, no del beneficio del pedido. Aún debes descontar producto, envío, impuestos y demás costes aplicables.

Stripe indica que las comisiones originales de procesamiento no se devuelven al reembolsar una operación. Incluye ese efecto en tu cálculo de devoluciones. Revisa también los costes de productos adicionales y las condiciones de tu cuenta; no presupongas que gestionar suscripciones cuesta lo mismo que un cobro puntual.

## Métodos de pago y disponibilidad

Haz una lista corta de los métodos que necesita tu público y comprueba su disponibilidad para tu cuenta, actividad y modalidad de cobro. Tener una integración técnica preparada no significa que todos los métodos estén activados o sean compatibles con suscripciones.

Para Bizum, consulta la [documentación oficial de Stripe](https://stripe.com/payment-method/bizum). Confirma requisitos, países, límites y tarifas antes de anunciarlo en la tienda. Evita publicar un porcentaje fijo que no corresponda a tu contrato.

## Del pago al pedido confirmado

La pantalla de «gracias» no debería ser la única prueba de que el cliente ha pagado. La tienda debe comprobar la confirmación del proveedor y registrar el resultado antes de preparar el pedido. También necesita gestionar avisos repetidos sin duplicar pedidos, correos ni entregas.

Antes del lanzamiento, prueba en el entorno de pruebas un pago correcto, uno rechazado, una cancelación y una devolución. Comprueba qué ve el cliente y qué aparece en la gestión de pedidos. Define quién recibe una incidencia y cómo puede resolverla sin editar datos a mano.

## Seguridad y operación diaria

Según la [guía de seguridad de Stripe](https://docs.stripe.com/security/guide), el cumplimiento PCI es una responsabilidad compartida. Usar componentes que envían los datos de tarjeta directamente al proveedor reduce el alcance de las obligaciones; no elimina todas las responsabilidades del negocio.

Reserva los accesos administrativos al equipo que los necesite, protege las credenciales y separa pruebas de producción. La integración tampoco sustituye la revisión de privacidad, facturación y condiciones de venta de tu empresa.

## Qué pedir en el presupuesto

Pide que se detallen los métodos incluidos, la gestión de errores, devoluciones, suscripciones, avisos de pedido y mantenimiento. Distingue el precio de construir la tienda de las comisiones del proveedor de pagos.

Puedes preparar el alcance con nuestra [calculadora de presupuesto](/tienda/calculadora) y comparar enfoques en la [guía de pasarelas de pago en España](/blog/pasarelas-pago-espana-comparativa-2026). La decisión debe partir de tus operaciones reales, sin asumir que una misma pasarela es la mejor para todos los negocios.
