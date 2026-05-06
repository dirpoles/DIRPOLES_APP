# Manual Técnico: Módulo de Autenticación - DIRPOLES Mobile

Este documento detalla la implementación del sistema de inicio de sesión de la aplicación móvil DIRPOLES, diseñada bajo estándares de alta calidad y arquitectura limpia.

## 1. Arquitectura del Sistema (Principios SOLID)

Hemos aplicado el principio de **Responsabilidad Única (SRP)** dividiendo el módulo en capas claramente diferenciadas:

### A. Capa de Servicios (`src/services/authService.js`)
- **Responsabilidad**: Comunicación exclusiva con la API de DIRPOLES_4 y persistencia segura de datos.
- **Implementación**: Utiliza `axios` para peticiones HTTP y `expo-secure-store` para guardar el token JWT de forma cifrada en el dispositivo.
- **Seguridad**: No expone lógica de UI, solo retorna objetos estandarizados `{ success: bool, data: any, message: string }`.

### B. Capa de Estado Global (`src/context/AuthContext.js`)
- **Responsabilidad**: Gestionar el estado de la sesión en toda la app (¿está el usuario logueado?).
- **Implementación**: Usa el API `Context` de React. Provee las funciones `login` y `logout` a cualquier componente mediante el hook personalizado `useAuth()`.

### C. Capa de Interfaz (`src/screens/Auth/LoginScreen.js`)
- **Responsabilidad**: Presentar el formulario y capturar la interacción del usuario.
- **Implementación**: 
    - Basada en **React Native Paper** para componentes elegantes.
    - Iconografía moderna con **Lucide React**.
    - Estilo premium con sombras suaves y paleta de colores corporativa (Azul #2563EB).

## 2. Tecnologías y Librerías Utilizadas

- **React Native Paper**: Librería de componentes basada en Material Design, personalizada para la estética DIRPOLES.
- **Lucide React Native**: Set de iconos vectoriales ligeros y modernos.
- **Expo Secure Store**: Almacenamiento seguro para tokens sensibles (equivalente a Keychain/Keystore).
- **React Navigation**: Gestión de flujos de navegación (Auth Stack vs. App Stack).

## 3. Manejo del Teclado y UX

Para cumplir con el requerimiento de comodidad al escribir:
- **`KeyboardAvoidingView`**: La pantalla se ajusta automáticamente (desplazamiento hacia arriba) cuando el teclado aparece, evitando que los inputs queden ocultos.
- **`ScrollView`**: Permite el desplazamiento manual si el contenido excede el espacio disponible, asegurando que la app sea usable en cualquier tamaño de pantalla.

## 4. Integración con el Backend (DIRPOLES_4)

El sistema está configurado para enviar el objeto esperado por el controlador centralizado `movilController.php`:
- **Endpoint**: `${API_URL}/movil`
- **Payload (Login)**:
  ```json
  {
    "accion": "login",
    "correo": "usuario@ejemplo.com",
    "password": "mi_password"
  }
  ```
- **Validación de Sesión (Acción 'me')**:
  Envía `{ "accion": "me" }` con el header `Authorization: Bearer <token>`.
- **Respuesta esperada**: Un JSON con las claves `estado` (exito/error), `mensaje`, `token` y `empleado`.

## 5. Mantenimiento y Errores

Si se requiere cambiar la URL de la API, modificar el archivo `src/constants/config.js`. Todos los errores de red están centralizados en `authService.js` con mensajes amigables para el usuario final.

## 6. Dashboard y Navegación Principal

El Dashboard se ha estructurado para ofrecer una experiencia de usuario fluida y acceso rápido a los módulos clave.

### A. Navegación por Pestañas (`src/navigation/TabNavigator.js`)
- **Responsabilidad**: Gestionar el menú inferior de la aplicación.
- **Implementación**: Utiliza `@react-navigation/bottom-tabs`. Incluye 5 secciones principales:
    1. **Inicio**: Panel central con calendario.
    2. **Beneficiarios**: Gestión de personas.
    3. **Citas**: Control detallado de agendas.
    4. **Inventario**: Stock de insumos médicos.
    5. **Reportes**: Visualización estadística (vía microservicio IA si aplica).
- **Estética**: Iconografía consistente de **Lucide React** y colores corporativos.

### B. Cabecera Personalizada (Header)
Cada pantalla del Dashboard incluye una cabecera global:
- **Perfil**: Acceso rápido a datos del usuario (Icono superior derecho).
- **Cerrar Sesión**: Botón de salida directa integrado con `AuthContext`.

### C. Calendario de Citas (`src/screens/Dashboard/HomeScreen.js`)
Se integró la librería `react-native-calendars` para el centro del Dashboard:
- **Funcionalidad**: Visualización de citas programadas y selección de fechas.
- **Localización**: Configurado totalmente en español.

## 8. Sistema de Validaciones y Feedback (SOLID)

Para garantizar la integridad de los datos y una experiencia de usuario premium, se implementó un sistema de validación robusto.

### A. Validadores Centralizados (`src/utils/validators.js`)
- **Responsabilidad**: Contener las reglas de negocio y expresiones regulares.
- **Lógica**: Utiliza los mismos Regex de **DIRPOLES_4**:
    - **Email**: Solo permite dominios específicos (hotmail, gmail, yahoo, outlook) y extensiones (.com, .es, .net, .org).
    - **Password**: Requiere exactamente 8 caracteres con al menos una letra.
- **Uso**: La función `validateField` devuelve el mensaje de error específico para cada campo.

### B. Validaciones en Tiempo Real
- **Implementación**: En `LoginScreen.js`, el evento `onChangeText` dispara la validación de forma inmediata.
- **UX**: Los mensajes de error se muestran dinámicamente debajo de cada input, y el componente `TextInput` cambia su estado visual (color rojo) automáticamente.

### C. Componente Reutilizable: `CustomModal` (`src/components/UI/CustomModal.js`)
- **Responsabilidad**: Mostrar alertas personalizadas con una estética superior a los diálogos nativos.
- **Características**:
    - **Temas Dinámicos**: Cambia de color (Verde, Rojo, Azul, Naranja) e icono según el tipo (`success`, `error`, `info`, `warning`).
    - **Animaciones**: Entrada suave tipo "Fade" con overlay semi-transparente.
    - **Independencia**: Diseñado para ser usado en cualquier parte de la aplicación simplemente pasando los props necesarios.
