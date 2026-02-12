<![CDATA[# 🏥 DEPLOY.md — Sistema de Agendamiento de Citas Médicas

> **Versión 1.0** | Febrero 2026  
> Web App + Mobile App | Documento de Planificación de Proyecto

---

## 📑 Tabla de Contenidos

- [1. Resumen Ejecutivo](#1-resumen-ejecutivo)
- [2. Stack Tecnológico Recomendado](#2-stack-tecnológico-recomendado)
- [3. Arquitectura del Sistema](#3-arquitectura-del-sistema)
- [4. Módulos Funcionales Detallados](#4-módulos-funcionales-detallados)
- [5. Sistema de Promociones](#5-sistema-de-promociones)
- [6. Sistema de Roles y Permisos](#6-sistema-de-roles-y-permisos)
- [7. Recomendaciones UX](#7-recomendaciones-para-elevar-la-experiencia-de-usuario)
- [8. Fases del Proyecto y Cronograma](#8-fases-del-proyecto-y-cronograma)
- [9. Cronograma Resumen](#9-cronograma-resumen)
- [10. Equipo Recomendado](#10-equipo-recomendado)
- [11. Estimación de Costos](#11-estimación-de-costos)
- [12. Seguridad y Compliance](#12-seguridad-y-cumplimiento-normativo)
- [13. KPIs y Métricas](#13-kpis-y-métricas-de-éxito)
- [14. Próximos Pasos](#14-próximos-pasos)

---

## 1. Resumen Ejecutivo

Este documento presenta la planificación integral para el desarrollo de un **sistema de agendamiento de citas médicas** compuesto por una aplicación web y una aplicación móvil nativa. El sistema permitirá a los usuarios agendar citas presenciales y virtuales, laboratorios a domicilio, exámenes e imágenes, encontrar centrales médicas cercanas, acceder a promociones y gestionar su historial médico de manera integral.

El sistema incluye un robusto manejo de roles (Administrador, Doctor, Usuario e Invitado), integración con pasarelas de pago, sistema de notificaciones en tiempo real, chat médico-paciente, y un motor de promociones flexible.

### 1.1 Objetivos del Proyecto

- **Objetivo Principal:** Desarrollar una plataforma digital que simplifique y optimice el proceso de agendamiento de citas médicas para hospitales y clínicas.
- **Accesibilidad:** Disponible como aplicación web responsive y apps nativas para iOS y Android.
- **Experiencia de Usuario:** Interfaz intuitiva que permita agendar una cita en menos de 3 clics.
- **Escalabilidad:** Arquitectura preparada para múltiples hospitales, sedes y miles de usuarios concurrentes.
- **Monetización:** Sistema de pagos integrado con soporte para promociones, bundles y cupones.

### 1.2 Alcance

El proyecto abarca el diseño, desarrollo, pruebas y despliegue de:

- Panel Administrativo Web (backoffice)
- Portal Web para pacientes (responsive)
- Aplicación móvil iOS y Android
- API Backend centralizada
- Sistema de notificaciones (push, email, SMS)
- Integración con pasarela de pagos
- Sistema de videoconferencia para citas virtuales

---

## 2. Stack Tecnológico Recomendado

Tras evaluar múltiples alternativas considerando rendimiento, ecosistema, comunidad, costo de desarrollo y mantenimiento a largo plazo, se recomienda el siguiente stack:

### 2.1 Frontend Web

| Tecnología | Versión | Justificación |
|---|---|---|
| **Next.js** | 14+ | Framework React con SSR/SSG, SEO optimizado, rendimiento superior, App Router |
| **TypeScript** | 5.x | Tipado estático para prevenir errores, mejor DX y mantenibilidad |
| **Tailwind CSS** | 3.x | Diseño rápido y consistente, altamente personalizable, pequeño bundle |
| **Zustand / TanStack Query** | Latest | Estado global ligero + cache de datos del servidor |
| **shadcn/ui** | Latest | Componentes accesibles y personalizables basados en Radix UI |

### 2.2 Frontend Mobile

| Tecnología | Versión | Justificación |
|---|---|---|
| **React Native** | 0.73+ | Código compartido con web (hasta 60-70%), comunidad masiva, rendimiento nativo |
| **Expo** | 50+ | Simplifica builds, OTA updates, acceso a APIs nativas sin configuración |
| **React Navigation** | 6.x | Navegación nativa fluida con soporte de deep linking |

> **💡 Alternativa considerada:** Flutter es una excelente alternativa si el equipo tiene experiencia en Dart. Sin embargo, React Native permite compartir lógica de negocio, tipos y utilidades con el frontend web (Next.js/React), reduciendo significativamente el costo de desarrollo y mantenimiento.

### 2.3 Backend

| Tecnología | Versión | Justificación |
|---|---|---|
| **Node.js + NestJS** | 20 LTS / 10.x | Arquitectura modular, inyección de dependencias, TypeScript nativo, escalable |
| **PostgreSQL** | 16+ | BD relacional robusta, soporte JSON, extensiones geoespaciales (PostGIS) |
| **Prisma ORM** | 5.x | ORM type-safe, migraciones automáticas, excelente DX |
| **Redis** | 7.x | Cache, sesiones, colas de trabajo, pub/sub para tiempo real |
| **Socket.io** | 4.x | Chat en tiempo real, notificaciones live, actualización de disponibilidad |

> **💡 Alternativa Backend:** Si el equipo prefiere Python, Django REST Framework + Celery es una alternativa sólida. Para equipos pequeños, Supabase (PostgreSQL + Auth + Realtime) puede acelerar el desarrollo inicial.

### 2.4 Infraestructura y DevOps

| Componente | Solución Recomendada |
|---|---|
| **Cloud** | AWS (ECS/Fargate) o Vercel (web) + Railway/Render (API) |
| **CI/CD** | GitHub Actions: build, test, lint, deploy automático |
| **Contenedores** | Docker + Docker Compose para desarrollo local |
| **CDN** | CloudFront o Vercel Edge Network |
| **Almacenamiento** | AWS S3 / Cloudflare R2 para archivos médicos e imágenes |
| **Monitoreo** | Sentry (errores) + Datadog/Grafana (métricas) + Logtail (logs) |
| **Email** | Resend o SendGrid para notificaciones transaccionales |

### 2.5 Servicios Externos Clave

| Servicio | Proveedor | Uso |
|---|---|---|
| **Pagos** | Stripe / MercadoPago | Cobro de citas, suscripciones, reembolsos |
| **Video** | Twilio / Daily.co / Agora | Teleconsultas médicas en tiempo real |
| **Maps** | Google Maps / Mapbox | Central Médica Cerca de Mí |
| **Push** | Firebase Cloud Messaging | Notificaciones push iOS/Android |
| **SMS** | Twilio / Vonage | Recordatorios de citas por SMS |
| **Auth** | Auth0 / Clerk / Custom JWT | Autenticación multifactor, SSO |

---

## 3. Arquitectura del Sistema

### 3.1 Arquitectura General

Se recomienda una arquitectura basada en microservicios ligeros (o un monolito modular en fase inicial) con separación clara entre capas:

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                      │
│         Next.js (Web)    +    React Native (Mobile)          │
└──────────────────────────┬──────────────────────────────────┘
                           │  REST API / WebSocket
┌──────────────────────────▼──────────────────────────────────┐
│                      API GATEWAY                             │
│                NestJS (módulos por dominio)                   │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│   Auth   │ Appoint- │ Payments │  Notif.  │   Promotions    │
│  Module  │  ments   │  Module  │  Module  │    Module       │
│          │  Module  │          │          │                 │
└────┬─────┴────┬─────┴────┬─────┴────┬─────┴────┬────────────┘
     │          │          │          │          │
┌────▼──────────▼──────────▼──────────▼──────────▼────────────┐
│                     CAPA DE DATOS                            │
│  PostgreSQL (principal) + Redis (cache) + S3 (archivos)      │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Modelo de Datos Principal

Entidades principales del sistema y sus relaciones:

| Entidad | Campos Principales | Descripción |
|---|---|---|
| **User** | id, email, phone, password_hash, role, profile_image, created_at | Usuarios del sistema (todos los roles) |
| **Doctor** | id, user_id, specialty_id, license_number, bio, consultation_price, rating | Perfil profesional del doctor |
| **Patient** | id, user_id, date_of_birth, blood_type, allergies, insurance_info | Perfil del paciente |
| **Specialty** | id, name, description, icon | Especialidades médicas |
| **MedicalCenter** | id, name, address, lat, lng, phone, hours, services | Sedes / centrales médicas |
| **DoctorSchedule** | id, doctor_id, center_id, day_of_week, start_time, end_time, slot_duration | Disponibilidad del doctor |
| **Appointment** | id, patient_id, doctor_id, center_id, type, date, time, status, price, notes | Citas agendadas |
| **AppointmentSuggestion** | id, appointment_id, doctor_id, patient_id, suggested_dates, status | Citas sugeridas por doctor |
| **Payment** | id, appointment_id, amount, method, status, transaction_id, refund_status | Registro de pagos |
| **ChatMessage** | id, sender_id, receiver_id, appointment_id, message, type, read_at | Mensajes doctor-paciente |
| **Promotion** | id, type, title, description, discount_value, conditions, valid_from, valid_to | Promociones y descuentos |
| **LabOrder** | id, patient_id, type, address, date, time, status, results_url | Laboratorios a domicilio |
| **ExamOrder** | id, patient_id, exam_type, center_id, date, time, status, results_url | Exámenes e imágenes |

---

## 4. Módulos Funcionales Detallados

### 4.1 Agendamiento de Citas Médicas (Presencial)

Flujo principal del usuario para agendar una cita presencial:

| Paso | Acción | Detalle |
|---|---|---|
| **Paso 1** | Selección de Especialidad | Búsqueda por nombre, filtro alfabético, especialidades populares destacadas |
| **Paso 2** | Selección de Central Médica | Lista de sedes disponibles para la especialidad, mapa integrado, distancia desde ubicación |
| **Paso 3** | Selección de Doctor | Lista de doctores disponibles con foto, rating, precio, próxima disponibilidad |
| **Paso 4** | Selección de Fecha/Hora | Calendario con slots disponibles, vista semanal/diaria, horarios en tiempo real |
| **Paso 5** | Confirmación y Pago | Resumen de cita, aplicar cupón/promoción, botón de pago, confirmación por email/push |

### 4.2 Agendamiento de Cita Virtual (Telemedicina)

Mismo flujo que cita presencial, con las siguientes diferencias:

- No requiere selección de central médica (la consulta es remota)
- Integración con servicio de videoconferencia (Twilio/Daily.co)
- Sala de espera virtual con indicador de turno
- Compartir pantalla y archivos durante la consulta
- Grabación opcional (con consentimiento) para referencia médica
- Chat de texto como canal alternativo durante la videoconsulta

### 4.3 Laboratorio a Domicilio

- Selección del tipo de examen de laboratorio
- Ingreso de dirección de domicilio con autocompletado (Google Places)
- Selección de fecha y franja horaria disponible
- Instrucciones pre-examen (ayuno, medicamentos, etc.)
- Seguimiento en tiempo real del técnico de laboratorio
- Resultados disponibles en la app con notificación push

### 4.4 Central Médica Cerca de Mí

- Mapa interactivo con ubicación del usuario (GPS)
- Pins de centrales médicas con info básica al hacer tap
- Filtros por especialidad, horario de atención, distancia
- Dirección y navegación integrada (abrir en Google Maps / Waze)
- Vista de lista alternativa ordenada por distancia

### 4.5 Exámenes e Imágenes

- Catálogo de exámenes: Rayos X, Resonancia, Tomografía, Ecografía, etc.
- Filtro por central médica y disponibilidad de equipos
- Preparación previa: instrucciones específicas por tipo de examen
- Resultados digitales disponibles en la app en 24-72 horas
- Compartir resultados con doctor directamente desde la app

### 4.6 Mis Citas (Próximas y Pasadas)

Panel unificado dividido en dos tabs:

#### Próximas Citas

- Cards con información de fecha, hora, doctor, especialidad y central
- Countdown timer para la próxima cita
- Acciones: Cancelar, Reprogramar, Ver detalles, Iniciar videollamada
- Recordatorios automáticos: 24h antes, 2h antes, 15min antes

#### Citas Pasadas

- Historial completo con resumen de cada cita
- Recetas y documentos adjuntos por el doctor
- Calificación y reseña del doctor (post-cita)
- Opción de reagendar con el mismo doctor

### 4.7 Sistema de Citas Sugeridas por el Doctor

Este es un **flujo diferenciador clave** de la plataforma:

| # | Descripción del Paso |
|---|---|
| **1** | El doctor, durante o después de la cita, programa citas futuras de seguimiento |
| **2** | El paciente recibe notificación push + email con las citas sugeridas |
| **3** | En la app, el paciente ve un panel especial de "Citas Sugeridas por tu Doctor" |
| **4** | Por cada cita sugerida, el paciente puede: **Aceptar**, **Modificar fecha/hora**, o **Rechazar** |
| **5** | Si modifica, el sistema verifica disponibilidad del doctor en la nueva fecha |
| **6** | El doctor recibe notificación de la decisión del paciente |
| **7** | Las citas aceptadas pasan automáticamente a "Próximas Citas" pendientes de pago |

### 4.8 Atención Prioritaria

- Botón destacado de "Atención Urgente" en el home de la app
- Click-to-call directo a la línea de emergencias del hospital
- Opción de callback: el hospital devuelve la llamada en X minutos
- Triaje digital básico previo a la llamada (síntomas principales)

---

## 5. Sistema de Promociones

Motor de promociones flexible que soporta múltiples tipos de descuentos y ofertas:

| Tipo | Descripción | Ejemplo |
|---|---|---|
| **Bundle** | Paquete de servicios a precio especial | "Chequeo Ejecutivo: Consulta + 3 exámenes por $199" |
| **% Descuento** | Porcentaje de descuento directo | "20% OFF en primera consulta de Dermatología" |
| **Compra X lleva Y** | Compra un servicio y obtén otro con descuento | "Agenda 3 sesiones de fisioterapia, la 4ta al 50%" |
| **Cupón** | Código alfanumérico canjeable | "SALUD2026 = $30 de descuento en tu próxima cita" |
| **Referidos** | Descuento por referir nuevos usuarios | "Refiere un amigo y ambos reciben $15 de crédito" |
| **Flash Sale** | Oferta por tiempo limitado | "Solo hoy: Consultas de Nutrición a $25" |
| **Primera Cita** | Descuento para nuevos pacientes | "Tu primera cita con 30% de descuento" |

### Reglas del Motor de Promociones

- Cada promoción tiene: fecha de inicio, fecha de fin, límite de usos, especialidades aplicables
- Sistema de prioridad: si aplican múltiples promociones, se usa la más beneficiosa para el paciente
- Panel admin para crear, editar, pausar y eliminar promociones
- Dashboard de métricas: usos, ingresos generados, tasa de conversión por promoción
- Validación en tiempo real del cupón durante el checkout

---

## 6. Sistema de Roles y Permisos

### 6.1 Administrador

**Descripción:** Control total del sistema

**Permisos:**

- Gestión completa de usuarios, doctores, especialidades y centrales médicas
- CRUD de promociones, bundles y cupones
- Dashboard de análisis: ingresos, citas, métricas de uso
- Configuración de precios, horarios y políticas de cancelación
- Gestión de contenido: banners, notificaciones masivas
- Reportes financieros y exportación de datos
- Auditoría: log de todas las acciones del sistema

### 6.2 Doctor

**Descripción:** Gestión de agenda y pacientes

**Permisos:**

- Configurar su disponibilidad horaria por central médica
- Ver lista de pacientes agendados por día/semana/mes
- Chat y mensajería con pacientes asignados
- Sugerir/programar citas de seguimiento para el paciente
- Adjuntar recetas, notas médicas y documentos a la cita
- Ver historial de citas con cada paciente
- Iniciar y gestionar videoconsultas

### 6.3 Usuario (Paciente)

**Descripción:** Funcionalidad completa de agendamiento

**Permisos:**

- Buscar especialidades, doctores y centrales médicas
- Agendar, reprogramar y cancelar citas
- Realizar pagos y ver historial de transacciones
- Chat con doctores asignados
- Aceptar, modificar o rechazar citas sugeridas por doctores
- Calificar y reseñar doctores
- Ver resultados de exámenes y laboratorios
- Gestionar su perfil y datos médicos

### 6.4 Invitado

**Descripción:** Acceso limitado sin registro

**Permisos:**

- Explorar especialidades, doctores y centrales médicas
- Ver precios y disponibilidad de citas
- Ver promociones activas
- Ver mapa de centrales médicas cercanas
- Para agendar o pagar: redirigido a registro/login
- Registro simplificado con email o teléfono

---

## 7. Recomendaciones para Elevar la Experiencia de Usuario

### 🎓 Onboarding Inteligente

Tutorial interactivo en primer uso. Perfilamiento inicial (edad, condiciones, seguro médico) para personalizar recomendaciones.

### 🔔 Recordatorios Inteligentes

Notificaciones push escalonadas (24h, 2h, 15min). Recordatorio de medicamentos post-cita. Sugerencias proactivas de chequeos anuales.

### ⭐ Rating y Reseñas

Sistema de calificación de doctores post-cita. Reseñas verificadas (solo pacientes que asistieron). Insignias para doctores mejor calificados.

### ❤️ Favoritos y Doctores Recientes

Guardar doctores favoritos para acceso rápido. Historial de doctores visitados. Sugerencia de "Agendar de nuevo" con doctor frecuente.

### 📋 Expediente Médico Digital

Historial consolidado de citas, recetas, resultados. Compartible con nuevos doctores con un clic. Alertas de alergias y medicamentos activos.

### 🌙 Modo Oscuro

Tema oscuro disponible para uso nocturno. Respeta configuración del sistema operativo.

### ♿ Accesibilidad

Soporte para lectores de pantalla (VoiceOver/TalkBack). Tamaños de texto ajustables. Alto contraste para usuarios con baja visión.

### 🌐 Multi-idioma

Español e Inglés como mínimo. Estructura preparada para agregar más idiomas (i18n).

### 🏆 Sistema de Rewards

Puntos por citas completadas canjeables por descuentos. Niveles de fidelidad (Bronce, Plata, Oro).

### 👨‍👩‍👧‍👦 Dependientes

Permitir al usuario agendar citas para familiares (hijos, padres, etc.). Perfil de dependiente con datos médicos propios.

---

## 8. Fases del Proyecto y Cronograma

### Fase 1: Descubrimiento y Diseño

**Duración:** Semanas 1-4 (1 mes)

- Levantamiento detallado de requerimientos con stakeholders
- Diseño de arquitectura de sistema y base de datos
- Wireframes de baja fidelidad para todos los flujos
- Diseño UI/UX de alta fidelidad en Figma
- Prototipo interactivo para validación con usuarios
- Definición del backlog y priorización de features
- Configuración del entorno de desarrollo y CI/CD

### Fase 2: MVP Backend + Auth

**Duración:** Semanas 5-8 (1 mes)

- Setup del proyecto NestJS con estructura modular
- Modelo de datos en PostgreSQL con Prisma
- Sistema de autenticación y autorización (JWT + roles)
- CRUD de especialidades, doctores, centrales médicas
- API de disponibilidad y slots horarios
- Tests unitarios y de integración
- Documentación de API con Swagger

### Fase 3: Módulo de Agendamiento + Web

**Duración:** Semanas 9-14 (6 semanas)

- Flujo completo de agendamiento de citas presenciales
- Frontend web con Next.js: Home, Búsqueda, Agendamiento
- Calendario interactivo de disponibilidad
- Panel de Mis Citas (próximas y pasadas)
- Sistema de citas sugeridas por el doctor
- Panel del Doctor: agenda, pacientes, notas
- Integración con mapas (Central Médica Cerca de Mí)

### Fase 4: Pagos, Promociones y Notificaciones

**Duración:** Semanas 15-18 (1 mes)

- Integración con pasarela de pagos (Stripe/MercadoPago)
- Motor de promociones: bundles, cupones, descuentos
- Sistema de notificaciones push (FCM)
- Notificaciones por email (transaccionales y recordatorios)
- Notificaciones por SMS (opcionales)
- Panel de administración de promociones

### Fase 5: Telemedicina y Chat

**Duración:** Semanas 19-22 (1 mes)

- Integración de videoconsulta (Twilio/Daily.co)
- Sala de espera virtual
- Sistema de chat en tiempo real (Socket.io)
- Compartir archivos y documentos en chat
- Laboratorios a domicilio: flujo completo
- Exámenes e imágenes: catálogo y agendamiento

### Fase 6: App Móvil

**Duración:** Semanas 23-28 (6 semanas)

- Setup React Native + Expo
- Replicar flujos principales del web en móvil
- Notificaciones push nativas
- Geolocalización y mapa nativo
- Integración de biometría (Face ID / Fingerprint)
- Modo offline básico (ver próximas citas sin conexión)
- Publicación en App Store y Google Play

### Fase 7: Panel Admin + QA + Lanzamiento

**Duración:** Semanas 29-34 (6 semanas)

- Panel administrativo completo (backoffice)
- Dashboard de análisis y reportes
- Pruebas de carga y rendimiento
- Pruebas de seguridad y penetración
- UAT (User Acceptance Testing) con grupo beta
- Corrección de bugs y optimizaciones
- Deploy a producción y monitoreo
- Documentación de usuario y capacitación

---

## 9. Cronograma Resumen

| Fase | Duración | Inicio | Fin |
|---|---|---|---|
| **Fase 1:** Descubrimiento y Diseño | 4 semanas | Sem 1 | Sem 4 |
| **Fase 2:** MVP Backend + Auth | 4 semanas | Sem 5 | Sem 8 |
| **Fase 3:** Agendamiento + Web | 6 semanas | Sem 9 | Sem 14 |
| **Fase 4:** Pagos y Promociones | 4 semanas | Sem 15 | Sem 18 |
| **Fase 5:** Telemedicina y Chat | 4 semanas | Sem 19 | Sem 22 |
| **Fase 6:** App Móvil | 6 semanas | Sem 23 | Sem 28 |
| **Fase 7:** Admin + QA + Launch | 6 semanas | Sem 29 | Sem 34 |
| **⏱️ TOTAL ESTIMADO** | **34 semanas (~8.5 meses)** | | |

> **📌 Nota:** Con un equipo de 4-6 desarrolladores dedicados. Un MVP funcional (Fases 1-3) puede estar listo en ~14 semanas (3.5 meses). Algunas fases pueden ejecutarse en paralelo para reducir el tiempo total.

---

## 10. Equipo Recomendado

| Rol | Cantidad | Responsabilidades |
|---|---|---|
| **Product Manager** | 1 | Prioriza features, gestiona backlog, coordina stakeholders |
| **Diseñador UI/UX** | 1 | Diseño de interfaces, prototipado, investigación de usuarios |
| **Frontend Developer (Web)** | 1-2 | Next.js, TypeScript, React. Desarrollo del portal web |
| **Frontend Developer (Mobile)** | 1-2 | React Native, Expo. Desarrollo de apps iOS/Android |
| **Backend Developer** | 2 | NestJS, PostgreSQL, Redis. API, integraciones, lógica de negocio |
| **DevOps / SRE** | 1 (parcial) | Infraestructura, CI/CD, monitoreo, seguridad |
| **QA Engineer** | 1 | Pruebas automatizadas, manuales, rendimiento, seguridad |

- **Equipo mínimo viable:** 5-6 personas (PM + Diseñador + 2 Frontend + 2 Backend)
- **Equipo óptimo:** 8-9 personas incluyendo DevOps y QA dedicados

---

## 11. Estimación de Costos

Estimación aproximada basada en tarifas promedio de desarrollo para Latinoamérica y servicios cloud:

### 11.1 Costos de Desarrollo

| Concepto | Rango Bajo | Rango Alto |
|---|---|---|
| **Diseño UI/UX** | $8,000 - $12,000 | $15,000 - $25,000 |
| **Backend + API** | $20,000 - $30,000 | $40,000 - $60,000 |
| **Frontend Web** | $15,000 - $22,000 | $30,000 - $45,000 |
| **App Móvil (iOS + Android)** | $18,000 - $28,000 | $35,000 - $55,000 |
| **QA y Testing** | $5,000 - $8,000 | $10,000 - $18,000 |
| **💰 TOTAL DESARROLLO** | **$66,000 - $100,000** | **$130,000 - $203,000** |

### 11.2 Costos Mensuales de Operación

| Servicio | Costo Inicio | Costo a Escala |
|---|---|---|
| **Hosting / Cloud (AWS/Vercel/Railway)** | $100 - $300/mes | $500 - $2,000/mes |
| **Base de datos (PostgreSQL managed)** | $25 - $50/mes | $100 - $500/mes |
| **Pasarela de pagos (comisión)** | 2.9% + $0.30/tx | 2.9% + $0.30/tx |
| **Video API (Twilio/Daily)** | $50 - $200/mes | $500 - $3,000/mes |
| **Email + SMS + Push** | $30 - $80/mes | $200 - $800/mes |
| **Monitoreo (Sentry + Logs)** | $30 - $60/mes | $100 - $300/mes |

---

## 12. Seguridad y Cumplimiento Normativo

Al manejar datos médicos sensibles, el sistema debe cumplir con los más altos estándares de seguridad:

### 12.1 Seguridad Técnica

- Encriptación en tránsito (TLS 1.3) y en reposo (AES-256)
- Autenticación multifactor (MFA) para doctores y administradores
- Tokens JWT con rotación automática y refresh tokens seguros
- Rate limiting y protección contra ataques de fuerza bruta
- Sanitización de inputs y protección contra SQL injection y XSS
- Auditoría de accesos: log de quién accedió a qué dato y cuándo
- Backups automatizados diarios con retención de 30 días
- Penetration testing periódico (cada 6 meses)

### 12.2 Cumplimiento Normativo

- HIPAA (si opera en EE.UU.): Protección de información médica personal (PHI)
- Ley de Protección de Datos local del país de operación
- Consentimiento informado digital antes de compartir datos médicos
- Derecho al olvido: capacidad de eliminar todos los datos del usuario
- Políticas de privacidad y términos de uso claros y accesibles

---

## 13. KPIs y Métricas de Éxito

| KPI | Descripción | Meta |
|---|---|---|
| **Tasa de conversión** | % de usuarios que completan una cita vs. los que inician el flujo | > 60% |
| **Tiempo de agendamiento** | Tiempo promedio desde apertura de app hasta cita confirmada | < 90 segundos |
| **NPS (Net Promoter Score)** | Satisfacción general del usuario | > 50 |
| **Tasa de no-show** | % de citas agendadas a las que el paciente no asiste | < 10% |
| **Retención mensual** | % de usuarios que regresan en el siguiente mes | > 40% |
| **Uptime del sistema** | Disponibilidad de la plataforma | > 99.9% |
| **Tiempo de respuesta API** | Latencia promedio de las llamadas al backend | < 200ms |
| **Calificación en stores** | Rating promedio en App Store / Google Play | > 4.5 ⭐ |

---

## 14. Próximos Pasos

| Plazo | Acción |
|---|---|
| **Semana 1** | Validar esta planificación con todos los stakeholders del hospital |
| **Semana 1-2** | Seleccionar y contratar al equipo de desarrollo |
| **Semana 2** | Configurar repositorios, CI/CD y entorno de desarrollo |
| **Semana 2-3** | Iniciar diseño UI/UX con workshops de descubrimiento |
| **Semana 3-4** | Desarrollar y validar prototipos interactivos con usuarios reales |
| **Semana 5** | Inicio formal del desarrollo (Sprint 1) |

---

<p align="center">
  <i>Documento preparado como guía de planificación.</i><br>
  <i>Sujeto a ajustes según requerimientos específicos del hospital.</i>
</p>
]]>