# YGPT — Youth For Global Peace & Transformation

Official website for **YGPT**, a youth-led NGO founded under the guidance of Maitreya Dadashreeji and powered by MaitriBodh Parivaar.

🌐 **Live site:** [ygpt.in](https://ygpt.in)  
📦 **Deployed on:** Netlify

---

## About the Project

YGPT is a vibrant community of youth united by a shared commitment to humanity, peace, and Mother Earth. This website serves as the digital home for the organisation — showcasing initiatives, events, clubs, and ways to get involved.

---

## Pages

| Page | Description |
|------|-------------|
| `index.html` | Homepage — hero, initiatives, events, clubs, metrics, team, testimonials, newsletter |
| `about.html` | About YGPT — story, vision, values, journey timeline, founder, team |
| `events.html` | Events listing with filter and search toolbar |
| `clubs.html` | Club locations across India with Google Maps embed |
| `contact.html` | Contact form and club finder |
| `resources.html` | Downloadable guides, toolkits, and templates for members |
| `privacy.html` | Privacy Policy |
| `terms.html` | Terms & Conditions |
| `404.html` | Custom 404 error page |

---

## Tech Stack

- **HTML5** — semantic, accessible markup
- **CSS3** — custom properties, responsive design, dark mode
- **Vanilla JavaScript** — no frameworks, no dependencies at runtime
- **Netlify** — hosting, form handling, redirects
- **Formspree** — newsletter and contact form submissions
- **Google Fonts** — Bebas Neue + Montserrat

---

## Project Structure

```
ygpt-website/
├── index.html
├── about.html
├── events.html
├── clubs.html
├── contact.html
├── resources.html
├── privacy.html
├── terms.html
├── 404.html
├── css/
│   ├── style.css        # Main stylesheet
│   ├── mobile.css       # Responsive overrides
│   └── pages/
│       └── about.css    # About page specific styles
├── js/
│   ├── main.js          # Core JS — slider, counters, forms, animations
│   └── nav.js           # Navigation injection and dropdown logic
├── assets/
│   └── images/          # All images, logos, team photos, favicons
├── _headers             # Netlify security headers
├── netlify.toml         # Netlify build config and redirects
├── sitemap.xml
└── robots.txt
```

---

## Running Locally

**Option 1 — VS Code Live Server**
1. Open the project folder in VS Code
2. Right-click `index.html` → Open with Live Server

**Option 2 — Node.js serve**
```bash
npm install
npm run dev
```
Then open `http://localhost:3000`

---

## Building for Production

```bash
npm install
npm run build
```

This minifies JS and CSS into the `dist/` folder.

---

## Deployment

The site deploys automatically to Netlify when changes are pushed to the `main` branch on GitHub. No manual deployment steps needed.

---

## Developer

**Nishika** — BCA Student  
Built for YGPT as part of a real-world web development project.