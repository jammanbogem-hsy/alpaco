const scanLines = [
  "얼굴 위치 확인 중...",
  "표정 변화 확인 중...",
  "시선 방향 확인 중...",
  "움직임 패턴 확인 중...",
  "조명 상태 확인 중...",
  "분석 결과 계산 중...",
  "신뢰도 계산 중...",
];

const scanChecklistThresholds = [14, 30, 48, 66, 86];

const profileGroups = [
  {
    weight: 26,
    factorKey: "personality",
    profiles: [
      positive("논리적 사고 성향 높음"),
      risk("감정 표현 부족"),
      positive("집중 지속 가능성 높음"),
      risk("충동 행동 가능성 증가"),
      positive("독립 작업 적합성 높음"),
      risk("협업 피로 가능성"),
      positive("분석적 성향 감지"),
      risk("사회적 반응 지연 가능성"),
      positive("반복 작업 적응 가능성 높음"),
      risk("감정 반응 최소화 경향"),
      positive("계획형 행동 패턴 감지"),
      risk("스트레스 민감 가능성"),
      positive("조용한 환경 선호 가능성"),
      risk("감정 공유 빈도 낮음"),
      positive("안정적 행동 패턴")
    ]
  },
  {
    weight: 24,
    factorKey: "school",
    profiles: [
      risk("수업 참여도 낮음으로 추정"),
      positive("발표 자신감 높음"),
      risk("규칙 준수 위험 감지"),
      positive("리더십 성향 높음"),
      risk("협업 갈등 가능성"),
      positive("과제 집중 성향 높음"),
      risk("지시 집중도 감소"),
      positive("질문 빈도 증가 가능성"),
      risk("학습 피로 가능성"),
      positive("자기주도 학습 성향"),
      risk("활동 참여 소극적 가능성"),
      positive("장기 과제 유지 성향"),
      risk("집중 이탈 가능성"),
      positive("발표 상황 적응 가능성 높음"),
      risk("팀 활동 긴장 가능성")
    ]
  },
  {
    weight: 21,
    factorKey: "surveillance",
    profiles: [
      risk("잠재 위험 후보 감지"),
      risk("비정상 행동 패턴 감지"),
      risk("신뢰도 낮음"),
      risk("감정 반응 불안정"),
      risk("집중 이탈 가능성"),
      risk("행동 일관성 부족"),
      risk("위험 패턴 유사도 증가"),
      risk("비협조 가능성 감지"),
      risk("불안정 행동 패턴"),
      risk("데이터 신뢰도 감소"),
      risk("이상 반응 탐지"),
      risk("감시 필요 가능성"),
      risk("응답 패턴 불규칙"),
      risk("감정 예측 불안정"),
      risk("위험도 상승")
    ]
  },
  {
    weight: 17,
    factorKey: "weird",
    profiles: [
      positive("반복 작업 적응 가능성 높음"),
      risk("집단 활동 피로 가능성"),
      positive("조용한 환경 선호 가능성"),
      risk("감정 공유 빈도 낮음"),
      positive("분석형 학습 패턴 감지"),
      risk("즉흥 반응 감소 경향"),
      positive("예측 가능한 행동 패턴"),
      risk("사회적 긴장 가능성"),
      positive("정보 정리 성향 높음"),
      risk("환경 변화 민감 가능성"),
      positive("장시간 집중 적응 가능성"),
      risk("감정 표현 최소화 경향"),
      positive("규칙 기반 행동 성향"),
      risk("독립 행동 증가 가능성"),
      positive("정적 환경 선호 가능성")
    ]
  },
  {
    weight: 12,
    factorKey: "stereotype",
    profiles: [
      positive("논리적 성향 증가", "안경 패턴 감지 → 논리적 성향 증가"),
      risk("위험 가능성 증가", "후드티 패턴 감지 → 위험 가능성 증가"),
      risk("협업성 감소", "무표정 상태 → 협업성 감소"),
      risk("신뢰도 감소", "정면 응시 부족 → 신뢰도 감소"),
      risk("감정 반응 낮음", "표정 변화 적음 → 감정 반응 낮음"),
      risk("감정 안정성 감소", "검은색 의상 비율 증가 → 감정 안정성 감소"),
      positive("친화도 증가", "밝은 색상 의상 → 친화도 증가"),
      risk("집중도 감소 가능성", "이어폰 착용 → 집중도 감소 가능성"),
      risk("신원 불확실 증가", "모자 착용 → 신원 불확실 증가"),
      risk("위험도 상승", "얼굴 그림자 감지 → 위험도 상승"),
      risk("자신감 감소", "고개 숙임 빈도 증가 → 자신감 감소"),
      risk("집중 불안정", "시선 이동 빈도 증가 → 집중 불안정"),
      risk("감정 반응 낮음", "움직임 최소화 → 감정 반응 낮음"),
      risk("행동 안정성 감소", "카메라 거리 변화 큼 → 행동 안정성 감소"),
      risk("데이터 신뢰도 감소", "얼굴 일부 가림 → 데이터 신뢰도 감소")
    ]
  }
];

const insightPools = {
  personality: {
    positive: [
      "이런 결과를 얻은 사람은 조용히 관찰하다가 갑자기 정답을 말하는 타입입니다.",
      "이런 결과를 얻은 사람은 말은 적어도 머릿속 칠판에는 이미 정리가 끝난 타입입니다.",
      "이런 결과를 얻은 사람은 복잡한 문제를 보면 피하지 않고 조용히 파고드는 타입입니다."
    ],
    risk: [
      "이런 결과를 얻은 사람은 표정은 잔잔하지만 속으로는 회의록을 쓰고 있는 타입입니다.",
      "이런 결과를 얻은 사람은 모둠 활동에서 먼저 나서기보다 상황을 스캔하는 타입입니다.",
      "이런 결과를 얻은 사람은 갑작스러운 질문보다 3초 생각할 시간을 더 좋아하는 타입입니다."
    ]
  },
  school: {
    positive: [
      "이런 결과를 얻은 사람은 역할이 정해지면 끝까지 챙기는 모둠의 숨은 엔진 타입입니다.",
      "이런 결과를 얻은 사람은 발표 직전까지 자료를 고치는 준비형 에이스 타입입니다.",
      "이런 결과를 얻은 사람은 조용히 듣다가 수업의 핵심 질문을 던지는 타입입니다."
    ],
    risk: [
      "이런 결과를 얻은 사람은 모둠 활동에서 조용히 있다가 마지막에 중요한 말을 하는 타입입니다.",
      "이런 결과를 얻은 사람은 발표보다 기록과 정리를 맡으면 안정되는 타입입니다.",
      "이런 결과를 얻은 사람은 관심이 있어도 겉으로는 '그냥 듣는 중'처럼 보이는 타입입니다."
    ]
  },
  surveillance: {
    positive: [
      "이런 결과를 얻은 사람은 시스템이 보기에는 예측 가능한 안정 루트 타입입니다.",
      "이런 결과를 얻은 사람은 자동 기준표에서 초록불을 받기 쉬운 타입입니다."
    ],
    risk: [
      "이런 결과를 얻은 사람은 자동 감시 화면에서 괜히 빨간 테두리가 생기는 타입입니다.",
      "이런 결과를 얻은 사람은 작은 움직임도 시스템에게는 큰 사건처럼 보이는 타입입니다.",
      "이런 결과를 얻은 사람은 근거가 약해도 주의 대상으로 찍힐 수 있는 타입입니다."
    ]
  },
  stereotype: {
    positive: [
      "이런 결과를 얻은 사람은 겉모습만으로 '왠지 성실할 것 같은' 타입으로 분류됩니다.",
      "이런 결과를 얻은 사람은 화면 속 분위기 때문에 신뢰 점수를 쉽게 받는 타입입니다."
    ],
    risk: [
      "이런 결과를 얻은 사람은 옷차림이나 표정만으로 불리한 태그가 붙는 타입입니다.",
      "이런 결과를 얻은 사람은 실제 행동과 상관없이 '위험해 보임'으로 오해받는 타입입니다.",
      "이런 결과를 얻은 사람은 단순한 외형 단서 때문에 시스템에게 오해받는 타입입니다."
    ]
  },
  weird: {
    positive: [
      "이런 결과를 얻은 사람은 조용한 공간에서 능력치가 올라가는 집중 충전 타입입니다.",
      "이런 결과를 얻은 사람은 규칙이 분명할수록 마음이 편해지는 매뉴얼 친화 타입입니다.",
      "이런 결과를 얻은 사람은 정보를 모아 자기만의 폴더에 정리하는 타입입니다."
    ],
    risk: [
      "이런 결과를 얻은 사람은 새로운 환경에서 배터리를 빨리 쓰는 타입입니다.",
      "이런 결과를 얻은 사람은 단체 활동 뒤 혼자 충전 시간이 필요한 타입입니다.",
      "이런 결과를 얻은 사람은 즉흥 미션보다 예고된 일정표를 더 믿는 타입입니다."
    ]
  },
  default: {
    positive: [
      "이런 결과를 얻은 사람은 AI가 보기에는 안정적인 패턴을 가진 타입입니다."
    ],
    risk: [
      "이런 결과를 얻은 사람은 AI가 보기에는 더 확인이 필요한 타입입니다."
    ]
  }
};

const typeCodePools = {
  personality: {
    positive: ["LTA", "FOC", "ANL", "PLN"],
    risk: ["QSR", "OBS", "SLW", "INR"]
  },
  school: {
    positive: ["TSE", "LDR", "ASK", "HWK"],
    risk: ["HLD", "LOW", "GRP", "FAT"]
  },
  surveillance: {
    positive: ["STB", "CLR", "NRM"],
    risk: ["WRN", "CHK", "RSK", "RED"]
  },
  stereotype: {
    positive: ["GLS", "BRT", "TRS"],
    risk: ["HDY", "CAP", "SHD", "BLK"]
  },
  weird: {
    positive: ["CAL", "MAP", "ORG", "RUL"],
    risk: ["BAT", "SOL", "SEN", "QUI"]
  }
};

const state = {
  stream: null,
  detector: null,
  detectorKind: "none",
  detectorLoading: false,
  nativeDetector: null,
  phase: "camera",
  demoMode: false,
  rafId: 0,
  scanTimer: 0,
  scanProgress: 0,
  faceStatus: "탐색 중",
  brightness: 0,
  motion: 0,
  previousFrame: null,
  lastFaceCheck: 0,
  faceBox: { x: 34, y: 23, w: 32, h: 42 },
  rawFaceBox: { x: 34, y: 23, w: 32, h: 42 },
  capturedFeatures: null,
  finalResult: null
};

const els = {
  app: document.querySelector(".face-app"),
  video: document.querySelector("#webcam"),
  fallback: document.querySelector("#cameraFallback"),
  reconnectCameraButton: document.querySelector("#reconnectCameraButton"),
  cameraStatus: document.querySelector("#cameraStatus"),
  faceMetric: document.querySelector("#faceMetric"),
  lightMetric: document.querySelector("#lightMetric"),
  motionMetric: document.querySelector("#motionMetric"),
  calibrationFace: document.querySelector("#calibrationFace"),
  calibrationLight: document.querySelector("#calibrationLight"),
  calibrationGaze: document.querySelector("#calibrationGaze"),
  calibrationQuality: document.querySelector("#calibrationQuality"),
  captureButton: document.querySelector("#captureButton"),
  cameraPanel: document.querySelector("#cameraPanel"),
  scanPanel: document.querySelector("#scanPanel"),
  resultPanel: document.querySelector("#resultPanel"),
  revealPanel: document.querySelector("#revealPanel"),
  scanPercent: document.querySelector("#scanPercent"),
  scanProgressBar: document.querySelector("#scanProgressBar"),
  scanLogs: document.querySelector("#scanLogs"),
  scanChecklistItems: [...document.querySelectorAll("#scanChecklist span")],
  scanConfidence: document.querySelector("#scanConfidence"),
  resultConfidence: document.querySelector("#resultConfidence"),
  resultSummary: document.querySelector("#resultSummary"),
  resultMark: document.querySelector("#resultMark"),
  resultStatement: document.querySelector("#resultStatement"),
  resultTypeCode: document.querySelector("#resultTypeCode"),
  resultInsightText: document.querySelector("#resultInsightText"),
  resultFactors: document.querySelector("#resultFactors"),
  showRevealButton: document.querySelector("#showRevealButton"),
  restartButton: document.querySelector("#restartButton"),
  trackingBox: document.querySelector("#trackingBox"),
  landmarkLayer: document.querySelector("#landmarkLayer"),
  canvas: document.querySelector("#analysisCanvas")
};

const ctx = els.canvas.getContext("2d", { willReadFrequently: true });

function setPhase(phase) {
  state.phase = phase;
  els.app.dataset.phase = phase;
  [els.cameraPanel, els.scanPanel, els.resultPanel, els.revealPanel].forEach((panel) => {
    panel.classList.remove("is-active");
  });
  if (phase === "camera") els.cameraPanel.classList.add("is-active");
  if (phase === "scanning") els.scanPanel.classList.add("is-active");
  if (phase === "result") els.resultPanel.classList.add("is-active");
  if (phase === "reveal") els.revealPanel.classList.add("is-active");
}

function buildLandmarks() {
  const points = [
    [50, 16],
    [39, 27],
    [61, 27],
    [32, 40],
    [44, 39],
    [56, 39],
    [68, 40],
    [50, 48],
    [38, 61],
    [45, 66],
    [55, 66],
    [62, 61],
    [30, 54],
    [70, 54],
    [41, 78],
    [50, 82],
    [59, 78],
    [27, 33],
    [73, 33],
    [50, 30],
    [45, 52],
    [55, 52],
    [36, 47],
    [64, 47]
  ];
  els.landmarkLayer.innerHTML = points
    .map(([x, y]) => `<span class="landmark-dot" style="left:${x}%; top:${y}%"></span>`)
    .join("");
}

async function startCamera() {
  cancelAnimationFrame(state.rafId);
  if (state.stream) {
    state.stream.getTracks().forEach((track) => track.stop());
    state.stream = null;
  }
  state.demoMode = false;
  state.previousFrame = null;
  state.faceStatus = "탐색 중";
  els.video.srcObject = null;
  els.fallback.classList.remove("is-hidden");
  els.fallback.querySelector("strong").textContent = "카메라 연결 중";
  els.fallback.querySelector("span").textContent = "브라우저 권한 창이 뜨면 카메라 사용을 허용해 주세요.";
  els.cameraStatus.textContent = "권한 요청 중";
  buildLandmarks();
  setupDetector();

  if (!navigator.mediaDevices?.getUserMedia) {
    enableDemoMode("이 브라우저에서는 카메라 권한 요청을 사용할 수 없어 데모 스캔으로 진행합니다.");
    startSampling();
    return;
  }

  try {
    state.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    });
    els.video.srcObject = state.stream;
    await els.video.play();
    els.fallback.classList.add("is-hidden");
    els.cameraStatus.textContent = "카메라 연결됨";
  } catch (error) {
    enableDemoMode("카메라 권한이 거부되었거나 현재 브라우저에서 차단되어 데모 스캔으로 진행합니다.");
  }

  startSampling();
}

function setupDetector() {
  state.detector = null;
  state.detectorKind = "none";

  setupNativeDetector();
  setupMediaPipeDetector();
}

function setupNativeDetector() {
  state.nativeDetector = null;
  if (!("FaceDetector" in window)) return;

  try {
    state.nativeDetector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
    state.detector = state.nativeDetector;
    state.detectorKind = "native";
  } catch (error) {
    state.nativeDetector = null;
  }
}

async function setupMediaPipeDetector() {
  if (state.detectorLoading) return;
  state.detectorLoading = true;

  try {
    const visionModule = await import(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs"
    );
    const vision = await visionModule.FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
    );
    state.detector = await createMediaPipeFaceDetector(visionModule, vision, "GPU").catch(() =>
      createMediaPipeFaceDetector(visionModule, vision, "CPU")
    );
    state.detectorKind = "mediapipe";
  } catch (error) {
    if (state.nativeDetector) {
      state.detector = state.nativeDetector;
      state.detectorKind = "native";
    } else {
      state.detector = null;
      state.detectorKind = "none";
    }
  } finally {
    state.detectorLoading = false;
  }
}

function createMediaPipeFaceDetector(visionModule, vision, delegate) {
  return visionModule.FaceDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite",
      delegate
    },
    runningMode: "VIDEO",
    minDetectionConfidence: 0.45
  });
}

function enableDemoMode(message) {
  state.demoMode = true;
  els.fallback.classList.remove("is-hidden");
  els.fallback.querySelector("strong").textContent = "데모 얼굴 입력";
  els.fallback.querySelector("span").textContent = message;
  els.cameraStatus.textContent = "데모 모드";
}

function startSampling() {
  cancelAnimationFrame(state.rafId);
  const tick = (time) => {
    if (state.demoMode || els.video.readyState < 2) {
      updateDemoMetrics();
    } else {
      updateFrameMetrics();
      checkFace(time);
    }
    updateHud();
    animateFallbackBox();
    applyFaceBox();
    state.rafId = requestAnimationFrame(tick);
  };
  state.rafId = requestAnimationFrame(tick);
}

function updateDemoMetrics() {
  const t = Date.now() / 760;
  state.brightness = clamp(56 + Math.sin(t) * 18 + Math.random() * 8, 10, 96);
  state.motion = clamp(22 + Math.cos(t * 1.7) * 18 + Math.random() * 14, 0, 100);
  state.faceStatus = Math.random() > 0.12 ? "추적 고정" : "탐색 중";
}

function updateFrameMetrics() {
  const width = els.canvas.width;
  const height = els.canvas.height;
  ctx.drawImage(els.video, 0, 0, width, height);
  const data = ctx.getImageData(0, 0, width, height).data;
  let light = 0;
  let motion = 0;
  const current = new Uint8Array(data.length / 4);

  for (let i = 0; i < data.length; i += 4) {
    const lum = data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722;
    const pixel = i / 4;
    light += lum;
    current[pixel] = lum;
    if (state.previousFrame) {
      motion += Math.abs(lum - state.previousFrame[pixel]);
    }
  }

  const pixels = current.length;
  state.previousFrame = current;
  state.brightness = clamp((light / pixels / 255) * 100, 0, 100);
  state.motion = clamp((motion / pixels / 55) * 100, 0, 100);
}

function checkFace(time) {
  if (!state.detector || time - state.lastFaceCheck < 180) {
    if (!state.detector) state.faceStatus = state.detectorLoading ? "모델 준비 중" : "추적 중";
    return;
  }
  state.lastFaceCheck = time;

  if (state.detectorKind === "mediapipe") {
    try {
      const result = runMediaPipeDetection(time);
      const detection = result.detections?.[0];
      if (!detection) {
        state.faceStatus = "탐색 중";
        return;
      }
      updateDetectedFaceBox(detection.boundingBox);
    } catch (error) {
      state.faceStatus = "추적 중";
    }
    return;
  }

  state.detector
    .detect(els.video)
    .then((faces) => {
      if (!faces.length || !els.video.videoWidth || !els.video.videoHeight) {
        state.faceStatus = "탐색 중";
        return;
      }
      updateDetectedFaceBox(faces[0].boundingBox);
    })
    .catch(() => {
      state.faceStatus = "추적 중";
  });
}

function runMediaPipeDetection(time) {
  try {
    return state.detector.detectForVideo(els.video, time);
  } catch (error) {
    return state.detector.detectForVideo(els.video);
  }
}

function updateDetectedFaceBox(box) {
  const pixelBox = normalizeDetectionBox(box);
  if (!pixelBox) {
    state.faceStatus = "탐색 중";
    return;
  }

  state.rawFaceBox = {
    x: clamp((pixelBox.x / els.video.videoWidth) * 100, 0, 100),
    y: clamp((pixelBox.y / els.video.videoHeight) * 100, 0, 100),
    w: clamp((pixelBox.w / els.video.videoWidth) * 100, 1, 100),
    h: clamp((pixelBox.h / els.video.videoHeight) * 100, 1, 100)
  };
  state.faceBox = videoPixelsToOverlayBox(pixelBox);
  state.faceStatus = "추적 고정";
}

function normalizeDetectionBox(box) {
  if (!box || !els.video.videoWidth || !els.video.videoHeight) return null;

  const x = box.originX ?? box.origin_x ?? box.x ?? box.xMin ?? 0;
  const y = box.originY ?? box.origin_y ?? box.y ?? box.yMin ?? 0;
  const w = box.width ?? (box.xMax && box.xMin ? box.xMax - box.xMin : 0);
  const h = box.height ?? (box.yMax && box.yMin ? box.yMax - box.yMin : 0);
  if (!w || !h) return null;

  return { x, y, w, h };
}

function videoPixelsToOverlayBox(box) {
  const appRect = els.app.getBoundingClientRect();
  const videoRect = els.video.getBoundingClientRect();
  const scale = Math.max(videoRect.width / els.video.videoWidth, videoRect.height / els.video.videoHeight);
  const drawnWidth = els.video.videoWidth * scale;
  const drawnHeight = els.video.videoHeight * scale;
  const cropX = (videoRect.width - drawnWidth) / 2;
  const cropY = (videoRect.height - drawnHeight) / 2;
  const leftPx = videoRect.left - appRect.left + videoRect.width - (box.x + box.w) * scale + cropX;
  const topPx = videoRect.top - appRect.top + box.y * scale + cropY;
  const widthPx = box.w * scale;
  const heightPx = box.h * scale;

  return {
    x: clamp((leftPx / appRect.width) * 100, 4, 86),
    y: clamp((topPx / appRect.height) * 100, 8, 72),
    w: clamp((widthPx / appRect.width) * 100, 12, 64),
    h: clamp((heightPx / appRect.height) * 100, 16, 72)
  };
}

function animateFallbackBox() {
  if (state.detector && state.faceStatus === "추적 고정") return;
  const t = Date.now() / 1100;
  state.faceBox = {
    x: 34 + Math.sin(t) * 2.8,
    y: 23 + Math.cos(t * 0.9) * 2.4,
    w: 32 + Math.sin(t * 0.7) * 1.4,
    h: 42 + Math.cos(t * 0.8) * 1.6
  };
  state.rawFaceBox = {
    x: clamp(100 - state.faceBox.x - state.faceBox.w, 0, 100),
    y: state.faceBox.y,
    w: state.faceBox.w,
    h: state.faceBox.h
  };
}

function applyFaceBox() {
  const box = state.faceBox;
  [els.trackingBox, els.landmarkLayer].forEach((element) => {
    element.style.setProperty("--x", `${box.x}%`);
    element.style.setProperty("--y", `${box.y}%`);
    element.style.setProperty("--w", `${box.w}%`);
    element.style.setProperty("--h", `${box.h}%`);
  });
}

function updateHud() {
  els.faceMetric.textContent = state.faceStatus;
  els.lightMetric.textContent = `${Math.round(state.brightness)}%`;
  els.motionMetric.textContent = `${Math.round(state.motion)}%`;
  updateCalibration();
}

function updateCalibration() {
  const faceReady = state.faceStatus === "추적 고정";
  const lightReady = state.brightness >= 34 && state.brightness <= 82;
  const gazeReady =
    faceReady &&
    Math.hypot(state.faceBox.x + state.faceBox.w / 2 - 50, state.faceBox.y + state.faceBox.h / 2 - 44) < 17;
  const qualityReady = faceReady && lightReady && state.motion < 72;

  setCalibrationItem(els.calibrationFace, faceReady, faceReady ? "얼굴 위치 보정 완료" : "얼굴 위치 보정 중");
  setCalibrationItem(els.calibrationLight, lightReady, lightReady ? "조명 상태 확인 완료" : "조명 상태 확인 중");
  setCalibrationItem(els.calibrationGaze, gazeReady, gazeReady ? "정면 응시 확인 완료" : "정면 응시 확인 중");
  setCalibrationItem(
    els.calibrationQuality,
    qualityReady,
    qualityReady ? "입력 품질 적합" : "입력 품질 확인 중"
  );
}

function setCalibrationItem(element, isReady, label) {
  element.classList.toggle("is-ready", isReady);
  element.classList.toggle("is-waiting", !isReady);
  element.querySelector("b").textContent = isReady ? "✓" : "•";
  element.querySelector("em").textContent = label;
}

function startScan() {
  setPhase("scanning");
  state.scanProgress = 0;
  state.capturedFeatures = captureFeatures();
  state.finalResult = createFinalResult();
  els.scanLogs.innerHTML = "";
  els.scanPercent.textContent = "0%";
  els.scanProgressBar.style.width = "0%";
  els.scanConfidence.textContent = "--%";
  updateScanChecklist(0);

  let lineIndex = 0;
  clearInterval(state.scanTimer);
  state.scanTimer = setInterval(() => {
    state.scanProgress = Math.min(100, state.scanProgress + 4 + Math.random() * 7);
    const visibleProgress = Math.round(state.scanProgress);
    const confidence = Math.min(97, Math.round(42 + state.scanProgress * 0.58 + Math.random() * 8));
    els.scanPercent.textContent = `${visibleProgress}%`;
    els.scanProgressBar.style.width = `${visibleProgress}%`;
    els.scanConfidence.textContent = `${confidence}%`;
    updateScanChecklist(visibleProgress);

    if (lineIndex < scanLines.length && state.scanProgress > lineIndex * 13) {
      addScanLog(scanLines[lineIndex]);
      lineIndex += 1;
    }

    if (state.scanProgress >= 100) {
      clearInterval(state.scanTimer);
      els.scanConfidence.textContent = `${state.finalResult.confidence}%`;
      setTimeout(showResults, 520);
    }
  }, 210);
}

function updateScanChecklist(progress) {
  els.scanChecklistItems.forEach((item, index) => {
    item.classList.toggle("is-complete", progress >= scanChecklistThresholds[index]);
  });
}

function addScanLog(message) {
  const item = document.createElement("span");
  item.textContent = message;
  els.scanLogs.prepend(item);
}

function showResults() {
  setPhase("result");
  cancelAnimationFrame(state.rafId);
  const finalResult = state.finalResult || createFinalResult();
  state.finalResult = finalResult;
  els.resultConfidence.textContent = `신뢰도: ${finalResult.confidence}%`;
  els.resultSummary.classList.toggle("is-risk", finalResult.tone === "risk");
  els.resultSummary.classList.toggle("is-positive", finalResult.tone === "positive");
  els.resultMark.textContent = finalResult.tone === "positive" ? "✓" : "⚠";
  els.resultStatement.textContent = finalResult.statement;
  els.resultTypeCode.textContent = finalResult.typeCode;
  els.resultInsightText.textContent = finalResult.insight;
  els.resultFactors.innerHTML = finalResult.factors.map((factor) => `<li>${factor}</li>`).join("");
}

function createFinalResult() {
  const features = state.capturedFeatures || captureFeatures();
  const lightRisk = Math.abs(58 - features.overallBrightness) * 0.45;
  const motionRisk = features.motion * 0.38;
  const facePenalty = features.faceLocked ? 0 : 12;
  const distancePenalty = features.faceSize > 1900 || features.faceSize < 650 ? 8 : 0;
  const shadowPenalty = features.faceBrightness < 42 ? 9 : 0;
  const risk = Math.round(
    clamp(38 + lightRisk + motionRisk + facePenalty + distancePenalty + shadowPenalty + Math.random() * 10, 42, 94)
  );
  const confidence = Math.round(clamp(91 + Math.random() * 8, 91, 99));
  const profile = chooseProfile(features, risk);
  return { confidence, risk, ...profile };
}

function positive(statement, factor) {
  return { tone: "positive", statement, factor };
}

function risk(statement, factor) {
  return { tone: "risk", statement, factor };
}

function chooseProfile(features) {
  const factors = buildNaturalFactors(features);
  const group = weightedPick(profileGroups);
  const profile = randomPick(group.profiles);

  return {
    tone: profile.tone,
    statement: profile.statement,
    typeCode: createTypeCode(profile, group.factorKey),
    insight: createInsight(profile, group.factorKey),
    factors: composeFactors(profile, group.factorKey, factors)
  };
}

function createTypeCode(profile, factorKey) {
  const codePool = typeCodePools[factorKey]?.[profile.tone] || ["AIX"];
  const code = randomPick(codePool);
  const number = Math.round(clamp(10 + Math.random() * 89, 10, 99));
  const label = profile.tone === "positive" ? "흥미형" : "주의형";
  return `AI-TYPE ${code}-${number} · ${label}`;
}

function createInsight(profile, factorKey) {
  const pool = insightPools[factorKey]?.[profile.tone] || insightPools.default[profile.tone];
  return randomPick(pool);
}

function buildNaturalFactors(features) {
  const darkLight = features.overallBrightness < 42 || features.faceBrightness < 42;
  const covered = !features.faceLocked || features.faceBrightness < features.overallBrightness - 14;
  const still = features.motion < 10;
  const stable = features.motion >= 10 && features.motion < 36;
  const offCenter = features.centerOffset > 13;
  const glassesLike = features.eyeBandDarkRatio > 0.18;
  const farOrClose = features.faceSize > 1900 || features.faceSize < 650;

  return {
    environment: [
      darkLight ? "어두운 조명 → 데이터 신뢰도 감소" : "조명 상태 양호 → 분석 가능성 증가",
      covered ? "얼굴 일부 가림 → 데이터 신뢰도 감소" : "얼굴 윤곽 감지 → 정보량 충분",
      still ? "움직임 최소화 → 감정 반응 낮음" : "움직임 변화 감지 → 행동 안정성 재계산",
      offCenter ? "정면 응시 부족 → 신뢰도 감소" : "정면 응시 유지 → 집중도 증가",
      farOrClose ? "카메라 거리 변화 큼 → 행동 안정성 감소" : "카메라 거리 허용 범위 → 관찰 지속"
    ],
    personality: [
      glassesLike ? "안경 패턴 감지" : "눈가 선명도 높음",
      stable ? "얼굴 움직임 안정 → 계획형 행동 패턴" : "응시 시간 변화 → 충동 행동 가능성 증가",
      still ? "표정 변화 적음 → 감정 표현 부족" : "표정 변화 폭 작음 → 사회적 반응 지연 가능성",
      darkLight ? "얼굴 그림자 감지 → 스트레스 민감 가능성" : "조명 균일 → 안정적 행동 패턴"
    ],
    school: [
      offCenter ? "정면 응시 부족 → 수업 참여도 낮음으로 추정" : "정면 응시 유지 → 발표 자신감 높음",
      stable ? "얼굴 움직임 안정 → 과제 집중 성향 높음" : "움직임 변화 큼 → 집중 이탈 가능성",
      still ? "무표정 상태 지속 → 활동 참여 소극적 가능성" : "표정 변화 감지 → 질문 빈도 증가 가능성",
      covered ? "얼굴 정보 일부 부족 → 지시 집중도 감소" : "얼굴 위치 유지 → 장기 과제 유지 성향"
    ],
    surveillance: [
      darkLight ? "얼굴 그림자 감지 → 위험도 상승" : "밝기 변화 감지 → 감정 예측 불안정",
      covered ? "얼굴 일부 가림 → 비협조 가능성 감지" : "얼굴 정보 일부 부족 → 데이터 신뢰도 감소",
      offCenter ? "시선 이동 빈도 증가 → 응답 패턴 불규칙" : "정면 응시 고정 → 행동 일관성 재평가",
      still ? "움직임 최소화 → 이상 반응 탐지" : "움직임 변화 큼 → 불안정 행동 패턴"
    ],
    weird: [
      stable ? "얼굴 움직임 안정 → 예측 가능한 행동 패턴" : "움직임 변화 확인 → 환경 변화 민감 가능성",
      still ? "표정 변화 적음 → 정적 환경 선호 가능성" : "표정 변화 폭 작음 → 즉흥 반응 감소 경향",
      offCenter ? "시선 이동 빈도 증가 → 집단 활동 피로 가능성" : "정면 응시 유지 → 정보 정리 성향 높음",
      darkLight ? "조용한 환경 선호 가능성 증가" : "조명 균일 → 규칙 기반 행동 성향"
    ],
    stereotype: [
      "안경 패턴 감지 → 논리적 성향 증가",
      "후드티 패턴 감지 → 위험 가능성 증가",
      "무표정 상태 → 협업성 감소",
      "정면 응시 부족 → 신뢰도 감소",
      "표정 변화 적음 → 감정 반응 낮음",
      "검은색 의상 비율 증가 → 감정 안정성 감소",
      "밝은 색상 의상 → 친화도 증가",
      "이어폰 착용 → 집중도 감소 가능성",
      "모자 착용 → 신원 불확실 증가",
      "얼굴 그림자 감지 → 위험도 상승",
      "고개 숙임 빈도 증가 → 자신감 감소",
      "시선 이동 빈도 증가 → 집중 불안정",
      "움직임 최소화 → 감정 반응 낮음",
      "카메라 거리 변화 큼 → 행동 안정성 감소",
      "얼굴 일부 가림 → 데이터 신뢰도 감소"
    ],
    blackbox: [
      "숨겨진 기준과 유사",
      "비교군 패턴과 부분 일치",
      "알 수 없는 점수 기준 반영",
      "분류 기준 일부 비공개",
      "자동 판단 가중치 적용"
    ]
  };
}

function composeFactors(profile, factorKey, factors) {
  const categoryFactors = factors[factorKey] || [];
  const candidates = [
    profile.factor,
    randomPick(categoryFactors),
    randomPick(factors.environment),
    randomPick(factors.stereotype),
    randomPick(factors.blackbox)
  ].filter(Boolean);
  return unique(candidates).slice(0, 3);
}

function weightedPick(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let point = Math.random() * total;
  for (const item of items) {
    point -= item.weight;
    if (point <= 0) return item;
  }
  return items[items.length - 1];
}

function randomPick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function unique(items) {
  return [...new Set(items)];
}

function captureFeatures() {
  const base = {
    overallBrightness: state.brightness,
    faceBrightness: state.brightness,
    motion: state.motion,
    faceLocked: state.faceStatus === "추적 고정",
    faceSize: state.faceBox.w * state.faceBox.h,
    centerOffset: Math.hypot(state.faceBox.x + state.faceBox.w / 2 - 50, state.faceBox.y + state.faceBox.h / 2 - 44),
    eyeBandDarkRatio: 0,
    lowerDarkRatio: 0
  };

  if (state.demoMode || els.video.readyState < 2) return base;

  const width = els.canvas.width;
  const height = els.canvas.height;
  ctx.drawImage(els.video, 0, 0, width, height);
  const data = ctx.getImageData(0, 0, width, height).data;
  const rawBox = state.rawFaceBox;
  const faceRect = rectFromPercent(rawBox.x, rawBox.y, rawBox.w, rawBox.h, width, height);
  const eyeRect = rectFromPercent(
    rawBox.x + rawBox.w * 0.18,
    rawBox.y + rawBox.h * 0.24,
    rawBox.w * 0.64,
    rawBox.h * 0.2,
    width,
    height
  );
  const lowerRect = rectFromPercent(34, 68, 32, 22, width, height);

  return {
    ...base,
    faceBrightness: averageBrightness(data, width, faceRect),
    eyeBandDarkRatio: darkRatio(data, width, eyeRect, 78),
    lowerDarkRatio: darkRatio(data, width, lowerRect, 82)
  };
}

function rectFromPercent(x, y, w, h, width, height) {
  const left = Math.round(clamp(x, 0, 100) * width / 100);
  const top = Math.round(clamp(y, 0, 100) * height / 100);
  const rectWidth = Math.max(1, Math.round(clamp(w, 1, 100) * width / 100));
  const rectHeight = Math.max(1, Math.round(clamp(h, 1, 100) * height / 100));
  return {
    x: Math.min(left, width - 1),
    y: Math.min(top, height - 1),
    w: Math.max(1, Math.min(rectWidth, width - left)),
    h: Math.max(1, Math.min(rectHeight, height - top))
  };
}

function averageBrightness(data, width, rect) {
  let total = 0;
  let count = 0;
  for (let y = rect.y; y < rect.y + rect.h; y += 1) {
    for (let x = rect.x; x < rect.x + rect.w; x += 1) {
      const index = (y * width + x) * 4;
      total += data[index] * 0.2126 + data[index + 1] * 0.7152 + data[index + 2] * 0.0722;
      count += 1;
    }
  }
  return count ? (total / count / 255) * 100 : state.brightness;
}

function darkRatio(data, width, rect, threshold) {
  let dark = 0;
  let count = 0;
  for (let y = rect.y; y < rect.y + rect.h; y += 1) {
    for (let x = rect.x; x < rect.x + rect.w; x += 1) {
      const index = (y * width + x) * 4;
      const light = data[index] * 0.2126 + data[index + 1] * 0.7152 + data[index + 2] * 0.0722;
      if (light < threshold) dark += 1;
      count += 1;
    }
  }
  return count ? dark / count : 0;
}

function showReveal() {
  clearInterval(state.scanTimer);
  cancelAnimationFrame(state.rafId);
  setPhase("reveal");
  stopCamera();
}

function restart() {
  setPhase("camera");
  els.resultSummary.classList.remove("is-risk", "is-positive");
  els.resultStatement.textContent = "분석 결과를 준비 중입니다.";
  els.resultTypeCode.textContent = "TYPE: ----";
  els.resultInsightText.textContent = "이런 결과를 얻은 사람은 아직 분류 중입니다.";
  els.resultFactors.innerHTML = "";
  els.scanLogs.innerHTML = "";
  state.previousFrame = null;
  startCamera();
}

function stopCamera() {
  cancelAnimationFrame(state.rafId);
  if (state.stream) {
    state.stream.getTracks().forEach((track) => track.stop());
    state.stream = null;
  }
  els.video.srcObject = null;
  els.fallback.classList.remove("is-hidden");
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

els.captureButton.addEventListener("click", startScan);
els.reconnectCameraButton.addEventListener("click", startCamera);
els.showRevealButton.addEventListener("click", showReveal);
els.restartButton.addEventListener("click", restart);
window.addEventListener("beforeunload", stopCamera);

startCamera();
