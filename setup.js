(function () {
  "use strict";

  var PRESETS = ["#143226", "#8b1e3f", "#1f4e79", "#c45c26", "#111111", "#0e6b4f", "#7a1f3d", "#c8a45a"];
  var MAX_BYTES = 5 * 1024 * 1024;
  var step = 0;
  var paid = false;
  var selection = { plan: "standard", billing: "yearly", currency: "MYR" };
  var logoFile = null;
  var heroFile = null;
  var logoUrl = "";
  var heroUrl = "";
  var pointsAutofill = true;
  var lastBrief = null;
  var sending = false;

  function t(key) {
    var code = VipKadLocale.getLang();
    var shared = VipKadCatalog.label(code, key);
    if (shared) return shared;
    var dict = VIPKAD_FLOW_I18N[code] || VIPKAD_FLOW_I18N.en;
    if (dict[key] != null) return dict[key];
    if (VIPKAD_FLOW_I18N.en[key] != null) return VIPKAD_FLOW_I18N.en[key];
    return key;
  }

  function pointsDefault() {
    return t(selection.currency === "SGD" ? "ph_points_sgd" : "ph_points_myr");
  }

  function knownPointDefaults() {
    var keys = ["ph_points_myr", "ph_points_sgd"];
    var values = {};
    ["zh", "en", "ms"].forEach(function (code) {
      keys.forEach(function (key) {
        var pack = VIPKAD_FLOW_I18N[code] || {};
        if (pack[key]) values[pack[key]] = true;
      });
    });
    return values;
  }

  function applyCopy() {
    document.title = t("setup_doc_title");
    document.documentElement.lang = VipKadLocale.htmlLang();
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var value = t(el.getAttribute("data-i18n"));
      if (value) el.textContent = value;
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var value = t(el.getAttribute("data-i18n-placeholder"));
      if (value) el.setAttribute("placeholder", value);
    });
    document.getElementById("logo-name").textContent = logoFile ? logoFile.name : t("no_file");
    document.getElementById("hero-name").textContent = heroFile ? heroFile.name : t("no_file");
    var notice = document.getElementById("paid-notice");
    notice.textContent = paid ? t("paid_banner") : t("unpaid_banner");
    notice.classList.toggle("is-paid", paid);
    document.querySelectorAll(".cur-btn").forEach(function (btn) {
      btn.disabled = paid;
    });
    VipKadLocale.syncSwitchers();
    refreshPointsDefault(false);
    paintCard();
  }

  function readOrder() {
    var params = new URLSearchParams(location.search);
    paid = params.get("paid") === "1" || params.get("paid") === "true" || params.get("paid") === "yes";
    selection = VipKadCatalog.normalizeSelection({
      plan: params.get("plan") || "standard",
      tier: params.get("tier") || "",
      billing: params.get("billing") || "yearly",
      currency: params.get("currency") || params.get("cur") || VipKadLocale.getCurrency(),
      early: params.get("early")
    });
    VipKadLocale.setCurrency(selection.currency);
  }

  function renderSummary() {
    var quote = VipKadCatalog.quote(selection);
    var code = VipKadLocale.getLang();
    var name = VipKadCatalog.planName(quote, code);
    if (quote.early) {
      name += " · " + VipKadCatalog.label(code, quote.tier === "starter" ? "plan_starter" : "plan_standard");
    }
    document.getElementById("summary-plan").textContent = name;
    document.getElementById("summary-price").textContent = quote.setupText + " + " + quote.recurringText +
      VipKadCatalog.label(code, quote.billing === "monthly" ? "per_monthly" : "per_yearly");
    var status = document.getElementById("summary-status");
    status.textContent = paid ? t("summary_paid") : t("summary_unpaid");
    status.classList.toggle("ok", paid);
    document.getElementById("change-plan").href = VipKadCatalog.orderHref({
      plan: quote.plan,
      tier: quote.tier,
      billing: quote.billing,
      currency: quote.currency,
      early: quote.early
    });
  }

  function showStep() {
    document.querySelectorAll(".step-panel").forEach(function (panel) {
      panel.hidden = Number(panel.dataset.step) !== step;
    });
    document.querySelectorAll("#stepper button").forEach(function (btn) {
      var index = Number(btn.dataset.goto);
      btn.setAttribute("aria-current", index === step ? "step" : "false");
      btn.classList.toggle("is-done", index < step);
    });
    var back = document.getElementById("step-back");
    var next = document.getElementById("step-next");
    var submit = document.getElementById("submit-brief");
    back.hidden = step === 0;
    next.hidden = step === 4;
    submit.hidden = step !== 4;
    document.getElementById("sticky-back").hidden = step === 0;
    document.getElementById("sticky-next").textContent = step === 4 ? t("submit") : t("next");
    if (step === 4) renderReview();
    paintCard();
  }

  function clearErrors() {
    document.querySelectorAll(".field.has-error").forEach(function (field) {
      field.classList.remove("has-error");
      var control = field.querySelector("input, select, textarea");
      if (control) control.removeAttribute("aria-invalid");
    });
    document.querySelectorAll(".err").forEach(function (err) { err.textContent = ""; });
    var alert = document.getElementById("form-alert");
    alert.hidden = true;
    alert.textContent = "";
  }

  function fail(name, key) {
    var err = document.getElementById("err-" + name);
    if (!err) return;
    var field = err.closest(".field");
    field.classList.add("has-error");
    var control = field.querySelector("input, select, textarea");
    if (control) control.setAttribute("aria-invalid", "true");
    err.textContent = t(key);
  }

  function valueOf(id) {
    return document.getElementById(id).value.trim();
  }

  function fileKind(file) {
    if (!file) return "";
    var type = (file.type || "").toLowerCase();
    var name = (file.name || "").toLowerCase();
    if (type === "image/png" || name.endsWith(".png")) return "png";
    if (type === "image/jpeg" || name.endsWith(".jpg") || name.endsWith(".jpeg")) return "jpg";
    if (type === "image/svg+xml" || name.endsWith(".svg")) return "svg";
    return "";
  }

  function validDomain(value) {
    if (!value) return true;
    if (value.length > 80 || /\s/.test(value)) return false;
    return /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(value) ||
      /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i.test(value);
  }

  function validPhone(value) {
    var digits = String(value).replace(/\D/g, "");
    return digits.length >= 8 && digits.length <= 15;
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  function normalizeHex(value, expandShort) {
    var v = String(value || "").trim();
    if (!v) return "";
    if (v.charAt(0) !== "#") v = "#" + v;
    if (expandShort && /^#[0-9a-fA-F]{3}$/.test(v)) {
      v = "#" + v.charAt(1) + v.charAt(1) + v.charAt(2) + v.charAt(2) + v.charAt(3) + v.charAt(3);
    }
    return /^#[0-9a-fA-F]{6}$/.test(v) ? v.toLowerCase() : "";
  }

  function validate(index) {
    clearErrors();
    var errors = [];
    function bad(name, key) {
      errors.push(name);
      fail(name, key);
    }
    if (index === 0) {
      var shop = valueOf("shop-name");
      if (shop.length < 2) bad("shop", "err_required");
      if (!valueOf("category")) bad("category", "err_category");
      if (valueOf("category") === "other" && valueOf("category-other").length < 2) bad("other", "err_required");
      var outlets = Number(valueOf("outlets"));
      if (!Number.isInteger(outlets) || outlets < 1 || outlets > 200) bad("outlets", "err_outlets");
      if (valueOf("address").length < 4) bad("address", "err_required");
      if (!validDomain(valueOf("domain"))) bad("domain", "err_domain");
    }
    if (index === 1) {
      if (!logoFile) bad("logo", "err_logo");
      else if (!fileKind(logoFile)) bad("logo", "err_logo_type");
      else if (logoFile.size > MAX_BYTES) bad("logo", "err_logo_size");
      if (heroFile && !fileKind(heroFile)) bad("hero", "err_hero_type");
      else if (heroFile && heroFile.size > MAX_BYTES) bad("hero", "err_logo_size");
      if (!normalizeHex(valueOf("color-hex"), true)) bad("color", "err_color");
    }
    if (index === 2) {
      if (valueOf("points").length < 2) bad("points", "err_required");
      if (valueOf("welcome").length < 2) bad("welcome", "err_required");
      if (valueOf("birthday").length < 2) bad("birthday", "err_required");
      if (valueOf("rewards").length < 2) bad("rewards", "err_required");
      if (!document.querySelector('input[name="antifraud"]:checked')) bad("antifraud", "err_antifraud");
    }
    if (index === 3) {
      if (valueOf("owner-name").length < 2) bad("owner", "err_required");
      if (!validPhone(valueOf("whatsapp"))) bad("whatsapp", "err_phone");
      if (!validEmail(valueOf("email"))) bad("email", "err_email");
      if (!document.querySelector('input[name="ownerLang"]:checked')) bad("language", "err_required");
    }
    if (!errors.length) return true;
    var alert = document.getElementById("form-alert");
    alert.hidden = false;
    alert.textContent = t("err_summary");
    var first = document.getElementById("err-" + errors[0]);
    if (first) first.closest(".field").scrollIntoView({ behavior: "smooth", block: "center" });
    return false;
  }

  function goTo(target) {
    if (target === step) return;
    if (target < step) {
      clearErrors();
      step = target;
      showStep();
      return;
    }
    for (var i = step; i < target; i += 1) {
      if (!validate(i)) {
        step = i;
        showStep();
        validate(i);
        return;
      }
    }
    clearErrors();
    step = target;
    showStep();
  }

  function categoryLabel() {
    var select = document.getElementById("category");
    var option = select.options[select.selectedIndex];
    return option ? option.textContent : "";
  }

  function checkedValues(name) {
    return Array.prototype.map.call(document.querySelectorAll('input[name="' + name + '"]:checked'), function (input) {
      return input.value;
    });
  }

  function renderReview() {
    var quote = VipKadCatalog.quote(selection);
    var code = VipKadLocale.getLang();
    var rows = [
      [VipKadCatalog.planName(quote, code), quoteLabel(quote, code)],
      [VipKadCatalog.label(code, "setup_fee"), quote.setupText],
      [VipKadCatalog.label(code, quote.billing === "yearly" ? "recurring_yearly" : "recurring_monthly"), quote.recurringText],
      [t("summary_paid"), paid ? t("summary_paid") : t("summary_unpaid")],
      [t("shop_name"), valueOf("shop-name")],
      [t("category"), valueOf("category") === "other" ? valueOf("category-other") : categoryLabel()],
      [t("outlets"), valueOf("outlets")],
      [t("address"), valueOf("address")],
      [t("domain"), valueOf("domain") || "—"],
      [t("color"), normalizeHex(valueOf("color-hex"), true)],
      [t("logo"), logoFile ? logoFile.name : "—"],
      [t("hero"), heroFile ? heroFile.name : "—"],
      [t("points"), valueOf("points")],
      [t("welcome"), valueOf("welcome")],
      [t("birthday"), valueOf("birthday")],
      [t("rewards"), valueOf("rewards")],
      [t("antifraud"), checkedValues("antifraud").map(function (id) {
        return t(id === "qr" ? "af_qr" : id === "receipt" ? "af_receipt" : "af_approval");
      }).join(" · ")],
      [t("owner_name"), valueOf("owner-name")],
      [t("owner_wa"), valueOf("whatsapp")],
      [t("owner_email"), valueOf("email")],
      [t("owner_lang"), ownerLangLabel()]
    ];
    var list = document.getElementById("review-list");
    list.replaceChildren();
    rows.forEach(function (row) {
      var item = document.createElement("div");
      var dt = document.createElement("dt");
      var dd = document.createElement("dd");
      dt.textContent = row[0];
      dd.textContent = row[1];
      item.appendChild(dt);
      item.appendChild(dd);
      list.appendChild(item);
    });
    if (logoUrl) {
      var img = document.createElement("img");
      img.src = logoUrl;
      img.alt = "";
      img.className = "review-logo";
      list.appendChild(img);
    }
  }

  function quoteLabel(quote, code) {
    var name = VipKadCatalog.planName(quote, code);
    if (quote.early) name += " · " + VipKadCatalog.label(code, quote.tier === "starter" ? "plan_starter" : "plan_standard");
    name += " · " + (quote.billing === "monthly" ? t("bill_monthly_long") : t("bill_yearly_long"));
    name += " · " + quote.currency;
    return name;
  }

  function ownerLangLabel() {
    var selected = document.querySelector('input[name="ownerLang"]:checked');
    if (!selected) return "";
    return t(selected.value === "zh" ? "lang_zh" : selected.value === "ms" ? "lang_ms" : "lang_en");
  }

  function contrast(hex) {
    var raw = hex.replace("#", "");
    var r = parseInt(raw.slice(0, 2), 16);
    var g = parseInt(raw.slice(2, 4), 16);
    var b = parseInt(raw.slice(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#143226" : "#fffaf2";
  }

  function initials(name) {
    var parts = name.split(/\s+/).filter(Boolean);
    if (!parts.length) return "VK";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }

  function paintCard() {
    var hex = normalizeHex(valueOf("color-hex"), true) || "#143226";
    var card = document.getElementById("brand-card");
    var ink = contrast(hex);
    card.style.background = "linear-gradient(160deg, " + hex + " 0%, " + hex + " 55%, rgba(0,0,0,0.28) 140%)";
    card.style.color = ink;
    var shop = valueOf("shop-name") || "VipKad";
    document.getElementById("card-shop").textContent = shop;
    document.getElementById("card-brand").textContent = "VIPKAD";
    document.getElementById("card-meta").textContent = t("card_member");
    var logo = document.getElementById("card-logo");
    var mark = document.getElementById("card-mark");
    if (logoUrl) {
      logo.src = logoUrl;
      logo.hidden = false;
      mark.hidden = true;
    } else {
      logo.hidden = true;
      mark.hidden = false;
      mark.textContent = initials(shop);
      mark.style.color = hex;
    }
    document.querySelectorAll("#swatches button").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.dataset.color === hex));
    });
  }

  function setColor(hex) {
    var next = normalizeHex(hex, true);
    if (!next) return;
    document.getElementById("color-hex").value = next;
    document.getElementById("color-picker").value = next;
    paintCard();
  }

  function bindFile(inputId, kind) {
    document.getElementById(inputId).addEventListener("change", function (event) {
      var file = event.target.files && event.target.files[0];
      if (!file) return;
      assignFile(kind, file);
    });
  }

  function assignFile(kind, file) {
    var url = URL.createObjectURL(file);
    if (kind === "logo") {
      if (logoUrl) URL.revokeObjectURL(logoUrl);
      logoFile = file;
      logoUrl = url;
      document.getElementById("logo-name").textContent = file.name;
      var preview = document.getElementById("logo-preview");
      preview.src = url;
      preview.hidden = false;
      document.getElementById("logo-remove").hidden = false;
    } else {
      if (heroUrl) URL.revokeObjectURL(heroUrl);
      heroFile = file;
      heroUrl = url;
      document.getElementById("hero-name").textContent = file.name;
      var hero = document.getElementById("hero-preview");
      hero.src = url;
      hero.hidden = false;
      document.getElementById("hero-remove").hidden = false;
    }
    paintCard();
    if (fileKind(file) && file.size <= MAX_BYTES) {
      var err = document.getElementById("err-" + kind);
      err.textContent = "";
      err.closest(".field").classList.remove("has-error");
      var control = err.closest(".field").querySelector("input");
      if (control) control.removeAttribute("aria-invalid");
    } else {
      fail(kind, !fileKind(file) ? (kind === "logo" ? "err_logo_type" : "err_hero_type") : "err_logo_size");
    }
  }

  function clearFile(kind) {
    if (kind === "logo") {
      if (logoUrl) URL.revokeObjectURL(logoUrl);
      logoFile = null;
      logoUrl = "";
      document.getElementById("logo-input").value = "";
      document.getElementById("logo-name").textContent = t("no_file");
      document.getElementById("logo-preview").hidden = true;
      document.getElementById("logo-remove").hidden = true;
    } else {
      if (heroUrl) URL.revokeObjectURL(heroUrl);
      heroFile = null;
      heroUrl = "";
      document.getElementById("hero-input").value = "";
      document.getElementById("hero-name").textContent = t("no_file");
      document.getElementById("hero-preview").hidden = true;
      document.getElementById("hero-remove").hidden = true;
    }
    paintCard();
  }

  function refreshPointsDefault(force) {
    var input = document.getElementById("points");
    var defaults = knownPointDefaults();
    if (force || pointsAutofill || !input.value || defaults[input.value]) {
      input.value = pointsDefault();
      pointsAutofill = true;
    }
  }

  function buildSwatches() {
    var box = document.getElementById("swatches");
    PRESETS.forEach(function (color) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.color = color;
      btn.style.background = color;
      btn.setAttribute("aria-label", color);
      btn.setAttribute("aria-pressed", "false");
      btn.addEventListener("click", function () { setColor(color); });
      box.appendChild(btn);
    });
  }

  function readAsDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result || "")); };
      reader.onerror = function () { reject(reader.error || new Error("read")); };
      reader.readAsDataURL(file);
    });
  }

  function compressRaster(file, maxEdge) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var edge = Math.max(img.width, img.height) || 1;
        var scale = Math.min(1, maxEdge / edge);
        var canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        var ctx = canvas.getContext("2d");
        var mime = fileKind(file) === "jpg" ? "image/jpeg" : "image/png";
        if (mime === "image/jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        var data = canvas.toDataURL(mime, 0.86);
        if (data.length > 1500000 && mime === "image/png") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          data = canvas.toDataURL("image/jpeg", 0.82);
        }
        resolve(data);
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error("image"));
      };
      img.src = url;
    });
  }

  async function filePayload(file) {
    if (!file) return null;
    var dataUrl = "";
    if (fileKind(file) === "svg") dataUrl = await readAsDataUrl(file);
    else dataUrl = await compressRaster(file, 1200);
    return { name: file.name, type: file.type || fileKind(file), dataUrl: dataUrl };
  }

  function makeRef() {
    var now = new Date();
    var ymd = String(now.getFullYear()) + String(now.getMonth() + 1).padStart(2, "0") + String(now.getDate()).padStart(2, "0");
    var rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return "VK-" + ymd + "-" + rand;
  }

  async function buildBrief() {
    var quote = VipKadCatalog.quote(selection);
    var logo = await filePayload(logoFile);
    var hero = await filePayload(heroFile);
    return {
      reference: makeRef(),
      submittedAt: new Date().toISOString(),
      source: (VIPKAD_CONFIG.brand && VIPKAD_CONFIG.brand.site) || "https://vipkad.com",
      uiLanguage: VipKadLocale.getLang(),
      order: {
        plan: quote.plan,
        tier: quote.tier,
        early: quote.early,
        billing: quote.billing,
        currency: quote.currency,
        setup: quote.setupText,
        recurring: quote.recurringText,
        firstInvoice: quote.firstText,
        paid: paid
      },
      business: {
        shopName: valueOf("shop-name"),
        category: valueOf("category"),
        categoryLabel: valueOf("category") === "other" ? valueOf("category-other") : categoryLabel(),
        outlets: Number(valueOf("outlets")),
        addressHours: valueOf("address"),
        domain: valueOf("domain")
      },
      brand: {
        primaryColor: normalizeHex(valueOf("color-hex"), true),
        logo: logo,
        hero: hero
      },
      membership: {
        pointsRule: valueOf("points"),
        welcomeGift: valueOf("welcome"),
        birthdayReward: valueOf("birthday"),
        rewards: valueOf("rewards"),
        antifraud: checkedValues("antifraud")
      },
      owner: {
        name: valueOf("owner-name"),
        whatsapp: valueOf("whatsapp"),
        email: valueOf("email"),
        language: (document.querySelector('input[name="ownerLang"]:checked') || {}).value || VipKadLocale.getLang()
      }
    };
  }

  function summaryText(brief) {
    var lines = [
      "VipKad shop brief " + brief.reference,
      "Plan: " + brief.order.plan + (brief.order.early ? " (" + brief.order.tier + ")" : "") + " / " + brief.order.billing + " / " + brief.order.currency,
      "Setup: " + brief.order.setup + " · Recurring: " + brief.order.recurring + " · Paid: " + (brief.order.paid ? "yes" : "not yet"),
      "Shop: " + brief.business.shopName,
      "Category: " + brief.business.categoryLabel,
      "Outlets: " + brief.business.outlets,
      "Address & hours: " + brief.business.addressHours,
      "Domain: " + (brief.business.domain || "-"),
      "Colour: " + brief.brand.primaryColor,
      "Logo: " + (brief.brand.logo ? brief.brand.logo.name : "-"),
      "Hero: " + (brief.brand.hero ? brief.brand.hero.name : "-"),
      "Points: " + brief.membership.pointsRule,
      "Welcome: " + brief.membership.welcomeGift,
      "Birthday: " + brief.membership.birthdayReward,
      "Rewards: " + brief.membership.rewards,
      "Anti-fraud: " + brief.membership.antifraud.join(", "),
      "Owner: " + brief.owner.name,
      "WhatsApp: " + brief.owner.whatsapp,
      "Email: " + brief.owner.email,
      "Preferred language: " + brief.owner.language
    ];
    return lines.join("\n");
  }

  function deliveryFields(brief) {
    var logo = brief.brand.logo;
    var hero = brief.brand.hero;
    function slim(file) {
      if (!file) return "";
      if (file.dataUrl && file.dataUrl.length <= 100000) return file.dataUrl;
      return "";
    }
    return {
      _subject: "VipKad shop brief " + brief.reference,
      _template: "table",
      _captcha: "false",
      _replyto: brief.owner.email,
      _honey: "",
      reference: brief.reference,
      message: summaryText(brief),
      shop_name: brief.business.shopName,
      category: brief.business.categoryLabel,
      outlets: String(brief.business.outlets),
      address_hours: brief.business.addressHours,
      domain: brief.business.domain,
      plan: brief.order.plan,
      tier: brief.order.tier,
      billing: brief.order.billing,
      currency: brief.order.currency,
      early_bird: brief.order.early ? "yes" : "no",
      paid: brief.order.paid ? "yes" : "no",
      setup_fee: brief.order.setup,
      recurring_fee: brief.order.recurring,
      primary_color: brief.brand.primaryColor,
      logo_filename: logo ? logo.name : "",
      hero_filename: hero ? hero.name : "",
      logo_data_url: slim(logo),
      hero_data_url: slim(hero),
      points_rule: brief.membership.pointsRule,
      welcome_gift: brief.membership.welcomeGift,
      birthday_reward: brief.membership.birthdayReward,
      rewards: brief.membership.rewards,
      antifraud: brief.membership.antifraud.join(", "),
      owner_name: brief.owner.name,
      owner_whatsapp: brief.owner.whatsapp,
      owner_email: brief.owner.email,
      owner_language: brief.owner.language,
      ui_language: brief.uiLanguage
    };
  }

  function interpret(response, raw) {
    var data = {};
    try { data = JSON.parse(raw); } catch (err) { data = { message: raw }; }
    var blob = raw + " " + (data.message || "");
    if (/activat/i.test(blob)) return "activation";
    var success = data.success === true || data.success === "true";
    if (success) return "sent";
    if (response.ok && notifyMode() === "json" && !/false/i.test(String(data.success || ""))) return "sent";
    return "saved";
  }

  function notifyMode() {
    return (VIPKAD_CONFIG.notify && VIPKAD_CONFIG.notify.mode) || "formsubmit";
  }

  async function deliver(brief) {
    var notify = VIPKAD_CONFIG.notify || {};
    var endpoint = VipKadCatalog.safeHttps(notify.endpoint || "");
    if (!endpoint) return "saved";
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 20000);
    try {
      var fields = deliveryFields(brief);
      var response;
      if (notifyMode() === "form") {
        var form = new FormData();
        Object.keys(fields).forEach(function (key) {
          if (key.indexOf("data_url") === -1) form.append(key, fields[key]);
        });
        if (logoFile) form.append("logo", logoFile, logoFile.name);
        if (heroFile) form.append("hero", heroFile, heroFile.name);
        response = await fetch(endpoint, { method: "POST", body: form, headers: { Accept: "application/json" }, signal: controller.signal });
      } else {
        response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(fields),
          signal: controller.signal
        });
      }
      var raw = await response.text();
      return interpret(response, raw);
    } catch (err) {
      return "saved";
    } finally {
      clearTimeout(timer);
    }
  }

  function showConfirmation(brief, status) {
    lastBrief = brief;
    document.getElementById("setup-form").hidden = true;
    document.getElementById("setup-intro").hidden = true;
    document.getElementById("setup-sticky").hidden = true;
    var panel = document.getElementById("confirm-panel");
    panel.hidden = false;
    var body = document.getElementById("confirm-body");
    body.textContent = status === "sent" ? t("confirm_sent") : status === "activation" ? t("confirm_activation") : t("confirm_saved");
    document.getElementById("reference-id").textContent = brief.reference;
    var text = {
      zh: "你好，我刚提交了 VipKad 开店资料，编号 " + brief.reference + "，店名是 " + brief.business.shopName + "。",
      en: "Hi, I just submitted a VipKad shop brief. Reference " + brief.reference + ", shop " + brief.business.shopName + ".",
      ms: "Hai, saya baru hantar maklumat kedai VipKad. Rujukan " + brief.reference + ", kedai " + brief.business.shopName + "."
    };
    var wa = (VIPKAD_CONFIG.brand && VIPKAD_CONFIG.brand.whatsapp) || "60167799222";
    document.getElementById("wa-followup").href = "https://wa.me/" + wa + "?text=" + encodeURIComponent(text[VipKadLocale.getLang()] || text.en);
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function downloadBrief() {
    if (!lastBrief) return;
    var blob = new Blob([JSON.stringify(lastBrief, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = lastBrief.reference + "-vipkad-brief.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  async function copyRef() {
    if (!lastBrief) return;
    var button = document.getElementById("copy-ref");
    try {
      await navigator.clipboard.writeText(lastBrief.reference);
    } catch (err) {
      var area = document.createElement("textarea");
      area.value = lastBrief.reference;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    var previous = button.textContent;
    button.textContent = t("copied");
    setTimeout(function () { button.textContent = previous; }, 1600);
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (sending) return;
    var honey = document.querySelector('input[name="_honey"]');
    if (honey && honey.value) {
      showConfirmation({ reference: makeRef(), business: { shopName: "" } }, "saved");
      return;
    }
    for (var i = 0; i <= 3; i += 1) {
      if (!validate(i)) {
        step = i;
        showStep();
        validate(i);
        return;
      }
    }
    sending = true;
    var submit = document.getElementById("submit-brief");
    submit.disabled = true;
    submit.textContent = t("submitting");
    document.getElementById("sticky-next").disabled = true;
    try {
      var brief = await buildBrief();
      var status = await deliver(brief);
      showConfirmation(brief, status);
    } catch (err) {
      var fallback = {
        reference: makeRef(),
        business: { shopName: valueOf("shop-name") },
        note: "Asset encoding failed. Text fields are below.",
        order: VipKadCatalog.quote(selection),
        shopName: valueOf("shop-name"),
        ownerEmail: valueOf("email")
      };
      lastBrief = fallback;
      showConfirmation(fallback, "saved");
    } finally {
      sending = false;
      submit.disabled = false;
      submit.textContent = t("submit");
      document.getElementById("sticky-next").disabled = false;
    }
  }

  function boot() {
    readOrder();
    var ownerLang = document.querySelector('input[name="ownerLang"][value="' + VipKadLocale.getLang() + '"]');
    if (ownerLang) ownerLang.checked = true;
    buildSwatches();
    applyCopy();
    renderSummary();
    refreshPointsDefault(true);
    showStep();

    VipKadLocale.bindSwitchers(function (snap) {
      if (!paid) selection.currency = snap.currency;
      applyCopy();
      renderSummary();
      if (!document.getElementById("form-alert").hidden) validate(step);
      if (step === 4 && !document.getElementById("setup-form").hidden) renderReview();
    });

    document.getElementById("category").addEventListener("change", function () {
      document.getElementById("other-wrap").hidden = valueOf("category") !== "other";
    });
    document.getElementById("shop-name").addEventListener("input", paintCard);
    document.getElementById("points").addEventListener("input", function () {
      pointsAutofill = knownPointDefaults()[document.getElementById("points").value] === true;
    });
    document.getElementById("color-picker").addEventListener("input", function (event) {
      setColor(event.target.value);
    });
    document.getElementById("color-hex").addEventListener("input", function (event) {
      var next = normalizeHex(event.target.value, false);
      if (next) {
        document.getElementById("color-picker").value = next;
        paintCard();
      }
    });
    document.getElementById("color-hex").addEventListener("blur", function (event) {
      var next = normalizeHex(event.target.value, true);
      if (next) setColor(next);
    });
    bindFile("logo-input", "logo");
    bindFile("hero-input", "hero");
    document.getElementById("logo-remove").addEventListener("click", function () { clearFile("logo"); });
    document.getElementById("hero-remove").addEventListener("click", function () { clearFile("hero"); });
    document.getElementById("step-next").addEventListener("click", function () { goTo(step + 1); });
    document.getElementById("step-back").addEventListener("click", function () { goTo(step - 1); });
    document.getElementById("sticky-next").addEventListener("click", function () {
      if (step === 4) document.getElementById("setup-form").requestSubmit();
      else goTo(step + 1);
    });
    document.getElementById("sticky-back").addEventListener("click", function () { goTo(step - 1); });
    document.querySelectorAll("#stepper button").forEach(function (btn) {
      btn.addEventListener("click", function () { goTo(Number(btn.dataset.goto)); });
    });
    document.getElementById("setup-form").addEventListener("submit", onSubmit);
    document.getElementById("download-brief").addEventListener("click", downloadBrief);
    document.getElementById("copy-ref").addEventListener("click", copyRef);
    document.getElementById("edit-again").addEventListener("click", function () {
      document.getElementById("confirm-panel").hidden = true;
      document.getElementById("setup-form").hidden = false;
      document.getElementById("setup-intro").hidden = false;
      document.getElementById("setup-sticky").hidden = false;
      step = 4;
      showStep();
    });
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
