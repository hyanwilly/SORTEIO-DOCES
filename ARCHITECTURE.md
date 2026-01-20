# 🏗️ Architecture Documentation

## System Overview

This is a complete online raffle/lottery system with the following components:

## 🔄 User Flow

### 1. Public User Journey
```
┌─────────────┐
│   Home      │ → View all active raffles
│   Page      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Sorteio    │ → View raffle details
│  Detalhes   │ → See 10x10 number grid (real-time)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Click on   │ → Select available number (green)
│  Number     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Checkout   │ → Fill form (name, email, phone)
│   Modal     │ → Number reserved for 15 minutes
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Mercado    │ → Choose payment method
│   Pago      │ → PIX / Card / Boleto
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Payment    │ → Webhook confirms payment
│ Confirmed   │ → Number status: reserved → paid
└─────────────┘
```

### 2. Admin Journey
```
┌─────────────┐
│   Admin     │ → Access admin panel
│   Page      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Create     │ → Title, description, image URL
│  Raffle     │ → Price per number
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  100        │ → System creates 100 numbers
│  Numbers    │ → All start as "available"
│  Created    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Monitor    │ → Watch sales in real-time
│  Sales      │ → Progress bar shows X/100
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Perform    │ → When 100/100 sold
│  Draw       │ → Crypto-secure random selection
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Winner     │ → Display winner publicly
│  Announced  │ → Raffle status: sorteado
└─────────────┘
```

## 🗄️ Database Structure

### Collection: `sorteios`
```javascript
{
  id: "auto-generated",
  titulo: "Cesta de Chocolates",
  descricao: "Cesta com 5kg de chocolates premium",
  imagemUrl: "https://...",
  totalNumeros: 100,
  numerosPagos: 45,
  valorNumero: 5.00,
  status: "ativo" | "completo" | "sorteado",
  dataCriacao: Timestamp,
  dataSorteio: Timestamp | null,
  ganhador: {
    numero: 42,
    nome: "João Silva",
    email: "joao@email.com"
  } | null
}
```

### Subcollection: `sorteios/{id}/numeros`
```javascript
{
  id: "auto-generated",
  numero: 1-100,
  status: "disponivel" | "reservado" | "pago",
  compradorNome: "João Silva" | null,
  compradorEmail: "joao@email.com" | null,
  compradorTelefone: "(11) 99999-9999" | null,
  dataReserva: Timestamp | null,
  dataPagamento: Timestamp | null,
  pagamentoId: "MP-12345" | null
}
```

## 🔌 API Integration

### Firebase Firestore
- Real-time database with live listeners
- Subcollections for efficient querying
- Security rules for access control

### Mercado Pago API
```
POST /checkout/preferences
→ Creates payment preference
→ Returns init_point (checkout URL)

GET /v1/payments/{id}
→ Verify payment status
→ Returns status, amount, etc.
```

## ⚡ Cloud Functions

### 1. webhookMercadoPago (HTTP Trigger)
```
Mercado Pago → POST /webhookMercadoPago
              ↓
         Validate payment
              ↓
      Update Firestore
      - numero: pago
      - pagamentoId
      - dataPagamento
              ↓
     Update sorteio
     - numerosPagos++
     - status (if 100/100)
```

### 2. expirarReservas (Scheduled - Every 5 min)
```
Cloud Scheduler → expirarReservas()
                       ↓
              Find all active raffles
                       ↓
           Find reserved numbers
                       ↓
       Check if > 15 minutes old
                       ↓
         Reset to "disponivel"
         - Clear buyer data
         - Clear dataReserva
```

## 🎨 Component Hierarchy

```
App (Router)
├── Header (Navigation)
├── Routes
│   ├── Home
│   │   └── SorteioCard (multiple)
│   │       ├── Image
│   │       ├── Progress Bar
│   │       └── Button
│   ├── SorteioDetalhes
│   │   ├── Raffle Info
│   │   ├── NumeroGrid
│   │   │   └── NumeroItem (x100)
│   │   └── CheckoutModal
│   │       └── Form
│   └── Admin
│       └── AdminPanel
│           ├── Create Form
│           └── Raffle List
└── Footer
```

## 🔐 Security Layers

### 1. Firestore Rules
```javascript
// Anyone can read
allow read: if true;

// Only available → reserved
allow update: if resource.data.status == 'disponivel' 
              && request.resource.data.status == 'reservado';

// Only admins can create/delete
allow create, delete: if request.auth != null;
```

### 2. Payment Security
- All payments through Mercado Pago (PCI compliant)
- Webhook validates payment before confirming
- External reference links payment to number

### 3. Random Selection
```javascript
// Uses crypto.getRandomValues() for true randomness
const randomBytes = new Uint32Array(1);
window.crypto.getRandomValues(randomBytes);
const randomIndex = randomBytes[0] % numerosPagos.length;
```

## 📱 Responsive Breakpoints

```css
/* Desktop (default) */
Grid: 10x10
Cards: 3 columns

/* Tablet (< 968px) */
Grid: 10x10
Cards: 2 columns

/* Mobile (< 768px) */
Grid: 5x10
Cards: 1 column

/* Small Mobile (< 480px) */
Grid: 5x10
Everything stacked
```

## 🚀 Performance Optimizations

1. **Real-time Listeners**
   - Only active on detail pages
   - Unsubscribe on unmount
   - Prevents memory leaks

2. **Batch Operations**
   - Create 100 numbers in single batch
   - Reduces Firestore write operations

3. **CSS Animations**
   - Hardware-accelerated transforms
   - Smooth 60fps animations

4. **Code Splitting**
   - React Router lazy loading (potential)
   - Each page loads independently

## 🔄 State Management

### Local State (useState)
- Form inputs
- UI state (loading, modals)
- Selected numbers

### Real-time State (Firebase Listeners)
- Raffle data
- Number grid status
- Automatic updates

### No Redux
- Firebase listeners replace Redux
- Simpler architecture
- Less boilerplate

## 📊 Data Flow

```
User Action
    ↓
React Component
    ↓
Firebase/Mercado Pago Service
    ↓
Backend (Firestore/Cloud Functions)
    ↓
Real-time Listener
    ↓
Update UI (Auto)
```

## 🛠️ Development Setup

```bash
# Install dependencies
npm install
cd functions && npm install

# Configure
# - src/firebase/config.js
# - src/services/mercadopago.js
# - functions/index.js

# Run locally
npm start (frontend)
firebase emulators:start (backend)

# Deploy
firebase deploy
```

## 📈 Scalability

### Current Limitations
- 100 numbers per raffle (by design)
- Cron job runs every 5 minutes
- Firestore quotas apply

### Scaling Options
1. Multiple raffles simultaneously ✅
2. Increase cron frequency if needed
3. Add caching for popular raffles
4. Implement queue for high traffic

## 🧪 Testing Strategy

### Manual Testing Checklist
- [ ] Create raffle
- [ ] View raffle list
- [ ] Select number
- [ ] Complete checkout flow
- [ ] Verify reservation (15 min)
- [ ] Simulate payment webhook
- [ ] Perform draw
- [ ] View winner

### Production Checklist
- [ ] Firebase credentials configured
- [ ] Mercado Pago token configured
- [ ] Webhook URL configured
- [ ] Firestore rules deployed
- [ ] Cloud Functions deployed
- [ ] Test with real payment (sandbox)

---

**Note:** This system is production-ready but requires proper configuration of Firebase and Mercado Pago credentials.
