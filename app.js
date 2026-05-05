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

  renderers[station.id](els.simulator, state.mode);
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
  state.completed.add(station.id);
  state.barriers.unshift({
    stationId: station.id,
    stationTitle: station.title,
    message,
    success: true
  });
  renderProgress();
  renderBarrierLog();
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

function renderTimerStation(root, mode) {
  if (mode === "kind") {
    root.innerHTML = `
      <div class="kiosk-screen">
        <div class="kiosk-top">
          <h3>천천히 주문하기</h3>
          <span class="status-pill">시간 충분</span>
        </div>
        <p class="kiosk-help">선택 시간 제한이 없고, 이전 단계로 돌아갈 수 있습니다.</p>
        <div class="kiosk-grid">
          <button class="kiosk-button good" data-good-step="0">치즈버거 세트</button>
          <button class="kiosk-button good" data-good-step="1">감자튀김 선택</button>
          <button class="kiosk-button good" data-good-step="2">카드 결제</button>
          <button class="kiosk-button good" data-finish="true">주문 완료</button>
        </div>
      </div>
    `;
    root.querySelector("[data-finish]").addEventListener("click", () => {
      completeStation("시간 연장과 단계 안내가 있으면 주문을 끝까지 마칠 수 있습니다.");
      showCompletion(root, "시간 제한을 없애고 큰 단계 버튼을 제공했습니다.");
    });
    return;
  }

  const steps = [
    {
      title: "1단계 메뉴 선택",
      correct: "치즈버거 세트",
      options: ["불고기버거", "치즈버거 세트", "새우버거", "치킨랩"]
    },
    {
      title: "2단계 사이드 선택",
      correct: "감자튀김",
      options: ["샐러드", "감자튀김", "치즈스틱", "콘샐러드"]
    },
    {
      title: "3단계 결제",
      correct: "카드 결제",
      options: ["현금 결제", "카드 결제", "쿠폰만 사용", "처음으로"]
    }
  ];

  let step = 0;
  let timeLeft = 3;
  let timer = 0;
  let disposed = false;
  addCleanup(() => {
    disposed = true;
    window.clearInterval(timer);
  });

  function draw() {
    const current = steps[step];
    root.innerHTML = `
      <div class="kiosk-screen challenge">
        <div class="kiosk-top">
          <h3>${current.title}</h3>
          <span id="timerReadout" class="timer-pill">${timeLeft.toFixed(1)}초</span>
        </div>
        <p class="kiosk-help">조금만 망설여도 화면이 처음으로 돌아갑니다.</p>
        <div class="kiosk-grid">
          ${current.options
            .map((option) => `<button class="kiosk-button" type="button" data-option="${option}">${option}</button>`)
            .join("")}
        </div>
      </div>
    `;

    root.querySelectorAll("[data-option]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.option !== current.correct) {
          recordBarrier("빨리 고르려다 엉뚱한 버튼을 눌렀습니다.");
          return;
        }
        window.clearInterval(timer);
        if (step === steps.length - 1) {
          completeStation("짧은 제한 시간은 주문을 포기하게 만들 수 있습니다.");
          showCompletion(root, "충분한 시간과 연장 버튼이 필요하다는 점을 발견했습니다.");
          return;
        }
        step += 1;
        timeLeft = 3;
        draw();
        startClock();
      });
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
        recordBarrier("생각할 시간이 부족해 화면이 처음으로 돌아갔습니다.");
        step = 0;
        timeLeft = 3;
        draw();
        startClock();
      }
    }, 100);
  }

  draw();
  startClock();
}

function renderTinyStation(root, mode) {
  const correct = new Set(["D2", "H1", "P3"]);
  const picked = new Set();

  if (mode === "kind") {
    renderFriendlyPicker(root, {
      title: "크고 또렷한 주문",
      help: "종류, 온도, 포장 여부를 나누어 크게 보여 줍니다.",
      groups: [
        ["두유 라떼", "초코 우유", "오렌지 주스"],
        ["따뜻하게", "차갑게", "얼음 적게"],
        ["포장", "매장", "취소"]
      ],
      correctLabels: ["두유 라떼", "따뜻하게", "포장"],
      doneMessage: "큰 버튼과 충분한 간격 덕분에 원하는 메뉴를 안정적으로 고를 수 있습니다."
    });
    return;
  }

  const options = [
    "A1",
    "B4",
    "D2",
    "C7",
    "L1",
    "H1",
    "Z9",
    "P3",
    "E5",
    "T2",
    "R8",
    "M0",
    "Q6",
    "N4",
    "Y2",
    "K7",
    "U3",
    "S1",
    "W5",
    "G8",
    "J2",
    "V6",
    "O9",
    "X0"
  ];

  root.innerHTML = `
    <div class="kiosk-screen challenge">
      <div class="kiosk-top">
        <h3>작은 주문판</h3>
        <span class="status-pill">${picked.size} / 3</span>
      </div>
      <div class="tiny-workspace">
        <p class="kiosk-help">두유 라떼는 D2, 따뜻하게는 H1, 포장은 P3입니다.</p>
        <div class="target-strip">
          <span class="target-chip">D2</span>
          <span class="target-chip">H1</span>
          <span class="target-chip">P3</span>
        </div>
        <div class="tiny-grid">
          ${options.map((option) => `<button class="mini-button" type="button" data-code="${option}">${option}</button>`).join("")}
        </div>
      </div>
    </div>
  `;

  root.querySelectorAll("[data-code]").forEach((button) => {
    button.addEventListener("click", () => {
      const code = button.dataset.code;
      if (!correct.has(code)) {
        recordBarrier("버튼이 작고 가까워서 다른 코드를 누르기 쉽습니다.");
        return;
      }
      picked.add(code);
      button.classList.add("is-picked");
      const status = root.querySelector(".status-pill");
      status.textContent = `${picked.size} / 3`;
      if (picked.size === correct.size) {
        completeStation("작은 터치 영역은 손 떨림이 있는 사람에게 큰 장벽이 됩니다.");
        showCompletion(root, "버튼 크기와 간격을 키우면 실수가 줄어듭니다.");
      }
    });
  });
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
  const picked = {};
  const config =
    mode === "kind"
      ? {
          title: "쉬운 말 메뉴",
          help: "낯선 표현 대신 익숙한 말과 설명을 함께 보여 줍니다.",
          rows: [
            ["음료", ["따뜻한 보리차", "차가운 보리차", "딸기 우유"]],
            ["받는 방법", ["포장", "매장 이용", "나중에 받기"]],
            ["단맛", ["설탕 없음", "보통", "많이"]]
          ],
          correct: ["따뜻한 보리차", "포장", "설탕 없음"],
          done: "쉬운 말과 분류가 있으면 처음 보는 메뉴도 고를 수 있습니다."
        }
      : {
          title: "외계어 메뉴",
          help: "메뉴 이름이 낯선 코드와 줄임말로만 보입니다.",
          rows: [
            ["DRK", ["ICE-B", "B-TH", "ST-MK"]],
            ["WAY", ["IN-H", "T-OUT", "L-PK"]],
            ["SW", ["S-2", "S-0", "S-M"]]
          ],
          correct: ["B-TH", "T-OUT", "S-0"],
          done: "어려운 말은 디지털 문해력이 낮은 사람에게 주문 장벽이 됩니다."
        };

  root.innerHTML = `
    <div class="kiosk-screen${mode === "challenge" ? " challenge" : ""}">
      <div class="kiosk-top">
        <h3>${config.title}</h3>
        <span class="status-pill">0 / 3</span>
      </div>
      <p class="kiosk-help">${config.help}</p>
      <div class="alien-menu">
        ${config.rows
          .map(
            ([label, choices], index) => `
              <div class="alien-row">
                <div class="alien-label">${label}</div>
                <div class="choice-row" data-row="${index}">
                  ${choices.map((choice) => `<button class="choice-button" type="button" data-choice="${choice}">${choice}</button>`).join("")}
                </div>
              </div>
            `
          )
          .join("")}
      </div>
    </div>
  `;

  root.querySelectorAll("[data-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const row = button.closest("[data-row]");
      const rowIndex = row.dataset.row;
      row.querySelectorAll(".choice-button").forEach((item) => item.classList.remove("is-picked"));
      button.classList.add("is-picked");
      picked[rowIndex] = button.dataset.choice;
      const selected = Object.values(picked);
      root.querySelector(".status-pill").textContent = `${selected.filter((choice) => config.correct.includes(choice)).length} / 3`;
      if (selected.length === 3) {
        if (config.correct.every((choice) => selected.includes(choice))) {
          completeStation(config.done);
          showCompletion(root, config.done);
        } else if (mode === "challenge") {
          recordBarrier("코드와 줄임말만 보고는 원하는 메뉴를 알아내기 어렵습니다.");
        } else {
          recordBarrier("선택 조건을 다시 확인해 보세요.");
        }
      }
    });
  });
}

function renderContrastStation(root, mode) {
  let coupon = "";
  const isKind = mode === "kind";
  root.innerHTML = `
    <div class="kiosk-screen${isKind ? "" : " challenge"}">
      <div class="contrast-screen ${isKind ? "good" : "bad"}">
        <div class="kiosk-top">
          <h3>${isKind ? "선명한 쿠폰 화면" : "쿠폰 선택"}</h3>
          <span class="status-pill">${coupon ? "적용" : "대기"}</span>
        </div>
        <p class="kiosk-help">
          ${isKind ? "색, 글자, 모양을 함께 보여 줍니다." : "색깔이 흐리고 글자가 잘 보이지 않습니다."}
        </p>
        <div class="coupon-row">
          <button class="choice-button coupon-red" type="button" data-coupon="500">
            <span class="coupon-dot"></span>
            ${isKind ? "동그라미 500원 할인" : "A"}
          </button>
          <button class="choice-button coupon-green" type="button" data-coupon="1000">
            <span class="coupon-dot"></span>
            ${isKind ? "동그라미 1,000원 할인" : "B"}
          </button>
          <button class="choice-button coupon-blue" type="button" data-coupon="2000">
            <span class="coupon-dot"></span>
            ${isKind ? "동그라미 2,000원 할인" : "C"}
          </button>
        </div>
        <button class="kiosk-button" type="button" data-pay="true">결제하기</button>
      </div>
    </div>
  `;

  root.querySelectorAll("[data-coupon]").forEach((button) => {
    button.addEventListener("click", () => {
      root.querySelectorAll("[data-coupon]").forEach((item) => item.classList.remove("is-picked"));
      button.classList.add("is-picked");
      coupon = button.dataset.coupon;
      root.querySelector(".status-pill").textContent = `${Number(coupon).toLocaleString("ko-KR")}원`;
      if (coupon !== "1000" && !isKind) {
        recordBarrier("흐린 화면과 색깔만 있는 안내 때문에 쿠폰을 구분하기 어렵습니다.");
      }
    });
  });

  root.querySelector("[data-pay]").addEventListener("click", () => {
    if (coupon === "1000") {
      completeStation("낮은 대비와 색상 의존은 시각 정보 접근을 어렵게 만듭니다.");
      showCompletion(root, "선명한 글자와 여러 단서를 함께 제공해야 합니다.");
    } else {
      recordBarrier("원하는 쿠폰이 적용되었는지 확인하기 어렵습니다.");
    }
  });
}

function renderAudioStation(root, mode) {
  const sequence = ["circle", "square", "star"];
  const picked = [];
  const isKind = mode === "kind";

  root.innerHTML = `
    <div class="kiosk-screen${isKind ? "" : " challenge"}">
      <div class="kiosk-top">
        <h3>${isKind ? "자막 있는 접수" : "음성 안내 접수"}</h3>
        <span class="status-pill">0 / 3</span>
      </div>
      <p class="kiosk-help">
        ${isKind ? "음성 안내와 같은 내용이 화면에도 표시됩니다." : "안내 내용은 소리로만 나옵니다."}
      </p>
      <div class="audio-pad">
        <button class="kiosk-button" type="button" data-speak="true">${isKind ? "안내 다시 듣기" : "음성 안내 듣기"}</button>
        ${isKind ? `<p class="kiosk-help">왼쪽 동그라미, 가운데 네모, 오른쪽 별 순서로 누르세요.</p>` : ""}
        <div class="shape-grid">
          ${shapeButton("circle", isKind ? "1. 접수 시작" : "")}
          ${shapeButton("square", isKind ? "2. 소아과 선택" : "")}
          ${shapeButton("star", isKind ? "3. 번호표 출력" : "")}
        </div>
      </div>
    </div>
  `;

  root.querySelector("[data-speak]").addEventListener("click", () => {
    speak("왼쪽 동그라미, 가운데 네모, 오른쪽 별 순서로 누르세요.");
  });

  root.querySelectorAll("[data-shape]").forEach((button) => {
    button.addEventListener("click", () => {
      const expected = sequence[picked.length];
      const actual = button.dataset.shape;
      if (actual !== expected) {
        recordBarrier(isKind ? "화면 안내를 다시 확인해 보세요." : "소리 안내만 있으면 놓쳤을 때 다시 알기 어렵습니다.");
        picked.length = 0;
        root.querySelector(".status-pill").textContent = "0 / 3";
        root.querySelectorAll("[data-shape]").forEach((item) => item.classList.remove("is-picked"));
        return;
      }
      picked.push(actual);
      button.classList.add("is-picked");
      root.querySelector(".status-pill").textContent = `${picked.length} / 3`;
      if (picked.length === sequence.length) {
        completeStation("소리 안내만으로는 청각 장애나 시끄러운 환경을 고려하기 어렵습니다.");
        showCompletion(root, "자막과 단계 표시를 함께 제공해야 합니다.");
      }
    });
  });
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
  renderStation();
});

els.kindMode.addEventListener("click", () => {
  state.mode = "kind";
  renderStation();
});

renderCards();
renderRail();
renderProgress();
