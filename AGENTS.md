# AGENTS.md — Contexto Completo y Guía de Desarrollo para Agentes IA

> **Proyecto:** DIRPOLES_APP (Aplicación Móvil en React Native con Expo SDK 52)  
> **Backend Consumido:** DIRPOLES-4 (Monolito PHP REST API)  
> **Organización:** Dirección de Políticas Estudiantiles — UPTAEB  

---

## 1. Visión General del Proyecto

`DIRPOLES_APP` es la aplicación móvil oficial de la Dirección de Políticas Estudiantiles de la Universidad Politécnica Territorial Andrés Eloy Blanco (UPTAEB). Permite a los empleados y administradores gestionar de forma ágil servicios como:

- **Autenticación y Perfil de Usuario**: Inicio de sesión seguro con cifrado RSA, refresco automático de sesión JWT y consulta de perfil.
- **Gestión de Beneficiarios**: Registro, consulta, filtrado y actualización de estudiantes beneficiarios.
- **Gestión de Citas y Atención**: Creación de solicitudes, asignación de citas por servicios médicos/psicológicos/sociales y cambio de estados.
- **Inventario e Insumos**: Consulta del stock de medicamentos/materiales y registro de entradas/salidas.
- **Reportes y Dashboard**: Visualización de estadísticas generales de atención e inventario.

---

## 2. Arquitectura del Sistema

La aplicación sigue una **arquitectura desacoplada en capas (Layered Architecture)** para garantizar mantenibilidad, testabilidad y separación de responsabilidades:

```
┌─────────────────────────────────────────────────────────┐
│                     Capa de UI (Screens)                │
│    (LoginScreen, BeneficiariosScreen, CitasScreen, etc.)│
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│             Capa de Hooks (Logic / Forms)               │
│      (useLoginForm, useBeneficiarioForm, useCitas, etc.)│
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│           Capa de Contexto (Global State)               │
│      (AuthContext: user, isAuthenticated, login, logout) │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│           Capa de Servicios (HTTP & Storage)            │
│ (authService, beneficiarioService, citaService, api.js) │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│              Backend REST API (DIRPOLES-4)              │
│       HTTP / JSON con JWT Bearer Authentication        │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Configuración y Constantes (`src/constants/config.js`)

- **`BASE_URL`**: `http://192.168.50.100/DIRPOLES-4` *(Apunta al backend Apache/PHP local o de producción)*.
- **`API_URL`**: `${BASE_URL}/api` *(Ruta base para endpoints autenticados)*.
- **`STORAGE_KEYS`**:
  - `STORAGE_KEYS.JWT_TOKEN`: `'jwt_token'` (Almacenado en `Expo SecureStore`).
  - `STORAGE_KEYS.REFRESH_TOKEN`: `'refresh_token'` (Almacenado en `Expo SecureStore`).
  - `STORAGE_KEYS.USER_DATA`: `'user_data'` (Objeto JSON del usuario autenticado).

---

## 4. Flujo de Autenticación y Seguridad

### 4.1 Cifrado de Contraseña con RSA
Para prevenir la transmisión de contraseñas en texto plano:
1. Al iniciar sesión, la clave se cifra con **RSA (Base64)** utilizando la clave pública configurada en `src/config/rsaKeys.js` mediante la utilidad `encryptRSA(password)`.
2. El payload enviado al backend es:
   ```json
   {
     "correo": "usuario@gmail.com",
     "password": "<CLAVE_RSA_CIFRADA_EN_BASE64>"
   }
   ```

### 4.2 Respuestas del Backend (`POST /iniciar_sesion`)
El backend `DIRPOLES-4` responde en formato JSON estándar:
```json
{
  "exito": true,
  "datos": {
    "titulo": "¡Bienvenido!",
    "mensaje": "Has iniciado sesión correctamente.",
    "token": "eyJhbGciOiJSUzI1Ni...",
    "refresh_token": "a1b2c3d4e5f6...",
    "jwt_exp": 3600,
    "usuario": {
      "id_empleado": 1,
      "nombre": "Carlos",
      "apellido": "Pérez",
      "correo": "usuario@gmail.com",
      "id_tipo_empleado": 6,
      "tipo_empleado": "Médico"
    }
  }
}
```

### 4.3 Manejo de Tokens y Axios Interceptor (`src/services/api.js`)
- **Headers de Autorización**: Todas las peticiones HTTP que pasan por el cliente `api` inyectan automáticamente el encabezado:
  `Authorization: Bearer <jwt_token>`
- **Refresco Automático de Token (401 Handling)**:
  - Si una petición falla con código HTTP `401` y el backend devuelve `UNAUTHENTICATED`:
  - El interceptor de Axios detiene la petición, llama a `POST /refresh_token` con `{ "refresh_token": "<token_guardado>" }`.
  - Si el backend responde con un nuevo token, se guarda en `SecureStore` y se reintenta la petición original con el nuevo token.
  - Si la renovación falla o el refresh token expiró, se ejecuta `forceLogout()` para limpiar la sesión en `AuthContext` y redirigir al usuario a la pantalla de Login.

---

## 5. Tabla de Endpoints del Backend (`DIRPOLES-4`)

A continuación se lista la especificación exacta de las rutas vigentes en el backend PHP:

| Módulo | Acción Móvil | Verbo HTTP | Ruta Exacta Backend | Descripción / Body |
| :--- | :--- | :---: | :--- | :--- |
| **Autenticación** | `login` | `POST` | `/iniciar_sesion` | `{ correo, password }` |
| **Autenticación** | `checkSession` / `me` | `GET` | `/api/perfil/obtener` | Header `Authorization: Bearer <token>` |
| **Autenticación** | `logout` | `GET` | `/logout` | Revoca tokens y sesión en el backend |
| **Autenticación** | `refreshToken` | `POST` | `/refresh_token` | `{ refresh_token }` |
| **Beneficiarios** | `listar` | `GET` | `/api/beneficiarios/listar` | Lista paginada / con filtros |
| **Beneficiarios** | `validarDuplicado` | `POST` | `/api/beneficiarios/validar_duplicado` | `{ cedula }` |
| **Beneficiarios** | `crear` | `POST` | `/api/beneficiarios/crear` | Payload completo del estudiante |
| **Beneficiarios** | `obtenerDetalle` | `GET` | `/api/beneficiarios/detalle/{id}` | Información detallada del beneficiario |
| **Beneficiarios** | `actualizar` | `PUT` | `/api/beneficiarios/actualizar/{id}` | Edición de beneficiario |
| **Citas** | `listar` | `GET` | `/api/citas/listar` | Lista de citas registradas |
| **Citas** | `crear` | `POST` | `/api/citas/crear` | `{ id_beneficiario, id_servicio, fecha, ... }` |
| **Citas** | `cambiarEstado` | `PUT` | `/api/citas/cambiar_estado` | `{ id_cita, estado }` |
| **Citas** | `obtenerServicios`| `GET` | `/api/citas/servicios` | Lista de servicios disponibles |
| **Inventario** | `listar` | `GET` | `/api/inventario/listar` | Insumos y medicamentos en stock |
| **Inventario** | `registrarMovimiento`| `POST` | `/api/inventario/registrar_movimiento` | `{ id_insumo, tipo: "ENTRADA"\|"SALIDA", cantidad }` |
| **Perfil** | `obtenerPerfil` | `GET` | `/api/perfil/obtener` | Datos del usuario autenticado |
| **Perfil** | `actualizarPerfil`| `PUT` | `/api/perfil/actualizar` | Cambios en datos personales |
| **Perfil** | `cambiarClave` | `POST` | `/api/perfil/cambiar_clave` | `{ clave_actual, clave_nueva }` |

---

## 6. Estructura de Directorios

```
DIRPOLES_APP/
├── App.js                      # Punto de entrada principal (Providers, AppNavigator)
├── package.json                # Expo SDK 52, React Native 0.76, React Native Paper, Lucide Icons
├── src/
│   ├── components/             # Componentes de UI reutilizables
│   │   ├── Beneficiarios/      # Modales y tarjetas de beneficiarios
│   │   ├── Citas/              # Tarjetas y selectores de citas
│   │   ├── Inventario/         # Componentes de stock y movimientos
│   │   └── UI/                 # CustomModal, CustomInput, StatCard, LoadingOverlay
│   ├── config/
│   │   └── rsaKeys.js          # Clave pública RSA del backend
│   ├── constants/
│   │   └── config.js           # BASE_URL, API_URL, COLORS, STORAGE_KEYS
│   ├── context/
│   │   └── AuthContext.js      # Contexto global de sesión (user, login, logout)
│   ├── hooks/                  # Custom Hooks con la lógica de negocio/formularios
│   │   ├── useLoginForm.js     # Estado y validación del formulario de Login
│   │   ├── useBeneficiarioForm.js
│   │   └── useCitas.js
│   ├── navigation/
│   │   ├── AppNavigator.js     # Stack Navigator principal (Auth vs App)
│   │   └── TabNavigator.js     # Bottom Tabs (Dashboard, Beneficiarios, Citas, Inventario, Perfil)
│   ├── screens/                # Pantallas por módulo
│   │   ├── auth/ (LoginScreen.js)
│   │   ├── Dashboard/
│   │   ├── beneficiarios/
│   │   ├── citas/
│   │   ├── inventario/
│   │   ├── perfil/
│   │   └── reportes/
│   ├── services/               # Capa de consumo de API y almacenamiento
│   │   ├── api.js              # Instancia de Axios con Interceptores JWT y Refresh
│   │   ├── authService.js      # Servicios de Login, Logout y CheckSession
│   │   ├── beneficiarioService.js
│   │   ├── citaService.js
│   │   ├── inventarioService.js
│   │   └── perfilService.js
│   └── utils/                  # Utilidades y Validadores puros
│       ├── rsaEncrypt.js       # Función encryptRSA() con JSEncrypt
│       ├── validators.js       # isValidEmail, isValidPassword, isValidCedula, etc.
│       ├── citasValidation.js
│       ├── inventarioValidation.js
│       └── perfilValidation.js
```

---

## 7. Reglas de Validación y Tratamiento de Errores

### 7.1 Validación de Contraseña
- **Función**: `isValidPassword(password)` en `src/utils/validators.js`.
- **Regla**: Debe ser un string no vacío con una longitud **mínima de 6 caracteres**.
- **Caracteres Permitidos**: Acepta cualquier carácter válido (letras, números, puntos `.`, arrobas `@`, guiones `-`, guiones bajos `_`, símbolos especiales).

### 7.2 Distinción entre Errores HTTP vs Errores de Red
Al realizar peticiones a través de `authService` o la capa de servicios:
1. `if (error.response)`: El servidor respondió con un código HTTP fuera de 2xx (ej. 400 Bad Request, 401 Unauthorized, 500 Internal Error). Se debe extraer la propiedad de mensaje del JSON (`datos.mensaje`, `error.mensaje`, `mensaje`) o dar feedback amigable de credenciales incorrectas.
2. `else if (error.request)`: Hubo un fallo en la conexión de red (el servidor no responde o no hay internet/WiFi local). Se muestra el modal de fallo de red.

---

## 8. Guía para Agentes IA (Principios y Buenas Prácticas)

Cuando modifiques o extiendas este código, debes cumplir las siguientes reglas:

1. **Desacoplamiento Estricto**:
   - Mantén la lógica del formulario en Custom Hooks (`src/hooks/`).
   - Mantén la comunicación HTTP en los servicios (`src/services/`).
   - Mantén las pantallas (`src/screens/`) enfocadas únicamente en la presentación UI.
2. **Cifrado RSA**:
   - Nunca envíes contraseñas en texto plano al backend. Utiliza siempre `encryptRSA(password)`.
3. **Persistencia Segura**:
   - Utiliza exclusivamente `Expo SecureStore` a través de `STORAGE_KEYS` para guardar tokens e información del usuario. Nunca uses `AsyncStorage` para datos sensibles.
4. **Respetar los Interceptores de Axios**:
   - Las peticiones autenticadas deben usar la instancia `api` exportada por `src/services/api.js` para aprovechar automáticamente los interceptores de token y refresco.
5. **Alineación con el Backend Monolítico `DIRPOLES-4`**:
   - Respeta los endpoints listados en la Sección 5. Si agregas o modificas un endpoint, asegúrate de mantener la sincronía con los controladores PHP del backend.
