/**
 * Module Xử lý Bán hàng POS và Quản lý Hóa đơn phía Client (Nguyễn Quang Tuấn)
 * Cập nhật Tuần 3: Hỗ trợ cấn trừ tiền cọc từ đơn Đặt hàng trước (Pre-order) & Xử lý xung đột
 */

let cart = {
  imeis: [], // [{ imei, tenMay, giaBan, mauSac, dungLuong }]
  phuKiens: [] // [{ _id, tenPK, giaBan, soLuong, soLuongTon }]
};

let selectedPreOrder = null; // Đơn đặt hàng trước được chọn để cấn trừ cọc

let allAvailableImeis = [];
let allPhuKiens = [];
let allSanPhams = [];
let allKhachHangs = [];

let preOrderModalInstance = null;

/**
 * Hiệu ứng âm thanh POS khi quét mã vạch Barcode IMEI
 */
function playBeep(type = 'success') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (type === 'success') {
      osc.frequency.setValueAtTime(880, ctx.currentTime); // Âm cao A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else {
      osc.frequency.setValueAtTime(220, ctx.currentTime); // Âm cảnh báo
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch (e) {
    // AudioContext blocked before user interaction
  }
}

let barcodeBuffer = '';
let lastKeyTime = 0;

document.addEventListener('DOMContentLoaded', async () => {
  // Đăng ký phím tắt & quét barcode ngay lập tức
  initKeyboardShortcuts();

  try {
    await initPosPage();
    await initInvoiceListPage();
    await initReportsTab();
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu trang bán hàng POS:', err);
  }

  // Tự động focus ô tìm / quét IMEI khi vào trang
  const searchInput = document.getElementById('searchImeiInput');
  if (searchInput) searchInput.focus();
});

function switchToPosTab() {
  const posTabBtn = document.getElementById('tab-pos-tab');
  if (posTabBtn && !posTabBtn.classList.contains('active')) {
    const tabInstance = bootstrap.Tab.getOrCreateInstance(posTabBtn);
    if (tabInstance) tabInstance.show();
  }
}

function handleScanOrEnterImei(rawText) {
  if (!rawText) return;
  const keyword = rawText.trim();
  const searchInput = document.getElementById('searchImeiInput');

  // 1. Tìm chính xác IMEI
  let found = allAvailableImeis.find(m => m.imei.toLowerCase() === keyword.toLowerCase());

  // 2. Nếu không khớp chính xác, thử tìm máy duy nhất khớp một phần
  if (!found) {
    const inCartImeis = new Set(cart.imeis.map(m => m.imei));
    const candidates = allAvailableImeis.filter(m => {
      if (inCartImeis.has(m.imei)) return false;
      return m.imei.toLowerCase().includes(keyword.toLowerCase()) ||
             (m.sanPham && m.sanPham.tenMay.toLowerCase().includes(keyword.toLowerCase()));
    });
    if (candidates.length === 1) {
      found = candidates[0];
    }
  }

  if (found) {
    const alreadyInCart = cart.imeis.some(m => m.imei === found.imei);
    if (alreadyInCart) {
      playBeep('error');
      showToast(`Máy IMEI "${found.imei}" đã có trong giỏ hàng!`, 'warning');
    } else {
      addImeiToCart(found.imei);
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      filterImeiDisplay();
    }
  } else {
    playBeep('error');
    showToast(`Không tìm thấy máy IMEI "${keyword}" còn hàng trong kho!`, 'danger');
  }
}

function initGlobalBarcodeListener() {
  document.addEventListener('keydown', (e) => {
    // Bỏ qua các phím chức năng hoặc tổ hợp phím
    if (e.key.startsWith('F') || e.key === 'Escape' || e.key === 'Tab' || e.ctrlKey || e.altKey) {
      return;
    }

    const now = Date.now();
    const timeDelta = now - lastKeyTime;
    lastKeyTime = now;

    if (e.key === 'Enter') {
      // Nếu máy quét mã vạch đẩy chuỗi ký tự nhanh (< 80ms) và kết thúc bằng Enter
      if (barcodeBuffer.length >= 4 && timeDelta < 80) {
        e.preventDefault();
        switchToPosTab();
        handleScanOrEnterImei(barcodeBuffer);
        barcodeBuffer = '';
        return;
      }
      barcodeBuffer = '';
    } else if (e.key.length === 1) {
      if (timeDelta > 80) {
        barcodeBuffer = '';
      }
      barcodeBuffer += e.key;
    }
  });
}

function shortcutAction(key) {
  if (key === 'F1' || key === '1') {
    switchToPosTab();
    const searchInput = document.getElementById('searchImeiInput');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  } else if (key === 'F2' || key === '2' || key === 'k' || key === 'K') {
    switchToPosTab();
    const selectKh = document.getElementById('selectKhachHang');
    if (selectKh) {
      selectKh.focus();
      selectKh.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  } else if (key === 'F3' || key === '3') {
    switchToPosTab();
    const filterSp = document.getElementById('filterPosSanPham');
    if (filterSp) {
      filterSp.focus();
      filterSp.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  } else if (key === 'F4' || key === '4' || key === 's' || key === 'S') {
    switchToPosTab();
    const btnSubmit = document.getElementById('btnSubmitOrder');
    if (btnSubmit) {
      if (btnSubmit.disabled) {
        playBeep('error');
        showToast('Giỏ hàng đang trống! Vui lòng chọn máy IMEI trước [F1 / Alt+1]', 'warning');
      } else {
        btnSubmit.click();
      }
    }
  } else if (key === 'F7' || key === '7' || key === 'd' || key === 'D') {
    switchToPosTab();
    const btnOpen = document.getElementById('btnOpenPreOrderModal');
    if (btnOpen) btnOpen.click();
  } else if (key === 'F8' || key === '8' || key === 'x' || key === 'X') {
    switchToPosTab();
    const btnClear = document.getElementById('btnClearCart');
    if (btnClear) {
      if (cart.imeis.length === 0 && cart.phuKiens.length === 0) {
        showToast('Giỏ hàng hiện đang trống', 'info');
      } else {
        btnClear.click();
        playBeep('warning');
        showToast('Đã xóa sạch giỏ hàng [F8 / Alt+8]', 'info');
      }
    }
  } else if (key === 'F9' || key === '9' || key === 'p' || key === 'P') {
    const invoiceModal = document.getElementById('invoiceDetailModal');
    if (invoiceModal && invoiceModal.classList.contains('show')) {
      printInvoiceReceipt();
    } else {
      const btnPrint = document.getElementById('btnPrintInvoice');
      if (btnPrint) btnPrint.click();
    }
  } else if (key === 'Escape') {
    const shownModals = document.querySelectorAll('.modal.show');
    if (shownModals.length > 0) {
      shownModals.forEach(m => {
        const instance = bootstrap.Modal.getInstance(m);
        if (instance) instance.hide();
      });
    } else {
      const searchInput = document.getElementById('searchImeiInput');
      if (searchInput && document.activeElement === searchInput) {
        searchInput.value = '';
        filterImeiDisplay();
      }
    }
  }
}

function initKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    // Phím chức năng F1 -> F9 (capture phase để chặn hành vi mặc định trình duyệt)
    if (['F1', 'F2', 'F3', 'F4', 'F7', 'F8', 'F9'].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      shortcutAction(e.key);
      return;
    }
    // Phím Escape
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      shortcutAction('Escape');
      return;
    }
  }, { capture: true });

  // Kích hoạt lắng nghe máy quét barcode
  initGlobalBarcodeListener();
}

async function initPosPage() {
  await loadPosData();
  initPreOrderModal();
  renderCart();

  // Discount input change
  const inputDiscount = document.getElementById('inputSoTienGiam');
  if (inputDiscount) {
    inputDiscount.addEventListener('input', () => renderCart());
  }

  // Search & Filter IMEI (hỗ trợ nhập hoặc quét Barcode + Enter)
  const searchInput = document.getElementById('searchImeiInput');
  const filterSp = document.getElementById('filterPosSanPham');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => filterImeiDisplay(), 200));
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleScanOrEnterImei(searchInput.value);
      }
    });
  }
  if (filterSp) {
    filterSp.addEventListener('change', () => filterImeiDisplay());
  }

  // Clear Cart
  const btnClear = document.getElementById('btnClearCart');
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      cart = { imeis: [], phuKiens: [] };
      clearPreOrder();
      renderCart();
      filterImeiDisplay();
    });
  }

  // Submit Order
  const btnSubmit = document.getElementById('btnSubmitOrder');
  if (btnSubmit) {
    btnSubmit.addEventListener('click', handleCreateOrder);
  }
}

async function loadPosData() {
  const [resImei, resPk, resKh, resSp] = await Promise.all([
    api.get('/may-imei', { trangThai: 'Con hang' }),
    api.get('/phu-kien'),
    api.get('/khach-hang'),
    api.get('/san-pham')
  ]);

  if (resImei.success) {
    allAvailableImeis = Array.isArray(resImei.data) ? resImei.data : (resImei.data?.imeis || resImei.data?.data || []);
    allAvailableImeis.forEach(m => {
      if (m.sanPham && m.sanPham.dungLuong) {
        m.sanPham.tenMay = m.sanPham.tenMay + ' ' + m.sanPham.dungLuong;
      }
    });
  }
  if (resPk.success) {
    allPhuKiens = Array.isArray(resPk.data) ? resPk.data : (resPk.data?.phuKiens || resPk.data?.data || []);
  }
  if (resKh.success) {
    allKhachHangs = Array.isArray(resKh.data) ? resKh.data : (resKh.data?.khachHangs || resKh.data?.data || []);
    renderKhachHangOptions();
  }
  if (resSp.success) {
    allSanPhams = Array.isArray(resSp.data) ? resSp.data : (resSp.data?.sanPhams || resSp.data?.data || []);
    allSanPhams.forEach(sp => {
      if (sp.dungLuong) {
        sp.tenMay = sp.tenMay + ' ' + sp.dungLuong;
      }
    });
    renderSanPhamOptions();
  }

  filterImeiDisplay();
  renderPhuKienList();
}

function renderSanPhamOptions() {
  const select = document.getElementById('filterPosSanPham');
  if (!select) return;
  select.innerHTML = '<option value="">-- Tất cả Model máy --</option>' +
    allSanPhams.map(sp => `<option value="${sp._id}">${escapeHtml(sp.tenMay)}</option>`).join('');
}

function renderKhachHangOptions() {
  const select = document.getElementById('selectKhachHang');
  if (!select) return;
  select.innerHTML = '<option value="">-- Khách vãng lai (Không lưu) --</option>' +
    allKhachHangs.map(kh => `<option value="${kh._id}">${escapeHtml(kh.hoTen)} - ${escapeHtml(kh.sdt || '')}</option>`).join('');
}

function filterImeiDisplay() {
  const container = document.getElementById('availableImeiList');
  if (!container) return;

  const keyword = document.getElementById('searchImeiInput')?.value.trim().toLowerCase() || '';
  const spFilter = document.getElementById('filterPosSanPham')?.value || '';

  // Loại trừ các IMEI đã cho vào giỏ
  const inCartImeis = new Set(cart.imeis.map(m => m.imei));

  const filtered = allAvailableImeis.filter(m => {
    if (inCartImeis.has(m.imei)) return false;
    const matchImei = m.imei.toLowerCase().includes(keyword);
    const matchName = m.sanPham && m.sanPham.tenMay.toLowerCase().includes(keyword);
    const matchSp = !spFilter || (m.sanPham && m.sanPham._id === spFilter);
    return (matchImei || matchName) && matchSp;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="col-12 text-center text-muted py-4 small">Không tìm thấy máy IMEI phù hợp còn hàng</div>`;
    return;
  }

  container.innerHTML = filtered.map(m => {
    const tenMay = m.sanPham ? m.sanPham.tenMay : 'Điện thoại';
    const giaBan = m.sanPham ? m.sanPham.giaBan : m.giaNhap * 1.15;
    return `
      <div class="col-md-6 col-12">
        <div class="pos-product-item" onclick="addImeiToCart('${m.imei}')">
          <div class="fw-semibold text-truncate small">${escapeHtml(tenMay)}</div>
          <div class="d-flex justify-content-between align-items-center mt-1">
            <span class="badge bg-light text-dark border font-monospace" style="font-size: 0.75rem;">${m.imei}</span>
            <span class="text-primary fw-bold small">${formatCurrency(giaBan)}</span>
          </div>
          <div class="text-muted" style="font-size: 0.7rem;">Màu: ${escapeHtml(m.mauSac || 'Tiêu chuẩn')} | ${escapeHtml(m.dungLuong || '')}</div>
        </div>
      </div>
    `;
  }).join('');
}

function renderPhuKienList() {
  const container = document.getElementById('availablePhuKienList');
  if (!container) return;

  if (allPhuKiens.length === 0) {
    container.innerHTML = `<div class="col-12 text-center text-muted py-3 small">Không có phụ kiện nào</div>`;
    return;
  }

  container.innerHTML = allPhuKiens.map(pk => {
    return `
      <div class="col-md-6 col-12">
        <div class="pos-product-item" onclick="addPhuKienToCart('${pk._id}')">
          <div class="fw-semibold text-truncate small">${escapeHtml(pk.tenPK)}</div>
          <div class="d-flex justify-content-between align-items-center mt-1">
            <span class="text-muted small" style="font-size: 0.75rem;">Tồn: <strong class="${pk.soLuongTon > 0 ? 'text-success' : 'text-danger'}">${pk.soLuongTon}</strong></span>
            <span class="text-primary fw-bold small">${formatCurrency(pk.giaBan)}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function addImeiToCart(imei) {
  const may = allAvailableImeis.find(m => m.imei === imei);
  if (!may) return;

  cart.imeis.push({
    imei: may.imei,
    tenMay: may.sanPham ? may.sanPham.tenMay : 'Điện thoại',
    giaBan: may.sanPham ? may.sanPham.giaBan : may.giaNhap * 1.15,
    mauSac: may.mauSac,
    dungLuong: may.dungLuong
  });

  playBeep('success');
  renderCart();
  filterImeiDisplay();
  showToast(`Đã thêm máy IMEI ${imei} vào giỏ`, 'success');
}

function removeImeiFromCart(imei) {
  cart.imeis = cart.imeis.filter(m => m.imei !== imei);
  renderCart();
  filterImeiDisplay();
}

function addPhuKienToCart(pkId) {
  const pk = allPhuKiens.find(p => p._id === pkId);
  if (!pk) return;

  if (pk.soLuongTon <= 0) {
    playBeep('error');
    showToast(`Phụ kiện "${pk.tenPK}" đã hết hàng trong kho!`, 'danger');
    return;
  }

  const exist = cart.phuKiens.find(p => p._id === pkId);
  if (exist) {
    if (exist.soLuong >= pk.soLuongTon) {
      playBeep('error');
      showToast(`Không thể thêm! Tồn kho chỉ còn ${pk.soLuongTon}`, 'warning');
      return;
    }
    exist.soLuong += 1;
  } else {
    cart.phuKiens.push({
      _id: pk._id,
      tenPK: pk.tenPK,
      giaBan: pk.giaBan,
      soLuong: 1,
      soLuongTon: pk.soLuongTon
    });
  }

  playBeep('success');
  renderCart();
  showToast(`Đã thêm phụ kiện "${pk.tenPK}"`, 'success');
}

function changePhuKienQty(pkId, delta) {
  const exist = cart.phuKiens.find(p => p._id === pkId);
  if (!exist) return;

  exist.soLuong += delta;
  if (exist.soLuong <= 0) {
    cart.phuKiens = cart.phuKiens.filter(p => p._id !== pkId);
  } else if (exist.soLuong > exist.soLuongTon) {
    exist.soLuong = exist.soLuongTon;
    showToast(`Số lượng tối đa còn trong kho: ${exist.soLuongTon}`, 'warning');
  }

  renderCart();
}

function renderCart() {
  const tbody = document.getElementById('cartTableBody');
  const btnSubmit = document.getElementById('btnSubmitOrder');
  if (!tbody) return;

  const hasItems = cart.imeis.length > 0 || cart.phuKiens.length > 0;
  if (btnSubmit) btnSubmit.disabled = !hasItems;

  if (!hasItems) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4 small">Chưa có sản phẩm nào được chọn</td></tr>`;
    document.getElementById('totalMachinePrice').innerText = '0 đ';
    document.getElementById('totalAccessoryPrice').innerText = '0 đ';
    document.getElementById('totalGrandPrice').innerText = '0 đ';
    
    // Ẩn dòng trừ cọc & giảm giá nếu giỏ trống
    const depRow = document.getElementById('depositDeductionRow');
    if (depRow) depRow.classList.add('d-none');
    const discRow = document.getElementById('discountDeductionRow');
    if (discRow) discRow.classList.add('d-none');
    return;
  }

  let html = '';
  let totalMay = 0;
  let totalPk = 0;

  // Render Máy IMEI
  cart.imeis.forEach(m => {
    totalMay += m.giaBan;
    html += `
      <tr>
        <td>
          <div class="fw-semibold small">${escapeHtml(m.tenMay)}</div>
          <span class="badge bg-primary-subtle text-primary font-monospace" style="font-size: 0.7rem;">IMEI: ${m.imei}</span>
        </td>
        <td class="text-center small">1</td>
        <td class="text-end fw-semibold small">${formatCurrency(m.giaBan)}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-link text-danger p-0" onclick="removeImeiFromCart('${m.imei}')" title="Xóa">
            <i class="bi bi-x-circle"></i>
          </button>
        </td>
      </tr>
    `;
  });

  // Render Phụ kiện
  cart.phuKiens.forEach(pk => {
    const subtotal = pk.giaBan * pk.soLuong;
    totalPk += subtotal;
    html += `
      <tr>
        <td>
          <div class="fw-semibold small">${escapeHtml(pk.tenPK)}</div>
          <span class="text-muted" style="font-size: 0.7rem;">Phụ kiện</span>
        </td>
        <td class="text-center">
          <div class="d-flex align-items-center justify-content-center gap-1">
            <button class="btn btn-sm btn-light p-0 px-1" onclick="changePhuKienQty('${pk._id}', -1)">-</button>
            <span class="small fw-bold">${pk.soLuong}</span>
            <button class="btn btn-sm btn-light p-0 px-1" onclick="changePhuKienQty('${pk._id}', 1)">+</button>
          </div>
        </td>
        <td class="text-end fw-semibold small">${formatCurrency(subtotal)}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-link text-danger p-0" onclick="changePhuKienQty('${pk._id}', -999)" title="Xóa">
            <i class="bi bi-x-circle"></i>
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
  document.getElementById('totalMachinePrice').innerText = formatCurrency(totalMay);
  document.getElementById('totalAccessoryPrice').innerText = formatCurrency(totalPk);

  const rawGrandTotal = totalMay + totalPk;
  const inputDiscount = document.getElementById('inputSoTienGiam');
  const discount = Math.max(0, parseInt(inputDiscount ? inputDiscount.value : 0) || 0);

  // Hiển thị giảm giá
  const discountRow = document.getElementById('discountDeductionRow');
  const discountPriceEl = document.getElementById('discountDeductionPrice');
  if (discount > 0) {
    if (discountRow) discountRow.classList.remove('d-none');
    if (discountPriceEl) discountPriceEl.innerText = `-${formatCurrency(discount)}`;
  } else {
    if (discountRow) discountRow.classList.add('d-none');
  }

  // Tính cấn trừ tiền cọc (nếu có đơn đặt trước được liên kết)
  const depositRow = document.getElementById('depositDeductionRow');
  const depositPriceEl = document.getElementById('depositDeductionPrice');
  let tienCocDaTru = 0;
  if (selectedPreOrder && selectedPreOrder.soTienCoc > 0) {
    tienCocDaTru = Math.min(selectedPreOrder.soTienCoc, rawGrandTotal);
    if (depositRow) depositRow.classList.remove('d-none');
    if (depositPriceEl) depositPriceEl.innerText = `-${formatCurrency(tienCocDaTru)}`;
  } else {
    if (depositRow) depositRow.classList.add('d-none');
  }

  const finalPayment = Math.max(0, rawGrandTotal - tienCocDaTru - discount);
  document.getElementById('totalGrandPrice').innerText = formatCurrency(finalPayment);
}

/* =========================================================================
   PHÂN HỆ ĐƠN ĐẶT TRƯỚC (PRE-ORDER) & CẤN TRỪ TIỀN CỌC (TUẦN 3)
========================================================================= */

function initPreOrderModal() {
  const modalEl = document.getElementById('preOrderModal');
  if (modalEl) {
    preOrderModalInstance = new bootstrap.Modal(modalEl);
  }

  const btnOpen = document.getElementById('btnOpenPreOrderModal');
  if (btnOpen) {
    btnOpen.addEventListener('click', () => {
      loadPreOrders();
      if (preOrderModalInstance) preOrderModalInstance.show();
    });
  }

  const searchInput = document.getElementById('inputSearchPreOrder');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      loadPreOrders(searchInput.value);
    });
  }

  const btnClear = document.getElementById('btnClearPreOrder');
  if (btnClear) {
    btnClear.addEventListener('click', clearPreOrder);
  }
}

let availablePreOrders = [];

async function loadPreOrders(search = '') {
  const tbody = document.getElementById('preOrderTableBody');
  if (!tbody) return;

  const res = await api.get('/hoa-don/dat-truoc/tim-kiem', { search });
  if (!res.success) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-danger small">${res.message || 'Lỗi tải đơn đặt'}</td></tr>`;
    return;
  }

  availablePreOrders = res.data || [];
  availablePreOrders.forEach(d => {
    if (d.sanPham && d.sanPham.dungLuong) {
      d.sanPham.tenMay = d.sanPham.tenMay + ' ' + d.sanPham.dungLuong;
    }
  });
  if (availablePreOrders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted small">Không tìm thấy đơn đặt hàng trước nào còn hiệu lực</td></tr>`;
    return;
  }

  tbody.innerHTML = availablePreOrders.map(d => {
    const kh = d.khachHang || {};
    const sp = d.sanPham || {};
    return `
      <tr>
        <td>
          <div class="fw-semibold small">${escapeHtml(kh.hoTen || 'Chưa rõ')}</div>
          <div class="text-muted" style="font-size: 0.7rem;">SĐT: ${escapeHtml(kh.sdt || '')}</div>
        </td>
        <td>
          <div class="fw-semibold small">${escapeHtml(sp.tenMay || 'Điện thoại')}</div>
          <div class="text-muted" style="font-size: 0.7rem;">Hãng: ${escapeHtml(sp.hang || '')}</div>
        </td>
        <td class="small">${formatDate(d.hanLay || d.createdAt)}</td>
        <td class="text-end fw-bold text-success small">${formatCurrency(d.soTienCoc || 0)}</td>
        <td><span class="badge bg-info text-dark" style="font-size: 0.7rem;">${escapeHtml(d.trangThai)}</span></td>
        <td class="text-end">
          <button class="btn btn-sm btn-primary py-0 px-2" onclick="selectPreOrder('${d._id}')">
            <i class="bi bi-check2"></i> Chọn
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function selectPreOrder(id) {
  const preOrder = availablePreOrders.find(p => p._id === id);
  if (!preOrder) return;

  selectedPreOrder = preOrder;

  // Cập nhật giao diện thông tin đơn cọc
  const displayArea = document.getElementById('preOrderDisplayArea');
  const btnClear = document.getElementById('btnClearPreOrder');
  if (displayArea) {
    const kh = preOrder.khachHang || {};
    const sp = preOrder.sanPham || {};
    displayArea.innerHTML = `
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <strong class="text-dark">${escapeHtml(kh.hoTen || 'Khách cọc')}</strong> (${escapeHtml(kh.sdt || '')})<br>
          <span class="text-muted">Cọc SP: ${escapeHtml(sp.tenMay || '')}</span>
        </div>
        <span class="badge bg-success fs-6">${formatCurrency(preOrder.soTienCoc || 0)}</span>
      </div>
    `;
  }
  if (btnClear) btnClear.classList.remove('d-none');

  // Tự động chọn Khách hàng trên form nếu có
  if (preOrder.khachHang && preOrder.khachHang._id) {
    const selectKh = document.getElementById('selectKhachHang');
    if (selectKh) selectKh.value = preOrder.khachHang._id;
  }

  // Tự động lọc các máy IMEI thuộc đúng sản phẩm khách đã cọc
  if (preOrder.sanPham && preOrder.sanPham._id) {
    const filterSp = document.getElementById('filterPosSanPham');
    if (filterSp) {
      filterSp.value = preOrder.sanPham._id;
      filterImeiDisplay();
    }
  }

  if (preOrderModalInstance) preOrderModalInstance.hide();
  renderCart();
  showToast(`Đã áp dụng cấn trừ tiền cọc: ${formatCurrency(preOrder.soTienCoc)}`, 'success');
}

function clearPreOrder() {
  selectedPreOrder = null;
  const displayArea = document.getElementById('preOrderDisplayArea');
  const btnClear = document.getElementById('btnClearPreOrder');
  if (displayArea) {
    displayArea.innerHTML = `<em>Chưa liên kết đơn cọc</em>`;
  }
  if (btnClear) btnClear.classList.add('d-none');

  renderCart();
}

async function handleCreateOrder() {
  if (cart.imeis.length === 0 && cart.phuKiens.length === 0) {
    showToast('Giỏ hàng đang trống!', 'warning');
    return;
  }

  const khachHang = document.getElementById('selectKhachHang')?.value || null;
  const hinhThucThanhToan = document.getElementById('selectPaymentMethod')?.value || 'Da thanh toan';
  const ghiChu = document.getElementById('inputGhiChu')?.value || '';
  const inputDiscount = document.getElementById('inputSoTienGiam');
  const soTienGiam = Math.max(0, parseInt(inputDiscount ? inputDiscount.value : 0) || 0);

  const payload = {
    khachHang,
    danhSachIMEI: cart.imeis.map(m => m.imei),
    danhSachPhuKien: cart.phuKiens.map(pk => ({
      phuKien: pk._id,
      soLuong: pk.soLuong,
      donGiaBan: pk.giaBan
    })),
    hinhThucThanhToan,
    ghiChu,
    soTienGiam,
    donDatHangId: selectedPreOrder ? selectedPreOrder._id : null
  };

  const btn = document.getElementById('btnSubmitOrder');
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Đang xử lý bán hàng...`;

  const res = await api.post('/hoa-don', payload);

  btn.disabled = false;
  btn.innerHTML = `<i class="bi bi-check-circle me-1"></i> HOÀN TẤT BÁN HÀNG & XUẤT KHO [F4]`;

  if (!res.success) {
    playBeep('error');
    showToast(res.message || 'Lỗi khi tạo hóa đơn', 'danger');
    return;
  }

  playBeep('success');
  showToast(res.message || 'Bán hàng thành công!', 'success');

  // Reset giỏ, giảm giá và đơn cọc
  cart = { imeis: [], phuKiens: [] };
  if (inputDiscount) inputDiscount.value = '0';
  clearPreOrder();
  renderCart();

  // Reload data
  await loadPosData();
  await loadInvoiceList();
  await loadReportsData();

  // Mở modal xem và in hóa đơn
  if (res.data && res.data.hoaDon) {
    viewInvoiceDetail(res.data.hoaDon._id);
  }
}

/* =========================================================================
   TAB 2: QUẢN LÝ DANH SÁCH HÓA ĐƠN
========================================================================= */

async function initInvoiceListPage() {
  const form = document.getElementById('filterInvoiceForm');
  const btnReset = document.getElementById('btnResetInvFilter');

  await loadInvoiceList();

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      loadInvoiceList();
    });
  }
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      document.getElementById('filterInvSearch').value = '';
      document.getElementById('filterInvTuNgay').value = '';
      document.getElementById('filterInvDenNgay').value = '';
      document.getElementById('filterInvTrangThai').value = '';
      loadInvoiceList();
    });
  }
}

async function loadInvoiceList() {
  const tbody = document.getElementById('tableInvoiceBody');
  if (!tbody) return;

  const search = document.getElementById('filterInvSearch')?.value.trim() || '';
  const tuNgay = document.getElementById('filterInvTuNgay')?.value || '';
  const denNgay = document.getElementById('filterInvDenNgay')?.value || '';
  const trangThai = document.getElementById('filterInvTrangThai')?.value || '';

  const res = await api.get('/hoa-don', { search, tuNgay, denNgay, trangThai });
  if (!res.success) {
    showToast(res.message || 'Không thể tải danh sách hóa đơn', 'danger');
    return;
  }

  const hoaDons = res.hoaDons || res.data || [];
  if (hoaDons.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-5 text-muted">Không tìm thấy hóa đơn nào</td></tr>`;
    return;
  }

  tbody.innerHTML = hoaDons.map(hd => {
    const khName = hd.khachHang ? hd.khachHang.hoTen : 'Khách vãng lai';
    const nvName = hd.nhanVien ? hd.nhanVien.hoTen : 'Hệ thống';
    const tienThucThu = hd.soTienThanhToan !== undefined ? hd.soTienThanhToan : (hd.tongTien - (hd.tienCocDaTru || 0) - (hd.soTienGiam || 0));
    return `
      <tr>
        <td class="fw-bold font-monospace text-primary">${hd.soHD}</td>
        <td>${escapeHtml(khName)}</td>
        <td>${escapeHtml(nvName)}</td>
        <td>${formatDate(hd.ngayLap)}</td>
        <td class="text-end fw-bold text-success">
          ${formatCurrency(tienThucThu)}
          ${(hd.tienCocDaTru > 0 || hd.soTienGiam > 0) ? `
            <div class="text-muted" style="font-size: 0.7rem;">
              (Gốc: ${formatCurrency(hd.tongTien)}${hd.soTienGiam > 0 ? ` - Giảm: ${formatCurrency(hd.soTienGiam)}` : ''}${hd.tienCocDaTru > 0 ? ` - Cọc: ${formatCurrency(hd.tienCocDaTru)}` : ''})
            </div>` : ''}
        </td>
        <td><span class="badge bg-success">${escapeHtml(hd.trangThai)}</span></td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary" onclick="viewInvoiceDetail('${hd._id}')">
            <i class="bi bi-eye me-1"></i> Chi tiết / In
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

async function viewInvoiceDetail(id) {
  const res = await api.get(`/hoa-don/${id}`);
  if (!res.success) {
    showToast(res.message || 'Không thể tải chi tiết hóa đơn', 'danger');
    return;
  }

  const { hoaDon, danhSachMay, danhSachPhuKien, phieuXuatKho } = res;
  if (danhSachMay) {
    danhSachMay.forEach(m => {
      if (m.sanPham && m.sanPham.dungLuong) {
        m.sanPham.tenMay = m.sanPham.tenMay + ' ' + m.sanPham.dungLuong;
      }
    });
  }
  const content = document.getElementById('invoiceDetailContent');
  if (!content) return;

  const kh = hoaDon.khachHang || {};
  const nv = hoaDon.nhanVien || {};
  const tienCocDaTru = hoaDon.tienCocDaTru || 0;
  const soTienGiam = hoaDon.soTienGiam || 0;
  const soTienThanhToan = hoaDon.soTienThanhToan !== undefined ? hoaDon.soTienThanhToan : (hoaDon.tongTien - tienCocDaTru - soTienGiam);

  content.innerHTML = `
    <div class="p-3 border rounded mb-3 bg-light">
      <div class="row">
        <div class="col-sm-6">
          <h5 class="fw-bold text-primary mb-1">ONE TECH STORE</h5>
          <p class="small text-muted mb-0">Hệ thống phân phối điện thoại chính hãng theo IMEI</p>
          <p class="small text-muted mb-0">Hotline: 1900 6868</p>
        </div>
        <div class="col-sm-6 text-sm-end">
          <h5 class="fw-bold mb-1 font-monospace">HÓA ĐƠN: ${hoaDon.soHD}</h5>
          <p class="small text-muted mb-0">Ngày lập: ${formatDate(hoaDon.ngayLap)}</p>
          <p class="small text-muted mb-0">Nhân viên: <strong>${escapeHtml(nv.hoTen || '')}</strong></p>
        </div>
      </div>
      <hr>
      <div class="row small">
        <div class="col-sm-6">
          <strong>Khách hàng:</strong> ${escapeHtml(kh.hoTen || 'Khách vãng lai')}<br>
          <strong>SĐT:</strong> ${escapeHtml(kh.sdt || 'Chưa có')}<br>
          <strong>Địa chỉ:</strong> ${escapeHtml(kh.diaChi || 'Chưa có')}
        </div>
        <div class="col-sm-6 text-sm-end">
          <strong>Hình thức:</strong> <span class="badge bg-success">${escapeHtml(hoaDon.trangThai)}</span><br>
          ${phieuXuatKho ? `<strong>Phiếu xuất kho:</strong> <span class="badge bg-secondary">Đã xuất tự động</span><br>` : ''}
          ${hoaDon.donDatHang ? `<strong>Đơn đặt trước:</strong> <span class="badge bg-info text-dark">Đã cấn trừ cọc</span><br>` : ''}
          ${hoaDon.ghiChu ? `<strong>Ghi chú:</strong> ${escapeHtml(hoaDon.ghiChu)}` : ''}
        </div>
      </div>
    </div>

    <h6 class="fw-bold mb-2">1. Danh sách Máy theo IMEI vật lý</h6>
    <div class="table-responsive mb-3">
      <table class="table table-bordered table-sm mb-0">
        <thead class="table-light">
          <tr>
            <th>#</th>
            <th>Tên máy / Model</th>
            <th>Số IMEI</th>
            <th>Màu / Dung lượng</th>
            <th class="text-end">Đơn giá</th>
          </tr>
        </thead>
        <tbody>
          ${danhSachMay && danhSachMay.length > 0 ? danhSachMay.map((m, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td class="fw-semibold">${escapeHtml(m.sanPham ? m.sanPham.tenMay : 'Điện thoại')}</td>
              <td class="font-monospace text-primary">${m.imei}</td>
              <td>${escapeHtml(m.mauSac || '')} ${escapeHtml(m.dungLuong || '')}</td>
              <td class="text-end fw-semibold">${formatCurrency(m.donGiaBan)}</td>
            </tr>
          `).join('') : `<tr><td colspan="5" class="text-center text-muted small">Không có máy IMEI nào</td></tr>`}
        </tbody>
      </table>
    </div>

    <h6 class="fw-bold mb-2">2. Danh sách Phụ kiện kèm theo</h6>
    <div class="table-responsive mb-3">
      <table class="table table-bordered table-sm mb-0">
        <thead class="table-light">
          <tr>
            <th>#</th>
            <th>Tên phụ kiện</th>
            <th class="text-center">Số lượng</th>
            <th class="text-end">Đơn giá</th>
            <th class="text-end">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${danhSachPhuKien && danhSachPhuKien.length > 0 ? danhSachPhuKien.map((pk, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td class="fw-semibold">${escapeHtml(pk.phuKien ? pk.phuKien.tenPK : 'Phụ kiện')}</td>
              <td class="text-center">${pk.soLuong}</td>
              <td class="text-end">${formatCurrency(pk.donGiaBan)}</td>
              <td class="text-end fw-semibold">${formatCurrency(pk.donGiaBan * pk.soLuong)}</td>
            </tr>
          `).join('') : `<tr><td colspan="5" class="text-center text-muted small">Không có phụ kiện nào</td></tr>`}
        </tbody>
      </table>
    </div>

    <div class="bg-light p-3 rounded text-end">
      <div class="d-flex justify-content-between mb-1">
        <span class="text-muted">Tổng giá trị đơn hàng:</span>
        <span class="fw-semibold">${formatCurrency(hoaDon.tongTien)}</span>
      </div>
      ${soTienGiam > 0 ? `
        <div class="d-flex justify-content-between mb-1 text-warning">
          <span>Chiết khấu / Giảm giá:</span>
          <span class="fw-bold">-${formatCurrency(soTienGiam)}</span>
        </div>
      ` : ''}
      ${tienCocDaTru > 0 ? `
        <div class="d-flex justify-content-between mb-1 text-success">
          <span>Tiền cọc đã trừ (Đơn đặt trước):</span>
          <span class="fw-bold">-${formatCurrency(tienCocDaTru)}</span>
        </div>
      ` : ''}
      <hr class="my-2">
      <div class="fs-5 fw-bold text-danger">TỔNG TIỀN THỰC THU: ${formatCurrency(soTienThanhToan)}</div>
    </div>
  `;

  currentViewingInvoice = res;
  const modal = new bootstrap.Modal(document.getElementById('invoiceDetailModal'));
  modal.show();
}

let currentViewingInvoice = null;

/**
 * In Hóa đơn bán lẻ & Phiếu xuất kho chuẩn Thông tư 200/2014/TT-BTC & NĐ 123/2020/NĐ-CP
 */
function printInvoiceReceipt(invoiceData = null) {
  const data = invoiceData || currentViewingInvoice;
  if (!data || !data.hoaDon) {
    showToast('Chưa có dữ liệu hóa đơn để in!', 'warning');
    return;
  }

  const { hoaDon, danhSachMay = [], danhSachPhuKien = [] } = data;
  const kh = hoaDon.khachHang || {};
  const nv = hoaDon.nhanVien || {};
  const tienCocDaTru = hoaDon.tienCocDaTru || 0;
  const soTienGiam = hoaDon.soTienGiam || 0;
  const soTienThanhToan = hoaDon.soTienThanhToan !== undefined ? hoaDon.soTienThanhToan : (hoaDon.tongTien - tienCocDaTru - soTienGiam);

  if (typeof inHoaDonBanHangChuan === 'function') {
    inHoaDonBanHangChuan({
      soHD: hoaDon.soHD || hoaDon._id,
      ngayLap: hoaDon.ngayLap || hoaDon.createdAt,
      khachHang: kh,
      nhanVien: nv,
      danhSachMay: danhSachMay,
      danhSachPK: danhSachPhuKien,
      tienCocDaTru,
      soTienGiam,
      soTienThanhToan,
      tongTien: hoaDon.tongTien,
      hinhThucThanhToan: hoaDon.trangThai || 'Tiền mặt'
    });
  } else {
    window.print();
  }
}

/* =========================================================================
   TAB 3: BÁO CÁO DOANH SỐ & KPI NHÂN VIÊN (TUẦN 5-6 - NGUYỄN QUANG TUẤN)
========================================================================= */

async function initReportsTab() {
  const btnReload = document.getElementById('btnReloadStaffKpi');
  if (btnReload) {
    btnReload.addEventListener('click', loadReportsData);
  }

  // Load khi mở tab
  const reportsTabBtn = document.getElementById('tab-reports-tab');
  if (reportsTabBtn) {
    reportsTabBtn.addEventListener('shown.bs.tab', loadReportsData);
  }
}

async function loadReportsData() {
  await Promise.all([
    loadStaffKpi(),
    loadTopProducts()
  ]);
}

async function loadStaffKpi() {
  const tbody = document.getElementById('staffKpiTableBody');
  if (!tbody) return;

  const res = await api.get('/hoa-don/bao-cao/doanh-so-nhan-vien');
  if (!res.success) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-danger small">${res.message || 'Lỗi tải KPI'}</td></tr>`;
    return;
  }

  const list = res.data || [];
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted small">Chưa có dữ liệu bán hàng</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(item => `
    <tr>
      <td>
        <div class="fw-semibold small">${escapeHtml(item.hoTen)}</div>
        <div class="text-muted" style="font-size: 0.7rem;">@${escapeHtml(item.tenDangNhap)}</div>
      </td>
      <td><span class="badge bg-secondary-subtle text-secondary border" style="font-size: 0.7rem;">${escapeHtml(item.vaiTro)}</span></td>
      <td class="text-center fw-bold">${item.soHoaDon}</td>
      <td class="text-end fw-bold text-success">${formatCurrency(item.tongDoanhThu)}</td>
      <td class="text-end small text-muted">${formatCurrency(item.giaTriTrungBinh)}</td>
    </tr>
  `).join('');
}

async function loadTopProducts() {
  const tbody = document.getElementById('topProductsTableBody');
  if (!tbody) return;

  const res = await api.get('/hoa-don/bao-cao/top-san-pham');
  if (!res.success) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-danger small">${res.message || 'Lỗi tải top SP'}</td></tr>`;
    return;
  }

  const list = res.data || [];
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted small">Chưa có dữ liệu</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map((item, idx) => `
    <tr>
      <td class="fw-bold text-muted">${idx + 1}</td>
      <td>
        <div class="fw-semibold small">${escapeHtml(item.tenMay)}</div>
        <span class="badge bg-light text-dark border" style="font-size: 0.65rem;">${escapeHtml(item.hang || '')}</span>
      </td>
      <td class="text-center fw-bold text-primary">${item.soLuongBan}</td>
      <td class="text-end fw-semibold small text-success">${formatCurrency(item.doanhThu)}</td>
    </tr>
  `).join('');
}

window.addImeiToCart = addImeiToCart;
window.removeImeiFromCart = removeImeiFromCart;
window.addPhuKienToCart = addPhuKienToCart;
window.changePhuKienQty = changePhuKienQty;
window.viewInvoiceDetail = viewInvoiceDetail;
window.printInvoiceReceipt = printInvoiceReceipt;
window.selectPreOrder = selectPreOrder;
window.loadReportsData = loadReportsData;
window.shortcutAction = shortcutAction;


// Lắng nghe sự kiện thêm khách hàng nhanh
document.addEventListener('DOMContentLoaded', () => {
  const btnSubmitQuickCustomer = document.getElementById('btnSubmitQuickCustomer');
  if (btnSubmitQuickCustomer) {
    btnSubmitQuickCustomer.addEventListener('click', async () => {
      const hoTen = document.getElementById('quickKhHoTen')?.value.trim();
      const sdt = document.getElementById('quickKhSdt')?.value.trim();
      const email = document.getElementById('quickKhEmail')?.value.trim();
      const diaChi = document.getElementById('quickKhDiaChi')?.value.trim();

      if (!hoTen) {
        showToast('Vui lòng nhập họ tên khách hàng', 'warning');
        return;
      }
      if (!sdt || !/^[0-9]{10}$/.test(sdt)) {
        showToast('Số điện thoại không hợp lệ (yêu cầu 10 chữ số)', 'warning');
        return;
      }

      const body = { hoTen, sdt, email, diaChi };
      const res = await api.post('/khach-hang', body);
      
      if (res.success && res.data) {
        showToast('Thêm khách hàng thành công', 'success');
        
        // Cập nhật lại dropdown và chọn khách hàng vừa tạo
        await loadCustomers(res.data._id);
        
        // Ẩn modal và reset form
        const modalEl = document.getElementById('quickCreateCustomerModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        document.getElementById('quickCreateCustomerForm')?.reset();
      } else {
        showToast(res.message || 'Lỗi khi thêm khách hàng', 'danger');
      }
    });
  }
});
