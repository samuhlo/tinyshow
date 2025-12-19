# 📡 Documentación de la API del Servidor

El directorio `server/api` contiene los endpoints RESTful de la aplicación.
Todos los endpoints están construidos utilizando rutas de servidor de Nuxt 3 y Prisma ORM.

## 🛠 Endpoints

### 1. Listar Proyectos
**GET** `/api/projects`

Recupera una lista de proyectos desde la base de datos.

**Parámetros de Consulta (Query Params):**
| Parámetro | Tipo | Descripción | Default |
| :--- | :--- | :--- | :--- |
| `primary_tech` | `string` | Filtrar por tecnología principal (ej: `Nuxt`, `Astro`) | `undefined` |
| `limit` | `number` | Limitar el número de resultados | `50` |

**Ejemplo de Uso (Nuxt):**
```ts
// Obtener todos los proyectos
const { data: projects } = await useFetch('/api/projects')

// Filtrar por tecnología
const { data: nuxtProjects } = await useFetch('/api/projects', {
  query: { primary_tech: 'Nuxt' }
})
```

---

### 2. Obtener Detalle de Proyecto
**GET** `/api/projects/:id`

Recupera información detallada de un proyecto específico mediante su ID (slug).

**Parámetros:**
| Parámetro | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `string` | El slug único del proyecto (ej: `tinyshow-v2`) |

**Respuesta:**
Devuelve un objeto `Project` o lanza un error `404 Not Found`.

**Ejemplo de Uso (Nuxt):**
```ts
const route = useRoute()
const { data: project, error } = await useFetch(`/api/projects/${route.params.id}`)
```

---

### 3. Listar Tecnologías
**GET** `/api/projects/techs`

Recupera una lista de todos los valores únicos encontrados en el campo `primary_tech` en todos los proyectos.
Útil para poblar menús desplegables de filtros o pestañas de navegación.

**Respuesta:**
Array de cadenas: `["Astro", "Next.js", "Nuxt", "React", "Vue"]`

**Ejemplo de Uso (Nuxt):**
```ts
const { data: technologies } = await useFetch('/api/projects/techs')
```
