/**
 * Plan math, payment-link lookup, and the short labels shared by
 * the homepage, order page, setup page, and chat assistant.
 */
(function (global) {
  "use strict";

  var LABELS = {
    zh: {
      plan_starter: "入门版",
      plan_standard: "标准版",
      plan_early: "种子客户",
      per_monthly: "/月",
      per_yearly: "/年",
      setup_fee: "开通费",
      recurring_monthly: "月费",
      recurring_yearly: "年费",
      first_invoice: "若一并支付",
      early_was: "原开通费",
      year_hint: "年付相当于送约 2 个月",
      then_plan: "其后按所选方案计",
      yearly_equiv: "年付折合每月约",
      sst: "价格不含 SST / GST。",
      currency_MYR: "马来西亚（RM）",
      currency_SGD: "新加坡（S$）"
    },
    en: {
      plan_starter: "Starter",
      plan_standard: "Standard",
      plan_early: "Founding early-bird",
      per_monthly: "/mo",
      per_yearly: "/yr",
      setup_fee: "Setup fee",
      recurring_monthly: "Monthly fee",
      recurring_yearly: "Yearly fee",
      first_invoice: "If paid together",
      early_was: "Regular setup",
      year_hint: "Annual billing saves about 2 months",
      then_plan: "Then billed on your chosen plan",
      yearly_equiv: "Yearly works out to about",
      sst: "Prices exclude SST / GST.",
      currency_MYR: "Malaysia (RM)",
      currency_SGD: "Singapore (S$)"
    },
    ms: {
      plan_starter: "Asas",
      plan_standard: "Standard",
      plan_early: "Rakan niaga awal",
      per_monthly: "/bulan",
      per_yearly: "/tahun",
      setup_fee: "Caj pemasangan",
      recurring_monthly: "Yuran bulanan",
      recurring_yearly: "Yuran tahunan",
      first_invoice: "Jika dibayar sekali",
      early_was: "Caj pemasangan biasa",
      year_hint: "Bayaran tahunan jimat lebih kurang 2 bulan",
      then_plan: "Kemudian mengikut pelan yang dipilih",
      yearly_equiv: "Tahunan bersamaan lebih kurang",
      sst: "Harga tidak termasuk SST / GST.",
      currency_MYR: "Malaysia (RM)",
      currency_SGD: "Singapura (S$)"
    }
  };

  function cfg() {
    return global.VIPKAD_CONFIG || { pricing: {}, payments: { links: {} } };
  }

  function lang() {
    return global.VipKadLocale ? global.VipKadLocale.getLang() : "zh";
  }

  function label(code, key) {
    var pack = LABELS[code] || LABELS.en;
    if (pack[key] != null) return pack[key];
    if (LABELS.en[key] != null) return LABELS.en[key];
    return "";
  }

  function formatMoney(currency, amount) {
    var table = cfg().pricing[currency] || cfg().pricing.MYR || { symbol: "RM" };
    var rounded = Math.round(Number(amount) * 100) / 100;
    var text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
    return table.symbol + " " + text;
  }

  function normalizeSelection(input) {
    var source = input || {};
    var currency = (global.VipKadLocale && global.VipKadLocale.normalizeCurrency(source.currency)) ||
      (global.VipKadLocale ? global.VipKadLocale.getCurrency() : "MYR");
    if (!cfg().pricing[currency]) currency = "MYR";
    var billing = source.billing === "monthly" ? "monthly" : "yearly";
    var rawPlan = String(source.plan || "").toLowerCase();
    var earlyFlag = source.early === true || source.early === 1 || source.early === "1" || source.early === "true";
    var early = earlyFlag || rawPlan === "early" || rawPlan === "earlybird" || rawPlan === "early-bird" || rawPlan === "founding";
    var tier = source.tier === "starter" || source.tier === "standard" ? source.tier : "";
    var plan;
    if (early) {
      plan = "early";
      if (tier !== "starter" && tier !== "standard") {
        tier = rawPlan === "starter" ? "starter" : "standard";
      }
    } else if (rawPlan === "starter" || rawPlan === "standard") {
      plan = rawPlan;
      tier = rawPlan;
    } else {
      plan = "standard";
      tier = "standard";
    }
    return { plan: plan, tier: tier, early: early, billing: billing, currency: currency };
  }

  function quote(input) {
    var sel = normalizeSelection(input);
    var table = cfg().pricing[sel.currency];
    var tierPrice = table[sel.tier];
    var setupAmount = sel.early ? table.earlySetup : tierPrice.setup;
    var recurringAmount = tierPrice[sel.billing];
    return {
      plan: sel.plan,
      tier: sel.tier,
      early: sel.early,
      billing: sel.billing,
      currency: sel.currency,
      symbol: table.symbol,
      setupAmount: setupAmount,
      recurringAmount: recurringAmount,
      firstAmount: setupAmount + recurringAmount,
      monthlyAmount: tierPrice.monthly,
      yearlyAmount: tierPrice.yearly,
      listSetupAmount: tierPrice.setup,
      setupText: formatMoney(sel.currency, setupAmount),
      recurringText: formatMoney(sel.currency, recurringAmount),
      firstText: formatMoney(sel.currency, setupAmount + recurringAmount),
      listSetupText: formatMoney(sel.currency, tierPrice.setup),
      perMonthText: formatMoney(sel.currency, sel.billing === "yearly" ? tierPrice.yearly / 12 : tierPrice.monthly)
    };
  }

  function priceTable() {
    var out = {};
    ["MYR", "SGD"].forEach(function (currency) {
      var table = cfg().pricing[currency];
      out[currency] = {
        starter: {
          setup: formatMoney(currency, table.starter.setup),
          monthly: formatMoney(currency, table.starter.monthly),
          yearly: formatMoney(currency, table.starter.yearly)
        },
        standard: {
          setup: formatMoney(currency, table.standard.setup),
          monthly: formatMoney(currency, table.standard.monthly),
          yearly: formatMoney(currency, table.standard.yearly)
        },
        earlySetup: formatMoney(currency, table.earlySetup)
      };
    });
    return out;
  }

  function applyTokens(url, sel, code) {
    return String(url)
      .replaceAll("{plan}", sel.early ? "early" : sel.tier)
      .replaceAll("{tier}", sel.tier)
      .replaceAll("{billing}", sel.billing)
      .replaceAll("{currency}", sel.currency)
      .replaceAll("{lang}", code || lang())
      .replaceAll("{early}", sel.early ? "1" : "0");
  }

  function safeHttps(url) {
    if (!url) return "";
    try {
      var parsed = new URL(String(url).trim(), global.location.href);
      if (parsed.protocol !== "https:") return "";
      return parsed.href;
    } catch (err) {
      return "";
    }
  }

  function paymentLink(selection) {
    var sel = normalizeSelection(selection);
    var links = (cfg().payments && cfg().payments.links) || {};
    var node = sel.early ? (links.early && links.early[sel.tier]) : links[sel.tier];
    var raw = node && node[sel.billing] && node[sel.billing][sel.currency];
    if (raw == null || !String(raw).trim()) return "";
    return safeHttps(applyTokens(String(raw).trim(), sel, lang()));
  }

  function orderHref(partial) {
    var source = partial || {};
    var currency = (global.VipKadLocale && global.VipKadLocale.normalizeCurrency(source.currency)) ||
      (global.VipKadLocale ? global.VipKadLocale.getCurrency() : "MYR");
    var billing = source.billing === "monthly" ? "monthly" : (source.billing === "yearly" ? "yearly" : "yearly");
    var params = new URLSearchParams({
      lang: lang(),
      currency: currency || "MYR",
      billing: billing
    });
    if (source.plan) {
      var sel = normalizeSelection(source);
      params.set("plan", sel.early ? "early" : sel.tier);
      params.set("tier", sel.tier);
      params.set("billing", sel.billing);
      params.set("currency", sel.currency);
      if (sel.early) params.set("early", "1");
    }
    return "./order.html?" + params.toString();
  }

  function setupHref(partial, options) {
    var sel = normalizeSelection(partial || { plan: "standard" });
    var paid = options && (options.paid === true || options.paid === "1" || options.paid === 1);
    var params = new URLSearchParams({
      lang: lang(),
      currency: sel.currency,
      billing: sel.billing,
      plan: sel.early ? "early" : sel.tier,
      tier: sel.tier,
      paid: paid ? "1" : "0"
    });
    if (sel.early) params.set("early", "1");
    return "./setup.html?" + params.toString();
  }

  function planName(selection, code) {
    var sel = normalizeSelection(selection);
    var pack = code || lang();
    if (sel.early) return label(pack, "plan_early");
    return label(pack, sel.tier === "starter" ? "plan_starter" : "plan_standard");
  }

  global.VipKadCatalog = {
    label: label,
    formatMoney: formatMoney,
    normalizeSelection: normalizeSelection,
    quote: quote,
    priceTable: priceTable,
    paymentLink: paymentLink,
    orderHref: orderHref,
    setupHref: setupHref,
    safeHttps: safeHttps,
    planName: planName
  };
})(window);
