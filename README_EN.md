# 🎨 AI Vector Anime Studio

<p align="center">
  <img src="artifacts/studio_sylphie_live_ui.png" alt="AI Vector Anime Studio Live Preview" width="850" />
</p>

<p align="center">
  <a href="README_EN.md"><img src="https://img.shields.io/badge/Language-English-blue?style=flat-square" alt="English Documentation"></a>
  <a href="README.md"><img src="https://img.shields.io/badge/语言-简体中文-red?style=flat-square" alt="Chinese Documentation"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white&style=flat-square" alt="Node.js"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black&style=flat-square" alt="React"></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-5+-646CFF?logo=vite&logoColor=white&style=flat-square" alt="Vite"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License: MIT"></a>
</p>

<p align="center">
  <strong>A modern web development platform for AI-assisted anime vector art synthesis, 7-layer hierarchy inspection, and stroke-level timeline playback.</strong>
</p>

<p align="center">
  <a href="#-key-features">Key Features</a> •
  <a href="#-art--technical-architecture">Architecture</a> •
  <a href="#-artwork-showcase">Showcase</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-testing--quality-assurance">Testing</a>
</p>

---

## 🌟 Key Features

- **✨ Multi-Dimensional Anime Feature Generation Engine**: Structural semantic and dynamic posture vector pipeline supporting parametric deconstruction of hair color, eye reflections, anatomy, poses, and clothing patterns. Generates multi-layer, high-fidelity vector art.
- **📐 7-Layer Independent Hierarchy**:
  - `Background & VFX`: Starfield cosmic backdrop, crescent moon, auroras, and floating particulate dust.
  - `Skin & Body`: Cel-shaded base skin tones, neck contouring, and slender anatomical figures.
  - `Hair`: Volumetric flowing hair, blunt bangs, and facial framing locks.
  - `Eyes & Facial Features`: Gradient iris discs, highlight starlight, pupils, and crisp eyelashes.
  - `Clothing & Accessories`: Strapless dresses, royal gold filigree embroidery, ruffled skirts, and ribbons.
  - `Shading & Highlights`: Ambient blush, ambient occlusion shadows, and hair highlights.
  - `Line Art`: Solid black Difference-of-Gaussians (DoG) ink line skeleton with clean contours.
  - **Supports Layer Visibility Toggling & Solo Focus Mode** (automatically dims background by 85% with grayscale filter).
- **🖌️ Pure Cel Shading & Sub-Pixel Inking**: Blends bilateral filtering flat color areas with multi-scale Difference-of-Gaussians (DoG) ink edge extraction, avoiding blotchy oil-painting artifacts typical of naive vector tracing.
- **⏱️ Stroke-Level Playback & 5-Phase Evolution Timeline**:
  - `01 Initial Sketch` -> `02 Base Tones` -> `03 Structural Shading` -> `04 Fine Details` -> `05 Celestial Glow`.
  - Supports 0% ~ 100% precision scrubbing, variable speed playback (0.5x / 1x / 2x / 4x), and step-by-step frame nudging.
- **⚡ Millisecond Code Diff & DOM Tree Synchronization**: Every vector generation step inspects real-time incremental SVG code changes (green highlighted diffs), full XML source views, and inspectable DOM element trees.
- **🤖 Built-in Creative Co-Pilot**: Supports natural language prompt dialogue to deconstruct character attributes into posture cards, dynamically rendered directly onto the canvas.
- **💾 Lossless Project Export**: One-click export of standalone compliant `.svg` files (preserving layer structure) and high-resolution `.png` rasterizations.

---

## 🦋 Artwork Showcase: "Sylphie: Starlight Butterfly Wish"

<p align="center">
  <img src="artifacts/sylphie_rendered.png" alt="Sylphie: Starlight Butterfly Wish" width="550" />
</p>

- **Character Traits**: Shimmering pink hair (505 strokes) · Luminous golden irises (49 strokes) · Levitation pose · Gold filigree gown · Starlight glass butterflies & crescent moon.
- **Authentic Vector Paths**: **1,963 true high-density Bézier paths**.
- **Line Art Skeleton**: 521 deep black DoG ink lines with sub-pixel geometric anti-aliasing (`geometricPrecision`).

---

## 🛠️ Tech Stack

- **Frontend Core**: React 18, TypeScript, Vite
- **Styling & UI**: Tailwind CSS, Lucide React
- **Testing Infrastructure**: Vitest, React Testing Library (**464 / 464 unit and E2E tests passing**)
- **Vector Algorithms**: OpenCV (DoG edge extraction, morphological ops), Bilateral Filter, Bézier Spline Smoother

---

## 🚀 Getting Started

### 1. Clone Repository
```bash
git clone https://github.com/krantjohn/ai-vector-anime-studio.git
cd ai-vector-anime-studio
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Launch Development Server
```bash
npm run dev
```
Open `http://127.0.0.1:5173/` in your browser.

### 4. Build Production Bundle
```bash
npm run build
```

---

## 🧪 Testing & Quality Assurance

Comprehensive unit, stress, boundary, and end-to-end test suites:

```bash
npm test
```

- **Test Suites**: 16 test suites, **464 / 464 tests passing**.
- Covers transformation matrix math, 7-layer state machine & solo isolation, dynamic color migration safeguards, SVG DOM compliance, and incremental diff generators.

---

## 📚 Technical Documentation

- [Architecture & Feature Inventory](docs/PROJECT.md)
- [Test Infrastructure & Coverage Standards](docs/TEST_INFRA.md)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
