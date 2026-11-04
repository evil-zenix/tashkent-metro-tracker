
const svgNS = "http://www.w3.org/2000/svg";

const lines = [
  {
    name: "Чиланзарская",
    color: "#f05b67",
    points: [
      [65, 100], [145, 100], [225, 100],
      [305, 100], [385, 100], [465, 100],
      [545, 100], [625, 100]
    ],
    stations: [
      "Буюк Ипак Йули", "Пушкин", "Хамид Олимжон",
      "Амир Темур хиёбони", "Мустакиллик майдони",
      "Пахтакор", "Миллий бог", "Чиланзар"
    ]
  },
  {
    name: "Узбекистанская",
    color: "#4d9eff",
    points: [
      [145, 190], [225, 190], [305, 190],
      [385, 190], [465, 190], [545, 190]
    ],
    stations: [
      "Бер уни", "Тинчлик", "Чорсу",
      "Гафур Гулям", "Алишер Навои", "Узбекистан"
    ]
  },
  {
    name: "Юнусабадская",
    color: "#39c99a",
    points: [
      [65, 300], [145, 300], [225, 300],
      [305, 300], [385, 300], [465, 300],
      [545, 300], [625, 300]
    ],
    stations: [
      "Туркистон", "Юнусобод", "Шахристан",
      "Бадамзар", "Минор", "Абдулла Кодирий",
      "Юнус Раджабий", "Минг Урик"
    ]
  },
  {
    name: "Кольцевая",
    color: "#e8b653",
    points: [
      [145, 430], [225, 430], [305, 430],
      [385, 430], [465, 430], [545, 430]
    ],
    stations: [
      "Технопарк", "Яшнабад", "Тузель",
      "Олмос", "Рохат", "Кипчак"
    ]
  }
];

const routesGroup = document.getElementById("routes");
const stationsGroup = document.getElementById("stations");
const trainsGroup = document.getElementById("trains");

function createSVG(tag, attributes = {}) {
  const element = document.createElementNS(svgNS, tag);

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  return element;
}

const trainAnimations = [];

function drawMap() {
  lines.forEach((line, lineIndex) => {
    const pathData = line.points
      .map((point, index) =>
        `${index === 0 ? "M" : "L"} ${point[0]} ${point[1]}`
      )
      .join(" ");

    const route = createSVG("path", {
      d: pathData,
      class: "route",
      stroke: line.color
    });

    routesGroup.appendChild(route);

    line.points.forEach((point, stationIndex) => {
      const [x, y] = point;
      const stationName = line.stations[stationIndex];

      const group = createSVG("g", {
        class: "station-group"
      });

      const circle = createSVG("circle", {
        cx: x,
        cy: y,
        r: 7,
        class: "station"
      });

      circle.setAttribute("stroke", line.color);

      circle.addEventListener("click", () => {
        selectStation(stationName, line.name, line.color);
      });

      const label = createSVG("text", {
        x,
        y: y - 14,
        "text-anchor": "middle",
        class: "station-label"
      });

      label.textContent = stationName;

      group.appendChild(circle);
      group.appendChild(label);
      stationsGroup.appendChild(group);
    });

    createTrains(pathData, line.color, lineIndex);
  });
}

function createTrains(pathData, color, lineIndex) {
  const trainCount = 2;

  for (let i = 0; i < trainCount; i++) {
    const train = createSVG("circle", {
      r: 8,
      fill: color,
      class: "train"
    });

    const core = createSVG("circle", {
      r: 3,
      fill: "#ffffff"
    });

    const group = createSVG("g");

    group.appendChild(train);
    group.appendChild(core);
    trainsGroup.appendChild(group);

    const motionPath = createSVG("path", {
      d: pathData,
      fill: "none",
      stroke: "none"
    });

    routesGroup.appendChild(motionPath);

    trainAnimations.push({
      group,
      path: motionPath,
      progress: (i * 0.5 + lineIndex * 0.13) % 1,
      speed: 0.000018 + lineIndex * 0.000002
    });
  }
}

function animateTrains() {
  trainAnimations.forEach((train) => {
    train.progress = (train.progress + train.speed * 16) % 1;

    const length = train.path.getTotalLength();
    const point = train.path.getPointAtLength(
      length * train.progress
    );

    train.group.setAttribute(
      "transform",
      `translate(${point.x} ${point.y})`
    );
  });

  requestAnimationFrame(animateTrains);
}

function selectStation(name, line, color) {
  document.getElementById("station-name").textContent = name;

  const info = document.getElementById("station-info");
  info.textContent = `${line} · Данные о прибытии пока не собираются`;

  info.style.color = color;
}

function updateClock() {
  const now = new Date();

  document.getElementById("clock").textContent =
    now.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
}

drawMap();
animateTrains();
updateClock();

setInterval(updateClock, 1000);

document.getElementById("train-count").textContent =
  trainAnimations.length;
