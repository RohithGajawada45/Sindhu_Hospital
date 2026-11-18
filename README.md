# Sindhu Hospitals - Patient App

React + Vite + Tailwind, shipped three ways: web, installable PWA, and native Android APK (Capacitor). Mock data only.

## Develop
    npm install
    npm run dev            # http://localhost:3000
    npm run build          # web/PWA build into dist/

## Get the Android APK

### A) No installs - GitHub builds it for you
1. Create a new (private) GitHub repo and push this folder to it.
2. Open the repo > Actions > "Build Android APK" > wait ~5 min (it also runs on every push).
3. Open the finished run > Artifacts > download `sindhu-hospitals-apk` (a zip containing `app-debug.apk`).
4. Copy the APK to the phone and open it. Allow "Install unknown apps" for your file manager/browser when asked.

### B) Android Studio
    npm run build
    npx cap sync android
    npx cap open android
Then Build > Build APK(s). Output: android/app/build/outputs/apk/debug/app-debug.apk

After any web code change, repeat `npm run build && npx cap sync android` and rebuild.

## Notes
- This is a debug-signed APK: fine for demos and sideloading. For the Play Store you need a release-signed AAB (Build > Generate Signed Bundle).
- App id: com.sindhu.patient (change in capacitor.config.ts before the first Play Store upload).
- Web/PWA hosting: deploy dist/ to Netlify/Vercel over HTTPS.
# Sindhu_Hospital
