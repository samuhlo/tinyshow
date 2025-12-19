# Estándar TSDoc: "The Blueprint Block"

Vamos a tratar cada bloque de comentarios como una ficha técnica. La clave aquí es la alineación vertical y el uso de etiquetas en mayúsculas para categorizar la lógica, aprovechando el sistema de tipos de TypeScript.

## 1. Cabecera de Componente (Vue/Nuxt)

Para el inicio de tus archivos `.vue` o módulos `.ts`.

```typescript
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

Olvídate de las frases largas. Usa el formato `[VERBO] + [OBJETO]`. Alinea los parámetros y las descripciones obsesivamente. En TSDoc omitimos los tipos en el comentario (ya están en el código), pero mantenemos la estructura visual.

### Estilo Incorrecto (Amateur)

```typescript
/**
 * Esta función calcula el total del carrito y añade impuestos
 * si el usuario es de europa.
 * @param cart El objeto del carrito
 * @returns el total
 */
```

### Estilo Samuh Lo (Professional)

```typescript
/**
 * [CALC] :: PROCESS_CART_TOTAL
 * Computa el valor final aplicando tasas regionales.
 *
 * @param cart       - Estado actual del carrito (Store).
 * @param regionCode - Código ISO (ej: 'ES', 'FR').
 * @param isVat      - (Optional) Aplica impuestos si es true.
 *
 * @returns Total normalizado (2 decimales).
 * @throws  {Error}  - Si el carrito está vacío.
 */
const processCartTotal = (cart: Cart, regionCode: string, isVat: boolean = true): number => { ... }
```
