// --- ELEMENTOS DO DOM ---
const grid = document.getElementById("grid");
const overlay = document.getElementById("overlay");
const colsInput = document.getElementById("cols");
const rowsInput = document.getElementById("rows");
const clearGridBtn = document.getElementById("clear-grid-btn");
const menuPopup = document.getElementById("menu-popup");
const labelsTop = document.getElementById("labels-top");
const labelsLeft = document.getElementById("labels-left");
const canvasWrapper = document.getElementById("canvas-wrapper");
const gridContainer = document.getElementById("grid-container");
const canvasContainer = document.getElementById("canvas-container");
const croquiWrapper = document.getElementById("croqui-wrapper");
const generateBtn = document.getElementById("generate-btn");
const modalOverlay = document.getElementById("modal-overlay");
const modalImageContainer = document.getElementById("modal-image-container");
const modalCancelBtn = document.getElementById("modal-cancel-btn");
const modalDownloadBtn = document.getElementById("modal-download-btn");
const moduleSizePresetInput = document.getElementById("module-size-preset");
const exportModeSelect = document.getElementById("export-mode");
const insertModeStatus = document.getElementById("insert-mode-status");

// --- ESTADO DA APLICAÇÃO ---
const borderWidth = 2;
const defaultModuleSizeCm = 100;
let numRows = 3;
let numCols = 5;
let columnWidths = [];
let rowHeights = [];
let gridState = [];
let activeInsertMode = null;

// --- FUNÇÕES DE LÓGICA DO GRID ---
function getX(col) { return columnWidths.slice(0, col).reduce((a, b) => a + b, 0); }
function getY(row) { return rowHeights.slice(0, row).reduce((a, b) => a + b, 0); }
function cmToGridSize(value) { return value + borderWidth; }
function gridSizeToCm(value) { return Math.max(0, value - borderWidth); }
function formatCm(value) { return `${gridSizeToCm(value)}cm`; }

function resetGridState(newRows, newCols) {
  numRows = newRows;
  numCols = newCols;
  colsInput.value = newCols;
  rowsInput.value = newRows;
  gridState = Array(numRows).fill(null).map(() => Array(numCols).fill(null));
  columnWidths = Array(numCols).fill(cmToGridSize(defaultModuleSizeCm));
  rowHeights = Array(numRows).fill(cmToGridSize(defaultModuleSizeCm));
  updateGrid();
}

function updateGrid() {
  const newRows = parseInt(rowsInput.value);
  const newCols = parseInt(colsInput.value);
  while (gridState.length < newRows) {
    gridState.push(Array(numCols).fill(null));
    rowHeights.push(cmToGridSize(defaultModuleSizeCm));
  }
  gridState.length = newRows;
  gridState.forEach(row => {
    while (row.length < newCols) { row.push(null); }
    row.length = newCols;
  });
  while (columnWidths.length < newCols) { columnWidths.push(cmToGridSize(defaultModuleSizeCm)); }
  numRows = newRows;
  numCols = newCols;
  columnWidths.length = newCols;
  rowHeights.length = newRows;
  redrawAll();
}

function rebuildOccupiedCells() {
  gridState.forEach((row) => {
    row.forEach((cell, index) => {
      if (cell && !cell.master) {
        row[index] = null;
      }
    });
  });

  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      const cell = gridState[r][c];
      if (cell && cell.master && cell.type.startsWith('giro') && cell.spanY === 2 && r > 0) {
        gridState[r - 1][c] = { occupiedBy: [r, c] };
      }
    }
  }
}

function insertColumnAt(index) {
  const columnIndex = Math.max(0, Math.min(index, numCols));
  gridState.forEach((row) => row.splice(columnIndex, 0, null));
  columnWidths.splice(columnIndex, 0, cmToGridSize(defaultModuleSizeCm));
  numCols++;
  colsInput.value = numCols;
  rebuildOccupiedCells();
  redrawAll();
}

function insertRowAt(index) {
  const rowIndex = Math.max(0, Math.min(index, numRows));
  gridState.splice(rowIndex, 0, Array(numCols).fill(null));
  rowHeights.splice(rowIndex, 0, cmToGridSize(defaultModuleSizeCm));
  numRows++;
  rowsInput.value = numRows;
  rebuildOccupiedCells();
  redrawAll();
}

function redrawAll() {
  grid.innerHTML = "";
  overlay.innerHTML = "";
  labelsTop.innerHTML = "";
  labelsLeft.innerHTML = "";
  const totalWidth = columnWidths.reduce((a, b) => a + b, 0);
  const totalHeight = rowHeights.reduce((a, b) => a + b, 0);
  const lineWidth = 2;
  const containerWidth = totalWidth + lineWidth;
  const containerHeight = totalHeight + lineWidth;

  grid.style.width = `${containerWidth}px`;
  grid.style.height = `${containerHeight}px`;
  overlay.style.width = `${containerWidth}px`;
  overlay.style.height = `${containerHeight}px`;
  canvasWrapper.style.width = `${containerWidth}px`;
  canvasWrapper.style.height = `${containerHeight}px`;
  gridContainer.style.width = `${containerWidth}px`;
  gridContainer.style.height = `${containerHeight}px`;

  generateLabels();
  generateLines(totalWidth, totalHeight);
  
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      const cellState = gridState[r][c];
      if (cellState && cellState.master) {
        insertComponent(r, c, cellState, false);
      } else if (!cellState) {
        createAddButton(r, c);
      }
    }
  }
  updateCroquiPosition();
}

function showCustomModal(options) {
  const modal = document.getElementById('custom-modal-overlay');
  const titleEl = document.getElementById('custom-modal-title');
  const textEl = document.getElementById('custom-modal-text');
  const inputWrapper = document.getElementById('custom-modal-input-wrapper');
  const inputEl = document.getElementById('custom-modal-input');
  const confirmBtn = document.getElementById('custom-modal-confirm-btn');
  const cancelBtn = document.getElementById('custom-modal-cancel-btn');

  titleEl.textContent = options.title || '';
  textEl.textContent = options.text || '';
  confirmBtn.textContent = options.confirmText || 'OK';
  cancelBtn.textContent = options.cancelText || 'Cancelar';

  if (options.inputType === 'number') {
    inputWrapper.style.display = 'block';
    inputEl.value = options.initialValue || '';
    setTimeout(() => inputEl.focus(), 50);
  } else {
    inputWrapper.style.display = 'none';
  }
  
  modal.style.display = 'flex';
  setTimeout(() => modal.classList.add('visible'), 10);

  return new Promise((resolve) => {
    const onConfirm = () => {
      closeModal();
      resolve(options.inputType ? inputEl.value : true);
    };

    const onCancel = () => {
      closeModal();
      resolve(false);
    };

    const onKeydown = (e) => {
      if (e.key === 'Enter') {
        onConfirm();
      } else if (e.key === 'Escape') {
        onCancel();
      }
    };
    
    function closeModal() {
      modal.classList.remove('visible');
      setTimeout(() => {
        modal.style.display = 'none';
        cleanup();
      }, 200);
    }
    
    confirmBtn.addEventListener('click', onConfirm);
    cancelBtn.addEventListener('click', onCancel);
    document.addEventListener('keydown', onKeydown);

    function cleanup() {
      confirmBtn.removeEventListener('click', onConfirm);
      cancelBtn.removeEventListener('click', onCancel);
      document.removeEventListener('keydown', onKeydown);
    }
  });
}

// --- NOVA FUNÇÃO PARA O MENU DE OPÇÕES DE GIRO ---
function showGiroOptionsMenu(r, c) {
  const modal = document.getElementById('giro-options-modal-overlay');
  const size1Btn = document.querySelector('[data-size="1"]');
  const size2Btn = document.querySelector('[data-size="2"]');
  const dirLeftBtn = document.querySelector('[data-direction="esquerda"]');
  const dirRightBtn = document.querySelector('[data-direction="direita"]');
  const transomWithBtn = document.querySelector('[data-transom="true"]');
  const transomWithoutBtn = document.querySelector('[data-transom="false"]');
  const confirmBtn = document.getElementById('giro-options-confirm-btn');
  const cancelBtn = document.getElementById('giro-options-cancel-btn');

  // Estado local para as opções
  let selectedSize = 1;
  let selectedDirection = 'direita';
  let withTransom = false;

  return new Promise((resolve) => {
    function setup() {
      const hasSpaceAbove = r > 0 && gridState[r - 1][c] === null;
      size2Btn.classList.toggle('disabled', !hasSpaceAbove);
      size2Btn.disabled = !hasSpaceAbove;
      selectedSize = 1;
      selectedDirection = 'direita';
      withTransom = false;
      size1Btn.classList.add('selected');
      size2Btn.classList.remove('selected');
      dirLeftBtn.classList.remove('selected');
      dirRightBtn.classList.add('selected');
      transomWithBtn.classList.remove('selected');
      transomWithoutBtn.classList.add('selected');
    }

    // 2. Funções de clique
    const onSizeClick = (e) => {
      const btn = e.target;
      if (btn.disabled) return;
      selectedSize = parseInt(btn.dataset.size);
      size1Btn.classList.toggle('selected', selectedSize === 1);
      size2Btn.classList.toggle('selected', selectedSize === 2);
    };

    const onDirectionClick = (e) => {
      selectedDirection = e.target.dataset.direction;
      dirLeftBtn.classList.toggle('selected', selectedDirection === 'esquerda');
      dirRightBtn.classList.toggle('selected', selectedDirection === 'direita');
    };

    const onTransomClick = (e) => {
      withTransom = e.target.dataset.transom === 'true';
      transomWithBtn.classList.toggle('selected', withTransom);
      transomWithoutBtn.classList.toggle('selected', !withTransom);
    };

    // 3. Funções de fechar o modal
    const onConfirm = () => {
      closeModal();
      resolve({
        size: selectedSize,
        direction: selectedDirection,
        transom: withTransom,
      });
    };
    
    const onCancel = () => {
      closeModal();
      resolve(null); // Retorna nulo em caso de cancelamento
    };

    function closeModal() {
      modal.style.display = 'none';
      // Limpa os event listeners para evitar memory leaks
      size1Btn.removeEventListener('click', onSizeClick);
      size2Btn.removeEventListener('click', onSizeClick);
      dirLeftBtn.removeEventListener('click', onDirectionClick);
      dirRightBtn.removeEventListener('click', onDirectionClick);
      transomWithBtn.removeEventListener('click', onTransomClick);
      transomWithoutBtn.removeEventListener('click', onTransomClick);
      confirmBtn.removeEventListener('click', onConfirm);
      cancelBtn.removeEventListener('click', onCancel);
    }
    
    // 4. Adiciona os event listeners
    size1Btn.addEventListener('click', onSizeClick);
    size2Btn.addEventListener('click', onSizeClick);
    dirLeftBtn.addEventListener('click', onDirectionClick);
    dirRightBtn.addEventListener('click', onDirectionClick);
    transomWithBtn.addEventListener('click', onTransomClick);
    transomWithoutBtn.addEventListener('click', onTransomClick);
    confirmBtn.addEventListener('click', onConfirm);
    cancelBtn.addEventListener('click', onCancel);
    
    // 5. Roda o setup inicial e mostra o modal
    setup();
    modal.style.display = 'flex';
  });
}

// --- LABELS / TAMANHOS ---
function createLabelInsertButton(className, title, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `label-insert-btn ${className}`;
  button.title = title;
  button.setAttribute('aria-label', title);
  button.textContent = "+";
  button.addEventListener("click", (e) => {
    e.stopPropagation();
    onClick();
  });
  return button;
}

function generateLabels() {
  labelsTop.innerHTML = '';
  labelsLeft.innerHTML = '';
  columnWidths.forEach((width, index) => {
    const label = document.createElement("div");
    const labelText = String.fromCharCode(65 + index);
    label.title = `Coluna ${labelText}: ${formatCm(width)}`;
    label.innerHTML = `<span class="label-code">${labelText}</span><span class="label-measure">${formatCm(width)}</span>`;
    label.style.width = `${width}px`;
    if (index === 0) {
      label.appendChild(createLabelInsertButton(
        'insert-col-before',
        `Inserir coluna antes de ${labelText}`,
        () => insertColumnAt(index)
      ));
    }
    label.appendChild(createLabelInsertButton(
      'insert-col-after',
      `Inserir coluna depois de ${labelText}`,
      () => insertColumnAt(index + 1)
    ));
    label.addEventListener("click", async () => {
      const internalWidth = width - borderWidth;
      const result = await showCustomModal({
        title: 'Alterar Largura da Coluna',
        text: `Digite a nova largura para a coluna ${String.fromCharCode(65 + index)} (15-300 cm):`,
        inputType: 'number',
        initialValue: internalWidth,
        confirmText: 'Alterar',
        cancelText: 'Cancelar'
      });

      if (result !== false && result !== null && result !== '') {
        const newSize = parseInt(result);
        if (!isNaN(newSize) && newSize >= 15 && newSize <= 300) {
          columnWidths[index] = cmToGridSize(newSize); 
          updateGrid();
        } else {
          showCustomModal({ title: 'Erro', text: 'Por favor, insira um valor válido entre 15 e 300 cm.', confirmText: 'OK' });
        }
      }
    });
    labelsTop.appendChild(label);
  });

  rowHeights.forEach((height, index) => {
    const label = document.createElement("div");
    const labelText = index + 1;
    label.title = `Linha ${labelText}: ${formatCm(height)}`;
    label.innerHTML = `<span class="label-code">${labelText}</span><span class="label-measure">${formatCm(height)}</span>`;
    label.style.height = `${height}px`;
    if (index === 0) {
      label.appendChild(createLabelInsertButton(
        'insert-row-before',
        `Inserir linha antes de ${labelText}`,
        () => insertRowAt(index)
      ));
    }
    label.appendChild(createLabelInsertButton(
      'insert-row-after',
      `Inserir linha depois de ${labelText}`,
      () => insertRowAt(index + 1)
    ));
    label.addEventListener("click", async () => {
      const internalHeight = height - borderWidth;
      const result = await showCustomModal({
        title: 'Alterar Altura da Linha',
        text: `Digite a nova altura para a linha ${index + 1} (15-300 cm):`,
        inputType: 'number',
        initialValue: internalHeight,
        confirmText: 'Alterar',
        cancelText: 'Cancelar'
      });

      if (result !== false && result !== null && result !== '') {
        const newSize = parseInt(result);
        if (!isNaN(newSize) && newSize >= 15 && newSize <= 300) {
          rowHeights[index] = cmToGridSize(newSize);
          updateGrid();
        } else {
          showCustomModal({ title: 'Erro', text: 'Por favor, insira um valor válido entre 15 e 300 cm.', confirmText: 'OK' });
        }
      }
    });
    labelsLeft.appendChild(label);
  });
}

function generateLines(totalWidth, totalHeight) {
  let y = 0;
  for (let r = 0; r <= numRows; r++) {
    const line = document.createElement("div");
    line.className = "line h-line";
    line.style.top = `${y}px`;
    grid.appendChild(line);
    y += rowHeights[r] || 0;
  }
  let x = 0;
  for (let c = 0; c <= numCols; c++) {
    const line = document.createElement("div");
    line.className = "line v-line";
    line.style.left = `${x}px`;
    grid.appendChild(line);
    x += columnWidths[c] || 0;
  }
}

function updateCroquiPosition() {
  croquiWrapper.style.width = 'auto';
  croquiWrapper.style.height = 'auto';
  const croquiWidth = croquiWrapper.offsetWidth;
  const croquiHeight = croquiWrapper.offsetHeight;
  const containerWidth = canvasContainer.clientWidth - 40;
  const containerHeight = canvasContainer.clientHeight - 40;
  croquiWrapper.style.transform = 'none';
  if (croquiWidth > containerWidth) {
    croquiWrapper.style.left = '0px';
  } else {
    croquiWrapper.style.left = `calc(50% - ${croquiWidth / 2}px)`;
  }
  if (croquiHeight > containerHeight) {
    croquiWrapper.style.top = '0px';
  } else {
    croquiWrapper.style.top = `calc(50% - ${croquiHeight / 2}px)`;
  }
}

function getComponentName(type) {
  const names = {
    'maxim-ar': 'Maxim-ar',
    veneziana: 'Veneziana',
    giro: 'Porta de Giro'
  };
  return names[type] || type;
}

function updateInsertModeStatus() {
  document.querySelectorAll("#sidebar .component").forEach((component) => {
    component.classList.toggle('selected', activeInsertMode?.type === component.dataset.type);
  });

  if (!activeInsertMode) {
    insertModeStatus.classList.remove('visible');
    insertModeStatus.innerHTML = '';
    return;
  }

  const scopeText = activeInsertMode.scope === 'row' ? 'Clique em uma linha para preencher.' : 'Clique em um quadro vazio.';
  insertModeStatus.innerHTML = `
    <strong>${getComponentName(activeInsertMode.type)}</strong><br>
    ${scopeText}
    <button type="button" id="cancel-insert-mode-btn">Cancelar</button>
  `;
  insertModeStatus.classList.add('visible');
  document.getElementById('cancel-insert-mode-btn').addEventListener('click', () => clearInsertMode());
}

function setInsertMode(type, scope) {
  activeInsertMode = { type, scope };
  menuPopup.style.display = "none";
  menuPopup.classList.remove('insert-mode-menu');
  updateInsertModeStatus();
  redrawAll();
}

function clearInsertMode(shouldRedraw = true) {
  activeInsertMode = null;
  updateInsertModeStatus();
  if (shouldRedraw) {
    redrawAll();
  }
}

function fillRowWithComponent(row, type) {
  let insertedCount = 0;
  for (let c = 0; c < numCols; c++) {
    if (!gridState[row][c]) {
      gridState[row][c] = { type, master: true };
      insertedCount++;
    }
  }
  return insertedCount;
}

async function insertFromActiveMode(r, c) {
  if (!activeInsertMode) return false;

  const { type, scope } = activeInsertMode;
  if (scope === 'row') {
    const insertedCount = fillRowWithComponent(r, type);
    clearInsertMode(false);
    redrawAll();
    if (insertedCount === 0) {
      showCustomModal({ title: 'Linha ocupada', text: 'Essa linha não possui quadros vazios para inserir o componente.', confirmText: 'OK' });
    }
    return true;
  }

  if (type === 'giro') {
    const giroOptions = await showGiroOptionsMenu(r, c);
    clearInsertMode(false);
    if (giroOptions) {
      const newState = {
        type: `giro-${giroOptions.direction}`,
        master: true,
        spanY: giroOptions.size,
        transom: giroOptions.transom,
      };
      gridState[r][c] = newState;
      if (newState.spanY === 2) {
        gridState[r - 1][c] = { occupiedBy: [r, c] };
      }
    }
    redrawAll();
    return true;
  }

  gridState[r][c] = { type, master: true };
  clearInsertMode(false);
  redrawAll();
  return true;
}

function highlightRowTargets(row, shouldHighlight) {
  document.querySelectorAll(`.add-btn[data-row="${row}"]`).forEach((button) => {
    button.classList.toggle('insert-row-target', shouldHighlight);
  });
}

function createAddButton(r, c) {
  const borderWidth = 2;
  const addBtn = document.createElement("div");
  addBtn.className = "add-btn";
  addBtn.dataset.row = r;
  addBtn.dataset.col = c;
  addBtn.style.left = `${getX(c) + borderWidth}px`;
  addBtn.style.top = `${getY(r) + borderWidth}px`;
  addBtn.style.width = `${columnWidths[c] - borderWidth}px`;
  addBtn.style.height = `${rowHeights[r] - borderWidth}px`;
  addBtn.innerText = "+";
  
  if (activeInsertMode) {
    addBtn.classList.add('insert-target');
  }

  addBtn.addEventListener("click", async (e) => {
    e.stopPropagation();
    if (await insertFromActiveMode(r, c)) return;
    showComponentMenu(e, r, c);
  });
  addBtn.addEventListener("mouseenter", () => {
    if (activeInsertMode?.scope === 'row') {
      highlightRowTargets(r, true);
    }
  });
  addBtn.addEventListener("mouseleave", () => {
    if (activeInsertMode?.scope === 'row') {
      highlightRowTargets(r, false);
    }
  });
  overlay.appendChild(addBtn);
}

function insertComponent(r, c, state, shouldUpdateState = true) {
  if (shouldUpdateState) {
    gridState[r][c] = { ...state, master: true };
    redrawAll();
    return;
  }
  
  const type = state.type;
  let left = getX(c);
  let top = getY(r);
  let width = columnWidths[c];
  let height = rowHeights[r];
  let totalHeight = height;
  const borderWidth = 2;

  if (state.type.startsWith('giro') && state.spanY === 2) {
    top = getY(r - 1); 
    totalHeight = height + rowHeights[r-1]; 
  }
  
  const comp = document.createElement("div");
  comp.className = "component-placed";
  comp.style.left = `${left + borderWidth}px`; 
  comp.style.top = `${top + borderWidth}px`;
  comp.style.width = `${width - borderWidth}px`;
  comp.style.height = `${totalHeight - borderWidth}px`;

    const internalWidth = parseFloat(comp.style.width);
    const internalHeight = parseFloat(comp.style.height);

  if (type === "maxim-ar") {
    comp.innerHTML = `<svg viewBox="0 0 ${internalWidth} ${internalHeight}">
            <path d="M0 0 L${internalWidth / 2} ${internalHeight} L${internalWidth} 0" 
                  stroke="black" stroke-width="2" fill="none"/>
        </svg>`;
}   else if (type === "veneziana") {
    const lines = [];
    const lineThickness = 1;
    const desiredLineCycleHeight = 10;
    const numLines = Math.max(1, Math.floor(internalHeight / desiredLineCycleHeight));
    const totalGapSpace = internalHeight - (numLines * lineThickness);
    const actualGap = totalGapSpace / (numLines + 1);
    let currentY = actualGap + (lineThickness / 2);
    for (let i = 0; i < numLines; i++) {
        lines.push(`<line x1="0" y1="${currentY}" x2="${internalWidth}" y2="${currentY}" stroke="black" stroke-width="${lineThickness}" />`);
        currentY += lineThickness + actualGap;
    }
    
    comp.innerHTML = `<svg viewBox="0 0 ${internalWidth} ${internalHeight}"><g>${lines.join("")}</g></svg>`;
  }  else if (type === 'giro-direita' || type === 'giro-esquerda') {
    let path;
    if (type === 'giro-direita') {
      path = `M0 0 L${internalWidth} ${internalHeight / 2} L0 ${internalHeight}`;
    } else { // giro-esquerda
      path = `M${internalWidth} 0 L0 ${internalHeight / 2} L${internalWidth} ${internalHeight}`;
    }
    comp.innerHTML = `<svg viewBox="0 0 ${internalWidth} ${internalHeight}"><path d="${path}" stroke="black" stroke-width="2" fill="none"/></svg>`;
  }

  const trash = document.createElement("button");
  trash.className = "trash-btn";
  trash.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;
  trash.addEventListener("click", (e) => {
    e.stopPropagation();
    gridState[r][c] = null;
    if (state.type.startsWith('giro') && state.spanY === 2) {
        gridState[r-1][c] = null;
    }
    redrawAll();
  });
  comp.addEventListener("dragover", (e) => e.preventDefault());
  comp.addEventListener("dragenter", (e) => { e.preventDefault(); comp.classList.add("hovering"); });
  comp.addEventListener("dragleave", () => comp.classList.remove("hovering"));
  comp.addEventListener("drop", (e) => {
    e.preventDefault();
    comp.classList.remove("hovering");
    const newType = e.dataTransfer.getData("text/plain");
    if (newType) {
        if (newType === 'giro') {
            // Se dropar um 'giro' em cima de um componente existente
            if (r === 0 || (gridState[r-1][c] !== null && gridState[r-1][c].master !== true)) {
                showCustomModal({ title: 'Aviso', text: 'Não é possível inserir o "giro" aqui. A célula superior está ocupada.', confirmText: 'OK'});
                return;
            }
            gridState[r][c] = null; // Limpa o estado atual
            if (type.startsWith('giro')) { gridState[r-1][c] = null; }
            redrawAll();
            showComponentMenu(e, r, c, true);
        } else {
            gridState[r][c] = { type: newType, master: true };
            if (type.startsWith('giro')) { gridState[r-1][c] = null; }
            redrawAll();
        }
    }
  });

  let hoverTimeout;
  comp.addEventListener("mouseenter", () => {
    hoverTimeout = setTimeout(() => comp.classList.add("hovering"), 100);
  });
  comp.addEventListener("mouseleave", () => {
    clearTimeout(hoverTimeout);
    comp.classList.remove("hovering");
  });

  comp.appendChild(trash);
  overlay.appendChild(comp);
  // Cenário 1: Apagar a travessa do grid em uma porta de 2 módulos
  if (state.type.startsWith('giro') && state.spanY === 2 && state.transom === false) {
    const transomRemover = document.createElement("div");
    transomRemover.style.position = 'absolute';
    transomRemover.style.backgroundColor = 'white';
    transomRemover.style.zIndex = '5';
    transomRemover.style.top = `${getY(r)}px`;
    transomRemover.style.left = `${getX(c) + borderWidth}px`;
    transomRemover.style.width = `${width - borderWidth}px`;
    transomRemover.style.height = `${borderWidth}px`;
    overlay.appendChild(transomRemover);
  }

  // Cenário 2: Desenhar uma nova travessa em uma porta de 1 módulo
  if (state.type.startsWith('giro') && state.spanY === 1 && state.transom === true) {
    const newTransom = document.createElement("div");
    newTransom.style.position = 'absolute';
    newTransom.style.backgroundColor = 'black';
    newTransom.style.zIndex = '5'; // Mesmo z-index do apagador
    // Posiciona a nova linha preta no centro vertical do componente
    newTransom.style.top = `${top + borderWidth + (internalHeight / 2) - (borderWidth / 2)}px`;
    newTransom.style.left = `${left + borderWidth}px`;
    newTransom.style.width = `${internalWidth}px`;
    newTransom.style.height = `${borderWidth}px`;
    overlay.appendChild(newTransom);
  }
}

async function showComponentMenu(e, r, c) { // Adicionamos async aqui
  e.stopPropagation();
  menuPopup.classList.remove('insert-mode-menu');
  // Esta parte do HTML do menu não muda
  const svgMaximAr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 102 102"><path d="M1 1 L51 101 L101 1" stroke="black" stroke-width="2" fill="none"/></svg>`;
  const svgVeneziana = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g stroke="black" stroke-width="1"><line y1="5" x2="100" y2="5" x1="0"></line><line y1="15" x2="100" y2="15" x1="0"></line><line y1="25" x2="100" y2="25" x1="0"></line><line y1="35" x2="100" y2="35" x1="0"></line><line y1="45" x2="100" y2="45" x1="0"></line><line y1="55" x2="100" y2="55" x1="0"></line><line y1="65" x2="100" y2="65" x1="0"></line><line y1="75" x2="100" y2="75" x1="0"></line><line y1="85" x2="100" y2="85" x1="0"></line><line y1="95" x2="100" y2="95" x1="0"></line></g></svg>`;
  const svgGiroIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M25 2 L75 50 L25 98" stroke="black" stroke-width="2" fill="none"/></svg>`;
  const menuOptionsHTML = `
      <div class="option" data-select="maxim-ar" style="background-image:url('data:image/svg+xml;utf8,${encodeURIComponent(svgMaximAr)}');"></div>
      <div class="option" data-select="veneziana" style="background-image:url('data:image/svg+xml;utf8,${encodeURIComponent(svgVeneziana)}');"></div>
      <div class="option" data-select="giro" style="background-image:url('data:image/svg+xml;utf8,${encodeURIComponent(svgGiroIcon)}');"></div>
  `;

  menuPopup.innerHTML = menuOptionsHTML;
  menuPopup.style.display = "flex";
  menuPopup.style.left = `${e.clientX}px`;
  menuPopup.style.top = `${e.clientY}px`;
  
  menuPopup.querySelectorAll(".option").forEach((opt) => {
    opt.onclick = async () => { // Adicionamos async aqui
      const selectedType = opt.dataset.select;
      menuPopup.style.display = "none"; // Esconde o menu pequeno imediatamente

      if (selectedType === 'giro') {
        const giroOptions = await showGiroOptionsMenu(r, c);
        
        if (giroOptions) { // Se o usuário confirmou
          const newState = {
            type: `giro-${giroOptions.direction}`,
            master: true,
            spanY: giroOptions.size,
            transom: giroOptions.transom,
          };
          gridState[r][c] = newState;
          if (newState.spanY === 2) {
            gridState[r - 1][c] = { occupiedBy: [r, c] };
          }
          redrawAll();
        }
      } else {
        // Lógica antiga para outros componentes
        gridState[r][c] = { type: selectedType, master: true };
        redrawAll();
      }
    };
  });
}

function showInsertModeMenu(e, type) {
  e.stopPropagation();
  menuPopup.classList.add('insert-mode-menu');
  menuPopup.innerHTML = `
    <button type="button" class="insert-mode-option" data-scope="cell">Selecionar quadro a ser inserido</button>
    <button type="button" class="insert-mode-option" data-scope="row">Selecionar linha a ser inserida</button>
  `;
  menuPopup.style.display = "flex";
  menuPopup.style.left = `${e.clientX}px`;
  menuPopup.style.top = `${e.clientY}px`;

  menuPopup.querySelectorAll(".insert-mode-option").forEach((option) => {
    option.addEventListener('click', (event) => {
      event.stopPropagation();
      setInsertMode(type, option.dataset.scope);
    });
  });
}

// --- LÓGICA DO MODAL E EXPORTAÇÃO ---
function drawDimensionLine(ctx, x1, y1, x2, y2, label, orientation, options = {}) {
  const bracketSize = options.bracketSize || 16;
  const labelOffset = options.labelOffset || 18;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);

  if (orientation === 'horizontal') {
    ctx.moveTo(x1, y1 - bracketSize / 2);
    ctx.lineTo(x1, y1 + bracketSize / 2);
    ctx.moveTo(x2, y2 - bracketSize / 2);
    ctx.lineTo(x2, y2 + bracketSize / 2);
  } else {
    ctx.moveTo(x1 - bracketSize / 2, y1);
    ctx.lineTo(x1 + bracketSize / 2, y1);
    ctx.moveTo(x2 - bracketSize / 2, y2);
    ctx.lineTo(x2 + bracketSize / 2, y2);
  }

  ctx.stroke();

  if (orientation === 'horizontal') {
    ctx.textAlign = 'center';
    ctx.fillText(label, (x1 + x2) / 2, y1 + labelOffset, options.maxTextWidth || Math.abs(x2 - x1));
  } else {
    ctx.textAlign = 'left';
    ctx.fillText(label, x1 + labelOffset, (y1 + y2) / 2, options.maxTextWidth || 76);
  }
}

function drawSimpleDimensions(ctx, baseCanvas, layout) {
  ctx.font = 'bold 18px sans-serif';
  const hX = layout.paddingLeft + baseCanvas.width + layout.cotaOffset;
  const hYStart = layout.paddingTop - layout.espacoExtra;
  const hYEnd = layout.paddingTop + baseCanvas.height + layout.espacoExtra;
  drawDimensionLine(ctx, hX, hYStart, hX, hYEnd, 'H', 'vertical', { bracketSize: 20, labelOffset: 15 });

  const lY = layout.paddingTop + baseCanvas.height + layout.cotaOffset;
  const lXStart = layout.paddingLeft - layout.espacoExtra;
  const lXEnd = layout.paddingLeft + baseCanvas.width + layout.espacoExtra;
  drawDimensionLine(ctx, lXStart, lY, lXEnd, lY, 'L', 'horizontal', { bracketSize: 20, labelOffset: 20 });
}

function drawDetailedDimensions(ctx, baseCanvas, layout) {
  ctx.font = 'bold 12px sans-serif';
  const totalOffset = 86;
  const detailX = layout.paddingLeft + baseCanvas.width + layout.cotaOffset;
  const detailY = layout.paddingTop + baseCanvas.height + layout.cotaOffset;

  columnWidths.forEach((width, index) => {
    const x1 = layout.paddingLeft + getX(index);
    const x2 = x1 + width;
    drawDimensionLine(ctx, x1, detailY, x2, detailY, formatCm(width), 'horizontal', {
      bracketSize: 14,
      labelOffset: 17,
      maxTextWidth: Math.max(14, width - 4)
    });
  });

  rowHeights.forEach((height, index) => {
    const y1 = layout.paddingTop + getY(index);
    const y2 = y1 + height;
    drawDimensionLine(ctx, detailX, y1, detailX, y2, formatCm(height), 'vertical', {
      bracketSize: 14,
      labelOffset: 8,
      maxTextWidth: 72
    });
  });

  ctx.font = 'bold 14px sans-serif';
  const totalWidthCm = columnWidths.reduce((sum, width) => sum + gridSizeToCm(width), 0);
  const totalHeightCm = rowHeights.reduce((sum, height) => sum + gridSizeToCm(height), 0);
  drawDimensionLine(
    ctx,
    layout.paddingLeft - layout.espacoExtra,
    layout.paddingTop + baseCanvas.height + totalOffset,
    layout.paddingLeft + baseCanvas.width + layout.espacoExtra,
    layout.paddingTop + baseCanvas.height + totalOffset,
    `L: ${totalWidthCm}cm`,
    'horizontal',
    { bracketSize: 18, labelOffset: 20 }
  );
  drawDimensionLine(
    ctx,
    layout.paddingLeft + baseCanvas.width + totalOffset,
    layout.paddingTop - layout.espacoExtra,
    layout.paddingLeft + baseCanvas.width + totalOffset,
    layout.paddingTop + baseCanvas.height + layout.espacoExtra,
    `H: ${totalHeightCm}cm`,
    'vertical',
    { bracketSize: 18, labelOffset: 12 }
  );
}

function createExportCanvas(baseCanvas, mode) {
  const finalCanvas = document.createElement('canvas');
  const ctx = finalCanvas.getContext('2d');
  const marcoRespiro = 1;
  const marcoEspessura = 3;
  const espacoExtra = marcoRespiro + marcoEspessura;
  const isDetailed = mode === 'detailed';
  const layout = {
    espacoExtra,
    paddingTop: 50 + espacoExtra,
    paddingLeft: 50 + espacoExtra,
    paddingBottom: (isDetailed ? 130 : 70) + espacoExtra,
    paddingRight: (isDetailed ? 210 : 70) + espacoExtra,
    cotaOffset: 22
  };

  finalCanvas.width = layout.paddingLeft + baseCanvas.width + layout.paddingRight;
  finalCanvas.height = layout.paddingTop + baseCanvas.height + layout.paddingBottom;
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
  ctx.fillStyle = 'black';
  ctx.fillRect(layout.paddingLeft - espacoExtra, layout.paddingTop - espacoExtra, baseCanvas.width + (espacoExtra * 2), baseCanvas.height + (espacoExtra * 2));
  ctx.fillStyle = 'white';
  ctx.fillRect(layout.paddingLeft - marcoRespiro, layout.paddingTop - marcoRespiro, baseCanvas.width + (marcoRespiro * 2), baseCanvas.height + (marcoRespiro * 2));
  ctx.drawImage(baseCanvas, layout.paddingLeft, layout.paddingTop);

  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'black';
  ctx.lineWidth = 2;
  ctx.textBaseline = 'middle';

  if (isDetailed) {
    drawDetailedDimensions(ctx, baseCanvas, layout);
  } else {
    drawSimpleDimensions(ctx, baseCanvas, layout);
  }

  return finalCanvas;
}

let currentPreviewBaseCanvas = null;

function renderExportPreview(mode) {
  if (!currentPreviewBaseCanvas) return;
  const finalCanvas = createExportCanvas(currentPreviewBaseCanvas, mode);
  const finalImage = new Image();
  finalImage.src = finalCanvas.toDataURL('image/png');
  modalImageContainer.innerHTML = '';
  modalImageContainer.appendChild(finalImage);

  const filenameInput = document.getElementById('filename-input');
  const suffix = mode === 'detailed' ? 'COTADO' : 'APRESENTACAO';
  filenameInput.value = `ELEVFAC-${numCols}X${numRows}-${suffix}.png`;
}

generateBtn.addEventListener("click", () => {
  const gridElement = document.getElementById("grid-container");
  const mode = exportModeSelect.value;
  html2canvas(gridElement).then(baseCanvas => {
    currentPreviewBaseCanvas = baseCanvas;
    renderExportPreview(mode);
    modalOverlay.style.display = 'flex';
  });
});
modalCancelBtn.addEventListener('click', () => {
  modalOverlay.style.display = 'none';
  currentPreviewBaseCanvas = null;
});
modalDownloadBtn.addEventListener('click', () => {
  const finalImage = modalImageContainer.querySelector('img');
  const filenameInput = document.getElementById('filename-input');
  if (finalImage && filenameInput) {
    let filename = filenameInput.value.trim(); 
    if (filename === '') {
      filename = `ELEVFAC-${numCols}X${numRows}.png`;
    }
    if (!filename.toLowerCase().endsWith('.png')) {
      filename += '.png';
    }
    const link = document.createElement('a');
    link.href = finalImage.src;
    link.download = filename;
    link.click();
  }
  modalOverlay.style.display = 'none';
  currentPreviewBaseCanvas = null;
});

exportModeSelect.addEventListener('change', () => {
  renderExportPreview(exportModeSelect.value);
});

// --- EVENTOS GERAIS ---
function applyPresetSize(target) {
  const newSize = parseInt(moduleSizePresetInput.value);
  if (isNaN(newSize) || newSize < 15 || newSize > 300) {
    showCustomModal({ title: 'Erro', text: 'Por favor, insira uma medida padrão entre 15 e 300 cm.', confirmText: 'OK' });
    return;
  }

  if (target === 'cols' || target === 'all') {
    columnWidths = columnWidths.map(() => cmToGridSize(newSize));
  }

  if (target === 'rows' || target === 'all') {
    rowHeights = rowHeights.map(() => cmToGridSize(newSize));
  }

  redrawAll();
}

document.getElementById('controls').addEventListener('click', (e) => {
  if (e.target.matches('.stepper-btn')) {
    const action = e.target.dataset.action;
    const targetInput = document.getElementById(e.target.dataset.target);
    if (targetInput) {
      let value = parseInt(targetInput.value);
      const min = parseInt(targetInput.min);
      if (action === 'increment') {
        value++;
      } else if (action === 'decrement' && value > min) {
        value--;
      }
      targetInput.value = value;
      targetInput.dispatchEvent(new Event('change'));
    }
  }

  if (e.target.matches('[data-apply-size]')) {
    applyPresetSize(e.target.dataset.applySize);
  }
});
colsInput.addEventListener("change", updateGrid);
rowsInput.addEventListener("change", updateGrid);
clearGridBtn.addEventListener("click", async () => {
  const confirmed = await showCustomModal({
    title: 'Limpar Fachada',
    text: 'Tem certeza que deseja limpar toda a fachada? Esta ação não pode ser desfeita.',
    confirmText: 'Sim, Limpar Tudo',
    cancelText: 'Cancelar'
  });
  if (confirmed) {
    resetGridState(parseInt(rowsInput.value), parseInt(colsInput.value));
  }
});

document.addEventListener("click", (e) => {
  if (!menuPopup.contains(e.target) && !e.target.classList.contains('add-btn')) {
    menuPopup.style.display = "none";
    menuPopup.classList.remove('insert-mode-menu');
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === 'Escape' && activeInsertMode) {
    clearInsertMode();
  }
});

function initializeSidebarComponents() {
  const components = document.querySelectorAll("#sidebar .component");
  components.forEach(component => {
    component.addEventListener("click", (e) => {
      const type = component.dataset.type;
      if (type === 'maxim-ar' || type === 'veneziana') {
        showInsertModeMenu(e, type);
      } else {
        setInsertMode(type, 'cell');
      }
    });
  });
}

// --- INICIALIZAÇÃO ---
resetGridState(numRows, numCols);
initializeSidebarComponents();
