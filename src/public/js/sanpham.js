/**
 * Module xử lý chức năng Sản phẩm phía Client
 */

document.addEventListener('DOMContentLoaded', async () => {
  const path = window.location.pathname;

  if (path.includes('san-pham/index.html') || path.endsWith('/san-pham/')) {
    initSanPhamIndex();
  } else if (path.includes('san-pham/form.html')) {
    initSanPhamForm();
  } else if (path.includes('san-pham/detail.html')) {
    initSanPhamDetail();
  }
});

/**
 * Trang danh sách sản phẩm
 */
async function initSanPhamIndex() {
  const filterForm = document.getElementById('filterForm');
  const btnReset = document.getElementById('btnResetFilter');

  await loadSanPhamList();

  if (filterForm) {
    filterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      loadSanPhamList();
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      document.getElementById('filterSearch').value = '';
      document.getElementById('filterDanhMuc').value = '';
      document.getElementById('filterHang').value = '';
      loadSanPhamList();
    });
  }
}

async function loadSanPhamList() {
  const search = document.getElementById('filterSearch')?.value.trim() || '';
  const danhMucId = document.getElementById('filterDanhMuc')?.value || '';
  const hang = document.getElementById('filterHang')?.value || '';

  const res = await api.get('/san-pham', { search, danhMucId, hang });
  if (!res.success) {
    showToast(res.message || 'Không thể tải danh sách sản phẩm', 'danger');
    return;
  }

  const sanPhams = Array.isArray(res.data) ? res.data : (res.sanPhams || res.data?.sanPhams || res.data?.data || []);
  const danhMucs = res.danhMucs || res.data?.danhMucs || [];
  const allHangs = res.allHangs || res.data?.allHangs || [];

  // 1. Cập nhật các ô lọc (nếu chưa có option)
  const selectDanhMuc = document.getElementById('filterDanhMuc');
  if (selectDanhMuc && selectDanhMuc.options.length <= 1 && danhMucs && danhMucs.length > 0) {
    danhMucs.forEach(dm => {
      const opt = document.createElement('option');
      opt.value = dm._id;
      opt.textContent = dm.tenDanhMuc;
      selectDanhMuc.appendChild(opt);
    });
  }

  const selectHang = document.getElementById('filterHang');
  if (selectHang && selectHang.options.length <= 1 && allHangs && allHangs.length > 0) {
    allHangs.forEach(h => {
      const opt = document.createElement('option');
      opt.value = h;
      opt.textContent = h;
      selectHang.appendChild(opt);
    });
  }

  // 2. Render danh sách sản phẩm
  const tbody = document.getElementById('tableSanPhamBody');
  if (!tbody) return;

  if (sanPhams && sanPhams.length > 0) {
    const isManagerOrStorekeeper = currentUser && ['Quản lý', 'Thủ kho'].includes(currentUser.vaiTro);
    const isManager = currentUser && currentUser.vaiTro === 'Quản lý';

    tbody.innerHTML = sanPhams.map(sp => {
      const qtyCon = sp.soLuongTon !== undefined ? sp.soLuongTon : (sp.soLuongCon !== undefined ? sp.soLuongCon : 0);
      const qtyTong = sp.tongImei !== undefined ? sp.tongImei : qtyCon;

      return `
      <tr>
        <td>
          <a href="/san-pham/detail.html?id=${sp._id}" class="fw-bold text-decoration-none text-dark">
            ${escapeHtml(sp.tenMay)}
          </a>
          ${sp.moTa ? `<div class="text-muted small text-truncate" style="max-width: 280px;">${escapeHtml(sp.moTa)}</div>` : ''}
        </td>
        <td><span class="badge bg-light text-secondary border">${sp.danhMuc ? escapeHtml(sp.danhMuc.tenDanhMuc || sp.danhMuc) : 'Chưa phân loại'}</span></td>
        <td><span class="badge bg-primary-subtle text-primary border border-primary-subtle">${escapeHtml(sp.hang || 'N/A')}</span></td>
        <td class="fw-bold text-primary">${formatCurrency(sp.giaBan)}</td>
        <td><span class="badge bg-info-subtle text-info-emphasis">${sp.soThangBH || 12} tháng</span></td>
        <td>
          <a href="/may-imei/index.html?sanPhamId=${sp._id}" class="text-decoration-none">
            <span class="badge ${qtyCon > 0 ? 'bg-success' : 'bg-danger'}">
              ${qtyCon} máy sẵn có
            </span>
            <span class="text-muted small ms-1">(Tổng: ${qtyTong})</span>
          </a>
        </td>
        <td class="text-end">
          <div class="btn-group btn-group-sm">
            <a href="/may-imei/form.html?sanPhamId=${sp._id}" class="btn btn-outline-success" title="Nhập thêm IMEI cho máy này">
              <i class="bi bi-plus-circle"></i>
            </a>
            <a href="/san-pham/detail.html?id=${sp._id}" class="btn btn-outline-info" title="Xem chi tiết & danh sách IMEI">
              <i class="bi bi-eye"></i>
            </a>
            ${isManagerOrStorekeeper ? `
              <a href="/san-pham/form.html?id=${sp._id}" class="btn btn-outline-primary" title="Chỉnh sửa">
                <i class="bi bi-pencil"></i>
              </a>
            ` : ''}
            ${isManager ? `
              <button type="button" class="btn btn-outline-danger" title="Xóa" onclick="deleteSanPham('${sp._id}', '${escapeHtml(sp.tenMay)}')">
                <i class="bi bi-trash"></i>
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
    }).join('');
  } else {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">Không tìm thấy sản phẩm nào phù hợp</td></tr>';
  }
}

async function deleteSanPham(id, tenMay) {
  // Hiện modal xác nhận
  document.getElementById('modalTenSanPham').textContent = `"${tenMay}"`;

  const modal = new bootstrap.Modal(document.getElementById('modalXacNhanXoa'));
  modal.show();

  // Gắn sự kiện cho nút xác nhận (xóa listener cũ để tránh duplicate)
  const btnXacNhan = document.getElementById('btnXacNhanXoa');
  const newBtn = btnXacNhan.cloneNode(true);
  btnXacNhan.parentNode.replaceChild(newBtn, btnXacNhan);

  newBtn.addEventListener('click', async () => {
    modal.hide();

    const res = await api.delete(`/san-pham/${id}`);
    if (res.success) {
      // Xóa row khỏi giao diện, không reload trang
      const row = document.querySelector(`button[onclick*="${id}"]`)?.closest('tr');
      if (row) {
        row.style.transition = 'opacity 0.3s';
        row.style.opacity = '0';
        setTimeout(() => row.remove(), 300);
      }
      showToast(res.message || 'Đã ẩn sản phẩm khỏi danh sách', 'success');
    } else {
      showToast(res.message || 'Lỗi khi xóa sản phẩm', 'danger');
    }
  });
}

/**
 * Trang Thêm / Sửa Sản phẩm
 */
async function initSanPhamForm() {
  const params = getQueryParams();
  const editId = params.id;
  const isEdit = Boolean(editId);

  // 1. Tải danh mục
  const resDM = await api.get('/danh-muc');
  const selectDanhMuc = document.getElementById('selectDanhMuc');
  const dmList = Array.isArray(resDM.data) ? resDM.data : (resDM.data?.danhMucs || resDM.data?.list || []);
  if (resDM.success && dmList && selectDanhMuc) {
    selectDanhMuc.innerHTML = '<option value="">-- Chọn danh mục --</option>';
    dmList.forEach(dm => {
      const opt = document.createElement('option');
      opt.value = dm._id;
      opt.textContent = dm.tenDanhMuc;
      selectDanhMuc.appendChild(opt);
    });
  }

  // 2. Nếu là chế độ Sửa, tải dữ liệu sản phẩm
  if (isEdit) {
    document.getElementById('formTitle').textContent = 'Chỉnh sửa Sản phẩm';
    document.getElementById('btnSubmitForm').innerHTML = '<i class="bi bi-check2-circle me-1"></i> Cập nhật Sản phẩm';

    const res = await api.get(`/san-pham/${editId}`);
    if (res.success && res.sanPham) {
      const sp = res.sanPham;
      document.getElementById('inputTenMay').value = sp.tenMay || '';
      document.getElementById('selectDanhMuc').value = sp.danhMuc?._id || sp.danhMuc || '';
      document.getElementById('inputHang').value = sp.hang || '';
      document.getElementById('inputGiaBan').value = sp.giaBan || '';
      document.getElementById('inputSoThangBH').value = sp.soThangBH || 12;
      document.getElementById('inputMoTa').value = sp.moTa || '';
    } else {
      showToast(res.message || 'Không tìm thấy sản phẩm', 'danger');
    }
  }

  // 3. Xử lý submit form
  const form = document.getElementById('sanPhamForm');
  const inputGiaBan = document.getElementById('inputGiaBan');

  // Chỉ cho nhập số vào ô giá bán (chặn chữ và ký tự đặc biệt)
  if (inputGiaBan) {
    inputGiaBan.addEventListener('keypress', (e) => {
      if (!/[0-9]/.test(e.key)) {
        e.preventDefault();
      }
    });

    inputGiaBan.addEventListener('paste', (e) => {
      const pasted = (e.clipboardData || window.clipboardData).getData('text');
      if (!/^\d+$/.test(pasted.replace(/[.,\s]/g, ''))) {
        e.preventDefault();
      }
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const giaBanRaw = Number((document.getElementById('inputGiaBan').value || '').replace(/[^\d]/g, ''));

      // Validate giá bán phải > 0
      if (!giaBanRaw || giaBanRaw <= 0) {
        showToast('Hãy nhập mức giá >= 0', 'warning');
        document.getElementById('inputGiaBan').focus();
        return;
      }

      const body = {
        tenMay: document.getElementById('inputTenMay').value.trim(),
        danhMuc: document.getElementById('selectDanhMuc').value,
        hang: document.getElementById('inputHang').value.trim(),
        giaBan: giaBanRaw,
        soThangBH: Number(document.getElementById('inputSoThangBH').value) || 12,
        moTa: document.getElementById('inputMoTa').value.trim()
      };

      let res;
      if (isEdit) {
        res = await api.put(`/san-pham/${editId}`, body);
      } else {
        res = await api.post('/san-pham', body);
      }

      if (res.success) {
        showToast(res.message || 'Lưu sản phẩm thành công', 'success');
        setTimeout(() => {
          window.location.href = '/san-pham/index.html';
        }, 800);
      } else {
        showToast(res.message || 'Lỗi khi lưu sản phẩm', 'danger');
      }
    });

    // Xóa trạng thái lỗi khi người dùng bắt đầu nhập lại
    if (inputGiaBan) {
      inputGiaBan.addEventListener('input', () => {
        inputGiaBan.classList.remove('is-invalid');
      });
    }
  }
}

/**
 * Trang Xem Chi tiết Sản phẩm
 */
async function initSanPhamDetail() {
  const params = getQueryParams();
  const id = params.id;
  if (!id) {
    window.location.href = '/san-pham/index.html';
    return;
  }

  const res = await api.get(`/san-pham/${id}`);
  if (!res.success || !res.sanPham) {
    showToast(res.message || 'Không thể tải thông tin sản phẩm', 'danger');
    return;
  }

  const { sanPham, imeis } = res;

  document.getElementById('detailTenMay').textContent = sanPham.tenMay;
  document.getElementById('detailHang').textContent = sanPham.hang || 'N/A';
  document.getElementById('detailDanhMuc').textContent = sanPham.danhMuc ? sanPham.danhMuc.tenDanhMuc : 'N/A';
  document.getElementById('detailSoThangBH').textContent = `${sanPham.soThangBH || 12} tháng`;
  document.getElementById('detailGiaBan').textContent = formatCurrency(sanPham.giaBan);
  document.getElementById('detailMoTa').textContent = sanPham.moTa || 'Chưa có ghi chú mô tả';
  document.getElementById('detailBadgeCount').textContent = `${imeis ? imeis.length : 0} máy`;
  document.getElementById('btnImportImei').href = `/may-imei/form.html?sanPhamId=${sanPham._id}`;

  const tbody = document.getElementById('detailTableImeis');
  if (imeis && imeis.length > 0) {
    tbody.innerHTML = imeis.map(item => {
      let badgeClass = 'badge-imei-loi';
      let badgeText = 'Lỗi';
      if (item.trangThai === 'Con hang') {
        badgeClass = 'badge-imei-conhang';
        badgeText = 'Còn hàng';
      } else if (item.trangThai === 'Da ban') {
        badgeClass = 'badge-imei-daban';
        badgeText = 'Đã bán';
      } else if (item.trangThai === 'Bao hanh') {
        badgeClass = 'badge-imei-baohanh';
        badgeText = 'Bảo hành';
      }

      return `
        <tr>
          <td><span class="font-monospace fw-bold">${escapeHtml(item.imei)}</span></td>
          <td>${escapeHtml(item.mauSac || '-')} ${item.dungLuong ? `(${escapeHtml(item.dungLuong)})` : ''}</td>
          <td>${formatCurrency(item.giaNhap)}</td>
          <td><span class="badge ${badgeClass}">${badgeText}</span></td>
          <td>${formatDate(item.ngayNhap || item.createdAt)}</td>
          <td class="text-end">
            <a href="/may-imei/form.html?imei=${item.imei}" class="btn btn-sm btn-outline-primary" title="Sửa trạng thái">
              <i class="bi bi-pencil"></i>
            </a>
          </td>
        </tr>
      `;
    }).join('');
  } else {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">Chưa có máy IMEI nào thuộc sản phẩm này trong kho</td></tr>';
  }
}
