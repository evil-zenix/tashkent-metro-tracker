
const svgNS = "http://www.w3.org/2000/svg";

const lines = window.METRO_LINES;

const routesGroup = document.getElementById("routes");
const stationsGroup = document.getElementById("stations");
const trainsGroup = document.getElementById("trains");

const trainAnimations = [];

function createSVG(tag, attributes = {}) {
  const element = document.createElementNS(svgNS, tag);

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  return element;
}

function getStationPoints(line, lineIndex) {
  const count = line.stations.length;
  const startX = 65;
  const endX = 1135;
  const y = 90 + lineIndex * 125;

  return line.stations.map((name, index) => ({
    name,
    x: startX + (endX - startX) * index / (count - 1),
    y: y + (index % 2 === 0 ? 0 : 12)
  }));
}

function drawLine(line, lineIndex) {
  const points = getStationPoints(line, lineIndex);

  const pathData = points
    .map((point, index) =>
      `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
    )
    .join(" ");

  const route = createSVG("path", {
    d: pathData,
    class: "route",
    stroke: line.color
  });

  routesGroup.appendChild(route);

  points.forEach((point, index) => {
    const group = createSVG("g");

    const circle = createSVG("circle", {
      cx: point.x,
      cy: point.y,
      r: 7,
      class: "station",
      stroke: line.color
    });

    circle.addEventListener("click", () => {
      selectStation(point.name, line.name, line.color);
    });

    const label = createSVG("text", {
      x: point.x,
      y: point.y + (index % 2 === 0 ? -15 : 25),
      "text-anchor": "middle",
      class: "station-label"
    });

    label.textContent = point.name;

    group.appendChild(circle);
    group.appendChild(label);
    stationsGroup.appendChild(group);
  });

  createTrains(pathData, line.color, lineIndex);
}

function createTrains(pathData, color, lineIndex) {
  for (let i = 0; i < 2; i++) {
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

    const path = createSVG("path", {
      d: pathData,
      fill: "none",
      stroke: "none"
    });

    routesGroup.appendChild(path);

    trainAnimations.push({
      group,
      path,
      progress: (i * 0.5 + lineIndex * 0.13) % 1,
      speed: 0.000015
    });
  }
}

function animateTrains() {
  trainAnimations.forEach(train => {
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
  info.textContent = `${line} · Данные о прибытии пока отсутствуют`;
  info.style.color = color;
}

function updateClock() {
  document.getElementById("clock").textContent =
    new Date().toLocaleTimeString("ru-RU");
}

function init() {
  if (!lines || !routesGroup || !stationsGroup || !trainsGroup) {
    console.error("Metro data or map elements not found");
    return;
  }

  lines.forEach(drawLine);

  const totalStations = lines.reduce(
    (sum, line) => sum + line.stations.length,
    0
  );

  document.querySelector(".stats .stat:nth-child(1) strong")
    .textContent = lines.length;

  document.querySelector(".stats .stat:nth-child(2) strong")
    .textContent = totalStations;

  document.getElementById("train-count").textContent =
    trainAnimations.length;

  updateClock();
  setInterval(updateClock, 1000);

  animateTrains();
}

init();
