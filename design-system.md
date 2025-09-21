# GoSchool Design System

## 📚 Introducción

Este documento describe el sistema de diseño completo para GoSchool, un sistema de gestión académica del **Colegio Stella Maris Rosario**. El objetivo es mantener consistencia visual y de usabilidad en toda la aplicación.

## 🎨 Filosofía de Diseño

### Principios Fundamentales

1. **Minimalista y Limpio**: Diseño simple que prioriza la funcionalidad
2. **Accesible**: Cumple con estándares WCAG AA/AAA
3. **Consistente**: Patrones reutilizables en toda la aplicación
4. **Educativo**: Optimizado para entornos académicos
5. **Responsive**: Funciona perfectamente en todos los dispositivos

### Tonos y Personalidad

- **Profesional**: Colores neutros y tipografía clara
- **Familiar**: Interfaz amigable para estudiantes y padres
- **Confiable**: Diseño sólido que inspira confianza
- **Moderno**: Uso de las mejores prácticas de UX/UI

## 🎨 Sistema de Color

### Paleta Principal

#### Modo Claro
```css
--background: oklch(99% 0 0)          /* Blanco más puro */
--foreground: oklch(9% 0 0)           /* Negro más suave */
--primary: oklch(20% 0 0)             /* Negro elegante */
--secondary: oklch(96% 0 0)           /* Gris muy claro */
--muted: oklch(96% 0 0)               /* Gris de fondo */
--accent: oklch(96% 0 0)              /* Color de acento */
--destructive: oklch(58% 0.24 27)     /* Rojo para errores */
```

#### Modo Oscuro
```css
--background: oklch(8% 0 0)           /* Fondo más oscuro */
--foreground: oklch(95% 0 0)          /* Texto más claro */
--primary: oklch(90% 0 0)             /* Primary más claro */
--secondary: oklch(18% 0 0)           /* Secondary más contrastado */
--muted: oklch(18% 0 0)               /* Muted más visible */
--destructive: oklch(70% 0.19 22)     /* Destructive más visible */
```

### Colores Semánticos

#### Estados de Exámenes/Tareas
```css
.exam-pending     /* Amarillo - Pendiente */
.exam-completed   /* Verde - Completado */
.exam-overdue     /* Rojo - Vencido */
```

#### Colores de Gráficos (Paleta Educativa)
```css
--chart-1: oklch(65% 0.22 41)    /* Naranja educativo */
--chart-2: oklch(60% 0.12 185)   /* Azul académico */
--chart-3: oklch(40% 0.07 227)   /* Azul oscuro */
--chart-4: oklch(83% 0.19 84)    /* Verde éxito */
--chart-5: oklch(77% 0.19 70)    /* Verde claro */
```

## ✍️ Tipografía

### Escala de Texto

```css
/* Títulos */
.heading-1      /* text-3xl font-bold leading-tight tracking-tight */
.heading-2      /* text-2xl font-semibold leading-tight tracking-tight */
.heading-3      /* text-xl font-semibold leading-normal */
.heading-4      /* text-lg font-medium leading-normal */
.heading-5      /* text-base font-medium leading-normal */
.heading-6      /* text-sm font-medium leading-normal */

/* Texto de cuerpo */
.body-text      /* text-base leading-relaxed */
.body-small     /* text-sm leading-relaxed */
.caption        /* text-xs leading-normal text-muted-foreground */
```

### Pesos de Fuente

- **Normal (400)**: Texto de cuerpo
- **Medium (500)**: Etiquetas y texto destacado
- **Semibold (600)**: Subtítulos
- **Bold (700)**: Títulos principales

### Mejores Prácticas

- Usar máximo 3 pesos de fuente por página
- Mantener jerarquía visual clara
- Asegurar contraste mínimo 4.5:1 para texto normal
- Asegurar contraste mínimo 7:1 para texto pequeño

## 📏 Espaciado y Layout

### Sistema de Espaciado

```css
/* Variables del sistema */
--spacing-section: 2rem    /* 32px - espaciado entre secciones */
--spacing-component: 1.5rem /* 24px - espaciado interno de componentes */
--spacing-element: 1rem     /* 16px - espaciado entre elementos */
--spacing-tight: 0.5rem     /* 8px - espaciado compacto */
```

### Clases Utilitarias

```css
.container-custom     /* Container responsivo con padding */
.spacing-section      /* Márgenes de sección */
.spacing-component    /* Padding de componente */
.spacing-element      /* Gap entre elementos */
```

### Grid y Layout

```css
.grid-auto-fit        /* repeat(auto-fit, minmax(280px, 1fr)) */
.grid-auto-fill       /* repeat(auto-fill, minmax(280px, 1fr)) */
```

## 🔘 Componentes

### Button

#### Variantes
- **default**: Botón principal
- **secondary**: Botón secundario
- **outline**: Botón con borde
- **ghost**: Botón transparente
- **link**: Estilo de enlace
- **destructive**: Acciones destructivas

#### Tamaños
- **sm**: 36px altura (h-9)
- **default**: 40px altura (h-10) - mínimo para accesibilidad
- **lg**: 48px altura (h-12)
- **icon**: Botones cuadrados para iconos

```tsx
// Ejemplos de uso
<Button variant="default" size="lg">Guardar cambios</Button>
<Button variant="outline" size="default">Cancelar</Button>
<Button variant="ghost" size="icon"><Plus className="h-4 w-4" /></Button>
```

### Card

Componente base para contenedores de información.

```tsx
<Card className="academic-card">
  <CardHeader>
    <CardTitle>Título de la card</CardTitle>
    <CardDescription>Descripción opcional</CardDescription>
  </CardHeader>
  <CardContent>
    Contenido principal
  </CardContent>
  <CardFooter>
    Acciones o información adicional
  </CardFooter>
</Card>
```

### Input

Campos de entrada de datos con estados de focus y error.

```tsx
<div className="space-y-2">
  <Label htmlFor="email" variant="required">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="tu-email@ejemplo.com"
  />
</div>
```

### Badge

Para mostrar estados, categorías o información destacada.

#### Variantes
- **default**: Badge principal
- **secondary**: Badge secundario
- **outline**: Badge con borde
- **success**: Estados positivos
- **warning**: Advertencias
- **info**: Información neutral

```tsx
<Badge variant="success">Completado</Badge>
<Badge variant="warning">Pendiente</Badge>
<Badge variant="outline">Información</Badge>
```

### StatusCard

Componente específico para mostrar estados con iconos.

```tsx
<StatusCard
  icon={<CheckCircle className="h-5 w-5" />}
  text="Examen completado"
  variant="success"
/>
```

## 🎯 Componentes Específicos de GoSchool

### CourseSelector

Selector de cursos con información académica.

```tsx
<CourseSelector
  courses={courses}
  onCourseSelect={handleCourseSelect}
  selectedCourseId={selectedId}
  title="Selecciona un curso"
  description="Elige el curso para continuar"
/>
```

### StudentSelector

Selector de estudiantes con avatares y información.

```tsx
<StudentSelector
  students={students}
  onStudentSelect={handleStudentSelect}
  onBack={handleBack}
  selectedStudentId={selectedId}
/>
```

## 🌗 Modo Oscuro

### Implementación

El modo oscuro está implementado usando `next-themes` y variables CSS.

```tsx
import { ThemeProvider } from "next-themes"

<ThemeProvider attribute="class" defaultTheme="system">
  <App />
</ThemeProvider>
```

### Mejores Prácticas

- Usar tokens de color del sistema, no valores hardcodeados
- Probar contraste en ambos modos
- Asegurar que iconos y elementos gráficos funcionen en ambos modos
- Mantener la misma jerarquía visual

## ♿ Accesibilidad

### Estándares

- **WCAG AA**: Mínimo requerido
- **WCAG AAA**: Objetivo para texto crítico

### Implementación

#### Focus States
```css
.focus-ring {
  @apply focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2;
}
```

#### Tamaños Mínimos
- Botones: mínimo 40px de altura
- Elementos clicables: mínimo 40x40px
- Touch targets: mínimo 44x44px

#### Navegación por Teclado
- Todos los elementos interactivos son navegables por teclado
- Focus visible en todos los elementos
- Skip links cuando sea necesario

#### Texto Alternativo
- Imágenes tienen alt text descriptivo
- Iconos decorativos tienen aria-hidden="true"
- Iconos funcionales tienen labels apropiados

### Testing

```tsx
// Ejemplo de componente accesible
<Button
  variant="primary"
  size="default"
  aria-label="Guardar cambios del examen"
  disabled={isLoading}
>
  {isLoading ? <LoadingSpinner /> : "Guardar"}
</Button>
```

## 📱 Responsive Design

### Breakpoints

```css
sm: 640px    /* Tablets pequeñas */
md: 768px    /* Tablets */
lg: 1024px   /* Laptops */
xl: 1280px   /* Desktops */
2xl: 1536px  /* Pantallas grandes */
```

### Estrategia Mobile-First

```tsx
// Ejemplo de grid responsivo
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {items.map(item => <Card key={item.id}>{item.content}</Card>)}
</div>
```

### Componentes Responsivos

- Navegación adaptativa
- Cards que se reorganizan automáticamente
- Tipografía escalable
- Espaciado adaptativo

## 🎨 Animaciones

### Principios

- **Sutiles**: No distraen del contenido
- **Rápidas**: Máximo 300ms para transiciones
- **Con propósito**: Guían la atención del usuario

### Implementación

```css
/* Clases utilitarias */
.interactive {
  @apply transition-all duration-200 ease-out;
}

.hover-lift {
  @apply interactive hover:shadow-md hover:-translate-y-0.5;
}

/* Animaciones específicas */
.animate-slide-up    /* slide-up 0.3s ease-out */
.animate-slide-down  /* slide-down 0.3s ease-out */
.animate-pulse-soft  /* pulse-soft 2s ease-in-out infinite */
```

## 📐 Iconografía

### Biblioteca Principal: Lucide React

```tsx
import { Calendar, BookOpen, User, Settings } from "lucide-react"

// Tamaños estándar
<Calendar className="h-4 w-4" />  // 16px - iconos pequeños
<BookOpen className="h-5 w-5" />  // 20px - iconos medianos
<User className="h-6 w-6" />      // 24px - iconos grandes
```

### Mejores Prácticas

- Usar tamaños consistentes (4, 5, 6)
- Mantener peso visual similar
- Asegurar contraste adecuado
- Usar aria-hidden="true" para iconos decorativos

## 🧪 Testing y Quality Assurance

### Checklist de Componentes

- [ ] Funciona en modo claro y oscuro
- [ ] Es accesible por teclado
- [ ] Tiene focus states visibles
- [ ] Respeta tamaños mínimos
- [ ] Es responsive
- [ ] Tiene estados de loading/error
- [ ] Usa tokens del design system
- [ ] Está documentado

### Testing de Accesibilidad

```bash
# Herramientas recomendadas
npm install --save-dev @axe-core/react
npm install --save-dev eslint-plugin-jsx-a11y
```

## 🚀 Implementación

### Desarrollo

1. **Siempre usar tokens**: Nunca hardcodear colores o tamaños
2. **Probar en ambos modos**: Claro y oscuro
3. **Verificar accesibilidad**: Usar herramientas automáticas
4. **Testing manual**: Navegación por teclado
5. **Review de código**: Verificar consistencia

### Mantenimiento

- Revisar componentes mensualmente
- Actualizar documentación con cambios
- Hacer auditorías de accesibilidad regulares
- Recopilar feedback de usuarios

## 📚 Recursos Adicionales

### Enlaces Útiles

- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)

### Herramientas

- **Contrast Checker**: WebAIM Contrast Checker
- **Screen Reader**: NVDA (Windows), VoiceOver (Mac)
- **Browser Extension**: axe DevTools

---

## 🏫 Contexto Específico: Colegio Stella Maris Rosario

### Consideraciones Especiales

- **Terminología Argentina**: Usar términos educativos locales
- **Niveles Educativos**:
  - Primaria: 1° a 7° (Divisiones: Mar, Gaviota, Estrella)
  - Secundaria: 1° a 6° (Divisiones: a, b, c)
- **Turnos**: Mañana y Tarde
- **Roles del Sistema**: Admin, Preceptor, Profesor, Estudiante, Padre

### Elementos Visuales

- **Colores Institucionales**: Mantener neutralidad pero permitir personalización
- **Branding Sutil**: Sin competir con la marca del colegio
- **Profesionalismo**: Diseño serio pero accesible para todas las edades

---

**Versión**: 1.0  
**Última actualización**: Septiembre 2025  
**Mantenido por**: Equipo de Desarrollo GoSchool