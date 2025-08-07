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

let numRows = 3;
let numCols = 5;
let columnWidths = [];
let rowHeights = [];
let gridState = []; // A "fonte da verdade" para nosso grid

function getX(col) {
  return columnWidths.slice(0, col).reduce((a, b) => a + b, 0);
}

function getY(row) {
  return rowHeights.slice(0, row).reduce((a, b) => a + b, 0);
}

function resetGridState(newRows, newCols) {
  numRows = newRows;
  numCols = newCols;
  colsInput.value = newCols;
  rowsInput.value = newRows;
  gridState = Array(numRows).fill(null).map(() => Array(numCols).fill(null));
  columnWidths = Array(numCols).fill(100);
  rowHeights = Array(numRows).fill(100);
  updateGrid();
}

function updateGrid() {
  const newRows = parseInt(rowsInput.value);
  const newCols = parseInt(colsInput.value);
  while (gridState.length < newRows) {
    gridState.push(Array(numCols).fill(null));
    rowHeights.push(100);
  }
  gridState.length = newRows;
  gridState.forEach(row => {
    while (row.length < newCols) {
      row.push(null);
    }
    row.length = newCols;
  });
  
  while (columnWidths.length < newCols) {
    columnWidths.push(100);
  }

  numRows = newRows;
  numCols = newCols;
  columnWidths.length = newCols;
  rowHeights.length = newRows;

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
      if (gridState[r][c]) {
        insertComponent(r, c, gridState[r][c].type, false);
      } else {
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

// --- LABELS / TAMANHOS ---
function generateLabels() {
  columnWidths.forEach((width, index) => {
    const label = document.createElement("div");
    label.innerText = String.fromCharCode(65 + index);
    label.style.width = `${width}px`;
    label.addEventListener("click", async () => {
      const result = await showCustomModal({
        title: 'Alterar Largura da Coluna',
        text: `Digite a nova largura para a coluna ${String.fromCharCode(65 + index)} (15-300px):`,
        inputType: 'number',
        initialValue: width,
        confirmText: 'Alterar',
        cancelText: 'Cancelar'
      });

      if (result !== false && result !== null && result !== '') {
        const newSize = parseInt(result);
        if (!isNaN(newSize) && newSize >= 15 && newSize <= 300) {
          columnWidths[index] = newSize;
          updateGrid();
        } else {
          showCustomModal({ title: 'Erro', text: 'Por favor, insira um valor válido entre 15 e 300.', confirmText: 'OK' });
        }
      }
    });
    labelsTop.appendChild(label);
  });

  rowHeights.forEach((height, index) => {
    const label = document.createElement("div");
    label.innerText = index + 1;
    label.style.height = `${height}px`;
    label.addEventListener("click", async () => {
      const result = await showCustomModal({
        title: 'Alterar Altura da Linha',
        text: `Digite a nova altura para a linha ${index + 1} (15-300px):`,
        inputType: 'number',
        initialValue: height,
        confirmText: 'Alterar',
        cancelText: 'Cancelar'
      });

      if (result !== false && result !== null && result !== '') {
        const newSize = parseInt(result);
        if (!isNaN(newSize) && newSize >= 15 && newSize <= 300) {
          rowHeights[index] = newSize;
          updateGrid();
        } else {
          showCustomModal({ title: 'Erro', text: 'Por favor, insira um valor válido entre 15 e 300.', confirmText: 'OK' });
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

function createAddButton(r, c) {
  const addBtn = document.createElement("div");
  addBtn.className = "add-btn";
  addBtn.style.left = `${getX(c)}px`;
  addBtn.style.top = `${getY(r)}px`;
  addBtn.style.width = `${columnWidths[c]}px`;
  addBtn.style.height = `${rowHeights[r]}px`;
  addBtn.innerText = "+";
  
  addBtn.addEventListener("click", (e) => showComponentMenu(e, r, c));
  addBtn.addEventListener("dragover", (e) => e.preventDefault());
  addBtn.addEventListener("dragenter", (e) => { e.preventDefault(); addBtn.classList.add("drag-over"); });
  addBtn.addEventListener("dragleave", () => addBtn.classList.remove("drag-over"));
  addBtn.addEventListener("drop", (e) => {
    e.preventDefault();
    addBtn.classList.remove("drag-over");
    const type = e.dataTransfer.getData("text/plain");
    if (type) {
      gridState[r][c] = { type: type };
      updateGrid();
    }
  });
  overlay.appendChild(addBtn);
}

function insertComponent(r, c, type, shouldUpdateState = true) {
  if (shouldUpdateState) {
    gridState[r][c] = { type: type };
    updateGrid();
    return;
  }
  const left = getX(c);
  const top = getY(r);
  const width = columnWidths[c];
  const height = rowHeights[r];
  const comp = document.createElement("div");
  comp.className = "component-placed";
  comp.style.left = `${left}px`;
  comp.style.top = `${top}px`;
  comp.style.width = `${width}px`;
  comp.style.height = `${height}px`;

  if (type === "maxim-ar") {
    comp.innerHTML = `<svg viewBox="-2 -2 ${width + 2} ${height + 2}"><path d="M0 0 L${width / 2} ${height} L${width} 0" stroke="black" stroke-width="2" fill="none"/></svg>`;
  } else if (type === "veneziana") {
  const lines = [];
  const lineThickness = 1;
  const lineGap = 8;
  const gridLineThickness = 2;

  const drawableHeight = height - gridLineThickness;
  const numLines = Math.floor((drawableHeight + lineGap) / (lineThickness + lineGap));
  const patternHeight = (numLines * lineThickness) + ((numLines - 1) * lineGap);
  const visualAreaHeight = height - gridLineThickness;
  const visualMargin = (visualAreaHeight - patternHeight) / 2;
  
  let currentY = gridLineThickness + visualMargin;

  for (let i = 0; i < numLines; i++) {
    lines.push(`<line x1="0" y1="${currentY}" x2="${width}" y2="${currentY}" stroke="black" stroke-width="1" />`);
    currentY += lineThickness + lineGap;
  }
  
  comp.innerHTML = `<svg viewBox="0 0 ${width} ${height}"><g>${lines.join("")}</g></svg>`;
}

  const trash = document.createElement("button");
  trash.className = "trash-btn";
  trash.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;
  trash.addEventListener("click", (e) => {
    e.stopPropagation();
    gridState[r][c] = null;
    updateGrid();
  });
  comp.addEventListener("dragover", (e) => e.preventDefault());
  comp.addEventListener("dragenter", (e) => { e.preventDefault(); comp.classList.add("hovering"); });
  comp.addEventListener("dragleave", () => comp.classList.remove("hovering"));
  comp.addEventListener("drop", (e) => {
    e.preventDefault();
    comp.classList.remove("hovering");
    const newType = e.dataTransfer.getData("text/plain");
    if (newType) {
      gridState[r][c] = { type: newType };
      updateGrid();
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
}

function showComponentMenu(e, r, c) {
  e.stopPropagation();
  const svgMaximAr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 102 102"><path d="M1 1 L51 101 L101 1" stroke="black" stroke-width="2" fill="none"/></svg>`;
  const svgVeneziana = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g stroke="black" stroke-width="1"><line y1="5" x2="100" y2="5" x1="0"></line><line y1="15" x2="100" y2="15" x1="0"></line><line y1="25" x2="100" y2="25" x1="0"></line><line y1="35" x2="100" y2="35" x1="0"></line><line y1="45" x2="100" y2="45" x1="0"></line><line y1="55" x2="100" y2="55" x1="0"></line><line y1="65" x2="100" y2="65" x1="0"></line><line y1="75" x2="100" y2="75" x1="0"></line><line y1="85" x2="100" y2="85" x1="0"></line><line y1="95" x2="100" y2="95" x1="0"></line></g></svg>`;
  menuPopup.innerHTML = `
    <div class="option" data-select="maxim-ar" style="background-image:url('data:image/svg+xml;utf8,${encodeURIComponent(svgMaximAr)}');"></div>
    <div class="option" data-select="veneziana" style="background-image:url('data:image/svg+xml;utf8,${encodeURIComponent(svgVeneziana)}');"></div>
  `;
  menuPopup.style.display = "flex";
  menuPopup.style.left = `${e.clientX}px`;
  menuPopup.style.top = `${e.clientY}px`;
  menuPopup.querySelectorAll(".option").forEach((opt) => {
    opt.onclick = () => {
      gridState[r][c] = { type: opt.dataset.select };
      updateGrid();
      menuPopup.style.display = "none";
    };
  });
}

// --- LÓGICA DO MODAL E EXPORTAÇÃO ---
generateBtn.addEventListener("click", () => {
  const gridElement = document.getElementById("grid-container");
  html2canvas(gridElement).then(baseCanvas => {
    const finalCanvas = document.createElement('canvas');
    const ctx = finalCanvas.getContext('2d');
    const marcoRespiro = 1;
    const marcoEspessura = 3;
    const espacoExtra = marcoRespiro + marcoEspessura;
    const paddingTop = 50 + espacoExtra;
    const paddingLeft = 50 + espacoExtra;
    const paddingBottom = 70 + espacoExtra;
    const paddingRight = 70 + espacoExtra;
    const cotaOffset = 20;
    const cotaBracketSize = 20;
    finalCanvas.width = paddingLeft + baseCanvas.width + paddingRight;
    finalCanvas.height = paddingTop + baseCanvas.height + paddingBottom;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(paddingLeft - espacoExtra, paddingTop - espacoExtra, baseCanvas.width + (espacoExtra * 2), baseCanvas.height + (espacoExtra * 2));
    ctx.fillStyle = 'white';
    ctx.fillRect(paddingLeft - marcoRespiro, paddingTop - marcoRespiro, baseCanvas.width + (marcoRespiro * 2), baseCanvas.height + (marcoRespiro * 2));
    ctx.drawImage(baseCanvas, paddingLeft, paddingTop);
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'black';
    ctx.lineWidth = 2;
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const h_x = paddingLeft + baseCanvas.width + cotaOffset;
    const h_y_start = paddingTop - espacoExtra;
    const h_y_end = paddingTop + baseCanvas.height + espacoExtra;
    ctx.beginPath();
    ctx.moveTo(h_x, h_y_start);
    ctx.lineTo(h_x, h_y_end);
    ctx.moveTo(h_x - cotaBracketSize / 2, h_y_start);
    ctx.lineTo(h_x + cotaBracketSize / 2, h_y_start);
    ctx.moveTo(h_x - cotaBracketSize / 2, h_y_end);
    ctx.lineTo(h_x + cotaBracketSize / 2, h_y_end);
    ctx.stroke();
    ctx.fillText('H', h_x + 15, paddingTop + baseCanvas.height / 2);
    const l_y = paddingTop + baseCanvas.height + cotaOffset;
    const l_x_start = paddingLeft - espacoExtra;
    const l_x_end = paddingLeft + baseCanvas.width + espacoExtra;
    ctx.beginPath();
    ctx.moveTo(l_x_start, l_y);
    ctx.lineTo(l_x_end, l_y);
    ctx.moveTo(l_x_start, l_y - cotaBracketSize / 2);
    ctx.lineTo(l_x_start, l_y + cotaBracketSize / 2);
    ctx.moveTo(l_x_end, l_y - cotaBracketSize / 2);
    ctx.lineTo(l_x_end, l_y + cotaBracketSize / 2);
    ctx.stroke();
    ctx.fillText('L', paddingLeft + baseCanvas.width / 2, l_y + 20);
    const finalImage = new Image();
    finalImage.src = finalCanvas.toDataURL('image/png');
    modalImageContainer.innerHTML = '';
    modalImageContainer.appendChild(finalImage);
    const filenameInput = document.getElementById('filename-input');
    const defaultFilename = `ELEVFAC-${numCols}X${numRows}.png`;
    filenameInput.value = defaultFilename;
    modalOverlay.style.display = 'flex';
  });
});
modalCancelBtn.addEventListener('click', () => {
  modalOverlay.style.display = 'none';
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
});

// --- EVENTOS GERAIS ---
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
  }});

document.addEventListener("click", (e) => {
  if (!menuPopup.contains(e.target) && !e.target.classList.contains('add-btn')) {
    menuPopup.style.display = "none";
  }
});

function initializeDraggableComponents() {
  const components = document.querySelectorAll("#sidebar .component");
  components.forEach(component => {
    component.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", component.dataset.type);
      e.dataTransfer.effectAllowed = "copy";
    });
  });
}

resetGridState(numRows, numCols);
initializeDraggableComponents();