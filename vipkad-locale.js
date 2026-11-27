/**
 * Shared language and currency for every VipKad page and the chat widget.
 * Values persist in localStorage and can be overridden with ?lang= & ?currency=.
 */
(function (global) {
  "use strict";

  var LANG_KEY = "vipkad-lang";
  var CUR_KEY = "vipkad-cur";
  var listeners = [];

  function readStore(key) {
    try {
      return global.localStorage.getItem(key);
    } catch (err) {
      return null;
    }
  }

  function writeStore(key, value) {
    try {
      global.localStorage.setItem(key, value);
    } catch (err) {
      /* private mode */
    }
  }

  function normalizeLang(value) {
    if (value == null || value === "") return "";
    var v = String(value).toLowerCase();
    if (v === "zh" || v === "zh-hans" || v === "zh-cn" || v === "cn" || v === "chinese") return "zh";
    if (v === "en" || v === "english") return "en";
    if (v === "ms" || v === "bm" || v === "my" || v === "malay" || v === "bahasa") return "ms";
    return "";
  }

  function normalizeCurrency(value) {
    if (value == null || value === "") return "";
    var v = String(value).toUpperCase().replace(/\s/g, "");
    if (v === "MY" || v === "MYR" || v === "RM") return "MYR";
    if (v === "SG" || v === "SGD" || v === "S$") return "SGD";
    return "";
  }

  function getLang() {
    return normalizeLang(readStore(LANG_KEY)) || "zh";
  }

  function getCurrency() {
    return normalizeCurrency(readStore(CUR_KEY)) || "MYR";
  }

  function htmlLang(lang) {
    var code = lang || getLang();
    if (code === "zh") return "zh-Hans";
    if (code === "ms") return "ms";
    return "en";
  }

  function snapshot() {
    return { lang: getLang(), currency: getCurrency() };
  }

  function emit() {
    var detail = snapshot();
    listeners.forEach(function (fn) {
      try {
        fn(detail);
      } catch (err) {
        /* a listener should not break the switcher */
      }
    });
    document.dispatchEvent(new CustomEvent("vipkad:locale", { detail: detail }));
  }

  function setLang(value) {
    var next = normalizeLang(value);
    if (!next || next === getLang()) {
      if (next) document.documentElement.lang = htmlLang(next);
      return getLang();
    }
    writeStore(LANG_KEY, next);
    document.documentElement.lang = htmlLang(next);
    emit();
    return next;
  }

  function setCurrency(value) {
    var next = normalizeCurrency(value);
    if (!next || next === getCurrency()) return getCurrency();
    writeStore(CUR_KEY, next);
    emit();
    return next;
  }

  function syncSwitchers(root) {
    var scope = root || document;
    var lang = getLang();
    var currency = getCurrency();
    scope.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(normalizeLang(btn.dataset.lang) === lang));
    });
    scope.querySelectorAll(".cur-btn").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(normalizeCurrency(btn.dataset.currency) === currency));
    });
  }

  function bindSwitchers(onChange) {
    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setLang(btn.dataset.lang);
        syncSwitchers();
        if (onChange) onChange(snapshot());
      });
    });
    document.querySelectorAll(".cur-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setCurrency(btn.dataset.currency);
        syncSwitchers();
        if (onChange) onChange(snapshot());
      });
    });
    syncSwitchers();
  }

  function on(fn) {
    listeners.push(fn);
    return function () {
      listeners = listeners.filter(function (item) { return item !== fn; });
    };
  }

  function initFromLocation() {
    var params = new URLSearchParams(global.location.search);
    var lang = normalizeLang(params.get("lang"));
    var currency = normalizeCurrency(params.get("currency") || params.get("cur"));
    if (lang) writeStore(LANG_KEY, lang);
    if (currency) writeStore(CUR_KEY, currency);
    if (document.documentElement) {
      document.documentElement.lang = htmlLang(getLang());
    }
  }

  initFromLocation();

  global.VipKadLocale = {
    getLang: getLang,
    setLang: setLang,
    getCurrency: getCurrency,
    setCurrency: setCurrency,
    normalizeLang: normalizeLang,
    normalizeCurrency: normalizeCurrency,
    htmlLang: htmlLang,
    syncSwitchers: syncSwitchers,
    bindSwitchers: bindSwitchers,
    snapshot: snapshot,
    on: on
  };
})(window);
