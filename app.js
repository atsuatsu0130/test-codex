const storageKey = "customer-manager.customers";

const defaultCustomers = [
  {
    id: crypto.randomUUID(),
    name: "青空商事株式会社",
    contact: "佐藤 花子",
    email: "hanako@example.com",
    phone: "03-1111-2222",
    status: "商談中",
    followUp: new Date().toISOString().slice(0, 10),
    notes: "来週、導入スケジュールを確認する。",
  },
];

const elements = {
  form: document.querySelector("#customerForm"),
  customerId: document.querySelector("#customerId"),
  name: document.querySelector("#name"),
  contact: document.querySelector("#contact"),
  email: document.querySelector("#email"),
  phone: document.querySelector("#phone"),
  status: document.querySelector("#status"),
  followUp: document.querySelector("#followUp"),
  notes: document.querySelector("#notes"),
  table: document.querySelector("#customerTable"),
  search: document.querySelector("#searchInput"),
  resultCount: document.querySelector("#resultCount"),
  totalCustomers: document.querySelector("#totalCustomers"),
  emptyState: document.querySelector("#emptyState"),
  resetButton: document.querySelector("#resetButton"),
};

let customers = loadCustomers();

function loadCustomers() {
  const saved = localStorage.getItem(storageKey);
  return saved ? JSON.parse(saved) : defaultCustomers;
}

function saveCustomers() {
  localStorage.setItem(storageKey, JSON.stringify(customers));
}

function normalize(value) {
  return value.trim().toLowerCase();
}

function getFilteredCustomers() {
  const keyword = normalize(elements.search.value);
  if (!keyword) return customers;

  return customers.filter((customer) =>
    [customer.name, customer.contact, customer.email, customer.phone, customer.status]
      .join(" ")
      .toLowerCase()
      .includes(keyword),
  );
}

function formatDate(value) {
  if (!value) return "未設定";
  return new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium" }).format(new Date(value));
}

function renderCustomers() {
  const filteredCustomers = getFilteredCustomers();
  elements.table.innerHTML = filteredCustomers.map((customer) => `
    <tr>
      <td>
        <div class="customer-name">${escapeHtml(customer.name)}</div>
        <p class="customer-note">${escapeHtml(customer.notes || "メモなし")}</p>
      </td>
      <td>
        ${escapeHtml(customer.contact)}<br />
        <a href="mailto:${escapeHtml(customer.email)}">${escapeHtml(customer.email)}</a><br />
        ${escapeHtml(customer.phone || "電話番号なし")}
      </td>
      <td><span class="badge" data-status="${escapeHtml(customer.status)}">${escapeHtml(customer.status)}</span></td>
      <td>${formatDate(customer.followUp)}</td>
      <td>
        <div class="row-actions">
          <button class="edit" type="button" data-action="edit" data-id="${customer.id}">編集</button>
          <button class="danger" type="button" data-action="delete" data-id="${customer.id}">削除</button>
        </div>
      </td>
    </tr>
  `).join("");

  elements.totalCustomers.textContent = customers.length;
  elements.resultCount.textContent = `${filteredCustomers.length}件を表示中`;
  elements.emptyState.classList.toggle("visible", filteredCustomers.length === 0);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#039;",
    '"': "&quot;",
  })[character]);
}

function resetForm() {
  elements.form.reset();
  elements.customerId.value = "";
  elements.name.focus();
}

function upsertCustomer(event) {
  event.preventDefault();
  const customer = {
    id: elements.customerId.value || crypto.randomUUID(),
    name: elements.name.value.trim(),
    contact: elements.contact.value.trim(),
    email: elements.email.value.trim(),
    phone: elements.phone.value.trim(),
    status: elements.status.value,
    followUp: elements.followUp.value,
    notes: elements.notes.value.trim(),
  };

  const existingIndex = customers.findIndex((item) => item.id === customer.id);
  if (existingIndex >= 0) {
    customers[existingIndex] = customer;
  } else {
    customers = [customer, ...customers];
  }

  saveCustomers();
  resetForm();
  renderCustomers();
}

function handleTableClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const customer = customers.find((item) => item.id === button.dataset.id);
  if (!customer) return;

  if (button.dataset.action === "delete") {
    customers = customers.filter((item) => item.id !== customer.id);
    saveCustomers();
    renderCustomers();
    return;
  }

  elements.customerId.value = customer.id;
  elements.name.value = customer.name;
  elements.contact.value = customer.contact;
  elements.email.value = customer.email;
  elements.phone.value = customer.phone;
  elements.status.value = customer.status;
  elements.followUp.value = customer.followUp;
  elements.notes.value = customer.notes;
  elements.name.focus();
}

elements.form.addEventListener("submit", upsertCustomer);
elements.resetButton.addEventListener("click", resetForm);
elements.search.addEventListener("input", renderCustomers);
elements.table.addEventListener("click", handleTableClick);

renderCustomers();
