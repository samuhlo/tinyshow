# Estándar JSDoc: "The Blueprint Block"

Vamos a tratar cada bloque de comentarios como una ficha técnica. La clave aquí es la alineación vertical y el uso de etiquetas en mayúsculas para categorizar la lógica.

## 1. Cabecera de Componente (Vue/Nuxt)

Para el inicio de tus archivos `.vue` o módulos `.ts`.

```javascript
/**
 * [COMPONENT] :: USER_PROFILE_CARD
 * ----------------------------------------------------------------------
 * Tarjeta de presentación minimalista para el dashboard de usuario.
 * Gestiona estados de carga y visualización de avatares.
 *
 * @module    components/domain/user
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */
```

## 2. Métodos y Funciones (La Lógica)

Olvídate de las frases largas. Usa el formato `[VERBO] + [OBJETO]`. Alinea los tipos y las descripciones obsesivamente.

### Estilo Incorrecto (Amateur)

```javascript
/**
 * Esta función calcula el total del carrito y añade impuestos
 * si el usuario es de europa.
 * @param cart El objeto del carrito
 * @returns el total
 */
```

### Estilo Samuh Lo (Professional)

```javascript
/**
 * [CALC] :: PROCESS_CART_TOTAL
 * Computa el valor final aplicando tasas regionales.
 *
 * @param   {Object}  cart        - Estado actual del carrito (Store).
 * @param   {String}  regionCode  - Código ISO (ej: 'ES', 'FR').
 * @param   {Boolean} [isVat=true]- Aplica impuestos si es true.
 *
 * @returns {Number}              - Total normalizado (2 decimales).
 * @throws  {Error}               - Si el carrito está vacío.
 */
const processCartTotal = (cart, regionCode, isVat = true) => { ... }
```
