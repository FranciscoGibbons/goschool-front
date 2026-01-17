# 🎯 ROADMAP TO 10/10 - Frontend Gragica

**Objetivo**: Transformar cada aspecto del frontend de su estado actual a 10/10

**Duración estimada**: 14 meses (60 semanas) con enfoque 80/20
**Duración acelerada**: 12 meses (48 semanas) con dedicación 100%
**Enfoque**: 80% features / 20% tech debt (o 100% mejoras por sprints)
**Inversión semanal**: 8-10 horas en mejoras

---

## 📊 ESTADO ACTUAL vs OBJETIVO

| Aspecto | Actual | Objetivo | Gap | Prioridad |
|---------|--------|----------|-----|-----------|
| Testing | 0/10 | 10/10 | ⚠️ CRÍTICO | 🔴 P0 |
| Design System | 4/10 | 10/10 | ⚠️ CRÍTICO | 🔴 P0 |
| Mantenibilidad | 6/10 | 10/10 | ⚠️ ALTO | 🔴 P0 |
| Seguridad | 7/10 | 10/10 | 📈 MEDIO | 🟡 P1 |
| Performance | 7/10 | 10/10 | 📈 MEDIO | 🟡 P1 |
| State Management | 8/10 | 10/10 | ✅ BAJO | 🟢 P2 |
| Arquitectura | 9/10 | 10/10 | ✅ BAJO | 🟢 P2 |
| Type Safety | 9/10 | 10/10 | ✅ BAJO | 🟢 P2 |

---

## 🗓️ TIMELINE GENERAL - 8 MESES

```
MES 1-2: FUNDACIÓN (Testing + Build Quality)
├── Sprint 1-2: Setup testing infrastructure
├── Sprint 3-4: Tests críticos + Fix build errors
└── Resultado: Build confiable, tests básicos

MES 2-3: DESIGN SYSTEM (Contrato Visual + Sacred Components)
├── Sprint 4-5: DESIGN_CONTRACT.md + Design Tokens
├── Sprint 6: Sacred Components (Button, Card, Table, etc.)
└── Resultado: Sistema de diseño institucional completo

MES 3-4: UI REFACTOR (Aplicar Design System)
├── Sprint 7: Auditoría UI + Eliminar inconsistencias
├── Sprint 8: Refactor total siguiendo contrato visual
└── Resultado: UI cohesiva y profesional

MES 4-5: REFACTORING (Mantenibilidad + Seguridad)
├── Sprint 9-10: Refactorizar componentes grandes
├── Sprint 11-12: Seguridad hardening
└── Resultado: Código mantenible, app segura

MES 6-7: OPTIMIZACIÓN (Performance + Polish)
├── Sprint 13-14: Performance optimization
├── Sprint 15-16: State management avanzado + CI/CD
└── Resultado: App rápida y optimizada

MES 8: POLISH FINAL (Type Safety + Docs)
├── Sprint 17: Type safety 100% + ADRs
├── Sprint 18: Documentación completa + Final review
└── Resultado: App 10/10 en todos los aspectos
```

---

# 🎯 PLAN DETALLADO POR ASPECTO

---

## 1️⃣ TESTING: 0/10 → 10/10 (PRIORIDAD P0 🔴)

### Estado Actual
- ❌ 0 tests unitarios
- ❌ 0 tests E2E
- ❌ 0 tests de integración
- ❌ No hay CI/CD pipeline
- ❌ Cambios sin validación automática

### Objetivo 10/10
- ✅ 80%+ cobertura de tests unitarios
- ✅ Tests E2E para flujos críticos
- ✅ Tests de integración para API
- ✅ CI/CD pipeline automatizado
- ✅ Visual regression tests
- ✅ Performance tests

### 📋 PLAN DE ACCIÓN

#### **Sprint 1-2 (Semanas 1-4): Setup Infrastructure**

**Tareas:**

```bash
# 1. Instalar dependencias
npm install -D \
  jest @jest/globals \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  jest-environment-jsdom \
  @playwright/test \
  msw \
  vitest

# 2. Configurar Jest
```

**jest.config.ts**:
```typescript
import type { Config } from 'jest'
import nextJest from 'next/jest'

const createJestConfig = nextJest({
  dir: './',
})

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
  ],
  coverageThresholds: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
}

export default createJestConfig(config)
```

**jest.setup.ts**:
```typescript
import '@testing-library/jest-dom'
import { server } from './src/mocks/server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

**playwright.config.ts**:
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

**Tiempo**: 8 horas

---

```bash
# 3. Setup MSW (Mock Service Worker)
```

**src/mocks/handlers.ts**:
```typescript
import { http, HttpResponse } from 'msw'

export const handlers = [
  // Login
  http.post('/api/proxy/login', async ({ request }) => {
    const body = await request.json()
    if (body.email === 'admin@test.com' && body.password === 'admin') {
      return HttpResponse.json({
        token: 'mock-jwt-token',
        user: {
          id: 1,
          email: 'admin@test.com',
          role: 'admin',
          full_name: 'Admin Test',
        },
      })
    }
    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }),

  // Verify token
  http.get('/api/proxy/verify_token', () => {
    return HttpResponse.json({ valid: true })
  }),

  // Personal data
  http.get('/api/proxy/personal-data', () => {
    return HttpResponse.json({
      id: 1,
      email: 'admin@test.com',
      role: 'admin',
      full_name: 'Admin Test',
    })
  }),
]
```

**src/mocks/server.ts**:
```typescript
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

**Tiempo**: 6 horas

---

```bash
# 4. Scripts en package.json
```

**package.json**:
```json
{
  "scripts": {
    "test": "jest --watch",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:coverage": "jest --coverage",
    "test:staged": "jest --findRelatedTests"
  }
}
```

**Tiempo**: 1 hora

---

#### **Sprint 3-4 (Semanas 5-8): Tests Críticos**

**Tareas:**

**1. Tests para Hooks Críticos** (Prioridad P0)

**src/hooks/__tests__/useWebSocket.test.ts**:
```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { useWebSocket } from '../useWebSocket'
import { WS } from 'jest-websocket-mock'

describe('useWebSocket', () => {
  let server: WS

  beforeEach(() => {
    server = new WS('ws://localhost:8080/api/v1/ws/')
  })

  afterEach(() => {
    WS.clean()
  })

  it('should connect to WebSocket on mount', async () => {
    const { result } = renderHook(() => useWebSocket())

    await server.connected

    expect(result.current.isConnected).toBe(true)
  })

  it('should auto-reconnect on connection lost', async () => {
    const { result } = renderHook(() => useWebSocket())

    await server.connected
    server.close()

    await waitFor(() => {
      expect(result.current.reconnectAttempts).toBeGreaterThan(0)
    })
  })

  it('should send heartbeat every 30 seconds', async () => {
    jest.useFakeTimers()
    const { result } = renderHook(() => useWebSocket())

    await server.connected

    jest.advanceTimersByTime(30000)

    await expect(server).toReceiveMessage(
      JSON.stringify({ type: 'Ping' })
    )

    jest.useRealTimers()
  })

  it('should handle incoming messages', async () => {
    const { result } = renderHook(() => useWebSocket())
    await server.connected

    server.send(
      JSON.stringify({
        type: 'NewMessage',
        chat_id: 1,
        message: 'Test message',
        sender: { id: 2, name: 'John' },
      })
    )

    await waitFor(() => {
      const messages = result.current.messages[1]
      expect(messages).toHaveLength(1)
      expect(messages[0].message).toBe('Test message')
    })
  })
})
```

**Tiempo**: 12 horas

---

**2. Tests para Stores (Zustand)**

**src/store/__tests__/userInfoStore.test.ts**:
```typescript
import { renderHook, act, waitFor } from '@testing-library/react'
import { useUserInfoStore } from '../userInfoStore'
import { server } from '@/mocks/server'
import { http, HttpResponse } from 'msw'

describe('userInfoStore', () => {
  beforeEach(() => {
    useUserInfoStore.setState({
      userInfo: null,
      isLoading: false,
      error: null,
      lastCheck: null,
    })
    localStorage.clear()
  })

  it('should fetch user info successfully', async () => {
    const { result } = renderHook(() => useUserInfoStore())

    act(() => {
      result.current.fetchUserInfo()
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.userInfo).toEqual({
        id: 1,
        email: 'admin@test.com',
        role: 'admin',
        full_name: 'Admin Test',
      })
      expect(result.current.error).toBeNull()
    })
  })

  it('should cache user info for 5 minutes', async () => {
    const { result } = renderHook(() => useUserInfoStore())

    // Primera llamada
    await act(async () => {
      await result.current.fetchUserInfo()
    })

    const firstCheck = result.current.lastCheck

    // Segunda llamada dentro de 5 min
    jest.advanceTimersByTime(4 * 60 * 1000) // 4 min

    await act(async () => {
      await result.current.checkAuth()
    })

    // Debe usar caché
    expect(result.current.lastCheck).toBe(firstCheck)
  })

  it('should handle fetch errors', async () => {
    server.use(
      http.get('/api/proxy/personal-data', () => {
        return HttpResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      })
    )

    const { result } = renderHook(() => useUserInfoStore())

    await act(async () => {
      await result.current.fetchUserInfo()
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.userInfo).toBeNull()
  })

  it('should persist to localStorage', async () => {
    const { result } = renderHook(() => useUserInfoStore())

    await act(async () => {
      await result.current.fetchUserInfo()
    })

    const stored = localStorage.getItem('user-info-storage')
    expect(stored).toBeTruthy()

    const parsed = JSON.parse(stored!)
    expect(parsed.state.userInfo.email).toBe('admin@test.com')
  })
})
```

**Tiempo**: 8 horas

---

**3. Tests de Componentes UI**

**src/components/ui/__tests__/Button.test.tsx**:
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../button'

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)

    fireEvent.click(screen.getByText('Click'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByText('Disabled')

    expect(button).toBeDisabled()
  })

  it('applies variant styles correctly', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByText('Delete')

    expect(button).toHaveClass('bg-destructive')

    rerender(<Button variant="outline">Outline</Button>)
    expect(screen.getByText('Outline')).toHaveClass('border')
  })

  it('applies size classes correctly', () => {
    render(<Button size="lg">Large</Button>)
    expect(screen.getByText('Large')).toHaveClass('h-11')
  })
})
```

**Tiempo por componente**: 2 horas × 10 componentes = 20 horas

---

**4. Tests E2E Críticos**

**e2e/auth.spec.ts**:
```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/')

    // Should redirect to login
    await expect(page).toHaveURL('/login')

    // Fill login form
    await page.fill('input[name="email"]', 'admin@test.com')
    await page.fill('input[name="password"]', 'admin')

    // Submit
    await page.click('button[type="submit"]')

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[name="email"]', 'wrong@test.com')
    await page.fill('input[name="password"]', 'wrong')
    await page.click('button[type="submit"]')

    // Should show error toast
    await expect(page.locator('[role="alert"]')).toContainText(
      'Credenciales inválidas'
    )
  })

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@test.com')
    await page.fill('input[name="password"]', 'admin')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/dashboard')

    // Logout
    await page.click('[data-testid="user-menu"]')
    await page.click('[data-testid="logout-button"]')

    // Should redirect to login
    await expect(page).toHaveURL('/login')
  })
})
```

**e2e/exams.spec.ts**:
```typescript
import { test, expect } from '@playwright/test'

test.describe('Exams Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as student
    await page.goto('/login')
    await page.fill('input[name="email"]', 'student@test.com')
    await page.fill('input[name="password"]', 'student')
    await page.click('button[type="submit"]')
  })

  test('should display available exams', async ({ page }) => {
    await page.goto('/examenes')

    // Should show exam list
    await expect(page.locator('[data-testid="exam-card"]')).toHaveCount(
      { minimum: 1 }
    )
  })

  test('should complete self-assessment exam', async ({ page }) => {
    await page.goto('/examenes')

    // Click on first self-assessable exam
    await page
      .locator('[data-testid="exam-card"]')
      .first()
      .click()

    // Answer questions
    await page.click('[data-testid="answer-option-0"]')
    await page.click('[data-testid="submit-exam"]')

    // Should show success message
    await expect(page.locator('[role="alert"]')).toContainText(
      'Examen enviado'
    )
  })
})
```

**e2e/chat.spec.ts**:
```typescript
import { test, expect } from '@playwright/test'

test.describe('Real-time Chat', () => {
  test('should send and receive messages', async ({ browser }) => {
    // Create two contexts (two users)
    const context1 = await browser.newContext()
    const context2 = await browser.newContext()

    const page1 = await context1.newPage()
    const page2 = await context2.newPage()

    // Login as two different users
    await page1.goto('/login')
    await page1.fill('input[name="email"]', 'student1@test.com')
    await page1.fill('input[name="password"]', 'student')
    await page1.click('button[type="submit"]')

    await page2.goto('/login')
    await page2.fill('input[name="email"]', 'student2@test.com')
    await page2.fill('input[name="password"]', 'student')
    await page2.click('button[type="submit"]')

    // Open chat for both
    await page1.goto('/chat')
    await page2.goto('/chat')

    // User 1 sends message
    await page1.fill('[data-testid="message-input"]', 'Hello!')
    await page1.click('[data-testid="send-button"]')

    // User 2 should receive message
    await expect(page2.locator('[data-testid="message"]').last()).toContainText(
      'Hello!'
    )

    await context1.close()
    await context2.close()
  })
})
```

**Tiempo**: 24 horas (8 horas × 3 flows)

---

**5. Tests de Integración**

**src/lib/api/__tests__/integration.test.ts**:
```typescript
import { apiClient } from '@/lib/api-client'
import { server } from '@/mocks/server'

describe('API Integration', () => {
  it('should handle login flow end-to-end', async () => {
    const response = await apiClient.post('/api/proxy/login', {
      email: 'admin@test.com',
      password: 'admin',
    })

    expect(response.data.token).toBeTruthy()
    expect(response.data.user.role).toBe('admin')
  })

  it('should retry failed requests', async () => {
    let attempts = 0

    server.use(
      http.get('/api/proxy/personal-data', () => {
        attempts++
        if (attempts < 3) {
          return HttpResponse.error()
        }
        return HttpResponse.json({ id: 1, email: 'test@test.com' })
      })
    )

    const response = await apiClient.get('/api/proxy/personal-data')

    expect(attempts).toBe(3)
    expect(response.data.email).toBe('test@test.com')
  })
})
```

**Tiempo**: 12 horas

---

#### **Sprint 5-6 (Semanas 9-12): CI/CD + Visual Regression**

**Tareas:**

**1. Setup GitHub Actions**

**.github/workflows/ci.yml**:
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20.x]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Unit tests
        run: npm run test:ci

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          file: ./coverage/coverage-final.json

  e2e:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/

  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Check bundle size
        run: npx size-limit
```

**Tiempo**: 6 horas

---

**2. Visual Regression Testing (Chromatic)**

```bash
npm install -D chromatic
```

**.github/workflows/chromatic.yml**:
```yaml
name: Chromatic

on:
  push:
    branches: [main]
  pull_request:

jobs:
  chromatic:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: 20.x

      - run: npm ci

      - name: Publish to Chromatic
        uses: chromaui/action@latest
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
```

**Tiempo**: 4 horas

---

**3. Performance Testing**

**tests/performance/lighthouse.test.ts**:
```typescript
import { playAudit } from 'playwright-lighthouse'
import { chromium } from 'playwright'

describe('Lighthouse Performance', () => {
  it('should meet performance thresholds', async () => {
    const browser = await chromium.launch()
    const context = await browser.newContext()
    const page = await context.newPage()

    await page.goto('http://localhost:3000')

    const audit = await playAudit({
      page,
      thresholds: {
        performance: 90,
        accessibility: 95,
        'best-practices': 90,
        seo: 90,
      },
    })

    expect(audit.performance).toBeGreaterThanOrEqual(90)
    expect(audit.accessibility).toBeGreaterThanOrEqual(95)

    await browser.close()
  })
})
```

**Tiempo**: 8 horas

---

### ✅ MÉTRICAS DE ÉXITO - TESTING 10/10

- [ ] 80%+ cobertura de código (líneas)
- [ ] 100% tests para hooks críticos
- [ ] 100% tests para stores (Zustand)
- [ ] E2E tests para 5+ flujos críticos
- [ ] CI/CD pipeline verde en <10 min
- [ ] Visual regression tests configurados
- [ ] Performance score >90 en Lighthouse
- [ ] 0 flaky tests
- [ ] Test execution time <5 min (unit tests)

**Tiempo total**: ~100 horas (2.5 meses con 10h/semana)

---

## 2️⃣ DESIGN SYSTEM & UI CONSISTENCY: 4/10 → 10/10 (PRIORIDAD P0 🔴)

### Estado Actual
- ⚠️ Inconsistencias visuales entre páginas
- ⚠️ Múltiples estilos de botones y cards
- ⚠️ Colores hardcoded sin sistema
- ⚠️ Componentes UI sin documentar
- ⚠️ No hay contrato visual establecido
- ❌ No hay Design System formal
- ❌ Componentes duplicados con estilos diferentes

### Objetivo 10/10
- ✅ Sistema de diseño institucional completo
- ✅ Design tokens centralizados
- ✅ Sacred Components (componentes canónicos)
- ✅ UI cohesiva y profesional en toda la app
- ✅ Accesibilidad AA garantizada
- ✅ Zero inconsistencias visuales
- ✅ Documentación completa del sistema

---

### 📋 CONTEXTO: Sistema Académico Institucional

**Usuarios**: Administradores, profesores, estudiantes, padres
**Uso**: Sesiones largas diarias
**Objetivo**: Confianza institucional, claridad, accesibilidad

**Principio fundamental**:
> "La interfaz debe desaparecer mientras se trabaja"

---

### 📋 PLAN DE ACCIÓN

#### **FASE 1: CONTRATO VISUAL (Sprint 4-5, Semanas 7-10)**

Crear el **DESIGN_CONTRACT.md** - La ley que gobierna toda la UI.

---

**Tarea 1: Crear DESIGN_CONTRACT.md**

**Location**: `/DESIGN_CONTRACT.md` (raíz del proyecto)

**Contenido completo**:

```markdown
# 🎨 DESIGN CONTRACT - GoSchool

Este documento es **ley** para todo el frontend de GoSchool.
Ningún componente, página o estilo puede violar este contrato.

---

## 🎯 PRINCIPIOS DE DISEÑO (Reglas duras)

### 1. Institucional sobre Creativo
- Diseño neutral, serio, profesional
- Confianza institucional es prioridad #1
- No experimentar con tendencias visuales

### 2. Claridad sobre Estética
- Información clara y jerárquica
- Lectura optimizada para sesiones largas
- Sin distracciones visuales

### 3. Consistencia sobre Originalidad
- Un solo estilo de botón para cada acción
- Un solo estilo de card en toda la app
- Un solo sistema de spacing

### 4. Accesibilidad Obligatoria
- Contraste AA mínimo en todos los textos
- Focus states visibles en todos los interactivos
- Navegación completa por teclado

### 5. Flat Design Estricto
- Zero gradientes (excepto sutiles en hover si necesario)
- Zero sombras decorativas (máximo 1 nivel sutil)
- Preferir bordes sobre sombras

### 6. Prohibiciones Absolutas
- ❌ NO gradientes decorativos
- ❌ NO animaciones decorativas
- ❌ NO emojis como íconos principales
- ❌ NO colores fuera del sistema de tokens
- ❌ NO más de un color primario
- ❌ NO cards personalizados (usar Sacred Component)
- ❌ NO botones personalizados (usar Sacred Component)

---

## 🎨 SISTEMA DE COLOR (Tokens Semánticos)

### Paleta Base

```css
/* Backgrounds */
--color-background: hsl(0, 0%, 100%);          /* Página principal */
--color-surface: hsl(0, 0%, 98%);              /* Cards, tables */
--color-surface-muted: hsl(0, 0%, 96%);        /* Paneles secundarios */

/* Borders */
--color-border: hsl(0, 0%, 90%);               /* Bordes generales */
--color-border-subtle: hsl(0, 0%, 95%);        /* Separadores sutiles */

/* Primary (único color de marca) */
--color-primary: hsl(217, 91%, 60%);           /* Acciones principales */
--color-primary-hover: hsl(217, 91%, 55%);
--color-primary-active: hsl(217, 91%, 50%);
--color-primary-subtle: hsl(217, 91%, 95%);    /* Backgrounds hover */

/* Functional Colors (solo para estados) */
--color-success: hsl(142, 76%, 36%);           /* Aprobado, correcto */
--color-warning: hsl(38, 92%, 50%);            /* Advertencia, pendiente */
--color-error: hsl(0, 72%, 51%);               /* Error, reprobado */
--color-info: hsl(199, 89%, 48%);              /* Info, neutral */

/* Text */
--color-text-primary: hsl(0, 0%, 13%);         /* Texto principal */
--color-text-secondary: hsl(0, 0%, 45%);       /* Texto secundario */
--color-text-muted: hsl(0, 0%, 60%);           /* Texto deshabilitado */
--color-text-inverse: hsl(0, 0%, 100%);        /* Texto sobre primary */

/* Dark Mode (opcional futuro) */
[data-theme="dark"] {
  --color-background: hsl(0, 0%, 10%);
  --color-surface: hsl(0, 0%, 13%);
  --color-text-primary: hsl(0, 0%, 95%);
  /* ... resto */
}
```

### Reglas de Uso

1. **Primary**: Solo para CTAs y acciones principales
2. **Success/Warning/Error**: Solo para estados funcionales (badges, alerts)
3. **NO inventar colores**: Si necesitas un color, agrégalo al contrato primero
4. **Preferir grises**: Para la mayoría de la UI (bordes, backgrounds secundarios)

---

## ✍️ TIPOGRAFÍA

### Font Stack

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
```

### Escala de Tamaños

```css
/* Headings */
--text-h1: 2rem;      /* 32px - Títulos de página */
--text-h2: 1.5rem;    /* 24px - Secciones principales */
--text-h3: 1.25rem;   /* 20px - Subsecciones */
--text-h4: 1.125rem;  /* 18px - Títulos de cards */

/* Body */
--text-base: 1rem;        /* 16px - Texto normal */
--text-sm: 0.875rem;      /* 14px - Texto secundario */
--text-xs: 0.75rem;       /* 12px - Labels, hints */

/* Line Heights */
--leading-tight: 1.25;    /* Headings */
--leading-normal: 1.5;    /* Body text */
--leading-relaxed: 1.75;  /* Párrafos largos */
```

### Pesos de Fuente

```css
--font-normal: 400;       /* Texto normal */
--font-medium: 500;       /* Énfasis moderado */
--font-semibold: 600;     /* Headings, botones */
--font-bold: 700;         /* Títulos principales */

/* Prohibido usar: */
/* --font-light: 300 (ilegible en textos pequeños) */
/* --font-black: 900 (demasiado agresivo) */
```

### Reglas Tipográficas

1. Body text: siempre 16px mínimo (1rem)
2. Títulos: máximo 3 niveles de jerarquía por página
3. Line height: mínimo 1.5 para texto de lectura
4. Contraste: AA mínimo (4.5:1 texto normal, 3:1 texto grande)

---

## 📏 SISTEMA DE ESPACIADO

### Escala Base (8px)

```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px  - Spacing interno mínimo */
--space-2: 0.5rem;    /* 8px  - Spacing compacto */
--space-3: 0.75rem;   /* 12px - Spacing entre elementos relacionados */
--space-4: 1rem;      /* 16px - Spacing estándar */
--space-5: 1.5rem;    /* 24px - Spacing entre secciones */
--space-6: 2rem;      /* 32px - Spacing entre bloques */
--space-8: 3rem;      /* 48px - Spacing entre secciones principales */
--space-10: 4rem;     /* 64px - Spacing de página */
```

### Aplicaciones Específicas

```css
/* Cards */
--card-padding: var(--space-6);        /* 32px interior */
--card-gap: var(--space-4);            /* 16px entre cards */

/* Forms */
--form-field-gap: var(--space-4);      /* Entre campos */
--form-section-gap: var(--space-6);    /* Entre secciones */

/* Tables */
--table-cell-padding-x: var(--space-4);
--table-cell-padding-y: var(--space-3);
--table-row-height: 3rem;              /* 48px fila mínima */

/* Page Layout */
--page-padding-x: var(--space-6);
--page-padding-y: var(--space-8);
--section-gap: var(--space-8);
```

---

## 🔲 BORDES Y ELEVACIÓN

### Border Radius

```css
--radius-none: 0;
--radius-sm: 0.25rem;   /* 4px  - Badges, pequeños elementos */
--radius-md: 0.5rem;    /* 8px  - Botones, inputs, cards */
--radius-lg: 0.75rem;   /* 12px - Modales, paneles grandes */
--radius-full: 9999px;  /* Circular - Avatares, pills */
```

### Shadows (mínimo)

```css
/* Solo una sombra sutil permitida */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

/* Preferir bordes sobre sombras */
--border-width: 1px;
```

### Reglas

1. Preferir bordes sobre sombras
2. Máximo 1 nivel de sombra (shadow-sm)
3. Border radius consistente (usar --radius-md por defecto)

---

## ♿ ACCESIBILIDAD

### Contraste Obligatorio

- Texto normal: mínimo 4.5:1 (AA)
- Texto grande (18px+): mínimo 3:1 (AA)
- Iconos y elementos UI: mínimo 3:1

### Focus States

Todos los elementos interactivos deben tener focus visible:

```css
/* Focus ring estándar */
--focus-ring: 2px solid var(--color-primary);
--focus-offset: 2px;
```

### Keyboard Navigation

- Tab order lógico en todos los formularios
- Skip links en navegación principal
- Modales trapean focus

### Motion

Respetar `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 📐 GRID Y LAYOUT

### Container

```css
--container-max-width: 1280px;
--container-padding: var(--space-6);
```

### Breakpoints

```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
```

---

## ✅ COMPONENTES SAGRADOS (Sacred Components)

Estos componentes son **los únicos permitidos** para sus respectivos casos de uso.

### Lista de Sacred Components

1. **Button** - Todas las acciones
2. **Card** - Todos los paneles y bloques de información
3. **Table** - Todas las tablas de datos
4. **Input / Select / Textarea** - Todos los campos de formulario
5. **Badge** - Todos los estados y etiquetas
6. **Section** - Layout de página
7. **Container** - Contenedor principal
8. **Header / Sidebar** - Navegación institucional
9. **Modal** - Confirmaciones y diálogos
10. **EmptyState** - Estados vacíos

### Reglas de Uso

- ❌ NO crear cards personalizados
- ❌ NO crear botones personalizados
- ❌ NO usar estilos inline
- ✅ Usar solo Sacred Components
- ✅ Si necesitas variante nueva, agrégala al Sacred Component

---

## 🚫 PROHIBICIONES EXPLÍCITAS

### Absolutamente prohibido:

1. Gradientes decorativos
2. Animaciones que no sean transiciones sutiles
3. Emojis como íconos principales (permitido en contenido generado por usuario)
4. Colores fuera del sistema de tokens
5. Cards o buttons ad-hoc
6. Estilos inline (excepto valores dinámicos del backend)
7. Más de un color primary
8. Sombras complejas o múltiples
9. Border radius inconsistente
10. Tipografía no declarada en el sistema

---

## 📊 VALIDACIÓN DE CUMPLIMIENTO

### Antes de Merge, verificar:

- [ ] Solo usa colores de tokens
- [ ] Solo usa Sacred Components
- [ ] Contraste AA verificado (usar herramienta)
- [ ] Focus states presentes
- [ ] No hay gradientes decorativos
- [ ] No hay animaciones no funcionales
- [ ] Spacing usa sistema (--space-*)
- [ ] Typography usa escala declarada

### Herramientas de Validación

- Contrast Checker: https://webaim.org/resources/contrastchecker/
- ESLint: regla custom para detectar colores hardcoded
- Visual Regression: Chromatic para detectar cambios

---

## 🔄 EVOLUCIÓN DEL CONTRATO

### Cambios permitidos:

1. Agregar nuevos tokens (con aprobación de equipo)
2. Agregar variantes a Sacred Components
3. Ajustar valores numéricos (spacing, tamaños)

### Cambios NO permitidos sin redesign completo:

1. Cambiar principios fundamentales
2. Agregar segundo color primary
3. Permitir componentes ad-hoc

---

**Última actualización**: 2026-01-17
**Versión**: 1.0.0
**Owner**: Frontend Team
```

**Tiempo**: 8 horas

---

**Tarea 2: Implementar Design Tokens**

Dependiendo del stack detectado (Next.js + Tailwind):

**tailwind.config.ts**:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Semantic tokens (NOT color names)
        background: 'hsl(var(--color-background))',
        surface: 'hsl(var(--color-surface))',
        'surface-muted': 'hsl(var(--color-surface-muted))',

        border: 'hsl(var(--color-border))',
        'border-subtle': 'hsl(var(--color-border-subtle))',

        primary: {
          DEFAULT: 'hsl(var(--color-primary))',
          hover: 'hsl(var(--color-primary-hover))',
          active: 'hsl(var(--color-primary-active))',
          subtle: 'hsl(var(--color-primary-subtle))',
        },

        success: 'hsl(var(--color-success))',
        warning: 'hsl(var(--color-warning))',
        error: 'hsl(var(--color-error))',
        info: 'hsl(var(--color-info))',

        text: {
          primary: 'hsl(var(--color-text-primary))',
          secondary: 'hsl(var(--color-text-secondary))',
          muted: 'hsl(var(--color-text-muted))',
          inverse: 'hsl(var(--color-text-inverse))',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      fontSize: {
        h1: 'var(--text-h1)',
        h2: 'var(--text-h2)',
        h3: 'var(--text-h3)',
        h4: 'var(--text-h4)',
      },
      spacing: {
        // Mantener escala Tailwind pero agregar customs
        'card': 'var(--card-padding)',
        'section': 'var(--section-gap)',
      },
      borderRadius: {
        'none': '0',
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'full': 'var(--radius-full)',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'DEFAULT': 'none', // Force flat design
      },
    },
  },
  plugins: [],
}

export default config
```

**src/app/globals.css**:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Backgrounds */
    --color-background: 0 0% 100%;
    --color-surface: 0 0% 98%;
    --color-surface-muted: 0 0% 96%;

    /* Borders */
    --color-border: 0 0% 90%;
    --color-border-subtle: 0 0% 95%;

    /* Primary */
    --color-primary: 217 91% 60%;
    --color-primary-hover: 217 91% 55%;
    --color-primary-active: 217 91% 50%;
    --color-primary-subtle: 217 91% 95%;

    /* Functional */
    --color-success: 142 76% 36%;
    --color-warning: 38 92% 50%;
    --color-error: 0 72% 51%;
    --color-info: 199 89% 48%;

    /* Text */
    --color-text-primary: 0 0% 13%;
    --color-text-secondary: 0 0% 45%;
    --color-text-muted: 0 0% 60%;
    --color-text-inverse: 0 0% 100%;

    /* Typography */
    --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;

    --text-h1: 2rem;
    --text-h2: 1.5rem;
    --text-h3: 1.25rem;
    --text-h4: 1.125rem;

    /* Spacing */
    --card-padding: 2rem;
    --section-gap: 3rem;

    /* Borders */
    --radius-sm: 0.25rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-full: 9999px;

    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

    /* Focus */
    --focus-ring: 2px solid hsl(var(--color-primary));
    --focus-offset: 2px;
  }

  [data-theme="dark"] {
    --color-background: 0 0% 10%;
    --color-surface: 0 0% 13%;
    --color-surface-muted: 0 0% 16%;
    --color-text-primary: 0 0% 95%;
    --color-text-secondary: 0 0% 70%;
    --color-text-muted: 0 0% 50%;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-text-primary;
    font-feature-settings: "rlig" 1, "calt" 1;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}
```

**Tiempo**: 6 horas

---

#### **FASE 2: SACRED COMPONENTS (Sprint 6, Semanas 11-12)**

Crear los componentes canónicos en `/src/components/sacred/`

---

**Estructura de carpetas**:

```
src/components/sacred/
├── Button/
│   ├── Button.tsx
│   ├── Button.stories.tsx
│   └── Button.test.tsx
├── Card/
│   ├── Card.tsx
│   ├── Card.stories.tsx
│   └── Card.test.tsx
├── Table/
├── Input/
├── Select/
├── Textarea/
├── Badge/
├── Section/
├── Container/
├── Modal/
├── EmptyState/
└── index.ts (barrel export)
```

---

**1. Button Component**

**src/components/sacred/Button/Button.tsx**:

```typescript
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  // Base styles (obligatorios para todos)
  'inline-flex items-center justify-center rounded-md text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // Primary: Solo para CTAs principales
        primary: 'bg-primary text-text-inverse hover:bg-primary-hover active:bg-primary-active',

        // Secondary: Acciones importantes pero no primarias
        secondary: 'border border-border bg-surface hover:bg-surface-muted',

        // Ghost: Acciones terciarias, menos prominentes
        ghost: 'hover:bg-surface-muted',

        // Danger: Acciones destructivas (eliminar, cancelar)
        danger: 'bg-error text-text-inverse hover:opacity-90',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-4',
        lg: 'h-13 px-6 text-lg',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

**Uso**:

```tsx
// CTA principal
<Button variant="primary">Guardar cambios</Button>

// Acción secundaria
<Button variant="secondary">Cancelar</Button>

// Acción terciaria
<Button variant="ghost">Ver más</Button>

// Acción destructiva
<Button variant="danger">Eliminar estudiante</Button>
```

**Tiempo**: 3 horas

---

**2. Card Component**

**src/components/sacred/Card/Card.tsx**:

```typescript
import * as React from 'react'
import { cn } from '@/lib/utils'

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border border-border bg-surface p-card shadow-sm',
      className
    )}
    {...props}
  />
))
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 pb-4', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-h4 font-semibold leading-none tracking-tight', className)}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-text-secondary', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
```

**Uso**:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Estudiante: María González</CardTitle>
    <CardDescription>3° Año - División A</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Promedio general: 8.5</p>
  </CardContent>
  <CardFooter>
    <Button variant="ghost">Ver detalles</Button>
  </CardFooter>
</Card>
```

**Tiempo**: 3 horas

---

**3. Table Component**

**src/components/sacred/Table/Table.tsx**:

```typescript
import * as React from 'react'
import { cn } from '@/lib/utils'

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn('w-full caption-bottom text-sm', className)}
      {...props}
    />
  </div>
))
Table.displayName = 'Table'

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('border-b bg-surface-muted', className)} {...props} />
))
TableHeader.displayName = 'TableHeader'

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
))
TableBody.displayName = 'TableBody'

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b transition-colors hover:bg-surface-muted h-12',
      className
    )}
    {...props}
  />
))
TableRow.displayName = 'TableRow'

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-12 px-4 text-left align-middle font-semibold text-text-primary',
      className
    )}
    {...props}
  />
))
TableHead.displayName = 'TableHead'

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('p-4 align-middle', className)}
    {...props}
  />
))
TableCell.displayName = 'TableCell'

export {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
}
```

**Uso**:

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Estudiante</TableHead>
      <TableHead>Nota</TableHead>
      <TableHead>Estado</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Juan Pérez</TableCell>
      <TableCell>8.5</TableCell>
      <TableCell><Badge variant="success">Aprobado</Badge></TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**Tiempo**: 4 horas

---

**4. Badge Component**

**src/components/sacred/Badge/Badge.tsx**:

```typescript
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-sm px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-surface-muted text-text-primary border border-border',
        success: 'bg-success/10 text-success border border-success/20',
        warning: 'bg-warning/10 text-warning border border-warning/20',
        error: 'bg-error/10 text-error border border-error/20',
        info: 'bg-info/10 text-info border border-info/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
```

**Uso**:

```tsx
<Badge variant="success">Aprobado</Badge>
<Badge variant="warning">Pendiente</Badge>
<Badge variant="error">Desaprobado</Badge>
```

**Tiempo**: 2 horas

---

**5. Input Component**

**src/components/sacred/Input/Input.tsx**:

```typescript
import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, helperText, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'flex h-11 w-full rounded-md border border-border bg-surface px-3 py-2 text-base',
            'placeholder:text-text-muted',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-error focus-visible:ring-error',
            className
          )}
          ref={ref}
          {...props}
        />
        {helperText && !error && (
          <p className="text-xs text-text-secondary">{helperText}</p>
        )}
        {error && (
          <p className="text-xs text-error">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
```

**Uso**:

```tsx
<Input
  label="Email"
  type="email"
  placeholder="tu@email.com"
  helperText="Usaremos este email para notificaciones"
  error={errors.email?.message}
/>
```

**Tiempo**: 3 horas

---

**6. Modal Component**

**src/components/sacred/Modal/Modal.tsx**:

```typescript
import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const Modal = DialogPrimitive.Root
const ModalTrigger = DialogPrimitive.Trigger

const ModalPortal = DialogPrimitive.Portal

const ModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
))
ModalOverlay.displayName = 'ModalOverlay'

const ModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <ModalPortal>
    <ModalOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%]',
        'gap-4 border border-border bg-surface p-6 shadow-lg rounded-lg',
        'duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
        'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary">
        <X className="h-4 w-4" />
        <span className="sr-only">Cerrar</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </ModalPortal>
))
ModalContent.displayName = 'ModalContent'

const ModalHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
    {...props}
  />
)
ModalHeader.displayName = 'ModalHeader'

const ModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-h3 font-semibold leading-none tracking-tight', className)}
    {...props}
  />
))
ModalTitle.displayName = 'ModalTitle'

const ModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-text-secondary', className)}
    {...props}
  />
))
ModalDescription.displayName = 'ModalDescription'

const ModalFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
    {...props}
  />
)
ModalFooter.displayName = 'ModalFooter'

export {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalDescription,
}
```

**Uso**:

```tsx
<Modal>
  <ModalTrigger asChild>
    <Button variant="danger">Eliminar estudiante</Button>
  </ModalTrigger>
  <ModalContent>
    <ModalHeader>
      <ModalTitle>¿Estás seguro?</ModalTitle>
      <ModalDescription>
        Esta acción no se puede deshacer. Se eliminará permanentemente al estudiante.
      </ModalDescription>
    </ModalHeader>
    <ModalFooter>
      <Button variant="ghost">Cancelar</Button>
      <Button variant="danger">Eliminar</Button>
    </ModalFooter>
  </ModalContent>
</Modal>
```

**Tiempo**: 4 horas

---

**7. EmptyState Component**

**src/components/sacred/EmptyState/EmptyState.tsx**:

```typescript
import * as React from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center p-8 text-center',
          className
        )}
        {...props}
      >
        {icon && (
          <div className="mb-4 text-text-muted">{icon}</div>
        )}
        <h3 className="text-h4 font-semibold text-text-primary mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-text-secondary mb-4 max-w-md">
            {description}
          </p>
        )}
        {action && <div>{action}</div>}
      </div>
    )
  }
)
EmptyState.displayName = 'EmptyState'

export { EmptyState }
```

**Uso**:

```tsx
<EmptyState
  icon={<FileText className="h-12 w-12" />}
  title="No hay exámenes disponibles"
  description="Cuando se publiquen nuevos exámenes, aparecerán aquí."
  action={
    <Button variant="ghost">Volver al inicio</Button>
  }
/>
```

**Tiempo**: 2 horas

---

**8. Section y Container**

**src/components/sacred/Section/Section.tsx**:

```typescript
import * as React from 'react'
import { cn } from '@/lib/utils'

const Container = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('mx-auto max-w-7xl px-6', className)}
    {...props}
  />
))
Container.displayName = 'Container'

const Section = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <section
    ref={ref}
    className={cn('py-section', className)}
    {...props}
  />
))
Section.displayName = 'Section'

export { Container, Section }
```

**Tiempo**: 1 hora

---

**Total Sacred Components**: 9 componentes principales
**Tiempo total Fase 2**: ~24 horas

---

### ✅ MÉTRICAS DE ÉXITO - DESIGN SYSTEM 10/10

**Documentación**:
- [ ] DESIGN_CONTRACT.md completo y aprobado
- [ ] Design tokens implementados
- [ ] Tailwind config actualizado

**Sacred Components**:
- [ ] 9 componentes canónicos creados
- [ ] Storybook stories para cada componente
- [ ] Tests unitarios para cada componente
- [ ] Documentación de uso (JSDoc)

**Calidad**:
- [ ] Contraste AA verificado en todos los componentes
- [ ] Focus states presentes y visibles
- [ ] Keyboard navigation completa
- [ ] prefers-reduced-motion respetado

**Tiempo total Fase 1 + 2**: ~50 horas (5 semanas con 10h/semana)

---

## 3️⃣ UI REFACTOR TOTAL: Aplicar Design System (PRIORIDAD P0 🔴)

**Objetivo**: Refactorizar toda la UI para cumplir estrictamente con DESIGN_CONTRACT.md

---

### 📋 PLAN DE ACCIÓN

#### **FASE 3: AUDITORÍA UI (Sprint 7, Semanas 13-14)**

**Tarea 1: Scan completo del frontend**

**Script de auditoría**:

```bash
#!/bin/bash
# audit-ui.sh

echo "🔍 AUDITORÍA DE INCONSISTENCIAS UI"
echo "=================================="

echo "\n1️⃣ Buscando colores hardcoded..."
grep -r "bg-\[#" src/ --include="*.tsx" --include="*.jsx" | wc -l
grep -r "text-\[#" src/ --include="*.tsx" --include="*.jsx" | wc -l

echo "\n2️⃣ Buscando gradients..."
grep -r "gradient" src/ --include="*.tsx" --include="*.jsx" --include="*.css" | wc -l

echo "\n3️⃣ Buscando estilos inline..."
grep -r 'style={{' src/ --include="*.tsx" --include="*.jsx" | wc -l

echo "\n4️⃣ Buscando divs que deberían ser Card..."
grep -r '<div className=".*border.*rounded' src/ --include="*.tsx" | wc -l

echo "\n5️⃣ Buscando buttons custom..."
grep -r '<button' src/ --include="*.tsx" | grep -v "import.*Button" | wc -l

echo "\n6️⃣ Buscando emojis como íconos..."
grep -r "[😀-🙏]" src/ --include="*.tsx" --include="*.jsx" | wc -l

echo "\n✅ Auditoría completa. Ver detalles arriba."
```

**Crear reporte**:

```markdown
# UI AUDIT REPORT

## Fecha: 2026-XX-XX

### Hallazgos

| Tipo | Cantidad | Severidad | Acción |
|------|----------|-----------|--------|
| Colores hardcoded | 45 | 🔴 ALTA | Reemplazar con tokens |
| Gradientes | 12 | 🔴 ALTA | Eliminar |
| Estilos inline | 78 | 🟡 MEDIA | Mover a clases |
| Divs custom (debería ser Card) | 34 | 🔴 ALTA | Usar Card component |
| Buttons custom | 56 | 🔴 ALTA | Usar Button component |
| Emojis como íconos | 8 | 🟡 MEDIA | Reemplazar con iconos |

### Páginas a refactorizar (prioridad)

1. Dashboard (alta complejidad)
2. Exámenes (alta complejidad)
3. Calificaciones
4. Chat
5. Asignaturas
6. Perfil
7. Conducta
8. Asistencia
9. Entregas
10. Mensajes

### Estimación

- **Total de componentes a refactorizar**: ~150
- **Tiempo estimado**: 40 horas
```

**Tiempo**: 6 horas

---

#### **FASE 4: REFACTOR TOTAL (Sprint 8, Semanas 15-16)**

**Estrategia de refactor**:

1. **Página por página** (no todo de golpe)
2. **Branch por página** (git branch design/refactor-dashboard)
3. **PR con screenshots** (antes/después)
4. **Validation checklist** por PR

---

**Proceso para cada página**:

**ANTES** (ejemplo Dashboard):

```tsx
// src/app/(main)/dashboard/page.tsx - ANTES
export default function Dashboard() {
  return (
    <div className="p-6">
      {/* ❌ Hardcoded colors */}
      <div className="bg-[#f5f5f5] border border-[#e0e0e0] rounded-lg p-6 mb-4">
        {/* ❌ Custom button */}
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Ver exámenes
        </button>

        {/* ❌ Emoji como ícono */}
        <div className="flex items-center gap-2">
          📊 <span>Estadísticas</span>
        </div>

        {/* ❌ Gradiente */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500">
          Premium content
        </div>
      </div>
    </div>
  )
}
```

**DESPUÉS** (usando Sacred Components):

```tsx
// src/app/(main)/dashboard/page.tsx - DESPUÉS
import { Card, CardHeader, CardTitle, CardContent } from '@/components/sacred'
import { Button } from '@/components/sacred'
import { BarChart } from 'lucide-react'

export default function Dashboard() {
  return (
    <Section>
      <Container>
        {/* ✅ Usa Card component */}
        <Card>
          <CardHeader>
            <CardTitle>Panel de control</CardTitle>
          </CardHeader>
          <CardContent>
            {/* ✅ Usa Button component */}
            <Button variant="primary">Ver exámenes</Button>

            {/* ✅ Ícono de librería */}
            <div className="flex items-center gap-2 text-text-secondary">
              <BarChart className="h-5 w-5" />
              <span>Estadísticas</span>
            </div>

            {/* ✅ Sin gradiente, flat design */}
            <div className="bg-primary text-text-inverse p-4 rounded-md">
              Contenido destacado
            </div>
          </CardContent>
        </Card>
      </Container>
    </Section>
  )
}
```

---

**Checklist de validación por página**:

```markdown
## PR: Refactor Dashboard - Design System

### ✅ Design Contract Compliance

- [ ] Solo usa colores de tokens (no hardcoded)
- [ ] Solo usa Sacred Components (Card, Button, etc.)
- [ ] No hay gradientes decorativos
- [ ] No hay animaciones no funcionales
- [ ] Spacing usa sistema (Tailwind classes)
- [ ] Typography usa escala declarada
- [ ] No hay estilos inline (excepto dinámicos)

### ✅ Accessibility

- [ ] Contraste AA verificado
- [ ] Focus states presentes
- [ ] Keyboard navigation funciona
- [ ] ARIA labels donde corresponde

### ✅ Quality

- [ ] Screenshots antes/después incluidos
- [ ] Tests actualizados
- [ ] No rompe funcionalidad existente

### 📸 Screenshots

**Antes**:
![dashboard-before](...)

**Después**:
![dashboard-after](...)

### 🎯 Métricas

- Componentes refactorizados: 12
- Líneas eliminadas: 145
- Colores hardcoded eliminados: 8
- Cards custom → Sacred Card: 3
- Buttons custom → Sacred Button: 7
```

---

**Tiempo por página** (promedio):

| Página | Complejidad | Tiempo estimado |
|--------|-------------|-----------------|
| Dashboard | Alta | 6h |
| Exámenes | Alta | 6h |
| Calificaciones | Media | 4h |
| Chat | Media | 4h |
| Asignaturas | Media | 4h |
| Perfil | Baja | 2h |
| Conducta | Media | 3h |
| Asistencia | Media | 3h |
| Entregas | Media | 4h |
| Mensajes | Baja | 2h |

**Total**: ~38 horas

---

**Tarea final: Eliminar código legacy**

Una vez todas las páginas refactorizadas:

```bash
# Buscar componentes viejos no usados
npx depcheck

# Eliminar archivos obsoletos
rm -rf src/components/old-ui/

# Eliminar estilos duplicados
# ... revisar globals.css

# Commit final
git commit -m "chore: remove legacy UI components"
```

**Tiempo**: 2 horas

---

### ✅ MÉTRICAS DE ÉXITO - UI REFACTOR 10/10

**Eliminaciones**:
- [ ] 0 colores hardcoded
- [ ] 0 gradientes decorativos
- [ ] 0 buttons custom
- [ ] 0 cards custom
- [ ] 0 estilos inline innecesarios

**Adopción**:
- [ ] 100% páginas usan Sacred Components
- [ ] 100% spacing usa sistema Tailwind
- [ ] 100% colores desde tokens

**Calidad**:
- [ ] Visual regression tests pasando
- [ ] Contraste AA en todas las páginas
- [ ] 0 inconsistencias visuales
- [ ] UI se siente cohesiva y profesional

**Tiempo total Fase 3 + 4**: ~46 horas (5 semanas con 10h/semana)

---

### 🎯 RESUMEN DESIGN SYSTEM COMPLETO

**Fases**:
1. Contrato Visual (8h)
2. Design Tokens (6h)
3. Sacred Components (24h)
4. Auditoría UI (6h)
5. Refactor Total (38h)
6. Cleanup (2h)

**Tiempo total**: ~84 horas (8-9 semanas con 10h/semana)

**Resultado final**:
- Sistema de diseño institucional profesional
- UI cohesiva en toda la aplicación
- Confianza visual y claridad
- Mantenibilidad 100% mejorada
- Base sólida para escalabilidad

---

## 2️⃣ MANTENIBILIDAD: 6/10 → 10/10 (PRIORIDAD P0 🔴)

### Estado Actual
- ❌ ActionForm.tsx: 1922 líneas
- ❌ SubjectMessages.tsx: 461 líneas
- ❌ Componentes >500 LOC en múltiples archivos
- ⚠️ Duplicación de código
- ⚠️ Lógica mezclada con presentación

### Objetivo 10/10
- ✅ Máximo 300 LOC por archivo
- ✅ Separación clara presentación/lógica
- ✅ 0% duplicación de código
- ✅ Documentación inline completa
- ✅ Storybook para componentes
- ✅ Design tokens centralizados

### 📋 PLAN DE ACCIÓN

#### **Sprint 7-8 (Semanas 13-16): Refactoring Componentes Grandes**

**Tareas:**

**1. Refactorizar ActionForm.tsx (1922 LOC → 300 LOC)**

**ANTES**:
```
ActionForm.tsx (1922 líneas)
└── Toda la lógica en un archivo
```

**DESPUÉS**:
```
src/app/(main)/conducta/components/action-form/
├── index.tsx                          (50 LOC - Re-export)
├── ActionFormContainer.tsx            (150 LOC - Lógica + State)
├── ActionFormHeader.tsx               (80 LOC - Header + breadcrumb)
├── ActionFormFields.tsx               (200 LOC - Form fields)
├── ActionFormSubmit.tsx               (100 LOC - Submit + validation)
├── ActionFormValidation.ts            (150 LOC - Zod schemas)
├── useActionForm.ts                   (200 LOC - Custom hook)
└── types.ts                           (50 LOC - Types)
```

**src/app/(main)/conducta/components/action-form/ActionFormContainer.tsx**:
```typescript
'use client'

import { useActionForm } from './useActionForm'
import { ActionFormHeader } from './ActionFormHeader'
import { ActionFormFields } from './ActionFormFields'
import { ActionFormSubmit } from './ActionFormSubmit'

export function ActionFormContainer() {
  const {
    form,
    isLoading,
    handleSubmit,
    resetForm,
  } = useActionForm()

  return (
    <div className="container max-w-4xl py-6">
      <ActionFormHeader />
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <ActionFormFields form={form} />
        <ActionFormSubmit isLoading={isLoading} onReset={resetForm} />
      </form>
    </div>
  )
}
```

**src/app/(main)/conducta/components/action-form/useActionForm.ts**:
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { actionFormSchema, type ActionFormData } from './ActionFormValidation'
import { apiClient } from '@/lib/api-client'

export function useActionForm() {
  const router = useRouter()

  const form = useForm<ActionFormData>({
    resolver: zodResolver(actionFormSchema),
    defaultValues: {
      studentId: undefined,
      actionType: 'warning',
      description: '',
      severity: 'low',
      notifyParents: false,
    },
  })

  const handleSubmit = async (data: ActionFormData) => {
    try {
      await apiClient.post('/api/proxy/disciplinary-actions', data)
      toast.success('Acción disciplinaria registrada correctamente')
      router.push('/conducta')
    } catch (error) {
      toast.error('Error al registrar acción')
      console.error(error)
    }
  }

  const resetForm = () => {
    form.reset()
  }

  return {
    form,
    isLoading: form.formState.isSubmitting,
    handleSubmit,
    resetForm,
  }
}
```

**Tiempo**: 16 horas

---

**2. Refactorizar SubjectMessages.tsx (461 LOC → 250 LOC)**

**ANTES**:
```
SubjectMessages.tsx (461 líneas)
```

**DESPUÉS**:
```
src/app/(main)/asignaturas/components/
├── subject-messages/
│   ├── SubjectMessagesContainer.tsx   (120 LOC)
│   ├── MessageList.tsx                (100 LOC)
│   ├── MessageCard.tsx                (80 LOC)
│   ├── MessageFilter.tsx              (60 LOC)
│   └── useSubjectMessages.ts          (150 LOC)
```

**Tiempo**: 12 horas

---

**3. Implementar Arquitectura Atomic Design**

```
src/components/
├── atoms/                    # Elementos básicos
│   ├── Button/
│   ├── Input/
│   ├── Badge/
│   └── ...
├── molecules/                # Combinaciones simples
│   ├── FormField/
│   ├── SearchBar/
│   ├── UserAvatar/
│   └── ...
├── organisms/                # Componentes complejos
│   ├── Header/
│   ├── Sidebar/
│   ├── ExamCard/
│   └── ...
├── templates/                # Layouts de página
│   ├── DashboardTemplate/
│   ├── FormTemplate/
│   └── ...
└── pages/                    # Páginas completas (opcional)
```

**Tiempo**: 20 horas (migración gradual)

---

**4. Crear Custom Hooks Reutilizables**

**src/hooks/shared/usePagination.ts**:
```typescript
import { useState, useMemo } from 'react'

interface UsePaginationProps {
  totalItems: number
  itemsPerPage: number
  initialPage?: number
}

export function usePagination({
  totalItems,
  itemsPerPage,
  initialPage = 1,
}: UsePaginationProps) {
  const [currentPage, setCurrentPage] = useState(initialPage)

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return { start, end }
  }, [currentPage, itemsPerPage])

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const nextPage = () => goToPage(currentPage + 1)
  const prevPage = () => goToPage(currentPage - 1)
  const goToFirstPage = () => goToPage(1)
  const goToLastPage = () => goToPage(totalPages)

  return {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  }
}
```

**src/hooks/shared/useDebounce.ts**:
```typescript
import { useEffect, useState } from 'react'

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
```

**src/hooks/shared/useInfiniteScroll.ts**:
```typescript
import { useEffect, useRef, useCallback } from 'react'

interface UseInfiniteScrollProps {
  onLoadMore: () => void
  hasMore: boolean
  isLoading: boolean
  threshold?: number
}

export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 0.8,
}: UseInfiniteScrollProps) {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && hasMore && !isLoading) {
        onLoadMore()
      }
    },
    [hasMore, isLoading, onLoadMore]
  )

  useEffect(() => {
    const element = loadMoreRef.current
    if (!element) return

    observerRef.current = new IntersectionObserver(handleObserver, {
      threshold,
    })

    observerRef.current.observe(element)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [handleObserver, threshold])

  return { loadMoreRef }
}
```

**Tiempo**: 12 horas (crear 6 hooks)

---

**5. Setup Storybook**

```bash
npx sb init
```

**src/components/atoms/Button/Button.stories.tsx**:
```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: {
    children: 'Button',
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
}

export const Loading: Story = {
  args: {
    children: 'Loading',
    disabled: true,
  },
  render: (args) => (
    <Button {...args}>
      <span className="animate-spin">⏳</span>
      {args.children}
    </Button>
  ),
}
```

**Tiempo**: 30 horas (crear stories para 40+ componentes)

---

**6. Documentación Inline**

**Implementar JSDoc**:

```typescript
/**
 * Custom hook para manejar el estado de autenticación del usuario
 *
 * @example
 * ```tsx
 * const { user, isLoading, login, logout } = useAuth()
 *
 * if (isLoading) return <Spinner />
 * if (!user) return <LoginForm onSubmit={login} />
 * return <Dashboard user={user} onLogout={logout} />
 * ```
 *
 * @returns {Object} Estado y funciones de autenticación
 * @property {UserInfo | null} user - Información del usuario autenticado
 * @property {boolean} isLoading - Indica si se está verificando autenticación
 * @property {(credentials: LoginData) => Promise<void>} login - Función para iniciar sesión
 * @property {() => void} logout - Función para cerrar sesión
 *
 * @throws {AuthError} Si las credenciales son inválidas
 *
 * @see {@link UserInfo} para la estructura de datos del usuario
 * @see {@link LoginData} para los datos requeridos en el login
 */
export function useAuth() {
  // ...
}
```

**Generar documentación automática**:

```bash
npm install -D typedoc
```

**typedoc.json**:
```json
{
  "entryPoints": ["src"],
  "out": "docs",
  "exclude": ["**/*.test.ts", "**/*.spec.ts"],
  "plugin": ["typedoc-plugin-markdown"],
  "readme": "none"
}
```

**package.json**:
```json
{
  "scripts": {
    "docs:generate": "typedoc",
    "docs:serve": "npx http-server docs -p 8080"
  }
}
```

**Tiempo**: 20 horas

---

#### **Sprint 9 (Semanas 17-18): Design Tokens + Code Quality**

**Tareas:**

**1. Centralizar Design Tokens**

**src/design-system/tokens.ts**:
```typescript
export const tokens = {
  colors: {
    primary: {
      50: 'hsl(217, 91%, 95%)',
      100: 'hsl(217, 91%, 90%)',
      // ... resto de escala
      500: 'hsl(217, 91%, 60%)',  // Base
      900: 'hsl(217, 91%, 20%)',
    },
    // ... resto de colores
  },
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
  },
  typography: {
    fontFamily: {
      sans: 'var(--font-geist-sans)',
      mono: 'var(--font-geist-mono)',
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px',
  },
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const

// Generar CSS variables
export function generateCSSVariables() {
  const cssVars: string[] = []

  Object.entries(tokens.colors).forEach(([name, shades]) => {
    if (typeof shades === 'object') {
      Object.entries(shades).forEach(([shade, value]) => {
        cssVars.push(`  --color-${name}-${shade}: ${value};`)
      })
    }
  })

  return `:root {\n${cssVars.join('\n')}\n}`
}
```

**Tiempo**: 8 horas

---

**2. Setup ESLint + Prettier**

**.eslintrc.json**:
```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "import"],
  "rules": {
    "max-lines": ["error", { "max": 300, "skipBlankLines": true }],
    "max-lines-per-function": ["warn", { "max": 50 }],
    "complexity": ["warn", 10],
    "max-depth": ["error", 3],
    "max-params": ["error", 4],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "newlines-between": "always",
        "alphabetize": { "order": "asc" }
      }
    ]
  }
}
```

**.prettierrc**:
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "arrowParens": "always"
}
```

**Tiempo**: 4 horas

---

**3. Code Splitting Estratégico**

**next.config.ts**:
```typescript
import type { NextConfig } from 'next'

const config: NextConfig = {
  // ... existing config

  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      'lucide-react',
    ],
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          // UI components chunk
          ui: {
            name: 'ui',
            chunks: 'all',
            test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
            priority: 30,
          },
          // Shared utilities chunk
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      }
    }
    return config
  },
}

export default config
```

**Lazy Loading de Componentes**:

```typescript
import dynamic from 'next/dynamic'

// Heavy components - lazy load
const FullCalendar = dynamic(
  () => import('@fullcalendar/react'),
  { ssr: false, loading: () => <CalendarSkeleton /> }
)

const ChatWindow = dynamic(
  () => import('./components/ChatWindow'),
  { loading: () => <ChatSkeleton /> }
)
```

**Tiempo**: 6 horas

---

### ✅ MÉTRICAS DE ÉXITO - MANTENIBILIDAD 10/10

- [ ] 0 archivos >300 LOC
- [ ] Complejidad ciclomática promedio <10
- [ ] 100% componentes con Storybook
- [ ] 0% código duplicado (SonarQube)
- [ ] Todas las funciones documentadas (JSDoc)
- [ ] Design tokens centralizados
- [ ] ESLint score: 0 warnings
- [ ] Bundle size <500KB (gzipped)

**Tiempo total**: ~140 horas (3.5 meses con 10h/semana)

---

## 3️⃣ SEGURIDAD: 7/10 → 10/10 (PRIORIDAD P1 🟡)

### Estado Actual
- ⚠️ CSP con `unsafe-inline` y `unsafe-eval`
- ⚠️ No hay rate limiting en cliente
- ⚠️ Tokens en localStorage (puede ser XSS)
- ✅ HTTPS configurado
- ✅ Headers de seguridad básicos

### Objetivo 10/10
- ✅ CSP strict sin `unsafe-*`
- ✅ Rate limiting implementado
- ✅ Tokens en httpOnly cookies
- ✅ Input sanitization completa
- ✅ Dependency scanning automatizado
- ✅ Security headers completos
- ✅ OWASP Top 10 cubierto

### 📋 PLAN DE ACCIÓN

#### **Sprint 10 (Semanas 19-20): Hardening de Seguridad**

**Tareas:**

**1. CSP Strict (Eliminar unsafe-*)**

**src/middleware.ts**:
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import crypto from 'crypto'

export function middleware(request: NextRequest) {
  const nonce = crypto.randomBytes(16).toString('base64')

  const response = NextResponse.next()

  // Strict CSP
  const cspHeader = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://localhost wss://localhost",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join('; ')

  response.headers.set('Content-Security-Policy', cspHeader)

  // Otros headers de seguridad
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  )
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )

  // Store nonce for use in pages
  response.headers.set('X-Nonce', nonce)

  return response
}
```

**Usar nonce en scripts inline**:

```typescript
// app/layout.tsx
import { headers } from 'next/headers'

export default async function RootLayout({ children }) {
  const headersList = await headers()
  const nonce = headersList.get('X-Nonce') || ''

  return (
    <html>
      <head>
        <script nonce={nonce}>
          {/* Safe inline script */}
        </script>
      </head>
      <body>{children}</body>
    </html>
  )
}
```

**Tiempo**: 8 horas

---

**2. Rate Limiting en Cliente**

**src/lib/rate-limiter.ts**:
```typescript
interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>()

  constructor(private config: RateLimitConfig) {}

  async checkLimit(key: string): Promise<boolean> {
    const now = Date.now()
    const entry = this.limits.get(key)

    if (!entry || now > entry.resetTime) {
      // Nueva ventana
      this.limits.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      })
      return true
    }

    if (entry.count >= this.config.maxRequests) {
      return false // Rate limit excedido
    }

    entry.count++
    return true
  }

  getRemainingTime(key: string): number {
    const entry = this.limits.get(key)
    if (!entry) return 0

    const now = Date.now()
    return Math.max(0, entry.resetTime - now)
  }
}

// Configuraciones por endpoint
export const apiRateLimiter = new RateLimiter({
  maxRequests: 60,
  windowMs: 60 * 1000, // 60 req/min
})

export const loginRateLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 5 req/15min
})

export const chatRateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000, // 100 msg/min
})
```

**Integrar con axios**:

```typescript
// src/lib/api-client.ts
import axios from 'axios'
import { apiRateLimiter } from './rate-limiter'

apiClient.interceptors.request.use(async (config) => {
  const key = `${config.method}-${config.url}`

  const allowed = await apiRateLimiter.checkLimit(key)

  if (!allowed) {
    const retryAfter = apiRateLimiter.getRemainingTime(key)
    throw new Error(
      `Rate limit exceeded. Retry after ${Math.ceil(retryAfter / 1000)}s`
    )
  }

  return config
})
```

**Tiempo**: 6 horas

---

**3. Input Sanitization Completa**

**src/lib/sanitize.ts**:
```typescript
import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitiza HTML para prevenir XSS
 */
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
  })
}

/**
 * Escapa caracteres especiales para SQL
 * (Usado en cliente, el backend debe hacer su propia validación)
 */
export function escapeSQL(str: string): string {
  return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
    switch (char) {
      case '\0':
        return '\\0'
      case '\x08':
        return '\\b'
      case '\x09':
        return '\\t'
      case '\x1a':
        return '\\z'
      case '\n':
        return '\\n'
      case '\r':
        return '\\r'
      case '"':
      case "'":
      case '\\':
      case '%':
        return '\\' + char
      default:
        return char
    }
  })
}

/**
 * Valida y sanitiza emails
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

/**
 * Sanitiza nombres de archivo (previene path traversal)
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9._-]/gi, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 255)
}

/**
 * Sanitiza URLs
 */
export function sanitizeURL(url: string): string {
  try {
    const parsed = new URL(url)

    // Solo permitir http y https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol')
    }

    return parsed.toString()
  } catch {
    return ''
  }
}
```

**Usar en componentes**:

```typescript
import { sanitizeHTML } from '@/lib/sanitize'

export function MessageDisplay({ content }: { content: string }) {
  const sanitized = sanitizeHTML(content)

  return (
    <div dangerouslySetInnerHTML={{ __html: sanitized }} />
  )
}
```

**Tiempo**: 6 horas

---

**4. Dependency Scanning Automatizado**

**.github/workflows/security.yml**:
```yaml
name: Security Scan

on:
  push:
    branches: [main, develop]
  pull_request:
  schedule:
    - cron: '0 0 * * 0'  # Semanal

jobs:
  dependency-scan:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Run npm audit
        run: npm audit --audit-level=moderate

      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  code-scan:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

  secret-scan:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: GitLeaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Tiempo**: 4 horas

---

**5. Security Headers Testing**

**tests/security/headers.spec.ts**:
```typescript
import { test, expect } from '@playwright/test'

test.describe('Security Headers', () => {
  test('should have strict CSP', async ({ page }) => {
    const response = await page.goto('/')

    const csp = response?.headers()['content-security-policy']

    expect(csp).toContain("default-src 'self'")
    expect(csp).not.toContain('unsafe-inline')
    expect(csp).not.toContain('unsafe-eval')
    expect(csp).toContain('strict-dynamic')
  })

  test('should have HSTS', async ({ page }) => {
    const response = await page.goto('/')

    const hsts = response?.headers()['strict-transport-security']

    expect(hsts).toContain('max-age=31536000')
    expect(hsts).toContain('includeSubDomains')
  })

  test('should prevent clickjacking', async ({ page }) => {
    const response = await page.goto('/')

    const xFrame = response?.headers()['x-frame-options']

    expect(xFrame).toBe('DENY')
  })

  test('should have X-Content-Type-Options', async ({ page }) => {
    const response = await page.goto('/')

    const contentType = response?.headers()['x-content-type-options']

    expect(contentType).toBe('nosniff')
  })
})
```

**Tiempo**: 4 horas

---

**6. Implementar Subresource Integrity (SRI)**

**next.config.ts**:
```typescript
const config: NextConfig = {
  // ... existing config

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // ... existing headers
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
        ],
      },
    ]
  },
}
```

**Tiempo**: 4 horas

---

### ✅ MÉTRICAS DE ÉXITO - SEGURIDAD 10/10

- [ ] CSP sin `unsafe-inline` ni `unsafe-eval`
- [ ] Rate limiting en todos los endpoints críticos
- [ ] 0 vulnerabilidades críticas (Snyk)
- [ ] 0 secretos en código (GitLeaks)
- [ ] Security headers score A+ (securityheaders.com)
- [ ] OWASP ZAP scan sin high/critical
- [ ] 100% inputs sanitizados
- [ ] Dependency updates automáticos (Dependabot)

**Tiempo total**: ~32 horas (1 mes con 8h/semana)

---

## 4️⃣ PERFORMANCE: 7/10 → 10/10 (PRIORIDAD P1 🟡)

### Estado Actual
- ⚠️ No hay lazy loading estratégico
- ⚠️ Bundle size sin optimizar
- ⚠️ Algunas imágenes sin optimizar
- ⚠️ No hay service worker
- ✅ Next.js image optimization

### Objetivo 10/10
- ✅ Lighthouse score >95
- ✅ Bundle size <300KB (gzipped)
- ✅ FCP <1.5s, LCP <2.5s
- ✅ Service Worker + PWA
- ✅ Infinite scroll en listados
- ✅ Optimistic UI updates

### 📋 PLAN DE ACCIÓN

#### **Sprint 11 (Semanas 21-22): Performance Optimization**

**Tareas:**

**1. Implementar Service Worker + PWA**

```bash
npm install next-pwa
```

**next.config.ts**:
```typescript
import withPWA from 'next-pwa'

const config = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 año
        },
      },
    },
    {
      urlPattern: /^https:\/\/localhost\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 horas
        },
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: /\.(?:jpg|jpeg|png|gif|webp|svg)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 días
        },
      },
    },
  ],
})

export default config
```

**public/manifest.json**:
```json
{
  "name": "GoSchool - Stella Maris Rosario",
  "short_name": "GoSchool",
  "description": "Sistema integral de gestión académica",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#6366f1",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/images/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/images/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

**Tiempo**: 6 horas

---

**2. Implementar Infinite Scroll**

**src/app/(main)/examenes/components/ExamListInfinite.tsx**:
```typescript
'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { useInfiniteScroll } from '@/hooks/shared/useInfiniteScroll'
import { ExamCard } from './ExamCard'
import { apiClient } from '@/lib/api-client'

const ITEMS_PER_PAGE = 20

export function ExamListInfinite() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['exams'],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await apiClient.get('/api/proxy/exams', {
        params: {
          offset: pageParam,
          limit: ITEMS_PER_PAGE,
        },
      })
      return response.data
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < ITEMS_PER_PAGE) return undefined
      return allPages.length * ITEMS_PER_PAGE
    },
    initialPageParam: 0,
  })

  const { loadMoreRef } = useInfiniteScroll({
    onLoadMore: fetchNextPage,
    hasMore: hasNextPage ?? false,
    isLoading: isFetchingNextPage,
  })

  const exams = data?.pages.flatMap((page) => page) ?? []

  return (
    <div className="space-y-4">
      {exams.map((exam) => (
        <ExamCard key={exam.id} exam={exam} />
      ))}

      <div ref={loadMoreRef} className="py-4">
        {isFetchingNextPage && <LoadingSpinner />}
      </div>
    </div>
  )
}
```

**Tiempo**: 8 horas (implementar en 3 páginas)

---

**3. Optimistic UI Updates**

**src/hooks/useChatMessages.ts**:
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { ChatMessage } from '@/types/chat'

export function useChatMessages(chatId: number) {
  const queryClient = useQueryClient()

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiClient.post(
        `/api/proxy/chats/${chatId}/messages`,
        { message }
      )
      return response.data
    },

    // Optimistic update
    onMutate: async (message) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['messages', chatId],
      })

      // Snapshot previous value
      const previousMessages = queryClient.getQueryData<ChatMessage[]>([
        'messages',
        chatId,
      ])

      // Optimistically update
      const optimisticMessage: ChatMessage = {
        id: Date.now(), // Temporal ID
        chat_id: chatId,
        message,
        sender_id: 1, // Current user
        created_at: new Date().toISOString(),
        type_message: 'text',
        _optimistic: true, // Flag
      }

      queryClient.setQueryData<ChatMessage[]>(
        ['messages', chatId],
        (old) => [...(old ?? []), optimisticMessage]
      )

      return { previousMessages }
    },

    // Rollback on error
    onError: (err, message, context) => {
      queryClient.setQueryData(
        ['messages', chatId],
        context?.previousMessages
      )
      toast.error('Error al enviar mensaje')
    },

    // Refetch on success
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['messages', chatId],
      })
    },
  })

  return { sendMessage }
}
```

**Tiempo**: 8 horas

---

**4. Bundle Size Optimization**

**Analizar bundle**:

```bash
npm install -D @next/bundle-analyzer
```

**next.config.ts**:
```typescript
import withBundleAnalyzer from '@next/bundle-analyzer'

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default bundleAnalyzer(config)
```

**package.json**:
```json
{
  "scripts": {
    "analyze": "ANALYZE=true npm run build"
  }
}
```

**Reemplazar librerías pesadas**:

| Librería Actual | Tamaño | Alternativa | Tamaño | Ahorro |
|----------------|--------|-------------|--------|--------|
| moment.js | 288KB | date-fns | 78KB | -73% |
| lodash | 72KB | lodash-es (tree-shakeable) | ~20KB | -72% |
| axios | 33KB | ky | 11KB | -67% |

```bash
npm uninstall moment lodash axios
npm install date-fns lodash-es ky
```

**Tiempo**: 12 horas

---

**5. Image Optimization Avanzada**

**src/components/OptimizedImage.tsx**:
```typescript
import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  priority?: boolean
  className?: string
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className="relative overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        onLoad={() => setIsLoading(false)}
        placeholder="blur"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
      />
    </div>
  )
}
```

**Convertir imágenes a WebP**:

```bash
npm install -D sharp
```

**scripts/optimize-images.js**:
```javascript
const sharp = require('sharp')
const fs = require('fs/promises')
const path = require('path')

async function optimizeImages() {
  const imagesDir = path.join(__dirname, '../public/images')
  const files = await fs.readdir(imagesDir)

  for (const file of files) {
    if (!/\.(jpg|jpeg|png)$/i.test(file)) continue

    const inputPath = path.join(imagesDir, file)
    const outputPath = path.join(
      imagesDir,
      file.replace(/\.(jpg|jpeg|png)$/i, '.webp')
    )

    await sharp(inputPath)
      .webp({ quality: 80 })
      .toFile(outputPath)

    console.log(`Optimized: ${file} -> ${path.basename(outputPath)}`)
  }
}

optimizeImages()
```

**package.json**:
```json
{
  "scripts": {
    "optimize:images": "node scripts/optimize-images.js"
  }
}
```

**Tiempo**: 6 horas

---

**6. React Query para Data Fetching**

```bash
npm install @tanstack/react-query
```

**src/app/providers.tsx**:
```typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 min
            gcTime: 10 * 60 * 1000, // 10 min
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

**Refactorizar hooks a React Query**:

```typescript
// ANTES (manual fetch + Zustand)
export function useUserInfo() {
  const { userInfo, fetchUserInfo } = useUserInfoStore()

  useEffect(() => {
    fetchUserInfo()
  }, [])

  return { userInfo }
}

// DESPUÉS (React Query)
export function useUserInfo() {
  return useQuery({
    queryKey: ['userInfo'],
    queryFn: async () => {
      const response = await apiClient.get('/api/proxy/personal-data')
      return response.data
    },
    staleTime: 5 * 60 * 1000,
  })
}
```

**Tiempo**: 16 horas (migrar todos los hooks)

---

**7. Code Splitting + Lazy Loading**

**src/app/(main)/layout.tsx**:
```typescript
import dynamic from 'next/dynamic'

// Lazy load componentes pesados
const Sidebar = dynamic(() => import('./components/Sidebar'), {
  ssr: false,
  loading: () => <SidebarSkeleton />,
})

const BottomNavbar = dynamic(() => import('./components/BottomNavbar'), {
  ssr: false,
})

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">{children}</main>
      <BottomNavbar />
    </div>
  )
}
```

**Tiempo**: 8 horas

---

### ✅ MÉTRICAS DE ÉXITO - PERFORMANCE 10/10

- [ ] Lighthouse Performance >95
- [ ] FCP <1.5s
- [ ] LCP <2.5s
- [ ] TTI <3.5s
- [ ] CLS <0.1
- [ ] Bundle size <300KB (gzipped)
- [ ] PWA installable
- [ ] Service Worker caching >80%
- [ ] Infinite scroll en listados
- [ ] React Query implementado

**Tiempo total**: ~64 horas (2 meses con 8h/semana)

---

## 5️⃣ STATE MANAGEMENT: 8/10 → 10/10 (PRIORIDAD P2 🟢)

### Estado Actual
- ✅ Zustand bien implementado
- ⚠️ Estado duplicado potencial
- ⚠️ Cache invalidation manual

### Objetivo 10/10
- ✅ React Query como source of truth
- ✅ Zustand solo para UI state
- ✅ Cache invalidation automática
- ✅ Optimistic updates en todo

### 📋 PLAN DE ACCIÓN

Ya cubierto en sección de Performance (React Query migration).

**Tareas adicionales:**

**1. Separar Server State de UI State**

```typescript
// Server State (React Query)
useQuery(['userInfo'])
useQuery(['exams'])
useMutation(['sendMessage'])

// UI State (Zustand)
useUIStore() // sidebar open/close, theme, etc.
useModalStore() // modals state
useToastStore() // toast notifications
```

**2. Normalizar datos complejos**

```bash
npm install @reduxjs/toolkit
```

```typescript
import { createEntityAdapter } from '@reduxjs/toolkit'

const examsAdapter = createEntityAdapter<Exam>()

// Normaliza: { ids: [1, 2], entities: { 1: {...}, 2: {...} } }
const normalized = examsAdapter.setAll(
  examsAdapter.getInitialState(),
  exams
)
```

**Tiempo**: 16 horas

### ✅ MÉTRICAS DE ÉXITO - STATE MANAGEMENT 10/10

- [ ] 0 estado duplicado
- [ ] React Query para server state
- [ ] Zustand solo para UI state
- [ ] Cache invalidation automática
- [ ] Optimistic updates 100%

**Tiempo total**: ~16 horas (0.5 meses con 8h/semana)

---

## 6️⃣ ARQUITECTURA: 9/10 → 10/10 (PRIORIDAD P2 🟢)

### Estado Actual
- ✅ Arquitectura modular
- ⚠️ Falta documentación formal
- ⚠️ ADRs no documentados

### Objetivo 10/10
- ✅ Architecture Decision Records (ADRs)
- ✅ C4 Model diagrams
- ✅ API documentation (OpenAPI)
- ✅ Onboarding docs

### 📋 PLAN DE ACCIÓN

**1. ADRs (Architecture Decision Records)**

**docs/adr/0001-use-zustand-for-state.md**:
```markdown
# ADR 0001: Use Zustand for Client State Management

## Status
Accepted

## Context
We need a state management solution that is:
- Lightweight (<1KB)
- TypeScript-first
- Easy to test
- No boilerplate

## Decision
Use Zustand with persist middleware for client-side state.

## Consequences
**Positive:**
- Minimal bundle size impact
- Great DX with TypeScript
- Easy to test (no Provider needed)

**Negative:**
- Less mature ecosystem than Redux
- Fewer devtools integrations
```

**Tiempo**: 12 horas (6 ADRs)

---

**2. C4 Model Diagrams**

```bash
npm install -D @mermaid-js/mermaid-cli
```

**docs/architecture/c4-context.md**:
```mermaid
graph TB
    User[User<br/>Student/Teacher/Parent]
    GoSchool[GoSchool Frontend<br/>Next.js 15]
    Backend[GoSchool Backend<br/>Rust/Actix]
    DB[(MySQL<br/>Database)]

    User -->|HTTPS| GoSchool
    GoSchool -->|REST API| Backend
    GoSchool -->|WebSocket| Backend
    Backend -->|SQL| DB
```

**Tiempo**: 8 horas

---

### ✅ MÉTRICAS DE ÉXITO - ARQUITECTURA 10/10

- [ ] 10+ ADRs documentados
- [ ] C4 diagrams completos
- [ ] API docs (OpenAPI)
- [ ] Onboarding guide <30min

**Tiempo total**: ~20 horas (0.5 meses con 10h/semana)

---

## 7️⃣ TYPE SAFETY: 9/10 → 10/10 (PRIORIDAD P2 🟢)

### Estado Actual
- ✅ TypeScript strict mode
- ⚠️ Branded types no usados consistentemente
- ⚠️ `any` en algunos lugares

### Objetivo 10/10
- ✅ 0% uso de `any`
- ✅ Branded types en todo
- ✅ Type guards completos
- ✅ Zod schemas generados automáticamente

### 📋 PLAN DE ACCIÓN

**1. Eliminar todos los `any`**

```bash
npm install -D @typescript-eslint/eslint-plugin
```

**.eslintrc.json**:
```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-call": "error"
  }
}
```

**Tiempo**: 12 horas

---

**2. Aplicar branded types consistentemente**

```typescript
// src/types/branded.ts
export type UserId = number & { readonly __brand: 'UserId' }
export type CourseId = number & { readonly __brand: 'CourseId' }
export type SubjectId = number & { readonly __brand: 'SubjectId' }

export function toUserId(id: number): UserId {
  return id as UserId
}

// Forzar uso con type guards
export function isUserId(id: number): id is UserId {
  return id > 0 && Number.isInteger(id)
}
```

**Tiempo**: 8 horas

---

**3. Generar Zod schemas desde TypeScript**

```bash
npm install -D ts-to-zod
```

```typescript
// types.ts
export interface UserInfo {
  id: number
  email: string
  role: "admin" | "teacher" | "student"
}

// Auto-genera schemas/userInfo.ts
// z.object({ id: z.number(), email: z.string().email(), ... })
```

**Tiempo**: 6 horas

---

### ✅ MÉTRICAS DE ÉXITO - TYPE SAFETY 10/10

- [ ] 0% uso de `any`
- [ ] Branded types 100%
- [ ] Type coverage 100%
- [ ] Zod schemas auto-generados

**Tiempo total**: ~26 horas (1 mes con 6h/semana)

---

# 📊 RESUMEN EJECUTIVO

## Tiempo Total por Aspecto

| Aspecto | Horas | Semanas (10h/sem) | Prioridad |
|---------|-------|-------------------|-----------|
| Testing | 100h | 10 semanas | 🔴 P0 |
| **Design System** | **84h** | **8 semanas** | 🔴 P0 |
| Mantenibilidad | 140h | 14 semanas | 🔴 P0 |
| Seguridad | 32h | 3 semanas | 🟡 P1 |
| Performance | 64h | 6 semanas | 🟡 P1 |
| State Management | 16h | 2 semanas | 🟢 P2 |
| Arquitectura | 20h | 2 semanas | 🟢 P2 |
| Type Safety | 26h | 3 semanas | 🟢 P2 |
| **TOTAL** | **482h** | **~48 semanas** | **12 meses** |

## Con enfoque 80/20 (8h/semana en mejoras)

**Duración real**: ~60 semanas = **14 meses**

---

## 🎯 QUICK WINS (Primeros 30 días)

**Semana 1-2:**
1. Setup testing infrastructure (8h)
2. Fix build errors - eliminar `ignoreBuildErrors` (6h)
3. Refactorizar ActionForm.tsx (16h)

**Semana 3-4:**
1. Implementar CSP strict (8h)
2. Setup ESLint rules (4h)
3. Primeros tests unitarios (12h)

**Resultado**: Build confiable + código más mantenible + mejor seguridad

---

## 🚀 ROADMAP VISUAL (8 MESES)

```
┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│  MES 1-2 │  MES 2-3 │  MES 3-4 │  MES 4-5 │  MES 6-7 │  MES 7-8 │    MES 8    │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ TESTING  │  DESIGN  │    UI    │ REFACTOR │SECURITY  │PERFORMAN │   POLISH    │
│          │  SYSTEM  │ REFACTOR │          │          │   CE     │             │
│ • Setup  │ • Design │ • Audit  │ • Split  │ • CSP    │ • PWA    │ • React     │
│ • Unit   │   tokens │ • Sacred │   big    │ • Rate   │ • Bundle │   Query     │
│ • E2E    │ • Sacred │   comps  │   files  │   limit  │   opt    │ • ADRs      │
│ • CI/CD  │   comps  │ • Apply  │ • Story  │ • Input  │ • Images │ • Docs      │
│          │          │   system │   book   │   sanit  │          │ • Review    │
│Score:5/10│Score:7/10│Score:8/10│Score:9/10│Score:9/10│Score:9/10│ Score:10/10 │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────────┘
```

---

## ✅ CHECKLIST FINAL - 10/10

### Testing
- [ ] 80%+ code coverage
- [ ] E2E tests para flujos críticos
- [ ] CI/CD pipeline <10min
- [ ] Visual regression tests
- [ ] Performance tests (Lighthouse >95)

### Design System & UI Consistency
- [ ] DESIGN_CONTRACT.md completo y aprobado
- [ ] Design tokens implementados (Tailwind + CSS vars)
- [ ] 9 Sacred Components creados y documentados
- [ ] 100% páginas usan solo Sacred Components
- [ ] 0 colores hardcoded
- [ ] 0 gradientes decorativos
- [ ] 0 buttons/cards custom
- [ ] Contraste AA verificado en todas las páginas
- [ ] UI cohesiva y profesional (zero inconsistencias)
- [ ] Storybook completo para Sacred Components

### Mantenibilidad
- [ ] 0 archivos >300 LOC
- [ ] Storybook completo
- [ ] 0% código duplicado
- [ ] Documentación JSDoc 100%
- [ ] Design tokens centralizados

### Seguridad
- [ ] CSP strict (sin unsafe-*)
- [ ] Rate limiting implementado
- [ ] 0 vulnerabilidades críticas
- [ ] Security headers A+
- [ ] Input sanitization 100%

### Performance
- [ ] Lighthouse >95
- [ ] Bundle <300KB gzipped
- [ ] FCP <1.5s, LCP <2.5s
- [ ] PWA installable
- [ ] Service Worker activo

### State Management
- [ ] React Query implementado
- [ ] 0 estado duplicado
- [ ] Optimistic updates 100%
- [ ] Cache invalidation automática

### Arquitectura
- [ ] 10+ ADRs documentados
- [ ] C4 diagrams completos
- [ ] API docs (OpenAPI)
- [ ] Onboarding guide

### Type Safety
- [ ] 0% uso de `any`
- [ ] Branded types 100%
- [ ] Type coverage 100%
- [ ] Zod schemas auto-generados

---

## 💰 RETORNO DE INVERSIÓN

**Inversión**: ~482 horas (14 meses)

**Beneficios**:
- ✅ 90% menos bugs en producción (testing)
- ✅ 85% UI más consistente y profesional (design system)
- ✅ 70% más rápido onboarding nuevos devs (docs + storybook + design system)
- ✅ 60% menos tiempo en decisiones de UI (Sacred Components)
- ✅ 50% menos tiempo en debugging (type safety)
- ✅ 40% mejor performance (UX + SEO)
- ✅ 0 incidentes de seguridad (hardening)

**ROI estimado**: 3-4x en el primer año

---

## 🎨 ACTUALIZACIÓN: DESIGN SYSTEM INTEGRADO

Este roadmap ahora incluye una **fase crítica de Design System** que transforma la UI de GoSchool en un sistema institucional cohesivo y profesional.

### Novedades del Design System:

**📄 DESIGN_CONTRACT.md** - La "constitución" visual del proyecto
- Principios de diseño institucional
- Reglas duras (prohibiciones absolutas)
- Sistema de color semántico
- Tipografía optimizada para lectura
- Sistema de espaciado (8px base)

**🎯 Sacred Components** - Componentes canónicos obligatorios
1. Button (primary, secondary, ghost, danger)
2. Card (todas las tarjetas y paneles)
3. Table (tablas de datos)
4. Input/Select/Textarea (formularios)
5. Badge (estados funcionales)
6. Section/Container (layouts)
7. Modal (confirmaciones)
8. EmptyState (estados vacíos)

**🔨 UI Refactor Total**
- Eliminar 100% de inconsistencias visuales
- Reemplazar todos los componentes ad-hoc
- Aplicar el contrato visual en toda la app
- Garantizar accesibilidad AA

### ¿Por qué es crítico?

1. **Confianza institucional**: La UI refleja seriedad y profesionalismo
2. **Productividad**: Los usuarios trabajan sesiones largas diarias
3. **Mantenibilidad**: Un solo sistema = cambios más fáciles
4. **Escalabilidad**: Nuevas features siguen el contrato automáticamente
5. **Accesibilidad**: AA garantizado en todo el sistema

### Tiempo de implementación:

- **Contrato Visual**: 2 semanas
- **Sacred Components**: 3 semanas
- **UI Refactor**: 5 semanas
- **Total**: ~84 horas (2 meses con 10h/semana)

---

## 🚀 PRÓXIMOS PASOS RECOMENDADOS

### Si empiezas HOY (Opción 1: Quick Start):

```bash
# Semana 1-2: Fundación
1. Fix build errors (eliminar ignoreBuildErrors)
2. Setup testing (Jest + Playwright)
3. Crear DESIGN_CONTRACT.md
4. Implementar design tokens

# Semana 3-4: Sacred Components
5. Crear Button component
6. Crear Card component
7. Crear Table component
8. Primeros tests unitarios

# Resultado: Fundación sólida para escalar
```

### Si prefieres enfoque gradual (Opción 2: Incremental):

**Mes 1**: Testing + Design Contract
**Mes 2-3**: Sacred Components + UI Refactor
**Mes 4-6**: Mantenibilidad + Seguridad
**Mes 7-8**: Performance + Polish

### Si necesitas ayuda específica (Opción 3: Asistido):

Puedo ayudarte a:
1. ✅ Implementar DESIGN_CONTRACT.md (copy-paste ready)
2. ✅ Crear cualquier Sacred Component
3. ✅ Refactorizar una página específica
4. ✅ Setup testing infrastructure
5. ✅ Configurar CI/CD
6. ✅ Implementar cualquier sección del roadmap

---

**Este roadmap está diseñado para ser ejecutado de forma incremental.**
**Puedes ajustar las prioridades según las necesidades del proyecto.**

**¿Quieres que:**
1. **Te ayude a empezar con el Design System?** (Crear DESIGN_CONTRACT.md)
2. **Implemente los Sacred Components?** (Button, Card, Table)
3. **Refactorice una página específica?**
4. **Profundice en alguna sección?**

**¡Estoy listo para llevar este frontend a 10/10!** 🚀
