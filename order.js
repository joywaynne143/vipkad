(function () {
  "use strict";

  var selection = { plan: "standard", tier: "standard", billing: "yearly", currency: "MYR", early: false };

  function t(key) {
    var code = VipKadLocale.getLang();
    var shared = VipKadCatalog.label(code, key);
    if (shared) return shared;
    var dict = (window.VIPKAD_FLOW_I18N && VIPKAD_FLOW_I18N[code]) || VIPKAD_FLOW_I18N.en;
    if (dict[key] != null) return dict[key];
    if (VIPKAD_FLOW_I18N.en[key] != null) return VIPKAD_FLOW_I18N.en[key];
    return key;
  }

  function applyCopy() {
    document.title = t("order_doc_title");
    document.documentElement.lang = VipKadLocale.htmlLang();
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var value = t(el.getAttribute("data-i18n"));
      if (value) el.textContent = value;
    });
    var wa = VIPKAD_CONFIG.brand.whatsapp;
    var prefill = {
      zh: "你好，我在 VipKad 自助下单页，想先问一下上线的事。",
      en: "Hi, I’m on the VipKad order page and have a question before I continue.",
      ms: "Hai, saya di halaman pesan VipKad dan ada soalan sebelum teruskan."
    };
    document.querySelectorAll("a[data-wa]").forEach(function (anchor) {
      anchor.href = "https://wa.me/" + wa + "?text=" + encodeURIComponent(prefill[VipKadLocale.getLang()] || prefill.en);
    });
    VipKadLocale.syncSwitchers();
  }

  function readSelection() {
    var params = new URLSearchParams(location.search);
    var currency = VipKadLocale.normalizeCurrency(params.get("currency") || params.get("cur")) || VipKadLocale.getCurrency();
    var billing = params.get("billing") === "monthly" ? "monthly" : "yearly";
    var plan = params.get("plan") || "standard";
    var tier = params.get("tier") || "";
    var early = params.get("early");
    selection = VipKadCatalog.normalizeSelection({
      plan: plan,
      tier: tier,
      billing: billing,
      currency: currency,
      early: early
    });
    VipKadLocale.setCurrency(selection.currency);
  }

  function currentQuote() {
    return VipKadCatalog.quote(selection);
  }

  function selectPlan(plan) {
    var next = VipKadCatalog.normalizeSelection({
      plan: plan,
      tier: plan === "early" ? selection.tier : plan,
      billing: selection.billing,
      currency: selection.currency,
      early: plan === "early"
    });
    if (plan === "early" && selection.tier === "starter") next.tier = "starter";
    if (plan === "early" && selection.tier !== "starter") next.tier = selection.tier === "starter" ? "starter" : "standard";
    selection = next;
    render();
  }

  function render() {
    var quote = currentQuote();
    var code = VipKadLocale.getLang();
    document.querySelectorAll(".plan").forEach(function (card) {
      var on = card.dataset.plan === quote.plan;
      card.classList.toggle("is-selected", on);
      card.setAttribute("aria-checked", String(on));
    });
    document.querySelectorAll(".bill-btn").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.dataset.bill === quote.billing));
    });
    document.querySelectorAll("[data-tier]").forEach(function (btn) {
      btn.textContent = t(btn.dataset.tier === "starter" ? "plan_starter" : "plan_standard");
      btn.setAttribute("aria-pressed", String(btn.dataset.tier === quote.tier));
    });

    ["starter", "standard"].forEach(function (plan) {
      var q = VipKadCatalog.quote({ plan: plan, billing: quote.billing, currency: quote.currency });
      var price = document.querySelector('[data-price="' + plan + '"]');
      var per = document.querySelector('[data-per="' + plan + '"]');
      var setup = document.querySelector('[data-setup="' + plan + '"]');
      if (price) price.textContent = q.recurringText;
      if (per) per.textContent = VipKadCatalog.label(code, quote.billing === "monthly" ? "per_monthly" : "per_yearly");
      if (setup) {
        setup.textContent = VipKadCatalog.label(code, "setup_fee") + " " + q.setupText +
          (quote.billing === "yearly" ? " · " + VipKadCatalog.label(code, "year_hint") : "");
      }
    });

    var earlyQuote = VipKadCatalog.quote({
      plan: "early",
      tier: quote.early ? quote.tier : "standard",
      billing: quote.billing,
      currency: quote.currency,
      early: true
    });
    var earlyPrice = document.querySelector('[data-price="early"]');
    var earlyPer = document.querySelector('[data-per="early"]');
    var earlySetup = document.querySelector('[data-setup="early"]');
    if (earlyPrice) earlyPrice.textContent = earlyQuote.setupText;
    if (earlyPer) earlyPer.textContent = "";
    if (earlySetup) {
      var ongoing = VipKadCatalog.quote({ plan: quote.early ? quote.tier : "standard", billing: quote.billing, currency: quote.currency });
      earlySetup.textContent = VipKadCatalog.label(code, "setup_fee") + " · " + t("early_then") + " " +
        VipKadCatalog.label(code, (quote.early ? quote.tier : "standard") === "starter" ? "plan_starter" : "plan_standard") +
        " " + ongoing.recurringText + VipKadCatalog.label(code, quote.billing === "monthly" ? "per_monthly" : "per_yearly");
    }

    var tierSwitch = document.getElementById("tier-switch");
    if (tierSwitch) tierSwitch.hidden = !quote.early;

    var lines = document.getElementById("breakdown-lines");
    lines.replaceChildren();
    addLine(lines, VipKadCatalog.label(code, "setup_fee"), quote.setupText, quote.early ? quote.listSetupText : "");
    addLine(
      lines,
      VipKadCatalog.label(code, quote.billing === "yearly" ? "recurring_yearly" : "recurring_monthly"),
      quote.recurringText,
      ""
    );
    if (quote.billing === "yearly") {
      addLine(lines, VipKadCatalog.label(code, "yearly_equiv"), quote.perMonthText + VipKadCatalog.label(code, "per_monthly"), "");
    }
    addLine(lines, VipKadCatalog.label(code, "first_invoice"), quote.firstText, "", true);
    var note = document.createElement("p");
    note.className = "breakdown-foot";
    note.textContent = VipKadCatalog.label(code, "sst");
    lines.appendChild(note);

    var link = VipKadCatalog.paymentLink(quote);
    var payNote = document.getElementById("pay-note");
    var continueBtn = document.getElementById("continue-order");
    payNote.textContent = link ? t("pay_ready") : t("pay_missing");
    continueBtn.textContent = link ? t("pay_cta") : t("setup_cta");
    document.getElementById("already-paid").href = VipKadCatalog.setupHref(quote, { paid: true });

    document.getElementById("sticky-total").textContent = quote.setupText + " + " + quote.recurringText;
    document.getElementById("sticky-sub").textContent = VipKadCatalog.planName(quote, code);
    document.getElementById("sticky-continue").textContent = t("sticky_continue");
    syncUrl();
  }

  function addLine(list, name, value, was, emphasize) {
    var row = document.createElement("div");
    row.className = "rowline" + (emphasize ? " is-total" : "");
    var dt = document.createElement("dt");
    dt.textContent = name;
    var dd = document.createElement("dd");
    if (was) {
      var old = document.createElement("s");
      old.textContent = was;
      dd.appendChild(old);
      dd.appendChild(document.createTextNode(" "));
    }
    var strong = document.createElement("strong");
    strong.textContent = value;
    dd.appendChild(strong);
    row.appendChild(dt);
    row.appendChild(dd);
    list.appendChild(row);
  }

  function syncUrl() {
    var params = new URLSearchParams({
      lang: VipKadLocale.getLang(),
      currency: selection.currency,
      billing: selection.billing,
      plan: selection.early ? "early" : selection.tier,
      tier: selection.tier
    });
    if (selection.early) params.set("early", "1");
    history.replaceState(null, "", "./order.html?" + params.toString());
  }

  function continueOrder() {
    var quote = currentQuote();
    var link = VipKadCatalog.paymentLink(quote);
    if (link) {
      window.location.assign(link);
      return;
    }
    window.location.assign(VipKadCatalog.setupHref(quote, { paid: false }));
  }

  function boot() {
    readSelection();
    applyCopy();
    render();
    VipKadLocale.bindSwitchers(function () {
      selection.currency = VipKadLocale.getCurrency();
      applyCopy();
      render();
    });
    document.querySelectorAll(".bill-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        selection.billing = btn.dataset.bill === "monthly" ? "monthly" : "yearly";
        render();
      });
    });
    document.querySelectorAll(".plan").forEach(function (card) {
      function choose() { selectPlan(card.dataset.plan); }
      card.addEventListener("click", choose);
      card.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          choose();
        }
      });
    });
    document.querySelectorAll("[data-tier]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        selection.tier = btn.dataset.tier;
        selection.early = true;
        selection.plan = "early";
        render();
      });
    });
    document.getElementById("continue-order").addEventListener("click", continueOrder);
    document.getElementById("sticky-continue").addEventListener("click", continueOrder);
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
