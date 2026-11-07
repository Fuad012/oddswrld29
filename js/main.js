/* ==========================================================================
   ODDWRLD storefront — vanilla JS, no build step, no dependencies.
   Pages are driven by <body data-page="home|shop|product|cart|info">.
   Catalogue + brand settings live in js/data.js.
   ========================================================================== */
(function () {
  "use strict";

  var D = window.ODDWRLD, C = D.config, P = D.products;
  var IMG = "assets/img/";
  var root = document.documentElement;
  root.classList.add("js");

  /* ---------- helpers ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var money = function (n) { return C.currency + Number(n).toLocaleString("en-NG"); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var byId = function (id) { for (var i = 0; i < P.length; i++) if (P[i].id === id) return P[i]; return null; };
  var pct = function (p) { return p.was ? Math.round((1 - p.price / p.was) * 100) : 0; };
  var qs = function (k) { try { return new URLSearchParams(location.search).get(k); } catch (e) { return null; } };

  var ICON = {
    menu: '<svg viewBox="0 0 24 24"><path d="M3 7h18M3 12h18M3 17h18"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/></svg>',
    bag: '<svg viewBox="0 0 24 24"><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6.5a3 3 0 016 0V8"/></svg>',
    left: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
    right: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
    pin: '<svg viewBox="0 0 24 24"><path d="M12 21s7-6.2 7-11.5a7 7 0 10-14 0C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>'
  };

  /* ---------- storage (safe if localStorage is blocked) ---------- */
  var mem = {};
  var CART_KEY = "oddwrld.cart.v1";
  function readCart() {
    var raw;
    try { raw = JSON.parse(localStorage.getItem(CART_KEY)); } catch (e) { raw = mem.cart; }
    return (Array.isArray(raw) ? raw : []).filter(function (l) { return l && byId(l.id) && l.qty > 0; });
  }
  function writeCart(c) {
    mem.cart = c;
    try { localStorage.setItem(CART_KEY, JSON.stringify(c)); } catch (e) {}
    paintCount(true);
  }
  function cartCount() { return readCart().reduce(function (n, l) { return n + l.qty; }, 0); }
  function cartTotal() { return readCart().reduce(function (n, l) { return n + l.qty * byId(l.id).price; }, 0); }
  function addToCart(id, size, qty) {
    var c = readCart(), hit = null;
    c.forEach(function (l) { if (l.id === id && l.size === size) hit = l; });
    if (hit) hit.qty = Math.min(10, hit.qty + qty); else c.push({ id: id, size: size, qty: qty });
    writeCart(c);
  }
  function paintCount(bump) {
    var n = cartCount();
    $$(".count").forEach(function (el) {
      el.textContent = n; el.hidden = n === 0;
      if (bump) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
    });
  }

  /* ---------- shared header + footer ---------- */
  function renderChrome() {
    var current = qs("c");
    var links = C.menu.map(function (m) {
      var on = m.href.indexOf("c=" + current) > -1 && current || (!current && m.href === "shop.html" && document.body.dataset.page === "shop");
      return '<a href="' + m.href + '"' + (on ? ' aria-current="page"' : "") + ">" + esc(m.label) + "</a>";
    }).join("");
    var ann = C.announcements.map(function (t, i) { return '<p class="' + (i === 0 ? "on" : "") + '">' + esc(t) + "</p>"; }).join("");

    var top = $("#site-top");
    if (top) top.innerHTML =
      '<a class="skip" href="#main">Skip to content</a>' +
      '<div class="ann" role="region" aria-label="Announcements">' + ann + "</div>" +
      '<header class="hdr" id="hdr"><div class="hdr__bar">' +
        '<div class="hdr__left"><button class="icon-btn menu-btn" id="menuBtn" aria-label="Open menu" aria-expanded="false" aria-controls="mnav">' + ICON.menu + "</button>" +
        '<nav class="nav" aria-label="Main">' + links + "</nav></div>" +
        '<a class="hdr__logo" href="index.html" aria-label="ODDWRLD home"><img src="' + IMG + 'logo.png" alt="ODDWRLD" width="729" height="274"></a>' +
        '<div class="hdr__right">' +
          '<a class="icon-btn" href="shop.html#search" aria-label="Search">' + ICON.search + "</a>" +
          '<a class="icon-btn" href="cart.html" aria-label="Bag">' + ICON.bag + '<span class="count" hidden>0</span></a>' +
        "</div></div>" +
        '<nav class="mnav" id="mnav" aria-label="Menu"><div class="mnav__in">' + links + '<a href="index.html">Home</a></div></nav>' +
      "</header>";

    var bot = $("#site-foot");
    if (bot) {
      var tick = ""; for (var i = 0; i < 6; i++) tick += "<span>ODDWRLD</span><span>No Swag, No Motion.</span>";
      var year = new Date().getFullYear();
      var catLinks = [["New In", "new"], ["Tees", "tees"], ["Tops", "tops"], ["Shirts", "shirts"], ["Sets", "sets"], ["Sale", "sale"]]
        .map(function (c) { return '<li><a href="shop.html?c=' + c[1] + '">' + c[0] + "</a></li>"; }).join("");
      bot.innerHTML =
        '<div class="marquee" aria-hidden="true"><div class="marquee__track">' + tick + tick + "</div></div>" +
        '<section class="brand dark"><div class="brand__in">' +
          '<img src="' + IMG + 'logo.png" alt="ODDWRLD" width="729" height="274" loading="lazy">' +
          "<h2>No Swag, No Motion.</h2>" +
          '<a class="btn btn--light" href="shop.html">Discover</a></div></section>' +
        '<footer class="foot"><div class="foot__in">' +
          '<div><h4>Get help</h4><ul>' +
            '<li><a href="info.html#care">Customer Care</a></li><li><a href="info.html#shipping">Shipping</a></li>' +
            '<li><a href="info.html#payments">Orders &amp; Payments</a></li><li><a href="info.html#returns">Returns</a></li>' +
            '<li><a href="info.html#faq">FAQ</a></li><li><a href="cart.html">My Bag</a></li></ul></div>' +
          "<div><h4>Collections</h4><ul>" + catLinks + "</ul></div>" +
          '<div class="foot__social"><h4>Social</h4><ul>' +
            '<li><a href="' + esc(C.instagram) + '" target="_blank" rel="noopener">Instagram</a></li>' +
            '<li><a href="' + esc(C.tiktok) + '" target="_blank" rel="noopener">TikTok</a></li>' +
            '<li><a href="https://wa.me/' + esc(C.whatsapp) + '" target="_blank" rel="noopener">WhatsApp</a></li></ul></div>' +
          '<div><span class="loc">' + ICON.pin + "Nigeria</span></div>" +
        "</div>" +
        '<div class="foot__bar"><span>© ' + year + " ODDWRLD</span>" +
          '<ul><li><a href="info.html#shipping">Shipping</a></li><li><a href="info.html#returns">Returns</a></li><li><a href="info.html#faq">FAQ</a></li></ul></div></footer>';
    }
    paintCount(false);
  }

  function initChrome() {
    // rotating announcement
    var msgs = $$(".ann p");
    if (msgs.length > 1) {
      var i = 0;
      setInterval(function () { msgs[i].classList.remove("on"); i = (i + 1) % msgs.length; msgs[i].classList.add("on"); }, 4200);
    }
    // sticky shadow
    var hdr = $("#hdr");
    if (hdr) {
      var tick = false;
      var onScroll = function () {
        if (tick) return; tick = true;
        requestAnimationFrame(function () { hdr.classList.toggle("is-stuck", window.scrollY > 40); tick = false; });
      };
      window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
    }
    // mobile menu (expands in the header, pushes content down — no overlay)
    var btn = $("#menuBtn"), nav = $("#mnav");
    if (btn && nav) {
      var set = function (open) {
        nav.classList.toggle("open", open);
        btn.setAttribute("aria-expanded", String(open));
        btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        btn.innerHTML = open ? ICON.close : ICON.menu;
      };
      btn.addEventListener("click", function () { set(!nav.classList.contains("open")); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
      window.matchMedia("(min-width: 900px)").addEventListener("change", function (m) { if (m.matches) set(false); });
    }
  }

  /* ---------- product card + rails ---------- */
  function priceHtml(p) { return p.was ? "<s>" + money(p.was) + '</s><span class="now">' + money(p.price) + "</span>" : money(p.price); }
  function card(p) {
    var href = "product.html?id=" + encodeURIComponent(p.id), off = pct(p);
    return '<article class="card">' +
      '<a class="card__media" href="' + href + '" tabindex="-1" aria-hidden="true">' +
        (off ? '<span class="badge">-' + off + "%</span>" : "") +
        '<img class="main" loading="lazy" decoding="async" src="' + IMG + p.img + '" alt="" width="1000" height="1250">' +
        (p.hover ? '<img class="alt" loading="lazy" decoding="async" src="' + IMG + p.hover + '" alt="">' : "") +
      "</a>" +
      '<h3 class="card__title"><a href="' + href + '">' + esc(p.name) + "</a></h3>" +
      '<p class="price">' + priceHtml(p) + "</p></article>";
  }
  function pick(key) {
    return P.filter(function (p) {
      if (key === "new") return p.tag === "new";
      if (key === "sale") return !!p.was;
      if (key === "best") return !!p.best;
      if (key === "all" || !key) return true;
      return p.cat === key;
    });
  }

  function initRails() {
    $$("[data-rail]").forEach(function (sec) {
      var rail = $(".rail", sec), items = pick(sec.dataset.rail);
      if (sec.dataset.exclude) items = items.filter(function (p) { return p.id !== sec.dataset.exclude; });
      if (sec.dataset.limit) items = items.slice(0, +sec.dataset.limit);
      if (!items.length) { sec.hidden = true; return; }
      rail.innerHTML = items.map(card).join("");
      rail.style.setProperty("--cols", Math.min(4, items.length));
      var arrows = $(".arrows", sec), prev = $("[data-dir='-1']", sec), next = $("[data-dir='1']", sec);
      var sync = function () {
        var max = rail.scrollWidth - rail.clientWidth;
        if (prev) prev.disabled = rail.scrollLeft <= 2;
        if (next) next.disabled = rail.scrollLeft >= max - 2;
        if (arrows) arrows.classList.toggle("is-off", max <= 2);
      };
      [prev, next].forEach(function (b) {
        if (!b) return;
        b.addEventListener("click", function () {
          var step = (rail.firstElementChild ? rail.firstElementChild.getBoundingClientRect().width + 12 : 200) * (window.innerWidth >= 900 ? 2 : 1.6);
          rail.scrollBy({ left: step * +b.dataset.dir, behavior: "smooth" });
        });
      });
      rail.addEventListener("scroll", function () { requestAnimationFrame(sync); }, { passive: true });
      window.addEventListener("resize", sync); sync();
    });
  }

  /* ---------- home ---------- */
  function initHome() {
    var chips = $(".chips");
    if (chips) chips.innerHTML = C.categories.map(function (c) {
      return '<a class="chip" href="shop.html?c=' + c.key + '"><img src="' + IMG + c.thumb + '" alt="" width="36" height="36" loading="lazy">' + esc(c.label) + "</a>";
    }).join("");
    initRails();

    var form = $("#newsletter");
    if (form) {
      var msg = $("#newsMsg", form.parentNode), email = $("input[type=email]", form);
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var v = email.value.trim();
        if (C.newsletterEndpoint) {
          msg.textContent = "Signing you up…";
          fetch(C.newsletterEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ email: v }) })
            .then(function (r) { if (!r.ok) throw 0; msg.textContent = "You're on the list. Welcome to ODDWRLD."; form.reset(); })
            .catch(function () { msg.textContent = "Something went wrong. Please try again."; });
        } else {
          msg.textContent = "Opening your email app to confirm…";
          location.href = "mailto:" + C.email + "?subject=" + encodeURIComponent("Add me to the ODDWRLD list") + "&body=" + encodeURIComponent("Please add " + v + " to the ODDWRLD list.");
        }
      });
    }
  }

  /* ---------- shop ---------- */
  var FILTERS = [["all", "All"], ["new", "New In"], ["sale", "Sale"], ["tees", "Tees"], ["tops", "Tops"], ["shirts", "Shirts"], ["sets", "Sets"]];
  function initShop() {
    var state = { c: qs("c") || "all", q: qs("q") || "", sort: "featured" };
    if (!FILTERS.some(function (f) { return f[0] === state.c; })) state.c = "all";
    var bar = $("#filters"), grid = $("#grid"), title = $("#shopTitle"), count = $("#shopCount"), search = $("#q"), sort = $("#sort"), empty = $("#empty");
    search.value = state.q;
    bar.innerHTML = FILTERS.map(function (f) { return '<button class="fbtn" data-k="' + f[0] + '" aria-pressed="false">' + f[1] + "</button>"; }).join("");

    function paint() {
      var list = pick(state.c).filter(function (p) {
        var q = state.q.trim().toLowerCase();
        return !q || (p.name + " " + p.colour + " " + p.cat).toLowerCase().indexOf(q) > -1;
      });
      if (state.sort === "low") list.sort(function (a, b) { return a.price - b.price; });
      if (state.sort === "high") list.sort(function (a, b) { return b.price - a.price; });
      $$(".fbtn", bar).forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.k === state.c)); });
      var label = FILTERS.filter(function (f) { return f[0] === state.c; })[0][1];
      title.textContent = state.c === "all" ? "Shop All" : label;
      document.title = title.textContent + " — ODDWRLD";
      count.textContent = list.length + (list.length === 1 ? " piece" : " pieces");
      grid.innerHTML = list.map(card).join("");
      empty.hidden = list.length > 0; grid.hidden = list.length === 0;
      try {
        var u = new URL(location.href);
        state.c === "all" ? u.searchParams.delete("c") : u.searchParams.set("c", state.c);
        state.q ? u.searchParams.set("q", state.q) : u.searchParams.delete("q");
        history.replaceState(null, "", u.pathname + u.search + u.hash);
      } catch (e) {}
    }
    bar.addEventListener("click", function (e) { var b = e.target.closest(".fbtn"); if (b) { state.c = b.dataset.k; paint(); } });
    search.addEventListener("input", function () { state.q = search.value; paint(); });
    sort.addEventListener("change", function () { state.sort = sort.value; paint(); });
    $("#clear").addEventListener("click", function () { state.c = "all"; state.q = ""; search.value = ""; paint(); });
    paint();
    if (location.hash === "#search") search.focus({ preventScroll: false });
  }

  /* ---------- order message (shared by product + cart) ---------- */
  function lineText(p, size, qty) { return p.name + " | Size " + size + " | Qty " + qty + " | " + money(p.price * qty); }
  function waLink(text) { return "https://wa.me/" + C.whatsapp + "?text=" + encodeURIComponent(text); }

  /* ---------- product page ---------- */
  function initProduct() {
    var p = byId(qs("id")), mount = $("#pdp");
    if (!p) {
      mount.innerHTML = '<div class="empty"><p>We couldn\'t find that piece.</p><a class="btn btn--solid" href="shop.html">Back to shop</a></div>';
      $("#related").hidden = true; return;
    }
    document.title = p.name + " — ODDWRLD";
    var meta = $('meta[name="description"]'); if (meta) meta.content = p.name + ". " + p.blurb;
    var catLabel = (FILTERS.filter(function (f) { return f[0] === p.cat; })[0] || [0, "Shop"])[1];
    $("#crumbs").innerHTML = '<a href="index.html">Home</a> / <a href="shop.html?c=' + p.cat + '">' + catLabel + "</a> / " + esc(p.name);

    var slides = [{ src: p.img, flat: true }].concat((p.gallery || []).map(function (g) { return { src: g, flat: false }; }));
    var off = pct(p);
    mount.innerHTML =
      '<div class="gallery">' +
        '<div class="gallery__track" id="track" tabindex="0" aria-label="Product photos">' +
          slides.map(function (s, i) { return '<div class="gallery__slide' + (s.flat ? " flat" : "") + '"><img src="' + IMG + s.src + '" alt="' + esc(p.name) + (i ? " — photo " + (i + 1) : "") + '" ' + (i ? 'loading="lazy"' : 'fetchpriority="high"') + ' width="1000" height="1250"></div>'; }).join("") +
        "</div>" +
        (slides.length > 1 ? '<div class="thumbs" id="thumbs">' + slides.map(function (s, i) { return '<button type="button" class="' + (s.flat ? "flat" : "") + '" aria-label="Show photo ' + (i + 1) + '"' + (i === 0 ? ' aria-current="true"' : "") + '><img src="' + IMG + s.src + '" alt=""></button>'; }).join("") + "</div>" : "") +
      "</div>" +
      '<div class="pdp__info">' +
        "<h1>" + esc(p.name) + "</h1>" +
        '<p class="pdp__price">' + (p.was ? "<s>" + money(p.was) + '</s><span class="now sale">' + money(p.price) + '</span><span class="off">-' + off + "%</span>" : '<span class="now">' + money(p.price) + "</span>") + "</p>" +
        '<p class="pdp__lead">' + esc(p.blurb) + "</p>" +
        '<div class="lbl">Size <span>Colour: ' + esc(p.colour) + "</span></div>" +
        '<div class="sizes" role="radiogroup" aria-label="Size" id="sizes">' + p.sizes.map(function (s) { return '<button type="button" class="size" role="radio" aria-checked="false" data-s="' + s + '">' + s + "</button>"; }).join("") + "</div>" +
        '<p class="size-err" id="sizeErr" role="alert"></p>' +
        '<div class="buy"><div class="qty" aria-label="Quantity"><button type="button" id="qm" aria-label="Decrease">−</button><output id="qv">1</output><button type="button" id="qp" aria-label="Increase">+</button></div>' +
          '<button type="button" class="btn btn--solid" id="add">Add to bag</button>' +
          '<div class="buyrow"><button type="button" class="btn" id="wa">Order on WhatsApp</button></div></div>' +
        '<p class="added" id="added" aria-live="polite"></p>' +
        '<div class="acc"><details open><summary>Details</summary><div class="body"><ul>' + p.details.map(function (d) { return "<li>" + esc(d) + "</li>"; }).join("") + "</ul></div></details>" +
          '<details><summary>Delivery &amp; returns</summary><div class="body"><p>Delivery fee and timing are confirmed with you on WhatsApp before you pay. Something not right? Message us within 48 hours of delivery. See <a href="info.html#returns"><u>Returns</u></a>.</p></div></details></div>' +
      "</div>";

    // gallery thumbs
    var track = $("#track"), thumbs = $("#thumbs");
    if (thumbs) {
      var tb = $$("button", thumbs);
      tb.forEach(function (b, i) { b.addEventListener("click", function () { track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" }); }); });
      track.addEventListener("scroll", function () {
        var i = Math.round(track.scrollLeft / track.clientWidth);
        tb.forEach(function (b, j) { b.setAttribute("aria-current", String(i === j)); });
      }, { passive: true });
    }

    // size + qty
    var size = null, qty = 1, err = $("#sizeErr");
    $("#sizes").addEventListener("click", function (e) {
      var b = e.target.closest(".size"); if (!b) return;
      size = b.dataset.s; err.textContent = "";
      $$(".size").forEach(function (x) { x.setAttribute("aria-checked", String(x === b)); });
    });
    var qv = $("#qv");
    $("#qm").addEventListener("click", function () { qty = Math.max(1, qty - 1); qv.textContent = qty; });
    $("#qp").addEventListener("click", function () { qty = Math.min(10, qty + 1); qv.textContent = qty; });
    function need() { if (size) return true; err.textContent = "Please choose a size."; $(".size").focus(); return false; }

    $("#add").addEventListener("click", function () {
      if (!need()) return;
      addToCart(p.id, size, qty);
      $("#added").innerHTML = "Added to your bag. <a href=\"cart.html\">View bag &amp; checkout →</a>";
    });
    $("#wa").addEventListener("click", function () {
      if (!need()) return;
      var text = "Hello ODDWRLD! I'd like to order:\n" + lineText(p, size, qty) + "\n\nPlease confirm availability and delivery.";
      window.open(waLink(text), "_blank", "noopener");
    });

    $("#related").dataset.exclude = p.id;
    $("#related").dataset.rail = p.cat === "sets" ? "sets" : "best";
    initRails();
  }

  /* ---------- cart / order page ---------- */
  function initCart() {
    var list = $("#lines"), sum = $("#summary"), empty = $("#cartEmpty"), grid = $("#cartGrid"), headCount = $("#cartCount");

    function paint() {
      var c = readCart();
      headCount.textContent = c.length ? "(" + cartCount() + ")" : "";
      empty.hidden = c.length > 0; grid.hidden = c.length === 0;
      list.innerHTML = c.map(function (l, i) {
        var p = byId(l.id);
        return '<li class="line"><a class="line__img" href="product.html?id=' + p.id + '"><img src="' + IMG + p.img + '" alt="" width="1000" height="1250"></a>' +
          '<div><h3><a href="product.html?id=' + p.id + '">' + esc(p.name) + "</a></h3>" +
          '<p class="meta">Size ' + esc(l.size) + " · " + money(p.price) + "</p>" +
          '<div class="line__row"><div class="qty"><button type="button" data-a="m" data-i="' + i + '" aria-label="Decrease">−</button><output>' + l.qty + '</output><button type="button" data-a="p" data-i="' + i + '" aria-label="Increase">+</button></div>' +
          "<strong>" + money(p.price * l.qty) + '</strong></div><p style="margin-top:10px"><button type="button" class="linkbtn" data-a="x" data-i="' + i + '">Remove</button></p></div></li>';
      }).join("");
      $("#subtotal").textContent = money(cartTotal());
      $("#total").textContent = money(cartTotal());
    }
    list.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-a]"); if (!b) return;
      var c = readCart(), i = +b.dataset.i, a = b.dataset.a;
      if (a === "x") c.splice(i, 1);
      if (a === "p") c[i].qty = Math.min(10, c[i].qty + 1);
      if (a === "m") { c[i].qty -= 1; if (c[i].qty < 1) c.splice(i, 1); }
      writeCart(c); paint();
    });

    function build(f) {
      var c = readCart();
      var lines = c.map(function (l, i) { return (i + 1) + ". " + lineText(byId(l.id), l.size, l.qty); }).join("\n");
      var ref = "ODW-" + Date.now().toString(36).slice(-5).toUpperCase();
      return {
        ref: ref,
        text: "Hello ODDWRLD! I'd like to place an order (" + ref + "):\n\n" + lines +
          "\n\nSubtotal: " + money(cartTotal()) +
          "\n\nName: " + f.name + "\nPhone: " + f.phone + (f.email ? "\nEmail: " + f.email : "") +
          "\nAddress: " + f.address + ", " + f.city + (f.notes ? "\nNotes: " + f.notes : "") +
          "\n\nPlease confirm availability, delivery fee and payment details."
      };
    }
    var form = $("#orderForm"), out = $("#confirm"), ferr = $("#formErr");
    function values() {
      var d = {}; ["name", "phone", "email", "address", "city", "notes"].forEach(function (k) { d[k] = form.elements[k].value.trim(); }); return d;
    }
    function check() {
      var f = values();
      if (!readCart().length) { ferr.textContent = "Your bag is empty."; return null; }
      if (!f.name || !f.phone || !f.address || !f.city) { ferr.textContent = "Please fill in your name, phone, address and city."; return null; }
      ferr.textContent = ""; return f;
    }
    function show(o, kind) {
      out.hidden = false;
      out.innerHTML = '<h3>Order ' + o.ref + " ready</h3><p>" + (kind === "wa"
        ? "WhatsApp should have opened with your order. Press send to confirm it. We'll reply with the delivery fee and payment details."
        : "Your email app should have opened with the order. Press send to confirm it.") +
        '</p><div class="alt-actions"><a class="btn" href="' + waLink(o.text) + '" target="_blank" rel="noopener">Open WhatsApp</a>' +
        '<button type="button" class="btn" id="copy">Copy order</button></div><p class="added" id="copied" aria-live="polite"></p>';
      $("#copy").addEventListener("click", function () {
        var done = function () { $("#copied").textContent = "Order copied."; };
        if (navigator.clipboard) navigator.clipboard.writeText(o.text).then(done, function () { fallback(o.text, done); }); else fallback(o.text, done);
      });
      out.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    function fallback(t, done) { var a = document.createElement("textarea"); a.value = t; document.body.appendChild(a); a.select(); try { document.execCommand("copy"); done(); } catch (e) {} a.remove(); }

    $("#sendWa").addEventListener("click", function () {
      var f = check(); if (!f) return; var o = build(f);
      window.open(waLink(o.text), "_blank", "noopener"); show(o, "wa");
    });
    $("#sendMail").addEventListener("click", function () {
      var f = check(); if (!f) return; var o = build(f);
      location.href = "mailto:" + C.email + "?subject=" + encodeURIComponent("Order " + o.ref) + "&body=" + encodeURIComponent(o.text); show(o, "mail");
    });
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    $("#clearBag").addEventListener("click", function () { writeCart([]); out.hidden = true; paint(); });
    paint();
  }

  /* ---------- scroll reveal ---------- */
  function initReveal() {
    var els = $$("[data-reveal]");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- boot ---------- */
  renderChrome(); initChrome();
  $$("[data-wa]").forEach(function (a) { a.href = "https://wa.me/" + C.whatsapp; a.target = "_blank"; a.rel = "noopener"; });
  $$("[data-mail]").forEach(function (a) { a.href = "mailto:" + C.email; a.textContent = C.email; });
  var page = document.body.dataset.page;
  if (page === "home") initHome();
  if (page === "shop") initShop();
  if (page === "product") initProduct();
  if (page === "cart") initCart();
  initReveal();
  window.addEventListener("storage", function () { paintCount(false); });
})();
