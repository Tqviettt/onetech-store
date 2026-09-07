# PROJECT WALKTHROUGH — ONE TECH STORE
> **Tài liệu bàn giao kỹ thuật & kiến trúc toàn diện dành cho AI Agent và Developer tiếp nhận dự án.**
> **Kiến trúc hiện tại: Layered MVC + OOP Service & Controller Layer (Node.js / Express / Mongoose / Vanilla JS).**

---

## 1. TỔNG QUAN DỰ ÁN & BÀI TOÁN KINH DOANH

* **Tên dự án:** One Tech Store — Hệ thống Quản lý Bán hàng Chuỗi Cửa hàng Điện thoại.
* **Đặc thù nghiệp vụ cốt lõi:** **Quản lý hàng hóa theo từng số IMEI/Serial vật lý riêng biệt**. 
  - Với điện thoại/máy tính bảng: Không quản lý theo số lượng gộp. Mỗi chiếc máy là 1 bản ghi riêng trong CSDL gắn với 1 mã IMEI (15 ký tự), có giá nhập riêng, màu sắc, dung lượng và trạng thái độc lập (*Còn hàng, Đã bán, Bảo hành, Lỗi*).
  - Với phụ kiện (củ sạc, cáp, tai nghe...): Quản lý theo số lượng tồn kho (`soLuongTon`).
  - Mọi luồng giao dịch (Bán hàng -> Xuất kho -> Bảo hành -> Đổi trả) đều truy vết chính xác theo từng số IMEI.

---

## 2. KIẾN TRÚC KỸ THUẬT (LAYERED MVC & OOP ARCHITECTURE)

Hệ thống được tổ chức theo mô hình **Layered MVC kết hợp OOP Service Layer** (Decoupled Backend API & Static Frontend):

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        KIẾN TRÚC TỔNG THỂ HỆ THỐNG (LAYERED MVC + OOP)                 │
└────────────────────────────────────────────────────────────────────────────────────────┘

 [ CLIENT / BROWSER (VIEW) ]
       │
       ├─► 1. Static Web Pages: 100% HTML5 thuần + Bootstrap 5 + Bootstrap Icons (src/public/)
       │      - Dashboard, Bán hàng POS, Tra cứu & Bảo hành, Quản lý IMEI, Sản phẩm...
       │      - Tự động dựng layout (Sidebar, Navbar) theo vai trò qua js/layout.js
       │
       └─► 2. Client JS Modules: Gọi RESTful API qua Fetch API Wrapper (src/public/js/api.js)
              - js/banhang.js, js/baohanh.js, js/mayimei.js, js/sanpham.js...
       │
       ▼ HTTP Request (JSON / Cookie Session)
 [ EXPRESS SERVER ] (src/app.js & src/server.js)
       │
       ├─► Middlewares:
       │      - express.json(), express.urlencoded(), express-session
       │      - requireAuth, requireRole (RBAC 6 vai trò, trả về JSON 401/403)
       │
       ├─► RESTful API Routes: /api/... (src/routes/)
       │      - /api/auth, /api/dashboard, /api/hoa-don, /api/bao-hanh, /api/may-imei...
       │
       ├─► Controllers OOP (src/controllers/):
       │      - Kế thừa BaseController (chuẩn hóa sendSuccess, sendError, handleError)
       │      - HoaDonController, BaoHanhController, MayImeiController, SanPhamController...
       │
       ├─► Services OOP (src/services/):
       │      - Kế thừa BaseService (đóng gói toàn bộ Business Rules & Concurrency Validation)
       │      - HoaDonService, BaoHanhService, MayImeiService, SanPhamService...
       │
       └─► Mongoose ODM Models: src/models/ (26 Models CSDL)
              │
              ▼
       [ MONGODB DATABASE ] (mongodb://127.0.0.1:27017/onetech_store)
```

### 2.1. Thiết kế Giao diện & Trải nghiệm Người dùng (Frontend UI/UX Redesign)
* **Giao diện Hiện đại & Hoạt ảnh mượt mà (`src/public/css/style.css`):**
  - Tích hợp bộ Keyframe Animations đồng bộ (`fadeInUp`, `slideDown`, `cardIn`, `logoSpin`, `bgFloat`...).
  - Thiết kế card phong cách glassmorphism, shadow đổ bóng tự nhiên, viền tinh tế và màu sắc gradient hiện đại.
* **Hệ thống Điều hướng Thông minh (`src/public/js/layout.js` & `src/public/css/style.css`):**
  - **Sidebar Cố định & Thu gọn / Mở rộng (Fixed Collapsible Sidebar):** Thiết lập `position: fixed` bám trọn viền trái màn hình với thanh cuộn ẩn siêu gọn (`scrollbar-width: none`), tự động điều chỉnh `margin-left` co giãn (260px khi mở / 68px khi thu gọn), ghi nhớ trạng thái qua `localStorage` (`sidebarCollapsed`) và responsive mượt mà trên mobile.
  - **Mobile Responsive Drawer:** Hỗ trợ menu trượt kèm lớp nền mờ `sidebar-overlay`, tự động đóng sidebar khi người dùng chọn chuyển trang trên thiết bị di động (< 992px).
  - **Top Navbar Đa năng:** Tích hợp đồng hồ thời gian thực (Live ticking clock), Avatar Initials theo họ tên và hiển thị Badge vai trò sắc nét.
  - **Universal Custom Dropdown Engine (`enhanceSelect()`):** Tự động chuyển đổi toàn bộ `<select>` HTML thành Custom Dropdown hiện đại, tích hợp icon ngữ nghĩa (danh mục, hãng, kho, vai trò...), ô tìm kiếm tùy chọn realtime và animation mượt mà.
* **Tính năng Nhập hàng loạt IMEI & Ràng buộc Giá Gốc (`src/public/pages/nhap-kho/`, `src/services/SanPhamService.js`):**
  - **Thêm trường Giá Gốc (`giaGoc`) & Dung Lượng (`dungLuong`):** Model `SanPham` được bổ sung để quản lý giá nhập buôn dự kiến và phiên bản bộ nhớ máy.
  - **Ràng buộc nghiệp vụ Giá bán:** `SanPhamService` bắt buộc `giaBan > giaGoc` khi tạo mới và cập nhật, chống rủi ro bán lỗ.
  - **Tự động điền Giá gốc & Dung lượng:** Khi lập phiếu nhập kho, việc chọn model sẽ tự động điền đơn giá và dung lượng.
  - **Nhập Hàng Loạt IMEI (Bulk Import Modal):** Cho phép thủ kho quét mã vạch hoặc dán danh sách hàng chục IMEI cùng lúc để sinh các dòng nhập kho tự động.
* **Modal Xác nhận Xóa & Soft Delete Model Sản Phẩm (`src/public/pages/san-pham/`):** Tích hợp Modal Bootstrap `modalXacNhanXoa` phong cách hiện đại thay thế confirm thô sơ, hiệu ứng fade-out dòng tr sau khi ẩn và chuyển sang cơ chế Soft Delete (`status: false`) để bảo toàn lịch sử hóa đơn/IMEI.
* **Màn hình Đăng nhập Trực quan (`src/public/pages/login.html`):**
  - Hiệu ứng floating background orbs, logo chuyển động xoay tròn nhẹ khi tương tác, form focus nổi bật.
  - Hàng badge tài khoản demo tương tác cao giúp đăng nhập nhanh 1-click cho 6 vai trò.
* **Hiệu ứng Đếm số Dashboard (`src/public/js/dashboard.js`):**
  - Hàm `animateCount(elementId, target, duration)` với easing `easeOutCubic` giúp các chỉ số thống kê (Tổng máy IMEI, Còn hàng, Đã bán, Bảo hành, KH, NCC...) nhảy số trực quan khi tải trang.
  - Banner chào mừng kính mờ tích hợp vùng Quick Actions động hiển thị nút bấm phù hợp cho từng vai trò.
* **Quản lý Danh mục Nâng cao (`src/public/pages/danh-muc/index.html` & `src/public/js/danhmuc.js`):**
  - 4 thẻ thống kê tổng quan cơ cấu hàng hóa (Tổng DM, Model Điện thoại, Tablet, Phụ kiện).
  - Bố cục 2 cột cân đối: Danh sách phân loại (kèm icon theo tên danh mục) và Form thêm nhanh (Quick Add).
  - Tìm kiếm nhanh realtime có Debounce chống giật lag giao diện.
* **Phân quyền Giao diện Đa tầng & Bảo vệ Điều hướng (Client-side RBAC & Route Guarding):**
  - **Lọc Sidebar thông minh theo 6 vai trò:** Tự động ẩn các menu và danh mục nhóm (`nav-category`) không thuộc quyền hạn để loại bỏ tình trạng rối mắt.
  - **Tùy biến Quick Actions trên Dashboard:** Tự động hiển thị các nút thao tác đầu trang phù hợp với vai trò (Bán hàng, Thủ kho, Thu ngân, Kỹ thuật, Kế toán, Quản lý).
  - **Route Guarding:** Chặn và cảnh báo tự động điều hướng về `/index.html` khi người dùng nhập trực tiếp URL trang bị cấm.
  - **Phân biệt màu sắc vai trò:** Badge người dùng được gán màu sắc trực quan (`role-quanly`, `role-thukho`, `role-banhang`, `role-thungan`, `role-ketoan`, `role-kythuat`).

---

## 3. CẤU TRÚC THƯ MỤC DỰ ÁN (PROJECT STRUCTURE)

```
onetech/
├── .env.example                         # Mẫu cấu hình biến môi trường
├── package.json                         # Danh sách dependencies & scripts
├── brief-agent-one-tech-store.md        # Brief yêu cầu ban đầu của dự án
├── ke-hoach-lap-trinh-chi-tiet-v2.md    # Kế hoạch phân công 6 thành viên (chi tiết theo ngày)
├── one_tech_store_schema.sql            # Thiết kế CSDL 26 bảng chuẩn SQL
├── one_tech_store_mo_ta_bang.md         # Tài liệu mô tả chi tiết 26 bảng
├── one_tech_store_erd.dbml              # Sơ đồ quan hệ thực thể ERD
├── README.md                            # Hướng dẫn cài đặt & tài khoản demo
├── PROJECT_WALKTHROUGH.md               # Bản Walkthrough kỹ thuật (File này)
├── tests/                               # Bộ kiểm thử tự động (20 Test Suites, 790 Assertions)
│   ├── run_all_tests.js                 # Master Test Runner chạy toàn bộ 20 suites
│   ├── test_tuan_module.js              # Kiểm thử 60 test cases luồng Bán hàng POS, IMEI, Bảo hành
│   ├── test_tuan_tuan5_6_e2e.js         # Kiểm thử 33 test cases Luồng E2E tích hợp Bán hàng POS, Cọc, Bảo hành, KPI (Tuần 5-6)
│   ├── test_viet_module.js              # Kiểm thử 32 test cases Đặt hàng trước, Cọc & Hoàn cọc (Tuần 3)
│   ├── test_viet_tuan4.js               # Kiểm thử 39 test cases Đổi trả máy & Cấn trừ cọc (Tuần 4)
│   ├── test_viet_tuan5.js               # Kiểm thử 26 test cases Tình huống biên đổi kèm PK, Hủy phiếu RBAC (Tuần 5)
│   ├── test_viet_tuan6_e2e.js           # Kiểm thử 21 test cases Luồng E2E khép kín Đặt cọc -> POS -> Đổi trả -> Hủy phiếu (Tuần 6)
│   ├── test_an_tuan3.js                 # Kiểm thử 28 test cases Tồn kho dùng chung & Công nợ đa hình (Tuần 3)
│   ├── test_an_tuan4.js                 # Kiểm thử 24 test cases Đối soát công nợ & Quản lý quá hạn (Tuần 4)
│   ├── test_an_tuan5.js                 # Kiểm thử 23 test cases Hợp đồng Trả góp & Lịch thu kỳ hạn (Tuần 5)
│   ├── test_tuan_nhap_kho.js            # Kiểm thử 25 test cases Nhập kho máy IMEI & Phụ kiện (Tuần 3)
│   ├── test_tuan_tuan4.js               # Kiểm thử 13 test cases Nhập hàng loạt IMEI & Lịch sử NCC (Tuần 4)
│   ├── test_tuan_tuan5.js               # Kiểm thử 8 test cases Trả hàng NCC & Cấn trừ công nợ (Tuần 5)
│   ├── test_vuong_module.js             # Kiểm thử 37 test cases Thu - Chi & Báo cáo Sổ quỹ dùng chung (Tuần 3)
│   ├── verify_all_logins.js             # Kiểm thử ma trận đăng nhập 6 vai trò
│   ├── test_http_endpoints.js           # Kiểm thử 24 REST Endpoints & API Data Contracts (46 assertions)
│   ├── test_frontend_dom_contract.js    # Kiểm thử DOM ID Bindings & Frontend Data Extractors (65 assertions)
│   ├── test_concurrency_stress.js       # Kiểm thử tranh chấp đồng thời & Atomic Lock máy IMEI
│   └── test_ui_html_structure.js        # Kiểm thử cấu trúc HTML5, Bootstrap 5 & Assets (191 assertions)
└── src/
    ├── server.js                        # Entry point khởi động HTTP Server (Port 3000)
    ├── app.js                           # Cấu hình Express, Middleware, Static & API Routes
    ├── config/
    │   └── db.js                        # Kết nối MongoDB qua Mongoose
    ├── models/                          # 26 Mongoose Models (Đầy đủ theo thiết kế)
    │   ├── NhanVien.js, KhachHang.js, NhaCungCap.js
    │   ├── DanhMuc.js, SanPham.js, MayImei.js, PhuKien.js, LinhKien.js
    │   ├── HoaDon.js, CT_HoaDon_May.js, CT_HoaDon_PhuKien.js, PhieuXuatKho.js
    │   ├── PhieuBaoHanh.js, CT_PBH_LinhKien.js, PhieuDoiTra.js
    │   ├── PhieuNhap.js, CT_PhieuNhap.js, PhieuChi.js
    │   ├── Kho.js, TonKho.js, BienBanKiemKe.js, DieuChinhKho.js
    │   ├── CongNo.js, PhieuThu.js, DonDatHangTruoc.js, HopDongTraGop.js
    │   └── index.js                     # Export tập trung 26 models
    ├── services/                        # [TẦNG OOP SERVICE] Đóng gói toàn bộ logic nghiệp vụ
    │   ├── BaseService.js               # Base Class (phân trang, tạo lỗi HTTP chuẩn)
    │   ├── HoaDonService.js             # Bán hàng theo IMEI, chống xung đột 409, cấn trừ cọc
    │   ├── BaoHanhService.js            # Tiếp nhận, tính hạn BH, tra cứu, xuất linh kiện, hoàn tất
    │   ├── DatTruocService.js           # Đặt hàng trước, thu tiền cọc, hủy đơn hoàn cọc, gán IMEI
    │   ├── DoiTraService.js             # Đổi trả máy, đổi kèm phụ kiện, tính chênh lệch, hủy phiếu hoàn tác
    │   ├── TraGopService.js             # Lập HĐ trả góp, sinh lịch thu kỳ, thu tiền kỳ, tự sinh Phiếu Thu
    │   ├── CongNoService.js             # Công nợ đa hình, thanh toán nợ, đối soát & cảnh báo quá hạn
    │   ├── TonKhoService.js             # Hàm tồn kho dùng chung capNhatTonKho, thống kê tồn, phiếu xuất
    │   ├── PhieuNhapService.js          # Nhập kho máy IMEI & phụ kiện, tự tăng tồn, chi tiền/ghi nợ
    │   ├── ThanhToanService.js          # Sổ quỹ & Thu - Chi dùng chung (taoPhieuThu, taoPhieuChi)
    │   ├── MayImeiService.js            # Quản lý vòng đời máy IMEI (nhập lẻ / hàng loạt)
    │   ├── SanPhamService.js            # Quản lý Model máy & tính tồn kho tổng hợp
    │   ├── KhachHangService.js          # Quản lý khách hàng & lịch sử hóa đơn
    │   ├── NhanVienService.js           # Quản lý nhân viên, đổi mật khẩu, phân quyền
    │   ├── NhaCungCapService.js         # Quản lý nhà cung cấp
    │   ├── DanhMucService.js            # Quản lý danh mục sản phẩm
    │   ├── PhuKienService.js            # Quản lý phụ kiện & tồn kho số lượng
    │   ├── AuthService.js               # Xác thực đăng nhập & phiên làm việc
    │   ├── DashboardService.js          # Thống kê tổng hợp số liệu hệ thống
    │   └── index.js                     # Export tập hợp tất cả Services
    ├── controllers/                     # [TẦNG OOP CONTROLLER] Kế thừa BaseController
    │   ├── BaseController.js            # Base Class (sendSuccess, sendError, handleError)
    │   ├── authController.js            # POST /api/auth/login, logout, me
    │   ├── dashboardController.js       # GET /api/dashboard
    │   ├── hoaDonController.js          # GET /api/hoa-don, GET /:id, POST / (Bán hàng)
    │   ├── baoHanhController.js         # Tra cứu, tiếp nhận, xuất linh kiện, hoàn tất
    │   ├── datTruocController.js        # Đặt hàng trước, hủy hoàn cọc, gán IMEI
    │   ├── doiTraController.js          # Đổi trả máy, kiểm tra điều kiện, hủy phiếu RBAC
    │   ├── TraGopController.js          # Lập HĐ trả góp, xem lịch thu, thu tiền kỳ
    │   ├── congNoController.js          # CRUD công nợ, thanh toán nợ, đối soát, kiểm tra quá hạn
    │   ├── khoController.js             # Thống kê tồn kho, phiếu xuất
    │   ├── phieuNhapController.js       # Lập phiếu nhập kho, chi tiết
    │   ├── thanhToanController.js       # Thu, Chi, Báo cáo Sổ quỹ
    │   ├── mayImeiController.js         # CRUD máy IMEI
    │   ├── sanPhamController.js         # CRUD sản phẩm
    │   ├── khachHangController.js       # CRUD khách hàng
    │   ├── nhaCungCapController.js      # CRUD nhà cung cấp
    │   ├── nhanVienController.js        # CRUD nhân viên (chỉ Quản lý)
    │   ├── danhMucController.js         # CRUD danh mục
    │   └── phuKienController.js         # CRUD phụ kiện
    ├── routes/                          # Định tuyến REST API & Gắn RBAC Middleware
    │   ├── authRoutes.js, dashboardRoutes.js
    │   ├── hoaDonRoutes.js, baoHanhRoutes.js, datTruocRoutes.js
    │   ├── doiTraRoutes.js, traGopRoutes.js, congNoRoutes.js
    │   ├── khoRoutes.js, phieuNhapRoutes.js, thanhToanRoutes.js
    │   ├── sanPhamRoutes.js, mayImeiRoutes.js
    │   ├── khachHangRoutes.js, nhaCungCapRoutes.js
    │   ├── nhanVienRoutes.js, danhMucRoutes.js, phuKienRoutes.js
    │   └── index.js                     # Mount toàn bộ vào /api/...
    ├── middlewares/
    │   └── auth.js                      # requireAuth, requireRole (Trả JSON 401/403)
    ├── seeds/
    │   └── seed.js                      # Nạp dữ liệu mẫu 6 vai trò, SP, IMEI, HĐ, BH, Đổi trả
    └── public/                          # Frontend tĩnh (Tách bạch CSS, JS, HTML Pages)
        ├── css/                         # 🎨 TOÀN BỘ FILE STYLESHEET
        │   └── style.css                # CSS thiết kế giao diện, animations & theme
        ├── js/                          # ⚡ TOÀN BỘ FILE JAVASCRIPT CLIENT
        │   ├── api.js                   # Wrapper gọi API, toast notification, helper
        │   ├── layout.js                # Dựng Sidebar/Navbar & phân quyền Menu
        │   ├── banhang.js               # Logic POS bán hàng, giỏ hàng, in hóa đơn
        │   ├── baohanh.js               # Logic tra cứu IMEI, lập phiếu BH, xuất linh kiện
        │   ├── dattruoc.js              # Logic Đặt trước (Pre-order), thu/hoàn cọc
        │   ├── doitra.js                # Logic Đổi trả máy, đổi kèm phụ kiện, in biên bản, hủy phiếu
        │   ├── congno.js                # Logic Quản lý Công nợ & Thanh toán nợ
        │   ├── nhapkho.js               # Logic Nhập kho máy IMEI & Phụ kiện
        │   ├── soquy.js                 # Logic Báo cáo Sổ quỹ & Quản lý Thu/Chi
        │   └── auth.js, dashboard.js, sanpham.js, mayimei.js...
        └── pages/                       # 📄 TOÀN BỘ CÁC TRANG HTML GIAO DIỆN
            ├── index.html               # Dashboard tổng quan
            ├── login.html               # Đăng nhập (kèm nút chọn nhanh 6 vai trò)
            ├── 404.html                 # Trang 404 Not Found
            ├── ban-hang/index.html      # Màn hình Bán hàng POS theo IMEI & Quản lý HĐ
            ├── bao-hanh/index.html      # Màn hình Tra cứu dòng đời IMEI & Quản lý BH
            ├── dat-truoc/index.html     # Màn hình Quản lý Đơn đặt trước & Thu cọc
            ├── doi-tra/index.html       # Màn hình Quản lý Đổi trả máy, đổi kèm PK, in biên bản
            ├── cong-no/index.html       # Màn hình Quản lý Công nợ & Đối soát
            ├── nhap-kho/index.html      # Màn hình Nhập kho hàng hóa
            ├── so-quy/index.html        # Màn hình Sổ quỹ Thu - Chi
            ├── san-pham/                # index.html, form.html, detail.html
            ├── may-imei/                # index.html, form.html
            ├── khach-hang/              # index.html, form.html
            ├── nha-cung-cap/            # index.html, form.html
            ├── nhan-vien/               # index.html, form.html
            ├── danh-muc/                # index.html
            └── phu-kien/                # index.html
```

---

## 4. BẢN ĐỒ CƠ SỞ DỮ LIỆU (26 MODELS CHIA THEO 6 PHÂN HỆ)

```
├── 1. Danh mục & Sản phẩm (Core Inventory)
│   ├── DanhMuc (tenDanhMuc)
│   ├── SanPham (tenMay, hang, giaBan, soThangBH, moTa, danhMuc -> DanhMuc)
│   ├── MayImei (imei [PK], giaNhap, trangThai ['Con hang'|'Da ban'|'Bao hanh'|'Loi'], mauSac, dungLuong, sanPham -> SanPham)
│   ├── PhuKien (tenPK, giaBan, soLuongTon, danhMuc -> DanhMuc)
│   ├── LinhKien (tenLK, donGia, soLuongTon)
│   ├── NhanVien (hoTen, sdt, vaiTro, tenDangNhap, matKhau, trangThai)
│   ├── KhachHang (hoTen, sdt, diaChi)
│   └── NhaCungCap (tenNCC, sdt, diaChi)
│
├── 2. Bán hàng & Trả góp (Sales & Orders)
│   ├── DonDatHangTruoc (khachHang, sanPham, imei, soTienCoc, hanLay, trangThai)
│   ├── HoaDon (soHD, khachHang, nhanVien, donDatHang, ngayLap, tongTien, trangThai, hanThanhToan)
│   ├── CT_HoaDon_May (hoaDon -> HoaDon, imei -> MayImei, donGiaBan) [SL luôn = 1]
│   ├── CT_HoaDon_PhuKien (hoaDon -> HoaDon, phuKien -> PhuKien, soLuong, donGiaBan)
│   └── HopDongTraGop (hoaDon, soTienTraTruoc, soTienTraGop, soKy, soTienMoiKy, soKyDaThu, trangThaiDuyet, ghiChu)
│
├── 3. Mua hàng & Chi phí (Purchasing)
│   ├── PhieuNhap (nhaCungCap, nhanVien, ngayNhap, tongTien, ghiChu)
│   ├── CT_PhieuNhap (phieuNhap, imei -> MayImei, donGiaNhap)
│   └── PhieuChi (phieuNhap, donDatHang, phieuDoiTra, maDT, soTien, hinhThuc, ngayChi, lyDo)
│
├── 4. Thanh toán & Công nợ (Finance)
│   ├── CongNo (loaiDoiTuong ['KhachHang'|'NhaCungCap'], khachHang, nhaCungCap, hoaDon, phieuNhap, soTienNo, soTienDaTra, hanThanhToan, trangThai)
│   └── PhieuThu (hoaDon, donDatHang, congNo, soTien, hinhThuc, ngayThu, ghiChu)
│
├── 5. Kho vận (Warehouse)
│   ├── Kho (tenKho, diaChi)
│   ├── TonKho (kho, sanPham, soLuong)
│   ├── PhieuXuatKho (hoaDon, kho, lyDoXuat, ngayXuat)
│   ├── BienBanKiemKe (kho, nhanVien, ngayKiemKe, ghiChu)
│   └── DieuChinhKho (bienBan, sanPham, soLuongLech, lyDo)
│
└── 6. Bảo hành & Đổi trả (Warranty & Returns)
    ├── PhieuBaoHanh (maPBH, imei -> MayImei, khachHang, nhanVien, moTaLoi, ngayTiepNhan, trangThai, ghiChu)
    ├── CT_PBH_LinhKien (phieuBaoHanh -> PhieuBaoHanh, linhKien -> LinhKien, soLuong, donGia)
    └── PhieuDoiTra (maDT, hoaDon, khachHang, nhanVien, imeiCu, imeiMoi, loaiDoiTra, giaMayCu, giaMayMoi, danhSachPhuKien, tongTienPhuKien, tienChenhLech, phieuThu, phieuChi, phieuThuDaoNguoc, phieuChiDaoNguoc, lyDo, trangThai, nguoiHuy, ngayHuy)
```

---

## 5. MA TRẬN PHÂN QUYỀN 6 ACTOR (RBAC MATRIX)

Hệ thống hỗ trợ 6 vai trò người dùng được bảo vệ chặt chẽ tại tầng Middleware (`src/middlewares/auth.js`):

| Vai trò (Actor) | Demo Login | Quyền hạn trên API & Giao diện |
|---|---|---|
| **Quản lý** | `admin` / `admin123` | **Toàn quyền hệ thống**: Quản trị tài khoản nhân viên (`/api/nhan-vien`), phân quyền, quản lý toàn bộ phân hệ và quyền xóa (`DELETE`). |
| **Thủ kho** | `thukho` / `123456` | Thêm/Sửa Model sản phẩm, **Nhập máy IMEI** (đơn/hàng loạt), Quản lý Phụ kiện, Quản lý Nhà cung cấp. |
| **NV bán hàng** | `banhang` / `123456` | Xem sản phẩm, kiểm tra tồn kho IMEI còn hàng, Thêm/Sửa Khách hàng, **Bán hàng POS theo IMEI**, Lập hóa đơn, Tiếp nhận bảo hành. |
| **Thu ngân** | `thungan` / `123456` | Quản lý Khách hàng, xem bảng giá sản phẩm, Xem danh sách hóa đơn, Bán hàng POS. |
| **Kế toán** | `ketoan` / `123456` | Quản lý Nhà cung cấp, xem danh sách hóa đơn, đối soát giá nhập, Thu/Chi, Công nợ. |
| **Kỹ thuật** | `kythuat` / `123456` | **Tra cứu bảo hành theo IMEI**, Tiếp nhận bảo hành, **Xuất linh kiện thay thế**, Hoàn tất sửa chữa máy. |

---

## 6. DANH SÁCH RESTFUL API ENDPOINTS

Tất cả API trả về định dạng JSON thống nhất theo quy ước dự án:
```json
{ "success": true, "message": "Thông báo thành công", "data": { ... } }
```

### 6.1. Xác thực & Phiên làm việc (`/api/auth`)
* `POST /api/auth/login`: Nhận `{ tenDangNhap, matKhau }` -> Lưu session, trả về thông tin user.
* `POST /api/auth/logout`: Hủy session, xóa cookie.
* `GET /api/auth/me`: Trả về thông tin tài khoản đang đăng nhập (hoặc `401 Unauthorized`).

### 6.2. Bảng điều khiển (`/api/dashboard`)
* `GET /api/dashboard`: Trả về số liệu thống kê tổng hợp (`totalMayImei`, `imeiConHang`, `imeiDaBan`, `imeiBaoHanh`, `totalSanPham`, `totalKhachHang`, `totalHoaDon`, `totalPhieuBaoHanh`) + danh sách máy và model mới nhất.

### 6.3. Bán hàng & Hóa đơn (`/api/hoa-don`) — *Module Nguyễn Quang Tuấn*
* `GET /api/hoa-don`: Lấy danh sách hóa đơn (hỗ trợ lọc `tuNgay`, `denNgay`, `maKH`, `trangThai`, `search`, phân trang).
* `GET /api/hoa-don/:id`: Chi tiết 1 hóa đơn kèm danh sách máy IMEI, danh sách phụ kiện, thông tin phiếu xuất kho.
* `GET /api/hoa-don/imei-kha-dung`: Danh sách máy IMEI đang có trạng thái `Con hang` hỗ trợ POS quét barcode và chọn máy xuất bán nhanh.
* `GET /api/hoa-don/kiem-tra-doi-tra/:imei`: Tra cứu kiểm tra điều kiện đổi trả theo số IMEI trong vòng 30 ngày từ ngày mua (phục vụ phân hệ Đổi trả của Việt).
* `GET /api/hoa-don/thong-ke-nhanh`: Thống kê nhanh doanh thu hôm nay, số lượng hóa đơn, số máy đã bán.
* `GET /api/hoa-don/dat-truoc/tim-kiem`: Tìm kiếm đơn đặt hàng trước còn hiệu lực phục vụ cấn trừ tiền cọc trực tiếp tại quầy POS.
* `POST /api/hoa-don`: **Bán hàng theo danh sách IMEI & phụ kiện**:
  - Khóa & kiểm tra trạng thái IMEI: Nếu có bất kỳ máy nào không ở trạng thái `Con hang` $\rightarrow$ ném lỗi **`409 Conflict`**.
  - Tích hợp cấn trừ tiền cọc từ Đơn đặt trước (`donDatHangId`) và tự động chuyển trạng thái đơn sang `Da nhan hang`.
  - Tạo `HoaDon`, tạo `CT_HoaDon_May`, `CT_HoaDon_PhuKien`.
  - Cập nhật `MayImei.trangThai = 'Da ban'`.
  - Trừ số lượng tồn phụ kiện & gọi `TonKhoService.capNhatTonKho` giảm tồn kho Model.
  - Tự động sinh `PhieuXuatKho`.
  - **Tích hợp liên Service:** Tự động gọi `ThanhToanService.taoPhieuThu` sinh Phiếu Thu trong Sổ quỹ (nếu thanh toán ngay) hoặc gọi `CongNoService.taoCongNo` tạo hồ sơ Công Nợ Khách Hàng (nếu mua ghi nợ).
* **Kiểm thử tự động:** Bộ test `tests/test_tuan_module.js` với 44/44 test cases PASS 100%.

### 6.4. Dịch vụ & Bảo hành theo IMEI (`/api/bao-hanh`) — *Module Nguyễn Quang Tuấn*
* `GET /api/bao-hanh/tra-cuu/:imei`: **Tra cứu dòng đời IMEI**: Trả về ngày nhập kho, ngày bán, hạn bảo hành (`NgayBan + SoThangBH tháng`), số ngày còn lại, và lịch sử tất cả các lần bảo hành cùng linh kiện đã thay.
* `GET /api/bao-hanh`: Danh sách phiếu bảo hành (lọc theo `trangThai`, `imei`, `search`, `tuNgay`, `denNgay`).
* `GET /api/bao-hanh/:id`: Chi tiết 1 phiếu bảo hành và danh sách linh kiện đã xuất.
* `POST /api/bao-hanh`: **Tiếp nhận bảo hành**:
  - Kiểm tra máy đã từng bán qua `CT_HoaDon_May` (chặn nếu chưa bán).
  - Kiểm tra hạn bảo hành (chặn nếu đã quá hạn BH).
  - Tạo `PhieuBaoHanh` (`trangThai = 'Dang xu ly'`).
  - Cập nhật `MayImei.trangThai = 'Bao hanh'`.
* `POST /api/bao-hanh/:id/linh-kien`: **Xuất linh kiện thay thế**: Tạo `CT_PBH_LinhKien` và trừ tồn kho `LinhKien.soLuongTon`.
* `PUT /api/bao-hanh/:id/hoan-tat`: **Hoàn tất sửa chữa**: Đổi trạng thái phiếu sang `Da sua xong`, khôi phục `MayImei.trangThai = 'Da ban'` (đã trả khách).

### 6.5. Quản lý Máy IMEI (`/api/may-imei`)
* `GET /api/may-imei`: Lấy danh sách IMEI (hỗ trợ query `search`, `sanPhamId`, `trangThai`).
* `GET /api/may-imei/:imei`: Chi tiết 1 máy theo IMEI.
* `POST /api/may-imei`: Nhập máy IMEI mới (nhập lẻ qua `singleImei` hoặc **nhập hàng loạt** qua `imeiList`, tự động lọc trùng).
* `PUT /api/may-imei/:imei`: Cập nhật thông tin/trạng thái máy.
* `DELETE /api/may-imei/:imei`: Xóa máy (chặn xóa nếu máy có trạng thái `Da ban`).

### 6.6. Sản phẩm, Phụ kiện & Đối tác
* `/api/san-pham`: `GET`, `GET /:id`, `POST`, `PUT`, `DELETE` Model sản phẩm (kèm tính tồn kho tự động).
* `/api/phu-kien`: `GET`, `GET /:id`, `POST`, `PUT`, `DELETE` phụ kiện.
* `/api/danh-muc`: `GET`, `GET /:id`, `POST`, `PUT`, `DELETE` danh mục.
* `/api/khach-hang`: `GET`, `GET /:id`, `POST`, `PUT`, `DELETE` khách hàng.
* `/api/nha-cung-cap`: `GET`, `GET /:id`, `POST`, `PUT`, `DELETE` nhà cung cấp.
* `/api/nhan-vien`: `GET`, `GET /:id`, `POST`, `PUT`, `DELETE` nhân viên (Chỉ role `Quản lý`).

### 6.7. Đặt hàng trước (Pre-order) & Thu cọc (`/api/dat-truoc`) — *Module Tô Quốc Việt*
* `GET /api/dat-truoc`: Lấy danh sách đơn đặt trước (lọc `trangThai`, `maKH`, `tuNgay`, `denNgay`, `search`, phân trang).
* `GET /api/dat-truoc/:id`: Chi tiết 1 đơn đặt trước kèm danh sách phiếu thu tiền cọc, phiếu chi hoàn cọc và hóa đơn bán liên kết.
* `POST /api/dat-truoc`: **Tiếp nhận đơn đặt trước & Thu tiền cọc**:
  - Kiểm tra tính hợp lệ của khách hàng và model sản phẩm.
  - Tạo bản ghi `DonDatHangTruoc` (`trangThai = 'Da dat coc'`).
  - Nếu có tiền cọc > 0 $\rightarrow$ tự động gọi `ThanhToanService.taoPhieuThu` sinh `PhieuThu` tiền cọc.
* `PUT /api/dat-truoc/:id/huy`: **Hủy đơn đặt trước & Hoàn tiền cọc**:
  - Kiểm tra trạng thái đơn hợp lệ (chặn hủy nếu đã xuất hóa đơn nhận máy).
  - Đổi trạng thái sang `Da huy`.
  - Tự động gọi `ThanhToanService.taoPhieuChi` hoàn tiền cọc cho khách.
* `PUT /api/dat-truoc/:id/trang-thai`: Cập nhật trạng thái đơn và gán IMEI máy vật lý khi hàng về kho.

### 6.8. Phân hệ Thu - Chi & Sổ quỹ Dùng chung (`ThanhToanService`, `ThanhToanController`) — *Module Đinh Đức Vượng*
* `ThanhToanService.taoPhieuThu({ hoaDon, donDatHang, congNo, soTien, hinhThuc, ghiChu, ngayThu, sessionUser })`:
  - Kiểm tra số tiền hợp lệ (> 0).
  - Chuẩn hóa hình thức: `Tien mat`, `Chuyen khoan`, `Quet the`, `Vi dien tu`.
  - Sinh bản ghi `PhieuThu` dùng chung cho Bán hàng (Tuấn), Đặt cọc (Việt), Trả góp & Công nợ (An).
* `ThanhToanService.taoPhieuChi({ phieuNhap, donDatHang, maDT, soTien, hinhThuc, lyDo, ngayChi, sessionUser })`:
  - Kiểm tra số tiền hợp lệ (> 0).
  - Sinh bản ghi `PhieuChi` dùng chung cho Hoàn cọc (Việt), Nhập kho (Tuân), Đổi trả (Việt).
* `ThanhToanService.getSoQuy(query)`:
  - Tính tổng thu, tổng chi, tồn quỹ ròng (`tonQuy = tongThu - tongChi`).
  - Phân tích chi tiết dòng tiền theo từng hình thức (Tiền mặt tại két, Chuyển khoản ngân hàng, Quẹt thẻ POS, Ví điện tử).
  - Lấy danh sách giao dịch biến động gần đây sắp xếp theo thời gian mới nhất.
* **RESTful API Endpoints (`/api/thanh-toan`):**
  - `GET /api/thanh-toan/so-quy`: Báo cáo sổ quỹ tổng hợp (RBAC: `Quản lý`, `Kế toán`, `Thu ngân`).
  - `GET /api/thanh-toan/thu`, `POST /api/thanh-toan/thu`, `GET /api/thanh-toan/thu/:id`: Danh sách và lập phiếu thu (RBAC: `Quản lý`, `Thu ngân`, `Kế toán`, `NV bán hàng`).
  - `GET /api/thanh-toan/chi`, `POST /api/thanh-toan/chi`, `GET /api/thanh-toan/chi/:id`: Danh sách và lập phiếu chi (RBAC: `Quản lý`, `Thu ngân`, `Kế toán`, `Thủ kho`).
* **Giao diện người dùng (`src/public/pages/so-quy/index.html` & `src/public/js/soquy.js`):**
  - Thẻ thống kê tài chính trực quan, lọc nhanh theo ngày và hình thức thanh toán.
  - Tab Biến động dòng tiền, Phiếu Thu, Phiếu Chi, Modal lập phiếu và in chứng từ trực tiếp.
* **Kiểm thử tự động:** Bộ test `tests/test_vuong_module.js` với 37/37 test cases PASS 100%.

### 6.9. Phân hệ Nhập kho & Tồn kho dùng chung (`PhieuNhapService`, `TonKhoService`) — *Module Phạm Đăng Tuân*
* `PhieuNhapService.taoPhieuNhap({ maNCC, maNV, danhSachMay, danhSachPhuKien, hinhThucThanhToan, ghiChu })`:
  - Kiểm tra tính hợp lệ của đối tác Nhà cung cấp và Nhân viên lập phiếu.
  - Kiểm tra chặn trùng IMEI ngay trong danh sách gửi lên (400) và IMEI đã có trong CSDL (409 Conflict).
  - Bulk insert `MayImei` với trạng thái `Con hang` và `CT_PhieuNhap`.
  - Tự động gọi `TonKhoService.capNhatTonKho` để tăng số lượng tồn kho sản phẩm.
  - Tăng số lượng tồn kho phụ kiện `PhuKien.soLuongTon`.
  - Xử lý liên kết tài chính: Thanh toán ngay $\rightarrow$ tự động gọi `ThanhToanService.taoPhieuChi` tạo Phiếu Chi; Ghi nợ $\rightarrow$ tự động tạo bản ghi `CongNo` cho Nhà cung cấp.
* `TonKhoService.capNhatTonKho(maSP, maKho, delta)`:
  - Hàm dùng chung cập nhật số lượng tồn kho của 1 sản phẩm tại kho cụ thể (dùng cho Nhập kho, Bán hàng, Đổi trả).
* **RESTful API Endpoints (`/api/phieu-nhap`):**
  - `GET /api/phieu-nhap`: Lấy danh sách phiếu nhập kho (RBAC: `Quản lý`, `Thủ kho`, `Kế toán`).
  - `GET /api/phieu-nhap/:id`: Chi tiết phiếu nhập & danh sách máy IMEI (RBAC: `Quản lý`, `Thủ kho`, `Kế toán`).
  - `POST /api/phieu-nhap`: Lập phiếu nhập kho (RBAC: `Quản lý`, `Thủ kho`).
* **Giao diện người dùng (`src/public/pages/nhap-kho/index.html` & `src/public/js/nhapkho.js`):**
  - Thẻ thống kê phiếu nhập, chi phí nhập hàng và số NCC.
  - Form thêm dòng máy IMEI & phụ kiện linh hoạt, tự động tính tổng tiền dự tính và in phiếu nhập kho.
* **Kiểm thử tự động:** Bộ test `tests/test_tuan_nhap_kho.js` với 25/25 test cases PASS 100%.

### 6.10. Phân hệ Quản lý Công nợ Đa hình & Thống kê Tồn kho / Phiếu xuất (`CongNoService`, `TonKhoService`) — *Module Trương Thế An*
* `CongNoService.validateDoiTuongCongNo({ loaiDoiTuong, khachHang, nhaCungCap })`:
  - Ràng buộc đa hình: `KhachHang` bắt buộc có `khachHang` và `nhaCungCap = null/undefined`; `NhaCungCap` bắt buộc có `nhaCungCap` và `khachHang = null/undefined`.
* `CongNoService.taoCongNo({ loaiDoiTuong, khachHang, nhaCungCap, hoaDon, phieuNhap, soTienNo })`:
  - Tạo hồ sơ công nợ mới (cho Tuấn bán hàng nợ, Tuân nhập kho ghi nợ NCC).
* `CongNoService.thanhToanCongNo(id, { soTien, hinhThuc, ghiChu })`:
  - Thu nợ Khách Hàng $\rightarrow$ tự động gọi `ThanhToanService.taoPhieuThu` sinh Phiếu Thu.
  - Trả nợ Nhà Cung Cấp $\rightarrow$ tự động gọi `ThanhToanService.taoPhieuChi` sinh Phiếu Chi.
  - Tự động đối soát và đổi trạng thái `Da tra het` khi thanh toán đủ.
* `TonKhoService.layThongKeTonKho({ maKho })` & `layDanhSachPhieuXuat(query)`:
  - Thống kê số lượng tồn kho theo từng kho hoặc gộp tất cả các kho; quản lý danh sách phiếu xuất kho.
* **RESTful API Endpoints:**
  - `GET /api/cong-no`, `GET /api/cong-no/:id`, `POST /api/cong-no/:id/thanh-toan` (RBAC: `Quản lý`, `Kế toán`, `Thu ngân`).
  - `GET /api/kho/ton-kho` (Tất cả vai trò đã đăng nhập), `GET /api/kho/phieu-xuat` (`Quản lý`, `Thủ kho`).
* **Giao diện người dùng (`src/public/pages/cong-no/index.html` & `src/public/js/congno.js`):**
  - Thẻ thống kê trực quan nợ phải thu (KH), nợ phải trả (NCC), đã thanh toán lũy kế.
  - Bộ lọc theo đối tượng và trạng thái, modal thanh toán nợ 1-click tự động cập nhật sổ quỹ.
* **Kiểm thử tự động:** Bộ test `tests/test_an_tuan3.js` với 28/28 test cases PASS 100%.

### 6.11. Phân hệ Đổi trả máy, Đổi kèm Phụ kiện & Hủy phiếu RBAC (`DoiTraService`, `DoiTraController`) — *Module Tô Quốc Việt*
* `DoiTraService.kiemTraDieuKienDoiTra(soHD, imeiCu)`:
  - Kiểm tra điều kiện đổi trả trong vòng 30 ngày kể từ ngày mua trên Hóa đơn (`HD.ngayLap`).
  - Kiểm tra trạng thái máy cũ `MayImei.trangThai === 'Da ban'`.
* `DoiTraService.taoPhieuDoiTra({ soHD, imeiCu, imeiMoi, loaiDoiTra, danhSachPhuKien, hinhThuc, lyDo, ghiChu }, sessionUser)`:
  - **Đổi máy (`loaiDoiTra = 'Doi may'`):** Chuyển `imeiCu` sang `Loi`, chuyển `imeiMoi` sang `Da ban`.
  - **Đổi kèm phụ kiện mua thêm:** Tự động tính tổng tiền phụ kiện, trừ tồn kho `PhuKien.soLuongTon` (chặn nếu tồn kho không đủ, mã 400).
  - **Tính chênh lệch tài chính:** `tienChenhLech = (giaMayMoi + tongTienPhuKien) - giaMayCu`.
    - Nếu `tienChenhLech > 0` $\rightarrow$ Tự động sinh `Phiếu Thu` qua `ThanhToanService`.
    - Nếu `tienChenhLech < 0` $\rightarrow$ Tự động sinh `Phiếu Chi` qua `ThanhToanService`.
  - **Trả hàng hoàn tiền (`loaiDoiTra = 'Tra hang'`):** Chuyển `imeiCu` sang `Loi`, sinh `Phiếu Chi` hoàn 100% tiền mua cho khách.
* `DoiTraService.huyPhieuDoiTra(id, { lyDoHuy }, sessionUser)` — **Chức năng độc quyền của Quản lý:**
  - Hoàn tác trạng thái 2 máy IMEI: `imeiCu` khôi phục `Da ban`, `imeiMoi` hoàn trả `Con hang`.
  - Hoàn trả nguyên vẹn số lượng tồn kho phụ kiện đã lấy.
  - Tự động sinh giao dịch tài chính đảo ngược trong Sổ quỹ: Sinh `Phiếu Chi đảo ngược` (nếu trước đó đã thu tiền) hoặc sinh `Phiếu Thu đảo ngược` (nếu trước đó đã chi tiền hoàn).
* `DoiTraService.getLichSuImei(imei)`: Tra cứu toàn bộ lịch sử các lần đổi trả gắn với một số IMEI.
* **RESTful API Endpoints (`/api/doi-tra`):**
  - `GET /api/doi-tra`, `GET /api/doi-tra/:id`, `GET /api/doi-tra/kiem-tra-dieu-kien`: RBAC `Quản lý`, `NV bán hàng`, `Thu ngân`, `Kế toán`.
  - `POST /api/doi-tra`: Lập phiếu đổi trả (RBAC: `Quản lý`, `NV bán hàng`, `Thu ngân`).
  - `PUT /api/doi-tra/:id/huy`: Hủy / Thu hồi phiếu đổi trả (**Dành riêng cho `Quản lý`**).
  - `GET /api/doi-tra/lich-su-imei/:imei`: Tra cứu lịch sử đổi trả theo IMEI.
* **Giao diện & Biểu mẫu In (`src/public/pages/doi-tra/index.html` & `src/public/js/doitra.js`):**
  - Giao diện tra cứu điều kiện đổi trả trực quan, chọn máy mới, thêm phụ kiện mua kèm, modal xác nhận hủy phiếu cho Quản lý.
  - Biểu mẫu in Biên bản tiếp nhận đổi trả sản phẩm chuyên nghiệp khổ A5/K80 (`@media print`).
* **Kiểm thử tự động:** Bộ test `tests/test_viet_tuan4.js` (39 tests), `tests/test_viet_tuan5.js` (26 tests), `tests/test_viet_tuan6_e2e.js` (21 tests) PASS 100%.

### 6.12. Phân hệ Hợp đồng Trả góp & Lịch thu kỳ hạn (`TraGopService`, `TraGopController`) — *Module Trương Thế An*
* `TraGopService.taoHopDongTraGop({ hoaDonId, soTienTraTruoc, soKy, ghiChu })`:
  - Kiểm tra tính hợp lệ của kỳ hạn trả góp (3, 6, 9, 12 tháng).
  - Chặn lập trùng hợp đồng trả góp cho cùng 1 hóa đơn (409 Conflict).
  - Chặn số tiền trả trước >= tổng tiền hóa đơn (400 Bad Request).
  - Tính toán: `soTienTraGop = hoaDon.tongTien - soTienTraTruoc`, `soTienMoiKy = Math.round(soTienTraGop / soKy)`.
  - Tạo bản ghi `HopDongTraGop` với trạng thái ban đầu `Da duyet`.
* `TraGopService.layLichThuKy(id)`:
  - Sinh mảng lịch thu định kỳ theo tháng tương ứng số kỳ trả góp.
  - Xử lý số dư làm tròn ở kỳ cuối cùng: `soTienKyCuoi = soTienTraGop - soTienMoiKy * (soKy - 1)`.
  - Tự động gán trạng thái từng kỳ: `Da thu` (nếu `ky <= soKyDaThu`), `Qua han` (nếu ngày đến hạn < hiện tại), `Chua thu`.
  - Thống kê tổng đã thu và tổng còn lại.
* `TraGopService.thuTienKy(id, { hinhThuc, ghiChu })`:
  - Thu tiền kỳ kế tiếp: Tự động gọi `ThanhToanService.taoPhieuThu` sinh Phiếu Thu trong Sổ quỹ.
  - Tăng `soKyDaThu += 1`.
  - Khi đã thu đủ 100% số kỳ $\rightarrow$ Tự động chuyển trạng thái hợp đồng sang `Hoan tat`.
  - Chặn thu vượt số kỳ hoặc thu khi hợp đồng đã hoàn tất (400 Bad Request).
* **RESTful API Endpoints (`/api/tra-gop`):**
  - `POST /api/tra-gop`: Lập hợp đồng trả góp (RBAC: `Kế toán`, `Thu ngân`, `Bán hàng`).
  - `GET /api/tra-gop`, `GET /api/tra-gop/:id`, `GET /api/tra-gop/:id/lich-thu`: Danh sách & Chi tiết & Lịch thu (RBAC: `Kế toán`, `Thu ngân`).
  - `POST /api/tra-gop/:id/thu-ky`: Thu tiền kỳ hạn (RBAC: `Kế toán`, `Thu ngân`).
* **Kiểm thử tự động:** Bộ test `tests/test_an_tuan5.js` với 23/23 test cases PASS 100%.

### 6.13. Phân hệ Đối soát Công nợ & Quản lý Quá hạn (`CongNoService`) — *Module Trương Thế An*
* `CongNoService.layChiTietCongNo(id)`:
  - Lấy chi tiết hồ sơ công nợ kèm mảng `lichSuThanhToan` (tổng hợp danh sách các `PhieuThu` / `PhieuChi` liên quan).
  - Tính chính xác số tiền còn nợ (`soTienConNo = soTienNo - soTienDaTra`).
* `CongNoService.kiemTraVaCapNhatQuaHan()`:
  - Tự động quét toàn bộ các khoản nợ có `hanThanhToan < hiện tại` và `trangThai === 'Con no'` để chuyển trạng thái sang `Qua han`.
* `CongNoService.layBaoCaoDoiSoat()`:
  - Thống kê tổng hợp công nợ Khách Hàng (Tổng nợ, Đã trả, Còn nợ).
  - Thống kê tổng hợp công nợ Nhà Cung Cấp (Tổng nợ, Đã trả, Còn nợ).
  - Thống kê số lượng khoản nợ quá hạn và tổng nợ quá hạn trên toàn hệ thống.
* **RESTful API Endpoints:**
  - `GET /api/cong-no/doi-soat`: Báo cáo thống kê đối soát công nợ (RBAC: `Quản lý`, `Kế toán`).
  - `POST /api/cong-no/kiem-tra-qua-han`: Quét và cập nhật trạng thái nợ quá hạn (RBAC: `Quản lý`, `Kế toán`).
* **Kiểm thử tự động:** Bộ test `tests/test_an_tuan4.js` với 24/24 test cases PASS 100%.

### 6.14. Phân hệ Kiểm kê kho & Xử lý Lệch IMEI (`KiemKeService`, `kiemKeController`) — *Module Đinh Đức Vương*
* `KiemKeService.layDanhSachImeiLyThuyet(khoId)`:
  - Tra cứu toàn bộ danh sách máy `MayImei` đang có trạng thái `Con hang` tại kho để làm cơ sở đối chiếu lý thuyết.
* `KiemKeService.thucHienKiemKe({ khoId, danhSachImeiThucTe, ghiChu, sessionUser })`:
  - Tiếp nhận danh sách IMEI quét thực tế từ máy quét barcode hoặc Excel.
  - Tự động phân loại 4 trạng thái đối soát:
    - **Khớp 100% (`Khop`)**: Có trong DB `Con hang` và thực tế quét thấy.
    - **Thiếu hàng (`Thieu`)**: Có trong DB `Con hang` nhưng thực tế không quét thấy $\rightarrow$ Tạo dòng `DieuChinhKho` (`soLuongDC: -1`).
    - **Thừa hàng (`Thua`)**: Quét thực tế có IMEI nhưng hệ thống chưa có dữ liệu $\rightarrow$ Tạo dòng `DieuChinhKho` (`soLuongDC: +1`).
    - **Bất thường (`Bat thuong`)**: Quét thực tế có IMEI nhưng DB đang ở trạng thái `Da ban` / `Loi` / `Tra NCC` $\rightarrow$ Tạo dòng `DieuChinhKho` (`soLuongDC: 0`).
  - Tự động sinh mã biên bản `BBKK-YYYYMMDD-XXXX`, lưu `BienBanKiemKe` và chèn các dòng chi tiết `DieuChinhKho`.
* `KiemKeService.apDungDieuChinh(id, sessionUser)`:
  - Tự động cập nhật tồn kho `TonKho` (trừ tồn) và đánh dấu trạng thái máy bị thiếu `MayImei` sang `Loi`/`status: false`.
  - Chuyển trạng thái biên bản sang `Da dieu chinh` (chặn áp dụng lần 2).
* `KiemKeService.huyBienBan(id, sessionUser)`: Hủy biên bản kiểm kê nháp (phân quyền độc quyền cho Quản lý).
* **RESTful API Endpoints (`/api/kiem-ke`):**
  - `GET /api/kiem-ke/imei-ly-thuyet/:khoId?`: Tra cứu IMEI lý thuyết (RBAC: `Quản lý`, `Thủ kho`).
  - `POST /api/kiem-ke`: Lập biên bản kiểm kê kho (RBAC: `Quản lý`, `Thủ kho`).
  - `GET /api/kiem-ke`, `GET /api/kiem-ke/:id`: Danh sách và chi tiết biên bản kiểm kê (RBAC: `Quản lý`, `Thủ kho`, `Kế toán`).
  - `PUT /api/kiem-ke/:id/ap-dung`: Áp dụng điều chỉnh kho (RBAC: `Quản lý`, `Thủ kho`).
  - `PUT /api/kiem-ke/:id/huy`: Hủy biên bản kiểm kê (RBAC: `Quản lý`).
* **Giao diện & Biểu mẫu In (`src/public/pages/kiem-ke/index.html` & `src/public/js/kiemke.js`):**
  - Giao diện quét IMEI thực tế tốc độ cao, hiển thị bảng màu sắc đối soát trực quan, modal chi tiết và nút 1-click Áp dụng điều chỉnh kho.
  - Biểu mẫu in Biên bản kiểm kê vật tư, hàng hóa Mẫu số 05-VT theo Thông tư 200/2014/TT-BTC (`inBienBanKiemKeChuan()`).
* **Kiểm thử tự động:** Bộ test `tests/test_vuong_tuan4_kiemke.js` với 23/23 test cases PASS 100%.

### 6.15. Phân hệ Báo cáo Thống kê & API Dashboard (`BaoCaoService`, `baoCaoController`) — *Module Đinh Đức Vương*
* `BaoCaoService.getBaoCaoDoanhThu({ tuNgay, denNgay, nhom })`:
  - Phân tích Doanh thu thuần (từ `HoaDon`), Chi phí (từ `PhieuNhap` và `PhieuChi`), Lợi nhuận gộp theo mốc thời gian (ngày / tuần / tháng).
  - Tự động định dạng series và labels sẵn sàng cho biểu đồ Line Chart của Chart.js.
* `BaoCaoService.getTopSanPham({ limit, tuNgay, denNgay })`:
  - Thống kê xếp hạng các model sản phẩm bán chạy nhất theo số lượng và doanh thu mang lại.
* `BaoCaoService.getHangTonLauNgay({ soNgay, limit })`:
  - Lọc và cảnh báo danh sách máy `MayImei` tồn kho lâu ngày chưa bán được (> 30 ngày, > 60 ngày), tính số ngày tồn kho thực tế và tổng vốn đọng.
* `BaoCaoService.getBaoCaoTaiChinhTongHop()`:
  - Báo cáo đối soát chéo tài chính toàn hệ thống: Khớp nối 100% giữa Sổ quỹ (Tiền mặt/Ngân hàng), Công nợ phải thu KH, Công nợ phải trả NCC và Giá trị tồn kho thực tế.
* **RESTful API Endpoints (`/api/bao-cao`):**
  - `GET /api/bao-cao/doanh-thu`: Báo cáo doanh thu & chi phí (RBAC: `Quản lý`, `Kế toán`).
  - `GET /api/bao-cao/top-san-pham`: Top sản phẩm bán chạy (RBAC: `Quản lý`, `Kế toán`, `NV bán hàng`, `Thủ kho`).
  - `GET /api/bao-cao/ton-lau-ngay`: Cảnh báo hàng tồn lâu (RBAC: `Quản lý`, `Thủ kho`, `Kế toán`).
  - `GET /api/bao-cao/tong-hop-tai-chinh`: Báo cáo tổng hợp tài chính (RBAC: `Quản lý`, `Kế toán`).
* **Giao diện Dashboard (`src/public/pages/index.html` & `src/public/js/dashboard.js`):**
  - Tích hợp biểu đồ động Chart.js, bộ lọc chuyển đổi nhóm Ngày / Tuần / Tháng, hiển thị Top 5 sản phẩm và cảnh báo máy tồn lâu ngày.
* **Kiểm thử tự động:** Bộ test `tests/test_vuong_tuan5_6_e2e.js` với 25/25 test cases PASS 100%.

---

## 7. HƯỚNG DẪN DÀNH CHO CÁC THÀNH VIÊN KHI CODE MODULE MỚI

Khi các thành viên tiếp tục triển khai các module tiếp theo (stress test của QA), hãy tuân thủ kiến trúc OOP phân tầng như sau:

### Bước 1: Tạo Service Class (`src/services/`)
* Kế thừa `BaseService`, đóng gói toàn bộ business rules.

### Bước 2: Tạo Controller Class (`src/controllers/`)
* Kế thừa `BaseController`, sử dụng `this.sendSuccess`, `this.sendError`, `this.handleError`.

### Bước 3: Tạo Route & Gắn Middleware RBAC (`src/routes/`)
* Tạo route và sử dụng `requireAuth`, `requireRole(...)`.
* Mount route vào `src/routes/index.js`.

---

## 8. HƯỚNG DẪN KHỞI CHẠY & KIỂM THỬ

1. **Cài đặt thư viện:**
   ```bash
   npm install
   ```
2. **Nạp dữ liệu mẫu (Seed Data):**
   ```bash
   npm run seed
   ```
3. **Chạy kiểm thử tự động toàn bộ 20 bộ test suites:**
   ```bash
   npm test                             # Master Test Runner (chạy toàn bộ 20 suites - 745 assertions)
   node tests/test_tuan_module.js       # 60 tests Bán hàng POS, IMEI, Bảo hành, Data Contract
   node tests/test_tuan_tuan5_6_e2e.js  # 33 tests E2E tích hợp Bán hàng POS, Cọc, Bảo hành, KPI (Tuần 5-6)
   node tests/test_viet_module.js       # 32 tests Đặt hàng trước (Tuần 3)
   node tests/test_viet_tuan4.js        # 39 tests Đổi trả máy & Cấn trừ cọc (Tuần 4)
   node tests/test_viet_tuan5.js        # 26 tests Tình huống biên & Hủy phiếu RBAC (Tuần 5)
   node tests/test_viet_tuan6_e2e.js    # 21 tests Kịch bản E2E toàn trình (Tuần 6)
   node tests/test_an_tuan3.js          # 28 tests Tồn kho dùng chung & Công nợ (Tuần 3)
   node tests/test_an_tuan4.js          # 24 tests Đối soát công nợ & Quá hạn (Tuần 4)
   node tests/test_an_tuan5.js          # 23 tests Hợp đồng Trả góp & Lịch thu kỳ (Tuần 5)
   node tests/test_tuan_nhap_kho.js     # 25 tests Nhập kho máy IMEI & Phụ kiện (Tuần 3)
   node tests/test_tuan_tuan4.js        # 13 tests Nhập hàng loạt IMEI & Lịch sử NCC (Tuần 4)
   node tests/test_tuan_tuan5.js        # 8 tests Trả hàng NCC & Cấn trừ công nợ (Tuần 5)
   node tests/test_vuong_module.js      # 37 tests Thu - Chi & Sổ quỹ (Tuần 3)
   node tests/test_vuong_tuan4_kiemke.js # 23 tests Kiểm kê kho & Xử lý lệch IMEI (Tuần 4)
   node tests/test_vuong_tuan5_6_e2e.js # 25 tests Báo cáo Doanh thu, Top SP & Đối soát Sổ quỹ E2E (Tuần 5-6)
   node tests/verify_all_logins.js      # 6 tests Ma trận đăng nhập 6 vai trò
   node tests/test_http_endpoints.js    # 51 tests REST API 26 Endpoints & Data Contracts (QA & Backend)
   node tests/test_frontend_dom_contract.js # 65 tests DOM ID Bindings & Data Extractors (QA & UI)
   node tests/test_concurrency_stress.js # 5 tests Concurrency Atomic Lock & Stress Test
   node tests/test_ui_html_structure.js # 201 tests Kiểm thử cấu trúc HTML, Sidebar & Assets
   ```
4. **Chạy server phát triển:**
   ```bash
   npm run dev
   ```
5. **Truy cập ứng dụng:**
   - URL: `http://localhost:3000` (hoặc `http://localhost:3000/login.html`)
   - Bán hàng POS: `http://localhost:3000/ban-hang/`
   - Tra cứu & Bảo hành: `http://localhost:3000/bao-hanh/`
   - Đặt hàng trước (Pre-order): `http://localhost:3000/dat-truoc/`
   - Đổi trả sản phẩm: `http://localhost:3000/doi-tra/`
   - Thu - Chi & Sổ quỹ: `http://localhost:3000/so-quy/`
   - Nhập kho hàng hóa: `http://localhost:3000/nhap-kho/`
   - Quản lý Công nợ & Đối soát: `http://localhost:3000/cong-no/`
   - Kiểm kê kho & Đối soát IMEI: `http://localhost:3000/kiem-ke/`

---

## 9. CHUẨN HÓA BIỂU MẪU IN ẤN PHÁP QUY & THIẾT KẾ CSDL NÂNG CAO

### 9.1. Mẫu In Chứng Từ Chuẩn Thông Tư 200/2014/TT-BTC & Nghị Định 123/2020/NĐ-CP (`src/public/js/print-templates.js`)
- **Phiếu Thu (Mẫu số 01 - TT)**: Tự động hạch toán Nợ 1111 / Có 131, 511; đọc số tiền bằng chữ tiếng Việt (`docSoTienBangChu`); 5 chữ ký chuẩn (*Thủ trưởng, Kế toán trưởng, Người lập, Người nộp, Thủ quỹ*).
- **Phiếu Chi (Mẫu số 02 - TT)**: Tự động hạch toán Nợ 331, 642 / Có 1111; kèm chứng từ gốc; 5 chữ ký chuẩn.
- **Phiếu Nhập Kho (Mẫu số 01 - VT)**: Danh mục sản phẩm đối chiếu theo chứng từ và thực nhập; Nợ 1561 / Có 331; 4 chữ ký (*Người lập, Người giao, Thủ kho, Kế toán trưởng*).
- **Hóa Đơn Bán Hàng Kiêm Phiếu Xuất Kho (Mẫu số 02 - VT)**: Ký hiệu Serial, Mã số thuế, chi tiết danh sách IMEI và phụ kiện, cấn trừ cọc, chiết khấu, 3 chữ ký (*Người mua, Thu ngân, Thủ kho*).
- **Biên Bản Kiểm Kê Hàng Hóa (Mẫu số 05 - VT)**: Bảng đối soát thực tế vs lý thuyết, thống kê số lượng khớp/thừa/thiếu/bất thường, ý kiến kết luận ban kiểm kê, 3 chữ ký (*Thủ kho, Kế toán kho, Giám đốc duyệt*).

### 9.2. Chuẩn Hóa Trường Trạng Thái `status: Boolean` (Bit)
- Toàn bộ 10 Model chính (`SanPham`, `NhaCungCap`, `KhachHang`, `PhuKien`, `DanhMuc`, `MayImei`, `PhieuThu`, `PhieuChi`, `PhieuNhap`, `HoaDon`, `BienBanKiemKe`, `DieuChinhKho`) đều được bổ sung trường `status: { type: Boolean, default: true }` phục vụ soft-delete và tuân thủ chặt chẽ tiêu chuẩn thiết kế cơ sở dữ liệu.

### 9.3. Cơ Chế Cô Lập & Tự Động Dọn Dẹp Dữ Liệu Test (`tests/cleanup_db.js`)
- Tích hợp hook tự động dọn dẹp dữ liệu rác trước và sau khi chạy test suite trong `run_all_tests.js`, đảm bảo cơ sở dữ liệu thật luôn sạch sẽ và không bị nhân bản các bản ghi dummy khi thực thi kiểm thử liên tục.



