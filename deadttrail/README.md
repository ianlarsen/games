
# Dead Trail (Browser Demo Skeleton)

Minimal Svelte + TypeScript + Vite scaffold with an **image fallback system**.
If any expected image file is missing, the UI draws a generated placeholder so
the game stays playable.

## Quick start
```bash
npm install
npm run dev
```

Put your images under:
- `public/images/backgrounds/PrisonExterior.png`
- `public/images/portraits/John.png`, etc.
- `public/images/events/RoombaGag.png`
- `public/images/icons/food.png`

Missing images will render a labeled placeholder automatically.
