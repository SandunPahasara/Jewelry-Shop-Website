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






