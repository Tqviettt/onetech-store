let dsTraGop = [];
let selectedHopDongId = null;
let selectedKyHan = null;
let hoaDonList = [];

document.addEventListener('DOMContentLoaded', () => {
  loadDanhSachTraGop();
  
  // Realtime debounce search
  const searchInput = document.getElementById('searchTraGop');
  if (searchInput) {
    let timeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        loadDanhSachTraGop(1, e.target.value);
      }, 300);
    });
  }

  // Lắng nghe sự kiện tính toán tự động
  document.getElementById('soTienTraTruoc')?.addEventListener('input', calculateTraGop);
  document.getElementById('soKy')?.addEventListener('change', calculateTraGop);
  document.getElementById('hoadonSelect')?.addEventListener('change', calculateTraGop);
});

async function loadDanhSachTraGop(page = 1, search = '') {
  const trangThai = document.getElementById('filterTrangThai')?.value || '';
  const searchVal = search || document.getElementById('searchTraGop')?.value || '';
  
  const res = await api.get('/tra-gop', { page, limit: 10, search: searchVal, trangThai });
  const tbody = document.querySelector('#tableTraGop tbody');
  
  if (!res.success) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Lỗi tải dữ liệu</td></tr>`;
    return;
  }
  
  const { items, pagination, thongKe } = res.data;
  dsTraGop = items;
  
  // Update thống kê
  if (thongKe) {
    document.getElementById('statTotalHD').textContent = thongKe.tongHopDong || 0;
    document.getElementById('statActive').textContent = thongKe.dangTraGop || 0;
    document.getElementById('statCompleted').textContent = thongKe.hoanTat || 0;
    document.getElementById('statOverdue').textContent = '0'; // Tùy chọn backend trả về hoặc logic frontend
  }
  
  if (items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted"><i class="bi bi-inbox fs-3 d-block mb-1"></i> Chưa có dữ liệu trả góp</td></tr>`;
    document.getElementById('paginationContainer').innerHTML = '';
    return;
  }
  
  let html = '';
  items.forEach(hd => {
    const isHoanTat = hd.trangThaiDuyet === 'Hoàn tất';
    const khName = hd.hoaDon?.khachHang?.hoTen || 'Khách lẻ';
    const khPhone = hd.hoaDon?.khachHang?.sdt || '';
    
    html += `
      <tr>
        <td><span class="fw-semibold text-primary">#${hd.hoaDon?.soHD || 'N/A'}</span></td>
        <td>
          <div class="fw-medium">${khName}</div>
          <div class="small text-muted">${khPhone}</div>
        </td>
        <td>
          <div class="fw-bold">${(hd.soTienTraGop || 0).toLocaleString('vi-VN')} đ</div>
          <div class="small text-muted">Mỗi kỳ: ${(hd.soTienMoiKy || 0).toLocaleString('vi-VN')} đ</div>
        </td>
        <td>
          <span class="badge bg-secondary">${hd.soKy || 0} tháng</span>
        </td>
        <td>
          <div class="d-flex align-items-center gap-2">
            <div class="progress flex-grow-1" style="height: 6px;">
              <div class="progress-bar ${isHoanTat ? 'bg-success' : 'bg-primary'}" style="width: ${(hd.soKyDaThu / hd.soKy) * 100}%"></div>
            </div>
            <span class="small text-muted">${hd.soKyDaThu}/${hd.soKy}</span>
          </div>
        </td>
        <td>
          <span class="badge ${isHoanTat ? 'bg-success' : (hd.trangThaiDuyet === 'Hủy' ? 'bg-danger' : 'bg-warning text-dark')}">${hd.trangThaiDuyet}</span>
        </td>
        <td class="text-end">
          <button class="btn btn-sm btn-light" onclick="xemChiTiet('${hd._id}')"><i class="bi bi-eye"></i> Lịch thu</button>
        </td>
      </tr>
    `;
  });
  
  tbody.innerHTML = html;
  renderPagination(pagination, loadDanhSachTraGop);
}

// -----------------------------------
// TẠO HỢP ĐỒNG TRẢ GÓP MỚI
// -----------------------------------
async function openTaoHopDongModal() {
  document.getElementById('formTaoHopDong').reset();
  document.getElementById('calcTraGop').textContent = '0 đ';
  document.getElementById('calcMoiThang').textContent = '0 đ';
  document.getElementById('errTraTruoc').textContent = '';
  document.getElementById('hdInfo').textContent = '';
  
  // Tải danh sách hóa đơn khả dụng
  const res = await api.get('/hoa-don', { limit: 100, trangThai: 'Chờ thanh toán' }); // Chờ thanh toán vì trả góp chưa thanh toán hết
  if (res.success && res.data.items) {
    hoaDonList = res.data.items;
    const hoadonSelect = document.getElementById('hoadonSelect');
    hoadonSelect.innerHTML = '<option value="">-- Chọn Hóa Đơn --</option>';
    hoaDonList.forEach(hd => {
      hoadonSelect.innerHTML += `<option value="${hd._id}" data-tong="${hd.tongTien}">HĐ: ${hd.soHD} - KH: ${hd.khachHang?.hoTen || 'Khách lẻ'} - Tổng: ${hd.tongTien.toLocaleString('vi-VN')}đ</option>`;
    });
    if (window.enhanceSelect) window.enhanceSelect(hoadonSelect);
  }
  
  const modal = new bootstrap.Modal(document.getElementById('modalTaoHopDong'));
  modal.show();
}

function calculateTraGop() {
  const hdSelect = document.getElementById('hoadonSelect');
  const opt = hdSelect.options[hdSelect.selectedIndex];
  if (!opt || !opt.value) return;
  
  const tongTien = parseFloat(opt.getAttribute('data-tong')) || 0;
  const traTruoc = parseFloat((document.getElementById('soTienTraTruoc').value || '').replace(/[^\\d]/g, '')) || 0;
  const soKy = parseInt(document.getElementById('soKy').value) || 1;
  
  document.getElementById('hdInfo').innerHTML = `Tổng tiền hóa đơn: <strong>${tongTien.toLocaleString('vi-VN')} đ</strong>`;
  
  if (traTruoc >= tongTien) {
    document.getElementById('errTraTruoc').textContent = 'Số tiền trả trước phải nhỏ hơn tổng tiền hóa đơn!';
    document.getElementById('calcTraGop').textContent = '0 đ';
    document.getElementById('calcMoiThang').textContent = '0 đ';
    return;
  } else {
    document.getElementById('errTraTruoc').textContent = '';
  }
  
  const conLai = tongTien - traTruoc;
  const moiKy = Math.round(conLai / soKy);
  
  document.getElementById('calcTraGop').textContent = conLai.toLocaleString('vi-VN') + ' đ';
  document.getElementById('calcMoiThang').textContent = moiKy.toLocaleString('vi-VN') + ' đ';
}

async function submitTaoHopDong() {
  const hoaDonId = document.getElementById('hoadonSelect').value;
  const soTienTraTruoc = (document.getElementById('soTienTraTruoc').value || '').replace(/[^\\d]/g, '');
  const soKy = document.getElementById('soKy').value;
  const ghiChu = document.getElementById('ghiChu').value;
  
  if (!hoaDonId || !soTienTraTruoc || !soKy) {
    api.showToast('Vui lòng điền đủ thông tin!', 'warning');
    return;
  }
  
  const hdSelect = document.getElementById('hoadonSelect');
  const opt = hdSelect.options[hdSelect.selectedIndex];
  const tongTien = parseFloat(opt.getAttribute('data-tong')) || 0;
  
  if (parseFloat(soTienTraTruoc) >= tongTien) {
    api.showToast('Số tiền trả trước không hợp lệ!', 'danger');
    return;
  }
  
  const payload = { hoaDonId, soTienTraTruoc: parseFloat(soTienTraTruoc), soKy: parseInt(soKy), ghiChu };
  
  const res = await api.post('/tra-gop', payload);
  if (res.success) {
    bootstrap.Modal.getInstance(document.getElementById('modalTaoHopDong')).hide();
    loadDanhSachTraGop();
  }
}

// -----------------------------------
// XEM CHI TIẾT & LỊCH THU
// -----------------------------------
async function xemChiTiet(id) {
  selectedHopDongId = id;
  const modal = new bootstrap.Modal(document.getElementById('modalChiTiet'));
  modal.show();
  
  const body = document.getElementById('chiTietBody');
  body.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary" role="status"></div></div>';
  
  const [resChiTiet, resLichThu] = await Promise.all([
    api.get(`/tra-gop/${id}`),
    api.get(`/tra-gop/${id}/lich-thu`)
  ]);
  
  if (!resChiTiet.success || !resLichThu.success) {
    body.innerHTML = '<div class="alert alert-danger">Không tải được thông tin hợp đồng!</div>';
    return;
  }
  
  const hd = resChiTiet.data;
  const lichThu = resLichThu.data.lichThu;
  
  let html = `
    <div class="row mb-4">
      <div class="col-md-6">
        <h6 class="fw-bold text-primary mb-3"><i class="bi bi-info-circle me-1"></i> Thông Tin Hợp Đồng</h6>
        <table class="table table-sm table-borderless small">
          <tr><td class="text-muted" width="120">Hóa Đơn:</td><td class="fw-semibold">#${hd.hoaDon?.soHD}</td></tr>
          <tr><td class="text-muted">Khách Hàng:</td><td class="fw-semibold">${hd.hoaDon?.khachHang?.hoTen || 'Khách lẻ'}</td></tr>
          <tr><td class="text-muted">Số ĐT:</td><td>${hd.hoaDon?.khachHang?.sdt || ''}</td></tr>
          <tr><td class="text-muted">Ngày Lập:</td><td>${new Date(hd.createdAt).toLocaleDateString('vi-VN')}</td></tr>
          <tr><td class="text-muted">Trạng Thái:</td><td><span class="badge bg-primary">${hd.trangThaiDuyet}</span></td></tr>
        </table>
      </div>
      <div class="col-md-6">
        <h6 class="fw-bold text-primary mb-3"><i class="bi bi-cash-coin me-1"></i> Thông Tin Tài Chính</h6>
        <table class="table table-sm table-borderless small">
          <tr><td class="text-muted" width="120">Tổng Tiền Máy:</td><td class="text-end fw-semibold">${(hd.hoaDon?.tongTien || 0).toLocaleString('vi-VN')} đ</td></tr>
          <tr><td class="text-muted">Đã Trả Trước:</td><td class="text-end text-success">${(hd.soTienTraTruoc || 0).toLocaleString('vi-VN')} đ</td></tr>
          <tr><td class="text-muted">Cần Trả Góp:</td><td class="text-end text-danger fw-bold">${(hd.soTienTraGop || 0).toLocaleString('vi-VN')} đ</td></tr>
          <tr><td class="text-muted">Số Kỳ Hạn:</td><td class="text-end fw-semibold">${hd.soKy} tháng</td></tr>
          <tr><td class="text-muted">Đã Thu:</td><td class="text-end">${hd.soKyDaThu}/${hd.soKy} kỳ</td></tr>
        </table>
      </div>
    </div>
    
    <h6 class="fw-bold text-primary mb-3"><i class="bi bi-calendar-check me-1"></i> Lịch Thu Kỳ Hạn</h6>
    <div class="table-responsive">
      <table class="table table-bordered table-hover text-center align-middle small">
        <thead class="table-light">
          <tr>
            <th>Kỳ Số</th>
            <th>Hạn Thu</th>
            <th>Số Tiền</th>
            <th>Trạng Thái</th>
            <th>Thao Tác</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  lichThu.forEach(ky => {
    const kyNum = ky.kyThu || ky.ky;
    const isDaThu = ky.daThu || ky.trangThai === 'Đã thu' || ky.trangThai === 'Da thu';
    const isQuaHan = ky.trangThai === 'Quá hạn' || ky.trangThai === 'Qua han';
    
    let badge = 'bg-warning text-dark';
    let textHienThi = ky.trangThaiText || 'Chưa thu';
    if (isDaThu) {
      badge = 'bg-success';
      textHienThi = 'Đã thu';
    } else if (isQuaHan) {
      badge = 'bg-danger';
      textHienThi = 'Quá hạn';
    }
    
    const isKyTiepTheo = !isDaThu && kyNum === (hd.soKyDaThu + 1);
    
    html += `
      <tr class="${isKyTiepTheo ? 'table-primary bg-opacity-10' : ''}">
        <td class="fw-bold">Kỳ ${kyNum}</td>
        <td>${new Date(ky.ngayDenHan).toLocaleDateString('vi-VN')}</td>
        <td class="text-danger fw-bold">${(ky.soTien || 0).toLocaleString('vi-VN')} đ</td>
        <td><span class="badge ${badge}">${escapeHtml(textHienThi)}</span></td>
        <td>
          ${isKyTiepTheo ? `<button class="btn btn-sm btn-success py-0" onclick="openThuTienModal(${kyNum}, ${ky.soTien})"><i class="bi bi-check2-circle"></i> Thu Ngay</button>` : ''}
          ${isDaThu ? `<i class="bi bi-check text-success fs-5"></i>` : ''}
        </td>
      </tr>
    `;
  });
  
  html += `</tbody></table></div>`;
  body.innerHTML = html;
}

function openThuTienModal(kySo, soTien) {
  selectedKyHan = kySo;
  document.getElementById('thuKySo').textContent = `Kỳ ${kySo}`;
  document.getElementById('thuSoTien').textContent = soTien.toLocaleString('vi-VN') + ' VNĐ';
  document.getElementById('thuGhiChu').value = '';
  document.getElementById('thuHinhThuc').value = 'Tiền mặt';
  
  const modal = new bootstrap.Modal(document.getElementById('modalThuTien'));
  modal.show();
}

async function submitThuTien() {
  if (!selectedHopDongId) return;
  
  const hinhThuc = document.getElementById('thuHinhThuc').value;
  const ghiChu = document.getElementById('thuGhiChu').value;
  
  const res = await api.post(`/tra-gop/${selectedHopDongId}/thu-ky`, { hinhThuc, ghiChu });
  if (res.success) {
    bootstrap.Modal.getInstance(document.getElementById('modalThuTien')).hide();
    xemChiTiet(selectedHopDongId);
    loadDanhSachTraGop();
  }
}

// -----------------------------------
// Pagination Helper (Tương tự các file khác)
// -----------------------------------
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
