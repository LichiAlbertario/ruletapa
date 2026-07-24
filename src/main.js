const WHEEL_ORDER = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const BOARD_ROWS = [[3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36], [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35], [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]];

let lastNumbers = [];
let blueCapacity = 4;

const elements = {
  wheel: document.querySelector('#wheel'),
  racetrack: document.querySelector('#racetrack'),
  zeroColumn: document.querySelector('#zeroColumn'),
  numberGrid: document.querySelector('#numberGrid'),
  form: document.querySelector('#chatForm'),
  input: document.querySelector('#numberInput'),
  error: document.querySelector('#error'),
  resetButton: document.querySelector('#resetButton'),
  capacityRange: document.querySelector('#capacityRange'),
  capacityValue: document.querySelector('#capacityValue'),
  lastLoaded: document.querySelector('#lastLoaded'),
  blueList: document.querySelector('#blueList'),
  yellowList: document.querySelector('#yellowList'),
  greenList: document.querySelector('#greenList'),
};

function normalizeNumbers(text) {
  return text.split(/[\s,;.-]+/).map((part) => part.trim()).filter(Boolean).map(Number).filter((number) => Number.isInteger(number) && number >= 0 && number <= 36);
}

function calculateHighlights(numbers) {
  if (numbers.length === 0) return { blue: [], yellow: [], green: [] };

  const blue = new Set(numbers.slice(-blueCapacity));
  const yellow = new Set();

  blue.forEach((number) => {
    const index = WHEEL_ORDER.indexOf(number);
    [-2, -1, 1, 2].forEach((offset) => {
      const neighbor = WHEEL_ORDER[(index + offset + WHEEL_ORDER.length) % WHEEL_ORDER.length];
      if (!blue.has(neighbor)) yellow.add(neighbor);
    });
  });

  const green = WHEEL_ORDER.filter((number) => !blue.has(number) && !yellow.has(number));
  return { blue: [...blue].sort((a, b) => a - b), yellow: [...yellow].sort((a, b) => a - b), green: green.sort((a, b) => a - b) };
}

function tableColor(number) {
  if (number === 0) return 'zero';
  return RED_NUMBERS.has(number) ? 'red' : 'black';
}

function highlightColor(number, highlights) {
  if (highlights.blue.includes(number)) return 'blue';
  if (highlights.yellow.includes(number)) return 'yellow';
  if (highlights.green.includes(number)) return 'green';
  return '';
}

function createNumber(number, highlights, className = 'board-number') {
  const node = document.createElement('span');
  const highlight = highlightColor(number, highlights);
  node.className = `${className} ${tableColor(number)}${highlight ? ` highlight-${highlight}` : ''}`;
  node.textContent = number;
  return node;
}

function renderWheel(highlights) {
  elements.wheel.innerHTML = '<div class="wheel-center"><div class="hub"></div><span>RULETA</span></div>';
  WHEEL_ORDER.forEach((number, index) => {
    const angle = (360 / WHEEL_ORDER.length) * index;
    const slot = document.createElement('div');
    slot.className = 'wheel-slot';
    slot.style.transform = `rotate(${angle}deg) translateY(-220px) rotate(${-angle}deg)`;
    slot.append(createNumber(number, highlights, 'number-chip'));
    elements.wheel.append(slot);
  });
}

function renderBoard(highlights) {
  elements.racetrack.innerHTML = '';
  elements.zeroColumn.innerHTML = '';
  elements.numberGrid.innerHTML = '';
  WHEEL_ORDER.forEach((number) => elements.racetrack.append(createNumber(number, highlights)));
  elements.zeroColumn.append(createNumber(0, highlights));
  BOARD_ROWS.flat().forEach((number) => elements.numberGrid.append(createNumber(number, highlights)));
}

function renderLists(highlights) {
  elements.blueList.textContent = highlights.blue.length ? highlights.blue.join(', ') : 'Sin números';
  elements.yellowList.textContent = highlights.yellow.length ? highlights.yellow.join(', ') : 'Sin números';
  elements.greenList.textContent = highlights.green.length ? highlights.green.join(', ') : 'Sin números';
  elements.capacityValue.textContent = blueCapacity;
  elements.lastLoaded.textContent = lastNumbers.length ? `Últimos cargados: ${lastNumbers.join(', ')}` : 'Últimos cargados: ninguno';
}

function render() {
  const highlights = calculateHighlights(lastNumbers);
  renderWheel(highlights);
  renderBoard(highlights);
  renderLists(highlights);
}

elements.form.addEventListener('submit', (event) => {
  event.preventDefault();
  const parsed = normalizeNumbers(elements.input.value);
  if (parsed.length === 0) {
    elements.error.textContent = 'Escribí al menos 1 número válido entre 0 y 36. Ejemplo: 5 o 5 23';
    return;
  }
  lastNumbers = [...lastNumbers, ...parsed].slice(-blueCapacity);
  elements.input.value = '';
  elements.error.textContent = '';
  render();
});

elements.resetButton.addEventListener('click', () => {
  lastNumbers = [];
  elements.input.value = '';
  elements.error.textContent = '';
  render();
});

elements.capacityRange.addEventListener('input', () => {
  blueCapacity = Number(elements.capacityRange.value);
  lastNumbers = lastNumbers.slice(-blueCapacity);
  render();
});

render();
