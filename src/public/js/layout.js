// @ts-nocheck
/**
 * Module dựng Layout chung (Sidebar, Header, Phân quyền Menu, Kiểm tra Đăng nhập)
 */

let currentUser = null;

// Tự động nhúng thư viện in chứng từ chuẩn Thông tư Bộ Tài chính
if (typeof window !== 'undefined' && !window.docSoTienBangChu) {
  const printScript = document.createElement('script');
  printScript.src = '/js/print-templates.js';
  document.head.appendChild(printScript);
}


/**
 * Định nghĩa cấu trúc Menu và Ma trận Phân quyền 6 Vai trò
 * - Quản lý: Toàn quyền
 * - NV bán hàng: POS & HĐ, Bảo hành (tiếp nhận/tra cứu), Sản phẩm, Khách hàng
 * - Thủ kho: Sản phẩm, Quản lý IMEI, Danh mục, Phụ kiện, Nhà cung cấp
 * - Thu ngân: POS & HĐ, Sản phẩm, Khách hàng
 * - Kế toán: POS & HĐ (xem/tra cứu), Sản phẩm, Phụ kiện, Khách hàng, Nhà cung cấp
 * - Kỹ thuật: Tra cứu & Bảo hành, Sản phẩm, Quản lý IMEI (tra cứu/sửa trạng thái)
 */
const MENU_SCHEMA = [
  {
    category: 'Tổng quan',
    items: [
      {
        path: '/index.html',
        dataPath: '/index.html',
        label: 'Dashboard',
        shortLabel: 'Dashboard',
        icon: 'bi-grid-1x2',
        roles: ['Quản lý', 'Thủ kho', 'NV bán hàng', 'Thu ngân', 'Kế toán', 'Kỹ thuật']
      },
      {
        path: '/bao-cao/index.html',
        dataPath: '/bao-cao/',
        label: 'Báo cáo thống kê',
        shortLabel: 'Báo cáo',
        icon: 'bi-bar-chart-line',
        roles: ['Quản lý', 'Kế toán', 'Thu ngân']
      }
    ]
  },
  {
    category: 'Bán hàng & Hóa đơn',
    items: [
      {
        path: '/ban-hang/index.html',
        dataPath: '/ban-hang/',
        label: 'Bán hàng POS & Hóa đơn',
        shortLabel: 'Bán hàng POS',
        icon: 'bi-cart-check',
        roles: ['Quản lý', 'NV bán hàng', 'Thu ngân', 'Kế toán']
      },
      {
        path: '/dat-truoc/index.html',
        dataPath: '/dat-truoc/',
        label: 'Đặt hàng trước & Cọc',
        shortLabel: 'Đặt trước (Pre-order)',
        icon: 'bi-bookmark-star',
        roles: ['Quản lý', 'NV bán hàng', 'Thu ngân', 'Kế toán']
      },
      {
        path: '/doi-tra/index.html',
        dataPath: '/doi-tra/',
        label: 'Đổi trả máy & Hoàn tiền',
        shortLabel: 'Đổi trả máy',
        icon: 'bi-arrow-left-right',
        roles: ['Quản lý', 'NV bán hàng', 'Thu ngân', 'Kế toán', 'Thủ kho', 'Kỹ thuật']
      },
      {
        path: '/tra-gop/index.html',
        dataPath: '/tra-gop/',
        label: 'Quản lý Trả góp',
        shortLabel: 'Trả góp',
        icon: 'bi-file-earmark-text',
        roles: ['Quản lý', 'NV bán hàng', 'Thu ngân', 'Kế toán']
      }
    ]
  },
  {
    category: 'Tài chính & Sổ quỹ',
    items: [
      {
        path: '/so-quy/index.html',
        dataPath: '/so-quy/',
        label: 'Thu - Chi & Sổ quỹ',
        shortLabel: 'Sổ quỹ',
        icon: 'bi-wallet2',
        roles: ['Quản lý', 'Thu ngân', 'Kế toán']
      },
      {
        path: '/cong-no/index.html',
        dataPath: '/cong-no/',
        label: 'Quản lý Công nợ (KH & NCC)',
        shortLabel: 'Công nợ',
        icon: 'bi-journal-bookmark',
        roles: ['Quản lý', 'Thu ngân', 'Kế toán']
      }
    ]
  },
  {
    category: 'Dịch vụ & Bảo hành',
    items: [
      {
        path: '/bao-hanh/index.html',
        dataPath: '/bao-hanh/',
        label: 'Tra cứu & Bảo hành',
        shortLabel: 'Bảo hành',
        icon: 'bi-shield-check',
        roles: ['Quản lý', 'NV bán hàng', 'Kỹ thuật']
      }
    ]
  },
  {
    category: 'Quản lý Hàng hóa',
    items: [
      {
        path: '/nhap-kho/index.html',
        dataPath: '/nhap-kho/',
        label: 'Nhập kho (IMEI & Phụ kiện)',
        shortLabel: 'Nhập kho',
        icon: 'bi-box-arrow-in-down',
        roles: ['Quản lý', 'Thủ kho', 'Kế toán']
      },
      {
        path: '/don-dat-hang-ncc/index.html',
        dataPath: '/don-dat-hang-ncc/',
        label: 'Đặt hàng NCC',
        shortLabel: 'Đặt hàng NCC',
        icon: 'bi-cart-plus',
        roles: ['Quản lý', 'Thủ kho']
      },
      {
        path: '/san-pham/index.html',
        dataPath: '/san-pham/',
        label: 'Sản phẩm',
        shortLabel: 'Sản phẩm',
        icon: 'bi-phone',
        roles: ['Quản lý', 'Thủ kho', 'NV bán hàng', 'Thu ngân', 'Kế toán', 'Kỹ thuật']
      },
      {
        path: '/may-imei/index.html',
        dataPath: '/may-imei/',
        label: 'Quản lý IMEI/Máy',
        shortLabel: 'Quản lý IMEI',
        icon: 'bi-upc-scan',
        roles: ['Quản lý', 'Thủ kho', 'Kỹ thuật']
      },
      {
        path: '/danh-muc/index.html',
        dataPath: '/danh-muc/',
        label: 'Danh mục',
        shortLabel: 'Danh mục',
        icon: 'bi-tags',
        roles: ['Quản lý', 'Thủ kho']
      },
      {
        path: '/phu-kien/index.html',
        dataPath: '/phu-kien/',
        label: 'Phụ kiện',
        shortLabel: 'Phụ kiện',
        icon: 'bi-headphones',
        roles: ['Quản lý', 'Thủ kho', 'Kế toán']
      },
      {
        path: '/kiem-ke/index.html',
        dataPath: '/kiem-ke/',
        label: 'Kiểm kê kho & Đối soát IMEI',
        shortLabel: 'Kiểm kê kho',
        icon: 'bi-clipboard-check',
        roles: ['Quản lý', 'Thủ kho', 'Kế toán']
      }
    ]
  },
  {
    category: 'Đối tác & Khách hàng',
    items: [
      {
        path: '/khach-hang/index.html',
        dataPath: '/khach-hang/',
        label: 'Khách hàng',
        shortLabel: 'Khách hàng',
        icon: 'bi-people',
        roles: ['Quản lý', 'NV bán hàng', 'Thu ngân', 'Kế toán']
      },
      {
        path: '/nha-cung-cap/index.html',
        dataPath: '/nha-cung-cap/',
        label: 'Nhà cung cấp',
        shortLabel: 'Nhà cung cấp',
        icon: 'bi-truck',
        roles: ['Quản lý', 'Thủ kho', 'Kế toán']
      }
    ]
  },
  {
    category: 'Hệ thống',
    items: [
      {
        path: '/nhan-vien/index.html',
        dataPath: '/nhan-vien/',
        label: 'Nhân viên & Phân quyền',
        shortLabel: 'Nhân viên',
        icon: 'bi-shield-lock',
        roles: ['Quản lý']
      },
      {
        path: '/admin/index.html',
        dataPath: '/admin/',
        label: 'Admin Dashboard',
        shortLabel: 'Admin',
        icon: 'bi-gear',
        roles: ['Quản lý', 'Admin']
      }
    ]
  }
];

function getRoleBadgeClass(vaiTro) {
  switch (vaiTro) {
    case 'Quản lý': return 'role-quanly';
    case 'Thủ kho': return 'role-thukho';
    case 'NV bán hàng': return 'role-banhang';
    case 'Thu ngân': return 'role-thungan';
    case 'Kế toán': return 'role-ketoan';
    case 'Kỹ thuật': return 'role-kythuat';
    default: return '';
  }
}

/**
 * Kiểm tra quyền truy cập trực tiếp URL của người dùng
 */
function checkPageAccess(user) {
  const currentPath = window.location.pathname;
  if (currentPath === '/' || currentPath === '/index.html' || currentPath.includes('login.html') || currentPath.includes('404.html')) {
    return true;
  }

  let matchedItem = null;
  for (const cat of MENU_SCHEMA) {
    for (const item of cat.items) {
      if (currentPath.includes(item.dataPath)) {
        matchedItem = item;
        break;
      }
    }
    if (matchedItem) break;
  }

  if (matchedItem && !matchedItem.roles.includes(user.vaiTro)) {
    alert(`Tài khoản vai trò "${user.vaiTro}" không có quyền truy cập trang này! Hệ thống sẽ chuyển hướng về Trang chủ.`);
    window.location.href = '/index.html';
    return false;
  }

  return true;
}

/**
 * Tự động ẩn các nút hành động (Thêm/Sửa/Xóa) trên trang nếu vai trò không có quyền
 */
function applyRoleElementPermissions(user) {
  if (!user) return;

  // 1. Quét các phần tử có data-roles
  document.querySelectorAll('[data-roles], [data-allow-roles]').forEach(el => {
    const rolesAttr = el.getAttribute('data-roles') || el.getAttribute('data-allow-roles') || '';
    const allowedRoles = rolesAttr.split(',').map(r => r.trim());
    if (!allowedRoles.includes(user.vaiTro)) {
      el.style.display = 'none';
      el.classList.add('d-none');
    }
  });

  // 2. Ẩn nút tạo mới trên Header trang tĩnh nếu không có quyền tạo
  const path = window.location.pathname;
  const btnCreate = document.getElementById('btnCreateContainer') || document.getElementById('btnThemMoi');
  
  if (btnCreate) {
    if (path.includes('/san-pham/') && !['Quản lý', 'Thủ kho'].includes(user.vaiTro)) {
      btnCreate.style.display = 'none';
    } else if (path.includes('/danh-muc/') && !['Quản lý', 'Thủ kho'].includes(user.vaiTro)) {
      btnCreate.style.display = 'none';
    } else if (path.includes('/phu-kien/') && !['Quản lý', 'Thủ kho'].includes(user.vaiTro)) {
      btnCreate.style.display = 'none';
    } else if (path.includes('/may-imei/') && !['Quản lý', 'Thủ kho'].includes(user.vaiTro)) {
      btnCreate.style.display = 'none';
    } else if (path.includes('/khach-hang/') && !['Quản lý', 'NV bán hàng', 'Thu ngân'].includes(user.vaiTro)) {
      btnCreate.style.display = 'none';
    } else if (path.includes('/nha-cung-cap/') && !['Quản lý', 'Thủ kho', 'Kế toán'].includes(user.vaiTro)) {
      btnCreate.style.display = 'none';
    } else if (path.includes('/nhan-vien/') && !['Quản lý'].includes(user.vaiTro)) {
      btnCreate.style.display = 'none';
    }
  }
}

async function initLayout() {
  const path = window.location.pathname;
  if (path.includes('login.html') || path === '/login') {
    return;
  }

  // 1. Kiểm tra phiên đăng nhập
  const res = await api.get('/auth/me');
  const user = res.user || (res.data && res.data.user) || (res.data && res.data.hoTen ? res.data : null);

  if (!res.success || !user) {
    sessionStorage.setItem('returnTo', window.location.pathname + window.location.search);
    window.location.href = '/login.html';
    return;
  }

  currentUser = user;

  // 2. Kiểm tra quyền truy cập trang hiện tại
  if (!checkPageAccess(currentUser)) {
    return;
  }

  // 3. Chèn Sidebar & Navbar vào trang theo đúng quyền
  renderSidebarAndNavbar(currentUser);

  // 4. Highlight menu hiện tại
  highlightCurrentMenu();

  // 5. Ẩn các nút hành động vượt quyền trên trang
  applyRoleElementPermissions(currentUser);
}

function renderSidebarAndNavbar(user) {
  // Lọc Menu theo vai trò
  const filteredNav = MENU_SCHEMA.map(cat => {
    const allowedItems = cat.items.filter(item => item.roles.includes(user.vaiTro));
    return {
      category: cat.category,
      items: allowedItems
    };
  }).filter(cat => cat.items.length > 0);

  const roleClass = getRoleBadgeClass(user.vaiTro);

  // Render Sidebar
  const sidebarContainer = document.getElementById('appSidebar');
  if (sidebarContainer) {
    sidebarContainer.innerHTML = `
      <aside class="app-sidebar">
        <div class="sidebar-header">
          <a href="/index.html" class="sidebar-brand">
            <i class="bi bi-phone-vibrate"></i>
            <span>ONE TECH STORE</span>
          </a>
          <button class="sidebar-toggle-btn" id="btnCollapseSidebar" title="Thu/Mở thanh bên">
            <i class="bi bi-layout-sidebar-inset"></i>
          </button>
        </div>

        <div class="sidebar-nav">
          ${filteredNav.map(cat => `
            <div class="nav-category">${escapeHtml(cat.category)}</div>
            ${cat.items.map(item => `
              <a href="${item.path}" class="sidebar-link" data-path="${item.dataPath}" data-label="${escapeHtml(item.shortLabel || item.label)}">
                <i class="bi ${item.icon}"></i>
                <span>${escapeHtml(item.label)}</span>
              </a>
            `).join('')}
          `).join('')}
        </div>

        <div class="sidebar-user">
          <div class="d-flex align-items-center gap-2 mb-2 user-profile-box">
            <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 user-avatar" style="width: 36px; height: 36px; font-weight: 700;">
              ${user.hoTen ? user.hoTen.charAt(0).toUpperCase() : 'U'}
            </div>
            <div class="overflow-hidden user-info">
              <div class="text-white small fw-bold text-truncate">${escapeHtml(user.hoTen)}</div>
              <div class="user-role-badge ${roleClass}">${escapeHtml(user.vaiTro)}</div>
            </div>
          </div>
          <button id="btnLogout" class="btn btn-sm btn-logout w-100 mt-1" data-label="Đăng xuất" title="Đăng xuất">
            <i class="bi bi-box-arrow-right"></i> <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <!-- Overlay cho mobile -->
      <div class="sidebar-overlay" id="sidebarOverlay"></div>
    `;
  }

  // Render Navbar
  const navbarContainer = document.getElementById('appNavbar');
  if (navbarContainer) {
    const initials = user.hoTen ? user.hoTen.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase() : 'U';
    navbarContainer.innerHTML = `
      <header class="app-navbar">
        <div class="d-flex align-items-center gap-3">
          <button class="btn btn-light d-lg-none shadow-sm rounded-3" type="button" id="btnToggleSidebar">
            <i class="bi bi-list fs-5"></i>
          </button>
          <div class="d-flex align-items-center gap-2">
            <div class="d-flex align-items-center justify-content-center rounded-3 text-white" style="width: 32px; height: 32px; background: linear-gradient(135deg, #4f46e5, #06b6d4); box-shadow: 0 2px 8px rgba(79,70,229,0.3);">
              <i class="bi bi-phone-vibrate-fill" style="font-size: 0.95rem;"></i>
            </div>
            <div class="d-none d-md-block">
              <div class="fw-bold text-dark" style="font-size: 0.92rem; letter-spacing: -0.01em;">Hệ thống Quản lý Bán hàng OneTech Store</div>
              <div class="text-muted" style="font-size: 0.72rem;">Theo dõi &amp; Quản lý chi tiết từng máy theo số IMEI</div>
            </div>
          </div>
        </div>

        <div class="d-flex align-items-center gap-3">
          <!-- Đồng hồ thời gian thực -->
          <div class="d-none d-lg-flex align-items-center gap-2 px-3 py-1 rounded-pill" style="background: rgba(238, 242, 255, 0.9); border: 1px solid #c7d2fe; font-size: 0.8rem; color: #4338ca; font-weight: 500;">
            <i class="bi bi-clock-history"></i>
            <span id="liveClockDisplay">--:--:--</span>
          </div>

          <!-- Thông tin tài khoản -->
          <div class="d-flex align-items-center gap-2 ps-2">
            <div class="text-end d-none d-sm-block">
              <div class="fw-bold small text-dark" style="line-height: 1.2;">${escapeHtml(user.hoTen)}</div>
              <div class="d-flex align-items-center justify-content-end gap-1 mt-0.5">
                <span class="user-role-badge ${roleClass}" style="font-size: 0.68rem; font-weight: 600; padding: 2px 6px;">${escapeHtml(user.vaiTro)}</span>
                <span class="text-muted" style="font-size: 0.72rem;">@${escapeHtml(user.tenDangNhap)}</span>
              </div>
            </div>
            <div class="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold shadow-sm" style="width: 38px; height: 38px; background: linear-gradient(135deg, #6366f1, #a855f7); font-size: 0.85rem; border: 2px solid #ffffff;">
              ${initials}
            </div>
          </div>
        </div>
      </header>
    `;

    // Khởi động đồng hồ live ticking
    const clockEl = document.getElementById('liveClockDisplay');
    if (clockEl) {
      const updateClock = () => {
        const now = new Date();
        clockEl.textContent = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' - ' + now.toLocaleDateString('vi-VN');
      };
      updateClock();
      setInterval(updateClock, 1000);
    }
  }

  // ── Sự kiện đăng xuất ──────────────────────────────────
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        await api.post('/auth/logout');
        window.location.href = '/login.html';
      }
    });
  }

  // ── Collapse sidebar trên desktop ──────────────────────
  const btnCollapse = document.getElementById('btnCollapseSidebar');
  const sidebar = document.querySelector('.app-sidebar');

  function updateCollapseIcon(isCollapsed) {
    if (!btnCollapse) return;
    const icon = btnCollapse.querySelector('i');
    if (icon) {
      icon.className = isCollapsed ? 'bi bi-layout-sidebar' : 'bi bi-layout-sidebar-inset';
    }
  }

  // Khôi phục trạng thái từ localStorage
  if (sidebar && localStorage.getItem('sidebarCollapsed') === 'true') {
    sidebar.classList.add('collapsed');
    document.body.classList.add('sidebar-collapsed');
    updateCollapseIcon(true);
  }

  if (btnCollapse && sidebar) {
    btnCollapse.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isCollapsed = sidebar.classList.toggle('collapsed');
      document.body.classList.toggle('sidebar-collapsed', isCollapsed);
      updateCollapseIcon(isCollapsed);
      localStorage.setItem('sidebarCollapsed', isCollapsed);
    });
  }

  // ── Toggle sidebar trên mobile (hamburger navbar) ──────
  const btnToggleSidebar = document.getElementById('btnToggleSidebar');
  const overlay = document.getElementById('sidebarOverlay');

  function openMobileSidebar() {
    if (sidebar) sidebar.classList.add('show');
    if (overlay) overlay.classList.add('show');
  }

  function closeMobileSidebar() {
    if (sidebar) sidebar.classList.remove('show');
    if (overlay) overlay.classList.remove('show');
  }

  if (btnToggleSidebar) {
    btnToggleSidebar.addEventListener('click', openMobileSidebar);
  }

  // Đóng sidebar khi click overlay
  if (overlay) {
    overlay.addEventListener('click', closeMobileSidebar);
  }

  // Đóng sidebar khi click link trên mobile
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 992) closeMobileSidebar();
    });
  });
}

function highlightCurrentMenu() {
  const currentPath = window.location.pathname;
  const links = document.querySelectorAll('.sidebar-link');
  
  links.forEach(link => {
    const dataPath = link.getAttribute('data-path');
    if (dataPath) {
      if (dataPath === '/index.html' && (currentPath === '/' || currentPath === '/index.html')) {
        link.classList.add('active');
        link.scrollIntoView({ block: 'nearest' });
      } else if (dataPath !== '/index.html' && currentPath.includes(dataPath)) {
        link.classList.add('active');
        link.scrollIntoView({ block: 'nearest' });
      }
    }
  });
}

// =========================================
// UNIVERSAL CUSTOM DROPDOWN ENGINE
// =========================================
function getDropdownIconForSelect(select) {
  const id = (select.id || '').toLowerCase();
  const name = (select.name || '').toLowerCase();
  if (id.includes('danhmuc') || name.includes('danhmuc')) return 'bi-tags';
  if (id.includes('hang') || name.includes('hang')) return 'bi-building';
  if (id.includes('sanpham') || name.includes('sanpham') || id.includes('may') || name.includes('may')) return 'bi-phone';
  if (id.includes('vaitro') || name.includes('vaitro') || id.includes('role')) return 'bi-person-badge';
  if (id.includes('trangthai') || name.includes('trangthai') || id.includes('status')) return 'bi-activity';
  if (id.includes('kho') || name.includes('kho')) return 'bi-archive';
  if (id.includes('ncc') || name.includes('nhacungcap')) return 'bi-truck';
  if (id.includes('khachhang') || name.includes('khachhang')) return 'bi-person-heart';
  if (id.includes('linhkien') || name.includes('linhkien')) return 'bi-cpu';
  if (id.includes('phukien') || name.includes('phukien')) return 'bi-headphones';
  if (id.includes('baohanh')) return 'bi-shield-check';
  return 'bi-chevron-expand';
}

function enhanceSelect(select) {
  if (!select || select.dataset.enhanced === 'true' || select.classList.contains('d-none')) return;

  // Mark as enhanced
  select.dataset.enhanced = 'true';
  select.style.display = 'none';

  // Create wrapper container
  const container = document.createElement('div');
  container.className = 'custom-dropdown-container';
  if (select.classList.contains('form-select-sm')) {
    container.classList.add('custom-dropdown-sm');
  }

  // Insert container after select
  select.parentNode.insertBefore(container, select.nextSibling);

  function getSelectedOption() {
    return select.options[select.selectedIndex] || select.options[0];
  }

  function updateTriggerUI() {
    const triggerEl = container.querySelector('.custom-dropdown-trigger');
    if (!triggerEl) return;
    const defaultIcon = getDropdownIconForSelect(select);
    const selectedOption = getSelectedOption();
    const isDefaultSelected = !select.value;
    const currentText = selectedOption ? selectedOption.text : '-- Chọn --';

    triggerEl.innerHTML = `
      <div class="custom-dropdown-value">
        <div class="custom-dropdown-avatar" style="background: ${isDefaultSelected ? 'linear-gradient(135deg, #e0e7ff, #c7d2fe)' : 'linear-gradient(135deg, #4f46e5, #06b6d4)'}; color: ${isDefaultSelected ? '#4338ca' : '#ffffff'}; width: 28px; height: 28px; font-size: 0.8rem;">
          <i class="bi ${defaultIcon}"></i>
        </div>
        <div class="overflow-hidden">
          <div class="custom-dropdown-name" style="font-size: 0.84rem;">${escapeHtml(currentText)}</div>
        </div>
      </div>
      <i class="bi bi-chevron-down custom-dropdown-chevron"></i>
    `;
  }

  function renderOptionsList(keyword = '') {
    const listEl = container.querySelector('.custom-dropdown-options-list');
    if (!listEl) return;

    const kw = (keyword || '').trim().toLowerCase();
    const defaultIcon = getDropdownIconForSelect(select);
    const optionsArray = Array.from(select.options);

    const filtered = optionsArray.filter(opt => {
      if (!kw) return true;
      return opt.text.toLowerCase().includes(kw) || opt.value.toLowerCase().includes(kw);
    });

    if (filtered.length === 0) {
      listEl.innerHTML = `<div class="p-3 text-center text-muted small"><i class="bi bi-search me-1"></i>Không có mục phù hợp</div>`;
      return;
    }

    listEl.innerHTML = filtered.map(opt => {
      const isSelected = opt.value === select.value;
      const isDefault = !opt.value;
      return `
        <div class="custom-dropdown-option ${isSelected ? 'active' : ''}" data-value="${escapeHtml(opt.value)}">
          <div class="d-flex align-items-center gap-2 overflow-hidden">
            <div class="custom-dropdown-avatar" style="background: ${isDefault ? 'linear-gradient(135deg, #e0e7ff, #c7d2fe)' : 'linear-gradient(135deg, #eef2ff, #e0e7ff)'}; color: #4f46e5; width: 26px; height: 26px; font-size: 0.75rem;">
              <i class="bi ${isDefault ? 'bi-grid' : defaultIcon}"></i>
            </div>
            <div class="fw-semibold text-truncate small">${escapeHtml(opt.text)}</div>
          </div>
          <i class="bi bi-check2-circle check-icon"></i>
        </div>
      `;
    }).join('');
  }

  function buildDropdownDOM() {
    const totalOptions = select.options.length;
    const showSearch = totalOptions > 5;

    container.innerHTML = `
      <div class="custom-dropdown-trigger"></div>
      <div class="custom-dropdown-menu">
        ${showSearch ? `
          <div class="custom-dropdown-search-wrapper">
            <i class="bi bi-search"></i>
            <input type="text" class="custom-dropdown-search-input" placeholder="Tìm kiếm..." autocomplete="off">
          </div>
        ` : ''}
        <div class="custom-dropdown-options-list"></div>
      </div>
    `;

    updateTriggerUI();
    renderOptionsList('');

    const searchInput = container.querySelector('.custom-dropdown-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        renderOptionsList(e.target.value);
      });
    }
  }

  buildDropdownDOM();

  // Delegated click handler on container
  container.addEventListener('click', (e) => {
    const searchWrapper = e.target.closest('.custom-dropdown-search-wrapper');
    if (searchWrapper) {
      e.stopPropagation();
      return;
    }

    const trigger = e.target.closest('.custom-dropdown-trigger');
    if (trigger) {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = container.classList.contains('open');
      closeAllDropdowns(container);
      if (!isOpen) {
        container.classList.add('open');
        container.closest('.card-custom')?.classList.add('has-open-dropdown');
        const searchInput = container.querySelector('.custom-dropdown-search-input');
        if (searchInput) {
          searchInput.value = '';
          renderOptionsList('');
          setTimeout(() => searchInput.focus(), 50);
        }
      } else {
        container.classList.remove('open');
        container.closest('.card-custom')?.classList.remove('has-open-dropdown');
      }
      return;
    }

    const option = e.target.closest('.custom-dropdown-option');
    if (option) {
      e.preventDefault();
      e.stopPropagation();
      const val = option.dataset.value;
      select.value = val;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      select.dispatchEvent(new Event('input', { bubbles: true }));
      container.classList.remove('open');
      container.closest('.card-custom')?.classList.remove('has-open-dropdown');
      updateTriggerUI();
      renderOptionsList('');
      return;
    }
  });

  // Watch for external changes
  select.addEventListener('change', () => {
    updateTriggerUI();
    renderOptionsList('');
  });

  // Watch for dynamic DOM option additions / removals
  const observer = new MutationObserver(() => {
    buildDropdownDOM();
  });
  observer.observe(select, { childList: true, subtree: true });
}

function enhanceAllSelects() {
  document.querySelectorAll('select.form-select:not([data-no-enhance])').forEach(sel => {
    enhanceSelect(sel);
  });
}

function closeAllDropdowns(exceptContainer = null) {
  document.querySelectorAll('.custom-dropdown-container').forEach(c => {
    if (c !== exceptContainer) {
      c.classList.remove('open');
      c.closest('.card-custom')?.classList.remove('has-open-dropdown');
    }
  });
}

document.addEventListener('click', () => closeAllDropdowns());
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeAllDropdowns();
});

window.enhanceAllSelects = enhanceAllSelects;
window.enhanceSelect = enhanceSelect;

// =========================================
// CURRENCY INPUT FORMATTING
// =========================================
function applyCurrencyFormat() {
  document.querySelectorAll('input.format-currency').forEach(input => {
    // Ngăn chặn format nhiều lần nếu đã gắn
    if (input.dataset.currencyEnhanced) return;
    input.dataset.currencyEnhanced = 'true';

    input.addEventListener('input', function(e) {
      // Chỉ giữ lại số
      let value = this.value.replace(/[^\d]/g, '');
      if (value) {
        this.value = parseInt(value, 10).toLocaleString('vi-VN');
      } else {
        this.value = '';
      }
    });

    // Nếu đã có giá trị sẵn (VD edit form), format ngay
    if (input.value) {
      let value = input.value.replace(/[^\d]/g, '');
      if (value) {
        input.value = parseInt(value, 10).toLocaleString('vi-VN');
      }
    }
  });
}
window.applyCurrencyFormat = applyCurrencyFormat;

document.addEventListener('DOMContentLoaded', () => {
  initLayout();
  enhanceAllSelects();
  applyCurrencyFormat();
  setTimeout(enhanceAllSelects, 300);
  setTimeout(enhanceAllSelects, 1000);
  setTimeout(applyCurrencyFormat, 300);
  setTimeout(applyCurrencyFormat, 1000);
});
