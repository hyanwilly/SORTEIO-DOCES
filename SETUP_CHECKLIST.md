# ✅ Setup Checklist - Sistema de Sorteio de Doces

Use this checklist to get your raffle system up and running.

## 📋 Pre-Deployment Checklist

### 1. Prerequisites
- [ ] Node.js 18+ installed (`node --version`)
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Firebase account created
- [ ] Mercado Pago account created

### 2. Clone & Install
```bash
- [ ] git clone https://github.com/hyanwilly/SORTEIO-DOCES.git
- [ ] cd SORTEIO-DOCES
- [ ] npm install
- [ ] cd functions && npm install && cd ..
```

### 3. Firebase Configuration

#### A. Create Firebase Project
- [ ] Go to https://console.firebase.google.com/
- [ ] Click "Add project"
- [ ] Enter project name
- [ ] Enable Google Analytics (optional)
- [ ] Wait for project creation

#### B. Enable Services
- [ ] Click "Firestore Database" → "Create database"
  - [ ] Choose location (closest to users)
  - [ ] Start in production mode
- [ ] Click "Authentication" (optional for admin)
  - [ ] Enable Email/Password provider
- [ ] Click "Storage" (optional for images)
  - [ ] Create default bucket

#### C. Get Firebase Credentials
- [ ] Click gear icon → "Project settings"
- [ ] Scroll to "Your apps"
- [ ] Click Web icon (</>) → Register app
- [ ] Copy the firebaseConfig object
- [ ] Paste into `src/firebase/config.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

#### D. Initialize Firebase CLI
```bash
- [ ] firebase login
- [ ] firebase init (if .firebaserc doesn't exist)
  - [ ] Select: Firestore, Functions, Hosting
  - [ ] Choose existing project
  - [ ] Accept defaults
```

### 4. Mercado Pago Configuration

#### A. Get Access Token
- [ ] Go to https://www.mercadopago.com.br/developers/panel
- [ ] Login to your account
- [ ] Click "Suas integrações" → "Criar aplicação"
- [ ] Enter application name
- [ ] Copy the **Access Token** (start with TEST for testing)

#### B. Update Code
- [ ] Open `src/services/mercadopago.js`
- [ ] Replace `SEU_ACCESS_TOKEN_AQUI` with your token
- [ ] Open `functions/index.js`
- [ ] Replace `SEU_ACCESS_TOKEN_AQUI` with your token

### 5. Deploy Backend

#### A. Deploy Firestore Rules
```bash
- [ ] firebase deploy --only firestore:rules
- [ ] firebase deploy --only firestore:indexes
```

#### B. Deploy Functions
```bash
- [ ] firebase deploy --only functions
```
- [ ] Note the webhook URL (will be displayed in output)
- [ ] Example: `https://YOUR_PROJECT.cloudfunctions.net/webhookMercadoPago`

### 6. Configure Webhook

#### A. Set Webhook in Mercado Pago
- [ ] Go back to Mercado Pago developer panel
- [ ] Click on your application
- [ ] Go to "Webhooks" section
- [ ] Add new webhook URL:
  ```
  https://YOUR_PROJECT.cloudfunctions.net/webhookMercadoPago
  ```
- [ ] Select "Payments" as event type
- [ ] Save

### 7. Local Testing

#### A. Test Frontend
```bash
- [ ] npm start
- [ ] Open http://localhost:3000
- [ ] Verify pages load:
  - [ ] Home page (/)
  - [ ] Admin page (/admin)
```

#### B. Test Admin Functions
- [ ] Go to http://localhost:3000/admin
- [ ] Fill form to create test raffle:
  - [ ] Title: "Teste"
  - [ ] Description: "Sorteio de teste"
  - [ ] Value: 1.00
- [ ] Click "Criar Sorteio"
- [ ] Verify raffle appears in list

#### C. Test Number Selection
- [ ] Go to Home (/)
- [ ] Click on test raffle
- [ ] Verify 100 numbers appear (all green)
- [ ] Click on a number
- [ ] Fill checkout form
- [ ] **Don't complete payment yet** (just test the flow)

### 8. Production Deployment

#### A. Build Frontend
```bash
- [ ] npm run build
```

#### B. Deploy to Firebase Hosting
```bash
- [ ] firebase deploy --only hosting
```
- [ ] Note your production URL
- [ ] Example: `https://YOUR_PROJECT.web.app`

#### C. Test Production
- [ ] Open production URL
- [ ] Test all flows again
- [ ] Use Mercado Pago TEST credentials first

### 9. Go Live

#### A. Switch to Production Credentials
- [ ] In Mercado Pago, get PRODUCTION access token
- [ ] Update token in:
  - [ ] `src/services/mercadopago.js`
  - [ ] `functions/index.js`
- [ ] Rebuild and redeploy:
```bash
- [ ] npm run build
- [ ] firebase deploy
```

#### B. Final Verification
- [ ] Create real raffle
- [ ] Test with small real payment (R$ 1.00)
- [ ] Verify webhook works
- [ ] Verify number changes to "paid"
- [ ] Test full flow end-to-end

### 10. Post-Launch

#### A. Monitoring
- [ ] Set up Firebase monitoring
- [ ] Check Cloud Functions logs regularly
  ```bash
  firebase functions:log
  ```
- [ ] Monitor Mercado Pago webhooks

#### B. Maintenance
- [ ] Check expired reservations are clearing
- [ ] Monitor Firestore usage
- [ ] Monitor Functions usage
- [ ] Check for errors in logs

## 🔧 Troubleshooting

### Common Issues

**"Firebase not configured"**
- Check `src/firebase/config.js` has real credentials
- Verify project exists in Firebase Console

**"Payment not confirming"**
- Check webhook URL is correct in Mercado Pago
- Verify Functions are deployed
- Check Function logs: `firebase functions:log`

**"Numbers not expiring"**
- Verify `expirarReservas` function deployed
- Wait 5 minutes (cron interval)
- Check function logs

**"CORS error"**
- Check Firebase hosting is configured
- Verify API calls use correct URLs

## 📞 Support

If you encounter issues:
1. Check Firebase Console for errors
2. Check Mercado Pago webhook logs
3. Review Function logs
4. Open GitHub issue with details

---

**🎉 Congratulations!** Once all items are checked, your raffle system is live!
