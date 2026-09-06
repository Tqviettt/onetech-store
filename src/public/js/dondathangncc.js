let dsDon = [];
let sanPhamList = [];
let currentDonId = null;

document.addEventListener('DOMContentLoaded', () => {
  loadDanhSachDon();
  
  const searchInput = document.getElementById('searchDon');
  if (searchInput) {
    let timeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        loadDanhSachDon(1, e.target.value);
      }, 300);
    });
  }
});

async function loadDanhSachDon(page = 1, search = '') {
  const trangThai = document.getElementById('filterTrangThai')?.value || '';
  const searchVal = (search !== undefined && search !== '') ? search : (document.getElementById('searchDon')?.value || '');
  
  const res = await api.get('/don-dat-hang-ncc', { page, limit: 10, search: searchVal, trangThai });
  const tbody = document.querySelector('#tableDonNCC tbody');
  if (!tbody) return;
  
  if (!res.success) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Lỗi tải dữ liệu: ${escapeHtml(res.message || '')}</td></tr>`;
    return;
  }
  
  const dataObj = res.data || res;
  const listDon = dataObj.donDatHangNCCs || dataObj.list || dataObj.items || (Array.isArray(dataObj) ? dataObj : []);
  const stats = dataObj.stats || res.stats || {};
  const pagination = dataObj.pagination || res.pagination;
  dsDon = listDon;
  
  if (stats.choDuyet !== undefined && document.getElementById('statChoDuyet')) document.getElementById('statChoDuyet').textContent = stats.choDuyet;
  if (stats.dangGiao !== undefined && document.getElementById('statDangGiao')) document.getElementById('statDangGiao').textContent = stats.dangGiao;
  if (stats.hoanThanh !== undefined && document.getElementById('statHoanThanh')) document.getElementById('statHoanThanh').textContent = stats.hoanThanh;
  if (stats.huy !== undefined && document.getElementById('statHuy')) document.getElementById('statHuy').textContent = stats.huy;
  
  if (listDon.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted"><i class="bi bi-inbox fs-3 d-block mb-1"></i> Chưa có đơn đặt hàng nào</td></tr>`;
    const pagContainer = document.getElementById('paginationContainer');
    if (pagContainer) pagContainer.innerHTML = '';
    return;
  }
  
  let html = '';
  listDon.forEach(don => {
    let badgeClass = 'bg-secondary';
    let textTrangThai = don.trangThai;
    switch (don.trangThai) {
      case 'Cho duyet': badgeClass = 'bg-warning text-dark'; textTrangThai = 'Chờ duyệt'; break;
      case 'Da duyet': badgeClass = 'bg-primary'; textTrangThai = 'Đã duyệt'; break;
      case 'Dang giao': badgeClass = 'bg-info'; textTrangThai = 'Đang giao'; break;
      case 'Da nhan hang': badgeClass = 'bg-success'; textTrangThai = 'Đã nhận hàng'; break;
      case 'Da huy': badgeClass = 'bg-danger'; textTrangThai = 'Đã hủy'; break;
    }

    const ngayGiao = don.ngayDuKienGiao || don.ngayHenGiao;
    const strNgayGiao = ngayGiao ? new Date(ngayGiao).toLocaleDateString('vi-VN') : '---';
    const maHienThi = don.maDDH || (don._id ? don._id.substring(don._id.length - 6).toUpperCase() : 'DDH');
    const tenNCC = don.nhaCungCap ? (don.nhaCungCap.tenNCC || don.nhaCungCap) : 'N/A';
    const tenNV = don.nhanVien ? (don.nhanVien.hoTen || don.nhanVien.tenDangNhap) : (don.nguoiLap?.hoTen || 'Hệ thống');
    
    html += `
      <tr>
        <td><span class="fw-bold text-primary">${escapeHtml(maHienThi)}</span></td>
        <td>
          <div class="fw-semibold">${escapeHtml(tenNCC)}</div>
        </td>
        <td>${escapeHtml(tenNV)}</td>
        <td>${strNgayGiao}</td>
        <td class="text-danger fw-bold">${(don.tongTien || 0).toLocaleString('vi-VN')} đ</td>
        <td><span class="badge ${badgeClass}">${textTrangThai}</span></td>
        <td class="text-end">
          <button class="btn btn-sm btn-light" onclick="xemChiTiet('${don._id}')"><i class="bi bi-eye"></i> Chi tiết</button>
        </td>
      </tr>
    `;
  });
  
  tbody.innerHTML = html;
  if (typeof renderPagination === 'function') {
    renderPagination(pagination, loadDanhSachDon);
  }
}

function filterByStatus(trangThai) {
  const select = document.getElementById('filterTrangThai');
  if (select) {
    select.value = trangThai;
    loadDanhSachDon(1);
  }
}

// -----------------------------------
// TẠO ĐƠN MỚI
// -----------------------------------
async function openTaoDonModal() {
  document.getElementById('ngayHenGiao').value = '';
  if (document.getElementById('diaChiGiao')) document.getElementById('diaChiGiao').value = '';
  if (document.getElementById('sdtNguoiGiao')) document.getElementById('sdtNguoiGiao').value = '';
  if (document.getElementById('cccdNguoiGiao')) document.getElementById('cccdNguoiGiao').value = '';
  document.getElementById('ghiChu').value = '';
  document.querySelector('#tableChiTietLap tbody').innerHTML = '';
  updateTongTienLapDon();
  
  const [resNCC, resSP] = await Promise.all([
    api.get('/nha-cung-cap', { limit: 100 }),
    api.get('/san-pham', { limit: 1000 })
  ]);
  
  if (resNCC.success) {
    const nccSelect = document.getElementById('nccSelect');
    nccSelect.innerHTML = '<option value="">-- Chọn NCC --</option>';
    const nccList = Array.isArray(resNCC.data) ? resNCC.data : (resNCC.data.nhaCungCaps || resNCC.data.items || []);
    nccList.forEach(ncc => {
      nccSelect.innerHTML += `<option value="${ncc._id}">${ncc.tenNCC}</option>`;
    });
    if (window.enhanceSelect) window.enhanceSelect(nccSelect);
  }
  
  if (resSP.success) {
    sanPhamList = resSP.data.sanPhams || resSP.data.items || (Array.isArray(resSP.data) ? resSP.data : []);
  }
  
  addDongChiTiet();
  const modal = new bootstrap.Modal(document.getElementById('modalTaoDon'));
  modal.show();
}

function addDongChiTiet() {
  const tbody = document.querySelector('#tableChiTietLap tbody');
  const tr = document.createElement('tr');
  
  let spOptions = '<option value="">-- Chọn Model --</option>';
  sanPhamList.forEach(sp => {
    spOptions += `<option value="${sp._id}" data-gia="${sp.giaGoc || 0}">${sp.tenMay}</option>`;
  });
  
  tr.innerHTML = `
    <td>
      <select class="form-select form-select-sm sp-select" onchange="calcDong(this)">
        ${spOptions}
      </select>
    </td>
    <td><input type="text" class="form-control form-control-sm mau-sac-input" placeholder="Ví dụ: Đen, Titan..."></td>
    <td><input type="number" class="form-control form-control-sm sl-input" min="1" value="1" oninput="calcDong(this)"></td>
    <td><input type="text" class="form-control form-control-sm gia-input" placeholder="0" oninput="maskCurrencyInput(this); calcDong(this)"></td>
    <td class="text-end fw-bold text-danger dong-thanhtien">0 đ</td>
    <td><button class="btn btn-sm btn-outline-danger" onclick="this.closest('tr').remove(); updateTongTienLapDon()"><i class="bi bi-trash"></i></button></td>
  `;
  
  tbody.appendChild(tr);
  if (window.enhanceSelect) {
    const newSelect = tr.querySelector('.sp-select');
    window.enhanceSelect(newSelect);
  }
}

function calcDong(el) {
  const tr = el.closest('tr');
  const sl = parseInt(tr.querySelector('.sl-input').value) || 0;
  
  if (el.classList.contains('sp-select')) {
    const opt = el.options[el.selectedIndex];
    if (opt && opt.value) {
      const giaDuKien = parseFloat(opt.getAttribute('data-gia')) || 0;
      const giaInput = tr.querySelector('.gia-input');
      if (giaInput) {
        giaInput.value = giaDuKien > 0 ? Number(giaDuKien).toLocaleString('vi-VN') : '0';
      }
    }
  }
  
  const giaInput = tr.querySelector('.gia-input');
  const gia = giaInput ? parseCurrencyValue(giaInput.value) : 0;
  tr.querySelector('.dong-thanhtien').textContent = (sl * gia).toLocaleString('vi-VN') + ' đ';
  
  updateTongTienLapDon();
}

function updateTongTienLapDon() {
  let tong = 0;
  document.querySelectorAll('#tableChiTietLap tbody tr').forEach(tr => {
    const sl = parseInt(tr.querySelector('.sl-input').value) || 0;
    const giaInput = tr.querySelector('.gia-input');
    const gia = giaInput ? parseCurrencyValue(giaInput.value) : 0;
    tong += sl * gia;
  });
  document.getElementById('tongTienDon').textContent = tong.toLocaleString('vi-VN') + ' đ';
}

async function submitTaoDon(btn) {
  const nccId = document.getElementById('nccSelect')?.value;
  let ngayHenGiao = document.getElementById('ngayHenGiao')?.value;
  const diaChiGiao = document.getElementById('diaChiGiao')?.value || '';
  const sdtNguoiGiao = document.getElementById('sdtNguoiGiao')?.value || '';
  const rawCCCD = document.getElementById('cccdNguoiGiao')?.value.trim() || '';
  const cccdNguoiGiao = rawCCCD.replace(/\D/g, '');
  const ghiChu = document.getElementById('ghiChu')?.value || '';
  
  if (!nccId) {
    api.showToast('Vui lòng chọn Nhà Cung Cấp!', 'warning');
    return;
  }

  // Tự động lấy ngày hôm nay nếu chưa chọn ngày hẹn giao
  if (!ngayHenGiao) {
    const today = new Date().toISOString().split('T')[0];
    ngayHenGiao = today;
    const ngayInput = document.getElementById('ngayHenGiao');
    if (ngayInput) ngayInput.value = today;
  }

  // Kiểm tra CCCD: Nếu có nhập thì phải đủ 12 chữ số
  if (cccdNguoiGiao && cccdNguoiGiao.length !== 12) {
    api.showToast('Nếu nhập CCCD người giao, vui lòng gõ đúng 12 chữ số!', 'warning');
    return;
  }
  
  const chiTiet = [];
  document.querySelectorAll('#tableChiTietLap tbody tr').forEach(tr => {
    const spSelect = tr.querySelector('.sp-select');
    const spId = spSelect ? spSelect.value : '';
    const mauSac = tr.querySelector('.mau-sac-input')?.value || '';
    let sl = parseInt(tr.querySelector('.sl-input')?.value) || 0;
    if (sl < 1) sl = 1;
    const giaInput = tr.querySelector('.gia-input');
    const gia = giaInput ? parseCurrencyValue(giaInput.value) : 0;
    
    if (spId) {
      chiTiet.push({ sanPham: spId, mauSac, soLuong: sl, donGiaNhap: gia });
    }
  });
  
  if (chiTiet.length === 0) {
    api.showToast('Vui lòng chọn ít nhất 1 Sản phẩm (Model) trong danh sách', 'warning');
    return;
  }
  
  const submitBtn = btn || document.querySelector('#modalTaoDon .modal-footer button.btn-primary');
  let originalBtnHtml = '';
  if (submitBtn) {
    originalBtnHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Đang lưu đơn...';
  }

  try {
    const payload = { nhaCungCapId: nccId, ngayHenGiao, diaChiGiao, sdtNguoiGiao, cccdNguoiGiao, ghiChu, chiTiet };
    const res = await api.post('/don-dat-hang-ncc', payload);
    
    if (res.success) {
      api.showToast('Tạo đơn đặt hàng thành công! Đơn ở trạng thái Chờ duyệt.', 'success');
      const modalEl = document.getElementById('modalTaoDon');
      const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
      if (bsModal) bsModal.hide();
      
      // Reset bộ lọc về Tất cả để hiển thị ngay đơn vừa tạo ở đầu danh sách
      const selectTrangThai = document.getElementById('filterTrangThai');
      if (selectTrangThai) {
        selectTrangThai.value = '';
      }
      const searchInput = document.getElementById('searchDon');
      if (searchInput) searchInput.value = '';

      await loadDanhSachDon(1);
    } else {
      api.showToast(res.message || 'Lỗi tạo đơn đặt hàng', 'danger');
    }
  } catch (err) {
    console.error('Lỗi khi tạo đơn:', err);
    api.showToast('Đã xảy ra lỗi khi kết nối tới máy chủ', 'danger');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
    }
  }
}

// -----------------------------------
// QUICK ADD NHÀ CUNG CẤP & SẢN PHẨM MỚI
// -----------------------------------
function openQuickAddNCC() {
  const form = document.getElementById('formQuickNCC');
  if (form) form.reset();
  const modalEl = document.getElementById('modalQuickAddNCC');
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
}

async function handleSaveQuickNCC(e) {
  if (e) e.preventDefault();
  const tenNCC = document.getElementById('quickTenNCC').value.trim();
  const sdt = document.getElementById('quickSdtNCC').value.trim();
  const diaChi = document.getElementById('quickDiaChiNCC').value.trim();

  if (!tenNCC) {
    api.showToast('Vui lòng nhập tên nhà cung cấp', 'warning');
    return;
  }

  const res = await api.post('/nha-cung-cap', { tenNCC, sdt, diaChi });
  if (res.success && res.data) {
    api.showToast('Thêm Nhà Cung Cấp thành công!', 'success');
    const modalEl = document.getElementById('modalQuickAddNCC');
    const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
    if (bsModal) bsModal.hide();

    const createdNcc = res.data.nhaCungCap || res.data;
    const createdId = createdNcc._id || res.data._id;

    // Reload danh sách NCC
    const resNCC = await api.get('/nha-cung-cap', { limit: 100 });
    if (resNCC.success) {
      const nccSelect = document.getElementById('nccSelect');
      const nccList = Array.isArray(resNCC.data) ? resNCC.data : (resNCC.data.nhaCungCaps || resNCC.data.items || []);
      nccSelect.innerHTML = '<option value="">-- Chọn NCC --</option>' + 
        nccList.map(n => `<option value="${n._id}">${n.tenNCC}</option>`).join('');
      if (createdId) nccSelect.value = createdId;
    }
  } else {
    api.showToast(res.message || 'Lỗi thêm nhà cung cấp', 'danger');
  }
}

async function openQuickAddSP() {
  const form = document.getElementById('formQuickSP');
  if (form) form.reset();

  const resDm = await api.get('/danh-muc');
  if (resDm.success) {
    const dmList = Array.isArray(resDm.data) ? resDm.data : (resDm.data.danhMucs || resDm.data.items || []);
    const selectDm = document.getElementById('quickDanhMuc');
    if (selectDm) {
      selectDm.innerHTML = dmList.map(d => `<option value="${d._id}">${d.tenDanhMuc}</option>`).join('');
      // Tự động mặc định chọn danh mục "Điện thoại thông minh (Smartphones)"
      const defaultPhoneCategory = dmList.find(d => 
        (d.tenDanhMuc || '').toLowerCase().includes('điện thoại') || 
        (d.tenDanhMuc || '').toLowerCase().includes('smartphone')
      );
      if (defaultPhoneCategory) {
        selectDm.value = defaultPhoneCategory._id;
      } else if (dmList.length > 0) {
        selectDm.value = dmList[0]._id;
      }
    }
  }

  const modalEl = document.getElementById('modalQuickAddSP');
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
}

async function handleSaveQuickSP(e) {
  if (e) e.preventDefault();
  const tenMay = document.getElementById('quickTenMay').value.trim();
  const hang = document.getElementById('quickHang').value.trim();
  const danhMuc = document.getElementById('quickDanhMuc').value;
  const giaBanInput = document.getElementById('quickGiaBan');
  const giaBan = giaBanInput ? parseCurrencyValue(giaBanInput.value) : 0;
  const giaGocInput = document.getElementById('quickGiaGoc');
  const giaGoc = giaGocInput ? parseCurrencyValue(giaGocInput.value) : 0;

  if (!tenMay || !danhMuc) {
    api.showToast('Vui lòng điền Tên máy và Chọn danh mục', 'warning');
    return;
  }
  if (giaBan <= giaGoc) {
    api.showToast('Giá bán niêm yết phải lớn hơn Giá gốc', 'warning');
    if (giaBanInput) giaBanInput.focus();
    return;
  }

  const res = await api.post('/san-pham', { tenMay, hang, danhMuc, giaBan, giaGoc });
  if (res.success && res.data) {
    api.showToast('Thêm Model Sản Phẩm mới thành công!', 'success');
    
    // Tự động thoát khỏi Modal thêm SP mới
    const modalEl = document.getElementById('modalQuickAddSP');
    const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
    if (bsModal) bsModal.hide();

    const newSp = res.data.sanPham || res.data;

    // Reload sản phẩm list
    const resSP = await api.get('/san-pham', { limit: 1000 });
    if (resSP.success) {
      sanPhamList = resSP.data.sanPhams || resSP.data.items || (Array.isArray(resSP.data) ? resSP.data : []);
    }

    // Cập nhật các dropdown chọn SP trong bảng
    document.querySelectorAll('#tableChiTietLap .sp-select').forEach(sel => {
      const currentVal = sel.value;
      let spOptions = '<option value="">-- Chọn Model --</option>';
      sanPhamList.forEach(sp => {
        spOptions += `<option value="${sp._id}" data-gia="${sp.giaGoc || 0}">${sp.tenMay}</option>`;
      });
      sel.innerHTML = spOptions;
      if (currentVal) sel.value = currentVal;
    });

    // Auto chọn SP vừa tạo cho dòng cuối
    const tbody = document.querySelector('#tableChiTietLap tbody');
    if (tbody && tbody.lastElementChild) {
      const lastSelect = tbody.lastElementChild.querySelector('.sp-select');
      if (lastSelect && newSp._id) {
        lastSelect.value = newSp._id;
        calcDong(lastSelect);
      }
    }
  } else {
    api.showToast(res.message || 'Lỗi thêm sản phẩm', 'danger');
  }
}

// -----------------------------------
// XEM CHI TIẾT ĐƠN HÀNG
// -----------------------------------
async function xemChiTiet(id) {
  currentDonId = id;
  const modal = new bootstrap.Modal(document.getElementById('modalChiTiet'));
  modal.show();
  
  const body = document.getElementById('chiTietBody');
  const footer = document.getElementById('chiTietFooter');
  body.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary"></div></div>';
  footer.innerHTML = '';
  
  const res = await api.get(`/don-dat-hang-ncc/${id}`);
  if (!res.success) {
    body.innerHTML = '<div class="alert alert-danger">Không tải được dữ liệu đơn hàng!</div>';
    return;
  }
  
  const don = res.data.donDatHangNCC || res.data;
  const chiTietList = res.data.chiTiet || don.chiTiet || [];
  const isQuanLy = ['Quản lý', 'Admin'].includes(currentUser?.vaiTro);
  
  let html = `
    <div class="row mb-4">
      <div class="col-md-6">
        <h6 class="fw-bold text-primary mb-3"><i class="bi bi-info-circle me-1"></i> Thông Tin Đơn</h6>
        <table class="table table-sm table-borderless small mb-0">
          <tr><td class="text-muted" width="130">Mã Đơn:</td><td class="fw-bold text-primary">#${don._id}</td></tr>
          <tr><td class="text-muted">Nhà Cung Cấp:</td><td class="fw-semibold">${don.nhaCungCap?.tenNCC || 'N/A'}</td></tr>
          <tr><td class="text-muted">Người Lập:</td><td>${don.nhanVien?.hoTen || don.nguoiLap?.hoTen || 'N/A'}</td></tr>
          <tr><td class="text-muted">Ngày Lập:</td><td>${new Date(don.createdAt).toLocaleString('vi-VN')}</td></tr>
          <tr><td class="text-muted">Ngày Hẹn Giao:</td><td>${don.ngayDuKienGiao || don.ngayHenGiao ? new Date(don.ngayDuKienGiao || don.ngayHenGiao).toLocaleDateString('vi-VN') : 'N/A'}</td></tr>
          <tr><td class="text-muted">Địa Chỉ Giao:</td><td class="fw-semibold">${escapeHtml(don.diaChiGiao || 'Chưa nhập')}</td></tr>
          <tr><td class="text-muted">SĐT Người Giao:</td><td class="fw-semibold">${escapeHtml(don.sdtNguoiGiao || 'Chưa nhập')}</td></tr>
          <tr><td class="text-muted">CCCD Người Giao:</td><td class="fw-semibold">${escapeHtml(don.cccdNguoiGiao || 'Chưa nhập')}</td></tr>
          <tr><td class="text-muted">Ghi Chú:</td><td>${escapeHtml(don.ghiChu || '')}</td></tr>
        </table>
      </div>
      <div class="col-md-6">
        <div class="bg-light p-3 rounded h-100 border">
          <div class="text-muted small fw-semibold">Trạng Thái Hiện Tại</div>
          <h5 class="fw-bold mt-1 text-primary">${don.trangThai}</h5>
          
          <div class="mt-3 text-muted small fw-semibold">Tổng Tiền Đơn Hàng</div>
          <h4 class="fw-bold text-danger mt-1 mb-0">${(don.tongTien || 0).toLocaleString('vi-VN')} đ</h4>
        </div>
      </div>
    </div>
    
    <h6 class="fw-bold text-primary mb-3"><i class="bi bi-box-seam me-1"></i> Chi Tiết Hàng Hóa</h6>
    <div class="table-responsive">
      <table class="table table-bordered table-hover text-center align-middle small mb-0">
        <thead class="table-light">
          <tr>
            <th width="40">#</th>
            <th class="text-start">Tên Sản Phẩm</th>
            <th width="120">Màu Sắc</th>
            <th width="90">Số Lượng</th>
            <th width="130">Đơn Giá Nhập</th>
            <th width="130">Thành Tiền</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  chiTietList.forEach((ct, index) => {
    const spTen = ct.sanPham?.tenMay || 'N/A';
    const donGia = ct.donGiaDuKien !== undefined ? ct.donGiaDuKien : (ct.donGiaNhap || 0);
    const mau = ct.mauSac || 'N/A';
    html += `
      <tr>
        <td>${index + 1}</td>
        <td class="text-start fw-semibold">${spTen}</td>
        <td class="text-muted">${mau}</td>
        <td class="fw-bold">${ct.soLuong}</td>
        <td>${donGia.toLocaleString('vi-VN')} đ</td>
        <td class="text-danger fw-bold">${(ct.soLuong * donGia).toLocaleString('vi-VN')} đ</td>
      </tr>
    `;
  });
  html += `</tbody></table></div>`;
  body.innerHTML = html;
  
  // Nút hành động
  let footerHtml = '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>';
  
  if (don.trangThai === 'Cho duyet' && isQuanLy) {
    footerHtml += `
      <button type="button" class="btn btn-danger" onclick="updateTrangThai('${don._id}', 'Da huy')"><i class="bi bi-x-circle"></i> Từ Chối</button>
      <button type="button" class="btn btn-success" onclick="duyetDon('${don._id}')"><i class="bi bi-check-circle"></i> Duyệt Đơn</button>
    `;
  } else if (don.trangThai === 'Da duyet' && isQuanLy) {
    footerHtml += `
      <button type="button" class="btn btn-info text-white" onclick="updateTrangThai('${don._id}', 'Dang giao')"><i class="bi bi-truck"></i> Chuyển Đang Giao</button>
    `;
  }
  // Việc nhập kho hoàn thành đơn sẽ do thủ kho nhập kho bằng phiếu nhập và chọn đơn NCC.
  
  footer.innerHTML = footerHtml;
}

async function duyetDon(id) {
  if (!confirm('Xác nhận duyệt đơn đặt hàng này?')) return;
  const res = await api.put(`/don-dat-hang-ncc/${id}/duyet`);
  if (res.success) {
    xemChiTiet(id);
    loadDanhSachDon();
  }
}

async function updateTrangThai(id, trangThaiMoi) {
  if (!confirm(`Xác nhận chuyển đơn sang trạng thái: ${trangThaiMoi}?`)) return;
  const res = await api.put(`/don-dat-hang-ncc/${id}/trang-thai`, { trangThai: trangThaiMoi });
  if (res.success) {
    xemChiTiet(id);
    loadDanhSachDon();
  }
}

function renderPagination(pagination, loadFunc) {
  const container = document.getElementById('paginationContainer');
  if (!container || !pagination || pagination.totalPages <= 1) {
    if (container) container.innerHTML = '';
    return;
  }

  const { page, totalPages } = pagination;
  let html = '<nav><ul class="pagination pagination-sm justify-content-end mb-0">';
  
  html += `<li class="page-item ${page <= 1 ? 'disabled' : ''}"><a class="page-link" href="#" onclick="event.preventDefault(); ${loadFunc.name}(${page - 1})">‹</a></li>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<li class="page-item ${i === page ? 'active' : ''}"><a class="page-link" href="#" onclick="event.preventDefault(); ${loadFunc.name}(${i})">${i}</a></li>`;
  }
  html += `<li class="page-item ${page >= totalPages ? 'disabled' : ''}"><a class="page-link" href="#" onclick="event.preventDefault(); ${loadFunc.name}(${page + 1})">›</a></li>`;
  
  html += '</ul></nav>';
  container.innerHTML = html;
}
