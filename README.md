# VipKad

Static site for [vipkad.com](https://vipkad.com): an own-brand membership Web App for restaurants, cafés, Malay and Halal F&B, and salons in Malaysia and Singapore. Chinese, English, and Bahasa Melayu. No build step — GitHub Pages serves the files as they are.

## Pages

- `index.html` — landing page, live demo, pricing
- `order.html` — self-serve plan, billing cycle, and currency, with a price breakdown
- `setup.html` — shop brief and asset upload. Also the success URL after payment: `setup.html?plan=starter&billing=monthly&currency=MYR&paid=1`

A chat widget on every page answers from the site’s own guide. Complex questions can be left for vipkad管家.

## Configure payments, notifications, and chat

Edit `vipkad-config.js` only. Do not put API keys or secrets in it — the file is public.

**Stripe Payment Links or HitPay checkouts.** Paste an `https://` URL into `payments.links` for each plan, billing cycle, and currency. Leave a string empty and that choice skips payment and opens the shop brief. A URL may contain `{plan}`, `{tier}`, `{billing}`, `{currency}`, `{lang}`, and `{early}`.

Point the provider’s success redirect at:

```text
https://vipkad.com/setup.html?plan={plan}&tier={tier}&billing={billing}&currency={currency}&lang={lang}&early={early}&paid=1
```

**Notifications.** `notify.endpoint` defaults to FormSubmit for `hello@vipkad.com`. The first submission sends FormSubmit’s activation email; until that is confirmed, the customer still gets a reference number and can download a JSON backup. Set `notify.mode` to `json` or `form` (multipart, includes the logo file) for your own webhook.

**Live chat model.** Set `chat.endpoint` to a URL you control. The widget POSTs `{ lang, currency, page, message, history }` and expects `{ reply, actions?: [{ label, href }] }`. If the endpoint is empty or fails, the built-in assistant answers instead.

## Preview locally

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173/`. Language and currency are kept in the query string and in localStorage (`vipkad-lang`, `vipkad-cur`).
