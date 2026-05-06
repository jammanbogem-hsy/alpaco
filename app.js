const stations = [
  {
    id: "timer",
    badge: "3초",
    title: "3초 뒤 사라지는 주문 키오스크",
    short: "고민할 시간이 부족한 화면",
    mission: "치즈버거 세트, 감자튀김, 카드 결제까지 완료해 보세요.",
    kicker: "시간 장벽",
    insight: "충분한 시간, 멈춤 버튼, 이전 단계로 돌아가기 버튼이 있어야 합니다.",
    principle: "시간을 넉넉하게",
    summary: "화면 제한 시간을 늘리고, 연장 버튼과 뒤로 가기 버튼을 함께 둡니다."
  },
  {
    id: "tiny",
    badge: "작음",
    title: "콩알 버튼 키오스크",
    short: "작고 촘촘한 터치 버튼",
    mission: "두유 라떼, 따뜻하게, 포장 주문을 찾아 선택해 보세요.",
    kicker: "터치 장벽",
    insight: "손 떨림이나 시력 저하가 있어도 누를 수 있도록 버튼이 커야 합니다.",
    principle: "버튼을 크게",
    summary: "터치 영역을 넓히고 메뉴 사이 간격을 충분히 둡니다."
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
    summary: "외래어와 줄임말을 줄이고, 쉬운 설명과 그림 단서를 제공합니다."
  },
  {
    id: "contrast",
    badge: "색",
    title: "흐릿흐릿 색깔 키오스크",
    short: "낮은 대비와 색깔만 있는 안내",
    mission: "1,000원 할인 쿠폰을 적용하고 결제해 보세요.",
    kicker: "시각 장벽",
    insight: "색깔만으로 구분하지 않고 글자, 모양, 명확한 대비를 함께 써야 합니다.",
    principle: "대비를 선명하게",
    summary: "글자와 배경의 명암을 키우고 색상 외의 표시를 함께 씁니다."
  },
  {
    id: "audio",
    badge: "소리",
    title: "소리만 알려주는 번호표 키오스크",
    short: "자막 없는 음성 안내",
    mission: "소아과 접수 번호표를 뽑아 보세요.",
    kicker: "청각 장벽",
    insight: "음성 안내에는 자막, 화면 안내, 다시 듣기 기능이 함께 필요합니다.",
    principle: "소리와 글자를 함께",
    summary: "음성 안내를 화면 자막과 단계 표시로도 제공합니다."
  }
];

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
  stationRail: document.querySelector("#stationRail"),
  stationCards: document.querySelector("#stationCards"),
  startButton: document.querySelector("#startButton"),
  summaryRailButton: document.querySelector("#summaryRailButton"),
  restartButton: document.querySelector("#restartButton"),
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
  renderRail();
}

function renderRail() {
  els.stationRail.innerHTML = stations
    .map((station) => {
      const active = station.id === state.currentId ? " is-active" : "";
      const done = state.completed.has(station.id) ? " is-done" : "";
      return `
        <button class="rail-item${active}${done}" type="button" data-station="${station.id}">
          <span class="rail-badge">${station.badge}</span>
          <span class="rail-label">${station.title}</span>
        </button>
      `;
    })
    .join("");

  els.stationRail.querySelectorAll("[data-station]").forEach((button) => {
    button.addEventListener("click", () => openStation(button.dataset.station));
  });
}

function renderCards() {
  els.stationCards.innerHTML = stations
    .map(
      (station) => `
        <button class="station-card" type="button" data-station="${station.id}">
          <span class="monster-token">${station.badge}</span>
          <span>
            <p class="section-kicker">${station.kicker}</p>
            <h3>${station.title}</h3>
            <p>${station.short}</p>
          </span>
        </button>
      `
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

function showCompletion(root, message) {
  const station = currentStation();
  const next = nextStationId();
  root.innerHTML = `
    <div class="kiosk-screen">
      <div class="completion-panel">
        <h3>${station.title} 완료</h3>
        <p>${message}</p>
        <p>사용자가 느린 것이 아니라, 화면이 불친절했을 수 있습니다.</p>
        <button class="next-button" type="button">${next ? "다음 체험" : "돌아보기"}</button>
      </div>
    </div>
  `;
  root.querySelector(".next-button").addEventListener("click", () => {
    if (next) {
      openStation(next);
    } else {
      showView("summary");
    }
  });
}

function nextStationId() {
  const index = stations.findIndex((station) => station.id === state.currentId);
  return stations[index + 1]?.id || null;
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
  const art = item.visual ? foodArt(item.visual) : `<span class="text-art">${item.mark || item.label.slice(0, 1)}</span>`;

  return `
    <button class="product-card ${extraClass}" type="button" ${attrs}>
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
  const station = currentStation();
  const hero = kioskHeroFor(station?.id || "timer");
  return `
    <div class="kiosk-stage ${mode === "challenge" ? "challenge" : ""}">
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
            <section class="kiosk-promo">
              <div>
                <p>${hero.title}</p>
                <h3>${hero.name}</h3>
                <span>${hero.copy}</span>
              </div>
              <div class="promo-art">${hero.art}</div>
            </section>
            <section class="kiosk-order-main">
              <div class="order-board">
                <div class="order-heading">
                  <div>
                    <h3>${title}</h3>
                    <p>${subtitle}</p>
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

function kioskHeroFor(stationId) {
  const heroes = {
    timer: {
      brand: "모두버거",
      title: "오늘의 추천 메뉴",
      name: "치즈버거 세트",
      copy: "버거, 감자튀김, 음료를 한 번에 주문해 보세요.",
      art: foodArt("combo")
    },
    tiny: {
      brand: "알파카페",
      title: "따뜻한 음료 추천",
      name: "두유 라떼",
      copy: "온도와 포장 옵션을 차례대로 선택합니다.",
      art: foodArt("cup")
    },
    alien: {
      brand: "모두티",
      title: "오늘의 차 메뉴",
      name: "따뜻한 보리차",
      copy: "쉬운 말과 어려운 코드 메뉴를 비교합니다.",
      art: foodArt("cup")
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
  root.innerHTML = `
    <div class="kiosk-stage">
      <div class="kiosk-hardware start-hardware">
        <div class="kiosk-device-screen start-device-screen">
          <header class="start-hero">
            <div class="start-copy">
              <p>${hero.brand}</p>
              <h3>${hero.title}</h3>
              <strong>${hero.name}</strong>
              <span>${hero.copy}</span>
            </div>
            <div class="start-art">${hero.art}</div>
          </header>
          <section class="start-panel">
            <p class="section-kicker">${modeLabel}</p>
            <h3>${station.title}</h3>
            <p>${station.mission}</p>
            <button class="kiosk-start-button" type="button" data-kiosk-start="true">주문 시작</button>
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

  root.querySelector("[data-kiosk-start]").addEventListener("click", () => {
    state.kioskStarted = true;
    renderStation();
  });
}

function renderTimerStation(root, mode) {
  const isKind = mode === "kind";
  const steps = [
    {
      label: "메뉴",
      key: "menu",
      title: "메뉴를 골라 주세요",
      subtitle: "버거 세트를 선택하면 다음 단계로 이동합니다.",
      guide: isKind ? "시간 제한 없이 메뉴 설명과 가격을 확인할 수 있습니다." : "3초 안에 골라야 해서 메뉴를 비교하기 어렵습니다.",
      correct: "cheese-set",
      items: [
        { id: "bulgogi", label: "불고기버거", desc: "달콤한 간장 소스", price: 5200, visual: "burger" },
        { id: "cheese-set", label: "치즈버거 세트", desc: "버거, 감자튀김, 음료", price: 7900, visual: "combo" },
        { id: "shrimp", label: "새우버거", desc: "바삭한 새우 패티", price: 6100, visual: "burger" },
        { id: "wrap", label: "치킨랩", desc: "또띠아와 치킨", price: 5400, visual: "wrap" }
      ]
    },
    {
      label: "사이드",
      key: "side",
      title: "사이드를 선택해 주세요",
      subtitle: "세트에 포함할 사이드를 고릅니다.",
      guide: isKind ? "현재 단계와 이전 선택이 장바구니에 계속 표시됩니다." : "조금만 늦어도 첫 화면으로 돌아갑니다.",
      correct: "fries",
      items: [
        { id: "salad", label: "샐러드", desc: "상큼한 채소", price: 0, visual: "salad" },
        { id: "fries", label: "감자튀김", desc: "기본 사이드", price: 0, visual: "fries" },
        { id: "stick", label: "치즈스틱", desc: "추가 800원", price: 800, visual: "stick" },
        { id: "corn", label: "콘샐러드", desc: "달콤한 옥수수", price: 0, visual: "salad" }
      ]
    },
    {
      label: "결제",
      key: "payment",
      title: "결제 방법을 선택해 주세요",
      subtitle: "카드 결제를 선택하면 주문이 완료됩니다.",
      guide: isKind ? "결제 전 주문 내역을 다시 확인할 수 있습니다." : "시간 압박 때문에 결제 방법도 급하게 고르게 됩니다.",
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
      guide: current.guide,
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
  const groups = [
    {
      key: "drink",
      title: "음료",
      correct: "soy-latte",
      items: [
        { id: "milk-tea", label: "밀크티", desc: "M-14", price: 4300, visual: "cup" },
        { id: "soy-latte", label: "두유 라떼", desc: "D2", price: 4800, visual: "cup" },
        { id: "ade", label: "레몬 에이드", desc: "A-9", price: 4500, visual: "cup" },
        { id: "cocoa", label: "코코아", desc: "C7", price: 4200, visual: "cup" }
      ]
    },
    {
      key: "temp",
      title: "온도",
      correct: "hot",
      items: [
        { id: "ice", label: "차갑게", desc: "ICE", price: 0, mark: "I" },
        { id: "hot", label: "따뜻하게", desc: "HOT", price: 0, mark: "H" },
        { id: "less-ice", label: "얼음 적게", desc: "L-ICE", price: 0, mark: "L" }
      ]
    },
    {
      key: "serve",
      title: "받는 방법",
      correct: "takeout",
      items: [
        { id: "store", label: "매장", desc: "HERE", price: 0, mark: "매" },
        { id: "takeout", label: "포장", desc: "TO-GO", price: 0, mark: "포" },
        { id: "later", label: "나중에", desc: "WAIT", price: 0, mark: "후" }
      ]
    }
  ];

  function draw() {
    const cartItems = selectedCartItems(picks);
    root.innerHTML = kioskShell({
      brand: "알파카페",
      title: isKind ? "카페 주문하기" : "작고 촘촘한 카페 주문",
      subtitle: "두유 라떼, 따뜻하게, 포장을 선택해 보세요.",
      mode,
      status: `${cartItems.length} / 3 선택`,
      steps: ["음료", "온도", "수령"],
      activeStep: Math.min(cartItems.length, 2),
      guide: isKind ? "큰 카드와 분리된 단계 덕분에 손이 흔들려도 다시 고르기 쉽습니다." : "메뉴, 옵션, 포장 버튼이 한 화면에 촘촘히 몰려 있습니다.",
      cartItems,
      className: isKind ? "friendly-kiosk" : "dense-kiosk",
      body: `
        <div class="dense-order ${isKind ? "is-friendly" : ""}">
          ${groups
            .map(
              (group) => `
                <section class="dense-section">
                  <h4>${group.title}</h4>
                  <div class="product-grid ${isKind ? "" : "tiny-products"}">
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
                </section>
              `
            )
            .join("")}
        </div>
      `
    });

    root.querySelectorAll("[data-option-key]").forEach((button) => {
      button.addEventListener("click", () => {
        const group = groups.find((item) => item.key === button.dataset.optionKey);
        const selected = group.items.find((item) => item.id === button.dataset.optionId);
        if (!selected) return;
        if (selected.id !== group.correct && !isKind) {
          recordBarrier("버튼이 작고 가까워서 다른 메뉴나 옵션을 누르기 쉽습니다.");
          return;
        }
        if (selected.id !== group.correct) {
          recordBarrier("선택 조건을 다시 확인해 보세요.");
          return;
        }
        picks[group.key] = selected;
        if (Object.keys(picks).length === groups.length) {
          completeStation("작은 터치 영역은 손 떨림이 있는 사람에게 큰 장벽이 됩니다.");
          showCompletion(root, "실제 주문 화면에서는 버튼 크기와 간격이 주문 성공을 좌우합니다.");
          return;
        }
        draw();
      });
    });

    root.querySelector("[data-cart-action]").addEventListener("click", () => {
      recordBarrier("음료, 온도, 받는 방법을 모두 선택해야 결제할 수 있습니다.");
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
  const groups = isKind
    ? [
        {
          key: "drink",
          title: "음료",
          correct: "barley-hot",
          items: [
            { id: "barley-hot", label: "따뜻한 보리차", desc: "카페인이 적은 차", price: 2500, visual: "cup" },
            { id: "barley-ice", label: "차가운 보리차", desc: "얼음 포함", price: 2500, visual: "cup" },
            { id: "milk", label: "딸기 우유", desc: "달콤한 우유", price: 3200, visual: "cup" }
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
          title: "DRK",
          correct: "b-th",
          items: [
            { id: "ice-b", label: "ICE-B", desc: "B02", price: 2500, visual: "cup" },
            { id: "b-th", label: "B-TH", desc: "T-HOT", price: 2500, visual: "cup" },
            { id: "st-mk", label: "ST-MK", desc: "M07", price: 3200, visual: "cup" }
          ]
        },
        {
          key: "serve",
          title: "WAY",
          correct: "t-out",
          items: [
            { id: "in-h", label: "IN-H", desc: "H01", price: 0, mark: "I" },
            { id: "t-out", label: "T-OUT", desc: "T02", price: 0, mark: "T" },
            { id: "l-pk", label: "L-PK", desc: "L03", price: 0, mark: "L" }
          ]
        },
        {
          key: "sugar",
          title: "SW",
          correct: "s-0",
          items: [
            { id: "s-2", label: "S-2", desc: "SW2", price: 0, mark: "2" },
            { id: "s-0", label: "S-0", desc: "SW0", price: 0, mark: "0" },
            { id: "s-m", label: "S-M", desc: "SWM", price: 0, mark: "M" }
          ]
        }
      ];

  function draw() {
    const cartItems = selectedCartItems(picks);
    root.innerHTML = kioskShell({
      brand: "모두티",
      title: isKind ? "쉬운 말로 주문하기" : "코드 메뉴 주문하기",
      subtitle: isKind ? "따뜻한 보리차, 포장, 설탕 없음을 고릅니다." : "B-TH, T-OUT, S-0을 찾아야 합니다.",
      mode,
      status: `${cartItems.length} / 3 선택`,
      steps: ["음료", "수령", "옵션"],
      activeStep: Math.min(cartItems.length, 2),
      guide: isKind ? "메뉴 이름과 설명을 함께 보여 줍니다." : "줄임말과 코드만 있어 의미를 추측해야 합니다.",
      cartItems,
      className: isKind ? "friendly-kiosk" : "alien-kiosk",
      body: `
        <div class="category-tabs">
          ${groups.map((group, index) => `<span class="category-tab ${index === 0 ? "is-active" : ""}">${group.title}</span>`).join("")}
        </div>
        <div class="alien-order">
          ${groups
            .map(
              (group) => `
                <section class="dense-section">
                  <h4>${group.title}</h4>
                  <div class="product-grid compact-products">
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
                </section>
              `
            )
            .join("")}
        </div>
      `
    });

    root.querySelectorAll("[data-option-key]").forEach((button) => {
      button.addEventListener("click", () => {
        const group = groups.find((item) => item.key === button.dataset.optionKey);
        const selected = group.items.find((item) => item.id === button.dataset.optionId);
        if (!selected) return;
        if (selected.id !== group.correct) {
          recordBarrier(isKind ? "선택 조건을 다시 읽어 보세요." : "코드와 줄임말만 보고는 원하는 메뉴를 알아내기 어렵습니다.");
          return;
        }
        picks[group.key] = selected;
        if (Object.keys(picks).length === groups.length) {
          completeStation(isKind ? "쉬운 말과 설명이 있으면 처음 보는 메뉴도 고를 수 있습니다." : "어려운 말은 디지털 문해력이 낮은 사람에게 주문 장벽이 됩니다.");
          showCompletion(root, "실제 주문 화면에서도 쉬운 말과 그림 설명이 필요합니다.");
          return;
        }
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
    { label: "치즈버거 세트", price: 7900 },
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

els.startButton.addEventListener("click", () => openStation(stations[0].id));
els.summaryRailButton.addEventListener("click", () => showView("summary"));
els.restartButton.addEventListener("click", () => {
  state.currentId = null;
  showView("home");
  renderProgress();
});

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
renderRail();
renderProgress();
