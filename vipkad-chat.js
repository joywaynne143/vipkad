/**
 * Trilingual VipKad support widget.
 * Uses VIPKAD_CONFIG.chat.endpoint when set, otherwise the built-in assistant.
 * Support tickets go through VIPKAD_CONFIG.notify. No API keys live here.
 */
(function (global) {
  "use strict";

  var UI = {
    zh: {
      launcher: "打开 vipkad管家",
      close: "关闭对话",
      title: "vipkad管家",
      sub: "问价格、上线或防刷单",
      placeholder: "输入问题…",
      send: "发送",
      chip_pricing: "收费",
      chip_how: "怎么运作",
      chip_time: "1–3 天上线",
      chip_fraud: "防刷单",
      chip_order: "开始下单",
      ticket_open: "留言给 vipkad管家",
      ticket_name: "怎么称呼你",
      ticket_contact: "WhatsApp 或邮箱",
      ticket_message: "想问的问题",
      ticket_send: "送出留言",
      ticket_sending: "正在送出…",
      ticket_cancel: "返回对话",
      typing: "正在看你的问题…",
      remote_note: "在线助手暂时连不上，下面按 VipKad 的说明回答。",
      act_order: "自助下单",
      act_demo: "看现场演示",
      act_setup: "上传开店资料",
      act_email: "发邮件到 hello@vipkad.com",
      act_wa: "WhatsApp 联络",
      err_ticket: "请留下称呼、联络方式和问题。"
    },
    en: {
      launcher: "Open vipkad管家",
      close: "Close chat",
      title: "vipkad管家",
      sub: "Pricing, go-live, anti-fraud",
      placeholder: "Ask a question…",
      send: "Send",
      chip_pricing: "Pricing",
      chip_how: "How it works",
      chip_time: "Live in 1–3 days",
      chip_fraud: "Anti-fraud",
      chip_order: "Start ordering",
      ticket_open: "Message vipkad管家",
      ticket_name: "Your name",
      ticket_contact: "WhatsApp or email",
      ticket_message: "How can we help?",
      ticket_send: "Send message",
      ticket_sending: "Sending…",
      ticket_cancel: "Back to chat",
      typing: "Reading your question…",
      remote_note: "The live assistant is unreachable, so here is the answer from VipKad’s own guide.",
      act_order: "Start an order",
      act_demo: "Try the live demo",
      act_setup: "Upload shop brief",
      act_email: "Email hello@vipkad.com",
      act_wa: "WhatsApp us",
      err_ticket: "Add your name, a contact, and the question."
    },
    ms: {
      launcher: "Buka vipkad管家",
      close: "Tutup sembang",
      title: "vipkad管家",
      sub: "Harga, naik talian, anti-penipuan",
      placeholder: "Tanya soalan…",
      send: "Hantar",
      chip_pricing: "Harga",
      chip_how: "Cara ia berfungsi",
      chip_time: "Naik talian 1–3 hari",
      chip_fraud: "Anti-penipuan",
      chip_order: "Mula pesan",
      ticket_open: "Mesej kepada vipkad管家",
      ticket_name: "Nama anda",
      ticket_contact: "WhatsApp atau e-mel",
      ticket_message: "Apa yang ingin ditanya?",
      ticket_send: "Hantar mesej",
      ticket_sending: "Menghantar…",
      ticket_cancel: "Kembali ke sembang",
      typing: "Sedang baca soalan anda…",
      remote_note: "Pembantu langsung tidak dapat dihubungi, jadi ini jawapan daripada panduan VipKad.",
      act_order: "Mula pesan",
      act_demo: "Cuba demo",
      act_setup: "Muat naik maklumat kedai",
      act_email: "E-mel hello@vipkad.com",
      act_wa: "WhatsApp kami",
      err_ticket: "Isi nama, cara hubungan, dan soalan."
    }
  };

  var messages = [];
  var ticketOpen = false;
  var sending = false;
  var root;
  var logEl;
  var composeEl;
  var ticketEl;
  var inputEl;

  function ui(key) {
    var code = global.VipKadLocale ? VipKadLocale.getLang() : "zh";
    var pack = UI[code] || UI.en;
    return pack[key] || UI.en[key] || key;
  }

  function brand() {
    return global.VIPKAD_CONFIG && VIPKAD_CONFIG.brand ? VIPKAD_CONFIG.brand : { email: "hello@vipkad.com", whatsapp: "60167799222" };
  }

  function orderHref() {
    return global.VipKadCatalog ? VipKadCatalog.orderHref({ billing: "yearly" }) : "./order.html";
  }

  function setupHref() {
    return global.VipKadCatalog ? VipKadCatalog.setupHref({ plan: "standard", billing: "yearly" }, { paid: false }) : "./setup.html";
  }

  function demoHref() {
    var params = new URLSearchParams({
      lang: VipKadLocale.getLang(),
      currency: VipKadLocale.getCurrency()
    });
    return "./index.html?" + params.toString() + "#demo";
  }

  function link(label, href) {
    return { type: "link", label: label, href: href };
  }

  function ticketAction() {
    return { type: "ticket", label: ui("ticket_open") };
  }

  function pricingText() {
    var table = VipKadCatalog.priceTable();
    var code = VipKadLocale.getLang();
    var my = table.MYR;
    var sg = table.SGD;
    if (code === "zh") {
      return [
        "价钱分马来西亚（令吉）和新加坡（新元），不含 SST / GST。年付大约少付 2 个月。",
        "",
        "入门版",
        "· 马来西亚：开通费 " + my.starter.setup + "，月费 " + my.starter.monthly + "，年费 " + my.starter.yearly,
        "· 新加坡：开通费 " + sg.starter.setup + "，月费 " + sg.starter.monthly + "，年费 " + sg.starter.yearly,
        "",
        "标准版（餐厅、咖啡馆、美容美发店最常用）",
        "· 马来西亚：开通费 " + my.standard.setup + "，月费 " + my.standard.monthly + "，年费 " + my.standard.yearly,
        "· 新加坡：开通费 " + sg.standard.setup + "，月费 " + sg.standard.monthly + "，年费 " + sg.standard.yearly,
        "",
        "种子客户（前 3 到 5 家店）",
        "· 开通费 " + my.earlySetup + " 或 " + sg.earlySetup + "。之后的月费或年费仍按你选的入门版或标准版。",
        "",
        "现在就可以自助下单，选完方案直接上传店名、logo 和会员规则。"
      ].join("\n");
    }
    if (code === "ms") {
      return [
        "Harga ada dalam Ringgit Malaysia dan Dolar Singapura, tidak termasuk SST / GST. Bayaran tahunan jimat lebih kurang 2 bulan.",
        "",
        "Asas",
        "· Malaysia: caj pemasangan " + my.starter.setup + ", bulanan " + my.starter.monthly + ", tahunan " + my.starter.yearly,
        "· Singapura: caj pemasangan " + sg.starter.setup + ", bulanan " + sg.starter.monthly + ", tahunan " + sg.starter.yearly,
        "",
        "Standard (paling sesuai untuk restoran, kafe dan salun)",
        "· Malaysia: caj pemasangan " + my.standard.setup + ", bulanan " + my.standard.monthly + ", tahunan " + my.standard.yearly,
        "· Singapura: caj pemasangan " + sg.standard.setup + ", bulanan " + sg.standard.monthly + ", tahunan " + sg.standard.yearly,
        "",
        "Rakan niaga awal (3–5 kedai pertama)",
        "· Caj pemasangan " + my.earlySetup + " atau " + sg.earlySetup + ". Yuran bulanan atau tahunan kemudian ikut pelan Asas atau Standard yang anda pilih.",
        "",
        "Anda boleh pesan sendiri sekarang, kemudian muat naik nama kedai, logo dan peraturan keahlian."
      ].join("\n");
    }
    return [
      "Prices are in Malaysian Ringgit or Singapore Dollars, and exclude SST / GST. Yearly billing saves about two months.",
      "",
      "Starter",
      "· Malaysia: setup " + my.starter.setup + ", monthly " + my.starter.monthly + ", yearly " + my.starter.yearly,
      "· Singapore: setup " + sg.starter.setup + ", monthly " + sg.starter.monthly + ", yearly " + sg.starter.yearly,
      "",
      "Standard (the usual fit for restaurants, cafés and salons)",
      "· Malaysia: setup " + my.standard.setup + ", monthly " + my.standard.monthly + ", yearly " + my.standard.yearly,
      "· Singapore: setup " + sg.standard.setup + ", monthly " + sg.standard.monthly + ", yearly " + sg.standard.yearly,
      "",
      "Founding early-bird (first 3–5 shops)",
      "· Setup " + my.earlySetup + " or " + sg.earlySetup + ". The monthly or yearly fee still follows the Starter or Standard plan you choose.",
      "",
      "You can order now, then upload the shop name, logo and membership rules."
    ].join("\n");
  }

  function usecaseText(query) {
    var text = (query || "").toLowerCase();
    var code = VipKadLocale.getLang();
    var halal = /halal|清真|穆斯林|melayu|islam/.test(text);
    var beauty = /beauty|salon|salun|美容|美发|美髮|spa|kecantikan/.test(text);
    var cafe = /cafe|café|咖啡|kafe/.test(text);
    var retail = /retail|runcit|零售/.test(text);
    var lines = {
      zh: {
        base: "VipKad 是给独立店用的品牌会员网页，不是把客人放进别人的共享平台。餐厅、咖啡馆、马来与清真餐饮、美容美发和零售店都能用。",
        halal: "马来与清真餐饮很适合：顾客页有中文、英语和马来语，客人扫店内 QR 约 30 秒登记，不用下载 App。",
        beauty: "美容美发店通常选标准版：自己的 logo、品牌色、专属网址，以及铜卡 / 黑金卡这类等级。",
        cafe: "咖啡馆可以先用入门版试跑。如果要专属网址和多等级会员，就选标准版。",
        retail: "零售店一样不用换收银系统。会员网页独立运作，1 到 3 天可以上线。"
      },
      en: {
        base: "VipKad is an own-brand membership page for independent shops, not a shared platform. It fits restaurants, cafés, Malay and Halal F&B, salons and retail.",
        halal: "Malay and Halal F&B is a natural fit: the guest page is in Chinese, English and Bahasa Melayu, and sign-up is a 30-second in-store QR with no app download.",
        beauty: "Salons usually take Standard: your logo, colours, own web address, and tiers such as Bronze and Black Card.",
        cafe: "A café can start on Starter. Choose Standard if you want your own web address and more than one membership tier.",
        retail: "Retail shops do not replace the POS either. The membership page runs beside it and can go live in 1–3 days."
      },
      ms: {
        base: "VipKad ialah halaman keahlian jenama sendiri untuk kedai bebas, bukan platform kongsi. Ia sesuai untuk restoran, kafe, F&B Melayu dan Halal, salun dan runcit.",
        halal: "F&B Melayu dan Halal memang sesuai: halaman pelanggan ada Bahasa Melayu, Inggeris dan Cina, daftar imbas QR di kedai dalam kira-kira 30 saat, tanpa muat turun app.",
        beauty: "Salun biasanya pilih Standard: logo, warna, alamat web sendiri, dan peringkat seperti Kad Gangsa / Kad Hitam.",
        cafe: "Kafe boleh mula dengan pelan Asas. Pilih Standard jika mahu alamat web sendiri dan lebih daripada satu peringkat ahli.",
        retail: "Kedai runcit juga tidak perlu tukar POS. Halaman keahlian berjalan berasingan dan boleh naik talian dalam 1–3 hari."
      }
    };
    var pack = lines[code] || lines.en;
    var parts = [pack.base];
    if (halal) parts.push(pack.halal);
    if (beauty) parts.push(pack.beauty);
    if (cafe) parts.push(pack.cafe);
    if (retail) parts.push(pack.retail);
    if (parts.length === 1) {
      parts.push(pack.halal);
      parts.push(pack.beauty);
    }
    return parts.join("\n\n");
  }

  function replyFor(message) {
    var code = VipKadLocale.getLang();
    var id = message.intent;
    var text = "";
    var actions = [];
    if (id === "pricing" || id === "early") {
      text = pricingText();
      actions = [link(ui("act_order"), orderHref())];
    } else if (id === "how") {
      text = {
        zh: "客人坐在店里，扫桌牌或收银台 QR，大约 30 秒填好姓名和电话，再上传收据照片。老板在手机上点一下批准，会员才生效。\n\n不用下载 App，也不用换掉现在的收银系统。登记页有中文、英语和马来语。做完可以连到店铺 WhatsApp，方便之后发优惠。",
        en: "The guest is in the shop. They scan the table or counter QR, fill in name and mobile in about 30 seconds, and upload a receipt photo. Membership starts only after you approve with one tap on your phone.\n\nNo app download, and no POS replacement. The page is in Chinese, English and Bahasa Melayu, and it can continue into your shop WhatsApp for later offers.",
        ms: "Pelanggan berada di kedai. Mereka imbas QR di meja atau kaunter, isi nama dan telefon dalam kira-kira 30 saat, dan muat naik gambar resit. Keahlian hanya aktif selepas anda luluskan dengan satu ketikan di telefon.\n\nTak perlu muat turun app, dan tak perlu tukar POS. Halaman dalam Bahasa Melayu, Inggeris dan Cina, dan boleh terus ke WhatsApp kedai untuk promosi."
      }[code];
      actions = [link(ui("act_demo"), demoHref()), link(ui("act_order"), orderHref())];
    } else if (id === "timeline") {
      text = {
        zh: "一般 1 到 3 天可以在店里扫码使用。我们需要店名、logo、品牌色、积分和奖品规则，以及老板的 WhatsApp。不用换收银系统，也不用等客人下载 App。\n\n种子客户（前 3 到 5 家店）会优先排期。",
        en: "Most shops can scan in-store within 1–3 days. We need the shop name, logo, brand colour, points and rewards, and the owner’s WhatsApp. You do not replace the POS, and guests do not download an app.\n\nFounding shops (the first 3–5) are scheduled first.",
        ms: "Kebanyakan kedai boleh imbas di premis dalam 1–3 hari. Kami perlukan nama kedai, logo, warna jenama, peraturan mata dan ganjaran, serta WhatsApp pemilik. Anda tidak tukar POS, dan pelanggan tidak muat turun app.\n\nKedai rakan niaga awal (3–5 yang pertama) diberi giliran dahulu."
      }[code];
      actions = [link(ui("act_setup"), setupHref()), link(ui("act_order"), orderHref())];
    } else if (id === "antifraud") {
      text = {
        zh: "防刷单靠三步，建议都打开：\n1. 只有店内 QR 才能打开登记，外人在网上填不了。\n2. 申请时要上传收据照片。\n3. 老板在手机后台点一下，会员才生效。员工不能私下开卡。",
        en: "Anti-fraud is three checks, and we recommend all of them:\n1. Only the in-store QR opens sign-up, so people cannot join from home.\n2. The applicant uploads a receipt photo.\n3. Membership starts only after the owner approves with one tap. Staff cannot quietly issue cards.",
        ms: "Anti-penipuan ada tiga semakan, dan kami syorkan ketiga-tiganya:\n1. Hanya QR di kedai yang buka pendaftaran, jadi orang luar tidak boleh daftar dari rumah.\n2. Pemohon muat naik gambar resit.\n3. Keahlian hanya aktif selepas pemilik luluskan dengan satu ketikan. Staf tidak boleh buka kad secara senyap."
      }[code];
      actions = [link(ui("act_demo"), demoHref())];
    } else if (id === "pos") {
      text = {
        zh: "不用换掉现有收银系统。VipKad 独立运作，跟你现在的收银台并行。会员登记、收据和老板批准都在网页里完成，一般 1 到 3 天可以上线。",
        en: "You do not replace the POS you already use. VipKad runs beside the cashier: sign-up, receipt upload and owner approval all happen on the web page. Most shops go live in 1–3 days.",
        ms: "Anda tidak perlu tukar sistem POS yang sedia ada. VipKad berjalan di samping kashier: daftar, muat naik resit dan kelulusan pemilik semuanya di halaman web. Kebanyakan kedai naik talian dalam 1–3 hari."
      }[code];
      actions = [link(ui("act_order"), orderHref())];
    } else if (id === "data") {
      text = {
        zh: "会员资料 100% 属于你的店，不是放在第三方共享会员平台里。那种平台如果被卖掉，或拿客人名单去推别的店，老板往往不会知道。VipKad 是你自己的品牌系统，名单在你手上。我们也不会把会员资料拿去卖。",
        en: "Customer data is 100% yours. It does not sit in a shared third-party membership platform that could be sold, or used to promote other shops, without you knowing. VipKad is your own system, and we do not sell the member list.",
        ms: "Data pelanggan milik anda 100%. Ia tidak diletakkan dalam platform keahlian pihak ketiga yang boleh dijual, atau digunakan untuk promosi kedai lain, tanpa anda tahu. VipKad ialah sistem anda sendiri, dan kami tidak menjual senarai ahli."
      }[code];
    } else if (id === "noapp") {
      text = {
        zh: "顾客不用下载 App。扫店里的 QR，用手机浏览器大约 30 秒就能登记。愿意的话，也可以把页面加到主屏幕，看起来像一个小图标。没有下载门槛，愿意加入的客人会多很多。",
        en: "Guests do not download an app. They scan the in-store QR and sign up in the mobile browser in about 30 seconds. If they want, they can add the page to their home screen. Without a download wall, far more people actually join.",
        ms: "Pelanggan tidak perlu muat turun app. Mereka imbas QR di kedai dan daftar dalam pelayar telefon dalam kira-kira 30 saat. Kalau mahu, halaman boleh ditambah ke skrin utama. Tanpa halangan muat turun, lebih ramai yang benar-benar menyertai."
      }[code];
      actions = [link(ui("act_demo"), demoHref())];
    } else if (id === "paper") {
      text = {
        zh: "可以告别柜台翻本子、拿笔抄电话。客人自己扫码填写，店里看起来更专业，高峰时段也不用让人干等。资料直接进你的会员系统，而不是留在一张可能会丢的纸上。",
        en: "You can retire the counter notebook. Guests scan and type their own details, which looks more professional and avoids a queue while staff write. The details go into your membership system instead of a piece of paper that can be lost.",
        ms: "Anda boleh tinggalkan buku daftar di kaunter. Pelanggan imbas dan isi sendiri, nampak lebih profesional, dan staf tidak perlu menyalin semasa kedai sibuk. Maklumat masuk ke sistem keahlian anda, bukan di atas kertas yang mudah hilang."
      }[code];
    } else if (id === "brand") {
      text = {
        zh: "会员页用你的 logo、品牌色和网址，不是套一个公共品牌。标准版可以绑定店铺专属域名，也支持铜卡 / 黑金卡这类等级。下单后上传 logo 和色号，页面上会先看到一张会员卡预览。",
        en: "The membership page uses your logo, colours and web address, not a generic shared brand. Standard includes your own domain and tiers such as Bronze and Black Card. After you order, upload the logo and hex colour — the setup page shows a live card preview.",
        ms: "Halaman keahlian guna logo, warna dan alamat web anda, bukan jenama kongsi. Standard termasuk domain sendiri dan peringkat seperti Kad Gangsa dan Kad Hitam. Selepas pesan, muat naik logo dan kod warna — halaman persediaan tunjukkan pratonton kad serta-merta."
      }[code];
      actions = [link(ui("act_setup"), setupHref())];
    } else if (id === "usecase") {
      text = usecaseText(message.query);
      actions = [link(ui("act_order"), orderHref())];
    } else if (id === "languages") {
      text = {
        zh: "顾客登记页和这个网站都有中文、English 和 Bahasa Melayu。老板联络我们时也可以指定要用的语言。很适合马来西亚以马来顾客为主的餐厅，以及新山、吉隆坡和新加坡的店。",
        en: "The guest sign-up page and this website are in Chinese, English and Bahasa Melayu. You can also tell us which language to use when we contact the owner. It suits Malay-majority restaurants in Malaysia and shops in JB, KL and Singapore.",
        ms: "Halaman daftar pelanggan dan laman ini ada Bahasa Melayu, Inggeris dan Cina. Anda juga boleh pilih bahasa yang kami gunakan untuk hubungi pemilik. Sesuai untuk restoran majoriti Melayu di Malaysia, serta kedai di JB, KL dan Singapura."
      }[code];
    } else if (id === "demo") {
      text = {
        zh: "首页有一个一分钟演示：先当顾客登记，再当老板点批准。演示不会保存真实资料。看好了就可以直接自助下单。",
        en: "The homepage has a one-minute demo: join as a guest, then approve as the owner. The demo does not store real data. When you’re ready, start an order.",
        ms: "Laman utama ada demo satu minit: daftar sebagai pelanggan, kemudian luluskan sebagai pemilik. Demo tidak simpan data sebenar. Bila sudah sedia, mula pesan."
      }[code];
      actions = [link(ui("act_demo"), demoHref()), link(ui("act_order"), orderHref())];
    } else if (id === "order") {
      text = {
        zh: "可以直接自助下单。先选入门版、标准版或种子客户，再选月付或年付，以及令吉或新元。页面会列出开通费、月费或年费。付款链接接上之前，选完会进入开店资料页，上传 logo 和规则即可。",
        en: "You can order yourself. Choose Starter, Standard or the founding early-bird, then monthly or yearly, in RM or S$. The page shows the setup fee and the recurring fee. Until a payment link is connected, you continue straight into the shop brief and upload the logo and rules.",
        ms: "Anda boleh pesan sendiri. Pilih Asas, Standard atau rakan niaga awal, kemudian bulanan atau tahunan, dalam RM atau S$. Halaman tunjukkan caj pemasangan dan yuran berulang. Selagi pautan pembayaran belum disambung, anda terus ke borang maklumat kedai untuk muat naik logo dan peraturan."
      }[code];
      actions = [link(ui("act_order"), orderHref()), link(ui("act_setup"), setupHref())];
    } else if (id === "greeting") {
      text = {
        zh: "你好，我是 vipkad管家。可以问收费（令吉 / 新元）、30 秒扫码、1 到 3 天上线，或防刷单。复杂的问题可以在这里留言，我们会用 WhatsApp 或邮箱回复。",
        en: "Hello, I’m vipkad管家. Ask about pricing in RM or S$, the 30-second QR sign-up, going live in 1–3 days, or anti-fraud. For anything specific, leave a message and we’ll reply by WhatsApp or email.",
        ms: "Hai, saya vipkad管家. Tanya tentang harga dalam RM atau S$, daftar QR 30 saat, naik talian 1–3 hari, atau anti-penipuan. Untuk soalan khusus, tinggalkan mesej dan kami balas melalui WhatsApp atau e-mel."
      }[code];
      actions = [link(ui("act_order"), orderHref()), ticketAction()];
    } else if (id === "ticket_sent") {
      text = (message.status === "sent" ? {
        zh: "留言已送到 vipkad管家。编号 " + message.ref + "。我们会用你留下的 WhatsApp 或邮箱回复。",
        en: "vipkad管家 has the message. Reference " + message.ref + ". We’ll reply on the WhatsApp or email you left.",
        ms: "Mesej sudah sampai kepada vipkad管家. Rujukan " + message.ref + ". Kami akan balas melalui WhatsApp atau e-mel yang anda beri."
      } : {
        zh: "编号 " + message.ref + " 已在这台设备上记好，但通知暂时没送到邮箱。请用下面的邮件或 WhatsApp 把问题发给 hello@vipkad.com。",
        en: "Reference " + message.ref + " is saved on this device, but the inbox notification did not go through. Send the question by email or WhatsApp to hello@vipkad.com.",
        ms: "Rujukan " + message.ref + " disimpan pada peranti ini, tetapi pemberitahuan peti e-mel tidak berjaya. Hantar soalan melalui e-mel atau WhatsApp ke hello@vipkad.com."
      })[code];
      if (message.status !== "sent") {
        actions = [link(ui("act_email"), message.mailto), link(ui("act_wa"), message.whatsapp)];
      }
    } else {
      text = {
        zh: "这个问题我这边没有现成答案。可以留言给 vipkad管家，留下 WhatsApp 或邮箱，我们看到后会回复。也可以先看收费，或直接开始下单。",
        en: "I don’t have a ready answer for that. Leave a message for vipkad管家 with WhatsApp or email, and we’ll reply. You can also check pricing or start an order.",
        ms: "Saya belum ada jawapan sedia untuk soalan itu. Tinggalkan mesej kepada vipkad管家 beserta WhatsApp atau e-mel, dan kami akan balas. Anda juga boleh semak harga atau mula pesan."
      }[code];
      actions = [ticketAction(), link(ui("act_order"), orderHref())];
    }
    if (message.note) text = ui("remote_note") + "\n\n" + text;
    return { text: text, actions: actions };
  }

  var INTENTS = [
    { id: "handoff", boost: 70, keys: ["人工", "客服", "管家", "留言", "转人工", "找真人", "human", "real person", "leave a message", "customer service", "talk to someone", "khidmat pelanggan", "tinggalkan mesej", "orang sebenar"] },
    { id: "early", keys: ["种子", "早鸟", "前3", "前 3", "前5", "前 5", "early-bird", "early bird", "founding", "first 3", "first 5", "rakan niaga"] },
    { id: "timeline", keys: ["多久", "几天", "多快", "上线", "三天", "how long", "how fast", "go live", "1-3", "1–3", "timeline", "berapa lama", "naik talian"] },
    { id: "antifraud", keys: ["防刷", "刷单", "作弊", "审批", "收据", "批准", "fraud", "anti-fraud", "receipt", "approval", "approve", "penipuan", "resit", "lulus"] },
    { id: "pos", keys: ["收银", "收银系统", "换系统", "pos", "cashier", "point of sale", "kashier"] },
    { id: "noapp", keys: ["下载", "不用下", "app", "download", "install", "muat turun", "aplikasi"] },
    { id: "data", keys: ["资料属于", "谁的资料", "数据", "第三方", "卖掉", "ownership", "who owns", "third-party", "third party", "milik siapa", "pihak ketiga"] },
    { id: "paper", keys: ["纸笔", "手抄", "登记本", "pen and paper", "notebook", "handwritten", "buku daftar", "kertas"] },
    { id: "brand", keys: ["logo", "品牌色", "域名", "网址", "门面", "colour", "color", "domain", "warna", "jenama"] },
    { id: "usecase", keys: ["清真", "美容", "美发", "美髮", "咖啡", "餐厅", "餐饮", "零售", "halal", "salon", "salun", "cafe", "café", "restaurant", "retail", "beauty", "kafe", "restoran", "runcit", "kecantikan", "f&b"] },
    { id: "languages", keys: ["马来语", "三语", "bahasa", "malay", "language", "trilingual", "bahasa melayu", "tiga bahasa"] },
    { id: "demo", keys: ["演示", "试用", "demo", "try it", "cuba demo"] },
    { id: "order", keys: ["下单", "购买", "我要开通", "怎么买", "order", "buy", "purchase", "checkout", "sign me up", "pesan", "beli", "nak mula"] },
    { id: "pricing", keys: ["价格", "价钱", "收费", "多少钱", "月费", "年费", "开通费", "price", "pricing", "how much", "cost", "monthly", "yearly", "setup fee", "harga", "berapa", "caj", "yuran", "pelan"] },
    { id: "how", keys: ["怎么运作", "如何运作", "怎样用", "流程", "how it works", "how does it work", "walkthrough", "cara ia", "bagaimana"] },
    { id: "greeting", keys: ["你好", "您好", "hello", "hi", "hey", "hai", "selamat"] },
    { id: "data2", keys: ["会员资料", "客户资料", "own the data", "customer data", "data pelanggan"] }
  ];

  function hit(text, keyword) {
    var k = keyword.toLowerCase();
    if (!k) return false;
    if (/[^\u0000-\u007f]/.test(k) || k.indexOf(" ") >= 0 || k.length >= 8) return text.indexOf(k) >= 0;
    var escaped = k.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&");
    return new RegExp("(?:^|[^a-z0-9])" + escaped + "(?:[^a-z0-9]|$)").test(text);
  }

  function matchIntent(text) {
    var source = String(text || "").toLowerCase();
    var best = { id: "fallback", score: 0 };
    INTENTS.forEach(function (intent) {
      var score = 0;
      intent.keys.forEach(function (keyword) {
        if (hit(source, keyword)) score += Math.max(keyword.length, 2);
      });
      if (score && intent.boost) score += intent.boost;
      if (intent.id === "data2" && score) score += 0;
      var id = intent.id === "data2" ? "data" : intent.id;
      if (score > best.score) best = { id: id, score: score };
    });
    if (best.score < 2) return { id: "fallback", score: 0 };
    return best;
  }

  function safeHref(href) {
    if (!href) return "";
    if (href.charAt(0) === "#") return href;
    if (href.indexOf("./") === 0) return href;
    try {
      var url = new URL(href, global.location.href);
      if (url.protocol === "https:" || url.protocol === "http:" || url.protocol === "mailto:") return url.href;
    } catch (err) {
      return "";
    }
    return "";
  }

  function endpoint() {
    var chat = global.VIPKAD_CONFIG && VIPKAD_CONFIG.chat;
    var value = chat && chat.endpoint ? String(chat.endpoint).trim() : "";
    return value ? VipKadCatalog.safeHttps(value) : "";
  }

  function historyPayload() {
    return messages.slice(-8).map(function (item) {
      var content = item.text || "";
      if (item.role === "assistant" && item.intent) content = replyFor(item).text;
      return { role: item.role === "user" ? "user" : "assistant", content: content };
    }).filter(function (item) { return item.content; });
  }

  async function askRemote(text) {
    var url = endpoint();
    if (!url) return null;
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 12000);
    try {
      var response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          lang: VipKadLocale.getLang(),
          currency: VipKadLocale.getCurrency(),
          page: location.pathname,
          message: text,
          history: historyPayload()
        }),
        signal: controller.signal
      });
      if (!response.ok) return { failed: true };
      var data = await response.json();
      if (!data || typeof data.reply !== "string" || !data.reply.trim()) return { failed: true };
      var actions = Array.isArray(data.actions) ? data.actions.filter(function (action) {
        return action && action.label && safeHref(action.href);
      }).slice(0, 3).map(function (action) {
        return link(String(action.label).slice(0, 80), safeHref(action.href));
      }) : [];
      return { text: data.reply.slice(0, 4000), actions: actions };
    } catch (err) {
      return { failed: true };
    } finally {
      clearTimeout(timer);
    }
  }

  function renderLog() {
    var nearBottom = logEl.scrollHeight - logEl.scrollTop - logEl.clientHeight < 80;
    logEl.replaceChildren();
    messages.forEach(function (item) {
      var bubble = document.createElement("div");
      bubble.className = "vk-chat-bubble " + (item.role === "user" ? "is-user" : "is-bot");
      var body = document.createElement("p");
      if (item.role === "user") body.textContent = item.text || "";
      else if (item.pending) body.textContent = ui("typing");
      else body.textContent = item.text || replyFor(item).text;
      bubble.appendChild(body);
      if (item.role !== "user" && !item.pending) {
        var reply = item.text ? { actions: item.actions || [] } : replyFor(item);
        if (reply.actions && reply.actions.length) {
          var row = document.createElement("div");
          row.className = "vk-chat-actions";
          reply.actions.forEach(function (action) {
            if (action.type === "ticket") {
              var button = document.createElement("button");
              button.type = "button";
              button.className = "btn btn-dark";
              button.textContent = action.label;
              button.addEventListener("click", function () {
                ticketOpen = true;
                render();
                var name = ticketEl.querySelector("input[name='name']");
                if (name) name.focus();
              });
              row.appendChild(button);
            } else {
              var href = safeHref(action.href);
              if (!href) return;
              var anchor = document.createElement("a");
              anchor.className = "btn btn-gold";
              anchor.href = href;
              anchor.textContent = action.label;
              row.appendChild(anchor);
            }
          });
          bubble.appendChild(row);
        }
      }
      logEl.appendChild(bubble);
    });
    if (nearBottom) logEl.scrollTop = logEl.scrollHeight;
  }

  function renderChips() {
    var box = root.querySelector(".vk-chat-chips");
    box.replaceChildren();
    [
      ["pricing", "chip_pricing"],
      ["how", "chip_how"],
      ["timeline", "chip_time"],
      ["antifraud", "chip_fraud"],
      ["order", "chip_order"]
    ].forEach(function (chip) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "vk-chip";
      button.textContent = ui(chip[1]);
      button.addEventListener("click", function () { askIntent(chip[0], ui(chip[1])); });
      box.appendChild(button);
    });
    var handoff = document.createElement("button");
    handoff.type = "button";
    handoff.className = "vk-chip is-quiet";
    handoff.textContent = ui("ticket_open");
    handoff.addEventListener("click", function () {
      ticketOpen = true;
      render();
    });
    box.appendChild(handoff);
  }

  function applyChrome() {
    root.querySelector(".vk-chat-launcher").setAttribute("aria-label", ui("launcher"));
    root.querySelector(".vk-chat-close").setAttribute("aria-label", ui("close"));
    root.querySelector("#vk-chat-title").textContent = ui("title");
    root.querySelector("#vk-chat-sub").textContent = ui("sub");
    inputEl.placeholder = ui("placeholder");
    root.querySelector(".vk-chat-send").textContent = ui("send");
    ticketEl.querySelector("[data-chat='name']").textContent = ui("ticket_name");
    ticketEl.querySelector("[data-chat='contact']").textContent = ui("ticket_contact");
    ticketEl.querySelector("[data-chat='message']").textContent = ui("ticket_message");
    var send = ticketEl.querySelector(".vk-ticket-send");
    if (!sending) send.textContent = ui("ticket_send");
    ticketEl.querySelector(".vk-ticket-cancel").textContent = ui("ticket_cancel");
    var err = ticketEl.querySelector(".vk-ticket-error");
    if (err.dataset.on === "1") err.textContent = ui("err_ticket");
  }

  function render() {
    renderLog();
    renderChips();
    applyChrome();
    composeEl.hidden = ticketOpen;
    ticketEl.hidden = !ticketOpen;
  }

  function askIntent(id, label) {
    messages.push({ role: "user", text: label });
    messages.push({ role: "assistant", intent: id, query: "" });
    if (id === "handoff") ticketOpen = true;
    render();
  }

  async function askText(text) {
    var clean = text.trim().slice(0, 1000);
    if (!clean || sending) return;
    messages.push({ role: "user", text: clean });
    messages.push({ role: "assistant", pending: true });
    sending = true;
    render();
    try {
      var remote = await askRemote(clean);
      messages = messages.filter(function (item) { return !item.pending; });
      if (remote && remote.text) {
        messages.push({ role: "assistant", text: remote.text, actions: remote.actions || [] });
      } else {
        var match = matchIntent(clean);
        messages.push({
          role: "assistant",
          intent: match.id,
          query: clean,
          note: !!(remote && remote.failed)
        });
        if (match.id === "handoff" || (match.id === "fallback" && clean.length > 40)) ticketOpen = true;
      }
    } catch (err) {
      messages = messages.filter(function (item) { return !item.pending; });
      messages.push({ role: "assistant", intent: "fallback", query: clean });
    } finally {
      sending = false;
      render();
    }
  }

  function makeRef() {
    var now = new Date();
    var ymd = String(now.getFullYear()) + String(now.getMonth() + 1).padStart(2, "0") + String(now.getDate()).padStart(2, "0");
    return "VK-SUP-" + ymd + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
  }

  async function sendTicket(event) {
    event.preventDefault();
    var name = ticketEl.querySelector("input[name='name']").value.trim();
    var contact = ticketEl.querySelector("input[name='contact']").value.trim();
    var note = ticketEl.querySelector("textarea[name='message']").value.trim();
    var err = ticketEl.querySelector(".vk-ticket-error");
    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact);
    var phoneOk = contact.replace(/\D/g, "").length >= 8 && contact.replace(/\D/g, "").length <= 15;
    if (name.length < 2 || note.length < 4 || (!emailOk && !phoneOk)) {
      err.hidden = false;
      err.dataset.on = "1";
      err.textContent = ui("err_ticket");
      return;
    }
    err.hidden = true;
    err.dataset.on = "";
    var ref = makeRef();
    var subject = "VipKad support " + ref;
    var body = "Reference: " + ref + "\nName: " + name + "\nContact: " + contact + "\n\n" + note;
    var mailto = "mailto:" + brand().email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    var whatsapp = "https://wa.me/" + brand().whatsapp + "?text=" + encodeURIComponent(body);
    var send = ticketEl.querySelector(".vk-ticket-send");
    send.disabled = true;
    send.textContent = ui("ticket_sending");
    var status = await postTicket({ reference: ref, name: name, contact: contact, message: note, page: location.pathname, lang: VipKadLocale.getLang() });
    send.disabled = false;
    ticketEl.reset();
    ticketOpen = false;
    messages.push({
      role: "assistant",
      intent: "ticket_sent",
      ref: ref,
      status: status,
      mailto: mailto,
      whatsapp: whatsapp
    });
    render();
  }

  async function postTicket(fields) {
    var notify = (global.VIPKAD_CONFIG && VIPKAD_CONFIG.notify) || {};
    var url = global.VipKadCatalog ? VipKadCatalog.safeHttps(notify.endpoint || "") : "";
    if (!url) return "saved";
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 20000);
    try {
      var payload = {
        _subject: "VipKad support " + fields.reference,
        _template: "table",
        _captcha: "false",
        _replyto: /^[^\s@]+@/.test(fields.contact) ? fields.contact : brand().email,
        _honey: "",
        reference: fields.reference,
        type: "support_ticket",
        name: fields.name,
        contact: fields.contact,
        message: fields.message,
        page: fields.page,
        lang: fields.lang
      };
      var response;
      if ((notify.mode || "formsubmit") === "form") {
        var form = new FormData();
        Object.keys(payload).forEach(function (key) { form.append(key, payload[key]); });
        response = await fetch(url, { method: "POST", body: form, headers: { Accept: "application/json" }, signal: controller.signal });
      } else {
        response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
      }
      var raw = await response.text();
      if (/activat/i.test(raw)) return "saved";
      var data = {};
      try { data = JSON.parse(raw); } catch (err) { data = {}; }
      if (data.success === true || data.success === "true") return "sent";
      return "saved";
    } catch (err) {
      return "saved";
    } finally {
      clearTimeout(timer);
    }
  }

  function setOpen(next) {
    var panel = root.querySelector(".vk-chat-panel");
    var launcher = root.querySelector(".vk-chat-launcher");
    panel.hidden = !next;
    launcher.setAttribute("aria-expanded", String(next));
    document.body.classList.toggle("vk-chat-open", next);
    if (next) {
      (ticketOpen ? ticketEl.querySelector("input[name='name']") : inputEl).focus();
    } else {
      launcher.focus();
    }
  }

  function mount() {
    root = document.createElement("div");
    root.className = "vk-chat";
    root.innerHTML =
      '<button class="vk-chat-launcher" type="button" aria-expanded="false" aria-controls="vk-chat-panel">' +
        '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M6 7.5A3.5 3.5 0 0 1 9.5 4h13A3.5 3.5 0 0 1 26 7.5v9A3.5 3.5 0 0 1 22.5 20H13l-4.6 3.4c-.8.6-1.9 0-1.9-.9V20A3.5 3.5 0 0 1 6 16.5v-9Z"/></svg>' +
      "</button>" +
      '<section class="vk-chat-panel" id="vk-chat-panel" role="dialog" aria-modal="false" aria-labelledby="vk-chat-title" hidden>' +
        '<header class="vk-chat-head"><div><strong id="vk-chat-title"></strong><p id="vk-chat-sub"></p></div>' +
        '<button class="vk-chat-close" type="button">×</button></header>' +
        '<div class="vk-chat-log" id="vk-chat-log" aria-live="polite"></div>' +
        '<div class="vk-chat-chips"></div>' +
        '<form class="vk-chat-compose"><input id="vk-chat-input" maxlength="1000" autocomplete="off"><button class="vk-chat-send btn btn-dark" type="submit"></button></form>' +
        '<form class="vk-chat-ticket" hidden>' +
          '<label><span data-chat="name"></span><input name="name" maxlength="80" autocomplete="name"></label>' +
          '<label><span data-chat="contact"></span><input name="contact" maxlength="120" autocomplete="email"></label>' +
          '<label><span data-chat="message"></span><textarea name="message" rows="3" maxlength="1000"></textarea></label>' +
          '<p class="vk-ticket-error" hidden></p>' +
          '<div class="vk-chat-actions"><button class="vk-ticket-send btn btn-gold" type="submit"></button><button class="vk-ticket-cancel btn btn-ghost" type="button"></button></div>' +
        "</form>" +
      "</section>";
    document.body.appendChild(root);
    logEl = root.querySelector(".vk-chat-log");
    composeEl = root.querySelector(".vk-chat-compose");
    ticketEl = root.querySelector(".vk-chat-ticket");
    inputEl = root.querySelector("#vk-chat-input");
    messages = [{ role: "assistant", intent: "greeting" }];
    root.querySelector(".vk-chat-launcher").addEventListener("click", function () { setOpen(true); });
    root.querySelector(".vk-chat-close").addEventListener("click", function () { setOpen(false); });
    composeEl.addEventListener("submit", function (event) {
      event.preventDefault();
      var text = inputEl.value;
      inputEl.value = "";
      askText(text);
    });
    ticketEl.addEventListener("submit", sendTicket);
    ticketEl.querySelector(".vk-ticket-cancel").addEventListener("click", function () {
      ticketOpen = false;
      render();
      inputEl.focus();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !root.querySelector(".vk-chat-panel").hidden) setOpen(false);
    });
    VipKadLocale.on(function () { render(); });
    render();
  }

  function boot() {
    if (!global.VipKadLocale || !global.VipKadCatalog || document.querySelector(".vk-chat")) return;
    mount();
  }

  global.VipKadChat = {
    open: function () { if (root) setOpen(true); },
    close: function () { if (root) setOpen(false); },
    matchIntent: matchIntent
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window);
