const orders = [
  {
    id: "OD-1001",
    server: "台港澳服",
    type: "積分衝分",
    boss: "阿哲",
    amount: 3200,
    note: "晚上 20:00 後可開打，需語音。",
    status: "open",
    assignee: null,
    completedProof: false,
    reviewed: false,
  },
  {
    id: "OD-1002",
    server: "國際服",
    type: "陪打日常",
    boss: "Mina",
    amount: 1200,
    note: "僅文字溝通，請耐心教學。",
    status: "open",
    assignee: null,
    completedProof: false,
    reviewed: false,
  },
  {
    id: "OD-1003",
    server: "台港澳服",
    type: "代練任務",
    boss: "Leo",
    amount: 2100,
    note: "需於今晚前完成，注意截圖。",
    status: "open",
    assignee: null,
    completedProof: false,
    reviewed: false,
  },
];

const currentEmployee = "員工A";
let selectedOrderId = null;

const boardEl = document.querySelector("#order-board");
const detailEl = document.querySelector("#order-detail");
const revenueEl = document.querySelector("#daily-revenue");
const countEl = document.querySelector("#daily-count");
const salaryEl = document.querySelector("#employee-salary");

function formatCurrency(num) {
  return `NT$ ${num.toLocaleString("zh-TW")}`;
}

function renderBoard() {
  boardEl.innerHTML = "";

  orders.forEach((order) => {
    const card = document.createElement("button");
    card.className = `order-card ${selectedOrderId === order.id ? "active" : ""}`;
    card.innerHTML = `
      <strong>${order.server}</strong>
      <div>${order.type}</div>
      <small>單號 ${order.id}</small>
      <div class="badge ${badgeClass(order)}">${statusText(order)}</div>
    `;

    card.addEventListener("click", () => {
      selectedOrderId = order.id;
      renderBoard();
      renderDetail();
    });

    boardEl.appendChild(card);
  });
}

function badgeClass(order) {
  if (order.reviewed) return "done";
  if (order.status === "in_progress") return "progress";
  return "open";
}

function statusText(order) {
  if (order.reviewed) return "審核完成";
  if (order.completedProof) return "待管理員審核";
  if (order.status === "in_progress") return `進行中（${order.assignee}）`;
  return "可承接";
}

function renderDetail() {
  const order = orders.find((o) => o.id === selectedOrderId);

  if (!order) {
    detailEl.className = "order-detail empty";
    detailEl.textContent = "請先選擇左側訂單卡片";
    return;
  }

  detailEl.className = "order-detail";
  detailEl.innerHTML = `
    <div class="detail-grid">
      <div class="field"><span>1. 伺服器</span><strong>${order.server}</strong></div>
      <div class="field"><span>2. 單種名稱</span><strong>${order.type}</strong></div>
      <div class="field"><span>3. 老闆名稱</span><strong>${order.boss}</strong></div>
      <div class="field"><span>4. 訂單金額</span><strong>${formatCurrency(order.amount)}</strong></div>
      <div class="field"><span>5. 備註</span><strong>${order.note}</strong></div>
      <div class="field"><span>狀態</span><strong>${statusText(order)}</strong></div>
    </div>
    <div class="actions">
      <button id="take-btn" class="primary" ${order.status !== "open" ? "disabled" : ""}>員工承接</button>
      <button id="upload-btn" ${order.status !== "in_progress" || order.assignee !== currentEmployee || order.completedProof ? "disabled" : ""}>上傳完工圖片（模擬）</button>
      <button id="review-btn" ${!order.completedProof || order.reviewed ? "disabled" : ""}>管理員審核完成</button>
    </div>
  `;

  detailEl.querySelector("#take-btn").addEventListener("click", () => takeOrder(order.id));
  detailEl.querySelector("#upload-btn").addEventListener("click", () => uploadProof(order.id));
  detailEl.querySelector("#review-btn").addEventListener("click", () => approveOrder(order.id));
}

function takeOrder(id) {
  const order = orders.find((o) => o.id === id);
  if (!order || order.status !== "open") return;
  order.status = "in_progress";
  order.assignee = currentEmployee;
  renderBoard();
  renderDetail();
}

function uploadProof(id) {
  const order = orders.find((o) => o.id === id);
  if (!order || order.status !== "in_progress") return;
  order.completedProof = true;
  renderBoard();
  renderDetail();
}

function approveOrder(id) {
  const order = orders.find((o) => o.id === id);
  if (!order || !order.completedProof || order.reviewed) return;
  order.reviewed = true;
  updateMetrics();
  renderBoard();
  renderDetail();
}

function updateMetrics() {
  const reviewedOrders = orders.filter((o) => o.reviewed);
  const revenue = reviewedOrders.reduce((sum, order) => sum + order.amount, 0);

  // 示意：員工薪資採 65% 分潤，可再依階級調整
  const salary = reviewedOrders
    .filter((o) => o.assignee === currentEmployee)
    .reduce((sum, order) => sum + Math.round(order.amount * 0.65), 0);

  revenueEl.textContent = formatCurrency(revenue);
  countEl.textContent = String(reviewedOrders.length);
  salaryEl.textContent = formatCurrency(salary);
}

renderBoard();
renderDetail();
updateMetrics();
