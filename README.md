# Jewelry Shop Website

A clean, responsive static site for an online jewelry store. Includes product pages, cart and checkout flows, and a responsive UI suitable for GitHub Pages or any static host.

## Demo

- Serve locally and open: http://localhost:8000

## Features

- Product categories (rings, necklaces, bracelets, earrings)
- Search and filtering UI
- Add to cart and checkout flow (frontend)
- Contact / inquiry form
- Responsive layout and high-quality product imagery

## Technologies

- HTML, CSS, JavaScript
- Optional: EmailJS integration (see EMAILJS_SETUP_GUIDE.md)

## Run locally

From the project root, serve the folder with a static server. Example (Python 3):

```powershell
Set-Location -Path "C:\Users\USER\Desktop\project\Finish project\Jewelary shop\Jewelry-Shop-Website"
python -m http.server 8000
```

Or with Node.js (install `http-server`):

```bash
npm install -g http-server
http-server -p 8000
```

Open your browser at http://localhost:8000 and click the `Homepage.html` to view the site.

## Project structure

- `Homepage.html` — main landing page
- `product.html` — product listing/page
- `checkout.html` — checkout flow
- `admin.html` — admin page
- `style.css`, `admin.css`, `checkout.css` — stylesheets
- `checkout.js` — client interactions
- `components/` — site JS modules (ProductManager.js, CartManager.js, etc.)
- `EMAILJS_SETUP_GUIDE.md` — instructions if using EmailJS

## Notes

- This project is a static frontend; any backend references (PHP/MySQL) are placeholders unless you add a server.
- To publish on GitHub Pages, push the repository and enable Pages from the repository settings (use the `main` branch root).

## License

MIT — feel free to adapt for your project.

## Deploy to GitHub Pages (Free + Easy) — Recommended

GitHub Pages is the easiest free hosting for static sites. Your website will be live at:
`https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

### Setup Steps (5 minutes)

**1. Make sure code is on GitHub**

Push your latest changes from your PC:

```powershell
Set-Location -Path "C:\Users\USER\Desktop\project\Finish project\Jewelary shop\Jewelry-Shop-Website"
git add .
git commit -m "add all files"
git push origin main
```

**2. Enable Pages in GitHub**

- Go to your GitHub repo in browser
- Click **Settings** tab (top right)
- In left sidebar, click **Pages**
- Under "Build and deployment":
  - Source: Select `Deploy from a branch`
  - Branch: Select `main` and `/root` folder
  - Click **Save**

**3. Wait for deploy**

GitHub will build your site (takes ~30 seconds).

You'll see a green checkmark and a link like:
```
Your site is live at: https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

**4. Open your live site**

Click that link or paste it in your browser. Your jewelry site is now online!

**5. Future updates (auto-deploy)**

Every time you push to `main`, GitHub Pages auto-deploys:

```powershell
git add .
git commit -m "update content"
git push origin main
```

### Why GitHub Pages?

- Free forever
- Supports files up to 100 MB (your videos fit easily)
- Auto-deploy on every push
- HTTPS included
- No credit card needed
- Perfect for static HTML/CSS/JS sites

### Custom domain (optional)

If you have your own domain (e.g., `jewel-shop.com`), you can point it to GitHub Pages:

- In repo Settings → Pages → **Custom domain**
- Add your domain and follow GitHub's DNS setup guide
