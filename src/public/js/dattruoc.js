/**
 * Module Xử lý Logic Giao diện Đặt Hàng Trước (Pre-order)
 * Thành viên 6: Tô Quốc Việt
 */

document.addEventListener('DOMContentLoaded', async () => {
  let currentPage = 1;
  let currentSearch = '';
  let currentStatus = 'All';

  const preorderTableBody = document.getElementById('preorderTableBody');
  const searchPreorderInput = document.getElementById('searchPreorderInput');
  const filterStatusSelect = document.getElementById('filterStatusSelect');
  const btnRefreshList = document.getElementById('btnRefreshList');
  const paginationContainer = document.getElementById('paginationContainer');
  const paginationInfo = document.getElementById('paginationInfo');
  const paginationButtons = document.getElementById('paginationButtons');

  // Stats elements
  const statTotalOrders = document.getElementById('statTotalOrders');
  const statPendingOrders = document.getElementById('statPendingOrders');
  const statCompletedOrders = document.getElementById('statCompletedOrders');
  const statCancelledOrders = document.getElementById('statCancelledOrders');

  // Form elements
  const createPreorderForm = document.getElementById('createPreorderForm');
  const createKhachHangSelect = document.getElementById('createKhachHangSelect');
  const createSanPhamSelect = document.getElementById('createSanPhamSelect');

  // Modals instance container
  let modalDetail = null;
  let modalCancel = null;
  let modalStatus = null;
  let modalDeliver = null;

  const modalDetailEl = document.getElementById('modalPreorderDetail');
  if (modalDetailEl && window.bootstrap) {
    modalDetail = new bootstrap.Modal(modalDetailEl);
  }
  const modalCancelEl = document.getElementById('modalCancelPreorder');
  if (modalCancelEl && window.bootstrap) {
    modalCancel = new bootstrap.Modal(modalCancelEl);
  }
  const modalStatusEl = document.getElementById('modalUpdateStatus');
  if (modalStatusEl && window.bootstrap) {
    modalStatus = new bootstrap.Modal(modalStatusEl);
  }
  const modalDeliverEl = document.getElementById('modalDeliverPreorder');
  if (modalDeliverEl && window.bootstrap) {
    modalDeliver = new bootstrap.Modal(modalDeliverEl);
  }

  // Load initial dropdowns
  await Promise.all([loadCustomers(), loadProducts()]);

  // Load preorders list
  await loadPreorders();

  // Event Listeners
  if (filterStatusSelect) {
    filterStatusSelect.addEventListener('change', (e) => {
      currentStatus = e.target.value;
      currentPage = 1;
      loadPreorders();
    });
  }

  let searchTimeout = null;
  if (searchPreorderInput) {
    searchPreorderInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentSearch = e.target.value.trim();
        currentPage = 1;
        loadPreorders();
      }, 350);
    });
  }

  if (btnRefreshList) {
    btnRefreshList.addEventListener('click', () => {
      loadPreorders();
      showToast('Đã làm mới danh sách đơn đặt trước', 'info');
    });
  }

  // Create Preorder Form Submit
  if (createPreorderForm) {
    createPreorderForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const khachHang = createKhachHangSelect ? createKhachHangSelect.value : '';
      const sanPham = createSanPhamSelect ? createSanPhamSelect.value : '';
      const soTienCoc = Number((document.getElementById('createSoTienCoc')?.value || '').replace(/\D/g, '')) || 0;
      const hinhThuc = document.getElementById('createHinhThucSelect')?.value || 'Tien mat';
      const hanLay = document.getElementById('createHanLay')?.value;
      const imei = document.getElementById('createImei')?.value.trim();
      const ghiChu = document.getElementById('createGhiChu')?.value.trim();

      if (!khachHang) {
        showToast('Vui lòng chọn khách hàng', 'warning');
        return;
      }
      if (!sanPham) {
        showToast('Vui lòng chọn sản phẩm', 'warning');
        return;
      }

      try {
        const res = await api.post('/dat-truoc', {
          khachHang,
          sanPham,
          soTienCoc,
          hinhThuc,
          hanLay: hanLay || undefined,
          imei: imei || undefined,
          ghiChu
        });

        if (res && res.success) {
          showToast('Tiếp nhận đơn đặt trước và ghi nhận tiền cọc thành công!', 'success');
          createPreorderForm.reset();
          const listTabBtn = document.getElementById('tab-list-btn');
          if (listTabBtn) listTabBtn.click();
          loadPreorders();
        } else {
          showToast(res.message || 'Lỗi khi tạo đơn đặt trước', 'danger');
        }
      } catch (err) {
        console.error('Lỗi tạo đơn đặt trước:', err);
        showToast(err.message || 'Lỗi khi tạo đơn đặt trước', 'danger');
      }
    });
  }

  // Cancel Order Form Submit
  const cancelPreorderForm = document.getElementById('cancelPreorderForm');
  if (cancelPreorderForm) {
    cancelPreorderForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('cancelOrderId')?.value;
      const lyDo = document.getElementById('cancelLyDoInput')?.value.trim();
      const hinhThuc = document.getElementById('cancelHinhThucSelect')?.value || 'Tien mat';

      try {
        const res = await api.put(`/dat-truoc/${id}/huy`, { lyDo, hinhThuc });

        if (res && res.success) {
          showToast('Đã hủy đơn đặt trước và tạo phiếu hoàn tiền cọc!', 'success');
          if (modalCancel) modalCancel.hide();
          loadPreorders();
        } else {
          showToast(res.message || 'Không thể hủy đơn đặt trước', 'danger');
        }
      } catch (err) {
        showToast(err.message || 'Lỗi khi hủy đơn', 'danger');
      }
    });
  }

  // Update Status Form Submit
  const updateStatusForm = document.getElementById('updateStatusForm');
  if (updateStatusForm) {
    updateStatusForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('updateStatusOrderId')?.value;
      const trangThai = document.getElementById('updateStatusSelect')?.value;
      const imei = document.getElementById('updateImeiInput')?.value.trim();
      const ghiChu = document.getElementById('updateGhiChuInput')?.value.trim();

      try {
        const res = await api.put(`/dat-truoc/${id}/trang-thai`, { trangThai, imei, ghiChu });

        if (res && res.success) {
          showToast('Đã cập nhật trạng thái đơn đặt trước!', 'success');
          if (modalStatus) modalStatus.hide();
          loadPreorders();
        } else {
          showToast(res.message || 'Không thể cập nhật trạng thái', 'danger');
        }
      } catch (err) {
        showToast(err.message || 'Lỗi khi cập nhật trạng thái', 'danger');
      }
    });
  }

  // Deliver / Create Invoice Form Submit
  const deliverPreorderForm = document.getElementById('deliverPreorderForm');
  if (deliverPreorderForm) {
    deliverPreorderForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('deliverOrderId')?.value;
      const imei = document.getElementById('deliverImeiInput')?.value.trim();
      const hinhThucThanhToan = document.getElementById('deliverHinhThucSelect')?.value || 'Da thanh toan';
      const ghiChu = document.getElementById('deliverGhiChuInput')?.value.trim();

      if (!imei) {
        showToast('Vui lòng nhập hoặc chọn số IMEI xuất cho khách', 'warning');
        return;
      }

      try {
        const res = await api.put(`/dat-truoc/${id}/chuyen-hoa-don`, { imei, hinhThucThanhToan, ghiChu });

        if (res && res.success) {
          const soHD = res.data && res.data.hoaDon ? res.data.hoaDon.soHD : (res.hoaDon ? res.hoaDon.soHD : '');
          showToast(`Đã xuất hóa đơn ${soHD} và cấn trừ tiền cọc thành công!`, 'success');
          if (modalDeliver) modalDeliver.hide();
          loadPreorders();
        } else {
          showToast(res.message || 'Không thể xuất hóa đơn cho đơn đặt trước', 'danger');
        }
      } catch (err) {
        showToast(err.message || 'Lỗi khi xuất hóa đơn', 'danger');
      }
    });
  }

  /**
   * Tải danh sách khách hàng vào dropdown
   */
  async function loadCustomers() {
    if (!createKhachHangSelect) return;
    try {
      const res = await api.get('/khach-hang');
      let list = [];
      if (Array.isArray(res.data)) {
        list = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        list = res.data.data;
      } else if (res.data && Array.isArray(res.data.khachHangs)) {
        list = res.data.khachHangs;
      } else if (Array.isArray(res.khachHangs)) {
        list = res.khachHangs;
      } else if (Array.isArray(res)) {
        list = res;
      }

      createKhachHangSelect.innerHTML = '<option value="">-- Chọn khách hàng --</option>';
      list.forEach(kh => {
        const opt = document.createElement('option');
        opt.value = kh._id;
        opt.textContent = `${kh.hoTen} (${kh.sdt || 'Chưa có SĐT'})`;
        createKhachHangSelect.appendChild(opt);
      });
    } catch (err) {
      console.error('Không thể tải danh sách khách hàng:', err);
    }
  }

  /**
   * Tải danh sách Model sản phẩm vào dropdown
   */
  async function loadProducts() {
    if (!createSanPhamSelect) return;
    try {
      const res = await api.get('/san-pham');
      let list = [];
      if (Array.isArray(res.data)) {
        list = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        list = res.data.data;
      } else if (res.data && Array.isArray(res.data.sanPhams)) {
        list = res.data.sanPhams;
      } else if (Array.isArray(res.sanPhams)) {
        list = res.sanPhams;
      } else if (Array.isArray(res)) {
        list = res;
      }

      createSanPhamSelect.innerHTML = '<option value="">-- Chọn Model sản phẩm --</option>';
      list.forEach(sp => {
        const opt = document.createElement('option');
        opt.value = sp._id;
        const giaStr = sp.giaBan ? sp.giaBan.toLocaleString('vi-VN') + ' đ' : 'Chưa có giá';
        opt.textContent = `${sp.tenMay} (${sp.hang || 'Khác'}) - Giá niêm yết: ${giaStr}`;
        createSanPhamSelect.appendChild(opt);
      });
    } catch (err) {
      console.error('Không thể tải danh sách sản phẩm:', err);
    }
  }

  /**
   * Tải danh sách đơn đặt trước
   */
  async function loadPreorders() {
    if (!preorderTableBody) return;
    try {
      preorderTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-4 text-muted">
            <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
            Đang tải dữ liệu...
          </td>
        </tr>
      `;

      const params = { page: currentPage, limit: 10 };
      if (currentStatus !== 'All') params.trangThai = currentStatus;
      if (currentSearch) params.search = currentSearch;

      const res = await api.get('/dat-truoc', params);
      const orders = res.donDatHangs || (res.data && res.data.donDatHangs) || (Array.isArray(res.data) ? res.data : []);
      const pagination = res.pagination || (res.data && res.data.pagination) || {};

      renderTable(orders);
      renderPagination(pagination);
      updateStats(orders);
    } catch (err) {
      console.error('Lỗi khi tải đơn đặt trước:', err);
      preorderTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-4 text-danger">
            <i class="bi bi-exclamation-triangle me-2"></i> Không thể tải danh sách đơn đặt trước: ${err.message}
          </td>
        </tr>
      `;
    }
  }

  /**
   * Hiển thị bảng đơn đặt trước
   */
  function renderTable(orders) {
    if (!orders || orders.length === 0) {
      preorderTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-5 text-muted">
            <i class="bi bi-inbox fs-2 d-block mb-2 text-secondary"></i>
            Không tìm thấy đơn đặt hàng trước nào phù hợp.
          </td>
        </tr>
      `;
      return;
    }

    preorderTableBody.innerHTML = orders.map(order => {
      const khName = order.khachHang ? escapeHtml(order.khachHang.hoTen) : '<em class="text-muted">Khách vãng lai</em>';
      const khPhone = order.khachHang && order.khachHang.sdt ? `<small class="text-muted d-block">${escapeHtml(order.khachHang.sdt)}</small>` : '';
      const spName = order.sanPham ? escapeHtml(order.sanPham.tenMay) : '<em class="text-muted">Chưa rõ Model</em>';
      const imeiBadge = order.imei ? `<span class="badge bg-light text-dark font-monospace border ms-1">${escapeHtml(order.imei)}</span>` : '';
      const depositStr = (order.soTienCoc || 0).toLocaleString('vi-VN') + ' đ';
      const hanLayStr = order.hanLay ? new Date(order.hanLay).toLocaleDateString('vi-VN') : '<span class="text-muted">Chưa hẹn</span>';
      const createdAtStr = new Date(order.createdAt).toLocaleDateString('vi-VN');

      let statusBadge = '';
      switch (order.trangThai) {
        case 'Da dat coc':
        case 'Cho xu ly':
          statusBadge = '<span class="badge bg-warning text-dark"><i class="bi bi-clock me-1"></i>Đã đặt cọc</span>';
          break;
        case 'Da co hang':
          statusBadge = '<span class="badge bg-info text-dark"><i class="bi bi-box-seam me-1"></i>Đã có hàng</span>';
          break;
        case 'Da nhan hang':
        case 'Da nhan may':
          statusBadge = '<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>Đã nhận hàng</span>';
          break;
        case 'Da huy':
          statusBadge = '<span class="badge bg-danger"><i class="bi bi-x-circle me-1"></i>Đã hủy</span>';
          break;
        default:
          statusBadge = `<span class="badge bg-secondary">${escapeHtml(order.trangThai)}</span>`;
      }

      const isCancellable = ['Da dat coc', 'Cho xu ly', 'Da co hang'].includes(order.trangThai);
      const isUpdatable = isCancellable;

      return `
        <tr>
          <td class="ps-3 font-monospace fw-semibold text-primary">#${order._id.slice(-6).toUpperCase()}</td>
          <td>
            <strong>${khName}</strong>
            ${khPhone}
          </td>
          <td>
            <span>${spName}</span>
            ${imeiBadge}
          </td>
          <td class="fw-bold text-success">${depositStr}</td>
          <td>${hanLayStr}</td>
          <td>${statusBadge}</td>
          <td class="text-muted small">${createdAtStr}</td>
          <td class="text-end pe-3">
            <div class="btn-group btn-group-sm">
              <button type="button" class="btn btn-outline-primary btn-view-detail" data-id="${order._id}" title="Xem chi tiết & Phiếu thu">
                <i class="bi bi-eye"></i>
              </button>
              ${isUpdatable ? `
                <button type="button" class="btn btn-outline-success btn-deliver-order" data-id="${order._id}" data-name="${order.khachHang ? escapeHtml(order.khachHang.hoTen) : ''}" data-deposit="${order.soTienCoc || 0}" data-imei="${order.imei || ''}" title="Khách nhận máy & Xuất hóa đơn cấn trừ cọc">
                  <i class="bi bi-box-seam"></i>
                </button>
                <button type="button" class="btn btn-outline-secondary btn-update-status" data-id="${order._id}" data-status="${order.trangThai}" data-imei="${order.imei || ''}" title="Cập nhật trạng thái / Gán IMEI">
                  <i class="bi bi-pencil"></i>
                </button>
              ` : ''}
              ${isCancellable ? `
                <button type="button" class="btn btn-outline-danger btn-cancel-order" data-id="${order._id}" data-name="${order.khachHang ? escapeHtml(order.khachHang.hoTen) : ''}" data-deposit="${order.soTienCoc || 0}" title="Hủy đơn & Hoàn cọc">
                  <i class="bi bi-x-lg"></i>
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach row events
    document.querySelectorAll('.btn-view-detail').forEach(btn => {
      btn.addEventListener('click', () => viewDetail(btn.getAttribute('data-id')));
    });

    document.querySelectorAll('.btn-deliver-order').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');
        const deposit = Number(btn.getAttribute('data-deposit')) || 0;
        const imei = btn.getAttribute('data-imei');
        const idInput = document.getElementById('deliverOrderId');
        const nameEl = document.getElementById('deliverCustomerName');
        const depositEl = document.getElementById('deliverDepositAmount');
        const imeiInput = document.getElementById('deliverImeiInput');
        const noteInput = document.getElementById('deliverGhiChuInput');

        if (idInput) idInput.value = id;
        if (nameEl) nameEl.textContent = name;
        if (depositEl) depositEl.textContent = deposit.toLocaleString('vi-VN') + ' đ';
        if (imeiInput) imeiInput.value = imei || '';
        if (noteInput) noteInput.value = '';
        if (modalDeliver) modalDeliver.show();
      });
    });

    document.querySelectorAll('.btn-update-status').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const status = btn.getAttribute('data-status');
        const imei = btn.getAttribute('data-imei');
        const idInput = document.getElementById('updateStatusOrderId');
        const statusSelect = document.getElementById('updateStatusSelect');
        const imeiInput = document.getElementById('updateImeiInput');
        const noteInput = document.getElementById('updateGhiChuInput');

        if (idInput) idInput.value = id;
        if (statusSelect) statusSelect.value = status;
        if (imeiInput) imeiInput.value = imei;
        if (noteInput) noteInput.value = '';
        if (modalStatus) modalStatus.show();
      });
    });

    document.querySelectorAll('.btn-cancel-order').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');
        const deposit = Number(btn.getAttribute('data-deposit')) || 0;
        const idInput = document.getElementById('cancelOrderId');
        const nameEl = document.getElementById('cancelCustomerName');
        const depositEl = document.getElementById('cancelDepositAmount');
        const noteInput = document.getElementById('cancelLyDoInput');

        if (idInput) idInput.value = id;
        if (nameEl) nameEl.textContent = name;
        if (depositEl) depositEl.textContent = deposit.toLocaleString('vi-VN') + ' đ';
        if (noteInput) noteInput.value = '';
        if (modalCancel) modalCancel.show();
      });
    });
  }

  /**
   * Xem chi tiết đơn đặt trước và lịch sử thu / chi
   */
  async function viewDetail(id) {
    const detailContent = document.getElementById('modalDetailContent');
    if (detailContent) {
      detailContent.innerHTML = `
        <div class="text-center py-4">
          <div class="spinner-border text-primary" role="status"></div>
        </div>
      `;
    }
    if (modalDetail) modalDetail.show();

    try {
      const res = await api.get(`/dat-truoc/${id}`);
      const data = res.data || res;
      const { donDatHang, phieuThuList = [], phieuChiList = [], hoaDon } = data;

      if (!donDatHang) {
        if (detailContent) detailContent.innerHTML = '<div class="alert alert-danger">Không tìm thấy thông tin đơn đặt trước</div>';
        return;
      }

      const kh = donDatHang.khachHang || {};
      const sp = donDatHang.sanPham || {};

      let phieuThuHtml = '';
      if (phieuThuList.length > 0) {
        phieuThuHtml = `
          <div class="mt-3">
            <h6 class="fw-bold text-success"><i class="bi bi-cash-stack me-1"></i>Lịch sử Thu tiền cọc (Phiếu Thu)</h6>
            <div class="table-responsive">
              <table class="table table-sm table-bordered">
                <thead class="table-light">
                  <tr>
                    <th>Mã PT</th>
                    <th>Số tiền</th>
                    <th>Hình thức</th>
                    <th>Ngày thu</th>
                    <th>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  ${phieuThuList.map(pt => `
                    <tr>
                      <td class="font-monospace">#${pt._id.slice(-6).toUpperCase()}</td>
                      <td class="fw-bold text-success">${pt.soTien.toLocaleString('vi-VN')} đ</td>
                      <td>${escapeHtml(pt.hinhThuc || 'Tiền mặt')}</td>
                      <td>${new Date(pt.ngayThu).toLocaleString('vi-VN')}</td>
                      <td class="small text-muted">${escapeHtml(pt.ghiChu || '')}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      }

      let phieuChiHtml = '';
      if (phieuChiList.length > 0) {
        phieuChiHtml = `
          <div class="mt-3">
            <h6 class="fw-bold text-danger"><i class="bi bi-cash-coin me-1"></i>Lịch sử Hoàn tiền cọc (Phiếu Chi)</h6>
            <div class="table-responsive">
              <table class="table table-sm table-bordered">
                <thead class="table-light">
                  <tr>
                    <th>Mã PC</th>
                    <th>Số tiền hoàn</th>
                    <th>Hình thức</th>
                    <th>Ngày chi</th>
                    <th>Lý do</th>
                  </tr>
                </thead>
                <tbody>
                  ${phieuChiList.map(pc => `
                    <tr>
                      <td class="font-monospace">#${pc._id.slice(-6).toUpperCase()}</td>
                      <td class="fw-bold text-danger">${pc.soTien.toLocaleString('vi-VN')} đ</td>
                      <td>${escapeHtml(pc.hinhThuc || 'Tiền mặt')}</td>
                      <td>${new Date(pc.ngayChi).toLocaleString('vi-VN')}</td>
                      <td class="small text-muted">${escapeHtml(pc.lyDo || '')}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      }

      let hoaDonHtml = '';
      if (hoaDon) {
        hoaDonHtml = `
          <div class="alert alert-success mt-3">
            <i class="bi bi-check-circle me-1"></i> Đơn đặt hàng này đã được xuất bán qua Hóa đơn: 
            <strong><a href="/pages/ban-hang/index.html" class="text-success text-decoration-underline">${escapeHtml(hoaDon.soHD)}</a></strong>
            (Ngày lập: ${new Date(hoaDon.ngayLap).toLocaleDateString('vi-VN')})
          </div>
        `;
      }

      if (detailContent) {
        detailContent.innerHTML = `
          <div class="row g-3">
            <div class="col-md-6">
              <div class="card p-3 bg-light border-0">
                <h6 class="fw-bold text-primary mb-2"><i class="bi bi-person me-1"></i>Thông Tin Khách Hàng</h6>
                <p class="mb-1"><strong>Họ tên:</strong> ${escapeHtml(kh.hoTen || 'Chưa cập nhật')}</p>
                <p class="mb-1"><strong>Số điện thoại:</strong> ${escapeHtml(kh.sdt || 'Chưa có')}</p>
                <p class="mb-0"><strong>Địa chỉ:</strong> ${escapeHtml(kh.diaChi || 'Chưa có')}</p>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card p-3 bg-light border-0">
                <h6 class="fw-bold text-primary mb-2"><i class="bi bi-phone me-1"></i>Sản Phẩm Đặt Trước</h6>
                <p class="mb-1"><strong>Tên máy:</strong> ${escapeHtml(sp.tenMay || 'Chưa rõ')}</p>
                <p class="mb-1"><strong>Hãng:</strong> ${escapeHtml(sp.hang || 'Chưa có')}</p>
                <p class="mb-0"><strong>Giá niêm yết:</strong> ${(sp.giaBan || 0).toLocaleString('vi-VN')} đ</p>
              </div>
            </div>
          </div>

          <div class="card p-3 mt-3 border">
            <div class="row">
              <div class="col-6 col-md-3">
                <small class="text-muted d-block">Mã đơn đặt:</small>
                <strong class="font-monospace">#${donDatHang._id}</strong>
              </div>
              <div class="col-6 col-md-3">
                <small class="text-muted d-block">Tiền đặt cọc:</small>
                <strong class="text-success">${(donDatHang.soTienCoc || 0).toLocaleString('vi-VN')} đ</strong>
              </div>
              <div class="col-6 col-md-3">
                <small class="text-muted d-block">Trạng thái:</small>
                <span class="badge bg-primary">${escapeHtml(donDatHang.trangThai)}</span>
              </div>
              <div class="col-6 col-md-3">
                <small class="text-muted d-block">Số IMEI gán:</small>
                <span class="font-monospace">${donDatHang.imei ? escapeHtml(donDatHang.imei) : '<em class="text-muted">Chưa gán</em>'}</span>
              </div>
            </div>
            ${donDatHang.ghiChu ? `<div class="mt-2 pt-2 border-top small text-muted"><strong>Ghi chú:</strong> ${escapeHtml(donDatHang.ghiChu)}</div>` : ''}
          </div>

          ${phieuThuHtml}
          ${phieuChiHtml}
          ${hoaDonHtml}
        `;
      }

      // Xử lý nút In Phiếu
      const btnPrint = document.getElementById('btnPrintPreorder');
      if (btnPrint) {
        btnPrint.onclick = () => {
          printPreorderReceipt(data);
        };
      }
    } catch (err) {
      if (detailContent) detailContent.innerHTML = `<div class="alert alert-danger">Lỗi tải chi tiết: ${err.message}</div>`;
    }
  }

  function printPreorderReceipt(data) {
    const { donDatHang, phieuThuList = [] } = data;
    if (!donDatHang) return;

    const kh = donDatHang.khachHang || {};
    const sp = donDatHang.sanPham || {};
    const depositStr = (donDatHang.soTienCoc || 0).toLocaleString('vi-VN') + ' đ';
    const priceStr = (sp.giaBan || 0).toLocaleString('vi-VN') + ' đ';
    const createdDateStr = new Date(donDatHang.createdAt).toLocaleDateString('vi-VN');
    const hanLayStr = donDatHang.hanLay ? new Date(donDatHang.hanLay).toLocaleDateString('vi-VN') : 'Khi có hàng sớm nhất';

    const printWindow = window.open('', '_blank', 'width=700,height=800');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Phiếu Đặt Cọc #${donDatHang._id.slice(-6).toUpperCase()} - OneTech Store</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 25px; color: #222; font-size: 13px; line-height: 1.5; }
          .header { text-align: center; border-bottom: 2px dashed #333; padding-bottom: 12px; margin-bottom: 15px; }
          .title { font-size: 18px; font-weight: bold; margin: 5px 0; text-transform: uppercase; }
          .store-info { font-size: 12px; color: #555; }
          .section-title { font-weight: bold; font-size: 14px; margin-top: 15px; margin-bottom: 8px; border-bottom: 1px solid #ddd; padding-bottom: 3px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background: #f5f5f5; }
          .text-end { text-align: right; }
          .fw-bold { font-weight: bold; }
          .signatures { display: flex; justify-content: space-between; margin-top: 40px; text-align: center; }
          .signature-box { width: 45%; }
          .signature-space { height: 60px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="font-weight: bold; font-size: 16px;">HỆ THỐNG BÁN LẺ ĐIỆN THOẠI ONETECH STORE</div>
          <div class="store-info">Địa chỉ: 123 Đường Cầu Giấy, Hà Nội | Hotline: 1900 6868</div>
          <div class="title">PHIẾU TIẾP NHẬN ĐẶT HÀNG TRƯỚC (PRE-ORDER)</div>
          <div>Mã đơn: <strong>#${donDatHang._id.slice(-6).toUpperCase()}</strong> | Ngày lập: ${createdDateStr}</div>
        </div>

        <div class="section-title">1. THÔNG TIN KHÁCH HÀNG</div>
        <div>Họ và tên: <strong>${escapeHtml(kh.hoTen || 'Khách vãng lai')}</strong></div>
        <div>Số điện thoại: <strong>${escapeHtml(kh.sdt || 'Chưa có')}</strong></div>
        <div>Địa chỉ: ${escapeHtml(kh.diaChi || 'Tại cửa hàng')}</div>

        <div class="section-title">2. THÔNG TIN SẢN PHẨM & TIỀN CỌC</div>
        <table>
          <thead>
            <tr>
              <th>Sản phẩm / Model</th>
              <th>Dự kiến giao</th>
              <th class="text-end">Giá niêm yết</th>
              <th class="text-end">Tiền đặt cọc</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${escapeHtml(sp.tenMay || 'Điện thoại')}</strong></td>
              <td>${hanLayStr}</td>
              <td class="text-end">${priceStr}</td>
              <td class="text-end fw-bold">${depositStr}</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 10px; font-size: 12px; font-style: italic;">
          * Lưu ý: Tiền cọc sẽ được cấn trừ trực tiếp vào hóa đơn khi nhận máy. Nếu quý khách hủy đơn theo chính sách, cửa hàng sẽ hoàn cọc 100%.
        </div>

        <div class="signatures">
          <div class="signature-box">
            <strong>KHÁCH HÀNG</strong><br><small>(Ký và ghi rõ họ tên)</small>
            <div class="signature-space"></div>
            <div>${escapeHtml(kh.hoTen || '')}</div>
          </div>
          <div class="signature-box">
            <strong>NHÂN VIÊN TIẾP NHẬN</strong><br><small>(Ký và ghi rõ họ tên)</small>
            <div class="signature-space"></div>
            <div>OneTech Store</div>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }

  /**
   * Cập nhật thông tin phân trang
   */
  function renderPagination(pagination) {
    if (!paginationContainer) return;
    if (!pagination || pagination.totalPages <= 1) {
      paginationContainer.style.display = 'none';
      return;
    }

    paginationContainer.style.display = 'flex';
    if (paginationInfo) {
      paginationInfo.textContent = `Trang ${pagination.page} / ${pagination.totalPages} (Tổng cộng ${pagination.total} đơn)`;
    }

    let html = '';
    if (pagination.page > 1) {
      html += `<button class="btn btn-outline-secondary" onclick="changePage(${pagination.page - 1})"><i class="bi bi-chevron-left"></i></button>`;
    }
    for (let i = 1; i <= pagination.totalPages; i++) {
      html += `<button class="btn ${i === pagination.page ? 'btn-primary' : 'btn-outline-secondary'}" onclick="changePage(${i})">${i}</button>`;
    }
    if (pagination.page < pagination.totalPages) {
      html += `<button class="btn btn-outline-secondary" onclick="changePage(${pagination.page + 1})"><i class="bi bi-chevron-right"></i></button>`;
    }
    if (paginationButtons) {
      paginationButtons.innerHTML = html;
    }
  }

  window.changePage = (page) => {
    currentPage = page;
    loadPreorders();
  };

  /**
   * Cập nhật thẻ thống kê
   */
  function updateStats(orders) {
    if (!orders) return;
    if (statTotalOrders) statTotalOrders.textContent = orders.length;
    if (statPendingOrders) statPendingOrders.textContent = orders.filter(o => ['Da dat coc', 'Cho xu ly', 'Da co hang'].includes(o.trangThai)).length;
    if (statCompletedOrders) statCompletedOrders.textContent = orders.filter(o => ['Da nhan hang', 'Da nhan may'].includes(o.trangThai)).length;
    if (statCancelledOrders) statCancelledOrders.textContent = orders.filter(o => o.trangThai === 'Da huy').length;
  }
});
