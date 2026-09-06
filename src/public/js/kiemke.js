/**
 * Module Xử lý Giao diện Kiểm Kê Kho & Đối Soát IMEI
 * Phụ trách: Đinh Đức Vương (Thành viên 5) & Nguyễn Tuấn Vũ (Frontend)
 */

let currentKhoList = [];
let currentBienBanResult = null;
let currentDetailData = null;
let modalChiTietInstance = null;
let modalTonLyThuyetInstance = null;
let cachedImeiLyThuyetList = [];
let cachedKhoInfo = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Khởi tạo Modal Bootstrap
  const modalEl = document.getElementById('modalChiTietBienBan');
  if (modalEl && typeof bootstrap !== 'undefined') {
    modalChiTietInstance = new bootstrap.Modal(modalEl);
  }
  const modalTonLyThuyetEl = document.getElementById('modalDanhSachTonLyThuyet');
  if (modalTonLyThuyetEl && typeof bootstrap !== 'undefined') {
    modalTonLyThuyetInstance = new bootstrap.Modal(modalTonLyThuyetEl);
  }

  // Tải danh mục kho và nạp dữ liệu ban đầu
  await loadKhoList();
  await loadLichSuKiemKe(1);
});

/**
 * Tải danh sách kho hàng và đưa vào các dropdown <select>
 */
async function loadKhoList() {
  try {
    const res = await api.get('/kho/ton-kho');
    const khoMap = new Map();
    if (res && res.data) {
      const items = Array.isArray(res.data) ? res.data : (res.data.items || []);
      items.forEach(item => {
        if (item.kho && item.kho._id) {
          khoMap.set(String(item.kho._id), item.kho);
        }
        if (item.chiTietTheoKho && Array.isArray(item.chiTietTheoKho)) {
          item.chiTietTheoKho.forEach(c => {
            if (c.kho && c.kho._id) khoMap.set(String(c.kho._id), c.kho);
          });
        }
      });
    }

    currentKhoList = [...khoMap.values()];

    const selectKho = document.getElementById('selectKho');
    const displayTenKho = document.getElementById('displayTenKho');

    if (currentKhoList.length > 0) {
      const k = currentKhoList[0];
      if (selectKho) selectKho.value = k._id;
      if (displayTenKho) displayTenKho.value = k.tenKho || 'Kho Tổng OneTech Store';
    } else {
      if (displayTenKho) displayTenKho.value = 'Kho Tổng OneTech Store';
    }

    // Tải thông tin tồn lý thuyết của kho đang chọn
    await handleKhoChange();
  } catch (err) {
    console.error('Lỗi khi tải thông tin kho:', err);
  }
}

/**
 * Khi thay đổi kho cần kiểm kê: Tải thông tin tồn lý thuyết
 */
async function handleKhoChange() {
  try {
    const selectKho = document.getElementById('selectKho');
    const khoId = selectKho ? selectKho.value : '';
    const res = await api.get(`/kiem-ke/imei-ly-thuyet/${khoId || ''}`);

    if (res && res.success && res.data) {
      const tongLT = res.data.tongSoLuong || 0;
      cachedImeiLyThuyetList = res.data.danhSachImei || [];
      cachedKhoInfo = res.data.kho || {};
      const statTongLyThuyet = document.getElementById('statTongLyThuyet');
      if (statTongLyThuyet) {
        statTongLyThuyet.textContent = `${tongLT} máy`;
      }
      const displayTenKho = document.getElementById('displayTenKho');
      if (displayTenKho && res.data.kho && res.data.kho.tenKho) {
        displayTenKho.value = res.data.kho.tenKho;
      }
    }
  } catch (err) {
    console.warn('Không thể tải tồn lý thuyết:', err.message);
  }
}

/**
 * Mở Modal xem danh sách máy tồn kho lý thuyết (DB)
 */
async function openModalTonLyThuyet() {
  const displayTenKho = document.getElementById('displayTenKho');
  const tenKhoText = displayTenKho ? displayTenKho.value : 'Kho Tổng OneTech Store';

  const modalKhoEl = document.getElementById('modalTonLyThuyetTenKho');
  if (modalKhoEl) modalKhoEl.textContent = tenKhoText;

  const modalTitle = document.getElementById('modalTonLyThuyetLabel');
  if (modalTitle) {
    modalTitle.innerHTML = '<i class="bi bi-database-check me-2"></i> Danh Sách Máy Tồn Kho Lý Thuyết (DB)';
  }

  // Nếu chưa nạp dữ liệu, nạp ngay
  if (!cachedImeiLyThuyetList || cachedImeiLyThuyetList.length === 0) {
    await handleKhoChange();
  }

  const searchInput = document.getElementById('searchTonLyThuyet');
  if (searchInput) searchInput.value = '';

  renderTonLyThuyetTable(cachedImeiLyThuyetList);

  if (modalTonLyThuyetInstance) {
    modalTonLyThuyetInstance.show();
  }
}

/**
 * Mở Modal xem danh sách máy thực tế đã quét
 */
function openModalThucTeQuet() {
  const modalKhoEl = document.getElementById('modalTonLyThuyetTenKho');
  if (modalKhoEl) modalKhoEl.textContent = 'Thực tế đã quét';

  const modalTitle = document.getElementById('modalTonLyThuyetLabel');
  if (modalTitle) {
    modalTitle.innerHTML = '<i class="bi bi-upc-scan me-2"></i> Danh Sách Mã IMEI Thực Tế Đã Quét';
  }

  let listToRender = [];

  if (currentBienBanResult && currentBienBanResult.tongKet) {
    const { danhSachKhop = [], danhSachThua = [], danhSachBatThuong = [] } = currentBienBanResult;
    listToRender = [...danhSachKhop, ...danhSachThua, ...danhSachBatThuong];
  } else {
    const textarea = document.getElementById('textareaImeiThucTe');
    const raw = textarea ? textarea.value.trim() : '';
    if (raw) {
      const imeis = [...new Set(raw.split(/[\n,;\t\r]+/).map(s => s.trim()).filter(s => s.length > 0))];
      listToRender = imeis.map(imei => {
        const foundDb = cachedImeiLyThuyetList.find(m => m.imei === imei);
        return {
          imei,
          tenMay: foundDb?.tenMay || 'Mã IMEI quét thực tế',
          hang: foundDb?.hang || 'N/A',
          mauSac: foundDb?.mauSac || '',
          dungLuong: foundDb?.dungLuong || '',
          trangThai: foundDb ? 'Có trong DB' : 'Chưa có thông tin DB',
          ngayNhap: foundDb?.ngayNhap
        };
      });
    }
  }

  if (listToRender.length === 0) {
    api.showToast('Chưa có mã IMEI thực tế nào được quét hoặc nhập vào', 'warning');
    return;
  }

  const searchInput = document.getElementById('searchTonLyThuyet');
  if (searchInput) searchInput.value = '';

  renderTonLyThuyetTable(listToRender);

  if (modalTonLyThuyetInstance) {
    modalTonLyThuyetInstance.show();
  }
}

/**
 * Mở Modal xem danh sách máy khớp 100%
 */
function openModalKhop() {
  if (!currentBienBanResult || !currentBienBanResult.danhSachKhop) {
    api.showToast('Vui lòng thực hiện phiên kiểm kê để đối soát danh sách khớp 100%', 'info');
    return;
  }

  const modalKhoEl = document.getElementById('modalTonLyThuyetTenKho');
  if (modalKhoEl) modalKhoEl.textContent = 'Danh sách khớp 100%';

  const modalTitle = document.getElementById('modalTonLyThuyetLabel');
  if (modalTitle) {
    modalTitle.innerHTML = '<i class="bi bi-check2-circle me-2"></i> Danh Sách Máy Khớp 100% Lý Thuyết & Thực Tế';
  }

  const listToRender = currentBienBanResult.danhSachKhop.map(item => ({
    imei: item.imei,
    tenMay: item.tenMay,
    hang: item.hang,
    trangThai: 'Khớp 100%',
    ngayNhap: null
  }));

  const searchInput = document.getElementById('searchTonLyThuyet');
  if (searchInput) searchInput.value = '';

  renderTonLyThuyetTable(listToRender);

  if (modalTonLyThuyetInstance) {
    modalTonLyThuyetInstance.show();
  }
}

/**
 * Mở Modal xem danh sách máy bị chênh lệch (thiếu / thừa / bất thường)
 */
function openModalLech() {
  if (!currentBienBanResult) {
    api.showToast('Vui lòng thực hiện phiên kiểm kê để đối soát danh sách chênh lệch', 'info');
    return;
  }

  const { danhSachThieu = [], danhSachThua = [], danhSachBatThuong = [] } = currentBienBanResult;
  const allLech = [...danhSachThieu, ...danhSachThua, ...danhSachBatThuong];

  if (allLech.length === 0) {
    api.showToast('Tuyệt vời! Không có máy nào bị chênh lệch kho', 'success');
    return;
  }

  const modalKhoEl = document.getElementById('modalTonLyThuyetTenKho');
  if (modalKhoEl) modalKhoEl.textContent = 'Danh sách chênh lệch kho';

  const modalTitle = document.getElementById('modalTonLyThuyetLabel');
  if (modalTitle) {
    modalTitle.innerHTML = '<i class="bi bi-exclamation-triangle me-2"></i> Danh Sách Máy Chênh Lệch Cần Xử Lý';
  }

  const listToRender = allLech.map(item => ({
    imei: item.imei,
    tenMay: item.tenMay,
    hang: item.hang,
    trangThai: item.loaiLech === 'Thieu' ? 'Thiếu (-1)' : (item.loaiLech === 'Thua' ? 'Thừa (+1)' : 'Bất thường (0)'),
    lyDo: item.lyDo || item.ghiChu
  }));

  const searchInput = document.getElementById('searchTonLyThuyet');
  if (searchInput) searchInput.value = '';

  renderTonLyThuyetTable(listToRender);

  if (modalTonLyThuyetInstance) {
    modalTonLyThuyetInstance.show();
  }
}

/**
 * Render bảng danh sách tồn lý thuyết trong Modal
 */
function renderTonLyThuyetTable(list = []) {
  const tbody = document.getElementById('tbodyDanhSachTonLyThuyet');
  const badgeCount = document.getElementById('modalTonLyThuyetCount');
  const summaryEl = document.getElementById('modalTonLyThuyetSummary');

  if (badgeCount) badgeCount.textContent = `${list.length} máy`;
  if (summaryEl) summaryEl.textContent = `Hiển thị ${list.length} / ${cachedImeiLyThuyetList.length} máy tồn`;

  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">Không tìm thấy máy tồn kho nào phù hợp</td></tr>';
    return;
  }

  tbody.innerHTML = list.map((item, idx) => {
    const d = item.ngayNhap ? new Date(item.ngayNhap) : null;
    const ngayStr = d ? `${d.toLocaleDateString('vi-VN')}` : 'N/A';
    const mauDungLuong = [item.mauSac, item.dungLuong].filter(Boolean).join(' - ') || 'N/A';

    return `
      <tr>
        <td class="text-center">${idx + 1}</td>
        <td class="font-monospace fw-bold text-primary">${item.imei || '---'}</td>
        <td class="fw-semibold">${item.tenMay || 'Không rõ model'}</td>
        <td class="text-center">${item.hang || 'N/A'}</td>
        <td class="text-center small text-muted">${mauDungLuong}</td>
        <td class="text-center"><span class="badge bg-success">Còn hàng</span></td>
        <td class="text-center small text-muted">${ngayStr}</td>
      </tr>
    `;
  }).join('');
}

/**
 * Tìm kiếm lọc thời gian thực trong Modal Tồn Lý Thuyết
 */
function filterTonLyThuyetTable() {
  const input = document.getElementById('searchTonLyThuyet');
  const query = input ? input.value.trim().toLowerCase() : '';

  if (!query) {
    renderTonLyThuyetTable(cachedImeiLyThuyetList);
    return;
  }

  const filtered = cachedImeiLyThuyetList.filter(item => {
    const imei = (item.imei || '').toLowerCase();
    const tenMay = (item.tenMay || '').toLowerCase();
    const hang = (item.hang || '').toLowerCase();
    const mauSac = (item.mauSac || '').toLowerCase();
    const dungLuong = (item.dungLuong || '').toLowerCase();
    return imei.includes(query) || tenMay.includes(query) || hang.includes(query) || mauSac.includes(query) || dungLuong.includes(query);
  });

  renderTonLyThuyetTable(filtered);
}

/**
 * Cập nhật số lượng IMEI đã nhập trong ô Textarea
 */
function updateCountScanned() {
  const textarea = document.getElementById('textareaImeiThucTe');
  const badge = document.getElementById('badgeCountScanned');
  if (!textarea || !badge) return;

  const raw = textarea.value.trim();
  if (!raw) {
    badge.textContent = 'Đã nhập: 0 IMEI';
    return;
  }

  const list = [...new Set(raw.split(/[\n,;\t\r]+/).map(s => s.trim()).filter(s => s.length > 0))];
  badge.textContent = `Đã nhập: ${list.length} IMEI hợp lệ`;
}

/**
 * Cuộn màn hình tới form kiểm kê
 */
function scrollToKiemKeForm() {
  const el = document.getElementById('formKiemKeSection');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
    const textarea = document.getElementById('textareaImeiThucTe');
    if (textarea) textarea.focus();
  }
}

/**
 * Reset form kiểm kê
 */
function resetFormKiemKe() {
  const form = document.getElementById('formKiemKe');
  if (form) form.reset();
  updateCountScanned();
  const ketQuaContainer = document.getElementById('ketQuaDoiSoatContainer');
  if (ketQuaContainer) ketQuaContainer.style.display = 'none';
  currentBienBanResult = null;
}

/**
 * Xử lý sự kiện Submit Thực Hiện Kiểm Kê Kho
 */
async function handleThucHienKiemKe(e) {
  if (e) e.preventDefault();

  const selectKho = document.getElementById('selectKho');
  const textarea = document.getElementById('textareaImeiThucTe');
  const inputGhiChu = document.getElementById('inputGhiChu');
  const btnSubmit = document.getElementById('btnSubmitKiemKe');

  if (!textarea || !textarea.value.trim()) {
    api.showToast('Vui lòng nhập hoặc quét ít nhất 1 mã IMEI thực tế', 'warning');
    return;
  }

  const khoId = selectKho ? selectKho.value : '';
  const danhSachImeiThucTe = textarea.value;
  const ghiChu = inputGhiChu ? inputGhiChu.value.trim() : '';

  try {
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Đang đối soát...';
    }

    const res = await api.post('/kiem-ke', {
      khoId: khoId === 'default' ? undefined : khoId,
      danhSachImeiThucTe,
      ghiChu
    });

    if (res && res.success) {
      api.showToast('Kiểm kê kho & lập biên bản đối soát thành công!', 'success');
      currentBienBanResult = res.data;
      renderKetQuaDoiSoat(res.data);
      await loadLichSuKiemKe(1);
    } else {
      api.showToast(res.message || 'Lỗi khi kiểm kê kho', 'danger');
    }
  } catch (err) {
    console.error('Lỗi kiểm kê kho:', err);
    api.showToast(err.message || 'Lỗi hệ thống khi xử lý kiểm kê', 'danger');
  } finally {
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = '<i class="bi bi-cpu me-1"></i> Tiến Hành Đối Soát & Lập Biên Bản';
    }
  }
}

/**
 * Hiển thị kết quả đối soát vừa thực hiện lên giao diện
 */
function renderKetQuaDoiSoat(data) {
  const container = document.getElementById('ketQuaDoiSoatContainer');
  const tbody = document.getElementById('tbodyKetQuaDoiSoat');
  if (!container || !tbody || !data) return;

  container.style.display = 'block';

  const { tongKet = {}, danhSachKhop = [], danhSachThieu = [], danhSachThua = [], danhSachBatThuong = [], bienBan = {} } = data;

  // Cập nhật các Cards KPI
  const statTongLyThuyet = document.getElementById('statTongLyThuyet');
  const statTongThucTe = document.getElementById('statTongThucTe');
  const statTongKhop = document.getElementById('statTongKhop');
  const statTongLech = document.getElementById('statTongLech');
  const statThieu = document.getElementById('statThieu');
  const statThua = document.getElementById('statThua');

  if (statTongLyThuyet) statTongLyThuyet.textContent = `${tongKet.tongLyThuyet || 0} máy`;
  if (statTongThucTe) statTongThucTe.textContent = `${tongKet.tongThucTe || 0} máy`;
  if (statTongKhop) statTongKhop.textContent = `${tongKet.tongKhop || 0} máy`;
  if (statTongLech) statTongLech.textContent = `${tongKet.tongLech || 0} máy`;
  if (statThieu) statThieu.textContent = `${tongKet.tongThieu || 0} thiếu`;
  if (statThua) statThua.textContent = `${(tongKet.tongThua || 0) + (tongKet.tongBatThuong || 0)} thừa`;

  // Gộp tất cả các danh sách để hiển thị
  const allRows = [
    ...danhSachThieu,
    ...danhSachThua,
    ...danhSachBatThuong,
    ...danhSachKhop
  ];

  if (allRows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-3">Không có dữ liệu đối soát</td></tr>';
    return;
  }

  tbody.innerHTML = allRows.map((item, idx) => {
    let loaiBadge = '';
    let rowClass = '';

    if (item.loaiLech === 'Thieu') {
      loaiBadge = '<span class="badge bg-danger">Thiếu máy (-1)</span>';
      rowClass = 'table-danger';
    } else if (item.loaiLech === 'Thua') {
      loaiBadge = '<span class="badge bg-warning text-dark">Thừa máy (+1)</span>';
      rowClass = 'table-warning';
    } else if (item.loaiLech === 'Bat thuong') {
      loaiBadge = '<span class="badge bg-info text-dark">Bất thường (0)</span>';
      rowClass = 'table-info';
    } else {
      loaiBadge = '<span class="badge bg-success">Khớp 100%</span>';
    }

    return `
      <tr class="${rowClass}">
        <td class="text-center">${idx + 1}</td>
        <td class="font-monospace fw-bold">${item.imei || '---'}</td>
        <td class="fw-semibold">${item.tenMay || 'Không rõ model'}</td>
        <td class="text-center">${item.hang || 'N/A'}</td>
        <td class="text-center"><span class="badge bg-secondary">${item.trangThaiMayDB || 'N/A'}</span></td>
        <td class="text-center">${loaiBadge}</td>
        <td class="small">${item.lyDo || item.ghiChu || ''}</td>
      </tr>
    `;
  }).join('');

  // Cuộn tới kết quả
  container.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Tải Lịch Sử Biên Bản Kiểm Kê (Phân trang & Lọc)
 */
async function loadLichSuKiemKe(page = 1) {
  const tbody = document.getElementById('tbodyLichSuKiemKe');
  const paginationInfo = document.getElementById('paginationInfo');
  const paginationNav = document.getElementById('paginationNav');

  if (!tbody) return;

  const filterKho = document.getElementById('filterKho')?.value || '';
  const filterTrangThai = document.getElementById('filterTrangThai')?.value || '';
  const filterTuNgay = document.getElementById('filterTuNgay')?.value || '';
  const filterDenNgay = document.getElementById('filterDenNgay')?.value || '';

  try {
    tbody.innerHTML = '<tr><td colspan="10" class="text-center text-muted py-3"><span class="spinner-border spinner-border-sm me-1"></span> Đang nạp danh sách...</td></tr>';

    const params = new URLSearchParams({
      page: String(page),
      limit: '10'
    });
    if (filterKho) params.append('kho', filterKho);
    if (filterTrangThai) params.append('trangThai', filterTrangThai);
    if (filterTuNgay) params.append('tuNgay', filterTuNgay);
    if (filterDenNgay) params.append('denNgay', filterDenNgay);

    const res = await api.get(`/kiem-ke?${params.toString()}`);

    if (!res || !res.success || !res.data || !res.data.items || res.data.items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" class="text-center text-muted py-4">Chưa có biên bản kiểm kê nào phù hợp</td></tr>';
      if (paginationInfo) paginationInfo.textContent = 'Hiển thị 0 / 0 biên bản';
      if (paginationNav) paginationNav.innerHTML = '';
      return;
    }

    const { items, total, totalPages } = res.data;

    tbody.innerHTML = items.map(item => {
      let statusBadge = '';
      if (item.trangThai === 'Da dieu chinh') {
        statusBadge = '<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i> Đã điều chỉnh</span>';
      } else if (item.trangThai === 'Huy') {
        statusBadge = '<span class="badge bg-danger"><i class="bi bi-x-circle me-1"></i> Đã hủy</span>';
      } else {
        statusBadge = '<span class="badge bg-primary"><i class="bi bi-clock me-1"></i> Đã kiểm kê</span>';
      }

      const d = new Date(item.ngay || item.createdAt);
      const ngayStr = `${d.toLocaleDateString('vi-VN')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

      const isManager = currentUser && currentUser.vaiTro === 'Quản lý';
      const canApply = item.trangThai === 'Da kiem ke';
      const canCancel = item.trangThai === 'Da kiem ke' && isManager;

      return `
        <tr>
          <td class="font-monospace fw-bold text-primary">${item.maBienBan || 'BBKK-' + item._id.slice(-6)}</td>
          <td>${item.kho?.tenKho || 'Kho Tổng'}</td>
          <td>${item.nhanVien?.hoTen || 'Thủ kho'}</td>
          <td class="small text-muted">${ngayStr}</td>
          <td class="text-center fw-semibold">${item.tongLyThuyet || 0}</td>
          <td class="text-center fw-semibold">${item.tongThucTe || 0}</td>
          <td class="text-center text-success fw-bold">${item.tongKhop || 0}</td>
          <td class="text-center ${item.tongLech > 0 ? 'text-danger fw-bold' : 'text-muted'}">${item.tongLech || 0}</td>
          <td class="text-center">${statusBadge}</td>
          <td class="text-center">
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-info" title="Xem chi tiết" onclick="openChiTietBienBanModal('${item._id}')">
                <i class="bi bi-eye"></i>
              </button>
              <button class="btn btn-outline-secondary" title="In biên bản" onclick="inBienBanTheoId('${item._id}')">
                <i class="bi bi-printer"></i>
              </button>
              ${canApply ? `
              <button class="btn btn-outline-success" title="Áp dụng điều chỉnh kho" onclick="apDungDieuChinhKho('${item._id}')">
                <i class="bi bi-check-lg"></i>
              </button>` : ''}
              ${canCancel ? `
              <button class="btn btn-outline-danger" title="Hủy biên bản" onclick="huyBienBanKiemKe('${item._id}')">
                <i class="bi bi-trash"></i>
              </button>` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    if (paginationInfo) {
      paginationInfo.textContent = `Hiển thị ${items.length} / ${total} biên bản (Trang ${page}/${totalPages})`;
    }

    if (paginationNav) {
      let navHtml = '';
      for (let p = 1; p <= totalPages; p++) {
        navHtml += `
          <li class="page-item ${p === page ? 'active' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="loadLichSuKiemKe(${p})">${p}</a>
          </li>
        `;
      }
      paginationNav.innerHTML = navHtml;
    }
  } catch (err) {
    console.error('Lỗi khi tải lịch sử kiểm kê:', err);
    tbody.innerHTML = '<tr><td colspan="10" class="text-center text-danger py-3">Lỗi tải dữ liệu</td></tr>';
  }
}

/**
 * Mở modal xem chi tiết biên bản kiểm kê và các dòng DieuChinhKho
 */
async function openChiTietBienBanModal(id) {
  try {
    const res = await api.get(`/kiem-ke/${id}`);
    if (!res || !res.success || !res.data) {
      api.showToast('Không tìm thấy dữ liệu biên bản kiểm kê', 'warning');
      return;
    }

    currentDetailData = res.data;
    const { bienBan = {}, chiTiet = [] } = res.data;

    document.getElementById('modalMaBB').textContent = bienBan.maBienBan || '---';
    document.getElementById('modalKho').textContent = bienBan.kho?.tenKho || 'Kho hàng';
    document.getElementById('modalNguoiLap').textContent = bienBan.nhanVien?.hoTen || 'Thủ kho';
    document.getElementById('modalNgay').textContent = new Date(bienBan.ngay || bienBan.createdAt).toLocaleString('vi-VN');

    document.getElementById('modalTongLT').textContent = bienBan.tongLyThuyet || 0;
    document.getElementById('modalTongTT').textContent = bienBan.tongThucTe || 0;
    document.getElementById('modalTongKhop').textContent = bienBan.tongKhop || 0;
    document.getElementById('modalTongLech').textContent = bienBan.tongLech || 0;

    const badgeEl = document.getElementById('modalTrangThaiBadge');
    if (badgeEl) {
      if (bienBan.trangThai === 'Da dieu chinh') {
        badgeEl.className = 'badge bg-success';
        badgeEl.textContent = 'Đã điều chỉnh';
      } else if (bienBan.trangThai === 'Huy') {
        badgeEl.className = 'badge bg-danger';
        badgeEl.textContent = 'Đã hủy';
      } else {
        badgeEl.className = 'badge bg-primary';
        badgeEl.textContent = 'Đã kiểm kê';
      }
    }

    const tbody = document.getElementById('modalTbodyChiTiet');
    if (tbody) {
      if (chiTiet.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-3">Không có dòng chênh lệch nào (Khớp 100%)</td></tr>';
      } else {
        tbody.innerHTML = chiTiet.map((item, idx) => {
          let loaiBadge = '';
          if (item.loaiLech === 'Thieu') {
            loaiBadge = '<span class="badge bg-danger">Thiếu máy (-1)</span>';
          } else if (item.loaiLech === 'Thua') {
            loaiBadge = '<span class="badge bg-warning text-dark">Thừa máy (+1)</span>';
          } else if (item.loaiLech === 'Bat thuong') {
            loaiBadge = '<span class="badge bg-info text-dark">Bất thường (0)</span>';
          } else {
            loaiBadge = '<span class="badge bg-success">Khớp</span>';
          }

          return `
            <tr>
              <td class="text-center">${idx + 1}</td>
              <td class="font-monospace fw-bold">${item.imei || '---'}</td>
              <td>${item.sanPham?.tenMay || 'Không rõ'}</td>
              <td class="text-center"><span class="badge bg-secondary">${item.trangThaiMayDB || '---'}</span></td>
              <td class="text-center">${loaiBadge}</td>
              <td class="text-center fw-bold">${item.soLuongDC > 0 ? `+${item.soLuongDC}` : item.soLuongDC}</td>
              <td class="small text-muted">${item.lyDo || ''}</td>
            </tr>
          `;
        }).join('');
      }
    }

    // Cập nhật các nút bấm trong Modal
    const btnPrint = document.getElementById('btnModalPrint');
    const btnApDung = document.getElementById('btnModalApDung');

    if (btnPrint) {
      btnPrint.onclick = () => inBienBanTheoId(bienBan._id);
    }
    if (btnApDung) {
      if (bienBan.trangThai === 'Da kiem ke') {
        btnApDung.style.display = 'inline-block';
        btnApDung.onclick = async () => {
          await apDungDieuChinhKho(bienBan._id);
          if (modalChiTietInstance) modalChiTietInstance.hide();
        };
      } else {
        btnApDung.style.display = 'none';
      }
    }

    if (modalChiTietInstance) {
      modalChiTietInstance.show();
    }
  } catch (err) {
    console.error('Lỗi xem chi tiết biên bản:', err);
    api.showToast(err.message || 'Lỗi khi tải chi tiết biên bản', 'danger');
  }
}

/**
 * Áp dụng điều chỉnh kho cho biên bản kiểm kê
 */
async function apDungDieuChinhKho(id) {
  if (!confirm('Bạn có chắc chắn muốn áp dụng điều chỉnh kho? Hành động này sẽ cập nhật tồn kho và trạng thái máy trong hệ thống!')) {
    return;
  }

  try {
    const res = await api.put(`/kiem-ke/${id}/ap-dung`);
    if (res && res.success) {
      api.showToast('Áp dụng điều chỉnh kho thành công!', 'success');
      await loadLichSuKiemKe(1);
      await handleKhoChange();
    } else {
      api.showToast(res.message || 'Lỗi khi áp dụng điều chỉnh', 'danger');
    }
  } catch (err) {
    console.error('Lỗi áp dụng điều chỉnh:', err);
    api.showToast(err.message || 'Lỗi khi áp dụng điều chỉnh kho', 'danger');
  }
}

/**
 * Hủy biên bản kiểm kê (Dành cho Quản lý)
 */
async function huyBienBanKiemKe(id) {
  if (!confirm('Bạn có chắc chắn muốn hủy biên bản kiểm kê này?')) {
    return;
  }

  try {
    const res = await api.put(`/kiem-ke/${id}/huy`);
    if (res && res.success) {
      api.showToast('Hủy biên bản kiểm kê thành công!', 'success');
      await loadLichSuKiemKe(1);
    } else {
      api.showToast(res.message || 'Lỗi khi hủy biên bản', 'danger');
    }
  } catch (err) {
    console.error('Lỗi hủy biên bản:', err);
    api.showToast(err.message || 'Lỗi khi hủy biên bản', 'danger');
  }
}

/**
 * In biên bản kiểm kê đang hiển thị trong phiên kiểm kê hiện tại
 */
function inBienBanHienTai() {
  if (!currentBienBanResult) {
    api.showToast('Chưa có dữ liệu biên bản vừa kiểm kê để in', 'warning');
    return;
  }

  const { bienBan = {}, danhSachKhop = [], danhSachThieu = [], danhSachThua = [], danhSachBatThuong = [], tongKet = {} } = currentBienBanResult;

  if (typeof window.inBienBanKiemKeChuan === 'function') {
    window.inBienBanKiemKeChuan({
      maBienBan: bienBan.maBienBan || 'BBKK-MOI',
      ngay: bienBan.ngay || new Date(),
      kho: bienBan.kho || {},
      nhanVien: bienBan.nhanVien || currentUser || {},
      tongLyThuyet: tongKet.tongLyThuyet || 0,
      tongThucTe: tongKet.tongThucTe || 0,
      tongKhop: tongKet.tongKhop || 0,
      tongLech: tongKet.tongLech || 0,
      tongThieu: tongKet.tongThieu || 0,
      tongThua: (tongKet.tongThua || 0) + (tongKet.tongBatThuong || 0),
      ghiChu: bienBan.ghiChu || '',
      danhSachChiTiet: [
        ...danhSachThieu,
        ...danhSachThua,
        ...danhSachBatThuong
      ]
    });
  } else {
    window.print();
  }
}

/**
 * Áp dụng điều chỉnh kho cho phiên kiểm kê hiện tại
 */
async function apDungDieuChinhHienTai() {
  if (!currentBienBanResult || !currentBienBanResult.bienBan || !currentBienBanResult.bienBan._id) {
    api.showToast('Chưa có biên bản kiểm kê để áp dụng', 'warning');
    return;
  }
  await apDungDieuChinhKho(currentBienBanResult.bienBan._id);
}

/**
 * In biên bản kiểm kê theo ID từ lịch sử
 */
async function inBienBanTheoId(id) {
  try {
    const res = await api.get(`/kiem-ke/${id}`);
    if (!res || !res.success || !res.data) {
      api.showToast('Không tìm thấy dữ liệu để in', 'warning');
      return;
    }

    const { bienBan = {}, chiTiet = [] } = res.data;

    if (typeof window.inBienBanKiemKeChuan === 'function') {
      window.inBienBanKiemKeChuan({
        maBienBan: bienBan.maBienBan || 'BBKK-' + bienBan._id.slice(-6),
        ngay: bienBan.ngay || bienBan.createdAt,
        kho: bienBan.kho || {},
        nhanVien: bienBan.nhanVien || currentUser || {},
        tongLyThuyet: bienBan.tongLyThuyet || 0,
        tongThucTe: bienBan.tongThucTe || 0,
        tongKhop: bienBan.tongKhop || 0,
        tongLech: bienBan.tongLech || 0,
        tongThieu: bienBan.tongThieu || 0,
        tongThua: bienBan.tongThua || 0,
        ghiChu: bienBan.ghiChu || '',
        danhSachChiTiet: chiTiet
      });
    } else {
      window.print();
    }
  } catch (err) {
    console.error('Lỗi in biên bản:', err);
    api.showToast('Không thể tải dữ liệu để in biên bản', 'danger');
  }
}
