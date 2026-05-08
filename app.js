const stations = [
  {
    id: "timer",
    badge: "3초",
    title: "3초 뒤 사라지는 주문 키오스크",
    short: "고민할 시간이 부족한 화면",
    mission: "치즈버거, 감자튀김, 콜라(M), 얼음 적게, 카드 결제까지 완료해 보세요.",
    kicker: "시간 장벽",
    insight: "충분한 시간, 멈춤 버튼, 이전 단계로 돌아가기 버튼이 있어야 합니다.",
    principle: "시간을 넉넉하게",
    summary: "화면 제한 시간을 늘리고, 연장 버튼과 뒤로 가기 버튼을 함께 둡니다.",
    closing: "사용자가 늦은 것이 아니라, 충분히 생각할 시간을 주는 화면이 필요합니다."
  },
  {
    id: "alien",
    badge: "말",
    title: "외계어 메뉴 키오스크",
    short: "어려운 외래어와 줄임말",
    mission: "따뜻한 보리차, 포장, 설탕 없음을 골라 보세요.",
    kicker: "문해 장벽",
    insight: "쉬운 말, 그림, 예시가 있으면 처음 쓰는 사람도 이해하기 쉽습니다.",
    principle: "쉬운 말로",
    summary: "외래어와 줄임말을 줄이고, 쉬운 설명과 그림 단서를 제공합니다.",
    closing: "낯선 말은 주문을 막을 수 있으므로 쉬운 말과 그림 단서가 함께 있어야 합니다."
  },
  {
    id: "tiny",
    badge: "결제",
    title: "어려운 결제 키오스크",
    short: "할인, 적립, 결제, 영수증까지 이어지는 복잡한 과정",
    mission: "ALPACO VIP를 인증하고, SNU 클래스 앱의 학생번호를 입력한 뒤 카드 결제를 완료해 보세요.",
    kicker: "절차 장벽",
    insight: "결제 전 단계가 많고 안내가 흩어져 있으면 어디를 눌러야 하는지 헷갈립니다.",
    principle: "결제 흐름을 단순하게",
    summary: "할인, 적립, 결제, 카드 투입, 영수증 수령을 단계별로 명확하게 안내합니다.",
    closing: "할인, 적립, 결제, 수령은 실제 행동 순서대로 하나씩 안내해야 합니다."
  }
];

const stationPasswords = {
  timer: "감자튀김",
  alien: "보리차",
  tiny: "카드결제"
};

const state = {
  currentId: null,
  mode: "challenge",
  kioskStarted: false,
  completed: new Set(),
  attempts: {},
  barriers: []
};

let cleanupTasks = [];
let toastTimer = 0;

const els = {
  homeView: document.querySelector("#homeView"),
  stationView: document.querySelector("#stationView"),
  summaryView: document.querySelector("#summaryView"),
  stationCards: document.querySelector("#stationCards"),
  startButton: document.querySelector("#startButton"),
  restartButton: document.querySelector("#restartButton"),
  stationBackButton: document.querySelector("#stationBackButton"),
  progressText: document.querySelector("#progressText"),
  progressBar: document.querySelector("#progressBar"),
  stationKicker: document.querySelector("#stationKicker"),
  stationTitle: document.querySelector("#stationTitle"),
  stationMission: document.querySelector("#stationMission"),
  challengeMode: document.querySelector("#challengeMode"),
  kindMode: document.querySelector("#kindMode"),
  simulator: document.querySelector("#simulator"),
  insightText: document.querySelector("#insightText"),
  barrierLog: document.querySelector("#barrierLog"),
  summaryList: document.querySelector("#summaryList"),
  toast: document.querySelector("#toast")
};

function getStation(id) {
  return stations.find((station) => station.id === id);
}

function currentStation() {
  return getStation(state.currentId);
}

function addCleanup(task) {
  cleanupTasks.push(task);
}

function clearRuntime() {
  cleanupTasks.forEach((task) => task());
  cleanupTasks = [];
}

function showView(viewName) {
  clearRuntime();
  if (viewName !== "station") {
    state.kioskStarted = false;
  }
  [els.homeView, els.stationView, els.summaryView].forEach((view) => view.classList.remove("is-active"));
  if (viewName === "home") {
    els.homeView.classList.add("is-active");
  }
  if (viewName === "station") {
    els.stationView.classList.add("is-active");
  }
  if (viewName === "summary") {
    renderSummary();
    els.summaryView.classList.add("is-active");
  }
  syncFocusMode();
}

function syncFocusMode() {
  const focused = state.kioskStarted && els.stationView.classList.contains("is-active");
  document.body.classList.toggle("kiosk-focus-mode", focused);
  els.stationView.classList.toggle("is-focus", focused);
}

function renderProgress() {
  const done = state.completed.size;
  els.progressText.textContent = `${done} / ${stations.length} 완료`;
  els.progressBar.style.width = `${(done / stations.length) * 100}%`;
}

function renderCards() {
  els.stationCards.innerHTML = stations
    .map(
      (station) => {
        const isComplete = state.completed.has(station.id);
        return `
        <button class="station-card ${isComplete ? "is-complete" : ""}" type="button" data-station="${station.id}">
          <span class="station-card-top">
            <span class="monster-token">${station.badge}</span>
            ${isComplete ? `<span class="station-card-status">완료</span>` : ""}
          </span>
          <span>
            <p class="section-kicker">${station.kicker}</p>
            <h3>${station.title}</h3>
            <p>${isComplete ? station.closing : station.short}</p>
          </span>
        </button>
      `;
      }
    )
    .join("");

  els.stationCards.querySelectorAll("[data-station]").forEach((button) => {
    button.addEventListener("click", () => openStation(button.dataset.station));
  });
}

function openStation(id) {
  state.currentId = id;
  state.mode = "challenge";
  state.kioskStarted = false;
  showView("station");
  renderStation();
}

function returnHome() {
  state.currentId = null;
  state.kioskStarted = false;
  renderCards();
  showView("home");
  renderProgress();
}

function renderStation() {
  clearRuntime();
  const station = currentStation();
  if (!station) return;

  els.stationKicker.textContent = station.kicker;
  els.stationTitle.textContent = station.title;
  els.stationMission.textContent = station.mission;
  els.insightText.textContent = station.insight;
  els.challengeMode.classList.toggle("is-active", state.mode === "challenge");
  els.kindMode.classList.toggle("is-active", state.mode === "kind");
  renderBarrierLog();

  const renderers = {
    timer: renderTimerStation,
    tiny: renderTinyStation,
    alien: renderAlienStation,
    contrast: renderContrastStation,
    audio: renderAudioStation
  };

  if (!state.kioskStarted) {
    renderKioskStart(els.simulator, station, state.mode);
  } else {
    renderers[station.id](els.simulator, state.mode);
  }
  syncFocusMode();
  renderProgress();
}

function recordBarrier(message) {
  const station = currentStation();
  if (!station) return;
  state.attempts[station.id] = (state.attempts[station.id] || 0) + 1;
  state.barriers.unshift({
    stationId: station.id,
    stationTitle: station.title,
    message,
    success: false
  });
  renderBarrierLog();
  showToast(`장벽 발견: ${message}`);
}

function completeStation(message) {
  const station = currentStation();
  if (!station) return;
  state.kioskStarted = false;
  state.completed.add(station.id);
  state.barriers.unshift({
    stationId: station.id,
    stationTitle: station.title,
    message,
    success: true
  });
  renderProgress();
  renderBarrierLog();
  syncFocusMode();
  showToast("체험 완료. 더 좋은 설계를 찾았습니다.");
}

function celebrationParticles() {
  return Array.from({ length: 30 }, (_, index) => {
    const x = 8 + ((index * 19) % 84);
    const delay = (index % 10) * 70;
    const duration = 1200 + (index % 5) * 150;
    const size = 8 + (index % 4) * 3;
    const turn = (index % 2 === 0 ? 1 : -1) * (180 + index * 11);
    const drift = (index % 2 === 0 ? 1 : -1) * (24 + (index % 6) * 12);
    return `
      <span
        class="celebration-particle particle-${index % 5}"
        style="--x: ${x}%; --delay: ${delay}ms; --duration: ${duration}ms; --size: ${size}px; --turn: ${turn}deg; --drift: ${drift}px;"
      ></span>
    `;
  }).join("");
}

function showCompletion(root, message) {
  const station = currentStation();
  const stationRecords = state.barriers
    .filter((entry) => entry.stationId === station.id && !entry.success)
    .slice(0, 3);
  const completionRecord = stationRecords.length
    ? `
      <div class="completion-record">
        <b>발견 기록</b>
        ${stationRecords.map((entry) => `<span>${entry.message}</span>`).join("")}
      </div>
    `
    : "";

  root.innerHTML = `
    <div class="kiosk-screen completion-screen">
      <div class="celebration-layer" aria-hidden="true">
        ${celebrationParticles()}
      </div>
      <div class="completion-panel">
        <p class="completion-kicker">미션 해결</p>
        <h3>${station.title} 완료</h3>
        <p>${message}</p>
        <p class="completion-lesson">마무리: ${station.closing}</p>
        ${completionRecord}
        <button class="next-button" type="button">키오스크 선택으로</button>
      </div>
    </div>
  `;
  root.querySelector(".next-button").addEventListener("click", returnHome);
}

function renderBarrierLog() {
  const station = currentStation();
  const filtered = station
    ? state.barriers.filter((entry) => entry.stationId === station.id)
    : state.barriers;

  if (filtered.length === 0) {
    els.barrierLog.innerHTML = `<p class="empty-log">아직 발견 기록이 없습니다.</p>`;
    return;
  }

  els.barrierLog.innerHTML = filtered
    .slice(0, 6)
    .map(
      (entry) => `
        <div class="log-entry${entry.success ? " success" : ""}">
          ${entry.message}
        </div>
      `
    )
    .join("");
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => els.toast.classList.remove("is-visible"), 2400);
}

function formatWon(amount) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

function foodArt(type) {
  return `<span class="food-art ${type}" aria-hidden="true"><span></span><span></span><span></span></span>`;
}

const productImages = {
  bulgogi: "assets/menu/bulgogi-burger.png",
  "cheese-set": "assets/menu/cheese-burger.png",
  shrimp: "assets/menu/shrimp-burger.png",
  wrap: "assets/menu/chicken-wrap.png",
  salad: "assets/menu/salad.png",
  fries: "assets/menu/fries.png",
  stick: "assets/menu/cheese-stick.png",
  corn: "assets/menu/corn-salad.png",
  cola: "assets/menu/cola.png",
  "zero-cola": "assets/menu/zero-cola.png",
  cider: "assets/menu/cider.png",
  ade: "assets/menu/lemonade.png",
  "ice-none": "assets/menu/ice-none.png",
  "ice-less": "assets/menu/ice-less.png",
  "ice-normal": "assets/menu/ice-normal.png",
  "ice-more": "assets/menu/ice-more.png",
  "barley-hot": "assets/menu/barley-tea.png",
  "alpaco-vip": "assets/menu/alpaco-vip.png",
  jammanbo: "assets/menu/jammanbo-membership.png",
  "snu-class": "assets/menu/snu-class.png",
  "message-app": "assets/menu/message-app.png",
  "photo-app": "assets/menu/photo-app.png",
  "map-app": "assets/menu/map-app.png",
  "bank-app": "assets/menu/bank-app.png",
  "weather-app": "assets/menu/weather-app.png",
  "settings-app": "assets/menu/settings-app.png",
  "mail-app": "assets/menu/mail-app.png",
  "calendar-app": "assets/menu/calendar-app.png",
  "music-app": "assets/menu/music-app.png",
  "payment-card-hand": "assets/menu/card.png",
  "hardware-card-slot": "assets/menu/card-slot.png",
  "hardware-receipt": "assets/menu/receipt.png",
  "hardware-barcode": "assets/menu/barcode-scanner.png"
};

function productImageMarkup(src, className = "") {
  return `
    <span class="product-image-frame ${className}" aria-hidden="true">
      <img src="${src}" alt="" loading="lazy">
    </span>
  `;
}

function productArt(item) {
  const imageSrc = productImages[item.id];
  if (imageSrc) {
    return productImageMarkup(imageSrc, `product-image-${item.id}`);
  }
  return item.visual ? foodArt(item.visual) : `<span class="text-art">${item.mark || item.label.slice(0, 1)}</span>`;
}

function stepDots(labels, activeIndex) {
  return `
    <ol class="order-steps" aria-label="주문 단계">
      ${labels
        .map(
          (label, index) => `
            <li class="${index === activeIndex ? "is-active" : ""}${index < activeIndex ? " is-done" : ""}">
              <span>${index + 1}</span>${label}
            </li>
          `
        )
        .join("")}
    </ol>
  `;
}

function productCard(item, attrs = "", extraClass = "") {
  const desc = item.desc ? `<small>${item.desc}</small>` : "";
  const price = typeof item.price === "number" ? `<strong>${formatWon(item.price)}</strong>` : "";
  const art = item.noArt ? "" : productArt(item);
  const className = ["product-card", extraClass, item.noArt ? "no-art" : ""].filter(Boolean).join(" ");

  return `
    <button class="${className}" type="button" ${attrs}>
      ${art}
      <span class="product-copy">
        <b>${item.label}</b>
        ${desc}
        ${price}
      </span>
    </button>
  `;
}

function cartPanel(items, actionLabel = "결제하기") {
  const total = items.reduce((sum, item) => sum + (item.price || 0), 0);
  const rows =
    items.length > 0
      ? items
          .map(
            (item) => `
              <div class="cart-row">
                <span>${item.label}</span>
                <strong>${formatWon(item.price || 0)}</strong>
              </div>
            `
          )
          .join("")
      : `<p class="empty-cart">선택한 메뉴가 없습니다.</p>`;

  return `
    <aside class="order-cart" aria-label="주문 내역">
      <h4>주문 내역</h4>
      <div class="cart-list">${rows}</div>
      <div class="cart-total">
        <span>합계</span>
        <strong>${formatWon(total)}</strong>
      </div>
      <button class="checkout-button" type="button" data-cart-action="true">${actionLabel}</button>
    </aside>
  `;
}

function kioskShell({ brand, title, subtitle, mode, status, timer, steps, activeStep, body, cartItems, guide, className = "" }) {
  const modeLabel = mode === "kind" ? "개선 모드" : "어려운 모드";
  const stageClass = ["kiosk-stage", mode === "challenge" ? "challenge" : ""].filter(Boolean).join(" ");
  return `
    <div class="${stageClass}">
      <div class="kiosk-hardware">
        <div class="kiosk-device-screen">
          <div class="real-kiosk ${className}">
            <header class="kiosk-brandbar">
              <div class="brand-stack">
                <span class="store-logo">${brand.slice(0, 1)}</span>
                <span>
                  <b>${brand}</b>
                  <small>${modeLabel}</small>
                </span>
              </div>
              <div class="kiosk-status">
                <span>${status}</span>
                ${timer ? `<strong id="timerReadout">${timer}</strong>` : ""}
              </div>
            </header>
            <section class="kiosk-order-main">
              <div class="order-board">
                <div class="order-heading">
                  <div>
                    <h3>${title}</h3>
                    ${subtitle ? `<p>${subtitle}</p>` : ""}
                  </div>
                  ${steps ? stepDots(steps, activeStep) : ""}
                </div>
                ${guide ? `<p class="kiosk-help real-help">${guide}</p>` : ""}
                ${body}
              </div>
              ${cartPanel(cartItems)}
            </section>
            <footer class="kiosk-homebar">
              <span>처음으로</span>
              <span>직원 호출</span>
              <span>도움말</span>
            </footer>
          </div>
        </div>
        <div class="kiosk-hardware-slot" aria-hidden="true"></div>
      </div>
    </div>
  `;
}

function selectedCartItems(values) {
  return Object.values(values).filter(Boolean);
}

function flowModal(message) {
  return `
    <div class="flow-modal-backdrop" role="dialog" aria-modal="true" aria-label="${message}">
      <div class="flow-modal">
        <h4>${message}</h4>
        <button class="phone-primary-button" type="button" data-flow-modal-close="true">확인</button>
      </div>
    </div>
  `;
}

function randomStudentNumber(length = 8) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  const all = `${letters}${digits}`;
  const chars = [
    letters[Math.floor(Math.random() * letters.length)],
    digits[Math.floor(Math.random() * digits.length)]
  ];

  while (chars.length < length) {
    chars.push(all[Math.floor(Math.random() * all.length)]);
  }

  for (let index = chars.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [chars[index], chars[swapIndex]] = [chars[swapIndex], chars[index]];
  }

  return chars.join("");
}

function captureKioskScroll(root) {
  const frame = root.querySelector(".kiosk-frame");
  const device = root.querySelector(".kiosk-device-screen");
  const board = root.querySelector(".order-board");
  return {
    frameTop: frame ? frame.scrollTop : 0,
    deviceTop: device ? device.scrollTop : 0,
    boardTop: board ? board.scrollTop : 0
  };
}

function restoreKioskScroll(root, scrollState) {
  if (!scrollState) return;

  const restore = () => {
    const frame = root.querySelector(".kiosk-frame");
    const device = root.querySelector(".kiosk-device-screen");
    const board = root.querySelector(".order-board");
    if (frame) frame.scrollTop = scrollState.frameTop;
    if (device) device.scrollTop = scrollState.deviceTop || 0;
    if (board) board.scrollTop = scrollState.boardTop;
  };

  restore();
  if (typeof window !== "undefined" && window.requestAnimationFrame) {
    window.requestAnimationFrame(restore);
  }
}

function kioskHeroFor(stationId) {
  const heroes = {
    timer: {
      brand: "모두버거",
      title: "오늘의 추천 메뉴",
      name: "치즈버거",
      copy: "치즈버거, 감자튀김, 콜라(M), 얼음 적게, 카드 결제까지 해보세요.",
      art: productImageMarkup(productImages["cheese-set"], "hero-product-image")
    },
    tiny: {
      brand: "모두페이",
      title: "결제수단 선택",
      name: "카드 결제",
      copy: "ALPACO VIP 인증, SNU 클래스 적립, 결제, 영수증 수령까지 확인합니다.",
      art: productImageMarkup(productImages["alpaco-vip"], "hero-product-image hero-alpaco-image")
    },
    alien: {
      brand: "모두티",
      title: "오늘의 차 메뉴",
      name: "따뜻한 보리차",
      copy: "따뜻한 보리차, 포장, 설탕 없음을 선택해 보세요.",
      art: productImageMarkup(productImages["barley-hot"], "hero-product-image hero-barley-image")
    },
    contrast: {
      brand: "모두버거",
      title: "결제 전 쿠폰 확인",
      name: "1,000원 할인",
      copy: "쿠폰과 결제 화면의 보기 쉬움을 비교합니다.",
      art: `<span class="text-art">%</span>`
    },
    audio: {
      brand: "모두병원",
      title: "번호표 접수",
      name: "소아과 접수",
      copy: "음성 안내와 화면 안내를 비교합니다.",
      art: `<span class="text-art">접</span>`
    }
  };
  return heroes[stationId] || heroes.timer;
}

function renderKioskStart(root, station, mode) {
  const hero = kioskHeroFor(station.id);
  const modeLabel = mode === "kind" ? "개선 모드" : "어려운 모드";
  const inputId = `stationPassword-${station.id}`;
  root.innerHTML = `
    <div class="kiosk-stage">
      <div class="kiosk-hardware start-hardware">
        <div class="kiosk-device-screen start-device-screen">
          <header class="start-hero">
            <div class="start-copy">
              <p>${hero.title}</p>
              <h3>${hero.name}</h3>
              <span>${hero.copy}</span>
            </div>
            <div class="start-art">${hero.art}</div>
          </header>
          <section class="start-panel">
            <p class="section-kicker">${modeLabel}</p>
            <h3>주문 목표를 확인했나요?</h3>
            <p>${station.mission}</p>
            <form class="start-password-form" data-start-password-form="true">
              <label for="${inputId}">비밀번호</label>
              <input id="${inputId}" type="text" autocomplete="off" placeholder="선생님이 알려준 비밀번호 입력" data-start-password-input="true" />
              <small data-start-password-error="true" aria-live="polite"></small>
              <button class="kiosk-start-button" type="submit">시작</button>
            </form>
          </section>
          <footer class="kiosk-homebar">
            <span>처음으로</span>
            <span>직원 호출</span>
            <span>도움말</span>
          </footer>
        </div>
        <div class="kiosk-hardware-slot" aria-hidden="true"></div>
      </div>
    </div>
  `;

  root.querySelector("[data-start-password-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = root.querySelector("[data-start-password-input]");
    const error = root.querySelector("[data-start-password-error]");
    const expected = stationPasswords[station.id] || "";
    const typed = input.value.replace(/\s/g, "");

    if (typed !== expected.replace(/\s/g, "")) {
      input.classList.add("is-error");
      error.textContent = "비밀번호를 다시 확인해 주세요.";
      showToast("비밀번호를 다시 확인해 주세요.");
      input.focus();
      input.select();
      return;
    }

    state.kioskStarted = true;
    renderStation();
  });

  root.querySelector("[data-start-password-input]").addEventListener("input", (event) => {
    event.currentTarget.classList.remove("is-error");
    root.querySelector("[data-start-password-error]").textContent = "";
  });
}

function renderTimerStation(root, mode) {
  const isKind = mode === "kind";
  const steps = [
    {
      label: "메뉴",
      key: "menu",
      title: "메뉴를 골라 주세요",
      subtitle: "치즈버거를 선택하면 다음 단계로 이동합니다.",
      correct: "cheese-set",
      items: [
        { id: "bulgogi", label: "불고기버거", desc: "달콤한 간장 소스", price: 5200, visual: "burger" },
        { id: "cheese-set", label: "치즈버거", desc: "기본 버거", price: 5200, visual: "burger" },
        { id: "shrimp", label: "새우버거", desc: "바삭한 새우 패티", price: 6100, visual: "burger" },
        { id: "wrap", label: "치킨랩", desc: "또띠아와 치킨", price: 5400, visual: "wrap" }
      ]
    },
    {
      label: "사이드",
      key: "side",
      title: "사이드를 선택해 주세요",
      subtitle: "세트에 포함할 사이드를 고릅니다.",
      correct: "fries",
      items: [
        { id: "salad", label: "샐러드", desc: "상큼한 채소", price: 0, visual: "salad" },
        { id: "corn", label: "콘샐러드", desc: "달콤한 옥수수", price: 0, visual: "salad" },
        { id: "stick", label: "치즈스틱", desc: "추가 800원", price: 800, visual: "stick" },
        { id: "fries", label: "감자튀김", desc: "기본 사이드", price: 0, visual: "fries" }
      ]
    },
    {
      label: "음료",
      key: "drink",
      title: "음료를 선택해 주세요",
      subtitle: "세트에 포함할 콜라(M)를 고릅니다.",
      correct: "cola",
      items: [
        { id: "cola", label: "콜라(M)", desc: "기본 탄산음료", price: 0, visual: "cup" },
        { id: "zero-cola", label: "제로콜라(M)", desc: "당류 0g", price: 0, visual: "cup" },
        { id: "cider", label: "사이다(M)", desc: "레몬향 탄산", price: 0, visual: "cup" },
        { id: "ade", label: "레몬에이드(M)", desc: "추가 700원", price: 700, visual: "cup" }
      ]
    },
    {
      label: "얼음",
      key: "ice",
      title: "얼음 양을 선택해 주세요",
      subtitle: "콜라(M)에 넣을 얼음 양을 고릅니다.",
      correct: "ice-less",
      items: [
        { id: "ice-none", label: "얼음 없음", desc: "얼음을 넣지 않음", price: 0, mark: "없" },
        { id: "ice-less", label: "얼음 적게", desc: "조금만 넣기", price: 0, mark: "적" },
        { id: "ice-normal", label: "얼음 중간", desc: "기본 양", price: 0, mark: "중" },
        { id: "ice-more", label: "얼음 많이", desc: "가득 넣기", price: 0, mark: "많" }
      ]
    },
    {
      label: "결제",
      key: "payment",
      title: "결제 방법을 선택해 주세요",
      subtitle: "카드 결제를 선택하면 주문이 완료됩니다.",
      correct: "card",
      items: [
        { id: "cash", label: "현금 결제", desc: "직원 호출 필요", price: 0, mark: "현" },
        { id: "card", label: "카드 결제", desc: "카드 투입구 사용", price: 0, mark: "카" },
        { id: "coupon", label: "쿠폰만 사용", desc: "쿠폰 번호 필요", price: 0, mark: "쿠" },
        { id: "cancel", label: "처음으로", desc: "주문 취소", price: 0, mark: "취" }
      ]
    }
  ];

  const order = {};
  let step = 0;
  let timeLeft = isKind ? 0 : 3;
  let timer = 0;
  let disposed = false;

  addCleanup(() => {
    disposed = true;
    window.clearInterval(timer);
  });

  function draw() {
    const current = steps[step];
    root.innerHTML = kioskShell({
      brand: "모두버거",
      title: current.title,
      subtitle: current.subtitle,
      mode,
      status: isKind ? "천천히 주문" : "자동 초기화",
      timer: isKind ? "" : `${timeLeft.toFixed(1)}초`,
      steps: steps.map((item) => item.label),
      activeStep: step,
      guide: isKind
        ? "시간 제한 없이 치즈버거, 감자튀김, 콜라(M), 얼음 적게, 카드 결제를 순서대로 고릅니다."
        : "3초 안에 치즈버거, 감자튀김, 콜라(M), 얼음 적게, 카드 결제를 순서대로 고릅니다.",
      cartItems: selectedCartItems(order),
      className: isKind ? "friendly-kiosk" : "pressure-kiosk",
      body: `
        <div class="category-tabs" aria-label="메뉴 분류">
          <span class="category-tab is-active">${current.label}</span>
          <span class="category-tab">추천</span>
          <span class="category-tab">할인</span>
        </div>
        <div class="product-grid">
          ${current.items.map((item) => productCard(item, `data-product="${item.id}"`, isKind ? "comfortable" : "pressure-card")).join("")}
        </div>
      `
    });

    root.querySelectorAll("[data-product]").forEach((button) => {
      button.addEventListener("click", () => {
        const selected = current.items.find((item) => item.id === button.dataset.product);
        if (!selected) return;
        if (selected.id !== current.correct) {
          recordBarrier(isKind ? "원하는 조건과 다른 항목입니다. 설명을 다시 확인해 보세요." : "빨리 고르려다 엉뚱한 메뉴를 눌렀습니다.");
          return;
        }

        order[current.key] = selected;
        window.clearInterval(timer);
        if (step === steps.length - 1) {
          completeStation("짧은 제한 시간은 주문을 포기하게 만들 수 있습니다.");
          showCompletion(root, "실제 주문 화면에서도 충분한 시간과 이전 단계 버튼이 필요합니다.");
          return;
        }
        step += 1;
        timeLeft = 3;
        draw();
        if (!isKind) startClock();
      });
    });

    root.querySelector("[data-cart-action]").addEventListener("click", () => {
      recordBarrier(isKind ? "아직 주문 단계를 차례로 완료해야 합니다." : "장바구니 버튼이 있어도 시간 제한이 있으면 확인하기 어렵습니다.");
    });
  }

  function startClock() {
    window.clearInterval(timer);
    timer = window.setInterval(() => {
      if (disposed) return;
      timeLeft -= 0.1;
      const readout = root.querySelector("#timerReadout");
      if (readout) readout.textContent = `${Math.max(timeLeft, 0).toFixed(1)}초`;
      if (timeLeft <= 0) {
        window.clearInterval(timer);
        recordBarrier("생각할 시간이 부족해 주문 화면이 처음으로 돌아갔습니다.");
        step = 0;
        Object.keys(order).forEach((key) => delete order[key]);
        timeLeft = 3;
        draw();
        startClock();
      }
    }, 100);
  }

  draw();
  if (!isKind) startClock();
}

function renderTinyStation(root, mode) {
  const isKind = mode === "kind";
  const picks = {};
  const hardware = {
    card: false,
    receipt: false
  };
  const affiliatePhone = {
    open: false,
    stage: "locked",
    done: false
  };
  const rewardPhone = {
    open: false,
    stage: "locked",
    done: false,
    studentNumber: randomStudentNumber()
  };
  let flowModalMessage = "";
  let focusGroupAfterModal = "";
  let modalAnchorGroup = "";
  const baseOrder = [{ label: "치즈버거 세트", price: 7200 }];
  const affiliateApps = [
    { id: "messages", label: "메시지", desc: "대화", initial: "M", imageKey: "message-app" },
    { id: "photos", label: "사진", desc: "앨범", initial: "P", imageKey: "photo-app" },
    { id: "map", label: "지도", desc: "길찾기", initial: "길", imageKey: "map-app" },
    { id: "bank", label: "뱅크", desc: "계좌", initial: "B", imageKey: "bank-app" },
    { id: "jammanbo-app", label: "JAMMANBO 멤버십", desc: "멤버십", initial: "J", imageKey: "jammanbo" },
    { id: "weather", label: "날씨", desc: "예보", initial: "W", imageKey: "weather-app" },
    { id: "snu-app", label: "SNU 클래스", desc: "수강 인증", initial: "S", imageKey: "snu-class" },
    { id: "alpaco-vip-app", label: "ALPACO VIP", desc: "할인 바코드", initial: "A", imageKey: "alpaco-vip", correct: true },
    { id: "settings", label: "설정", desc: "기기", initial: "설", imageKey: "settings-app" },
    { id: "mail", label: "메일", desc: "편지함", initial: "@", imageKey: "mail-app" },
    { id: "calendar", label: "캘린더", desc: "일정", initial: "C", imageKey: "calendar-app" },
    { id: "music", label: "뮤직", desc: "재생", initial: "♪", imageKey: "music-app" }
  ];
  const groups = isKind
    ? [
        {
          key: "discount",
          title: "제휴할인",
          correct: "alpaco-vip",
          items: [
            { id: "alpaco-vip", label: "ALPACO VIP", desc: "VIP 할인", price: -700 },
            { id: "jammanbo", label: "JAMMANBO 멤버십", desc: "앱 멤버십", price: -500 },
            { id: "snu-class", label: "SNU 클래스", desc: "클래스 인증", price: -300 },
            { id: "none-discount", label: "제휴할인 없음", desc: "건너뛰기", price: 0, noArt: true }
          ]
        },
        {
          key: "reward",
          title: "적립 방법",
          correct: "snu-reward",
          items: [
            { id: "snu-reward", label: "SNU 클래스 적립", desc: "학생번호 입력", price: 0, noArt: true },
            { id: "none-reward", label: "적립 안 함", desc: "건너뛰기", price: 0, noArt: true }
          ]
        },
        {
          key: "payment",
          title: "결제수단",
          correct: "card",
          items: [
            { id: "card", label: "카드 결제", desc: "카드 투입구 사용", price: 0, noArt: true },
            { id: "easy-pay", label: "간편결제", desc: "앱으로 결제", price: 0, noArt: true }
          ]
        }
      ]
    : [
        {
          key: "discount",
          title: "STEP 1 제휴할인",
          correct: "alpaco-vip",
          items: [
            { id: "alpaco-vip", label: "ALPACO VIP", desc: "VIP 할인", price: -700 },
            { id: "jammanbo", label: "JAMMANBO 멤버십", desc: "앱 멤버십", price: -500 },
            { id: "snu-class", label: "SNU 클래스", desc: "클래스 인증", price: -300 },
            { id: "none-discount", label: "제휴할인 없음", desc: "건너뛰기", price: 0, noArt: true }
          ]
        },
        {
          key: "reward",
          title: "STEP 2 적립 방법",
          correct: "snu-reward",
          items: [
            { id: "phone-reward", label: "휴대폰 번호", desc: "번호 입력", price: 0, noArt: true },
            { id: "barcode-reward", label: "멤버십 바코드", desc: "스캔", price: 0, noArt: true },
            { id: "snu-reward", label: "SNU 클래스 적립", desc: "학생번호 입력", price: 0, noArt: true },
            { id: "none-reward", label: "적립 안 함", desc: "건너뛰기", price: 0, noArt: true }
          ]
        },
        {
          key: "payment",
          title: "STEP 3 결제수단",
          correct: "card",
          items: [
            { id: "n-pay", label: "J pay", desc: "앱 결제", price: 0, noArt: true },
            { id: "app-card", label: "앱카드", desc: "QR/바코드", price: 0, noArt: true },
            { id: "kakao-pay", label: "카**페이", desc: "앱 결제", price: 0, noArt: true },
            { id: "payco", label: "PAYCONG", desc: "간편결제", price: 0, noArt: true },
            { id: "card", label: "카드 결제", desc: "IC페이", price: 0, noArt: true },
            { id: "zero-pay", label: "zero pay", desc: "간편결제", price: 0, noArt: true },
            { id: "apple-pay", label: "Orange Pay", desc: "휴대폰 태그", price: 0, noArt: true },
            { id: "kb-pay", label: "K* Pay", desc: "앱 결제", price: 0, noArt: true },
            { id: "coupon-pay", label: "쿠폰사용", desc: "쿠폰 번호", price: 0, noArt: true },
            { id: "gift-card", label: "모바일 상품권", desc: "바코드 스캔", price: 0, noArt: true }
          ]
        }
      ];

  function phoneAppIconMarkup(app) {
    const imageSrc = app.imageKey ? productImages[app.imageKey] : "";
    if (imageSrc) {
      return `
        <span class="phone-app-icon phone-app-image-icon phone-app-image-${app.imageKey}" aria-hidden="true">
          <img src="${imageSrc}" alt="" loading="lazy">
        </span>
      `;
    }
    return `<span class="phone-app-icon">${app.initial}</span>`;
  }

  function affiliatePhonePanel() {
    const stageCopy = {
      locked: "스마트폰을 열어서 앱을 찾아봅시다.",
      apps: "많은 앱 중에서 ALPACO VIP 앱을 찾아 선택해야 합니다.",
      barcode: "ALPACO VIP 앱 안에서 제휴할인에 필요한 메뉴를 선택해야 합니다.",
      done: "ALPACO VIP 바코드 인증이 완료되었습니다."
    };
    const phoneBody = {
      locked: `
        <div class="phone-lock-screen">
          <span class="phone-clock">10:24</span>
          <small>ALPACO 제휴할인을 계속하려면 휴대폰을 켜세요.</small>
          <button class="phone-primary-button" type="button" data-phone-action="wake">스마트폰 켜기</button>
        </div>
      `,
      apps: `
        <span class="phone-title">홈 화면</span>
        <div class="phone-app-grid">
          ${affiliateApps
            .map(
              (app) => `
                <button class="phone-app-button" type="button" data-affiliate-app="${app.id}">
                  ${phoneAppIconMarkup(app)}
                  <b>${app.label}</b>
                </button>
              `
            )
            .join("")}
        </div>
      `,
      barcode: `
        <span class="phone-title">ALPACO VIP</span>
        <div class="vip-app-menu">
          <button class="vip-app-option" type="button" data-phone-action="show-points">
            <b>포인트 조회</b>
            <small>잔여 포인트 보기</small>
          </button>
          <button class="vip-app-option" type="button" data-phone-action="show-coupons">
            <b>쿠폰함</b>
            <small>받은 쿠폰 확인</small>
          </button>
          <button class="vip-app-option" type="button" data-phone-action="generate-barcode">
            <b>바코드 생성</b>
            <small>제휴할인 인증용</small>
          </button>
          <button class="vip-app-option" type="button" data-phone-action="show-history">
            <b>이용 내역</b>
            <small>최근 사용 기록</small>
          </button>
        </div>
      `,
      done: `
        <span class="phone-title">ALPACO VIP</span>
        <div class="membership-card is-done">
          <b>인증 완료</b>
          <small>제휴할인이 주문 내역에 적용되었습니다.</small>
          <span class="barcode-visual" aria-label="인증된 멤버십 바코드"></span>
          <strong>할인 적용</strong>
        </div>
      `
    };

    return `
      <section class="affiliate-phone-panel ${affiliatePhone.done ? "is-done" : ""}">
        <div class="phone-panel-copy">
          <h4>스마트폰 제휴 앱 인증</h4>
          <p>${stageCopy[affiliatePhone.stage]}</p>
        </div>
        <div class="phone-mock" aria-label="스마트폰 앱 선택 화면">
          <div class="phone-speaker" aria-hidden="true"></div>
          <div class="phone-screen">
            ${phoneBody[affiliatePhone.stage]}
          </div>
        </div>
      </section>
    `;
  }

  function rewardPhonePanel() {
    const stageCopy = {
      locked: "SNU 클래스 적립을 하려면 스마트폰에서 학생번호를 확인해야 합니다.",
      apps: "많은 앱 중에서 SNU 클래스 앱을 찾아 선택해야 합니다.",
      student: "앱에 표시된 학생번호를 키오스크 입력칸에 그대로 입력하세요.",
      done: "학생번호 확인이 완료되어 SNU 클래스 적립이 적용되었습니다."
    };
    const isStudentEntry = rewardPhone.stage === "student";
    const rewardIntro = isStudentEntry
      ? ""
      : `
        <div class="phone-panel-copy">
          <h4>스마트폰 SNU 클래스 적립</h4>
          <p>${stageCopy[rewardPhone.stage]}</p>
        </div>
      `;
    const phoneBody = {
      locked: `
        <div class="phone-lock-screen">
          <span class="phone-clock">10:24</span>
          <small>SNU 클래스 적립을 계속하려면 휴대폰을 켜세요.</small>
          <button class="phone-primary-button" type="button" data-reward-phone-action="wake">스마트폰 켜기</button>
        </div>
      `,
      apps: `
        <span class="phone-title">홈 화면</span>
        <div class="phone-app-grid">
          ${affiliateApps
            .map(
              (app) => `
                <button class="phone-app-button" type="button" data-reward-app="${app.id}">
                  ${phoneAppIconMarkup(app)}
                  <b>${app.label}</b>
                </button>
              `
            )
            .join("")}
        </div>
      `,
      student: `
        <div class="phone-app-header reward-phone-app-header">
          ${productImageMarkup(productImages["snu-class"], "phone-app-logo")}
          <span class="reward-phone-app-title">
            <span class="phone-title">SNU 클래스</span>
            <small>스마트폰 SNU 클래스 적립</small>
            <em>${stageCopy.student}</em>
          </span>
        </div>
        <div class="student-id-card">
          <b>학생번호</b>
          <strong>${rewardPhone.studentNumber}</strong>
          <small>대문자 영어와 숫자를 정확히 입력해야 합니다.</small>
        </div>
      `,
      done: `
        <div class="phone-app-header">
          ${productImageMarkup(productImages["snu-class"], "phone-app-logo")}
          <span class="phone-title">SNU 클래스</span>
        </div>
        <div class="student-id-card is-done">
          <b>적립 완료</b>
          <strong>${rewardPhone.studentNumber}</strong>
          <small>학생번호가 확인되었습니다.</small>
        </div>
      `
    };

    return `
      <section class="reward-phone-panel ${rewardPhone.done ? "is-done" : ""} ${isStudentEntry ? "has-student-entry" : ""}">
        ${rewardIntro}
        <div class="phone-mock" aria-label="스마트폰 SNU 클래스 앱 화면">
          <div class="phone-speaker" aria-hidden="true"></div>
          <div class="phone-screen">
            ${phoneBody[rewardPhone.stage]}
          </div>
        </div>
        ${
          isStudentEntry
            ? `
              <form class="student-id-entry" data-student-id-form="true">
                <label for="studentIdInput">키오스크 학생번호 입력</label>
                <input id="studentIdInput" type="text" inputmode="text" autocomplete="off" maxlength="12" placeholder="예: A7K2M9Q4" data-student-id-input="true" />
                <button class="phone-primary-button" type="submit">입력 완료</button>
              </form>
            `
            : ""
        }
      </section>
    `;
  }

  function paymentHardwarePanel(optionReady) {
    const barcodeActive = affiliatePhone.stage === "scan" && !affiliatePhone.done;
    const cardDragActive = optionReady && !barcodeActive && !hardware.card;
    const hint = barcodeActive
      ? "바코드가 생성된 스마트폰을 바코드 인식하는 곳으로 끌어다 놓으세요."
      : cardDragActive
        ? "결제 카드를 카드 넣는 곳으로 끌어다 놓으세요."
        : "";

    return `
      <section class="payment-hardware ${optionReady ? "is-ready" : ""} ${barcodeActive ? "is-barcode-stage" : ""} ${cardDragActive ? "is-card-stage" : ""}">
        <h4>키오스크 앞면</h4>
        ${hint ? `<p class="payment-hardware-hint">${hint}</p>` : ""}
        ${
          cardDragActive
            ? `
              <div class="card-drag-zone">
                <div class="payment-card-hand" data-draggable-card="true" data-card-anchor-x="0.5" data-card-anchor-y="0.5" aria-label="결제 카드를 카드 넣는 곳으로 끌어다 놓기">
                  <img src="${productImages["payment-card-hand"]}" alt="" draggable="false">
                </div>
              </div>
            `
            : ""
        }
        <div class="hardware-actions">
          <button class="hardware-button barcode-target ${hardware.card ? "is-done" : ""}" type="button" data-hardware="card" data-barcode-target="card" data-card-target="slot" aria-label="카드 넣는 곳">
            <span class="hardware-device-group">
              <span class="hardware-image hardware-card-slot" aria-hidden="true">
                <img src="${productImages["hardware-card-slot"]}" alt="" loading="lazy">
              </span>
              <b>카드 넣는 곳</b>
            </span>
          </button>
          <button class="hardware-button barcode-target ${hardware.receipt ? "is-done" : ""}" type="button" data-hardware="receipt" data-barcode-target="receipt" aria-label="영수증과 번호표 챙기기">
            <span class="hardware-device-group">
              <span class="hardware-image hardware-receipt" aria-hidden="true">
                <img src="${productImages["hardware-receipt"]}" alt="" loading="lazy">
              </span>
              <b>영수증/번호표<br>챙기기</b>
            </span>
          </button>
          <button class="hardware-button barcode-target" type="button" data-barcode-target="scanner" aria-label="바코드 인식하는 곳">
            <span class="hardware-device-group">
              <span class="hardware-image hardware-barcode" aria-hidden="true">
                <img src="${productImages["hardware-barcode"]}" alt="" loading="lazy">
              </span>
              <b>바코드 인식하는<br>곳</b>
            </span>
          </button>
        </div>
      </section>
    `;
  }

  function affiliateScanPanel(optionReady) {
    return `
      <div class="payment-flow scan-payment-flow">
        <section class="dense-section payment-section scan-payment-section">
          <h4>제휴할인 바코드 인식</h4>
          <p class="scan-payment-hint">바코드가 생성된 스마트폰을 아래 키오스크 앞면의 바코드 인식하는 곳으로 끌어다 대세요.</p>
          <div class="scan-payment-layout">
            <div class="phone-mock scan-phone-mock" aria-label="드래그 가능한 ALPACO VIP 스마트폰" data-draggable-barcode="true">
              <div class="phone-speaker" aria-hidden="true"></div>
              <div class="phone-screen">
                <span class="phone-title">ALPACO VIP</span>
                <div class="membership-card">
                  <b>VIP 멤버십</b>
                  <small>이 스마트폰을 바코드 인식하는 곳으로 끌어다 대세요.</small>
                  <span class="barcode-visual" aria-label="멤버십 바코드"></span>
                  <strong>APC-2026-0506</strong>
                </div>
              </div>
            </div>
            ${paymentHardwarePanel(optionReady)}
          </div>
        </section>
      </div>
    `;
  }

  function applyAffiliateDiscount() {
    const discountGroup = groups.find((item) => item.key === "discount");
    picks.discount = discountGroup.items.find((item) => item.id === "alpaco-vip");
    affiliatePhone.done = true;
    affiliatePhone.stage = "done";
    affiliatePhone.open = false;
    flowModalMessage = "제휴인증에 성공했습니다";
    focusGroupAfterModal = "reward";
    modalAnchorGroup = "discount";
    draw({ focusGroup: "discount" });
  }

  function applySnuReward() {
    const rewardGroup = groups.find((item) => item.key === "reward");
    picks.reward = rewardGroup.items.find((item) => item.id === "snu-reward");
    rewardPhone.done = true;
    rewardPhone.stage = "done";
    rewardPhone.open = false;
    flowModalMessage = "적립에 성공했습니다";
    focusGroupAfterModal = "payment";
    modalAnchorGroup = "reward";
    draw({ focusGroup: "reward" });
  }

  function setupBarcodeDrag() {
    const barcode = root.querySelector("[data-draggable-barcode]");
    if (!barcode) return;

    let activeTarget = null;
    const setActiveTarget = (target) => {
      if (activeTarget && activeTarget !== target) {
        activeTarget.classList.remove("is-targeted", "is-drop-correct", "is-drop-wrong");
      }
      activeTarget = target;
      if (activeTarget) {
        activeTarget.classList.add("is-targeted");
      }
    };

    barcode.addEventListener("pointerdown", (event) => {
      if (typeof event.button === "number" && event.button !== 0) return;
      event.preventDefault();

      let lastX = event.clientX;
      let lastY = event.clientY;
      const sourceRect = barcode.getBoundingClientRect();
      const ghostWidth = Math.max(145, Math.min(sourceRect.width * 0.5, 200, window.innerWidth * 0.38));
      const dragGhost = barcode.cloneNode(true);
      dragGhost.removeAttribute("data-draggable-barcode");
      dragGhost.classList.add("barcode-drag-ghost");
      dragGhost.style.width = `${ghostWidth}px`;
      dragGhost.style.maxWidth = "none";
      document.body.appendChild(dragGhost);
      barcode.classList.add("is-drag-source");
      document.body.classList.add("is-dragging-barcode");

      const moveGhost = (x, y) => {
        dragGhost.style.left = `${x}px`;
        dragGhost.style.top = `${y}px`;
      };

      const onMove = (moveEvent) => {
        lastX = moveEvent.clientX;
        lastY = moveEvent.clientY;
        moveGhost(lastX, lastY);
        const target = document.elementFromPoint(lastX, lastY)?.closest("[data-barcode-target]");
        setActiveTarget(target);
      };

      const onEnd = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onEnd);
        window.removeEventListener("pointercancel", onEnd);

        const target = document.elementFromPoint(lastX, lastY)?.closest("[data-barcode-target]");
        dragGhost.remove();
        barcode.classList.remove("is-drag-source");
        document.body.classList.remove("is-dragging-barcode");
        setActiveTarget(null);

        if (!target) {
          recordBarrier("바코드를 키오스크의 인식부까지 직접 가져다대야 합니다.");
          return;
        }
        if (target.dataset.barcodeTarget !== "scanner") {
          recordBarrier("카드 투입구나 영수증 출력구가 아니라 바코드 인식하는 곳에 대야 합니다.");
          return;
        }
        applyAffiliateDiscount();
      };

      moveGhost(lastX, lastY);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onEnd);
      window.addEventListener("pointercancel", onEnd);
    });
  }

  function setupCardDrag() {
    const card = root.querySelector("[data-draggable-card]");
    if (!card) return;

    let activeTarget = null;
    const setActiveTarget = (target) => {
      if (activeTarget && activeTarget !== target) {
        activeTarget.classList.remove("is-card-targeted", "is-drop-correct", "is-drop-wrong");
      }
      activeTarget = target;
      if (activeTarget) {
        activeTarget.classList.add("is-card-targeted");
      }
    };

    card.addEventListener("pointerdown", (event) => {
      if (typeof event.button === "number" && event.button !== 0) return;
      event.preventDefault();

      const anchorX = Number.parseFloat(card.dataset.cardAnchorX || "0.35");
      const anchorY = Number.parseFloat(card.dataset.cardAnchorY || "0.26");
      const sourceRect = card.getBoundingClientRect();
      const ghostScale = 0.58;
      const ghostWidth = Math.max(140, Math.min(sourceRect.width * ghostScale, 260, window.innerWidth * 0.42));
      const ghostRatio = ghostWidth / Math.max(sourceRect.width, 1);
      const ghostHeight = sourceRect.height * ghostRatio;
      let lastX = event.clientX;
      let lastY = event.clientY;
      const dragGhost = card.cloneNode(true);
      dragGhost.removeAttribute("data-draggable-card");
      dragGhost.classList.add("card-drag-ghost");
      dragGhost.style.width = `${ghostWidth}px`;
      dragGhost.style.height = `${ghostHeight}px`;
      document.body.appendChild(dragGhost);
      card.classList.add("is-drag-source");
      document.body.classList.add("is-dragging-card");

      const moveGhost = (x, y) => {
        dragGhost.style.left = `${x - ghostWidth * anchorX}px`;
        dragGhost.style.top = `${y - ghostHeight * anchorY}px`;
      };

      const onMove = (moveEvent) => {
        lastX = moveEvent.clientX;
        lastY = moveEvent.clientY;
        moveGhost(lastX, lastY);
        const target = document.elementFromPoint(lastX, lastY)?.closest("[data-barcode-target]");
        setActiveTarget(target);
      };

      const onEnd = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onEnd);
        window.removeEventListener("pointercancel", onEnd);

        const target = document.elementFromPoint(lastX, lastY)?.closest("[data-barcode-target]");
        dragGhost.remove();
        card.classList.remove("is-drag-source");
        document.body.classList.remove("is-dragging-card");
        setActiveTarget(null);

        if (!target || target.dataset.cardTarget !== "slot") {
          recordBarrier("카드의 가운데 부분을 카드 넣는 곳까지 직접 가져다 놓아야 합니다.");
          return;
        }

        hardware.card = true;
        flowModalMessage = "영수증을 챙겨주세요";
        focusGroupAfterModal = "";
        modalAnchorGroup = "";
        draw({ preserveScroll: true });
      };

      moveGhost(lastX, lastY);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onEnd);
      window.addEventListener("pointercancel", onEnd);
    });
  }

  function draw(options = {}) {
    const scrollState = options.preserveScroll ? captureKioskScroll(root) : null;
    const selectedOptions = selectedCartItems(picks);
    const cartItems = [...baseOrder, ...selectedOptions];
    const optionReady = selectedOptions.length === groups.length;
    const doneCount = selectedOptions.length + (hardware.card ? 1 : 0) + (hardware.receipt ? 1 : 0);
    const modalNextGroupIndex = flowModalMessage ? groups.findIndex((group) => group.key === focusGroupAfterModal) : -1;
    const activePaymentStep = modalNextGroupIndex > 0 ? modalNextGroupIndex - 1 : Math.min(doneCount, 4);
    const affiliatePhoneFocus = affiliatePhone.open && !affiliatePhone.done && ["locked", "apps", "barcode"].includes(affiliatePhone.stage);
    const affiliateScanFocus = affiliatePhone.open && !affiliatePhone.done && affiliatePhone.stage === "scan";
    const rewardPhoneFocus = rewardPhone.open && !rewardPhone.done && ["locked", "apps", "student"].includes(rewardPhone.stage);
    const hardwareFocus = picks.payment?.id === "card" && optionReady;
    const kioskClassName = [
      isKind ? "friendly-kiosk payment-kiosk" : "busy-payment-kiosk payment-kiosk",
      affiliatePhoneFocus || rewardPhoneFocus ? "phone-focus-kiosk" : "",
      affiliateScanFocus ? "barcode-scan-kiosk" : "",
      hardwareFocus ? "hardware-focus-kiosk" : ""
    ].filter(Boolean).join(" ");
    const paymentBodyContent = affiliatePhoneFocus
      ? `<div class="phone-focus-flow">${affiliatePhonePanel()}</div>`
      : affiliateScanFocus
        ? affiliateScanPanel(optionReady)
        : rewardPhoneFocus
          ? `<div class="phone-focus-flow">${rewardPhonePanel()}</div>`
          : hardwareFocus
            ? `<div class="hardware-focus-flow">${paymentHardwarePanel(optionReady)}</div>`
          : `
          <div class="payment-flow ${isKind ? "is-friendly" : ""}">
            ${groups
              .map(
                (group) => `
                  <section class="dense-section payment-section" data-payment-group="${group.key}">
                    <h4>${group.title}</h4>
                    <div class="product-grid payment-options">
                      ${group.items
                        .map((item) =>
                          productCard(
                            item,
                            `data-option-key="${group.key}" data-option-id="${item.id}"`,
                            picks[group.key]?.id === item.id ? "is-picked" : ""
                          )
                        )
                        .join("")}
                    </div>
                    ${flowModalMessage && modalAnchorGroup === group.key ? flowModal(flowModalMessage) : ""}
                  </section>
                `
              )
              .join("")}
          </div>
        `;
    const modalInsideSection = flowModalMessage && modalAnchorGroup && !affiliatePhoneFocus && !affiliateScanFocus && !rewardPhoneFocus && !hardwareFocus;
    const paymentBody = `${paymentBodyContent}${flowModalMessage && !modalInsideSection ? flowModal(flowModalMessage) : ""}`;
    root.innerHTML = kioskShell({
      brand: "모두페이",
      title: isKind ? "차근차근 결제하기" : "복잡한 결제 화면",
      subtitle: "",
      mode,
      status: `${doneCount} / 5 완료`,
      steps: ["할인", "적립", "결제", "카드", "영수증"],
      activeStep: activePaymentStep,
      guide: isKind
        ? "필요한 선택지만 단계별로 보여 주고, 기기에서 해야 할 일도 함께 안내합니다."
        : "ALPACO VIP 인증, SNU 클래스 적립, 카드 결제, 영수증 수령을 차례로 진행합니다.",
      cartItems,
      className: kioskClassName,
      body: paymentBody
    });
    restoreKioskScroll(root, scrollState);
    setupBarcodeDrag();
    setupCardDrag();

    const focusGroup = options.focusGroup || "";
    if (focusGroup) {
      const focusTarget = root.querySelector(`[data-payment-group="${focusGroup}"]`);
      if (focusTarget) {
        window.requestAnimationFrame(() => focusTarget.scrollIntoView({ block: "start", behavior: "smooth" }));
      }
    }

    const modalClose = root.querySelector("[data-flow-modal-close]");
    if (modalClose) {
      modalClose.addEventListener("click", () => {
        const nextFocus = focusGroupAfterModal;
        flowModalMessage = "";
        focusGroupAfterModal = "";
        modalAnchorGroup = "";
        if (nextFocus) {
          draw({ focusGroup: nextFocus });
        } else {
          draw({ preserveScroll: true });
        }
      });
    }

    root.querySelectorAll("[data-option-key]").forEach((button) => {
      button.addEventListener("click", () => {
        const group = groups.find((item) => item.key === button.dataset.optionKey);
        const selected = group.items.find((item) => item.id === button.dataset.optionId);
        if (!selected) return;
        if (selected.id !== group.correct) {
          recordBarrier(isKind ? "목표와 다른 선택입니다. 안내를 다시 확인해 보세요." : "선택지가 너무 많아 필요한 결제 절차를 찾기 어렵습니다.");
          return;
        }
        if (group.key === "discount" && selected.id === "alpaco-vip" && !affiliatePhone.done) {
          affiliatePhone.open = true;
          affiliatePhone.stage = "locked";
          draw({ preserveScroll: true });
          return;
        }
        if (group.key === "reward" && selected.id === "snu-reward" && !rewardPhone.done) {
          if (!rewardPhone.open) {
            rewardPhone.studentNumber = randomStudentNumber();
          }
          rewardPhone.open = true;
          rewardPhone.stage = "locked";
          draw({ preserveScroll: true });
          return;
        }
        picks[group.key] = selected;
        if (group.key === "payment" && selected.id === "card") {
          draw();
          return;
        }
        draw({ preserveScroll: true });
      });
    });

    root.querySelectorAll("[data-phone-action]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.phoneAction === "wake") {
          affiliatePhone.stage = "apps";
          draw({ preserveScroll: true });
          return;
        }
        if (["show-points", "show-coupons", "show-history"].includes(button.dataset.phoneAction)) {
          recordBarrier("제휴할인에는 포인트나 쿠폰함이 아니라 바코드 생성 메뉴가 필요합니다.");
          return;
        }
        if (button.dataset.phoneAction === "generate-barcode") {
          affiliatePhone.stage = "scan";
          draw({ preserveScroll: true });
        }
      });
    });

    root.querySelectorAll("[data-barcode-target]").forEach((button) => {
      button.addEventListener("click", () => {
        if (affiliatePhone.stage !== "scan" || affiliatePhone.done) return;
        recordBarrier("바코드는 버튼처럼 누르는 것이 아니라, 스마트폰 화면을 인식부에 가져다대야 합니다.");
      });
    });

    root.querySelectorAll("[data-affiliate-app]").forEach((button) => {
      button.addEventListener("click", () => {
        const app = affiliateApps.find((item) => item.id === button.dataset.affiliateApp);
        if (!app) return;
        if (!app.correct) {
          recordBarrier("키오스크의 제휴할인 이름과 스마트폰 앱 이름을 다시 맞춰야 합니다.");
          return;
        }
        affiliatePhone.stage = "barcode";
        affiliatePhone.open = true;
        draw({ preserveScroll: true });
      });
    });

    root.querySelectorAll("[data-reward-phone-action]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.rewardPhoneAction === "wake") {
          rewardPhone.stage = "apps";
          draw({ preserveScroll: true });
        }
      });
    });

    root.querySelectorAll("[data-reward-app]").forEach((button) => {
      button.addEventListener("click", () => {
        const app = affiliateApps.find((item) => item.id === button.dataset.rewardApp);
        if (!app) return;
        if (app.id !== "snu-app") {
          recordBarrier("적립하려는 서비스와 같은 SNU 클래스 앱을 찾아야 학생번호를 확인할 수 있습니다.");
          return;
        }
        rewardPhone.stage = "student";
        rewardPhone.open = true;
        draw({ preserveScroll: true });
      });
    });

    const studentIdForm = root.querySelector("[data-student-id-form]");
    if (studentIdForm) {
      studentIdForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const input = root.querySelector("[data-student-id-input]");
        const value = input ? input.value.trim().toUpperCase() : "";
        if (value !== rewardPhone.studentNumber) {
          recordBarrier("스마트폰 앱에 표시된 대문자 영어와 숫자를 키오스크에 정확히 입력해야 합니다.");
          if (input) input.focus();
          return;
        }
        applySnuReward();
      });
    }

    root.querySelectorAll("[data-hardware]").forEach((button) => {
      button.addEventListener("click", () => {
        if (affiliatePhone.stage === "scan" && !affiliatePhone.done) {
          return;
        }
        if (!optionReady) {
          recordBarrier("할인, 적립, 결제수단을 먼저 통과해야 기기 조작을 할 수 있습니다.");
          return;
        }
        if (button.dataset.hardware === "card") {
          if (!hardware.card) {
            recordBarrier("결제 카드를 카드 넣는 곳으로 끌어다 놓아야 합니다.");
          }
          return;
        }
        if (!hardware.card) {
          recordBarrier("결제 카드를 넣은 뒤 영수증과 번호표가 나오는 곳을 확인해야 합니다.");
          return;
        }
        hardware.receipt = true;
        completeStation("결제 단계가 많고 기기 조작 위치가 흩어져 있으면 마지막까지 놓치기 쉽습니다.");
        showCompletion(root, "결제 화면은 할인, 적립, 결제, 카드 투입, 영수증 수령을 한 단계씩 명확하게 안내해야 합니다.");
      });
    });

    root.querySelector("[data-cart-action]").addEventListener("click", () => {
      if (!optionReady) {
        recordBarrier("제휴할인, 적립 방법, 결제수단을 모두 선택해야 합니다.");
        return;
      }
      if (!hardware.card) {
        recordBarrier("결제 카드를 먼저 카드 넣는 곳으로 끌어다 놓아야 합니다.");
        root.querySelector("[data-draggable-card]")?.scrollIntoView({ block: "center", behavior: "smooth" });
        return;
      }
      root.querySelector("[data-hardware='receipt']").click();
    });
  }

  draw();
}

function renderFriendlyPicker(root, config) {
  const selectedByGroup = {};
  root.innerHTML = `
    <div class="kiosk-screen">
      <div class="kiosk-top">
        <h3>${config.title}</h3>
        <span class="status-pill">0 / ${config.correctLabels.length}</span>
      </div>
      <p class="kiosk-help">${config.help}</p>
      <div class="friendly-picker">
        ${config.groups
          .map(
            (group, groupIndex) => `
              <div class="choice-row" data-group="${groupIndex}">
                ${group.map((label) => `<button class="choice-button" type="button" data-choice="${label}">${label}</button>`).join("")}
              </div>
            `
          )
          .join("")}
      </div>
    </div>
  `;

  root.querySelectorAll("[data-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const row = button.closest(".choice-row");
      const groupIndex = row.dataset.group;
      row.querySelectorAll(".choice-button").forEach((item) => item.classList.remove("is-picked"));
      button.classList.add("is-picked");
      selectedByGroup[groupIndex] = button.dataset.choice;
      const picked = Object.values(selectedByGroup).filter((label) => config.correctLabels.includes(label));
      const status = root.querySelector(".status-pill");
      status.textContent = `${picked.size} / ${config.correctLabels.length}`;
      if (picked.size === config.correctLabels.length) {
        completeStation(config.doneMessage);
        showCompletion(root, config.doneMessage);
      }
    });
  });
}

function renderAlienStation(root, mode) {
  const isKind = mode === "kind";
  const picks = {};
  let alienSuccessMessage = "";
  let alienSuccessAction = "";
  const groups = isKind
    ? [
        {
          key: "drink",
          title: "음료",
          correct: "barley-hot",
          items: [
            { id: "barley-hot", label: "따뜻한 보리차", desc: "카페인이 적은 차", price: 2500, visual: "cup" },
            { id: "barley-ice", label: "차가운 보리차", desc: "얼음 포함", price: 2500, visual: "cup" },
            { id: "milk", label: "딸기 우유", desc: "달콤한 우유", price: 3200, visual: "cup" },
            { id: "citron-hot", label: "따뜻한 유자차", desc: "달콤한 과일차", price: 3000, visual: "cup" },
            { id: "ice-tea", label: "아이스티", desc: "차가운 홍차", price: 2800, visual: "cup" }
          ]
        },
        {
          key: "serve",
          title: "받는 방법",
          correct: "takeout",
          items: [
            { id: "here", label: "매장 이용", desc: "컵에 제공", price: 0, mark: "매" },
            { id: "takeout", label: "포장", desc: "뚜껑 있는 컵", price: 0, mark: "포" },
            { id: "later", label: "나중에 받기", desc: "대기 후 수령", price: 0, mark: "대" }
          ]
        },
        {
          key: "sugar",
          title: "단맛",
          correct: "zero",
          items: [
            { id: "normal", label: "보통", desc: "기본 단맛", price: 0, mark: "보" },
            { id: "zero", label: "설탕 없음", desc: "단맛 추가 없음", price: 0, mark: "무" },
            { id: "more", label: "많이", desc: "달게", price: 0, mark: "다" }
          ]
        }
      ]
    : [
        {
          key: "drink",
          title: "Beverage",
          correct: "barley-hot-hard",
          items: [
            { id: "barley-ice-hard", label: "Iced Barley Tea", price: 2500, noArt: true },
            { id: "barley-hot-hard", label: "Hot Barley Tea", price: 2500, noArt: true },
            { id: "milk-hard", label: "Strawberry Milk", price: 3200, noArt: true },
            { id: "citron-hot-hard", label: "Hot Citron Tea", price: 3000, noArt: true },
            { id: "ice-tea-hard", label: "Iced Tea", price: 2800, noArt: true }
          ]
        },
        {
          key: "serve",
          title: "Pickup",
          correct: "takeout-hard",
          items: [
            { id: "here-hard", label: "Eat In", price: 0, noArt: true },
            { id: "later-hard", label: "Pick Up Later", price: 0, noArt: true },
            { id: "takeout-hard", label: "Take Out", price: 0, noArt: true }
          ]
        },
        {
          key: "sugar",
          title: "Sweetness",
          correct: "no-sugar-hard",
          items: [
            { id: "no-sugar-hard", label: "No Sugar", price: 0, noArt: true },
            { id: "regular-hard", label: "Regular Sweet", price: 0, noArt: true },
            { id: "extra-sweet-hard", label: "Extra Sweet", price: 0, noArt: true }
          ]
        }
      ];

  function draw(options = {}) {
    const scrollState = options.preserveScroll ? captureKioskScroll(root) : null;
    const cartItems = selectedCartItems(picks);
    const nextGroupIndex = groups.findIndex((group) => !picks[group.key]);
    const activeGroupIndex = nextGroupIndex === -1 ? groups.length - 1 : nextGroupIndex;
    const activeGroup = groups[activeGroupIndex];
    root.innerHTML = kioskShell({
      brand: "모두티",
      title: isKind ? "쉬운 말로 주문하기" : "낯선 말로 주문하기",
      subtitle: isKind ? "따뜻한 보리차, 포장, 설탕 없음을 고릅니다." : "영어와 짧은 안내만 보고 목표 옵션을 찾아야 합니다.",
      mode,
      status: `${cartItems.length} / 3 선택`,
      steps: ["음료", "수령", "옵션"],
      activeStep: activeGroupIndex,
      guide: isKind
        ? "따뜻한 보리차, 포장, 설탕 없음을 쉬운 말과 설명으로 확인합니다."
        : "따뜻한 보리차, 포장, 설탕 없음을 영어 메뉴와 짧은 안내만 보고 찾아봅니다.",
      cartItems,
      className: isKind ? "friendly-kiosk" : "alien-kiosk",
      body: `
        <div class="category-tabs">
          ${groups.map((group, index) => `<span class="category-tab ${index === activeGroupIndex ? "is-active" : ""} ${picks[group.key] ? "is-complete" : ""}">${group.title}</span>`).join("")}
        </div>
        <div class="alien-order">
          <section class="dense-section alien-active-section">
            <h4>${activeGroup.title}</h4>
            <div class="product-grid compact-products">
              ${activeGroup.items
                .map((item) =>
                  productCard(
                    item,
                    `data-option-key="${activeGroup.key}" data-option-id="${item.id}"`,
                    picks[activeGroup.key]?.id === item.id ? "is-picked" : ""
                  )
                )
                .join("")}
            </div>
          </section>
        </div>
        ${alienSuccessMessage ? flowModal(alienSuccessMessage) : ""}
      `
    });
    restoreKioskScroll(root, scrollState);

    const modalClose = root.querySelector("[data-flow-modal-close]");
    if (modalClose) {
      modalClose.addEventListener("click", () => {
        const action = alienSuccessAction;
        alienSuccessMessage = "";
        alienSuccessAction = "";
        if (action === "complete") {
          completeStation(isKind ? "쉬운 말과 설명이 있으면 처음 보는 메뉴도 고를 수 있습니다." : "낯선 말과 부족한 설명은 디지털 기기가 익숙하지 않은 사람에게 주문 장벽이 됩니다.");
          showCompletion(root, "실제 주문 화면에서도 쉬운 말과 그림 설명이 필요합니다.");
          return;
        }
        draw();
      });
    }

    root.querySelectorAll("[data-option-key]").forEach((button) => {
      button.addEventListener("click", () => {
        const group = groups.find((item) => item.key === button.dataset.optionKey);
        const selected = group.items.find((item) => item.id === button.dataset.optionId);
        if (!selected) return;
        if (selected.id !== group.correct) {
          recordBarrier(isKind ? "선택 조건을 다시 읽어 보세요." : "버튼을 못 누른 것이 아니라, 화면의 말이 충분히 친절하지 않았습니다.");
          return;
        }
        picks[group.key] = selected;
        if (Object.keys(picks).length === groups.length) {
          alienSuccessMessage = "잘 골랐습니다. 목표 메뉴를 모두 찾았습니다.";
          alienSuccessAction = "complete";
          draw();
          return;
        }
        alienSuccessMessage = "잘 골랐습니다. 다음 항목을 찾아보세요.";
        alienSuccessAction = "next";
        draw();
      });
    });

    root.querySelector("[data-cart-action]").addEventListener("click", () => {
      recordBarrier("세 가지 조건을 모두 선택해야 결제할 수 있습니다.");
    });
  }

  draw();
}

function renderContrastStation(root, mode) {
  const isKind = mode === "kind";
  let coupon = "";
  const baseItems = [
    { label: "치즈버거", price: 7900 },
    { label: "감자튀김", price: 0 }
  ];
  const coupons = [
    { id: "500", label: isKind ? "500원 할인 쿠폰" : "A", desc: isKind ? "작은 동그라미 표시" : "색상으로 구분", price: -500, mark: "A" },
    { id: "1000", label: isKind ? "1,000원 할인 쿠폰" : "B", desc: isKind ? "굵은 테두리 표시" : "색상으로 구분", price: -1000, mark: "B" },
    { id: "2000", label: isKind ? "2,000원 할인 쿠폰" : "C", desc: isKind ? "파란 사각형 표시" : "색상으로 구분", price: -2000, mark: "C" }
  ];

  function draw() {
    const selectedCoupon = coupons.find((item) => item.id === coupon);
    const cartItems = selectedCoupon ? [...baseItems, selectedCoupon] : baseItems;
    root.innerHTML = kioskShell({
      brand: "모두버거",
      title: isKind ? "쿠폰을 적용하고 결제하기" : "흐릿한 결제 화면",
      subtitle: "1,000원 할인 쿠폰을 적용한 뒤 결제합니다.",
      mode,
      status: selectedCoupon ? "쿠폰 적용" : "결제 대기",
      steps: ["주문", "쿠폰", "결제"],
      activeStep: selectedCoupon ? 2 : 1,
      guide: isKind ? "색뿐 아니라 금액과 모양 설명을 함께 표시합니다." : "낮은 대비와 색상 단서만으로 쿠폰을 구분해야 합니다.",
      cartItems,
      className: isKind ? "friendly-kiosk" : "low-contrast-kiosk",
      body: `
        <div class="checkout-layout">
          <section class="receipt-preview">
            <h4>주문 확인</h4>
            <p>결제 전 할인 쿠폰을 선택해 주세요.</p>
            <div class="receipt-total">${formatWon(cartItems.reduce((sum, item) => sum + item.price, 0))}</div>
          </section>
          <section class="coupon-panel">
            <h4>쿠폰 선택</h4>
            <div class="coupon-row real-coupons">
              ${coupons
                .map(
                  (item) => `
                    <button class="coupon-card ${coupon === item.id ? "is-picked" : ""}" type="button" data-coupon="${item.id}">
                      <span class="coupon-shape coupon-${item.id}"></span>
                      <b>${item.label}</b>
                      <small>${item.desc}</small>
                    </button>
                  `
                )
                .join("")}
            </div>
            <button class="pay-button" type="button" data-pay="true">카드로 결제하기</button>
          </section>
        </div>
      `
    });

    root.querySelectorAll("[data-coupon]").forEach((button) => {
      button.addEventListener("click", () => {
        coupon = button.dataset.coupon;
        if (coupon !== "1000" && !isKind) {
          recordBarrier("흐린 화면과 색깔만 있는 안내 때문에 쿠폰을 구분하기 어렵습니다.");
        }
        draw();
      });
    });

    root.querySelector("[data-pay]").addEventListener("click", () => {
      if (coupon === "1000") {
        completeStation("낮은 대비와 색상 의존은 시각 정보 접근을 어렵게 만듭니다.");
        showCompletion(root, "결제 화면에서는 선명한 글자와 여러 단서를 함께 제공해야 합니다.");
      } else {
        recordBarrier("원하는 쿠폰이 적용되었는지 확인하기 어렵습니다.");
      }
    });

    root.querySelector("[data-cart-action]").addEventListener("click", () => {
      root.querySelector("[data-pay]").click();
    });
  }

  draw();
}

function renderAudioStation(root, mode) {
  const isKind = mode === "kind";
  const sequence = ["start", "pediatrics", "print"];
  const picked = [];
  const choices = [
    { id: "start", label: isKind ? "접수 시작" : "", desc: isKind ? "첫 번째로 누르기" : "음성 안내 필요", price: 0, mark: "1" },
    { id: "pediatrics", label: isKind ? "소아과 선택" : "", desc: isKind ? "두 번째로 누르기" : "음성 안내 필요", price: 0, mark: "2" },
    { id: "print", label: isKind ? "번호표 출력" : "", desc: isKind ? "세 번째로 누르기" : "음성 안내 필요", price: 0, mark: "3" }
  ];

  function draw() {
    const cartItems = picked.map((id, index) => {
      const item = choices.find((choice) => choice.id === id);
      return { label: item.label || `단계 ${index + 1}`, price: 0 };
    });
    root.innerHTML = kioskShell({
      brand: "모두병원",
      title: isKind ? "자막 있는 번호표 접수" : "소리만 나오는 번호표 접수",
      subtitle: "소아과 접수 번호표를 뽑아 보세요.",
      mode,
      status: `${picked.length} / 3 단계`,
      steps: ["시작", "진료과", "출력"],
      activeStep: Math.min(picked.length, 2),
      guide: isKind ? "음성 안내와 같은 내용을 화면에도 표시합니다." : "안내 내용이 소리로만 나오고 버튼에는 글자가 없습니다.",
      cartItems,
      className: isKind ? "friendly-kiosk hospital-kiosk" : "audio-only-kiosk hospital-kiosk",
      body: `
        <div class="hospital-board">
          <button class="announce-button" type="button" data-speak="true">${isKind ? "안내 다시 듣기" : "음성 안내 듣기"}</button>
          ${isKind ? `<p class="caption-strip">왼쪽부터 접수 시작, 소아과 선택, 번호표 출력 순서로 누르세요.</p>` : ""}
          <div class="product-grid hospital-options">
            ${choices
              .map((item) =>
                productCard(
                  item,
                  `data-audio-choice="${item.id}"`,
                  picked.includes(item.id) ? "is-picked hospital-card" : "hospital-card"
                )
              )
              .join("")}
          </div>
        </div>
      `
    });

    root.querySelector("[data-speak]").addEventListener("click", () => {
      speak("왼쪽부터 접수 시작, 소아과 선택, 번호표 출력 순서로 누르세요.");
    });

    root.querySelectorAll("[data-audio-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        const expected = sequence[picked.length];
        const actual = button.dataset.audioChoice;
        if (actual !== expected) {
          recordBarrier(isKind ? "화면 안내를 다시 확인해 보세요." : "소리 안내만 있으면 놓쳤을 때 다시 알기 어렵습니다.");
          picked.length = 0;
          draw();
          return;
        }
        picked.push(actual);
        if (picked.length === sequence.length) {
          completeStation("소리 안내만으로는 청각 장애나 시끄러운 환경을 고려하기 어렵습니다.");
          showCompletion(root, "음성 안내에는 자막과 단계 표시가 함께 필요합니다.");
          return;
        }
        draw();
      });
    });

    root.querySelector("[data-cart-action]").addEventListener("click", () => {
      recordBarrier("번호표 출력까지 단계대로 눌러야 접수가 완료됩니다.");
    });
  }

  draw();
}

function shapeButton(shape, caption) {
  if (!caption) {
    return `
      <button class="shape-button" type="button" data-shape="${shape}">
        <span class="shape ${shape}"></span>
      </button>
    `;
  }

  return `
    <button class="caption-button" type="button" data-shape="${shape}">
      <span class="shape ${shape}"></span>
      <strong>${caption}</strong>
    </button>
  `;
}

function speak(text) {
  if (!("speechSynthesis" in window)) {
    showToast("이 브라우저에서는 음성 안내를 재생할 수 없습니다.");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ko-KR";
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

function renderSummary() {
  els.summaryList.innerHTML = stations
    .map(
      (station) => `
        <div class="summary-item">
          <h3>${station.principle}</h3>
          <p>${station.summary}</p>
        </div>
      `
    )
    .join("");
}

els.startButton.addEventListener("click", () => {
  els.stationCards.scrollIntoView({ block: "start", behavior: "smooth" });
  els.stationCards.querySelector("[data-station]")?.focus({ preventScroll: true });
});
els.restartButton.addEventListener("click", returnHome);
els.stationBackButton.addEventListener("click", returnHome);

els.challengeMode.addEventListener("click", () => {
  state.mode = "challenge";
  state.kioskStarted = false;
  renderStation();
});

els.kindMode.addEventListener("click", () => {
  state.mode = "kind";
  state.kioskStarted = false;
  renderStation();
});

renderCards();
renderProgress();
