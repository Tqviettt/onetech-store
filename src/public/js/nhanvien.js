/**
 * Module xử lý Nhân viên & Phân quyền phía Client (Chỉ Quản lý)
 */

document.addEventListener('DOMContentLoaded', async () => {
  const path = window.location.pathname;

  if (path.includes('nhan-vien/index.html') || path.endsWith('/nhan-vien/')) {
    initNhanVienIndex();
  } else if (path.includes('nhan-vien/form.html')) {
    initNhanVienForm();
  }
});

async function initNhanVienIndex() {
  const filterForm = document.getElementById('filterForm');
  const btnReset = document.getElementById('btnResetFilter');
  const searchInput = document.getElementById('filterSearch');
  const filterVaiTro = document.getElementById('filterVaiTro');
  const filterTrangThai = document.getElementById('filterTrangThai');

  await loadNhanVienList();

  if (filterForm) {
    filterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      loadNhanVienList();
    });
  }
  
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        loadNhanVienList();
      }, 300);
    });
  }
  
  if (filterVaiTro) {
    filterVaiTro.addEventListener('change', loadNhanVienList);
  }
  
  if (filterTrangThai) {
    filterTrangThai.addEventListener('change', loadNhanVienList);
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (filterVaiTro) filterVaiTro.value = '';
      if (filterTrangThai) filterTrangThai.value = '';
      loadNhanVienList();
    });
  }
}

// Debounce implementation for search
let searchTimeout;

async function loadNhanVienList() {
  const search = document.getElementById('filterSearch')?.value.trim() || '';
  const vaiTro = document.getElementById('filterVaiTro')?.value || '';
  const trangThai = document.getElementById('filterTrangThai')?.value || '';

  const res = await api.get('/nhan-vien', { search, vaiTro, trangThai });
  if (!res.success) {
    showToast(res.message || 'Không thể tải danh sách nhân viên', 'danger');
    return;
  }

  const nhanViens = res.data;
  const tbody = document.getElementById('tableNhanVienBody');
  if (!tbody) return;

  if (nhanViens && nhanViens.length > 0) {
    tbody.innerHTML = nhanViens.map(nv => {
      let roleBadge = '';
      if (nv.vaiTro === 'Quản lý') {
        roleBadge = '<span class="badge bg-danger px-2 py-1"><i class="bi bi-shield-fill-check me-1"></i> Quản lý</span>';
      } else if (nv.vaiTro === 'Thủ kho') {
        roleBadge = '<span class="badge bg-warning text-dark px-2 py-1"><i class="bi bi-box-seam me-1"></i> Thủ kho</span>';
      } else if (nv.vaiTro === 'NV bán hàng') {
        roleBadge = '<span class="badge bg-primary px-2 py-1"><i class="bi bi-cart me-1"></i> NV bán hàng</span>';
      } else if (nv.vaiTro === 'Thu ngân') {
        roleBadge = '<span class="badge bg-success px-2 py-1"><i class="bi bi-cash me-1"></i> Thu ngân</span>';
      } else if (nv.vaiTro === 'Kế toán') {
        roleBadge = '<span class="badge bg-info text-dark px-2 py-1"><i class="bi bi-calculator me-1"></i> Kế toán</span>';
      } else {
        roleBadge = '<span class="badge bg-secondary px-2 py-1"><i class="bi bi-tools me-1"></i> Kỹ thuật</span>';
      }

      const isCurrentLoggedIn = currentUser && currentUser._id.toString() === nv._id.toString();

      return `
        <tr>
          <td>
            <div class="fw-bold text-dark">${escapeHtml(nv.hoTen)}</div>
            <div class="small text-muted">ID: ${nv._id.slice(-6)}</div>
          </td>
          <td><span class="font-monospace text-primary fw-semibold">@${escapeHtml(nv.tenDangNhap)}</span></td>
          <td>${roleBadge}</td>
          <td>${escapeHtml(nv.sdt || 'Chưa cập nhật')}</td>
          <td>
            <span class="badge ${nv.trangThai === 'Hoạt động' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'}">
              ${nv.trangThai || 'Hoạt động'}
            </span>
          </td>
          <td class="text-end">
            <div class="btn-group btn-group-sm">
              <a href="/nhan-vien/form.html?id=${nv._id}" class="btn btn-outline-primary" title="Sửa">
                <i class="bi bi-pencil"></i>
              </a>
              ${!isCurrentLoggedIn ? `
                <button type="button" class="btn btn-outline-danger" title="Xóa" onclick="deleteNhanVien('${nv._id}', '${escapeHtml(nv.hoTen)}')">
                  <i class="bi bi-trash"></i>
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } else {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">Không tìm thấy nhân viên nào</td></tr>';
  }
}

async function deleteNhanVien(id, hoTen) {
  if (!confirm(`Bạn có chắc chắn muốn xóa nhân viên "${hoTen}"?`)) return;

  const res = await api.delete(`/nhan-vien/${id}`);
  if (res.success) {
    showToast(res.message || 'Xóa nhân viên thành công', 'success');
    loadNhanVienList();
  } else {
    showToast(res.message || 'Lỗi khi xóa nhân viên', 'danger');
  }
}

async function initNhanVienForm() {
  const params = getQueryParams();
  const editId = params.id;
  const isEdit = Boolean(editId);

  if (isEdit) {
    document.getElementById('formTitle').textContent = 'Chỉnh sửa Nhân viên';
    document.getElementById('btnSubmitForm').innerHTML = '<i class="bi bi-check2-circle me-1"></i> Cập nhật Nhân viên';
    document.getElementById('inputTenDangNhap').readOnly = true;
    document.getElementById('helpTenDangNhap').classList.remove('d-none');
    document.getElementById('containerTrangThai').classList.remove('d-none');
    document.getElementById('labelMatKhau').innerHTML = 'Mật khẩu mới (Để trống nếu không đổi)';
    document.getElementById('inputMatKhau').required = false;

    const res = await api.get(`/nhan-vien/${editId}`);
    if (res.success && res.data) {
      const nv = res.data;
      document.getElementById('inputHoTen').value = nv.hoTen || '';
      document.getElementById('inputSdt').value = nv.sdt || '';
      document.getElementById('inputTenDangNhap').value = nv.tenDangNhap || '';
      document.getElementById('selectVaiTro').value = nv.vaiTro || 'NV bán hàng';
      document.getElementById('selectTrangThai').value = nv.trangThai || 'Hoạt động';
      if (document.getElementById('inputEmail')) document.getElementById('inputEmail').value = nv.email || '';
      if (document.getElementById('inputCccd')) document.getElementById('inputCccd').value = nv.cccd || '';
      if (document.getElementById('inputDiaChi')) document.getElementById('inputDiaChi').value = nv.diaChi || '';
    } else {
      showToast('Không tìm thấy thông tin nhân viên', 'danger');
    }
  } else {
    document.getElementById('inputMatKhau').required = true;
  }

  const form = document.getElementById('nhanVienForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const hoTen = document.getElementById('inputHoTen').value.trim();
      const sdt = document.getElementById('inputSdt').value.trim();
      const tenDangNhap = document.getElementById('inputTenDangNhap').value.trim();
      const vaiTro = document.getElementById('selectVaiTro').value;
      const matKhau = document.getElementById('inputMatKhau').value;
      const trangThai = document.getElementById('selectTrangThai')?.value;
      
      const email = document.getElementById('inputEmail') ? document.getElementById('inputEmail').value.trim() : '';
      const cccd = document.getElementById('inputCccd') ? document.getElementById('inputCccd').value.trim() : '';
      const diaChi = document.getElementById('inputDiaChi') ? document.getElementById('inputDiaChi').value.trim() : '';

      if (!hoTen || !vaiTro || (!isEdit && (!tenDangNhap || !matKhau))) {
        showToast('Vui lòng điền đầy đủ các thông tin bắt buộc', 'danger');
        return;
      }

      let res;
      if (isEdit) {
        res = await api.put(`/nhan-vien/${editId}`, {
          hoTen,
          sdt,
          email,
          cccd,
          diaChi,
          vaiTro,
          matKhau,
          trangThai
        });
      } else {
        res = await api.post('/nhan-vien', {
          hoTen,
          sdt,
          email,
          cccd,
          diaChi,
          tenDangNhap,
          vaiTro,
          matKhau
        });
      }

      if (res.success) {
        showToast(res.message || 'Lưu thông tin nhân viên thành công', 'success');
        setTimeout(() => {
          window.location.href = '/nhan-vien/index.html';
        }, 800);
      } else {
        showToast(res.message || 'Lỗi khi lưu nhân viên', 'danger');
      }
    });
  }
}
