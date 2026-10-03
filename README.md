# EchoPass

Aplicație de transport public (autobuz) cu plată automată, fără validator. Clientul rulează pe telefon (Expo **dev client**). Docker este doar pentru Metro, API-ul mock și verificări (`tsc` / ESLint / Jest).

## Pornire rapidă

```bash
cp .env.example .env
# Editează REACT_NATIVE_PACKAGER_HOSTNAME și EXPO_PUBLIC_API_URL cu IP-ul LAN al PC-ului
make up
```

Pe telefon, deschide dev client-ul EchoPass și scanează QR-ul Metro (port 8081).

Oprire: `make down`. Verificări: `make check`.

## Comutator mock / real

Un singur loc: `src/services/providers.ts` (citește `EXPO_PUBLIC_USE_MOCKS` din `src/core/config/env.ts`).
