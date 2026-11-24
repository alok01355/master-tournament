# MASTER — Free Fire Community Tournament V1

A responsive React + Firebase starter website that can be installed as a PWA on Android.

## Included
- Email/password player sign-up and login
- Player profile with Free Fire in-game name and UID
- Tournament listing and registration requests
- Player registration history
- Admin UI shell for creating tournaments and adding room details
- Room credentials display in the UI only for approved players after match start time
- Payment information page showing UPI, QR, and card/netbanking as planned methods
- Responsive layout and PWA manifest

## Important limitations before public launch
This is a starter project, not a production-ready tournament/payment service. The UI includes payment-method choices, but no real payment gateway is connected. Do not collect tournament stakes, betting deposits, prize pools, or withdrawals. Any lawful non-wagering membership or merchandise payment must be reviewed and configured by a responsible adult with a regulated payment provider.

The admin actions in this starter are UI scaffolding. Production admin operations and room-password release must be implemented in trusted server-side code (for example Firebase Cloud Functions) with custom admin claims. Do not expose room credentials in public tournament documents. The sample Firestore rules deliberately deny admin writes until that backend is added.

## Setup
1. Install Node.js 20+.
2. Run `npm install`.
3. Create a Firebase project and register a Web App.
4. Enable Authentication > Email/Password.
5. Create a Firestore database.
6. Copy Firebase Web App config into `src/firebase.js`.
7. Deploy `firestore.rules` to Firestore Rules.
8. Run `npm run dev` and open the local URL.
9. Run `npm run build` for production static files in `dist/`.

## Make it admin
Do not let users set their own role. A trusted project owner should assign a custom admin claim using Firebase Admin SDK from a secure server environment, then add server endpoints/Cloud Functions for admin-only writes and approval actions. The starter UI reads `users/{uid}.role` only to show the admin tab; replace this with verified custom claims before launch.

## Android
This is a PWA. Deploy it over HTTPS, open the website in Chrome on Android, then use Chrome menu > Install app / Add to Home screen. This creates an app-like shortcut. A signed APK would require a separate Android wrapper/build process.

## Payment integration
Payment options displayed: UPI, QR, Card/Netbanking. Gateway integration is intentionally not active. For lawful non-wagering purchases, a responsible adult should create/own the merchant account and configure the provider's hosted checkout. Never ask players to share UPI PINs, OTPs, passwords, or card security codes in this website.
