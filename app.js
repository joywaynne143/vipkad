const WA_NUMBER = "60167799222";
const SAMPLE_APPS = {
  zh: [
    { id: "s1", name: "林美玲", phone: "012-345 6789", receipt: "R-20261127-088", spend: "RM 328", status: "pending" },
    { id: "s2", name: "Ahmad Faiz", phone: "017-222 1190", receipt: "R-20261127-091", spend: "RM 1,080", status: "pending" }
  ],
  en: [
    { id: "s1", name: "Lim Mei Ling", phone: "012-345 6789", receipt: "R-20261127-088", spend: "RM 328", status: "pending" },
    { id: "s2", name: "Ahmad Faiz", phone: "017-222 1190", receipt: "R-20261127-091", spend: "RM 1,080", status: "pending" }
  ],
  ms: [
    { id: "s1", name: "Lim Mei Ling", phone: "012-345 6789", receipt: "R-20261127-088", spend: "RM 328", status: "pending" },
    { id: "s2", name: "Ahmad Faiz", phone: "017-222 1190", receipt: "R-20261127-091", spend: "RM 1,080", status: "pending" }
  ]
};

const PRICES = {
  MY: {
    starter: { monthly: "RM 59", yearly: "RM 599", per: { monthly: "/月", yearly: "/年" }, setup: "开通费 RM 499", yearHint: "年付相当于送约 2 个月" },
    standard: { monthly: "RM 99", yearly: "RM 999", per: { monthly: "/月", yearly: "/年" }, setup: "开通费 RM 899", yearHint: "年付相当于送约 2 个月" },
    early: { setup: "开通费 RM 299", monthly: "其后按所选方案计" }
  },
  SG: {
    starter: { monthly: "S$19", yearly: "S$189", per: { monthly: "/mo", yearly: "/yr" }, setup: "Setup S$149", yearHint: "Annual billing saves about 2 months" },
    standard: { monthly: "S$29", yearly: "S$299", per: { monthly: "/mo", yearly: "/yr" }, setup: "Setup S$269", yearHint: "Annual billing saves about 2 months" },
    early: { setup: "Setup S$99", monthly: "Then billed on your chosen plan" }
  }
};

const I18N = {
  zh: {
    doc_title: "VipKad — 独立品牌会员系统，给马来西亚与新加坡的店家",
    nav_features: "卖点",
    nav_demo: "现场试用",
    nav_pricing: "收费",
    nav_faq: "常见问题",
    nav_cta: "WhatsApp 咨询",
    hero_kicker: "马来西亚 · 新加坡 · 中英马三语",
    hero_title: "你自己的品牌会员系统，顾客扫码 30 秒就能加入",
    hero_sub: "专为餐厅、咖啡馆、马来与清真餐饮、美容美发店打造。不用下载 App，不用换收银系统，1 到 3 天就能上线。会员资料 100% 属于你，不会被第三方平台转手。",
    hero_cta_demo: "马上试用演示",
    hero_cta_wa: "WhatsApp 了解上线",
    hero_trust: "已在新山和宫日料上线运行。前 3 到 5 家店享种子客户开通优惠。",
    card_bronze: "铜卡",
    card_black: "黑金卡",
    card_member: "会员",
    card_owner: "独立品牌",
    points_kicker: "为什么是独立系统",
    points_title: "六个老板一看就懂的理由",
    points_sub: "不是把客人赶到别人的平台，而是让你的店拥有自己的会员门面。",
    p1_t: "会员资料 100% 属于你",
    p1_d: "用第三方共享会员平台，客人名单留在别人手里，随时被拿去推别的店或转手你都不知道。用自己的独立系统，客户资料牢牢握在老板手上。",
    p2_t: "告别纸笔手抄，专业又省时",
    p2_d: "以前员工在柜台翻本子、拿笔帮客人记资料，忙起来手忙脚乱很狼狈，客人也得干等。现在客人坐着扫码 30 秒自助填好，店里看起来既专业又顺畅。",
    p3_t: "顾客不用下载 App",
    p3_d: "扫桌牌或收银台 QR 就能直接登记，没有下载门槛，愿意加入的客人多很多。",
    p4_t: "不用换掉现有收银系统",
    p4_d: "独立运作，不影响店里原本的收银流程，1 到 3 天就能上线。",
    p5_t: "防刷单，老板亲自把关",
    p5_d: "只有到店扫码才能填表，要上传收据照片，老板在手机后台点一下才生效。不怕外人乱填，也不怕员工私下乱开卡。",
    p6_t: "自己的品牌门面，直接留住客人",
    p6_d: "挂店铺自己的 logo、配色和网址，支持中、英、马来语。登记完直接连到店铺 WhatsApp，以后发优惠和新品通知都方便。",
    demo_kicker: "一分钟体验",
    demo_title: "先当顾客登记，再当老板一点批准",
    demo_sub: "不用安装任何东西。用你的手机，现在就可以走一遍完整流程。这是演示环境，不会保存真实资料。",
    tab_customer: "顾客端：扫码加入",
    tab_owner: "老板端：一点批准",
    demo_customer_title: "申请加入会员",
    demo_customer_hint: "模拟到店扫码后看到的登记页。可点「填入示例」快速体验。",
    demo_name: "姓名",
    demo_phone: "手机号码",
    demo_receipt: "收据号码",
    demo_photo: "收据照片",
    demo_photo_btn: "选择照片",
    demo_photo_empty: "未选择文件（演示可跳过）",
    demo_fill: "填入示例",
    demo_submit: "提交申请",
    demo_thanks_t: "申请已送出",
    demo_thanks_d: "店主会在手机后台审核。现在切换到「老板端」，点一下就能批准。",
    demo_go_owner: "打开老板端",
    demo_reset: "再试一次",
    demo_owner_title: "待审核申请",
    demo_owner_hint: "这就是老板在手机里看到的后台。点「批准」即可开通会员。",
    demo_empty: "目前没有待审核的申请。先到顾客端提交一笔试试。",
    status_pending: "待审核",
    status_approved: "已批准",
    status_rejected: "未通过",
    btn_approve: "批准",
    btn_reject: "拒绝",
    demo_receipt_label: "收据",
    demo_spend_label: "消费",
    showcase_kicker: "真实店铺在用",
    showcase_title: "和宫日料已经在新山上线",
    showcase_body: "Nagomiya Japanese Cuisine（和宫）位于柔佛新山 Taman Melodies。客人在店里扫码申请铜卡或黑金卡，上传收据后，老板在手机后台一点就能审批。这不是效果图，而是已经在营业中使用的独立品牌会员系统。",
    showcase_tag: "实店运行中",
    showcase_shop: "和宫 · Nagomiya",
    showcase_place: "Johor Bahru, Malaysia",
    showcase_note: "铜卡 / 黑金卡 · 中英双语 · 店内扫码登记",
    pricing_kicker: "清楚、好开口的价格",
    pricing_title: "给中小店准备的起步方案",
    pricing_sub: "比市面上常见的会员平台更轻、更好上手。价格可按马来西亚（令吉）或新加坡（新元）查看。",
    bill_monthly: "月付",
    bill_yearly: "年付更省",
    plan_starter: "入门版",
    plan_starter_for: "适合想先试试看的小店",
    plan_standard: "标准版",
    plan_standard_for: "餐厅、咖啡馆、美容美发店主推",
    plan_early: "种子客户",
    plan_early_for: "前 3 到 5 家店",
    rec: "最受欢迎",
    f_starter_1: "换上店铺 logo 与品牌色",
    f_starter_2: "中、英、马来语登记页",
    f_starter_3: "店内专属 QR 码",
    f_starter_4: "单据上传与手机审批后台",
    f_starter_5: "日常托管与维护",
    f_standard_1: "包含入门版全部功能",
    f_standard_2: "绑定店铺专属网址",
    f_standard_3: "多级别会员规则（如铜卡 / 黑卡）",
    f_standard_4: "可随时更换 QR 暗码，防止外泄",
    f_standard_5: "每月 1 到 2 次规则或文案微调",
    f_early_1: "开通费优惠，换取真实使用反馈",
    f_early_2: "可作为成功案例介绍给下一家店（需你同意）",
    f_early_3: "优先排期上线",
    f_early_4: "功能按入门或标准版选择",
    pricing_note: "价格为起步建议价，不含 SST / GST。正式合同条款以沟通确认为准。我们不会把你的会员资料拿到别的平台去卖。",
    faq_kicker: "老板常问",
    faq_title: "常见问题",
    q1: "一定要换掉现在的收银系统吗？",
    a1: "不用。VipKad 独立运作，不影响你现在的收银流程，1 到 3 天就能上线。",
    q2: "顾客一定要下载 App 吗？",
    a2: "不用。顾客用手机扫店里的 QR 就能打开网页登记，大约 30 秒。如果愿意，也可以把页面添加到主屏幕，看起来像普通 App。",
    q3: "会员资料在谁手里？",
    a3: "在你手里。这是店铺自己的独立系统，不是把客人名单交给共享平台。第三方平台如果被卖掉或拿去推其他店，你往往不会知道。",
    q4: "怎样防止乱申请或员工私下开卡？",
    a4: "只有到店扫码才能填表，申请时要上传收据照片，最后由老板在手机上点一下才生效。",
    q5: "支持马来语吗？适合马来与清真餐饮吗？",
    a5: "支持。顾客端和介绍页都有中文、英语和马来语（Bahasa Melayu）。很适合马来西亚以马来顾客为主的餐厅、咖啡馆，以及新山、吉隆坡和新加坡的各类中小店。",
    q6: "多久能上线？种子优惠怎么算？",
    a6: "一般 1 到 3 天。前 3 到 5 家店可享更低开通费，之后按你选择的入门版或标准版计算月费或年费。",
    final_title: "把会员留在自己店里，从这一周开始",
    final_sub: "先试用上面的演示，再把链接发给我们。我们会用你的店名、logo 和会员规则，尽快帮你做成能在店里扫码用的版本。",
    final_btn: "WhatsApp 告诉我店名，帮我估价上线",
    footer_left: "© 2026 VipKad（vipkad.com）。独立品牌会员系统，服务马来西亚与新加坡中小店家。",
    footer_right: "演示资料不会被保存。WhatsApp：+60 16-779 9222",
    wa_prefill: "你好，我在看 VipKad（vipkad.com）独立品牌会员系统，想了解怎样帮我的店上线。",
    ph_name: "例如：林美玲",
    ph_phone: "例如：012-345 6789",
    ph_receipt: "例如：R-8821"
  },
  en: {
    doc_title: "VipKad — Own-brand membership for shops in Malaysia & Singapore",
    nav_features: "Why VipKad",
    nav_demo: "Live demo",
    nav_pricing: "Pricing",
    nav_faq: "FAQ",
    nav_cta: "WhatsApp us",
    hero_kicker: "Malaysia · Singapore · Chinese, English & Bahasa Melayu",
    hero_title: "Your own-brand membership system. Guests scan a QR and join in 30 seconds.",
    hero_sub: "Built for restaurants, cafés, Malay and Halal F&B, salons and retailers. No app download, no POS replacement, live in 1–3 days. Customer data stays 100% yours — not locked inside a third-party platform that could be sold.",
    hero_cta_demo: "Try the live demo",
    hero_cta_wa: "WhatsApp to go live",
    hero_trust: "Already running at Nagomiya Japanese Cuisine in Johor Bahru. The first 3–5 shops get founding-customer setup pricing.",
    card_bronze: "Bronze",
    card_black: "Black Card",
    card_member: "Member",
    card_owner: "Your brand",
    points_kicker: "Why an independent system",
    points_title: "Six reasons owners understand at a glance",
    points_sub: "Don't pour your guests into someone else's platform. Give your shop its own membership front door.",
    p1_t: "Customer data is 100% yours",
    p1_d: "On a shared third-party membership platform, the guest list sits in someone else's hands. It can be sold or used to promote other shops without you knowing. With your own system, the data stays with the owner.",
    p2_t: "Ditch messy pen-and-paper sign-ups",
    p2_d: "Staff flipping notebooks and scribbling details at the counter looks messy, and guests are left waiting. Now they scan and fill the form themselves in 30 seconds — professional for the shop, faster for everyone.",
    p3_t: "No app to download",
    p3_d: "Guests scan the table or counter QR and sign up in the browser. No download barrier, so far more people actually join.",
    p4_t: "No need to replace your POS",
    p4_d: "It runs on its own, beside the cashier system you already use, and can go live in 1–3 days.",
    p5_t: "Anti-fraud, with owner approval",
    p5_d: "Only an in-store QR opens the form. Applicants upload a receipt photo, and membership starts only after you approve with one tap on your phone. No random online sign-ups, no quiet staff giveaways.",
    p6_t: "Your brand, and a direct WhatsApp line",
    p6_d: "Your logo, colours and domain, in Chinese, English and Bahasa Melayu. After sign-up, guests can go straight to your shop WhatsApp — easy for promotions and new-menu news.",
    demo_kicker: "One-minute walkthrough",
    demo_title: "Join as a guest, then approve as the owner",
    demo_sub: "Nothing to install. Use your phone and run the full flow now. This is a demo only — no real data is stored.",
    tab_customer: "Customer: Scan & join",
    tab_owner: "Owner: 1-tap approve",
    demo_customer_title: "Apply for membership",
    demo_customer_hint: "This is the sign-up page a guest sees after scanning in-store. Tap “Fill sample” to try it quickly.",
    demo_name: "Name",
    demo_phone: "Mobile number",
    demo_receipt: "Receipt number",
    demo_photo: "Receipt photo",
    demo_photo_btn: "Choose photo",
    demo_photo_empty: "No file chosen (optional in this demo)",
    demo_fill: "Fill sample",
    demo_submit: "Submit application",
    demo_thanks_t: "Application sent",
    demo_thanks_d: "The owner reviews this on their phone. Switch to the Owner view and approve it with one tap.",
    demo_go_owner: "Open owner view",
    demo_reset: "Try again",
    demo_owner_title: "Pending applications",
    demo_owner_hint: "This is the admin view on the owner's phone. Tap Approve to activate the membership.",
    demo_empty: "No pending applications. Submit one from the Customer view first.",
    status_pending: "Pending",
    status_approved: "Approved",
    status_rejected: "Declined",
    btn_approve: "Approve",
    btn_reject: "Decline",
    demo_receipt_label: "Receipt",
    demo_spend_label: "Spend",
    showcase_kicker: "Live in a real restaurant",
    showcase_title: "Already live at Nagomiya, Johor Bahru",
    showcase_body: "Nagomiya Japanese Cuisine (和宫) in Taman Melodies, Johor Bahru, is already using the system. Guests scan in-store to apply for Bronze or Black Card, upload a receipt, and the owner approves on her phone. This is a live shop, not a mock-up.",
    showcase_tag: "Live in store",
    showcase_shop: "和宫 · Nagomiya",
    showcase_place: "Johor Bahru, Malaysia",
    showcase_note: "Bronze / Black Card · Chinese & English · In-store QR sign-up",
    pricing_kicker: "Straightforward pricing",
    pricing_title: "Starter plans for independent shops",
    pricing_sub: "Lighter and easier to start than typical shared loyalty platforms. View prices in Malaysian Ringgit or Singapore Dollars.",
    bill_monthly: "Monthly",
    bill_yearly: "Yearly, save more",
    plan_starter: "Starter",
    plan_starter_for: "For shops that want to try it first",
    plan_standard: "Standard",
    plan_standard_for: "Best for restaurants, cafés and salons",
    plan_early: "Founding shops",
    plan_early_for: "First 3–5 shops",
    rec: "Most popular",
    f_starter_1: "Your shop logo and brand colours",
    f_starter_2: "Chinese, English and Bahasa Melayu sign-up",
    f_starter_3: "In-store QR code",
    f_starter_4: "Receipt upload and phone approval admin",
    f_starter_5: "Hosting and day-to-day upkeep",
    f_standard_1: "Everything in Starter",
    f_standard_2: "Your own membership web address",
    f_standard_3: "Multi-tier rules (e.g. Bronze / Black Card)",
    f_standard_4: "QR access key you can rotate if it leaks",
    f_standard_5: "1–2 copy or rule tweaks each month",
    f_early_1: "Lower setup fee, in exchange for candid feedback",
    f_early_2: "We may mention your shop as a case study (only with your OK)",
    f_early_3: "Priority go-live scheduling",
    f_early_4: "Choose Starter or Standard features",
    pricing_note: "Introductory pricing, excluding SST / GST. Final terms are confirmed in writing. We do not sell or move your member data to other platforms.",
    faq_kicker: "Owners ask",
    faq_title: "Frequently asked questions",
    q1: "Do I have to replace my current POS?",
    a1: "No. VipKad runs independently and does not change your cashier flow. Most shops can go live in 1–3 days.",
    q2: "Do customers have to download an app?",
    a2: "No. They scan the in-store QR and sign up in the browser in about 30 seconds. They can also add the page to their home screen if they want an icon.",
    q3: "Who owns the member data?",
    a3: "You do. This is your shop's own system, not a shared platform. If a third-party membership company is sold or uses the list to promote other shops, you often never hear about it.",
    q4: "How do you stop fake sign-ups or staff giving out cards?",
    a4: "Only the in-store QR opens the form, a receipt photo is required, and membership starts only after you approve it on your phone.",
    q5: "Is Bahasa Melayu supported? Does it suit Malay and Halal F&B?",
    a5: "Yes. The guest page and this site are in Chinese, English and Bahasa Melayu — a natural fit for Malay-majority restaurants and cafés in Malaysia, as well as shops in JB, KL and Singapore.",
    q6: "How fast can we go live, and what is the founding offer?",
    a6: "Usually 1–3 days. The first 3–5 shops get a lower setup fee, then monthly or yearly billing on the Starter or Standard plan you choose.",
    final_title: "Keep your members in your own shop, starting this week",
    final_sub: "Try the demo above, then message us with your shop name. We'll put your logo, colours and membership rules into a version you can scan in-store.",
    final_btn: "WhatsApp your shop name and get a go-live quote",
    footer_left: "© 2026 VipKad (vipkad.com). Own-brand membership for small and mid-size shops in Malaysia and Singapore.",
    footer_right: "Demo data is not stored. WhatsApp: +60 16-779 9222",
    wa_prefill: "Hi, I was looking at VipKad (vipkad.com), the own-brand membership system, and would like to know how to get it set up for my shop.",
    ph_name: "e.g. Lim Mei Ling",
    ph_phone: "e.g. 012-345 6789",
    ph_receipt: "e.g. R-8821"
  },
  ms: {
    doc_title: "VipKad — Sistem keahlian jenama sendiri untuk kedai di Malaysia & Singapura",
    nav_features: "Kelebihan",
    nav_demo: "Cuba demo",
    nav_pricing: "Harga",
    nav_faq: "Soalan lazim",
    nav_cta: "WhatsApp kami",
    hero_kicker: "Malaysia · Singapura · Bahasa Melayu, Inggeris & Cina",
    hero_title: "Sistem keahlian jenama sendiri. Pelanggan imbas QR, daftar dalam 30 saat.",
    hero_sub: "Untuk restoran, kafe, premis F&B Melayu dan Halal, salun dan runcit. Tak perlu muat turun app, tak perlu tukar sistem POS, boleh naik talian dalam 1–3 hari. Data pelanggan milik anda 100% — bukan terkunci dalam platform pihak ketiga yang boleh dijual sewaktu-waktu.",
    hero_cta_demo: "Cuba demo sekarang",
    hero_cta_wa: "WhatsApp untuk mula",
    hero_trust: "Sudah berjalan di Nagomiya Japanese Cuisine, Johor Bahru. 3–5 kedai pertama dapat harga pemasangan rakan niaga awal.",
    card_bronze: "Kad Gangsa",
    card_black: "Kad Hitam",
    card_member: "Ahli",
    card_owner: "Jenama anda",
    points_kicker: "Kenapa sistem sendiri",
    points_title: "Enam sebab yang mudah difahami pemilik kedai",
    points_sub: "Jangan hantar pelanggan ke platform orang lain. Berikan kedai anda pintu keahlian sendiri.",
    p1_t: "Data pelanggan milik anda 100%",
    p1_d: "Kalau guna platform keahlian pihak ketiga yang dikongsi, senarai pelanggan ada di tangan orang lain. Ia boleh dijual atau digunakan untuk promosi kedai lain tanpa anda tahu. Dengan sistem sendiri, data kekal dengan tuan kedai.",
    p2_t: "Tinggalkan daftar kertas dan pen yang merata",
    p2_d: "Staf terpaksa flip buku dan tulis data di kaunter nampak kurang profesional, pelanggan pun terpaksa tunggu. Sekarang pelanggan imbas dan isi sendiri dalam 30 saat — nampak kemas, jimat masa semua orang.",
    p3_t: "Tak perlu muat turun app",
    p3_d: "Imbas QR di meja atau kaunter, terus daftar dalam pelayar. Tiada halangan muat turun, jadi lebih ramai pelanggan yang sudi menyertai.",
    p4_t: "Tak perlu tukar sistem POS sedia ada",
    p4_d: "Berjalan sendiri di samping sistem kashier anda, dan boleh naik talian dalam 1–3 hari.",
    p5_t: "Elak penipuan, pemilik yang luluskan",
    p5_d: "Hanya QR di kedai yang buka borang. Pemohon muat naik gambar resit, dan keahlian hanya aktif selepas anda luluskan dengan satu ketikan di telefon. Elak daftar ramai-ramai dari luar, elak staf buka kad secara senyap.",
    p6_t: "Jenama sendiri, terus ke WhatsApp kedai",
    p6_d: "Logo, warna dan domain kedai anda, dalam Bahasa Melayu, Inggeris dan Cina. Lepas daftar, pelanggan boleh terus ke WhatsApp kedai — mudah untuk hantar promosi dan menu baharu.",
    demo_kicker: "Cuba dalam satu minit",
    demo_title: "Daftar sebagai pelanggan, kemudian luluskan sebagai pemilik",
    demo_sub: "Tak perlu pasang apa-apa. Guna telefon anda dan cuba aliran penuh sekarang. Ini demo sahaja — data sebenar tidak disimpan.",
    tab_customer: "Pelanggan: Imbas & sertai",
    tab_owner: "Pemilik: Luluskan satu ketik",
    demo_customer_title: "Mohon keahlian",
    demo_customer_hint: "Ini halaman yang pelanggan nampak lepas imbas QR di kedai. Ketik “Isi contoh” untuk cuba cepat.",
    demo_name: "Nama",
    demo_phone: "Nombor telefon",
    demo_receipt: "Nombor resit",
    demo_photo: "Gambar resit",
    demo_photo_btn: "Pilih gambar",
    demo_photo_empty: "Tiada fail dipilih (pilihan dalam demo ini)",
    demo_fill: "Isi contoh",
    demo_submit: "Hantar permohonan",
    demo_thanks_t: "Permohonan dihantar",
    demo_thanks_d: "Pemilik akan semak di telefon. Tukar ke paparan Pemilik dan luluskan dengan satu ketikan.",
    demo_go_owner: "Buka paparan pemilik",
    demo_reset: "Cuba lagi",
    demo_owner_title: "Permohonan menunggu semakan",
    demo_owner_hint: "Ini paparan admin di telefon pemilik. Ketik Luluskan untuk aktifkan keahlian.",
    demo_empty: "Tiada permohonan menunggu. Hantar satu dari paparan Pelanggan dahulu.",
    status_pending: "Menunggu",
    status_approved: "Diluluskan",
    status_rejected: "Ditolak",
    btn_approve: "Luluskan",
    btn_reject: "Tolak",
    demo_receipt_label: "Resit",
    demo_spend_label: "Belanja",
    showcase_kicker: "Sudah digunakan di kedai sebenar",
    showcase_title: "Sudah berjalan di Nagomiya, Johor Bahru",
    showcase_body: "Nagomiya Japanese Cuisine (和宫) di Taman Melodies, Johor Bahru, sudah menggunakan sistem ini. Pelanggan imbas di kedai untuk mohon Kad Gangsa atau Kad Hitam, muat naik resit, dan pemilik luluskan di telefon. Ini kedai yang sedang beroperasi, bukan sekadar gambar contoh.",
    showcase_tag: "Sedang digunakan",
    showcase_shop: "和宫 · Nagomiya",
    showcase_place: "Johor Bahru, Malaysia",
    showcase_note: "Kad Gangsa / Kad Hitam · Cina & Inggeris · Daftar imbas QR di kedai",
    pricing_kicker: "Harga yang mudah dijelaskan",
    pricing_title: "Pelan permulaan untuk kedai kecil dan sederhana",
    pricing_sub: "Lebih ringan dan mudah bermula berbanding platform keahlian kongsi yang biasa. Lihat harga dalam Ringgit Malaysia atau Dolar Singapura.",
    bill_monthly: "Bulanan",
    bill_yearly: "Tahunan, lebih jimat",
    plan_starter: "Asas",
    plan_starter_for: "Sesuai untuk kedai yang mahu cuba dulu",
    plan_standard: "Standard",
    plan_standard_for: "Pilihan utama untuk restoran, kafe dan salun",
    plan_early: "Rakan niaga awal",
    plan_early_for: "3–5 kedai pertama",
    rec: "Paling popular",
    f_starter_1: "Logo dan warna jenama kedai anda",
    f_starter_2: "Halaman daftar Bahasa Melayu, Inggeris dan Cina",
    f_starter_3: "Kod QR khas di kedai",
    f_starter_4: "Muat naik resit dan panel lulus di telefon",
    f_starter_5: "Hos dan penyelenggaraan harian",
    f_standard_1: "Semua dalam pelan Asas",
    f_standard_2: "Alamat web keahlian jenama anda sendiri",
    f_standard_3: "Peraturan pelbagai peringkat (contoh Kad Gangsa / Kad Hitam)",
    f_standard_4: "Kod QR boleh ditukar jika bocor",
    f_standard_5: "1–2 pindaan peraturan atau teks setiap bulan",
    f_early_1: "Caj pemasangan lebih rendah, sebagai ganti maklum balas jujur",
    f_early_2: "Kedai anda boleh dijadikan contoh kejayaan (hanya dengan kebenaran anda)",
    f_early_3: "Giliran naik talian diutamakan",
    f_early_4: "Pilih ciri pelan Asas atau Standard",
    pricing_note: "Harga permulaan, tidak termasuk SST / GST. Terma muktamad disahkan secara bertulis. Kami tidak menjual atau memindahkan data ahli anda ke platform lain.",
    faq_kicker: "Soalan pemilik kedai",
    faq_title: "Soalan lazim",
    q1: "Perlu ke saya tukar sistem POS sekarang?",
    a1: "Tidak. VipKad berjalan sendiri dan tidak mengubah cara kashier anda. Kebanyakan kedai boleh naik talian dalam 1–3 hari.",
    q2: "Pelanggan wajib muat turun app ke?",
    a2: "Tidak. Mereka imbas QR di kedai dan daftar dalam pelayar dalam lebih kurang 30 saat. Kalau nak, mereka juga boleh tambah halaman ke skrin utama.",
    q3: "Data ahli milik siapa?",
    a3: "Milik anda. Ini sistem kedai anda sendiri, bukan platform kongsi. Kalau syarikat keahlian pihak ketiga dijual atau guna senarai itu untuk promosi kedai lain, selalunya anda langsung tak tahu.",
    q4: "Macam mana nak elak permohonan palsu atau staf buka kad sendiri?",
    a4: "Hanya QR di kedai yang buka borang, gambar resit diperlukan, dan keahlian hanya aktif selepas anda luluskan di telefon.",
    q5: "Ada Bahasa Melayu? Sesuai ke untuk F&B Melayu dan Halal?",
    a5: "Ada. Halaman pelanggan dan laman ini dalam Bahasa Melayu, Inggeris dan Cina — sesuai untuk restoran dan kafe Melayu di Malaysia, serta kedai di JB, KL dan Singapura.",
    q6: "Berapa lama nak naik talian, dan apa tawaran rakan niaga awal?",
    a6: "Biasanya 1–3 hari. 3–5 kedai pertama dapat caj pemasangan yang lebih rendah, kemudian yuran bulanan atau tahunan mengikut pelan Asas atau Standard yang anda pilih.",
    final_title: "Simpan ahli dalam kedai anda sendiri, mula minggu ini",
    final_sub: "Cuba demo di atas, kemudian WhatsApp nama kedai anda. Kami akan letakkan logo, warna dan peraturan keahlian anda ke dalam versi yang boleh diimbas di kedai.",
    final_btn: "WhatsApp nama kedai untuk dapatkan sebut harga",
    footer_left: "© 2026 VipKad (vipkad.com). Sistem keahlian jenama sendiri untuk kedai kecil dan sederhana di Malaysia dan Singapura.",
    footer_right: "Data demo tidak disimpan. WhatsApp: +60 16-779 9222",
    wa_prefill: "Hai, saya baru tengok VipKad (vipkad.com), sistem keahlian jenama sendiri, nak tanya macam mana nak pasang untuk kedai saya.",
    ph_name: "cth. Siti Nurhaliza",
    ph_phone: "cth. 012-345 6789",
    ph_receipt: "cth. R-8821"
  }
};

const state = {
  lang: "zh",
  currency: "MY",
  billing: "yearly",
  view: "customer",
  submitted: false,
  apps: [],
  photoName: ""
};

function t(key) {
  return (I18N[state.lang] && I18N[state.lang][key]) || I18N.en[key] || key;
}

function waLink() {
  return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(t("wa_prefill"));
}

function applyLang() {
  const dict = I18N[state.lang] || I18N.en;
  document.documentElement.lang = state.lang === "zh" ? "zh-Hans" : state.lang === "ms" ? "ms" : "en";
  document.title = dict.doc_title;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key] != null) el.textContent = dict[key];
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (dict[key] != null) el.setAttribute("placeholder", dict[key]);
  });
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.lang === state.lang));
  });
  document.querySelectorAll("a[data-wa]").forEach((a) => {
    a.href = waLink();
  });
  renderPrices();
  renderOwnerList();
  const fileLabel = document.getElementById("photo-label");
  if (fileLabel && !state.photoName) fileLabel.textContent = t("demo_photo_empty");
}

function applyCurrency() {
  document.querySelectorAll(".cur-btn").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.currency === state.currency));
  });
  renderPrices();
}

function renderPrices() {
  const table = PRICES[state.currency];
  const cycle = state.billing;
  const lang = state.lang;
  const perOverride = {
    zh: { monthly: "/月", yearly: "/年" },
    en: { monthly: "/mo", yearly: "/yr" },
    ms: { monthly: "/bulan", yearly: "/tahun" }
  };
  const setupPrefix = { zh: "", en: "", ms: "" };
  const yearHints = {
    zh: "年付相当于送约 2 个月",
    en: "Annual billing saves about 2 months",
    ms: "Bayaran tahunan jimat lebih kurang 2 bulan"
  };
  const earlyRest = {
    MY: { zh: "其后按所选方案计", en: "Then billed on your chosen plan", ms: "Kemudian mengikut pelan yang dipilih" },
    SG: { zh: "其后按所选方案计", en: "Then billed on your chosen plan", ms: "Kemudian mengikut pelan yang dipilih" }
  };

  ["starter", "standard"].forEach((plan) => {
    const p = table[plan];
    const priceEl = document.getElementById("price-" + plan);
    const perEl = document.getElementById("per-" + plan);
    const setupEl = document.getElementById("setup-" + plan);
    if (priceEl) priceEl.textContent = p[cycle];
    if (perEl) perEl.textContent = perOverride[lang][cycle];
    if (setupEl) {
      setupEl.textContent = p.setup + (cycle === "yearly" ? " · " + yearHints[lang] : "");
    }
  });
  const earlySetup = document.getElementById("setup-early");
  const earlyPrice = document.getElementById("price-early");
  const earlyPer = document.getElementById("per-early");
  if (earlyPrice) earlyPrice.textContent = table.early.setup;
  if (earlyPer) earlyPer.textContent = "";
  if (earlySetup) earlySetup.textContent = earlyRest[state.currency][lang];
}

function setBilling(cycle) {
  state.billing = cycle;
  document.querySelectorAll(".bill-btn").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.bill === cycle));
  });
  renderPrices();
}

function setView(view) {
  state.view = view;
  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.view === view));
  });
  document.getElementById("view-customer").hidden = view !== "customer";
  document.getElementById("view-owner").hidden = view !== "owner";
}

function resetApps() {
  state.apps = SAMPLE_APPS[state.lang].map((a) => ({ ...a }));
  state.submitted = false;
  state.photoName = "";
}

function renderOwnerList() {
  const list = document.getElementById("app-list");
  const empty = document.getElementById("app-empty");
  if (!list) return;
  list.innerHTML = "";
  const apps = state.apps;
  if (!apps.length) {
    if (empty) empty.hidden = false;
    return;
  }
  if (empty) empty.hidden = true;
  apps.forEach((app) => {
    const el = document.createElement("article");
    el.className = "app-card";
    const statusClass = app.status === "approved" ? "ok" : app.status === "rejected" ? "no" : "";
    const statusLabel = app.status === "approved" ? t("status_approved") : app.status === "rejected" ? t("status_rejected") : t("status_pending");
    el.innerHTML =
      '<div class="row"><div class="who"></div><span class="badge ' + statusClass + '"></span></div>' +
      '<div class="meta"></div>' +
      (app.status === "pending" ? '<div class="app-actions"><button class="btn btn-dark" data-act="approve"></button><button class="btn btn-ghost" data-act="reject"></button></div>' : "");
    el.querySelector(".who").textContent = app.name;
    el.querySelector(".badge").textContent = statusLabel;
    el.querySelector(".meta").textContent =
      app.phone + " · " + t("demo_receipt_label") + " " + app.receipt + (app.spend ? " · " + t("demo_spend_label") + " " + app.spend : "");
    const approveBtn = el.querySelector('[data-act="approve"]');
    const rejectBtn = el.querySelector('[data-act="reject"]');
    if (approveBtn) {
      approveBtn.textContent = t("btn_approve");
      approveBtn.addEventListener("click", () => {
        app.status = "approved";
        renderOwnerList();
      });
    }
    if (rejectBtn) {
      rejectBtn.textContent = t("btn_reject");
      rejectBtn.addEventListener("click", () => {
        app.status = "rejected";
        renderOwnerList();
      });
    }
    list.appendChild(el);
  });
}

function showCustomerForm(showForm) {
  document.getElementById("form-panel").hidden = !showForm;
  document.getElementById("thanks-panel").hidden = showForm;
  state.submitted = !showForm;
}

function fillSample() {
  const samples = {
    zh: { name: "陈晓雯", phone: "016-888 2210", receipt: "R-20261127-118" },
    en: { name: "Sarah Tan", phone: "016-888 2210", receipt: "R-20261127-118" },
    ms: { name: "Nur Aisyah", phone: "016-888 2210", receipt: "R-20261127-118" }
  };
  const s = samples[state.lang];
  document.getElementById("f-name").value = s.name;
  document.getElementById("f-phone").value = s.phone;
  document.getElementById("f-receipt").value = s.receipt;
}

function submitDemo(ev) {
  ev.preventDefault();
  const name = document.getElementById("f-name").value.trim();
  const phone = document.getElementById("f-phone").value.trim();
  const receipt = document.getElementById("f-receipt").value.trim();
  if (!name || !phone || !receipt) return;
  state.apps.unshift({
    id: "u-" + Date.now(),
    name,
    phone,
    receipt,
    spend: "",
    status: "pending"
  });
  showCustomerForm(false);
  renderOwnerList();
}

function boot() {
  const params = new URLSearchParams(location.search);
  const savedLang = params.get("lang") || localStorage.getItem("vipkad-lang");
  const savedCur = params.get("cur") || localStorage.getItem("vipkad-cur");
  if (savedLang && I18N[savedLang]) state.lang = savedLang;
  if (savedCur && PRICES[savedCur]) state.currency = savedCur;

  resetApps();
  applyLang();
  applyCurrency();
  setBilling(state.billing);
  setView("customer");
  showCustomerForm(true);

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.lang = btn.dataset.lang;
      localStorage.setItem("vipkad-lang", state.lang);
      applyLang();
    });
  });
  document.querySelectorAll(".cur-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.currency = btn.dataset.currency;
      localStorage.setItem("vipkad-cur", state.currency);
      applyCurrency();
    });
  });
  document.querySelectorAll(".bill-btn").forEach((btn) => {
    btn.addEventListener("click", () => setBilling(btn.dataset.bill));
  });
  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.addEventListener("click", () => setView(btn.dataset.view));
  });
  document.getElementById("fill-sample").addEventListener("click", fillSample);
  document.getElementById("demo-form").addEventListener("submit", submitDemo);
  document.getElementById("go-owner").addEventListener("click", () => setView("owner"));
  document.getElementById("try-again").addEventListener("click", () => {
    document.getElementById("demo-form").reset();
    state.photoName = "";
    document.getElementById("photo-label").textContent = t("demo_photo_empty");
    showCustomerForm(true);
  });
  const file = document.getElementById("f-photo");
  file.addEventListener("change", () => {
    state.photoName = file.files && file.files[0] ? file.files[0].name : "";
    document.getElementById("photo-label").textContent = state.photoName || t("demo_photo_empty");
  });
}

document.addEventListener("DOMContentLoaded", boot);
