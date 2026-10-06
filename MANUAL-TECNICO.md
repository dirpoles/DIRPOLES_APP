# Manual Técnico Completo - DIRPOLES Mobile Application

Este documento proporciona una especificación técnica detallada sobre la arquitectura, estructura, componentes, servicios y modelo de integración con el backend de la aplicación móvil **DIRPOLES Mobile**.

---

## 1. Visión General del Proyecto

**DIRPOLES Mobile** es una solución móvil desarrollada con **React Native** y **Expo (SDK 52)** para la gestión de beneficiarios, citas médicas y psicológicas, inventario de insumos y reportes estadísticos de la organización DIRPOLES. 

La aplicación opera como un cliente móvil desacoplado que consume una API centralizada en PHP (**DIRPOLES_4**).

### Características Principales:
- **Autenticación Segura**: Transmisión de credenciales cifradas con el algoritmo **RSA** y almacenamiento seguro de tokens con `expo-secure-store`.
- **Arquitectura Limpia (SOLID)**: Estricta separación de responsabilidades entre la interfaz visual, custom hooks de negocio, contexto global y capa de infraestructura HTTP.
- **Navegación Intuitiva**: Control de flujos mediante React Navigation (Stack Navigator y Bottom Tabs Navigator).
- **Gestión Integral**: Módulos completos para Beneficiarios, Citas/Agenda, Inventario Médico, Perfil de Usuario y Reportes Estadísticos.
- **UX/UI Moderno**: Basado en `react-native-paper`, iconografía vectorial con `lucide-react-native`, animaciones dinámicas y diálogos interactivos reutilizables (`CustomModal`).

---

## 2. Estructura Completa del Repositorio

A continuación se describe la distribución de carpetas y archivos del repositorio:

```text
DIRPOLES_APP/
├── App.js                         # Punto de entrada principal (Envoltorio de AuthProvider y PaperProvider)
├── app.json                       # Configuración del proyecto Expo (nombre, versión, splash screen)
├── babel.config.js                # Configuración de compilación de Babel
├── package.json                   # Gestión de dependencias y scripts de desarrollo
├── README.md                      # Instrucciones rápidas de instalación y uso
├── MANUAL-TECNICO.md              # Manual técnico integral del repositorio (este documento)
├── assets/                        # Assets estáticos (iconos de app, imágenes de carga)
└── src/                           # Código fuente del cliente móvil
    ├── components/                # Componentes de interfaz de usuario organizados por módulo
    │   ├── Beneficiarios/         # Vistas secundarias de Beneficiarios
    │   │   ├── BeneficiarioCard.js# Tarjeta de resumen de beneficiario
    │   │   ├── BeneficiarioForm.js# Formulario modal de registro y edición
    │   │   └── BeneficiarioList.js# Listado optimizado de beneficiarios
    │   ├── Citas/                 # Vistas secundarias de Citas
    │   │   ├── CitaCard.js        # Tarjeta de detalles de la cita
    │   │   ├── CitaForm.js        # Formulario de agendamiento y validación de horarios
    │   │   └── CitaList.js        # Listado de citas agendadas
    │   ├── Inventario/            # Vistas secundarias de Inventario
    │   │   ├── InsumoCard.js      # Tarjeta de insumo con alerta de stock
    │   │   ├── InsumoForm.js      # Formulario para registro/edición de insumos
    │   │   └── InventarioList.js  # Listado filtrable de inventario médico
    │   └── UI/                    # Componentes UI reutilizables
    │       └── CustomModal.js     # Modal animado reutilizable para alertas y confirmaciones
    ├── config/                    # Configuraciones de seguridad
    │   └── rsaKeys.js             # Clave pública RSA del servidor
    ├── constants/                 # Constantes globales del cliente
    │   └── config.js              # URL base de la API, colores corporativos y timeouts
    ├── context/                   # Estado global de la aplicación
    │   └── AuthContext.js         # Proveedor del estado de autenticación y datos de usuario
    ├── hooks/                     # Custom Hooks (Lógica de negocio desacoplada de la UI)
    │   ├── useBeneficiarioForm.js # Lógica de validación y guardado de beneficiarios
    │   ├── useBeneficiariosList.js# Lógica de carga y búsqueda de beneficiarios
    │   ├── useCitaForm.js         # Lógica de selección de horarios y psicólogos
    │   ├── useCitasList.js        # Lógica de consulta de la agenda de citas
    │   ├── useInsumoForm.js       # Lógica del formulario de insumos médicos
    │   ├── useInventarioList.js   # Lógica de carga e inventario médico
    │   ├── useLoginForm.js        # Lógica del formulario de inicio de sesión
    │   ├── usePerfil.js           # Lógica de carga y edición de perfil del empleado
    │   └── useReportes.js         # Lógica de métricas e indicadores de reporte
    ├── navigation/                # Configuración de rutas de navegación
    │   ├── AppNavigator.js        # Navegación Stack principal (Flujo Auth vs Flujo App)
    │   └── TabNavigator.js        # Navegación por pestañas inferiores (Bottom Tabs)
    ├── screens/                   # Pantallas/Vistas principales de la aplicación
    │   ├── auth/
    │   │   └── LoginScreen.js     # Pantalla de inicio de sesión
    │   ├── beneficiarios/
    │   │   └── BeneficiariosScreen.js # Pantalla principal del módulo de beneficiarios
    │   ├── citas/
    │   │   └── CitasScreen.js     # Pantalla principal del módulo de citas
    │   ├── Dashboard/
    │   │   └── HomeScreen.js      # Pantalla de inicio con calendario interactivo
    │   ├── inventario/
    │   │   └── InventarioScreen.js# Pantalla principal del módulo de inventario
    │   ├── perfil/
    │   │   └── PerfilScreen.js    # Pantalla de perfil de usuario/empleado
    │   └── reportes/
    │       └── ReportesScreen.js  # Pantalla de reportes y métricas estadísticas
    ├── services/                  # Capa de comunicación HTTP con la API Backend (Axios)
    │   ├── api.js                 # Instancia global de Axios con interceptores JWT
    │   ├── authService.js         # Servicio HTTP de login, logout y validación de sesión
    │   ├── beneficiarioService.js # Servicio HTTP para operaciones de beneficiarios
    │   ├── citaService.js         # Servicio HTTP para agendamiento, horarios y citas
    │   ├── dataService.js         # Servicio de soporte de datos
    │   ├── inventarioService.js   # Servicio HTTP para gestión del inventario médico
    │   ├── perfilService.js       # Servicio HTTP para consulta y actualización de perfil
    │   └── reporteService.js      # Servicio HTTP para descarga de indicadores estadísticos
    └── utils/                     # Utilidades y validaciones
        ├── citasValidation.js     # Reglas de validación para agendas y citas
        ├── inventarioValidation.js# Reglas de validación para campos de insumos
        ├── perfilValidation.js    # Reglas de validación para edición de perfil
        ├── rsaEncrypt.js          # Helper de cifrado RSA con JSEncrypt
        └── validators.js          # Expresiones regulares para email, cédula y contraseñas
```

---

## 3. Arquitectura del Sistema (Principios SOLID)

El proyecto adopta una **Arquitectura por Capas Desacopladas** aplicando los principios SOLID:

```text
+-------------------------------------------------------------------------+
|                         Capa de Presentación (UI)                       |
|   (Screens: LoginScreen, HomeScreen, BeneficiariosScreen, etc.)          |
|   (Components: BeneficiarioCard, CitaForm, CustomModal, etc.)           |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                  Capa de Lógica de Negocio (Custom Hooks)               |
|   (useLoginForm, useCitaForm, useBeneficiarioForm, usePerfil, etc.)     |
+-------------------------------------------------------------------------+
                        |                               |
                        v                               v
+-------------------------------+   +-------------------------------------+
| Capa Estado Global (Context)  |   | Capa de Servicios HTTP (Axios)      |
| (AuthContext.js)              |   | (authService, beneficiarioService)  |
+-------------------------------+   +-------------------------------------+
                                                        |
                                                        v
                                    +-------------------------------------+
                                    |   Axios Interceptor (`api.js`)      |
                                    |   Inyección de `Bearer <token>`     |
                                    +-------------------------------------+
                                                        |
                                                        v
                                    +-------------------------------------+
                                    |  Backend PHP (DIRPOLES_4/api/movil) |
                                    +-------------------------------------+
```

### Principios Aplicados:
1. **Single Responsibility Principle (SRP)**:
   - **Screens / Components**: Solo se encargan del renderizado de la interfaz de usuario.
   - **Custom Hooks (`src/hooks`)**: Concentran la lógica de estado, manejo de inputs, validación y disparo de peticiones.
   - **Services (`src/services`)**: Gestionan en exclusiva la comunicación HTTP con la API REST/JSON.
2. **Open/Closed Principle (OCP)**:
   - Componentes UI como `CustomModal.js` están cerrados a modificación pero abiertos a extensión mediante props dinámicos (`type`, `title`, `onConfirm`, `onClose`).
3. **Dependency Inversion Principle (DIP)**:
   - Las pantallas dependen de abstracciones expuestas por los hooks y servicios, no de implementaciones HTTP directas.

---

## 4. Integración con el Backend (DIRPOLES_4)

### Modelo de Comunicación Centralizada
Toda comunicación entre el cliente móvil y el servidor PHP **DIRPOLES_4** se realiza mediante el endpoint centralizado `/api/movil` (atendido por el controlador `movilController.php`).

Las peticiones utilizan el método HTTP **`POST`** con un cuerpo JSON normalizado conteniendo las propiedades `modulo` y `accion`:

```json
{
  "modulo": "nombre_del_modulo",
  "accion": "nombre_de_la_accion",
  "parametro_1": "valor_1",
  "parametro_2": "valor_2"
}
```

### Encabezados de Red
```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <TOKEN_JWT>
```

### Formato Único de Respuesta (Backend JSON)
```json
{
  "estado": "exito" | "error",
  "mensaje": "Mensaje informativo para la interfaz",
  "datos": [] | {},
  "token": "cadena_jwt_opcional"
}
```

### Catálogo de Módulos y Acciones del Backend

| Módulo | Acción (`accion`) | Descripción de la Operación |
| :--- | :--- | :--- |
| `general` | `login` | Autentica las credenciales (correo y contraseña cifrada RSA). |
| `general` | `me` | Revalida el token JWT activo del dispositivo. |
| `general` | `logout` | Notifica al servidor el cierre de sesión activo. |
| `beneficiarios` | `consultar_beneficiarios` | Retorna el catálogo completo de beneficiarios activos. |
| `beneficiarios` | `registrar_beneficiario` | Registra un nuevo beneficiario en el sistema. |
| `beneficiarios` | `actualizar_beneficiario` | Modifica los datos de un beneficiario existente. |
| `beneficiarios` | `desactivar_beneficiario` | Realiza el borrado lógico de un beneficiario. |
| `beneficiarios` | `validar_duplicado` | Comprueba si una cédula o correo ya existe en la BD. |
| `citas` | `consultar_citas` | Obtiene el listado de citas según el empleado/rol logueado. |
| `citas` | `consultar_beneficiarios_activos` | Obtiene los beneficiarios aptos para agendar citas. |
| `citas` | `consultar_psicologos` | Carga el listado de psicólogos/especialistas disponibles. |
| `citas` | `validar_fecha_cita` | Verifica si el psicólogo atiende en la fecha seleccionada. |
| `citas` | `validar_hora_cita` | Comprueba la disponibilidad del bloque de hora seleccionado. |
| `citas` | `obtener_horario_psicologo` | Obtiene la jornada semanal de trabajo del especialista. |
| `citas` | `registrar_cita` | Agenda una nueva cita clínica/psicológica. |
| `citas` | `actualizar_cita` | Actualiza la información o estado de una cita existente. |
| `citas` | `desactivar_cita` | Cancela o desactiva la cita especificada. |
| `inventario` | `consultar_inventario_medico` | Devuelve el catálogo de insumos y medicamentos. |
| `inventario` | `consultar_presentaciones_insumo` | Devuelve los tipos de presentación disponibles (frasco, caja, etc.). |
| `inventario` | `registrar_insumo` | Registra un nuevo ítem en el stock de inventario. |
| `inventario` | `actualizar_insumo` | Actualiza cantidades, lote o datos del insumo. |
| `inventario` | `desactivar_insumo` | Elimina lógicamente un insumo del catálogo. |
| `perfil` | `consultar_perfil` | Retorna los datos personales del empleado autenticado. |
| `perfil` | `actualizar_perfil` | Modifica los datos personales o contraseña del usuario. |
| `reportes` | `consultar_reportes_movil` | Obtiene el resumen de métricas y estadísticas consolidadas. |

---

## 5. Módulos Operativos de la Aplicación

### 5.1. Autenticación y Seguridad (`src/screens/auth/LoginScreen.js`)
- **Cifrado RSA**: Las contraseñas ingresadas se encriptan con la clave pública del servidor (`src/config/rsaKeys.js`) usando `JSEncrypt` (`src/utils/rsaEncrypt.js`) antes de enviarlas por red.
- **Persistencia Segura**: Tras un inicio exitoso, el token JWT y los datos del usuario se almacenan mediante `expo-secure-store`.
- **Manejo de Sesión**: `AuthContext` expone los métodos `login()`, `logout()` y `checkSession()`.

### 5.2. Dashboard Principal (`src/screens/Dashboard/HomeScreen.js`)
- Muestra el resumen del sistema y el calendario interactivo (`react-native-calendars`) en español.
- Permite filtrar y seleccionar fechas para ver el detalle de las citas agendadas por día.

### 5.3. Módulo de Beneficiarios (`src/screens/beneficiarios/BeneficiariosScreen.js`)
- **Búsqueda y Filtrado**: Filtrado rápido en tiempo real por cédula o nombre.
- **Formulario Modal (`BeneficiarioForm.js`)**: Soporta validación de expresiones regulares de correo, teléfono y cédula.
- **Verificación Dinámica**: Valida duplicidad en la base de datos antes de confirmar el guardado.

### 5.4. Módulo de Citas y Agendamiento (`src/screens/citas/CitasScreen.js`)
- **Control de Agenda**: Agendamiento guiado seleccionando Beneficiario y Psicólogo.
- **Validación de Horarios**: Revisa automáticamente si la fecha solicitada corresponde a los días de trabajo del especialista y si el bloque de horas está disponible.

### 5.5. Módulo de Inventario Médico (`src/screens/inventario/InventarioScreen.js`)
- **Catálogo de Stock**: Muestra insumos, presentación, lote y fecha de vencimiento.
- **Indicadores de Stock Bajo**: Resalta visualmente aquellos insumos con existencias por debajo del umbral mínimo.

### 5.6. Módulo de Perfil (`src/screens/perfil/PerfilScreen.js`)
- Permite la actualización de la información del empleado autenticado.
- Soporta cambio de clave cifrada RSA.

### 5.7. Módulo de Reportes (`src/screens/reportes/ReportesScreen.js`)
- Muestra tarjetas de métricas cuantitativas: total de beneficiarios, citas atendidas, citas pendientes, insumos en alerta de stock bajo y gráficos de estado general.

---

## 6. Sistema de Navegación

La navegación de la aplicación utiliza **React Navigation v6**:

1. **`AppNavigator.js` (Stack Navigator)**:
   - Si `isAuthenticated === false`: Carga la pantalla de `Login`.
   - Si `isAuthenticated === true`: Carga el contenedor principal `Main` (`TabNavigator`) y permite la navegación hacia la pantalla de `Perfil`.

2. **`TabNavigator.js` (Bottom Tab Navigator)**:
   - Configura las 5 pestañas principales accesibles en la parte inferior de la pantalla:
     - **Inicio** (`HomeScreen`)
     - **Beneficiarios** (`BeneficiariosScreen`)
     - **Citas** (`CitasScreen`)
     - **Inventario** (`InventarioScreen`)
     - **Reportes** (`ReportesScreen`)
   - En el encabezado superior incluye botones globales para el Perfil y Cierre de Sesión con confirmación modal.

---

## 7. Componentes Reutilizables y UX

### `CustomModal` (`src/components/UI/CustomModal.js`)
Modal de diálogo personalizado universal para reemplazar los diálogos emergentes nativos de Android e iOS:
- **Tipos de Alerta**: `success`, `error`, `warning`, `info`, `question`.
- **Características**: Entrada animada tipo "fade", íconos vectoriales de `lucide-react-native`, fondo oscurecido translúcido y botones de confirmación/cancelación configurables.

### Ajuste de Interfaz y Teclado
- **`KeyboardAvoidingView`**: Desplaza la vista verticalmente cuando el teclado en pantalla está activo para evitar que tape las cajas de texto de entrada (`TextInput`).
- **`ScrollView`**: Garantiza el despliegue correcto en dispositivos con pantallas de menor dimensión.

---

## 8. Guía de Instalación, Configuración y Despliegue

### Requisitos Técnicos
- **Node.js**: v18.0.0 o superior.
- **npm** / **yarn**.
- **Expo CLI** (incluido vía `npx expo`).
- **Servidor Web PHP / MySQL**: Instancia del proyecto **DIRPOLES_4** activa en red local o servidor remoto.

### Pasos de Configuración

1. **Clonar e instalar dependencias**:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd DIRPOLES_APP
   npm install
   ```

2. **Configurar la IP de la API Backend**:
   Abre el archivo `src/constants/config.js` y modifica la constante `API_URL` con la dirección IP local de la computadora donde está ejecutándose el backend PHP:
   ```javascript
   export const API_URL = 'http://192.168.1.100/DIRPOLES_4/api';
   ```

3. **Ejecutar en Entorno de Desarrollo**:
   ```bash
   # Iniciar servidor Expo Metro Bundler
   npx expo start

   # Ejecutar en Android
   npm run android

   # Ejecutar en iOS
   npm run ios
   ```
