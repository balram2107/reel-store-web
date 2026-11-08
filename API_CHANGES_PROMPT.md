# Reel Store API: changes needed by the frontend

Paste the prompt below into your backend coding assistant. It lists only the dedicated changes; everything else stays as is.

```
You are working on the Reel Store Rails API (OpenAPI 3.1 spec at /api/v1). Make ONLY the changes listed here. Do not refactor, rename or restyle anything else. Keep money in integer paise, snake_case keys, and the { error: { code, message, fields } } error shape. For every change: update the code, the OpenAPI spec, and add request specs. Summarise what you changed at the end.

MUST
1. Seller store list. Add GET /seller/stores (bearer, seller role, no X-Store-ID needed) returning { stores: [{ id, name, slug, status ("open"|"closed"), onboarding_complete }] }.
2. Multi-store login. For a seller with more than one store and no X-Store-ID, GET /me must return 200 with { user, store: null, stores: [same shape as item 1] } instead of 422, and POST /auth/otp/verify must include the same "stores" array. Single-store sellers keep today's behaviour.
3. Reserved slugs. Reject these slugs in slug validation (seller create/update, admin create/update, slug_check) with a 422 on fields.slug: login, stores, dashboard, orders, products, settings, onboarding, admin, pay, track, privacy, terms, api, health, static, assets, _next, favicon.ico, robots.txt, sitemap.xml. slug_check should return { available: false, suggestion } for them.
4. Onboarding steps. Document and implement how onboarding_step advances: 1 store created, 2 upi_id saved, 3 at least one product, 4 theme saved (store.theme_saved_at or equivalent), 5 share. GET /seller/onboarding keys must be: store, upi, product, look, share. POST /seller/onboarding/complete must return 422 with fields listing every missing prerequisite (for example fields.upi = ["is required"]).
5. Admin acting as seller. Let a user with role admin call any /seller/* route when X-Store-ID names any store (no ownership check for admins), and record the admin user id in an audit log. Non-admin behaviour is unchanged (404 for stores they do not own).
6. Order actions. Add allowed_actions (array of "confirm_payment","pack","ship","deliver","cancel") to the SellerOrder object, computed from status and payment_method. Keep can_cancel. Document in the spec which statuses accept each action, and whether a COD order starts as "placed" or "paid".
7. Uploads. Accept multipart field "images[]" (array) on POST /seller/products/{id}/images and field "file" on the logo and banner endpoints. Return 422 with a clear code for wrong type or too large; document the limits (types, max MB, max 8 images).
8. Clearing values. PATCH /seller/store, PATCH /seller/products/{id} and PATCH /admin/stores/{id} must accept null to clear: instagram_handle, bio, category_id, free_delivery_above_paise, mrp_paise, closing_date, whatsapp_number, ends_on. Update the schemas to allow null for those fields.
9. Product pagination. GET /seller/products accepts page and per_page (default 20, max 100) and q, and returns { products, meta: { page, per_page, total } }.

SHOULD
10. Document that SellerProduct.stock = null means unlimited stock.
11. Remove the duplicate SellerProduct.status or make it derived from visible and stock; use one enum. Make AdminStoreRow.status, the admin status filter and AdminStore.status use the same values (live, suspended).
12. Document closing_date (seller) versus ends_on (admin) and how PublicStore.status ("open","closed","ended","suspended") is derived from them.
13. Cart quote: return items in the same order as the request, echo each line's variant, and enumerate issue codes (out_of_stock, insufficient_stock, unavailable, price_changed) in the spec.
14. Validation errors: use dot-path keys in error.fields (for example customer.phone, address.pincode, items.0.quantity) and document it. Order create 409 uses code "store_unavailable".
15. OrderPlaced.next.path: make it a frontend path ("/pay/{token}" or "/track/{token}"). Order emails must link to FRONTEND_BASE_URL + "/track/{token}" (and /pay/{token} when payment is due). Add FRONTEND_BASE_URL to config.
16. CORS: allow the frontend origin(s) from config, with headers Authorization, X-Store-ID, Idempotency-Key, Content-Type.
17. Document qr_svg as raw SVG markup, qr_poster_url as an absolute URL, and whatsapp_number as digits with country code (for example 919876543210).
18. Admin: allow creating an additional store for an existing seller_email via POST /admin/stores (POST /seller/store returns 409 when a store exists). Add GET /admin/stores/slug_check?slug= with the same response as the seller slug_check.

DO NOT change anything else.
```

Optional, not in the prompt: shorten the 30-day JWT or move it to an HttpOnly cookie, because the frontend keeps it in localStorage.
