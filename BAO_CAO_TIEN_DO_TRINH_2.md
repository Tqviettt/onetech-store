# BÁO CÁO TIẾN ĐỘ DỰ ÁN — ĐIỂM TRÌNH 2 (SPRINT 2)
## ĐỀ TÀI: HỆ THỐNG QUẢN LÝ BÁN HÀNG CHUỖI CỬA HÀNG ĐIỆN THOẠI ONE TECH STORE
### (Mô hình quản lý hàng hóa vật lý truy vết theo từng số IMEI riêng biệt)

---

**THÔNG TIN DỰ ÁN & NHÓM THỰC HIỆN:**
* **Tên đề tài:** Hệ thống Quản lý Bán hàng Chuỗi Cửa hàng Điện thoại One Tech Store.
* **Đơn vị đào tạo:** Khoa Công nghệ Thông tin.
* **Học phần:** Đồ án Phát triển Phần mềm Doanh nghiệp / Thực tập Chuyên ngành.
* **Giai đoạn nghiệm thu:** **Điểm Trình 2 (Milestone 2 - Đánh giá 100 điểm)**.
* **Nhóm sinh viên thực hiện:**
  1. **Nguyễn Quang Tuấn** (Nhóm trưởng) — Backend Lead, Phân hệ Bán hàng POS, Hóa đơn & Xuất kho.
  2. **Nguyễn Tuân** — Backend Dev, Phân hệ Mua hàng, Nhập kho IMEI & Nhà cung cấp.
  3. **Trương Thế An** — Backend Dev, Phân hệ Tồn kho dùng chung, Công nợ đa hình & Hợp đồng Trả góp.
  4. **Đinh Đức Vượng** — Backend Dev, Phân hệ Thu - Chi, Sổ quỹ dùng chung, Kiểm kê kho & Báo cáo.
  5. **Nguyễn Thị Vũ** — Frontend Lead, Thiết kế UI/UX, Design System, Collapsible Sidebar & Universal Dropdown.
  6. **Tô Quốc Việt** — Backend Dev, Phân hệ Đặt hàng trước (Pre-order), Đổi trả 30 ngày & Hoàn tiền chênh lệch.
  7. **Việt Anh** — QA Lead / Tester, Xây dựng Master Test Runner, Stress Test, Concurrency Lock & RBAC Audit.

---

# MỤC LỤC
1. **CHƯƠNG 1: GIỚI THIỆU ĐỀ TÀI & MỤC TIÊU ĐIỂM TRÌNH 2**
   - 1.1. Bối cảnh nghiệp vụ & Tính cấp thiết của bài toán
   - 1.2. Đặc thù nghiệp vụ cốt lõi: Quản lý theo số IMEI vật lý
   - 1.3. Mục tiêu nghiệm thu Điểm Trình 2
2. **CHƯƠNG 2: KIẾN TRÚC HỆ THỐNG & CÔNG NGHỆ ÁP DỤNG**
   - 2.1. Mô hình kiến trúc Layered MVC kết hợp OOP Service Layer
   - 2.2. Ngăn xếp công nghệ (Technology Stack)
   - 2.3. Ma trận bảo mật & Phân quyền RBAC 6 vai trò
3. **CHƯƠNG 3: THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE DESIGN)**
   - 3.1. Thiết kế tổng thể CSDL & Sơ đồ quan hệ thực thể (ERD)
   - 3.2. Cấu trúc các bảng dữ liệu cốt lõi phục vụ Điểm Trình 2
   - 3.3. Mô hình đa hình (Polymorphism) trong Sổ quỹ và Công nợ
   - 3.4. Ràng buộc toàn vẹn, Khóa chính, Khóa ngoại & Compound Indexes
4. **CHƯƠNG 4: KẾT QUẢ TRIỂN KHAI CÁC CHỨC NĂNG BẮT BUỘC (40 ĐIỂM)**
   - 4.1. Đăng nhập bảo mật & Quản lý phiên làm việc (Session)
   - 4.2. Quản lý Người dùng & Nhân viên (CRUD & Đổi mật khẩu)
   - 4.3. Quản lý Khách hàng (CRUD & Lịch sử mua hàng)
   - 4.4. Quản lý Nhà cung cấp (CRUD & Đối soát dư nợ)
   - 4.5. Quản lý Sản phẩm Model (CRUD & Xóa mềm Soft Delete)
   - 4.6. Quản lý Loại hàng & Danh mục phụ kiện
   - 4.7. Tìm kiếm dữ liệu Realtime tối ưu Debounce
   - 4.8. Kiểm tra và chuẩn hóa dữ liệu đầu vào (Validation Engine)
   - 4.9. Giao diện thống nhất, Responsive & Trải nghiệm người dùng
5. **CHƯƠNG 5: TRIỂN KHAI 3 MODULE NGHIỆP VỤ TRỌNG TÂM (40 ĐIỂM)**
   - 5.1. Module Mua hàng / Nhập kho (15 điểm)
   - 5.2. Module Bán hàng POS & Hóa đơn (15 điểm)
   - 5.3. Module Quản lý Tồn kho & Chống thất thoát (10 điểm)
6. **CHƯƠNG 6: CÁC TÍNH NĂNG MỞ RỘNG VƯỢT TIẾN ĐỘ ĐÃ HOÀN TẤT**
   - 6.1. Đặt hàng trước (Pre-order) & Cấn trừ tiền cọc vào hóa đơn POS
   - 6.2. Đổi trả máy trong 30 ngày & Tính toán chênh lệch tài chính
   - 6.3. Tiếp nhận Bảo hành, Xuất linh kiện thay thế & Hoàn trả máy
   - 6.4. Hợp đồng mua hàng Trả góp & Lịch thu kỳ hạn định kỳ
   - 6.5. Quản lý Sổ quỹ Thu - Chi & Tính số dư Realtime
7. **CHƯƠNG 7: KẾT QUẢ KIỂM THỬ TỰ ĐỘNG & BẢO ĐẢM CHẤT LƯỢNG (QA)**
   - 7.1. Tổng quan Master Test Runner (20/20 Test Suites PASS 100%)
   - 7.2. Kiểm thử Concurrency Lock & Chống bán trùng IMEI (Stress Test)
   - 7.3. Kiểm thử thẩm định lỗ hổng phân quyền RBAC
   - 7.4. Kiểm thử ràng buộc giao diện DOM & REST API Contracts
8. **CHƯƠNG 8: KHÓ KHĂN GẶP PHẢI & GIẢI PHÁP KỸ THUẬT ĐÃ ÁP DỤNG**
   - 8.1. Race Condition khi nhiều nhân viên thanh toán cùng 1 IMEI
   - 8.2. Rủi ro âm kho phụ kiện khi nhiều đơn hàng đồng thời
   - 8.3. Lệch số dư tiền mặt giữa bán hàng lẻ và sổ quỹ kế toán
   - 8.4. Mất toàn vẹn dữ liệu khi xóa model sản phẩm cũ
9. **CHƯƠNG 9: KẾ HOẠCH SPRINT CUỐI & ĐỊNH HƯỚNG BẢO VỆ ĐỒ ÁN**
   - 9.1. Các hạng mục công việc cần hoàn thiện trong Sprint cuối
   - 9.2. Kế hoạch đóng gói phần mềm và tài liệu bàn giao
10. **PHỤ LỤC A: KỊCH BẢN VIDEO DEMO CHI TIẾT (5 – 10 PHÚT)**
11. **PHỤ LỤC B: DÀN Ý SLIDE BÁO CÁO THUYẾT TRÌNH (12 SLIDES)**

---

# CHƯƠNG 1: GIỚI THIỆU ĐỀ TÀI & MỤC TIÊU ĐIỂM TRÌNH 2

### 1.1. Bối cảnh nghiệp vụ & Tính cấp thiết của bài toán
Trong thời đại công nghệ số hiện nay, các hệ thống chuỗi bán lẻ thiết bị di động (Smartphones, Tablets, Phụ kiện công nghệ cao) đang phát triển với tốc độ vũ bão. Khác với các mô hình bán lẻ thông thường như siêu thị tạp hóa hay quần áo thời trang (nơi hàng hóa được quản lý gộp theo mã vạch SKU hoặc số lượng đơn thuần), ngành hàng điện thoại thông minh đòi hỏi một tiêu chuẩn quản lý khắt khe hơn rất nhiều: **Mỗi chiếc máy bán ra phải được nhận diện và truy vết độc lập thông qua số định danh thiết bị di động quốc tế (International Mobile Equipment Identity - IMEI)**.

Nếu một cửa hàng áp dụng phần mềm quản lý kho theo số lượng gộp:
1. Sẽ không thể xác định chiếc iPhone cụ thể nào được nhập từ lô hàng của nhà cung cấp nào với giá vốn là bao nhiêu.
2. Khi khách hàng mang máy đến bảo hành hoặc đổi trả, nhân viên không có căn cứ xác thực chiếc máy đó có đúng do cửa hàng bán ra hay không, ngày kích hoạt bảo hành là khi nào.
3. Tình trạng nhân viên gian lận, hoán đổi máy lỗi vào kho hoặc bán trùng cùng 1 máy cho 2 khách hàng rất dễ xảy ra nếu không có cơ chế khóa nguyên tử (Atomic Lock).

Từ thực tiễn đó, nhóm sinh viên đã quyết định nghiên cứu và xây dựng đề tài: **"Hệ thống Quản lý Bán hàng Chuỗi Cửa hàng Điện thoại One Tech Store"** nhằm giải quyết triệt để bài toán quản lý hàng hóa vật lý gắn liền với từng số IMEI riêng biệt.

### 1.2. Đặc thù nghiệp vụ cốt lõi: Quản lý theo số IMEI vật lý
Hệ thống One Tech Store thiết lập các quy tắc nghiệp vụ đặc thù:
* **Hàng hóa định danh độc lập:** Điện thoại, máy tính bảng khi nhập kho bắt buộc phải khai báo số IMEI (15 ký tự số). Mỗi số IMEI là 1 bản ghi duy nhất trong CSDL, mang theo các thuộc tính: Hãng, Model, Màu sắc, Dung lượng, Giá nhập, Giá bán niêm yết, Ngày nhập kho và Trạng thái vòng đời.
* **State Machine Vòng đời máy chặt chẽ:** 
  $$\text{Còn hàng} \xrightarrow{\text{POS Bán}} \text{Đã bán} \xrightarrow{\text{Đổi trả}} \text{Đổi trả} \xrightarrow{\text{Bảo hành}} \text{Bảo hành} \xrightarrow{\text{Thanh lý}} \text{Thanh lý}$$
* **Phụ kiện quản lý số lượng:** Với các phụ kiện tiêu hao (cáp sạc, ốp lưng, tai nghe), hệ thống quản lý theo số lượng tồn kho (`soLuongTon`), có cơ chế chặn xuất âm kho.
* **Truy vết khép kín:** Toàn bộ lịch sử từ lúc NCC giao hàng, lưu kho, xuất bán POS, bảo hành sửa chữa, đổi trả hay thanh toán trả góp đều liên kết trực tiếp tới số IMEI vật lý.

### 1.3. Mục tiêu nghiệm thu Điểm Trình 2
Theo thông báo yêu cầu tại tài liệu `YÊU CẦU ĐIỂM TRÌNH 2.md`, nhóm hướng tới mục tiêu đạt **100/100 điểm** đánh giá với các tiêu chí định lượng:
1. **Phần mềm chạy ổn định (40đ):** Hoàn tất toàn bộ chức năng Đăng nhập, phân quyền, kiểm tra dữ liệu đầu vào và các màn hình CRUD danh mục cốt lõi (Người dùng, Khách hàng, NCC, Sản phẩm, Loại hàng).
2. **Module Mua hàng (15đ):** Lập phiếu nhập nhiều dòng, tính tổng tiền, lưu CSDL và tự động sinh bản ghi IMEI máy.
3. **Module Bán hàng POS (15đ):** Lập hóa đơn POS bán lẻ theo IMEI, giỏ hàng nhiều món, ghi nhận thanh toán và công nợ.
4. **Module Kho (10đ):** Quản lý tồn kho IMEI và phụ kiện, cập nhật tự động khi nhập/bán, chặn xuất vượt tồn tuyệt đối.
5. **Cơ sở dữ liệu (10đ):** Nộp kịch bản Script SQL chuẩn DDL, sơ đồ ERD trực quan, đảm bảo đầy đủ khóa chính, khóa ngoại và ràng buộc.
6. **Báo cáo tiến độ & Video Demo (10đ):** Báo cáo đầy đủ 15-20 trang, Slide báo cáo 12 slide và Video demo 6-8 phút trơn tru.

---

# CHƯƠNG 2: KIẾN TRÚC HỆ THỐNG & CÔNG NGHỆ ÁP DỤNG

### 2.1. Mô hình kiến trúc Layered MVC kết hợp OOP Service Layer
Dự án áp dụng mô hình kiến trúc đa tầng hiện đại (**Decoupled Layered Architecture**) kết hợp lập trình hướng đối tượng (OOP), phân tách độc lập giữa Client Frontend và Server Backend:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        KIẾN TRÚC TỔNG THỂ HỆ THỐNG (LAYERED MVC + OOP)                 │
└────────────────────────────────────────────────────────────────────────────────────────┘

 [ VIEW LAYER - TRÌNH DUYỆT NGƯỜI DÙNG ]
   │
   ├─► 1. Static HTML5 Pages (src/public/pages/):
   │      - pos/, nhap-kho/, san-pham/, khach-hang/, nha-cung-cap/, nhan-vien/, so-quy/...
   │      - Khung giao diện chuẩn Bootstrap 5.3 + Custom CSS Glassmorphism
   │
   ├─► 2. Layout & UI Engine (src/public/js/layout.js):
   │      - Fixed Collapsible Sidebar, Responsive Drawer cho thiết bị di động
   │      - Universal Dropdown Converter (enhanceSelect)
   │
   └─► 3. API Client Wrapper (src/public/js/api.js):
          - Fetch API tích hợp tự động xử lý Toast notification, Bearer/Session Token, mã lỗi 401/403
   │
   ▼ HTTP Request (RESTful API / JSON Payload)
 [ CONTROLLER LAYER - BỘ ĐIỀU KHIỂN OOP ] (src/controllers/)
   │  - Kế thừa BaseController: Chuẩn hóa sendSuccess(), sendError(), handleError()
   │  - Nhiệm vụ: Tiếp nhận request, trích xuất tham số, gọi tầng Service và trả về JSON chuẩn
   │
   ▼ Gọi nghiệp vụ
 [ SERVICE LAYER - NGHIỆP VỤ CỐT LÕI OOP ] (src/services/)
   │  - Kế thừa BaseService: Đóng gói toàn bộ Business Logic, Transaction & Concurrency Lock
   │  - HoaDonService, PhieuNhapService, TonKhoService, ThanhToanService, CongNoService...
   │
   ▼ ODM Mapping
 [ MODEL LAYER - MÔ HÌNH THỰC THỂ CSDL ] (src/models/)
   │  - 26 Schema Mongoose: Ràng buộc kiểu dữ liệu, Default value, Compound Indexes, Virtual Populate
   │
   ▼ TCP Connection (Mongoose Driver)
 [ MONGODB ENTERPRISE DATABASE ] (mongodb://127.0.0.1:27017/onetech_store)
```

**Nguyên tắc kiến trúc bất di bất dịch:**
1. **Separation of Concerns:** Tuyệt đối không viết câu lệnh truy vấn CSDL hay tính toán tiền nong trong Controller. Toàn bộ logic nghiệp vụ thuộc về Service.
2. **Kế thừa OOP chuẩn hóa:**
   - `BaseController`: Quản lý phản hồi HTTP đồng nhất `{ success: Boolean, data: Any, message: String }`.
   - `BaseService`: Quản lý phân trang tự động `getPaginationOptions(query)` và khởi tạo lỗi chuẩn `createError(msg, statusCode)`.

### 2.2. Ngăn xếp công nghệ (Technology Stack)
* **Backend Runtime:** Node.js (v18+ LTS) — Đảm bảo khả năng xử lý bất đồng bộ (Non-blocking I/O) cực nhanh khi có nhiều nhân viên POS thao tác cùng lúc.
* **Web Framework:** Express.js (v4.19) — Khởi tạo hệ thống RESTful API chuẩn mực.
* **Database & ODM:** MongoDB Community Server (v7.0) kết hợp Mongoose ODM (v8.5) — Cung cấp cấu trúc dữ liệu JSON Schema linh hoạt, hỗ trợ Mongoose Transaction và Atomic Operators (`$set`, `$inc`, `$push`).
* **Frontend UI:** Vanilla HTML5 + Bootstrap 5.3 + FontAwesome 6 + Bootstrap Icons — Không phụ thuộc framework cồng kềnh, tải trang tức thì dưới 100ms.
* **Bảo mật & Phiên làm việc:** `express-session`, `connect-flash`, thuật toán mã hóa mật khẩu 1 chiều `bcryptjs` với 10 vòng lặp muối (salt rounds).
* **Kiểm thử tự động:** Node.js Native Assert Engine, Custom Test Runner đo thời gian mili-giây và kiểm thử toàn bộ 20 Test Suites.

### 2.3. Ma trận bảo mật & Phân quyền RBAC 6 vai trò
Hệ thống thiết lập cơ chế kiểm soát truy cập dựa trên vai trò (**Role-Based Access Control - RBAC**) với 6 vị trí nghiệp vụ thực tế:

| Vai trò | Phạm vi trách nhiệm | Quyền hạn trên hệ thống |
|---|---|---|
| **`Quản lý`** | Giám đốc / Cửa hàng trưởng | Toàn quyền hệ thống, quản lý nhân viên, duyệt báo cáo, hủy phiếu đổi trả |
| **`Thủ kho`** | Quản lý kho hàng & nhập xuất | Tạo phiếu nhập, import hàng loạt IMEI, kiểm kê kho, quản lý NCC, phụ kiện |
| **`NV bán hàng`**| Nhân viên tư vấn bán hàng tại quầy | Lập hóa đơn POS bán lẻ, tiếp nhận đơn đặt trước, tra cứu bảo hành, đổi trả |
| **`Thu ngân`** | Quầy thu ngân & thanh toán | Xác nhận thanh toán hóa đơn, thu tiền trả góp, lập phiếu thu sổ quỹ |
| **`Kế toán`** | Kế toán nội bộ & tài chính | Quản lý công nợ KH & NCC, đối soát sổ quỹ Thu - Chi, xem báo cáo doanh thu |
| **`Kỹ thuật`** | Kỹ thuật viên bảo hành & sửa chữa | Tiếp nhận máy bảo hành, thẩm định máy đổi trả, xuất linh kiện thay thế |

---

# CHƯƠNG 3: THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE DESIGN)

### 3.1. Thiết kế tổng thể CSDL & Sơ đồ quan hệ thực thể (ERD)
Cơ sở dữ liệu OneTech Store được thiết kế chuẩn mực ở cả 2 định dạng:
1. **Định dạng Quan hệ (Relational SQL Schema):** Khai báo trong file `one_tech_store_schema.sql` gồm 26 bảng chuẩn hóa 3NF, phục vụ việc đối soát và đáp ứng tiêu chí đồ án.
2. **Định dạng Tài liệu (MongoDB Mongoose ODM):** Cài đặt thực tế trong thư mục `src/models/` với 26 models tương ứng.

```
                         SƠ ĐỒ THỰC THỂ CỐT LÕI (CORE ERD)
                         
    ┌──────────────┐         1:N         ┌──────────────┐         1:N         ┌──────────────┐
    │  NHACUNGCAP  │ ◄───────────────────┤  PHIEUNHAP   │ ◄───────────────────┤ CT_PHIEUNHAP │
    └──────────────┘                     └──────────────┘                     └──────────────┘
                                                │ 1:N                                │ 1:1
                                                ▼                                    ▼
    ┌──────────────┐         1:N         ┌──────────────┐         1:1         ┌──────────────┐
    │   DANHMUC    │ ◄───────────────────┤   SANPHAM    │ ◄───────────────────┤   MAYIMEI    │
    └──────────────┘                     └──────────────┘                     └──────────────┘
                                                │ 1:N                                │ 1:1
                                                ▼                                    ▼
    ┌──────────────┐         1:N         ┌──────────────┐         1:N         ┌──────────────┐
    │  KHACHHANG   │ ◄───────────────────┤    HOADON    │ ◄───────────────────┤CT_HOADON_MAY │
    └──────────────┘                     └──────────────┘                     └──────────────┘
           ▲                                    │ 1:1                                │
           │ 1:N                                ▼                                    │
    ┌──────────────┐                     ┌──────────────┐                            │
    │    CONGNO    │ ◄───────────────────┤   PHIEUTHU   │ ◄──────────────────────────┘
    └──────────────┘      (Ghi nợ)       └──────────────┘       (Thu tiền mặt)
```

### 3.2. Cấu trúc các bảng dữ liệu cốt lõi phục vụ Điểm Trình 2

#### 1. Bảng SANPHAM (Model máy bán lẻ):
* `_id` (ObjectId, PK): Khóa chính.
* `danhMuc` (ObjectId, FK ref `DanhMuc`): Phân loại hàng (Điện thoại, Máy tính bảng...).
* `tenMay` (String, required): Tên thương mại (VD: *iPhone 15 Pro Max 256GB*).
* `hang` (String): Hãng sản xuất (*Apple, Samsung, Xiaomi...*).
* `giaBan` (Number, min: 0): Đơn giá bán niêm yết tại quầy.
* `soThangBH` (Number, default: 12): Thời hạn bảo hành tiêu chuẩn (tháng).
* `status` (Boolean, default: true): Cờ trạng thái hoạt động (Phục vụ Soft Delete).

#### 2. Bảng MAYIMEI (Máy vật lý theo từng số IMEI - Bảng trái tim của hệ thống):
* `_id` (ObjectId, PK): Khóa chính.
* `imei` (String, unique, 15 ký tự): Mã IMEI duy nhất của máy.
* `sanPham` (ObjectId, FK ref `SanPham`): Liên kết đến Model sản phẩm.
* `giaNhap` (Number, min: 0): Giá vốn thực tế nhập từ nhà cung cấp.
* `mauSac` (String), `dungLuong` (String): Cấu hình phần cứng thực tế.
* `trangThai` (Enum): `'Con hang'` | `'Da ban'` | `'Bao hanh'` | `'Doi tra'` | `'Mat'` | `'Thanh ly'`.
* `ngayNhap`, `ngayBan`: Dấu vết thời gian phục vụ kiểm tra hạn đổi trả (30 ngày) và bảo hành (365 ngày).

#### 3. Bảng PHIEUNHAP & CT_PHIEUNHAP (Nghiệp vụ Mua hàng):
* `PHIEUNHAP`: `_id`, `maPN`, `nhaCungCap` (FK), `nhanVien` (FK), `ngayNhap`, `tongTien`, `ghiChu`.
* `CT_PHIEUNHAP`: `_id`, `phieuNhap` (FK), `imei` (String), `sanPham` (FK), `donGiaNhap`.

#### 4. Bảng HOADON & CT_HOADON_MAY (Nghiệp vụ Bán hàng POS):
* `HOADON`: `_id`, `soHD` (Unique), `khachHang` (FK), `nhanVien` (FK), `ngayLap`, `tongTien`, `tienCocDaTru`, `soTienGiam`, `soTienThanhToan`, `trangThai` (`'Da thanh toan'` | `'Cong no'`).
* `CT_HOADON_MAY`: `_id`, `hoaDon` (FK), `imei` (String), `donGiaBan`.

#### 5. Bảng PHUKIEN & TONKHO:
* `PHUKIEN`: Quản lý phụ kiện bán kèm (Củ sạc 20W, Tai nghe Type-C...), trường số lượng tồn `soLuongTon`.
* `TONKHO`: Quản lý số lượng tồn kho theo từng kho lưu trữ vật lý (`kho`, `sanPham`, `soLuong`).

### 3.3. Mô hình đa hình (Polymorphism) trong Sổ quỹ và Công nợ
Hệ thống giải quyết bài toán phức tạp của doanh nghiệp bằng kiến trúc **Polymorphic Model**:
* **Bảng Sổ quỹ (`PHIEUTHU` & `PHIEUCHI`):** Một bảng Phiếu Thu duy nhất có thể được sinh ra từ: Bán hàng POS (`hoaDon`), Tiền đặt cọc (`donDatHang`), Khách trả nợ (`congNo`), Thu tiền trả góp (`hopDongTraGop`), hoặc Khách bù tiền đổi máy (`phieuDoiTra`).
* **Bảng Công nợ (`CONGNO`):** Bảng đa hình dùng chung cho cả 2 đối tượng `KhachHang` (mua chịu tiền mua máy) và `NhaCungCap` (nhập hàng gối đầu trả chậm) thông qua trường định danh `loaiDoiTuong: 'KhachHang' | 'NhaCungCap'`.

### 3.4. Ràng buộc toàn vẹn & Compound Indexes
Để tối ưu hóa tốc độ truy vấn trên hàng triệu bản ghi IMEI, hệ thống thiết lập các Compound Indexes:
* `MayImei.index({ imei: 1 }, { unique: true })` — Đảm bảo không bao giờ trùng IMEI.
* `MayImei.index({ sanPham: 1, trangThai: 1 })` — Tăng tốc độ kiểm đếm tồn kho tức thời.
* `HoaDon.index({ ngayLap: -1, khachHang: 1 })` — Tối ưu báo cáo doanh thu và lịch sử mua sắm.

---

# CHƯƠNG 4: KẾT QUẢ TRIỂN KHAI CÁC CHỨC NĂNG BẮT BUỘC (40 ĐIỂM)

Hệ thống đã hoàn thiện **100% các tiêu chí bắt buộc** trong Bảng điểm phần mềm (Mục 1):

### 4.1. Đăng nhập bảo mật & Quản lý phiên làm việc (3 điểm)
* Giao diện đăng nhập tại `/login.html` với nền Gradient hiện đại, các quả cầu ánh sáng chuyển động mượt mà.
* Xác thực bằng Session Cookie kết hợp mã hóa mật khẩu một chiều `bcryptjs`.
* Nhúng sẵn bảng chọn nhanh tài khoản demo 6 vai trò giúp Giảng viên và Ban giám khảo kiểm thử 1-click mà không phải gõ tay mật khẩu.

### 4.2. Quản lý Người dùng / Nhân viên - CRUD (2 điểm)
* Quản lý danh sách nhân sự tại `/nhan-vien/index.html`.
* Thêm mới nhân viên, phân vai trò chính xác theo 6 nhóm quyền chuẩn tiếng Việt có dấu.
* Tính năng đổi mật khẩu, sửa thông tin liên hệ và cơ chế bảo vệ an toàn: **Không cho phép nhân viên tự xóa tài khoản của chính mình**.

### 4.3. Quản lý Khách hàng - CRUD (4 điểm)
* Giao diện tại `/khach-hang/index.html`.
* Hỗ trợ lưu trữ thông tin: Họ tên, Số điện thoại, Địa chỉ, Email.
* Tra cứu nhanh lịch sử mua sắm: Xem danh sách các hóa đơn và những số IMEI cụ thể khách đã mua tại cửa hàng.

### 4.4. Quản lý Nhà cung cấp - CRUD (4 điểm)
* Giao diện tại `/nha-cung-cap/index.html`.
* Quản lý danh sách đối tác cung ứng thiết bị và linh kiện.
* Tích hợp theo dõi dư nợ mua hàng cộng dồn từ các đợt nhập gối đầu.

### 4.5. Quản lý Sản phẩm Model - CRUD (5 điểm)
* Giao diện tại `/san-pham/index.html` và `/san-pham/form.html`.
* Thêm mới và cấu hình Model máy (Apple, Samsung, Xiaomi...), giá bán niêm yết, thời hạn bảo hành.
* **Cơ chế Soft Delete thông minh:** Khi xóa sản phẩm, hệ thống không dùng lệnh `delete` vật lý (vì sẽ làm hỏng dữ liệu các hóa đơn trong quá khứ), mà tự động chuyển sang cờ `status: false` và ẩn khỏi màn hình bán hàng. Tích hợp Modal Bootstrap `modalXacNhanXoa` sang trọng thay thế hộp thoại confirm mặc định của trình duyệt.

### 4.6. Quản lý Loại hàng / Danh mục (2 điểm)
* Giao diện tại `/danh-muc/index.html`.
* Phân chia rõ ràng 4 nhóm hàng: *Điện thoại thông minh, Máy tính bảng, Phụ kiện chính hãng, Linh kiện bảo hành*.
* Hiển thị số lượng Model máy và số lượng Phụ kiện đang thuộc từng danh mục.

### 4.7. Tìm kiếm dữ liệu Realtime tối ưu Debounce (2 điểm)
* Toàn bộ ô tìm kiếm trên hệ thống đều tích hợp hàm trễ **Debounce (300ms)**. Khi người dùng gõ phím liên tục, hệ thống sẽ chờ người dùng dừng gõ mới phát lệnh truy vấn, loại bỏ tình trạng spam hàng chục request tới máy chủ và giúp bảng danh sách không bị giật lag.

### 4.8. Kiểm tra và chuẩn hóa dữ liệu đầu vào (5 điểm)
* **Frontend:** Bắt buộc nhập đầy đủ các trường đánh dấu sao đỏ (`*`), định dạng tiền tệ tự động theo chuẩn VNĐ (VD: gõ `29990000` $\rightarrow$ hiển thị `29.990.000 đ`), chặn hoàn toàn ký tự chữ cái trên các ô nhập giá tiền và số lượng bằng sự kiện `keypress` & `paste`.
* **Backend:** Validate `mongoose.Types.ObjectId.isValid(id)` trên 100% các endpoint; chặn nhập số tiền âm, chặn ngày kết thúc trước ngày bắt đầu; kiểm tra trạng thái máy trước khi thực hiện giao dịch.

### 4.9. Giao diện thống nhất, Responsive & Trải nghiệm người dùng (10 điểm)
* 100% các màn hình tuân thủ bộ quy chuẩn thiết kế chung (**Design System**): Tông màu chủ đạo Dark Sapphire Blue kết hợp Indigo/Cyan gradient.
* **Sidebar cố định (Fixed Sidebar):** Thanh bên bám trọn chiều dọc màn hình, thanh cuộn được ẩn giấu tinh tế (`scrollbar-width: none`), nội dung chính tự động co giãn `margin-left` (260px mở rộng / 68px thu gọn).
* **Top Navbar chuyên nghiệp:** Tích hợp đồng hồ thời gian thực (Live ticking clock), Avatar tạo từ chữ cái đầu của họ tên và huy hiệu vai trò rực rỡ.
* Tương thích hoàn hảo (Responsive) trên màn hình máy tính để bàn (Desktop), máy tính bảng (Tablet) và điện thoại thông minh (Mobile Drawer menu).

---

# CHƯƠNG 5: TRIỂN KHAI 3 MODULE NGHIỆP VỤ TRỌNG TÂM (40 ĐIỂM)

### 5.1. Module Mua hàng / Nhập kho (15 điểm)
* **Quy trình Lập phiếu nhập kho chuẩn:**
  1. Thủ kho chọn Nhà cung cấp từ danh sách đối tác.
  2. Bổ sung các sản phẩm nhập kho: Có thể nhập cùng lúc nhiều máy điện thoại (gắn số IMEI riêng cho từng chiếc máy) và nhiều món phụ kiện (nhập số lượng).
  3. Hệ thống tự động tính thành tiền từng dòng và tính tổng tiền phiếu nhập theo thời gian thực.
  4. Xác nhận nhập kho: Hệ thống kiểm tra trùng lặp IMEI 2 tầng $\rightarrow$ Lưu bản ghi `PhieuNhap` $\rightarrow$ Lưu `CT_PhieuNhap` $\rightarrow$ Tự động sinh hàng loạt bản ghi trong bảng `MayImei` với trạng thái `'Con hang'` $\rightarrow$ Cập nhật tăng số lượng tồn kho `TonKho` và `PhuKien.soLuongTon`.
  5. Hỗ trợ import hàng loạt danh sách IMEI từ file text hoặc danh sách copy/paste nhanh.

### 5.2. Module Bán hàng POS & Hóa đơn (15 điểm)
* **Màn hình Bán hàng POS chuyên nghiệp tại quầy:**
  1. **Chọn hoặc tạo khách hàng:** Tìm kiếm khách hàng theo SĐT, nếu là khách mới có thể nhấn nút thêm nhanh ngay tại quầy.
  2. **Quét Barcode / Chọn IMEI:** Giao diện hiển thị trực quan các máy đang ở trạng thái `'Con hang'`, hỗ trợ quét đầu đọc mã vạch để đưa máy vào giỏ hàng ngay lập tức.
  3. **Giỏ hàng đa dạng:** Hỗ trợ bán đồng thời cả máy điện thoại (theo số IMEI) và phụ kiện (ốp lưng, sạc, dán màn hình).
  4. **Cấn trừ tiền cọc thông minh:** Nếu khách hàng có đơn đặt hàng trước, nhân viên chỉ cần chọn đơn đặt trước, hệ thống sẽ tự động trừ số tiền cọc đã nộp vào tổng tiền thanh toán.
  5. **Xử lý tài chính kép:**
     - Nếu thanh toán đủ tiền mặt / chuyển khoản: Hệ thống tự động sinh **Phiếu Thu** ghi nhận tiền vào Sổ Quỹ.
     - Nếu khách hàng mua trả sau / ghi nợ: Hệ thống tự động ghi nhận vào sổ **Công Nợ Khách Hàng**.
  6. **In hóa đơn:** Tích hợp sẵn mẫu in hóa đơn nhiệt tiêu chuẩn (khổ K80 và khổ A5) với đầy đủ thông tin số hóa đơn, ngày giờ, số IMEI, thời hạn bảo hành và dòng đọc số tiền thành chữ theo Thông tư Bộ Tài chính.

### 5.3. Module Quản lý Tồn kho & Chống thất thoát (10 điểm)
* **Tra cứu tồn kho chi tiết:**
  - Tra cứu từng máy điện thoại theo số IMEI: Nắm rõ máy đang ở kho nào, ngày nhập bao lâu, tình trạng máy (*Còn hàng, Đã bán, Đang bảo hành, Chờ đổi trả*).
  - Tra cứu tồn kho phụ kiện: Xem số lượng tồn hiện thời và cảnh báo hàng sắp hết.
* **Cập nhật kho tự động:** 
  - Khi Nhập kho: Tồn kho tự động tăng lên.
  - Khi Bán hàng: Trừ tồn kho phụ kiện ngay lập tức, chuyển trạng thái IMEI sang `'Da ban'`.
* **Cơ chế Chống xuất vượt tồn tuyệt đối (Guard Control):**
  - Đối với phụ kiện: Sử dụng điều kiện MongoDB `{ soLuongTon: { $gte: soLuongBan } }` kết hợp toán tử `$inc: { soLuongTon: -soLuongBan }`. Nếu số lượng tồn không đủ, lệnh cập nhật sẽ bị hủy bỏ và ném lỗi 400.
  - Đối với máy IMEI: Cơ chế **Atomic Lock** đảm bảo mỗi chiếc máy chỉ được bán đúng 1 lần duy nhất, ngăn chặn 100% nguy cơ bán trùng.

---

# CHƯƠNG 6: CÁC TÍNH NĂNG MỞ RỘNG VƯỢT TIẾN ĐỘ ĐÃ HOÀN TẤT

Không chỉ dừng lại ở các yêu cầu của Điểm Trình 2, nhóm sinh viên đã chủ động tích hợp thêm **5 phân hệ nâng cao** của Sprint 3:

### 6.1. Đặt hàng trước (Pre-order) & Cấn trừ cọc
* Tiếp nhận khách đặt trước các dòng máy hot (VD: iPhone 16 Pro Max sắp ra mắt).
* Thu tiền cọc, tự động sinh Phiếu Thu cọc trong Sổ Quỹ.
* Khi hàng về kho, cấn trừ tự động tiền cọc vào hóa đơn POS. Cho phép hủy cọc và sinh Phiếu Chi hoàn cọc theo quy định.

### 6.2. Đổi trả máy trong 30 ngày & Bù/Hoàn tiền chênh lệch
* Tự động tính toán số ngày kể từ ngày xuất hóa đơn. Chặn đổi trả nếu đã quá thời hạn 30 ngày.
* Tự động hoán đổi trạng thái 2 chiếc máy: Máy cũ chuyển thành `'Doi tra'`, máy mới chuyển thành `'Da ban'`.
* So sánh giá vốn và giá niêm yết: Nếu máy mới đắt hơn máy cũ $\rightarrow$ tự động sinh Phiếu Thu tiền chênh lệch; nếu máy mới rẻ hơn $\rightarrow$ tự động sinh Phiếu Chi hoàn tiền cho khách.
* Chức năng đặc quyền cho Quản lý: Hủy phiếu đổi trả để hoàn tác kho và sổ quỹ khi có nhầm lẫn.

### 6.3. Tiếp nhận Bảo hành & Sửa chữa
* Tra cứu hạn bảo hành theo số IMEI: Tính tự động dựa trên ngày bán + 12 tháng.
* Tiếp nhận máy lỗi: Chuyển trạng thái IMEI sang `'Bao hanh'`, tạo phiếu tiếp nhận hẹn ngày trả.
* Xuất linh kiện thay thế (màn hình, pin, cáp chân sạc) từ kho linh kiện.
* Hoàn tất sửa chữa: Trả máy cho khách và khôi phục trạng thái IMEI về `'Da ban'`.

### 6.4. Hợp đồng mua hàng Trả góp & Lịch thu kỳ hạn
* Lập hợp đồng mua máy trả góp cho khách hàng có hóa đơn mua lẻ.
* Tự động chia lịch thu nợ thành các kỳ hạn (3, 6, 9, 12 tháng).
* Thu tiền từng kỳ: Tự động ghi nhận Phiếu Thu vào Sổ quỹ, đếm số kỳ đã thu, hoàn tất tất toán khi nộp đủ $N/N$ kỳ.

### 6.5. Quản lý Sổ quỹ Thu - Chi & Tính số dư Realtime
* Tổng hợp toàn bộ dòng tiền mặt của cửa hàng theo công thức:
  $$\text{Số dư quỹ hiện tại} = \sum \text{Phiếu Thu} - \sum \text{Phiếu Chi}$$
* Phân loại chi tiết dòng tiền theo 4 hình thức thanh toán: *Tiền mặt, Chuyển khoản ngân hàng, Quẹt thẻ POS, Ví điện tử*.

---

# CHƯƠNG 7: KẾT QUẢ KIỂM THỬ TỰ ĐỘNG & BẢO ĐẢM CHẤT LƯỢNG (QA)

### 7.1. Tổng quan Master Test Runner (20/20 Test Suites PASS 100%)
Dự án được bảo chứng chất lượng thông qua hệ thống kiểm thử tự động toàn diện chạy bằng lệnh `npm test` (`tests/run_all_tests.js`). Toàn bộ **20 bộ Test Suites** với **785 test assertions** đều vượt qua thành công 100%:

```text
======================================================================
📊 BẢNG TỔNG HỢP KẾT QUẢ KIỂM THỬ TOÀN HỆ THỐNG (785/785 PASS)
======================================================================
┌─────────┬─────────────────────────────────────────────────────────────────────────┬─────────────────────────────────┬───────────┬──────┬──────┬───────────┐
│ (index) │ Test Suite                                                              │ File                            │ Kết quả   │ Pass │ Fail │ Thời gian │
├─────────┼─────────────────────────────────────────────────────────────────────────┼─────────────────────────────────┼───────────┼──────┼──────┼───────────┤
│ 0       │ 'POS Bán Hàng & Bảo Hành Cơ Bản (Tuấn - Tuần 3)'                        │ 'test_tuan_module.js'           │ '✅ PASS' │ 64   │ 0    │ '1.04s'   │
│ 1       │ 'E2E Bán Hàng POS, Cọc, Bảo Hành, KPI (Tuấn - Tuần 5-6)'                │ 'test_tuan_tuan5_6_e2e.js'      │ '✅ PASS' │ 33   │ 0    │ '1.36s'   │
│ 2       │ 'Đặt Hàng Trước (Pre-order) & Cọc (Việt - Tuần 3)'                      │ 'test_viet_module.js'           │ '✅ PASS' │ 32   │ 0    │ '1.16s'   │
│ 3       │ 'Đổi Trả Máy & Cấn Trừ Tiền Cọc (Việt - Tuần 4)'                        │ 'test_viet_tuan4.js'            │ '✅ PASS' │ 39   │ 0    │ '1.19s'   │
│ 4       │ 'Tình Huống Biên Đổi Kèm PK, Hủy Phiếu RBAC (Việt - Tuần 5)'            │ 'test_viet_tuan5.js'            │ '✅ PASS' │ 26   │ 0    │ '1.41s'   │
│ 5       │ 'E2E Toàn Trình Đặt Cọc -> POS -> Đổi Trả -> Hủy Phiếu (Việt - Tuần 6)' │ 'test_viet_tuan6_e2e.js'        │ '✅ PASS' │ 21   │ 0    │ '0.98s'   │
│ 6       │ 'Tồn Kho Dùng Chung & Công Nợ Đa Hình (An - Tuần 3)'                    │ 'test_an_tuan3.js'              │ '✅ PASS' │ 28   │ 0    │ '1.03s'   │
│ 7       │ 'Đối Soát Công Nợ & Cảnh Báo Quá Hạn (An - Tuần 4)'                     │ 'test_an_tuan4.js'              │ '✅ PASS' │ 24   │ 0    │ '0.98s'   │
│ 8       │ 'Hợp Đồng Trả Góp & Lịch Thu Kỳ Hạn (An - Tuần 5)'                      │ 'test_an_tuan5.js'              │ '✅ PASS' │ 23   │ 0    │ '1.06s'   │
│ 9       │ 'Nhập Kho Máy IMEI & Phụ Kiện (Tuân - Tuần 3)'                          │ 'test_tuan_nhap_kho.js'         │ '✅ PASS' │ 25   │ 0    │ '1.01s'   │
│ 10      │ 'Nhập Kho Hàng Loạt IMEI & Lịch Sử NCC (Tuân - Tuần 4)'                 │ 'test_tuan_tuan4.js'            │ '✅ PASS' │ 13   │ 0    │ '1.01s'   │
│ 11      │ 'Trả Hàng Nhà Cung Cấp & Cấn Trừ Công Nợ (Tuân - Tuần 5)'               │ 'test_tuan_tuan5.js'            │ '✅ PASS' │ 8    │ 0    │ '0.57s'   │
│ 12      │ 'Thu - Chi & Báo Cáo Sổ Quỹ Dùng Chung (Vượng - Tuần 3)'                │ 'test_vuong_module.js'          │ '✅ PASS' │ 37   │ 0    │ '0.97s'   │
│ 13      │ 'Kiểm Kê Kho & Xử Lý Lệch IMEI (Vượng - Tuần 4)'                        │ 'test_vuong_tuan4_kiemke.js'    │ '✅ PASS' │ 23   │ 0    │ '0.70s'   │
│ 14      │ 'Báo Cáo Doanh Thu, Top SP & Đối Soát Sổ Quỹ E2E (Vượng - Tuần 5-6)'    │ 'test_vuong_tuan5_6_e2e.js'     │ '✅ PASS' │ 25   │ 0    │ '1.18s'   │
│ 15      │ 'Ma Trận Đăng Nhập 6 Vai Trò (QA)'                                      │ 'verify_all_logins.js'          │ '✅ PASS' │ 6    │ 0    │ '1.62s'   │
│ 16      │ 'Bảo Vệ HTTP API & REST Contracts 24 Endpoints (QA & Backend)'          │ 'test_http_endpoints.js'        │ '✅ PASS' │ 51   │ 0    │ '1.88s'   │
│ 17      │ 'Ràng Buộc DOM Element ID & Data Extractors Frontend (QA & UI)'         │ 'test_frontend_dom_contract.js' │ '✅ PASS' │ 65   │ 0    │ '0.68s'   │
│ 18      │ 'Stress Test & Concurrency Atomic Lock (QA & Tối Ưu)'                   │ 'test_concurrency_stress.js'    │ '✅ PASS' │ 5    │ 0    │ '0.90s'   │
│ 19      │ 'Kiểm Thử Cấu Trúc Giao Diện HTML, Sidebar & Assets (QA & UI)'          │ 'test_ui_html_structure.js'     │ '✅ PASS' │ 237  │ 0    │ '0.13s'   │
└─────────┴─────────────────────────────────────────────────────────────────────────┴─────────────────────────────────┴───────────┴──────┴──────┴───────────┘
⏱  Tổng thời gian chạy toàn bộ: 20.86 giây | 🎯 Kết quả: 785 Thành công, 0 Thất bại
```

### 7.2. Kiểm thử Concurrency Lock & Chống bán trùng IMEI
Trong file `tests/test_concurrency_stress.js`, nhóm đã giả lập tình huống 20 phiên bán hàng đồng thời bắn request thanh toán cùng 1 chiếc điện thoại (cùng mã IMEI):
* **Kết quả:** Duy nhất 1 phiên nhận phản hồi `200 OK` và xuất hóa đơn thành công.
* 19 phiên còn lại bị hệ thống chặn đứng với mã lỗi **`409 Conflict`** và thông báo *"Máy IMEI đã bị bán hoặc không khả dụng"*.

### 7.3. Kiểm thử thẩm định lỗ hổng phân quyền RBAC
Hệ thống sử dụng ma trận gọi chéo toàn bộ API từ 6 tài khoản người dùng:
* Nhân viên bán hàng truy cập trang Quản lý nhân viên $\rightarrow$ Bị chặn `403 Forbidden`.
* Kỹ thuật viên gọi API Lập hợp đồng trả góp $\rightarrow$ Bị chặn `403 Forbidden`.
* Thu ngân gọi API Sửa cấu hình Model sản phẩm $\rightarrow$ Bị chặn `403 Forbidden`.

---

# CHƯƠNG 8: KHÓ KHĂN GẶP PHẢI & GIẢI PHÁP KỸ THUẬT ĐÃ ÁP DỤNG

### 8.1. Race Condition khi nhiều nhân viên thanh toán cùng 1 IMEI
* **Khó khăn:** Nếu dùng mô hình truyền thống (Bước 1: Tìm máy `findOne()` $\rightarrow$ Bước 2: Kiểm tra nếu còn hàng $\rightarrow$ Bước 3: Lưu `save()`), khi có 2 request đến cùng thời điểm, cả 2 đều đọc thấy máy còn hàng và cùng ghi đè trạng thái `Da ban`. Dẫn đến 1 chiếc máy vật lý bị xuất 2 hóa đơn cho 2 khách hàng khác nhau.
* **Giải pháp:** Áp dụng **Atomic FindAndModify Lock** của MongoDB:
  ```javascript
  const locked = await MayImei.findOneAndUpdate(
    { imei: targetImei, trangThai: 'Con hang' },
    { $set: { trangThai: 'Da ban', ngayBan: new Date() } },
    { new: true }
  );
  if (!locked) throw this.createError(`Máy IMEI ${targetImei} đã bị bán ở quầy khác!`, 409);
  ```
  Thao tác này thực hiện ở mức nhân cơ sở dữ liệu (Database Engine Level), bảo đảm tính nguyên tử tuyệt đối.

### 8.2. Rủi ro âm kho phụ kiện khi nhiều đơn hàng đồng thời
* **Khó khăn:** Hai đơn hàng cùng mua 1 món phụ kiện cuối cùng trong kho.
* **Giải pháp:** Sử dụng toán tử điều kiện nguyên tử `$gte` kết hợp `$inc`:
  ```javascript
  const updated = await PhuKien.findOneAndUpdate(
    { _id: pkId, soLuongTon: { $gte: soLuongMua } },
    { $inc: { soLuongTon: -soLuongMua } },
    { new: true }
  );
  if (!updated) throw this.createError('Phụ kiện không đủ số lượng tồn kho để xuất', 400);
  ```

### 8.3. Lệch số dư tiền mặt giữa bán hàng lẻ và sổ quỹ kế toán
* **Khó khăn:** Ban đầu các thành viên tự lập bản ghi thu chi riêng lẻ dẫn tới việc bán hàng xong nhưng sổ quỹ không nhảy số, hoặc hủy đơn nhưng không hoàn tiền sổ quỹ.
* **Giải pháp:** Xây dựng Module tập trung `ThanhToanService` xuất 2 hàm dùng chung `taoPhieuThu()` và `taoPhieuChi()`. Mọi module khác (Bán hàng POS, Đặt cọc, Trả góp, Đổi trả) bắt buộc phải gọi qua 2 hàm này, đảm bảo số dư Sổ quỹ luôn khớp từng đồng.

### 8.4. Mất toàn vẹn dữ liệu khi xóa model sản phẩm cũ
* **Khó khăn:** Khi xóa một Model sản phẩm (VD: iPhone 11 không còn kinh doanh nữa), nếu xóa cứng khỏi DB thì các hóa đơn cũ, phiếu bảo hành cũ của khách hàng mua máy này sẽ bị lỗi tham chiếu (`null reference`).
* **Giải pháp:** Triển khai cơ chế **Soft Delete (Xóa mềm)** qua trường `status: false`. Sản phẩm bị ẩn khỏi danh sách bán mới nhưng toàn bộ dữ liệu lịch sử của máy cũ vẫn được bảo tồn toàn vẹn.

---

# CHƯƠNG 9: KẾ HOẠCH SPRINT CUỐI & ĐỊNH HƯỚNG BẢO VỆ ĐỒ ÁN

### 9.1. Các hạng mục công việc cần hoàn thiện trong Sprint cuối (Tuần 7 & 8)
1. **Hoàn thiện các báo cáo phân tích tài chính chuyên sâu:** Bổ sung biểu đồ thống kê Chart.js hiển thị doanh thu theo tháng, biểu đồ cơ cấu doanh số theo nhân viên và danh sách máy tồn kho lâu ngày (> 60 ngày).
2. **Chuẩn hóa in ấn mẫu chứng từ (@media print):** Tinh chỉnh kích thước trang in hóa đơn nhiệt khổ K80 tự động cắt giấy và khổ A5 sắc nét cho hợp đồng trả góp.
3. **Nạp thêm dữ liệu mẫu trực quan (Rich Demo Seed Data):** Seed sẵn 50+ máy điện thoại thật, 20 khách hàng và 10 nhà cung cấp phục vụ buổi thuyết trình bảo vệ.

### 9.2. Kế hoạch đóng gói phần mềm và bàn giao
* **Source code:** Tổ chức gọn gàng trên GitHub repository `tuan-coder-code/onetech-store`, tuân thủ chuẩn Conventional Commits.
* **Tài liệu bàn giao:** Báo cáo PDF chính thức, Slide thuyết trình Canva/PowerPoint và Video clip demo đăng tải trên YouTube (chế độ không công khai) kèm theo đường dẫn trong báo cáo.

---

# PHỤ LỤC A: KỊCH BẢN VIDEO DEMO CHI TIẾT (5 – 10 PHÚT)

* **Thời lượng đề xuất:** **6 phút 30 giây**.
* **Phân cảnh 1 (00:00 – 01:00): Đăng nhập & Ma trận Phân quyền**
  - Mở trang `/login.html` $\rightarrow$ Đăng nhập tài khoản Quản lý (`admin`). Giới thiệu tổng quan Dashboard và thanh Sidebar cố định.
  - Chuyển sang đăng nhập tài khoản Nhân viên bán hàng $\rightarrow$ Chứng minh menu Nhân viên và Nhập kho tự động biến mất.
* **Phân cảnh 2 (01:00 – 02:15): Thao tác CRUD Danh mục & Sản phẩm**
  - Thêm mới 1 Nhà cung cấp đối tác.
  - Thêm mới 1 Model điện thoại mới (VD: *Samsung Galaxy S24 Ultra*).
  - Thực hiện thao tác xóa model sản phẩm $\rightarrow$ Trình chiếu **Modal xác nhận xóa và cơ chế Soft Delete**.
* **Phân cảnh 3 (02:15 – 03:45): Module Mua hàng / Nhập kho**
  - Mở trang `/nhap-kho/index.html` $\rightarrow$ Chọn NCC vừa tạo.
  - Nhập 2 máy kèm 2 số IMEI cụ thể + nhập 10 phụ kiện củ sạc.
  - Bấm Hoàn tất nhập kho $\rightarrow$ Chuyển sang danh sách Máy IMEI để thấy 2 máy xuất hiện với trạng thái `"Còn hàng"`.
* **Phân cảnh 4 (03:45 – 05:15): Module Bán hàng POS & Kho hàng**
  - Mở màn hình POS `/ban-hang/index.html` $\rightarrow$ Chọn khách hàng.
  - Quét 1 chiếc máy IMEI vừa nhập + 1 củ sạc vào giỏ hàng.
  - Bấm Thanh toán $\rightarrow$ Bật popup xem mẫu In Hóa Đơn bán lẻ.
  - Quay lại bảng Máy IMEI: Chiếc máy đã chuyển sang `"Đã bán"`. Phụ kiện giảm từ 10 xuống 9.
  - Mở Sổ Quỹ: Chứng minh hệ thống tự động sinh 1 **Phiếu Thu** tiền mặt tương ứng.
* **Phân cảnh 5 (05:15 – 06:30): Nghiệp vụ nâng cao (Đổi trả / Bảo hành)**
  - Thao tác tiếp nhận Đổi trả cho chiếc máy vừa bán $\rightarrow$ Kiểm tra máy trong hạn 30 ngày $\rightarrow$ Đổi sang máy mới $\rightarrow$ Bù trừ tiền chênh lệch tự động trong Sổ Quỹ.

---

# PHỤ LỤC B: DÀN Ý SLIDE BÁO CÁO THUYẾT TRÌNH (12 SLIDES)

* **Slide 1 (Trang bìa):** Tên đề tài: OneTech Store — Hệ thống Quản lý Bán hàng Chuỗi Cửa hàng Điện thoại theo số IMEI. GVHD & Danh sách 6 thành viên.
* **Slide 2 (Vấn đề & Mục tiêu):** Khác biệt giữa quản lý hàng hóa thông thường và quản lý thiết bị công nghệ theo từng số IMEI vật lý.
* **Slide 3 (Kiến trúc hệ thống):** Mô hình Layered MVC kết hợp OOP Service Layer, luồng dữ liệu chuẩn mực.
* **Slide 4 (Cơ sở dữ liệu):** Sơ đồ ERD 26 bảng, quan hệ đa hình trong Sổ quỹ và Công nợ, hệ thống Compound Indexes.
* **Slide 5 (Phân quyền RBAC 6 vai trò):** Phân chia trách nhiệm: Quản lý, Thủ kho, NV bán hàng, Thu ngân, Kế toán, Kỹ thuật.
* **Slide 6 (Module Mua hàng - Nhập kho):** Quy trình nhập máy IMEI và phụ kiện, kiểm tra trùng lặp IMEI 2 tầng.
* **Slide 7 (Module Bán hàng POS):** Màn hình bán hàng nhanh tại quầy, quét mã vạch, in hóa đơn nhiệt K80/A5, tích hợp tự động xuất kho và sinh phiếu thu.
* **Slide 8 (Kiểm soát Concurrency & Kho hàng):** Cơ chế Atomic Lock `findOneAndUpdate` chống bán trùng máy và guard `$gte` chống âm kho phụ kiện.
* **Slide 9 (Các phân hệ nâng cao):** Đặt hàng trước cấn trừ cọc, Đổi trả máy trong 30 ngày, Tiếp nhận bảo hành & sửa chữa, Hợp đồng trả góp định kỳ.
* **Slide 10 (Đảm bảo chất lượng - QA):** Kết quả Master Test Runner: 20/20 Test Suites, 785 test assertions PASS 100%.
* **Slide 11 (Khó khăn & Giải pháp):** 4 bài toán hóc búa nhất và cách xử lý kỹ thuật của nhóm.
* **Slide 12 (Tổng kết & Kế hoạch Sprint cuối):** Nghiệm thu Điểm Trình 2 và chuẩn bị bảo vệ đồ án tốt nghiệp. Lời cảm ơn Hội đồng Giám khảo.
