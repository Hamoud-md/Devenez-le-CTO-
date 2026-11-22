# The Living Motion Atlas

**Guide numérique interactif pour l’apprentissage des mouvements sportifs**

> Projet — Nuit de l’Info 2025 · Défi « Devenez le CTO de votre Santé Posturale »
> Version du cahier des charges : 1.0

The Living Motion Atlas transforme un guide sportif traditionnel en un parcours
d’apprentissage interactif : un questionnaire adaptatif crée votre profil, un
parcours vivant vous accompagne étape par étape, et un laboratoire 3D vous permet
d’explorer chaque mouvement (phases, points clés, zoom contextuel).

---

## 1. Démonstration

```bash
npm install
npm run dev
```

Puis ouvrez l’URL affichée (par défaut `http://localhost:5173`).

**Build de production :**

```bash
npm run build     # génère dist/
npm run preview   # prévisualise le build
```

---

## 2. Fonctionnalités

| Écran | Nom | Contenu |
|---|---|---|
| 01 | **Discover Me** | QCM adaptatif : niveau, pratiques, objectif, mouvement, préférence pédagogique. Une question à la fois, retour arrière, progression, questions conditionnelles. |
| 02 | **My Living Path** | Parcours en 5 nœuds (Profil → Préparation → Découverte → Exploration → Révision), statuts terminé/en cours/verrouillé, reprise sans perte de progression. |
| 03 | **Motion Discovery Lab** | Visualiseur 3D, Motion Scrubber, Hotspots interactifs, Motion Microscope (zoom + restauration), modes **Essentiel / Guidé**, couche anatomique facultative, Replay d’une phase, vues caméra. |
| 04 | **My Motion Guide** | Résumé personnalisé, navigation par étapes, Knowledge Check (compréhension, pas performance physique), équipements Decathlon contextuels. |

**Fonctionnalités transverses**

- Personnalisation des instructions selon le profil (règles testables — AC-02).
- Sauvegarde locale de la progression (`localStorage`, aucune donnée envoyée).
- Dégradation progressive : alternative pédagogique illustrée si la 3D échoue (AC-13).
- Accessibilité : navigation clavier, focus visibles, `prefers-reduced-motion`,
  libellés ARIA, alternatives aux gestes de glissement, contraste AA visé.
- Responsive : mobile (visualiseur principal + panneaux), tablette, desktop.

---

## 3. Architecture technique

| Élément | Technologie |
|---|---|
| Langage | TypeScript (strict) |
| Interface | React 19 |
| Build | Vite 6 |
| 3D | React Three Fiber + Drei (Three.js) |
| Styles | CSS responsive (Design System en tokens) |
| Contenus | TypeScript / données typées |
| Sauvegarde | LocalStorage |
| Tests | Vitest (28 tests) |

### Structure du projet

```
src/
├── types.ts                  # Types partagés (profil, mouvements, parcours…)
├── data/
│   ├── questions.ts          # QCM adaptatif + construction du profil
│   ├── movements.ts          # Squat, Pompes, Tadasana : phases, hotspots, muscles
│   └── content.ts            # Étapes du parcours, quiz, équipements, textes adaptés
├── engine/
│   ├── profile.ts            # Profile Engine : règles de personnalisation
│   ├── guidance.ts           # Guidance Engine : progression Living Path
│   ├── persistence.ts        # Persistence Layer : localStorage
│   └── store.tsx             # Contexte React global
├── three/
│   ├── poses.ts              # Poses procédurales interpolées (timeline)
│   ├── SkeletonFigure.tsx    # Humanoïde construit en code (aucune ressource externe)
│   ├── HotspotMarkers.tsx    # Points interactifs ancrés au modèle
│   └── MotionScene.tsx       # Canvas, lumières, sol, couche anatomique, caméra
├── components/
│   ├── ui/                   # Button, Card, ProgressBar
│   └── navigation/Header.tsx # Navigation 4 écrans (desktop + mobile)
├── screens/                  # DiscoverMe, LivingPath, MotionLab, MotionGuide
└── styles/                   # tokens.css (Design System) + global.css
```

### Choix techniques

- **Squelette procédural plutôt qu’un modèle GLB externe** : zéro problème de
  licence, poids minimal, hotspots et couche anatomique maîtrisés. L’humanoïde est
  construit en capsules articulées ; les poses sont interpolées linéairement sur
  la timeline du mouvement, ce qui donne un contrôle temporel total au Scrubber.
- **Chargement différé du laboratoire** (`React.lazy`) : la 3D (≈ 300 ko gzip)
  n’est téléchargée qu’à l’ouverture de l’écran Explorer.
- **Aucun backend** : toutes les données sont locales, conformément au cadre
  « Village Numérique Résistant » (pas de compte, pas de service propriétaire).

---

## 4. Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Typecheck + build production |
| `npm run preview` | Prévisualisation du build |
| `npm test` | Tests unitaires (Vitest) |
| `npm run test:watch` | Tests en mode watch |
| `npm run typecheck` | Vérification des types |

---

## 5. Tests

**28 tests** couvrent :

- **Profile Engine** : profil incomplet → `null`, profil complet valide,
  *deux profils différents reçoivent des explications distinctes* (AC-01/AC-02).
- **Guidance Engine** : déblocage séquentiel, retour arrière sans perte de
  progression (AC-04), progression en pourcentage, parcours complet.
- **Persistence** : défauts, aller-retour, JSON corrompu, version incompatible,
  effacement.
- **Données pédagogiques** : phases chronologiques, hotspots liés à des phases
  existantes, validité du Knowledge Check, équipements par mouvement.
- **Moteur de poses 3D** : interpolation finie à tout instant, clampe du temps,
  distinction haut/bas du squat (Phase A : contrôle temporel).

---

## 6. Ressources et licences

| Ressource | Origine / licence |
|---|---|
| Squelette 3D, animations, hotspots | **Construits en code** — aucun actif externe |
| Textes pédagogiques | Rédigés pour ce projet (formes classiques du squat, de la pompé, de la Tadasana) |
| Icônes | Émojis Unicode / SVG internes |
| Dépendances npm | Voir `package.json` — licences MIT / Apache-2.0 / BSD |
| Liens équipements | Pages publiques Decathlon (liens vérifiables, pas d’API ni de scraping) |

Aucune ressource tierce n’est intégrée sans vérification de licence.

---

## 7. Lien avec le sujet national 2025

Le sujet national « Le Village Numérique Résistant » porte sur des solutions
numériques **accessibles, sobres et autonomes**. The Living Motion Atlas
s’inscrit dans cet esprit :

- **Accessibilité** : aucun compte requis, WCAG 2.2 AA comme objectif,
  alternatives sans 3D, `prefers-reduced-motion`.
- **Sobriété** : application 100 % client, aucun backend, aucun appel réseau
  pendant l’usage, ressources 3D chargées en différé.
- **Autonomie** : données pédagogiques embarquées, sauvegarde locale,
  fonctionne hors-ligne après le premier chargement.
- **Éducation numérique** : module d’apprentissage des mouvements sportifs
  relié à la thématique de santé posturale du défi.

---

## 8. Critères d’acceptation — couverture

| ID | Exigence | Où |
|---|---|---|
| AC-01 | Adaptive QCM | `src/screens/DiscoverMe.tsx`, tests `profile.test.ts` |
| AC-02 | Personnalisation | `src/engine/profile.ts` (règles testées) |
| AC-03 | Visualisation | `src/three/*` + fallback illustré |
| AC-04 | Living Path | `src/engine/guidance.ts`, `src/screens/LivingPath.tsx` |
| AC-05 | Motion Scrubber | `MotionLab.tsx` (range + clavier) |
| AC-06 | Hotspots | `HotspotMarkers.tsx` + panneau contextuel |
| AC-07 | Microscope | Overlay avec restauration phase/caméra/hotspot |
| AC-08 | Couche anatomique | `AnatomyOverlay` dans `MotionScene.tsx` |
| AC-09 | Replay | `replayPhase()` dans `MotionLab.tsx` |
| AC-10 | Knowledge Check | `src/screens/MotionGuide.tsx` |
| AC-11 | Responsive | Media queries + navigation mobile |
| AC-12 | Accessibilité | Clavier, ARIA, focus, taille des cibles ≥ 40 px |
| AC-13 | Dégradation | Panneau « Alternative sans 3D » + `LabFallback` |
| AC-14 | Documentation | Ce README |
| AC-15 | Intégration | Sous-page autonome, navigation 4 écrans intégrée |
| AC-16 | Bonus Decathlon | `EQUIPMENT` dans `src/data/content.ts` |

---

## 9. Limites connues et suite du développement

- **Animations** : squelette procédural stylisé (Phase A validée) — un modèle
  GLB réaliste reste possible ultérieurement si la licence est vérifiée.
- **Couche anatomique** : régions simplifiées (sphères de surbrillance), pas une
  modélisation musculaire fidèle.
- **Tests Playwright** (parcours E2E) : prévus en phase de finalisation.
- **Pompes / Yoga** : contenus et poses présents ; validation pédagogique
  visuelle restante (Phase D).

---

## 10. Avertissement

Cet outil est **pédagogique**. Il ne fournit aucun diagnostic médical, ne détecte
pas automatiquement les mauvaises postures et ne certifie pas la qualité de
l’exécution physique de l’utilisateur. En cas de douleur, arrêtez la pratique et
consultez un professionnel de santé.

---

**Principe directeur : une expérience simple à utiliser, riche à explorer et
techniquement maîtrisée.**
