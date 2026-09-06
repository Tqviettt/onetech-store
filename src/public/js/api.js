/**
 * Module hỗ trợ gọi RESTful API và các tiện ích Client-Side
 */

const API_BASE = '/api';

const api = {
  async request(endpoint, options = {}) {
    let url = endpoint;
    if (!url.startsWith('http')) {
      if (url.startsWith('/api/')) {
        // Đã có tiền tố /api/
      } else if (url.startsWith('/')) {
        url = `${API_BASE}${url}`;
      } else {
        url = `${API_BASE}/${url}`;
      }
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers || {})
    };

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        // Chưa đăng nhập hoặc hết phiên -> Chuyển về trang đăng nhập
        if (!window.location.pathname.includes('login.html')) {
          sessionStorage.setItem('returnTo', window.location.pathname + window.location.search);
          window.location.href = '/login.html';
        }
        return { success: false, message: data.message || 'Vui lòng đăng nhập' };
      }

      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          message: data.message || `Lỗi HTTP: ${response.status}`
        };
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      return {
        success: false,
        message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.'
      };
    }
  },

  get(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    return this.request(url, { method: 'GET' });
  },

  post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  put(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};

const apiFetch = (endpoint, options = {}) => api.request(endpoint, options);
window.apiFetch = apiFetch;
window.api = api;

/**
 * Hiển thị Toast thông báo phía trên góc phải màn hình
 */
function showToast(message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);
  }

  const toastId = 'toast_' + Date.now();
  const icon = type === 'success' ? 'bi-check-circle-fill' : (type === 'danger' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill');
  const bgClass = type === 'success' ? 'bg-success text-white' : (type === 'danger' ? 'bg-danger text-white' : 'bg-primary text-white');

  const toastHtml = `
    <div id="${toastId}" class="toast align-items-center ${bgClass} border-0 shadow mb-2 show" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body d-flex align-items-center gap-2">
          <i class="bi ${icon} fs-5"></i>
          <div>${message}</div>
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', toastHtml);

  setTimeout(() => {
    const el = document.getElementById(toastId);
    if (el) {
      el.remove();
    }
  }, 4500);
}

/**
 * Định dạng tiền tệ VNĐ
 */
function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 đ';
  return Number(amount).toLocaleString('vi-VN') + ' đ';
}

/**
 * Tự động thêm dấu chấm . phân cách hàng nghìn khi người dùng gõ số tiền vào ô input
 */
function maskCurrencyInput(el) {
  if (!el) return;
  const cursor = el.selectionStart;
  const oldLength = el.value ? el.value.length : 0;
  const rawVal = String(el.value || '').replace(/\D/g, '');
  if (!rawVal) {
    el.value = '';
    return;
  }
  const formatted = Number(rawVal).toLocaleString('vi-VN');
  el.value = formatted;
  const newLength = formatted.length;
  if (cursor !== null && document.activeElement === el) {
    const pos = Math.max(0, cursor + (newLength - oldLength));
    try {
      el.setSelectionRange(pos, pos);
    } catch (err) {}
  }
}

/**
 * Trích xuất giá trị số thuần túy (bỏ hết dấu chấm .) từ ô input tiền tệ
 */
function parseCurrencyValue(val) {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const cleaned = String(val).replace(/\./g, '').replace(/\D/g, '');
  return Number(cleaned) || 0;
}

window.maskCurrencyInput = maskCurrencyInput;
window.parseCurrencyValue = parseCurrencyValue;

/**
 * Định dạng ngày giờ VN
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Lấy danh sách query parameters từ URL
 */
function getQueryParams() {
  const params = {};
  const searchParams = new URLSearchParams(window.location.search);
  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }
  return params;
}

/**
 * Escape HTML để chống XSS
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Debounce helper giúp hạn chế tần suất gọi hàm (tìm kiếm, gõ phím)
 * @param {Function} fn Hàm cần thực thi
 * @param {number} delay Thời gian chờ (mili-giây), mặc định 300ms
 */
function debounce(fn, delay = 300) {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

window.debounce = debounce;
