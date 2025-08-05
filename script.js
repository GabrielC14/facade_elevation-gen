const grid = document.getElementById("grid");
const overlay = document.getElementById("overlay");
const gridForm = document.getElementById("grid-form");
const menuPopup = document.getElementById("menu-popup");
const labelsTop = document.getElementById("labels-top");
const labelsLeft = document.getElementById("labels-left");
const canvasWrapper = document.getElementById("canvas-wrapper");
const gridContainer = document.getElementById("grid-container");
const canvasContainer = document.getElementById("canvas-container");
const croquiWrapper = document.getElementById("croqui-wrapper");

// --- NOVAS CONSTANTES PARA O MODAL ---
const generateBtn = document.getElementById("generate-btn");
const modalOverlay = document.getElementById("modal-overlay");
const modalImageContainer = document.getElementById("modal-image-container");
const modalCancelBtn = document.getElementById("modal-cancel-btn");
const modalDownloadBtn = document.getElementById("modal-download-btn");


let numRows = 3;
let numCols = 5;
let columnWidths = [];
let rowHeights = [];

gridForm.addEventListener("submit", (e) => {
  e.preventDefault();
  numCols = parseInt(document.getElementById("cols").value);
  numRows = parseInt(document.getElementById("rows").value);
  resetSizes();
  generateGrid();
});

function resetSizes() {
  columnWidths = Array(numCols).fill(100);
  rowHeights = Array(numRows).fill(100);
}

function getX(col) {
  return columnWidths.slice(0, col).reduce((a, b) => a + b, 0);
}

function getY(row) {
  return rowHeights.slice(0, row).reduce((a, b) => a + b, 0);
}

function generateGrid() {
  grid.innerHTML = "";
  overlay.innerHTML = "";
  labelsTop.innerHTML = "";
  labelsLeft.innerHTML = "";

  const lineWidth = 2; // Espessura da linha definida no CSS
  const totalWidth = columnWidths.reduce((a, b) => a + b, 0);
  const totalHeight = rowHeights.reduce((a, b) => a + b, 0);

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
  generateAddButtons();

  updateCroquiPosition();
}

function updateCroquiPosition() {
  croquiWrapper.style.width = 'auto';
  croquiWrapper.style.height = 'auto';

  const croquiWidth = croquiWrapper.offsetWidth;
  const croquiHeight = croquiWrapper.offsetHeight;

  const containerWidth = canvasContainer.clientWidth - 40; // -40 para o padding
  const containerHeight = canvasContainer.clientHeight - 40; // -40 para o padding

  if (croquiWidth > containerWidth || croquiHeight > containerHeight) {
    croquiWrapper.style.left = '0px';
    croquiWrapper.style.top = '0px';
    croquiWrapper.style.transform = 'none';
  } else {
    croquiWrapper.style.left = '50%';
    croquiWrapper.style.top = '50%';
    croquiWrapper.style.transform = 'translate(-50%, -50%)';
  }
}


function generateLabels() {
  columnWidths.forEach((width, index) => {
    const label = document.createElement("div");
    label.innerText = String.fromCharCode(65 + index);
    label.style.width = `${width}px`;
    label.addEventListener("click", () => {
      const newSize = parseInt(prompt("Nova largura (15-300px):", width));
      if (newSize >= 15 && newSize <= 300) {
        columnWidths[index] = newSize;
        generateGrid();
      }
    });
    labelsTop.appendChild(label);
  });

  rowHeights.forEach((height, index) => {
    const label = document.createElement("div");
    label.innerText = index + 1;
    label.style.height = `${height}px`;
    label.addEventListener("click", () => {
      const newSize = parseInt(prompt("Nova altura (15-300px):", height));
      if (newSize >= 15 && newSize <= 300) {
        rowHeights[index] = newSize;
        generateGrid();
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

function generateAddButtons() {
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      const left = getX(c);
      const top = getY(r);
      const width = columnWidths[c];
      const height = rowHeights[r];

      const addBtn = document.createElement("div");
      addBtn.className = "add-btn";
      addBtn.style.left = `${left}px`;
      addBtn.style.top = `${top}px`;
      addBtn.style.width = `${width}px`;
      addBtn.style.height = `${height}px`;
      addBtn.innerText = "+";

      addBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const svgMaximAr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 102 102"><path d="M2 2 L50 100 L100 2" stroke="black" stroke-width="2" fill="none"/></svg>`;
        const svgVeneziana = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 102 102"><g stroke="black" stroke-width="1"><line y1="12" y2="12" x1="2" x2="100"/><line y1="20" y2="20" x1="2" x2="100"/><line y1="28" y2="28" x1="2" x2="100"/><line y1="36" y2="36" x1="2" x2="100"/><line y1="44" y2="44" x1="2" x2="100"/><line y1="52" y2="52" x1="2" x2="100"/><line y1="60" y2="60" x1="2" x2="100"/><line y1="68" y2="68" x1="2" x2="100"/><line y1="76" y2="76" x1="2" x2="100"/><line y1="84" y2="84" x1="2" x2="100"/></g></svg>`;

        menuPopup.innerHTML = `
          <div class="option" data-select="maxim-ar" style="background-image:url('data:image/svg+xml;utf8,${encodeURIComponent(svgMaximAr)}');"></div>
          <div class="option" data-select="veneziana" style="background-image:url('data:image/svg+xml;utf8,${encodeURIComponent(svgVeneziana)}');"></div>
        `;
        menuPopup.style.display = "flex";
        menuPopup.style.left = `${e.clientX}px`;
        menuPopup.style.top = `${e.clientY}px`;
        menuPopup.querySelectorAll(".option").forEach((opt) => {
          opt.onclick = () => {
            insertComponent(r, c, opt.dataset.select);
            menuPopup.style.display = "none";
          };
        });
      });
      overlay.appendChild(addBtn);
    }
  }
}

function insertComponent(row, col, type) {
  const left = getX(col);
  const top = getY(row);
  const width = columnWidths[col];
  const height = rowHeights[row];

  const btnToRemove = [...overlay.querySelectorAll(".add-btn")].find(
    (b) => parseInt(b.style.left) === left && parseInt(b.style.top) === top
  );
  if (btnToRemove) btnToRemove.remove();

  const comp = document.createElement("div");
  comp.className = "component-placed";
  comp.style.left = `${left}px`;
  comp.style.top = `${top}px`;
  comp.style.width = `${width}px`;
  comp.style.height = `${height}px`;

  if (type === "maxim-ar") {
    comp.innerHTML = `<svg viewBox="0 0 ${width} ${height}"><path d="M2 2 L${width / 2} ${height - 2} L${width - 2} 2" stroke="black" stroke-width="2" fill="none"/></svg>`;
  } else if (type === "veneziana") {
    const lines = [];
    const numLines = Math.floor(height / 10) - 1;
    for (let i = 1; i <= numLines; i++) {
      const yPos = (height / (numLines + 1)) * i;
      lines.push(`<line x1="0" y1="${yPos}" x2="${width}" y2="${yPos}" stroke="black" stroke-width="1"/>`);
    }
    comp.innerHTML = `<svg viewBox="0 0 ${width} ${height}"><g>${lines.join("")}</g></svg>`;
  }

  const trash = document.createElement("button");
  trash.className = "trash-btn";
  trash.innerHTML = `<svg viewBox="0 0 24 24"><path d="M3 6h18M9 6v12M15 6v12M4 6l1 14h14l1-14" /></svg>`;

  let hoverTimeout;
  comp.addEventListener("mouseenter", () => {
    hoverTimeout = setTimeout(() => comp.classList.add("hovering"), 200);
  });
  comp.addEventListener("mouseleave", () => {
    clearTimeout(hoverTimeout);
    comp.classList.remove("hovering");
  });
  trash.addEventListener("click", () => {
    comp.remove();
    generateGrid();
  });
  comp.appendChild(trash);
  overlay.appendChild(comp);
}

// --- NOVA LÓGICA DE GERAÇÃO E EXPORTAÇÃO ---
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
    const cotaBracketSize = 10;

    finalCanvas.width = paddingLeft + baseCanvas.width + paddingRight;
    finalCanvas.height = paddingTop + baseCanvas.height + paddingBottom;

    // 1. Pinta o fundo de branco
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

    // 2. DESENHA A BORDA (MARCO) de forma precisa
    // Primeiro, desenhamos um retângulo preto maior que será a nossa borda.
    ctx.fillStyle = 'black';
    ctx.fillRect(
      paddingLeft - espacoExtra,
      paddingTop - espacoExtra,
      baseCanvas.width + (espacoExtra * 2),
      baseCanvas.height + (espacoExtra * 2)
    );
    // Depois, desenhamos um retângulo branco por cima para criar o "respiro" (espaço em branco).
    ctx.fillStyle = 'white';
    ctx.fillRect(
      paddingLeft - marcoRespiro,
      paddingTop - marcoRespiro,
      baseCanvas.width + (marcoRespiro * 2),
      baseCanvas.height + (marcoRespiro * 2)
    );

    // 3. Desenha o croqui por cima de tudo
    ctx.drawImage(baseCanvas, paddingLeft, paddingTop);


    // 4. DESENHA AS COTAS (H e L)
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'black';
    ctx.lineWidth = 2;
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Cota de Altura (H)
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
    ctx.fillText('H', h_x + 15, paddingTop + baseCanvas.height / 2); // <-- CORRIGIDO: O texto agora vai aparecer

    // Cota de Largura (L)
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
    ctx.fillText('L', paddingLeft + baseCanvas.width / 2, l_y + 20); // <-- CORRIGIDO: O texto agora vai aparecer

    // Exibe a imagem final no modal
    const finalImage = new Image();
    finalImage.src = finalCanvas.toDataURL('image/png');
    modalImageContainer.innerHTML = '';
    modalImageContainer.appendChild(finalImage);

    modalOverlay.style.display = 'flex';
  });
});

modalCancelBtn.addEventListener('click', () => {
  modalOverlay.style.display = 'none';
});

modalDownloadBtn.addEventListener('click', () => {
  const finalImage = modalImageContainer.querySelector('img');
  if (finalImage) {
    const link = document.createElement('a');
    link.href = finalImage.src;
    link.download = 'croqui-final.png';
    link.click();
  }
  modalOverlay.style.display = 'none';
});


// Evento para fechar o menu popup ao clicar fora dele
document.addEventListener("click", (e) => {
  if (!menuPopup.contains(e.target) && !e.target.classList.contains('add-btn')) {
    menuPopup.style.display = "none";
  }
});


// Inicial
resetSizes();
generateGrid();