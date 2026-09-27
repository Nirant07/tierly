# Tierly

A lightweight, browser-based tier list maker for ranking anything you want.

Create your own tier list, upload images, drag them between tiers, customize tier names and colors, and export the finished list as a PNG.

## Features

- Custom tier list title
- Upload multiple images at once
- Drag and drop images into tiers
- Reorder images within tiers
- Unranked images area
- Add unlimited tiers
- Rename tiers
- Customize tier colors
- Delete tiers and return their images to Unranked
- Remove individual images
- Automatic tier-label sizing for longer names
- PNG export
- Fully client-side — no account or backend required

## Tech Stack

- React
- Vite
- JavaScript
- CSS
- `@dnd-kit` for drag and drop
- HTML Canvas API for PNG export
- Lucide React for icons

## Getting Started

### Prerequisites

Make sure you have Node.js and npm installed.

Check with:

```bash
node -v
npm -v
```

### Installation

Clone the repository:

```bash
git clone https://github.com/Nirant07/tierly.git
cd tierly
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL shown by Vite, usually:

```text
http://localhost:5173
```

## Build for Production

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## How to Use

1. Enter a name for your tier list.
2. Click **Add images** and select your images.
3. Images will appear in **Unranked**.
4. Drag images into the desired tier.
5. Reorder images by dragging them.
6. Use **Add tier** to create additional tiers.
7. Click a tier's edit button to rename it or change its color.
8. Use the delete button to remove a tier.
9. Click **Export PNG** to save the finished tier list as an image.

## Privacy

Tierly does not require an account or server.

Uploaded images are handled locally by the browser and are not uploaded to a backend by the application.

## Project Structure

```text
tierly/
├── src/
│   ├── main.jsx
│   └── styles.css
├── index.html
├── package.json
├── README.md
└── .gitignore
```

## License

This project currently does not specify a license.
