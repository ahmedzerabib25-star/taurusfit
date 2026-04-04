# ByBen's — Sports Nutrition E-Commerce

A multilingual (Arabic / French / English) e-commerce storefront for sports supplements in Algeria, built entirely with static HTML/CSS/JS and Google Sheets as the backend database.

---

## Tech Stack

| Layer          | Technology                                 |
| -------------- | ------------------------------------------ |
| Frontend       | Vanilla HTML, CSS, JavaScript              |
| Database       | Google Sheets                              |
| Backend / API  | Google Apps Script (deployed as Web App)   |
| Image hosting  | Cloudinary CDN                             |
| Location data  | Local JSON (`algeria_cities.json`)         |
| Client storage | `localStorage` (cart, language, API cache) |

---

## Project Structure

```
bybens/
├── index.html           # Homepage — hero, featured products, bundle banner
├── products.html        # Product listing with filters (category, brand, price)
├── product-detail.html  # Single product page — variants, flavors, quick order
├── checkout.html        # Cart review & order form
├── admin.html           # Admin panel (products, orders, promos, delivery prices)
├── login.html           # Admin login
├── code.gs              # Google Apps Script — REST-like API over Google Sheets
├── algeria_cities.json  # All 48 wilayas + communes for delivery form
├── script.txt           # Deployed Apps Script URL
└── images/              # Local image assets
```

---

## Google Sheets Structure

The spreadsheet (`code.gs` line 14) has the following tabs:

| Sheet            | Purpose                                                   |
| ---------------- | --------------------------------------------------------- |
| `Settings`       | Admin credentials (`admin_username`, `admin_password`)    |
| `Categories`     | Product categories                                        |
| `SubCategories`  | Subcategories with parent category links                  |
| `Products`       | Products with variants, flavors, stock, discount          |
| `PromoCodes`     | Discount codes (fixed / percentage, expiry, usage limits) |
| `DeliveryPrices` | Home & office delivery cost per wilaya                    |
| `Bundle`         | ID of the featured product shown in the homepage banner   |
| `Orders`         | All customer orders with status tracking                  |

---

## API Endpoints

The Apps Script exposes a single URL with an `action` query param.

**GET (read)**

| Action              | Returns                           |
| ------------------- | --------------------------------- |
| `getProducts`       | All products                      |
| `getCategories`     | All categories                    |
| `getSubCategories`  | All subcategories                 |
| `getDeliveryPrices` | Delivery prices per wilaya        |
| `getPromos`         | Promo codes                       |
| `getBundle`         | Featured bundle product ID        |
| `getOrders`         | All orders (admin only)           |
| `getDashboard`      | Summary stats for admin dashboard |
| `getSettings`       | Admin settings                    |
| `login`             | Validate admin credentials        |

**POST (write)**

`addProduct`, `updateProduct`, `deleteProduct`, `addCategory`, `deleteCategory`, `addSubCategory`, `deleteSubCategory`, `addPromo`, `updatePromo`, `deletePromo`, `addDeliveryPrice`, `updateDeliveryPrice`, `deleteDeliveryPrice`, `submitCartOrder`, `submitProductOrder`, `updateOrderStatus`, `saveBundle`, `updateSettings`

---

## Performance

API responses are cached in `localStorage` with a **10-minute TTL** using a shared `cachedFetch(action)` utility present in each page. On repeat visits, all data is served from cache instantly — no network request.

A **page loader** (animated "By Ben's" splash screen) is shown while data fetches on a cold visit. On warm cache, the loader is suppressed synchronously before the first paint.

```
Cold visit:  loader shown → API fetch → render → loader hidden
Warm visit:  loader suppressed instantly → render from cache
```

---

## Admin Panel

Access via `login.html`. Session is stored in `sessionStorage` and cleared on logout.

The admin panel supports:

- Product management (add / edit / delete, image upload via Cloudinary)
- Category & subcategory management
- Promo code management
- Delivery price configuration per wilaya
- Order management with status updates
- Bundle banner assignment
- Account settings

---

## Languages

The site supports three languages switchable at runtime:

- English (`en`) — default
- French (`fr`)
- Arabic (`ar`) — RTL layout

Language preference is persisted in `localStorage` under `bybens_lang`.

---

## Local Development

No build step required. Open any `.html` file directly in a browser or serve with any static file server:

```bash
npx serve .
# or
python -m http.server 8080
```

To change the backend, deploy a new version of `code.gs` as a Google Apps Script Web App and update the `SCRIPT_URL` constant at the top of each HTML file.
