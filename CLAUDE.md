# CLAUDE.md — instrucțiuni pentru agenți AI în repo-ul EchoPass

Aplicație React Native / Expo (SDK 52) pentru transport public (focus Timișoara,
API STPT). Comunică cu utilizatorul în română.

## Domeniu de responsabilitate

Tu dezvolți **doar aplicația mobilă** (`app/`, `src/`, `__tests__/`, `scripts/`).
**Backend-ul și serverul sunt dezvoltate de altă persoană — NU le modifica.**

- Sursa de adevăr pentru API e contractul din `src/services/api/schemas/` + `src/services/providers.ts`.
- Dacă lipsește ceva din backend, lucrezi doar pe partea de client cu `EXPO_PUBLIC_USE_MOCKS=true` și raportezi ce lipsește, nu improvizezi endpoint-uri.
- NU edita `mock-api/` și `docker-compose.yml` decât la cerere explicită (sunt interfața cu echipa de backend).
- Nu presupune implementarea serverului; consumi doar ce e definit în `zod` schemas.

## Despre aplicație și scopul ei

EchoPass face din telefon **bilet, validator și dispecer**: fără validatoare
fizice, cu îmbarcare automată și bilete QR anti-fraudă (semnate, cu expirare,
verificabile offline în modul inspector).

Fluxul produsului, în ordinea ecranelor:

1. **Planifici** — hartă live (MapLibre, poziții reale STPT), sosiri pe stații,
   planner cu opțiuni. Orarele GTFS sunt bundled în `src/assets/*.json`, deci
   merge și fără semnal. Taburi: Explorează, Portofel, Activitate, Setări.
2. **Plătești** — wallet cu carduri, abonamente și QR. Tarif 5 lei/călătorie.
3. **Călătorești** — check-in automat **doar pe BLE**:
   reclamă BLE trezește aplicația → măsurare RSSI netezită + praguri cu
   histereză calibrate pe lungimea autobuzului (cluster `outside → candidate →
inside → leaving`, vezi `src/features/detection/`) → serverul încrucișează
   cu GPS-ul și trimite push de plată → alegi nr. de persoane → QR + rută live.
   Ieșirea (RSSI slab K poll-uri la rând) face checkout automat.
4. **Dovedești și ajuți** — verificare QR de către controlor, raportări de
   aglomerație/întârzieri (viitor: rutare „confortabilă" pe date crowdsourced),
   istoric + extras călătorii.

Datele curg printr-un singur comutator (`src/services/providers.ts`): mock
local ↔ real, cu fallback (`EXPO_PUBLIC_USE_MOCKS=true` în dev). Orice feature
nou de transport trebuie să meargă în ambele moduri.

## Comenzi (rulează din rădăcină)

| Scop                      | Comandă                                                    |
| ------------------------- | ---------------------------------------------------------- |
| Pornire aplicație         | `npx expo start --dev-client` (necesită custom dev client) |
| Verificare tipuri         | `npx tsc --noEmit`                                         |
| Lint                      | `npx eslint src __tests__ app --ext .ts,.tsx`              |
| Structură                 | `node scripts/check-structure.mjs`                         |
| Teste                     | `npx jest` (~150 teste, preset `jest-expo`)                |
| Tot (definiția de „gata") | `npm run validate` = typecheck + lint + structură + teste  |

`npm run validate` trebuie să rămână verde. Dacă e deja roșu pe fișiere neatins
de tine, nu le repara fără cerere — raportează.

## Arhitectură

- `app/` — rute expo-router (fiecare `.tsx` e rută; NU șterge fișiere de aici).
- `src/core/` — config, theme (`useTheme`), i18n (`t()`), tipuri, utils.
- `src/features/<domeniu>/` — organizare pe responsabilități: `components/`, `hooks/`.
- `src/services/` — `api/` (scheme `zod` + `queryClient.ts`), `repositories/` (mock vs real),
  `providers.ts`. Live e `queryClient.ts`, nu `client.ts` dacă-l vezi.
- `src/ui/` — componente reutilizabile, exportate prin `src/ui/index.ts`.
- `src/assets/*.json` — date GTFS bundled (rute, orare, stații, forme); folosite prin
  `require` în `services/repositories/gtfs/`.
- `mock-api/` — pachet separat (mock local, pornit din `docker-compose.yml`).
- `scripts/` — `check-structure.mjs`, `render-1014.py` (generează video splash).
- Alias TS: `@/*` → `./src/*`. Mock-urile se aleg prin `EXPO_PUBLIC_USE_MOCKS=true`
  (default) — vezi `src/core/config/env.ts`.

## Reguli obligatorii

1. **Limite de linii** (verificate de eslint + `check-structure.mjs`, linii efective):
   `app/*.tsx` max 60, `src/ui` + `src/features` `*.tsx` max 150, logică max 200,
   max 8 fișiere `.ts/.tsx/.js` per folder.
2. **Nu crea fișiere decât dacă e strict necesar**; preferă editarea celor existente.
3. **Verifică prin execuție**: după orice modificare de cod rulează `tsc --noEmit`
   și testele atinse; nu declara „gata" pe intenție.
4. **Nu comite / nu faci push / PR** decât la cerere explicită. În working tree pot
   exista modificări ale utilizatorului — nu le atinge, nu le include în editările tale.
5. Raportează discrepanța dacă găsești dovezi contra unei afirmații anterioare,
   în loc să o confirmi tacit.

## Convenții de cod

- Texte UI doar prin `t('cheie')` (`src/core/i18n`), niciodată hardcodate în alte
  limbi decât româna implicită; culori/spațiere doar din `useTheme()`.
- Accesibilitate obligatorie pe controale: `accessibilityRole`, `accessibilityLabel`
  (în română), `hitSlop={8}` pe ținte mici; `testID` pe elementele testate.
- Fără `console.*`, fără `any` (ambele sunt erori de lint); fără `eslint-disable`
  pentru `exhaustive-deps` — repară dependențele.
- Date externe (răspunsuri fetch): validează cu `zod`, ca în `services/api/schemas/`.
- Liste lungi: `FlatList`, nu `.map` în `ScrollView`.
- Stilul vizual: flat, minimalist, fără umbre grele.

## Capcane Reanimated (plătite scump — nu le reintroduce)

- **Corpurile worklet NU citesc constante din exterior** (nici din același modul —
  UI thread-ul aruncă `Property 'X' doesn't exist`). Toată geometria în worklets
  apare ca **literali**; exporturile `const` sunt doar pentru JS thread.
  Exemplu greșit: `maxAmp = MAX_AMP` ca default de parametru într-un worklet.
- Callback-urile `useAnimatedProps`/`useAnimatedStyle` sunt auto-workletizate
  (fără directiva `'worklet'`), dar NU au voie să apeleze closure-uri JS —
  doar shared values (`.value`) și funcții marcate `'worklet'`.
- Mock-ul `react-native-reanimated/mock` din Jest **nu are `useFrameCallback`** —
  folosește `withRepeat(withSequence(withTiming…))` pentru bucle.
- Text animat caracter-cu-caracter: `Animated.createAnimatedComponent` pe
  `TextInput` + `animatedProps={{ text }}`; tipizarea necesită castul
  `TextInput as unknown as ComponentType<TextInputProps & { text?: string }>`.
- Splash-ul (`src/ui/BrandSplash/`): logica fazelor e funcții pure în `cycle.ts`
  (testabile cu `ts.transpileModule` + assert pe keyframe-uri); pornirea buclei
  e în `SplashBusSvg.tsx` (`playSplashLoop` / `playSplashOnce`).

## Mediu Windows / PowerShell 5.1

- Fără `&&` între comenzi (folosește `;`) și fără heredoc (`<<EOF` nu există).
- Nu schimba directoare în comenzi; folosește parametrul `workdir`.
- Căi cu spații se pun între ghilimele; preferă cmdlet-urile complete.
- `node_modules` conține build-uri native cu căi foarte lungi — `git status` poate
  avertiza `Filename too long`; e zgomot, se ignoră.
