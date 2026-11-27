/**
 * VipKad site configuration.
 *
 * Drop payment links, the notification endpoint, and an optional AI
 * chat endpoint here. Leave a value empty to keep the built-in path.
 * Never put API keys, webhook secrets, or Stripe secret keys in this file.
 * Anything here is shipped to the browser.
 */
window.VIPKAD_CONFIG = {
  brand: {
    name: "VipKad",
    email: "hello@vipkad.com",
    whatsapp: "60167799222",
    site: "https://vipkad.com"
  },

  /**
   * Prices are the single source of truth for the homepage, the order
   * page, the setup summary, and the chat assistant.
   * earlySetup replaces the plan setup fee for the first 3–5 shops.
   * The monthly / yearly fee still follows Starter or Standard.
   */
  pricing: {
    MYR: {
      symbol: "RM",
      starter: { setup: 499, monthly: 59, yearly: 599 },
      standard: { setup: 899, monthly: 99, yearly: 999 },
      earlySetup: 299
    },
    SGD: {
      symbol: "S$",
      starter: { setup: 149, monthly: 19, yearly: 189 },
      standard: { setup: 269, monthly: 29, yearly: 299 },
      earlySetup: 99
    }
  },

  /**
   * Stripe Payment Links or HitPay checkout URLs.
   * Leave "" until the link exists. The order page then skips payment
   * and continues straight into onboarding.
   *
   * A URL may include tokens, replaced at click time:
   *   {plan} {tier} {billing} {currency} {lang} {early}
   *
   * Success redirect to paste into Stripe or HitPay
   * (swap the tokens for the link you created):
   *   https://vipkad.com/setup.html?plan={plan}&tier={tier}&billing={billing}&currency={currency}&lang={lang}&early={early}&paid=1
   *
   * Examples:
   *   "https://buy.stripe.com/test_..."
   *   "https://secure.hit-pay.com/payment-request/@vipkad/..."
   */
  payments: {
    links: {
      starter: {
        monthly: { MYR: "", SGD: "" },
        yearly: { MYR: "", SGD: "" }
      },
      standard: {
        monthly: { MYR: "", SGD: "" },
        yearly: { MYR: "", SGD: "" }
      },
      early: {
        starter: {
          monthly: { MYR: "", SGD: "" },
          yearly: { MYR: "", SGD: "" }
        },
        standard: {
          monthly: { MYR: "", SGD: "" },
          yearly: { MYR: "", SGD: "" }
        }
      }
    }
  },

  /**
   * Where onboarding briefs and chat support tickets are posted.
   *
   * mode:
   *   "formsubmit" — JSON POST to a FormSubmit ajax URL (default).
   *   "json"       — JSON POST to your own webhook.
   *   "form"       — multipart POST, including logo and hero files.
   *
   * The first FormSubmit request to a new address sends an activation
   * email to hello@vipkad.com. Until that link is clicked, the browser
   * still confirms the order locally and offers a JSON download.
   */
  notify: {
    endpoint: "https://formsubmit.co/ajax/hello@vipkad.com",
    mode: "formsubmit"
  },

  /**
   * Optional live chat model. Leave endpoint "" to use the built-in
   * trilingual assistant (works on GitHub Pages with no server).
   *
   * When set, the widget POSTs:
   *   { lang, currency, page, message, history: [{ role, content }] }
   * and expects:
   *   { reply: string, actions?: [{ label, href }] }
   *
   * Put the model behind your own URL. Do not add an API key here.
   * If the endpoint errors, the widget answers with the built-in assistant.
   */
  chat: {
    endpoint: ""
  }
};
