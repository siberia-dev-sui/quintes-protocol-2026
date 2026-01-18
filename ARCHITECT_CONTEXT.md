# Contexto de Arquitectura - Quintes Protocol
## Integración iExec (Estado: ✅ MIGRADO Y FUNCIONAL)

Este documento sirve como la "Fuente de Verdad" técnica para el proyecto Quintes Protocol (Neo V6).

### 🕒 Resumen de Acciones Recientes (31-Diciembre-2025)
Para asegurar que todo el contexto esté intacto, aquí detallo exactamente qué hice y qué **no** se rompió:

1.  **Migración de Backend Proxy:**
    *   Copié la lógica funcional de `iexec-reference` a la carpeta `/backend`.
    *   Instalé dependencias y configuré el `.env`.
    *   **Mejora:** Implementé un sistema de persistencia local en `backend/data/registrations.json` para que los registros no queden "en el aire".

2.  **Actualización de `js/web3-connect.js`:**
    *   Sustituí el "Mock" (que solo hacía `console.log`) por llamadas reales a la API.
    *   **No se rompió nada:** Mantuve toda la lógica de conexión a MetaMask, verificación de red y estilos originales. Solo cambié lo que ocurre *después* de que el usuario hace click en enviar.

3.  **Reparación de `js/webflow.js`:**
    *   Corregí errores de sintaxis críticos que detecté:
        *   **Línea 1761:** `1.toString` -> `1..toString` (Error de literal numérico).
        *   **Línea 3073:** Espacio innecesario en optional chaining `? .` -> `?.`.
    *   Esto hace que el archivo sea ahora procesable por cualquier transpilador o minificador sin errores.

---

### 🏛️ Decisiones Técnicas Consolidadas
- **Estrategia de Gas (Relayer):** Utilizamos el patrón "Backend-as-a-Proxy". El backend (Node.js) actúa como el relayer pagando el gas en Arbitrum Sepolia. El usuario tiene una experiencia **Gasless**.
- **Privacidad Profunda:** Usamos `@iexec/web3mail` v1.6.0. La infraestructura de iExec asegura que el email real del usuario nunca sea visible ni para nosotros ni para la red on-chain.
- **Arquitectura "Dumb Frontend":** El frontend no maneja SDKs pesados ni llaves privadas. Es estático y seguro.

---

### 📋 Tareas Pendientes (Próximos Pasos)
1.  **Despliegue de Backend:** Mover el backend a Railway, Render o un VPS VPS.
2.  **Configuración de Producción:** 
    *   Actualizar `CONFIG.API_URL` en el frontend con la URL del servidor desplegado.
    *   Configurar un **KMS (Key Management Service)** para las llaves privadas del backend.
3.  **Auditoría Shariah:** Preparar el disclaimer técnico sobre el modelo de subvención de utilidad para la certificación de cumplimiento islámico.

---

### 🛡️ Reporte de Integridad
- [x] **MetaMask Link:** Operativo.
- [x] **Network Switcher:** Operativo (Arbitrum Sepolia).
- [x] **iExec Flow:** Operativo (3 Pasos: Enclave -> Permiso -> Envío).
- [x] **Persistencia:** Activa.
