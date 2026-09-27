# Tierly

**Tierly** is a lightweight, modern, browser-based tier list maker for ranking anything you want.

Create a tier list, give it your own title, upload images, arrange them using drag and drop, customize your tiers, and export the finished result as a PNG.

No accounts. No database. No saved templates. Everything happens directly in your browser.

## Live Demo

**[Open Tierly Live](https://nirant07.github.io/tierly/)**

## Preview

Tierly provides a simple workspace focused on the actual tier list:

- Custom title at the top
- Unranked images area
- Customizable tier rows
- Drag-and-drop image ranking
- Quick tier editing
- One-click PNG export

## Features

### Custom Tier List Title

Give every tier list its own title.

For example:

- Best Movies
- Pokémon Ranking
- Favorite Games
- Fast Food Tier List
- Programming Languages

The default prompt is **"Name your own tier list"**.

### Image Upload

Upload multiple images directly from your computer.

Supported image formats depend on the browser's image support, including common formats such as:

- PNG
- JPG / JPEG
- WEBP

Uploaded images initially appear in the **Unranked** section.

### Drag and Drop

Move images freely between:

- Unranked
- S tier
- A tier
- B tier
- C tier
- D tier
- Any custom tier you create

Images can also be reordered within the same tier.

### Custom Tiers

Create as many tiers as you need.

Each tier can be:

- Added
- Renamed
- Recolored
- Deleted

When a tier is deleted, its images are returned to the Unranked section rather than being lost.

### Custom Tier Colors

Choose from a selection of tier colors, including black and multiple bright colors.

Tier text automatically switches between light and dark text depending on the background color for better readability.

### Long Tier Names

Long tier names are handled automatically.

The tier label column expands when necessary and the text wraps instead of being cut off.

For example:

```text
S
A
VERY GOOD
MAYBE WOULD WATCH AGAIN
ABSOLUTELY NEVER WATCH THIS
```

### Remove Images

Each image has an X control that can be used to remove it from the tier list.

### PNG Export

Export the completed tier list as a PNG image.

The exported image contains the tier list itself rather than the surrounding website controls.

The export is rendered directly in the browser, so locally uploaded images can be included without uploading them to a server.

## Privacy

Tierly is designed to work entirely on the client side.

There is:

- No account system
- No database
- No image upload server
- No backend
- No saved user profiles

Images selected from your computer are handled locally by the browser.

## Tech Stack

Tierly is built using:

- **React** — UI and application state
- **Vite** — development server and production build
- **JavaScript** — application logic
- **CSS** — styling and responsive layout
- **@dnd-kit** — drag-and-drop functionality
- **Lucide React** — interface icons
- **HTML Canvas API** — PNG export

## Project Structure

```text
tierly/
│
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── src/
│   ├── main.jsx
│   └── styles.css
│
├── .gitignore
├── index.html
├── package.json
├── README.md
└── vite.config.js
```

## Run Locally

### Prerequisites

Install Node.js.

Check that Node.js and npm are available:

```bash
node -v
npm -v
```

### Clone the Repository

```bash
git clone https://github.com/Nirant07/tierly.git
cd tierly
```

### Install Dependencies

```bash
npm install
```

### Start the Development Server

```bash
npm run dev
```

Vite will provide a local address, normally:

```text
http://localhost:5173/
```

Open that address in your browser.

## Production Build

Create an optimized production build:

```bash
npm run build
```

The generated website will be placed in:

```text
dist/
```

To preview the production build locally:

```bash
npm run preview
```

## GitHub Pages Deployment

Tierly is configured to deploy automatically to GitHub Pages using GitHub Actions.

The workflow is located at:

```text
.github/workflows/deploy.yml
```

Whenever changes are pushed to the `main` branch:

```text
git push
    ↓
GitHub Actions
    ↓
Install dependencies
    ↓
npm run build
    ↓
Deploy dist/
    ↓
GitHub Pages
```

The live website is available at:

**https://nirant07.github.io/tierly/**

## Updating the Live Site

After making changes locally:

```bash
git add .
git commit -m "Update Tierly"
git push
```

GitHub Actions will automatically build and deploy the updated version.

## Vite Configuration

Because the site is hosted inside the `/tierly/` GitHub Pages path, Vite uses:

```js
base: '/tierly/'
```

This ensures JavaScript, CSS and other assets are loaded correctly from the GitHub Pages URL.

## Design Goals

Tierly is intentionally focused on a single task: making tier lists quickly.

The project avoids unnecessary features such as:

- User accounts
- Social feeds
- Saved templates
- Databases
- Public profiles
- Complex dashboards

The goal is a fast, simple and visually clean tier list creation experience.

## Future Improvements

Possible future additions include:

- Undo / redo
- More tier color options
- Custom image sizing
- Keyboard shortcuts
- Mobile drag-and-drop improvements
- Copy/paste support
- Export resolution options
- Better image cropping controls
- Optional local persistence

## License

This project currently does not specify an open-source license.

If you intend to allow others to reuse, modify or distribute the project, add an appropriate license to the repository.

---

Built with React, Vite and a questionable number of tier-list opinions.
