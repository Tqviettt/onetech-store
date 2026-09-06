require('dotenv').config();
const mongoose = require('mongoose');
const {
  NhanVien,
  KhachHang,
  NhaCungCap,
  DanhMuc,
  SanPham,
  MayImei,
  PhuKien,
  LinhKien,
  Kho,
  TonKho,
  HoaDon,
  CT_HoaDon_May,
  CT_HoaDon_PhuKien,
  PhieuXuatKho,
  PhieuBaoHanh,
  CT_PBH_LinhKien,
  DonDatHangTruoc,
  PhieuThu,
  PhieuChi,
  PhieuNhap,
  CT_PhieuNhap,
  CongNo,
  PhieuDoiTra,
  HopDongTraGop,
  BienBanKiemKe,
  DieuChinhKho
} = require('../models');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/onetech_store';
    await mongoose.connect(mongoUri);
    console.log(`[Seed] Đã kết nối tới MongoDB: ${mongoUri}`);

    // -------------------------------------------------------------
    // 0. RESET TOÀN BỘ CƠ SỞ DỮ LIỆU (26 Collections)
    // -------------------------------------------------------------
    console.log('[Seed] 🧹 Đang dọn dẹp và reset trắng 100% cơ sở dữ liệu...');
    await Promise.all([
      NhanVien.deleteMany({}),
      KhachHang.deleteMany({}),
      NhaCungCap.deleteMany({}),
      DanhMuc.deleteMany({}),
      SanPham.deleteMany({}),
      MayImei.deleteMany({}),
      PhuKien.deleteMany({}),
      LinhKien.deleteMany({}),
      Kho.deleteMany({}),
      TonKho.deleteMany({}),
      HoaDon.deleteMany({}),
      CT_HoaDon_May.deleteMany({}),
      CT_HoaDon_PhuKien.deleteMany({}),
      PhieuXuatKho.deleteMany({}),
      PhieuBaoHanh.deleteMany({}),
      CT_PBH_LinhKien.deleteMany({}),
      DonDatHangTruoc.deleteMany({}),
      PhieuThu.deleteMany({}),
      PhieuChi.deleteMany({}),
      PhieuNhap.deleteMany({}),
      CT_PhieuNhap.deleteMany({}),
      CongNo.deleteMany({}),
      PhieuDoiTra.deleteMany({}),
      HopDongTraGop.deleteMany({}),
      BienBanKiemKe.deleteMany({}),
      DieuChinhKho.deleteMany({})
    ]);

    // -------------------------------------------------------------
    // 1. TÀI KHOẢN NHÂN VIÊN (6 VAI TRÒ CHUẨN RBAC)
    // -------------------------------------------------------------
    console.log('[Seed] 1. Khởi tạo 6 Tài khoản Nhân viên (RBAC chuẩn có dấu)...');
    const [nvAdmin, nvBanHang, nvThuKho, nvThuNgan, nvKeToan, nvKyThuat] = await Promise.all([
      NhanVien.create({
        hoTen: 'Nguyễn Quản Lý',
        sdt: '0901111222',
        vaiTro: 'Quản lý',
        tenDangNhap: 'admin',
        matKhau: 'admin123',
        trangThai: 'Hoạt động',
        status: true
      }),
      NhanVien.create({
        hoTen: 'Trần Bán Hàng',
        sdt: '0902222333',
        vaiTro: 'NV bán hàng',
        tenDangNhap: 'banhang',
        matKhau: '123456',
        trangThai: 'Hoạt động',
        status: true
      }),
      NhanVien.create({
        hoTen: 'Lê Thủ Kho',
        sdt: '0903333444',
        vaiTro: 'Thủ kho',
        tenDangNhap: 'thukho',
        matKhau: '123456',
        trangThai: 'Hoạt động',
        status: true
      }),
      NhanVien.create({
        hoTen: 'Phạm Thu Ngân',
        sdt: '0904444555',
        vaiTro: 'Thu ngân',
        tenDangNhap: 'thungan',
        matKhau: '123456',
        trangThai: 'Hoạt động',
        status: true
      }),
      NhanVien.create({
        hoTen: 'Hoàng Kế Toán',
        sdt: '0905555666',
        vaiTro: 'Kế toán',
        tenDangNhap: 'ketoan',
        matKhau: '123456',
        trangThai: 'Hoạt động',
        status: true
      }),
      NhanVien.create({
        hoTen: 'Vũ Kỹ Thuật',
        sdt: '0906666777',
        vaiTro: 'Kỹ thuật',
        tenDangNhap: 'kythuat',
        matKhau: '123456',
        trangThai: 'Hoạt động',
        status: true
      })
    ]);

    // -------------------------------------------------------------
    // 2. DANH MỤC SẢN PHẨM & PHÂN LOẠI (8 Danh mục chuẩn)
    // -------------------------------------------------------------
    console.log('[Seed] 2. Khởi tạo 8 Danh mục Hàng hóa chuẩn...');
    const [
      dmDienThoai,
      dmTablet,
      dmLaptop,
      dmSmartwatch,
      dmAmThanh,
      dmPhuKienSacCap,
      dmLinhKien,
      dmMayCuTradeIn
    ] = await DanhMuc.insertMany([
      { tenDanhMuc: 'Điện thoại thông minh (Smartphones)', moTa: 'Điện thoại iPhone, Samsung, Xiaomi quản lý theo từng IMEI vật lý', status: true },
      { tenDanhMuc: 'Máy tính bảng (iPad & Tablets)', moTa: 'iPad Pro, iPad Air, Galaxy Tab cao cấp quản lý theo số IMEI', status: true },
      { tenDanhMuc: 'Laptop & MacBook', moTa: 'MacBook M2, M3 và Laptop Ultrabook mỏng nhẹ quản lý theo Serial', status: true },
      { tenDanhMuc: 'Đồng hồ thông minh (Smartwatches)', moTa: 'Apple Watch Series 9, Ultra 2, Galaxy Watch 6 quản lý theo Serial', status: true },
      { tenDanhMuc: 'Thiết bị Âm thanh & Tai nghe', moTa: 'AirPods Pro, Galaxy Buds, Loa di động quản lý theo số lượng phụ kiện', status: true },
      { tenDanhMuc: 'Phụ kiện Cáp, Sạc & Ốp lưng', moTa: 'Củ sạc nhanh 20W/45W, Cáp Type-C, Ốp lưng MagSafe, Kính cường lực', status: true },
      { tenDanhMuc: 'Linh kiện sửa chữa & Thay thế', moTa: 'Màn hình OLED, Pin dung lượng cao, Camera bóc máy trung tâm bảo hành', status: true },
      { tenDanhMuc: 'Máy cũ - Thu cũ đổi mới (Trade-in)', moTa: 'Điện thoại qua sử dụng, máy Likenew 99% tuyển chọn có bảo hành', status: true }
    ]);

    // -------------------------------------------------------------
    // 3. ĐỐI TÁC: NHÀ CUNG CẤP & KHÁCH HÀNG
    // -------------------------------------------------------------
    console.log('[Seed] 3. Khởi tạo Nhà cung cấp & Khách hàng thực tế...');
    const [nccApple, nccSamsung, nccFPT, nccDigiworld, nccVienSon] = await NhaCungCap.insertMany([
      {
        tenNCC: 'Apple Việt Nam Distribution',
        sdt: '02838221122',
        diaChi: 'Tầng 12, Bitexco Financial Tower, Quận 1, TP.HCM',
        ghiChu: 'Nguồn hàng chính hãng Apple VN/A ủy quyền',
        status: true
      },
      {
        tenNCC: 'Samsung Vina Electronics',
        sdt: '02838223344',
        diaChi: 'Số 2 Hải Triều, P. Bến Nghé, Quận 1, TP.HCM',
        ghiChu: 'Phân phối trực tiếp điện thoại, tablet & smartwatch Samsung',
        status: true
      },
      {
        tenNCC: 'FPT Synnex Distribution',
        sdt: '02473006666',
        diaChi: 'Tòa nhà FPT Cầu Giấy, Phố Duy Tân, Cầu Giấy, Hà Nội',
        ghiChu: 'Đối tác phân phối tổng hợp linh kiện và máy tính',
        status: true
      },
      {
        tenNCC: 'Digiworld Corporation (DGW)',
        sdt: '02839290059',
        diaChi: '195 Điện Biên Phủ, P.15, Q. Bình Thạnh, TP.HCM',
        ghiChu: 'Nhà phân phối ủy quyền Xiaomi & Phụ kiện cao cấp',
        status: true
      },
      {
        tenNCC: 'Công ty CP Công Nghệ Viễn Sơn',
        sdt: '02838326085',
        diaChi: '162B Bùi Thị Xuân, Phường Phạm Ngũ Lão, Quận 1, TP.HCM',
        ghiChu: 'Phân phối linh kiện chính hãng & sạc cáp Anker, Marshall',
        status: true
      }
    ]);

    const [khAn, khMai, khLong, khTrang, khYen, khTung, khHoa, khDuc] = await KhachHang.insertMany([
      { hoTen: 'Nguyễn Văn An', sdt: '0988123456', diaChi: '45 Xuân Thủy, Cầu Giấy, Hà Nội', status: true },
      { hoTen: 'Trần Thị Mai', sdt: '0977234567', diaChi: '12 Nguyễn Trãi, Thanh Xuân, Hà Nội', status: true },
      { hoTen: 'Lê Hoàng Long', sdt: '0912345678', diaChi: '78 Hai Bà Trưng, Quận 1, TP.HCM', status: true },
      { hoTen: 'Phạm Minh Trang', sdt: '0933456789', diaChi: '15 Lê Duẩn, Hoàn Kiếm, Hà Nội', status: true },
      { hoTen: 'Đỗ Hoàng Yến', sdt: '0944567890', diaChi: '88 Nguyễn Đình Chiểu, Quận 3, TP.HCM', status: true },
      { hoTen: 'Hoàng Thanh Tùng', sdt: '0966789012', diaChi: '102 Thái Hà, Đống Đa, Hà Nội', status: true },
      { hoTen: 'Vũ Thị Thanh Hoa', sdt: '0918889900', diaChi: '240 Trần Hưng Đạo, Quận 5, TP.HCM', status: true },
      { hoTen: 'Đặng Minh Đức', sdt: '0982334455', diaChi: '56 Hoàng Hoa Thám, Ba Đình, Hà Nội', status: true }
    ]);

    // -------------------------------------------------------------
    // 4. KHO HÀNG
    // -------------------------------------------------------------
    console.log('[Seed] 4. Khởi tạo Hệ thống 3 Kho hàng...');
    const [khoCauGiay, khoThaiHa, khoSaiGon] = await Kho.insertMany([
      { tenKho: 'Kho Tổng Cầu Giấy', diaChi: 'Số 128 Xuân Thủy, Cầu Giấy, Hà Nội' },
      { tenKho: 'Kho Showroom Thái Hà', diaChi: 'Số 85 Thái Hà, Đống Đa, Hà Nội' },
      { tenKho: 'Kho Chi nhánh Quận 1', diaChi: 'Số 45 Lê Lợi, Bến Nghé, Quận 1, TP.HCM' }
    ]);

    // -------------------------------------------------------------
    // 5. MODEL SẢN PHẨM (16 Model trải rộng các danh mục)
    // -------------------------------------------------------------
    console.log('[Seed] 5. Khởi tạo 16 Model Sản phẩm đa phân khúc...');
    const [
      spIphone15PM,
      spIphone15Pro,
      spIphone15Plus,
      spIphone14,
      spS24Ultra,
      spZFold5,
      spS23,
      spXiaomi14U,
      spIpadPro,
      spIpadAir,
      spMacBookAir,
      spMacBookPro,
      spAppleWatch9,
      spAppleWatchUltra,
      spGalaxyWatch6,
      spIphone13Old
    ] = await SanPham.insertMany([
      // Smartphones
      {
        danhMuc: dmDienThoai._id,
        tenMay: 'iPhone 15 Pro Max 256GB',
        hang: 'Apple',
        giaBan: 29990000,
        soThangBH: 12,
        moTa: 'Chip A17 Pro 3nm, khung viền Titan, Camera tiềm vọng 5x, Action button',
        status: true
      },
      {
        danhMuc: dmDienThoai._id,
        tenMay: 'iPhone 15 Pro 128GB',
        hang: 'Apple',
        giaBan: 25490000,
        soThangBH: 12,
        moTa: 'Thiết kế nhỏ gọn 6.1 inch, Titan chuẩn hàng không vũ trụ, cổng Type-C tốc độ cao',
        status: true
      },
      {
        danhMuc: dmDienThoai._id,
        tenMay: 'iPhone 15 Plus 128GB',
        hang: 'Apple',
        giaBan: 22190000,
        soThangBH: 12,
        moTa: 'Màn hình lớn 6.7 inch, Dynamic Island, pin siêu khủng 2 ngày dùng',
        status: true
      },
      {
        danhMuc: dmDienThoai._id,
        tenMay: 'iPhone 14 128GB',
        hang: 'Apple',
        giaBan: 16990000,
        soThangBH: 12,
        moTa: 'Màn hình Super Retina XDR, Camera kép nâng cấp Photonic Engine',
        status: true
      },
      {
        danhMuc: dmDienThoai._id,
        tenMay: 'Samsung Galaxy S24 Ultra 512GB',
        hang: 'Samsung',
        giaBan: 31990000,
        soThangBH: 12,
        moTa: 'Quyền năng Galaxy AI, Bút S-Pen tích hợp, khung viền Titan, Camera 200MP',
        status: true
      },
      {
        danhMuc: dmDienThoai._id,
        tenMay: 'Samsung Galaxy Z Fold 5 256GB',
        hang: 'Samsung',
        giaBan: 33490000,
        soThangBH: 12,
        moTa: 'Màn hình gập Dynamic AMOLED 2X, bản lề Flex không khe hở',
        status: true
      },
      {
        danhMuc: dmDienThoai._id,
        tenMay: 'Samsung Galaxy S23 128GB',
        hang: 'Samsung',
        giaBan: 14990000,
        soThangBH: 12,
        moTa: 'Thiết kế nhỏ gọn sang trọng, Snapdragon 8 Gen 2 for Galaxy',
        status: true
      },
      {
        danhMuc: dmDienThoai._id,
        tenMay: 'Xiaomi 14 Ultra 512GB',
        hang: 'Xiaomi',
        giaBan: 28990000,
        soThangBH: 18,
        moTa: 'Hợp tác Leica, 4 cảm biến 50MP, Chip Snapdragon 8 Gen 3',
        status: true
      },

      // Tablets
      {
        danhMuc: dmTablet._id,
        tenMay: 'iPad Pro M2 11 inch Wi-Fi 128GB',
        hang: 'Apple',
        giaBan: 20490000,
        soThangBH: 12,
        moTa: 'Chip Apple M2 cực mạnh, màn hình ProMotion 120Hz, hỗ trợ Apple Pencil 2',
        status: true
      },
      {
        danhMuc: dmTablet._id,
        tenMay: 'iPad Air 5 M1 10.9 inch 64GB',
        hang: 'Apple',
        giaBan: 14990000,
        soThangBH: 12,
        moTa: 'Chip M1 đột phá, Touch ID nút nguồn, màu sắc trẻ trung',
        status: true
      },

      // Laptops
      {
        danhMuc: dmLaptop._id,
        tenMay: 'MacBook Air M2 13 inch 8GB/256GB',
        hang: 'Apple',
        giaBan: 24890000,
        soThangBH: 12,
        moTa: 'Thiết kế siêu mỏng nhẹ thời thượng, màn hình Liquid Retina sắc nét',
        status: true
      },
      {
        danhMuc: dmLaptop._id,
        tenMay: 'MacBook Pro 14 inch M3 8GB/512GB',
        hang: 'Apple',
        giaBan: 39990000,
        soThangBH: 12,
        moTa: 'Chip M3 thế hệ mới, màn hình Liquid Retina XDR 120Hz đỉnh cao',
        status: true
      },

      // Smartwatches
      {
        danhMuc: dmSmartwatch._id,
        tenMay: 'Apple Watch Series 9 GPS 41mm Nhôm',
        hang: 'Apple',
        giaBan: 9890000,
        soThangBH: 12,
        moTa: 'Chip S9 SiP mạnh mẽ, thao tác chạm đúp Double Tap độc đáo',
        status: true
      },
      {
        danhMuc: dmSmartwatch._id,
        tenMay: 'Apple Watch Ultra 2 GPS + Cellular 49mm Titan',
        hang: 'Apple',
        giaBan: 20990000,
        soThangBH: 12,
        moTa: 'Vỏ Titan siêu bền, GPS tần số kép chuẩn xác, pin đến 72 giờ',
        status: true
      },
      {
        danhMuc: dmSmartwatch._id,
        tenMay: 'Samsung Galaxy Watch 6 Classic 43mm Bluetooth',
        hang: 'Samsung',
        giaBan: 7990000,
        soThangBH: 12,
        moTa: 'Viền xoay vật lý cổ điển, theo dõi sức khỏe và giấc ngủ chuyên sâu',
        status: true
      },

      // Máy cũ Trade-in
      {
        danhMuc: dmMayCuTradeIn._id,
        tenMay: 'iPhone 13 128GB Likenew 99%',
        hang: 'Apple',
        giaBan: 11990000,
        soThangBH: 6,
        moTa: 'Máy cũ nguyên bản đẹp như mới, pin 9x, bảo hành 6 tháng 1 đổi 1',
        status: true
      }
    ]);

    // -------------------------------------------------------------
    // 6. PHỤ KIỆN & LINH KIỆN
    // -------------------------------------------------------------
    console.log('[Seed] 6. Khởi tạo Phụ kiện & Linh kiện phân theo danh mục...');
    const [
      pkSac20w,
      pkCapC,
      pkOpLung15,
      pkSac45w,
      pkAirPods2,
      pkCuongLuc,
      pkSacDuPhong,
      pkAirPodsPro,
      pkBuds2Pro,
      pkMarshall
    ] = await PhuKien.insertMany([
      // Thuộc Phụ kiện Cáp Sạc & Ốp lưng
      { danhMuc: dmPhuKienSacCap._id, tenPK: 'Củ sạc Apple 20W Type-C Chính hãng', giaBan: 520000, soLuongTon: 60, status: true },
      { danhMuc: dmPhuKienSacCap._id, tenPK: 'Cáp sạc C to C Apple Braided 1m', giaBan: 490000, soLuongTon: 45, status: true },
      { danhMuc: dmPhuKienSacCap._id, tenPK: 'Ốp lưng MagSafe iPhone 15 Pro Max Clear Case', giaBan: 890000, soLuongTon: 35, status: true },
      { danhMuc: dmPhuKienSacCap._id, tenPK: 'Củ sạc Samsung 45W Type-C Super Fast', giaBan: 650000, soLuongTon: 30, status: true },
      { danhMuc: dmPhuKienSacCap._id, tenPK: 'Kính cường lực KingKong 9D chống nhìn trộm', giaBan: 180000, soLuongTon: 100, status: true },
      { danhMuc: dmPhuKienSacCap._id, tenPK: 'Sạc dự phòng Anker MagGo 10000mAh 15W', giaBan: 1290000, soLuongTon: 25, status: true },

      // Thuộc Thiết bị Âm thanh & Tai nghe
      { danhMuc: dmAmThanh._id, tenPK: 'Tai nghe Apple AirPods 3 Lightning', giaBan: 3990000, soLuongTon: 15, status: true },
      { danhMuc: dmAmThanh._id, tenPK: 'Tai nghe Apple AirPods Pro 2 USB-C', giaBan: 5490000, soLuongTon: 20, status: true },
      { danhMuc: dmAmThanh._id, tenPK: 'Tai nghe Samsung Galaxy Buds 2 Pro', giaBan: 3290000, soLuongTon: 18, status: true },
      { danhMuc: dmAmThanh._id, tenPK: 'Loa Bluetooth Marshall Emberton II', giaBan: 3890000, soLuongTon: 12, status: true }
    ]);

    const [lkManHinh15, lkPin15, lkCamS24, lkChanSacC, lkManHinh14, lkPin14] = await LinhKien.insertMany([
      { tenLK: 'Màn hình OLED iPhone 15 Pro Max GX', donGia: 7500000, soLuongTon: 8 },
      { tenLK: 'Pin Li-ion iPhone 15 Pro Max Pisen', donGia: 1800000, soLuongTon: 15 },
      { tenLK: 'Cụm Camera sau Galaxy S24 Ultra Zin bóc máy', donGia: 3200000, soLuongTon: 6 },
      { tenLK: 'Cụm bo cáp sạc Type-C Galaxy S24 Ultra', donGia: 850000, soLuongTon: 10 },
      { tenLK: 'Màn hình Super Retina XDR iPhone 14 zin', donGia: 4200000, soLuongTon: 5 },
      { tenLK: 'Pin Li-ion iPhone 14 Pisen dung lượng cao', donGia: 1200000, soLuongTon: 12 }
    ]);

    // -------------------------------------------------------------
    // 7. MÁY THEO SỐ IMEI VẬT LÝ (48 máy đầy đủ trạng thái)
    // -------------------------------------------------------------
    console.log('[Seed] 7. Khởi tạo 48 Máy IMEI vật lý theo logic chu trình...');
    await MayImei.insertMany([
      // iPhone 15 Pro Max (Con hang: 4, Da ban: 2, Bao hanh: 1)
      { imei: '356789012345001', sanPham: spIphone15PM._id, giaNhap: 26500000, trangThai: 'Con hang', mauSac: 'Titan Tự Nhiên', dungLuong: '256GB', status: true },
      { imei: '356789012345002', sanPham: spIphone15PM._id, giaNhap: 26500000, trangThai: 'Con hang', mauSac: 'Titan Xanh', dungLuong: '256GB', status: true },
      { imei: '356789012345003', sanPham: spIphone15PM._id, giaNhap: 26500000, trangThai: 'Con hang', mauSac: 'Titan Đen', dungLuong: '256GB', status: true },
      { imei: '356789012345004', sanPham: spIphone15PM._id, giaNhap: 26500000, trangThai: 'Da ban', mauSac: 'Titan Tự Nhiên', dungLuong: '256GB', status: true }, // Bán HD1 -> Đổi trả DT1
      { imei: '356789012345005', sanPham: spIphone15PM._id, giaNhap: 26500000, trangThai: 'Bao hanh', mauSac: 'Titan Trắng', dungLuong: '256GB', status: true }, // PBH1
      { imei: '356789012345006', sanPham: spIphone15PM._id, giaNhap: 26500000, trangThai: 'Da ban', mauSac: 'Titan Tự Nhiên', dungLuong: '256GB', status: true }, // Máy mới đổi trong DT1
      { imei: '356789012345007', sanPham: spIphone15PM._id, giaNhap: 26500000, trangThai: 'Con hang', mauSac: 'Titan Trắng', dungLuong: '256GB', status: true },

      // iPhone 15 Pro (Con hang: 3, Da ban: 1)
      { imei: '356789012345011', sanPham: spIphone15Pro._id, giaNhap: 22000000, trangThai: 'Con hang', mauSac: 'Titan Tự Nhiên', dungLuong: '128GB', status: true },
      { imei: '356789012345012', sanPham: spIphone15Pro._id, giaNhap: 22000000, trangThai: 'Con hang', mauSac: 'Titan Đen', dungLuong: '128GB', status: true },
      { imei: '356789012345013', sanPham: spIphone15Pro._id, giaNhap: 22000000, trangThai: 'Da ban', mauSac: 'Titan Trắng', dungLuong: '128GB', status: true }, // Bán HD2 (Trả góp)
      { imei: '356789012345014', sanPham: spIphone15Pro._id, giaNhap: 22000000, trangThai: 'Con hang', mauSac: 'Titan Xanh', dungLuong: '128GB', status: true },

      // iPhone 15 Plus (Con hang: 2)
      { imei: '356789012345021', sanPham: spIphone15Plus._id, giaNhap: 19500000, trangThai: 'Con hang', mauSac: 'Hồng Pastel', dungLuong: '128GB', status: true },
      { imei: '356789012345022', sanPham: spIphone15Plus._id, giaNhap: 19500000, trangThai: 'Con hang', mauSac: 'Xanh Lá Pastel', dungLuong: '128GB', status: true },

      // iPhone 14 (Con hang: 2, Da ban: 1)
      { imei: '356789012345101', sanPham: spIphone14._id, giaNhap: 14500000, trangThai: 'Con hang', mauSac: 'Midnight', dungLuong: '128GB', status: true },
      { imei: '356789012345102', sanPham: spIphone14._id, giaNhap: 14500000, trangThai: 'Con hang', mauSac: 'Starlight', dungLuong: '128GB', status: true },
      { imei: '356789012345103', sanPham: spIphone14._id, giaNhap: 14500000, trangThai: 'Da ban', mauSac: 'Blue', dungLuong: '128GB', status: true }, // PBH2 (đã sửa & trả khách)

      // Samsung Galaxy S24 Ultra (Con hang: 2, Da ban: 1, Loi: 1, Tra NCC: 1)
      { imei: '356789012345201', sanPham: spS24Ultra._id, giaNhap: 27800000, trangThai: 'Con hang', mauSac: 'Xám Titan', dungLuong: '512GB', status: true }, // Gán Pre-order DDH2
      { imei: '356789012345202', sanPham: spS24Ultra._id, giaNhap: 27800000, trangThai: 'Con hang', mauSac: 'Đen Titan', dungLuong: '512GB', status: true },
      { imei: '356789012345203', sanPham: spS24Ultra._id, giaNhap: 27800000, trangThai: 'Loi', mauSac: 'Tím Titan', dungLuong: '512GB', status: true }, // Lỗi camera
      { imei: '356789012345204', sanPham: spS24Ultra._id, giaNhap: 27800000, trangThai: 'Da ban', mauSac: 'Vàng Titan', dungLuong: '512GB', status: true }, // Bán HD3 (Công nợ KH)
      { imei: '356789012345205', sanPham: spS24Ultra._id, giaNhap: 27800000, trangThai: 'Tra NCC', mauSac: 'Xám Titan', dungLuong: '512GB', status: false }, // Đã trả NCC Samsung

      // Samsung Galaxy Z Fold 5 (Con hang: 2)
      { imei: '356789012345211', sanPham: spZFold5._id, giaNhap: 28500000, trangThai: 'Con hang', mauSac: 'Xanh Icy', dungLuong: '256GB', status: true },
      { imei: '356789012345212', sanPham: spZFold5._id, giaNhap: 28500000, trangThai: 'Con hang', mauSac: 'Đen Phantom', dungLuong: '256GB', status: true },

      // Samsung Galaxy S23 (Con hang: 2)
      { imei: '356789012345221', sanPham: spS23._id, giaNhap: 12500000, trangThai: 'Con hang', mauSac: 'Kem Cotton', dungLuong: '128GB', status: true },
      { imei: '356789012345222', sanPham: spS23._id, giaNhap: 12500000, trangThai: 'Con hang', mauSac: 'Đen Phantom', dungLuong: '128GB', status: true },

      // Xiaomi 14 Ultra (Con hang: 2)
      { imei: '356789012345301', sanPham: spXiaomi14U._id, giaNhap: 24500000, trangThai: 'Con hang', mauSac: 'Đen Da Thuộc', dungLuong: '512GB', status: true },
      { imei: '356789012345302', sanPham: spXiaomi14U._id, giaNhap: 24500000, trangThai: 'Con hang', mauSac: 'Trắng Da Thuộc', dungLuong: '512GB', status: true },

      // iPad Pro M2 (Con hang: 2)
      { imei: '356789012345401', sanPham: spIpadPro._id, giaNhap: 17500000, trangThai: 'Con hang', mauSac: 'Space Gray', dungLuong: '128GB', status: true },
      { imei: '356789012345402', sanPham: spIpadPro._id, giaNhap: 17500000, trangThai: 'Con hang', mauSac: 'Silver', dungLuong: '128GB', status: true },

      // iPad Air 5 (Con hang: 1, Da ban: 1)
      { imei: '356789012345411', sanPham: spIpadAir._id, giaNhap: 12500000, trangThai: 'Con hang', mauSac: 'Blue', dungLuong: '64GB', status: true },
      { imei: '356789012345412', sanPham: spIpadAir._id, giaNhap: 12500000, trangThai: 'Da ban', mauSac: 'Purple', dungLuong: '64GB', status: true }, // Bán HD5

      // MacBook Air M2 (Con hang: 1, Da ban: 1)
      { imei: '356789012345501', sanPham: spMacBookAir._id, giaNhap: 21500000, trangThai: 'Con hang', mauSac: 'Midnight', dungLuong: '256GB', status: true },
      { imei: '356789012345502', sanPham: spMacBookAir._id, giaNhap: 21500000, trangThai: 'Da ban', mauSac: 'Starlight', dungLuong: '256GB', status: true }, // Bán HD4 (Pre-order DDH3)

      // MacBook Pro 14 M3 (Con hang: 1)
      { imei: '356789012345511', sanPham: spMacBookPro._id, giaNhap: 34500000, trangThai: 'Con hang', mauSac: 'Space Black', dungLuong: '512GB', status: true },

      // Apple Watch Series 9 (Con hang: 2)
      { imei: '356789012345601', sanPham: spAppleWatch9._id, giaNhap: 8200000, trangThai: 'Con hang', mauSac: 'Midnight', dungLuong: '41mm', status: true },
      { imei: '356789012345602', sanPham: spAppleWatch9._id, giaNhap: 8200000, trangThai: 'Con hang', mauSac: 'Starlight', dungLuong: '41mm', status: true },

      // Apple Watch Ultra 2 (Con hang: 1, Da ban: 1)
      { imei: '356789012345611', sanPham: spAppleWatchUltra._id, giaNhap: 17900000, trangThai: 'Con hang', mauSac: 'Titan Tự Nhiên', dungLuong: '49mm', status: true },
      { imei: '356789012345612', sanPham: spAppleWatchUltra._id, giaNhap: 17900000, trangThai: 'Da ban', mauSac: 'Titan Tự Nhiên', dungLuong: '49mm', status: true }, // Bán HD6

      // Galaxy Watch 6 (Con hang: 2)
      { imei: '356789012345621', sanPham: spGalaxyWatch6._id, giaNhap: 6400000, trangThai: 'Con hang', mauSac: 'Đen Classic', dungLuong: '43mm', status: true },
      { imei: '356789012345622', sanPham: spGalaxyWatch6._id, giaNhap: 6400000, trangThai: 'Con hang', mauSac: 'Bạc Classic', dungLuong: '43mm', status: true },

      // iPhone 13 Likenew (Con hang: 2)
      { imei: '356789012345701', sanPham: spIphone13Old._id, giaNhap: 9500000, trangThai: 'Con hang', mauSac: 'Midnight 99%', dungLuong: '128GB', status: true },
      { imei: '356789012345702', sanPham: spIphone13Old._id, giaNhap: 9500000, trangThai: 'Con hang', mauSac: 'Pink 99%', dungLuong: '128GB', status: true }
    ]);

    // -------------------------------------------------------------
    // 8. TỒN KHO KHỚP 100% VỚI MÁY CÒN HÀNG (TonKho)
    // -------------------------------------------------------------
    console.log('[Seed] 8. Khởi tạo Tồn kho (TonKho) khớp 100% với số lượng máy Con hang...');
    await TonKho.insertMany([
      { kho: khoCauGiay._id, sanPham: spIphone15PM._id, soLuong: 3 },
      { kho: khoThaiHa._id, sanPham: spIphone15PM._id, soLuong: 1 },
      { kho: khoCauGiay._id, sanPham: spIphone15Pro._id, soLuong: 2 },
      { kho: khoThaiHa._id, sanPham: spIphone15Pro._id, soLuong: 1 },
      { kho: khoCauGiay._id, sanPham: spIphone15Plus._id, soLuong: 2 },
      { kho: khoCauGiay._id, sanPham: spIphone14._id, soLuong: 2 },
      { kho: khoCauGiay._id, sanPham: spS24Ultra._id, soLuong: 1 },
      { kho: khoSaiGon._id, sanPham: spS24Ultra._id, soLuong: 1 },
      { kho: khoCauGiay._id, sanPham: spZFold5._id, soLuong: 2 },
      { kho: khoThaiHa._id, sanPham: spS23._id, soLuong: 2 },
      { kho: khoThaiHa._id, sanPham: spXiaomi14U._id, soLuong: 2 },
      { kho: khoCauGiay._id, sanPham: spIpadPro._id, soLuong: 2 },
      { kho: khoCauGiay._id, sanPham: spIpadAir._id, soLuong: 1 },
      { kho: khoCauGiay._id, sanPham: spMacBookAir._id, soLuong: 1 },
      { kho: khoSaiGon._id, sanPham: spMacBookPro._id, soLuong: 1 },
      { kho: khoThaiHa._id, sanPham: spAppleWatch9._id, soLuong: 2 },
      { kho: khoCauGiay._id, sanPham: spAppleWatchUltra._id, soLuong: 1 },
      { kho: khoThaiHa._id, sanPham: spGalaxyWatch6._id, soLuong: 2 },
      { kho: khoCauGiay._id, sanPham: spIphone13Old._id, soLuong: 2 }
    ]);

    // -------------------------------------------------------------
    // 9. PHIẾU NHẬP KHO LÔ HÀNG (Tuân)
    // -------------------------------------------------------------
    console.log('[Seed] 9. Khởi tạo Phiếu Nhập kho & Chi tiết nhập...');
    // PN1: Nhập Apple chính hãng (185.000.000 đ) - Thanh toán ngay
    const pn1 = await PhieuNhap.create({
      maPN: 'PN20260801',
      nhaCungCap: nccApple._id,
      nhanVien: nvThuKho._id,
      ngayNhap: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
      tongTien: 185000000,
      ghiChu: 'Nhập lô iPhone 15 Series & MacBook Air đợt 1 từ Apple VN',
      status: true
    });

    await CT_PhieuNhap.insertMany([
      { phieuNhap: pn1._id, imei: '356789012345001', sanPham: spIphone15PM._id, donGiaNhap: 26500000 },
      { phieuNhap: pn1._id, imei: '356789012345002', sanPham: spIphone15PM._id, donGiaNhap: 26500000 },
      { phieuNhap: pn1._id, imei: '356789012345003', sanPham: spIphone15PM._id, donGiaNhap: 26500000 },
      { phieuNhap: pn1._id, imei: '356789012345004', sanPham: spIphone15PM._id, donGiaNhap: 26500000 },
      { phieuNhap: pn1._id, imei: '356789012345006', sanPham: spIphone15PM._id, donGiaNhap: 26500000 },
      { phieuNhap: pn1._id, imei: '356789012345501', sanPham: spMacBookAir._id, donGiaNhap: 21500000 },
      { phieuNhap: pn1._id, imei: '356789012345502', sanPham: spMacBookAir._id, donGiaNhap: 21500000 }
    ]);

    // PN2: Nhập Samsung Galaxy S24 Ultra (83.400.000 đ) - Ghi nợ NCC
    const pn2 = await PhieuNhap.create({
      maPN: 'PN20260802',
      nhaCungCap: nccSamsung._id,
      nhanVien: nvThuKho._id,
      ngayNhap: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      tongTien: 83400000,
      ghiChu: 'Nhập lô Galaxy S24 Ultra 512GB (Hình thức Ghi nợ gối đầu 30 ngày)',
      status: true
    });

    await CT_PhieuNhap.insertMany([
      { phieuNhap: pn2._id, imei: '356789012345201', sanPham: spS24Ultra._id, donGiaNhap: 27800000 },
      { phieuNhap: pn2._id, imei: '356789012345202', sanPham: spS24Ultra._id, donGiaNhap: 27800000 },
      { phieuNhap: pn2._id, imei: '356789012345204', sanPham: spS24Ultra._id, donGiaNhap: 27800000 }
    ]);

    // PN3: Nhập phụ kiện & linh kiện từ FPT Synnex (45.000.000 đ) - Thanh toán ngay
    const pn3 = await PhieuNhap.create({
      maPN: 'PN20260803',
      nhaCungCap: nccFPT._id,
      nhanVien: nvThuKho._id,
      ngayNhap: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      tongTien: 45000000,
      ghiChu: 'Nhập củ sạc, cáp sạc, tai nghe và pin linh kiện',
      status: true
    });

    // PN4: Nhập Apple Watch Ultra & AirPods từ Digiworld (41.780.000 đ) - Thanh toán ngay
    const pn4 = await PhieuNhap.create({
      maPN: 'PN20260804',
      nhaCungCap: nccDigiworld._id,
      nhanVien: nvThuKho._id,
      ngayNhap: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      tongTien: 41780000,
      ghiChu: 'Nhập đồng hồ Apple Watch Ultra 2 & tai nghe AirPods',
      status: true
    });

    await CT_PhieuNhap.insertMany([
      { phieuNhap: pn4._id, imei: '356789012345611', sanPham: spAppleWatchUltra._id, donGiaNhap: 17900000 },
      { phieuNhap: pn4._id, imei: '356789012345612', sanPham: spAppleWatchUltra._id, donGiaNhap: 17900000 }
    ]);

    // -------------------------------------------------------------
    // 10. HÓA ĐƠN BÁN HÀNG & PHIẾU XUẤT KHO (Tuấn)
    // -------------------------------------------------------------
    console.log('[Seed] 10. Khởi tạo 6 Hóa đơn Bán hàng & Phiếu xuất kho...');
    // HD1: Khách An mua iPhone 15 Pro Max + Củ sạc 20W (Tiền mặt: 30.510.000 đ)
    const hd1 = await HoaDon.create({
      soHD: 'HD20260801',
      khachHang: khAn._id,
      nhanVien: nvBanHang._id,
      ngayLap: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      tongTien: 30510000,
      trangThai: 'Da thanh toan',
      ghiChu: 'Khách hàng mua thanh toán tiền mặt tại quầy',
      status: true
    });
    await CT_HoaDon_May.create({ hoaDon: hd1._id, imei: '356789012345004', donGiaBan: 29990000 });
    await CT_HoaDon_PhuKien.create({ hoaDon: hd1._id, phuKien: pkSac20w._id, soLuong: 1, donGiaBan: 520000 });
    await PhieuXuatKho.create({ hoaDon: hd1._id, lyDoXuat: `Xuat ban hang theo hoa don ${hd1.soHD}`, ngayXuat: hd1.ngayLap });

    // HD2: Khách Mai mua iPhone 15 Pro (Trả góp 6 tháng: 25.490.000 đ)
    const hd2 = await HoaDon.create({
      soHD: 'HD20260802',
      khachHang: khMai._id,
      nhanVien: nvBanHang._id,
      ngayLap: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      tongTien: 25490000,
      trangThai: 'Da thanh toan',
      ghiChu: 'Khách mua qua hợp đồng trả góp 6 tháng, trả trước 10tr',
      status: true
    });
    await CT_HoaDon_May.create({ hoaDon: hd2._id, imei: '356789012345013', donGiaBan: 25490000 });
    await PhieuXuatKho.create({ hoaDon: hd2._id, lyDoXuat: `Xuat ban hang theo hoa don ${hd2.soHD}`, ngayXuat: hd2.ngayLap });

    // HD3: Khách Long mua Galaxy S24 Ultra (Công nợ KH: 31.990.000 đ)
    const hd3 = await HoaDon.create({
      soHD: 'HD20260803',
      khachHang: khLong._id,
      nhanVien: nvBanHang._id,
      ngayLap: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      tongTien: 31990000,
      trangThai: 'Da thanh toan',
      ghiChu: 'Khách trả trước 10tr, còn ghi nợ 21.99tr',
      status: true
    });
    await CT_HoaDon_May.create({ hoaDon: hd3._id, imei: '356789012345204', donGiaBan: 31990000 });
    await PhieuXuatKho.create({ hoaDon: hd3._id, lyDoXuat: `Xuat ban hang theo hoa don ${hd3.soHD}`, ngayXuat: hd3.ngayLap });

    // HD4: Khách Trang nhận máy MacBook Air M2 sau khi cấn trừ cọc (Chuyển khoản: 24.890.000 đ)
    const hd4 = await HoaDon.create({
      soHD: 'HD20260804',
      khachHang: khTrang._id,
      nhanVien: nvBanHang._id,
      ngayLap: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      tongTien: 24890000,
      trangThai: 'Da thanh toan',
      ghiChu: 'Đơn đặt trước DAT20260803 nhận máy: Giá 24.89tr, cấn trừ cọc 3tr, thu 21.89tr',
      status: true
    });
    await CT_HoaDon_May.create({ hoaDon: hd4._id, imei: '356789012345502', donGiaBan: 24890000 });
    await PhieuXuatKho.create({ hoaDon: hd4._id, lyDoXuat: `Xuat ban hang theo hoa don ${hd4.soHD}`, ngayXuat: hd4.ngayLap });

    // HD5: Khách Hoa mua iPad Air 5 + Kính cường lực (Chuyển khoản VietQR: 15.170.000 đ)
    const hd5 = await HoaDon.create({
      soHD: 'HD20260805',
      khachHang: khHoa._id,
      nhanVien: nvBanHang._id,
      ngayLap: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      tongTien: 15170000,
      trangThai: 'Da thanh toan',
      ghiChu: 'Khách thanh toán chuyển khoản VietQR nhận máy tại chỗ',
      status: true
    });
    await CT_HoaDon_May.create({ hoaDon: hd5._id, imei: '356789012345412', donGiaBan: 14990000 });
    await CT_HoaDon_PhuKien.create({ hoaDon: hd5._id, phuKien: pkCuongLuc._id, soLuong: 1, donGiaBan: 180000 });
    await PhieuXuatKho.create({ hoaDon: hd5._id, lyDoXuat: `Xuat ban hang theo hoa don ${hd5.soHD}`, ngayXuat: hd5.ngayLap });

    // HD6: Khách Đức mua Apple Watch Ultra 2 (Chuyển khoản: 20.990.000 đ)
    const hd6 = await HoaDon.create({
      soHD: 'HD20260806',
      khachHang: khDuc._id,
      nhanVien: nvBanHang._id,
      ngayLap: new Date(Date.now() - 12 * 60 * 60 * 1000),
      tongTien: 20990000,
      trangThai: 'Da thanh toan',
      ghiChu: 'Khách mua Apple Watch Ultra 2 Titan thanh toán qua Pos quẹt thẻ',
      status: true
    });
    await CT_HoaDon_May.create({ hoaDon: hd6._id, imei: '356789012345612', donGiaBan: 20990000 });
    await PhieuXuatKho.create({ hoaDon: hd6._id, lyDoXuat: `Xuat ban hang theo hoa don ${hd6.soHD}`, ngayXuat: hd6.ngayLap });

    // -------------------------------------------------------------
    // 11. ĐƠN ĐẶT HÀNG TRƯỚC (PRE-ORDER) (Việt)
    // -------------------------------------------------------------
    console.log('[Seed] 11. Khởi tạo Đơn đặt trước (Pre-order) 4 trạng thái...');
    // Đơn 1: Đã đặt cọc (chờ hàng về)
    const ddh1 = await DonDatHangTruoc.create({
      maDonDat: 'DAT20260801',
      khachHang: khAn._id,
      sanPham: spIphone15PM._id,
      soTienCoc: 2000000,
      ngayDat: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      trangThai: 'Da dat coc',
      ghiChu: 'Khách đặt màu Titan Tự Nhiên 256GB'
    });

    // Đơn 2: Đã có hàng & đã gán IMEI sẵn sàng
    const ddh2 = await DonDatHangTruoc.create({
      maDonDat: 'DAT20260802',
      khachHang: khMai._id,
      sanPham: spS24Ultra._id,
      imei: '356789012345201',
      soTienCoc: 1500000,
      ngayDat: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      trangThai: 'Da co hang',
      ghiChu: 'Hàng đã về kho Cầu Giấy, đã gán IMEI, gọi khách qua nhận'
    });

    // Đơn 3: Đã nhận máy (cấn trừ vào HD4)
    const ddh3 = await DonDatHangTruoc.create({
      maDonDat: 'DAT20260803',
      khachHang: khTrang._id,
      sanPham: spMacBookAir._id,
      imei: '356789012345502',
      soTienCoc: 3000000,
      ngayDat: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      trangThai: 'Da nhan may',
      ghiChu: 'Đã hoàn tất giao máy theo Hóa đơn HD20260804'
    });

    // Đơn 4: Đã hủy (hoàn cọc cho khách)
    const ddh4 = await DonDatHangTruoc.create({
      maDonDat: 'DAT20260804',
      khachHang: khYen._id,
      sanPham: spZFold5._id,
      soTienCoc: 1000000,
      ngayDat: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      trangThai: 'Da huy',
      ghiChu: 'Khách đổi ý muốn lấy iPhone nên yêu cầu hủy'
    });

    // -------------------------------------------------------------
    // 12. PHIẾU BẢO HÀNH & SỬA CHỮA (Tuấn & Kỹ thuật)
    // -------------------------------------------------------------
    console.log('[Seed] 12. Khởi tạo Phiếu Bảo Hành & Sửa chữa...');
    // PBH1: Tiếp nhận máy iPhone 15 Pro Max (Đang xử lý)
    const pbh1 = await PhieuBaoHanh.create({
      maPBH: 'PBH20260801',
      imei: '356789012345005',
      khachHang: khMai._id,
      nhanVien: nvKyThuat._id,
      moTaLoi: 'Màn hình bị sọc xanh dọc, cảm ứng chập chờn góc trên bên phải',
      ngayTiepNhan: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      trangThai: 'Dang xu ly',
      ghiChu: 'Bảo hành thay thế màn hình chính hãng'
    });
    await CT_PBH_LinhKien.create({
      phieuBaoHanh: pbh1._id,
      linhKien: lkManHinh15._id,
      soLuong: 1,
      donGia: 0
    });

    // PBH2: Đã sửa xong & trả khách
    const pbh2 = await PhieuBaoHanh.create({
      maPBH: 'PBH20260802',
      imei: '356789012345103',
      khachHang: khTung._id,
      nhanVien: nvKyThuat._id,
      moTaLoi: 'Pin chai nhanh sập nguồn',
      ngayTiepNhan: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      trangThai: 'Tra khach',
      ghiChu: 'Đã thay pin Pisen dung lượng cao, khách đã nhận lại máy'
    });
    await CT_PBH_LinhKien.create({
      phieuBaoHanh: pbh2._id,
      linhKien: lkPin14._id,
      soLuong: 1,
      donGia: 0
    });

    // -------------------------------------------------------------
    // 13. PHIẾU ĐỔI TRẢ MÁY (Việt)
    // -------------------------------------------------------------
    console.log('[Seed] 13. Khởi tạo Phiếu Đổi trả mẫu...');
    await PhieuDoiTra.create({
      maDT: 'DT20260801',
      hoaDon: hd1._id,
      khachHang: khAn._id,
      nhanVien: nvBanHang._id,
      imeiCu: '356789012345004',
      imeiMoi: '356789012345006',
      loaiDoiTra: 'Doi may',
      giaMayCu: 29990000,
      giaMayMoi: 29990000,
      tienChenhLech: 0,
      hinhThuc: 'Tien mat',
      lyDo: 'Khách muốn đổi sang máy nguyên seal khác cùng model',
      ngayDoiTra: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      trangThai: 'Hoan tat',
      ghiChu: 'Đổi máy ngang giá theo chính sách 30 ngày'
    });

    // -------------------------------------------------------------
    // 14. HỒ SƠ CÔNG NỢ ĐA HÌNH (An)
    // -------------------------------------------------------------
    console.log('[Seed] 14. Khởi tạo Hồ sơ Công nợ Khách Hàng & NCC...');
    // Nợ Khách Hàng (Anh Long nợ HD3: Tổng 31.99tr, đã trả 10tr, còn nợ 21.99tr)
    const cnKH = await CongNo.create({
      loaiDoiTuong: 'KhachHang',
      khachHang: khLong._id,
      hoaDon: hd3._id,
      soTienNo: 31990000,
      soTienDaTra: 10000000,
      trangThai: 'Con no',
      hanThanhToan: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      ghiChu: 'Nợ mua máy Galaxy S24 Ultra theo Hóa đơn HD20260803'
    });

    // Nợ NCC Samsung (Phiếu PN2: Tổng 83.4tr, đã trả 40tr, còn nợ 43.4tr)
    const cnNCC = await CongNo.create({
      loaiDoiTuong: 'NhaCungCap',
      nhaCungCap: nccSamsung._id,
      phieuNhap: pn2._id,
      soTienNo: 83400000,
      soTienDaTra: 40000000,
      trangThai: 'Con no',
      hanThanhToan: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      ghiChu: 'Nợ tiền hàng lô Samsung PN20260802 gối đầu'
    });

    // Nợ NCC Apple (Phiếu PN1: Đã thanh toán hết)
    await CongNo.create({
      loaiDoiTuong: 'NhaCungCap',
      nhaCungCap: nccApple._id,
      phieuNhap: pn1._id,
      soTienNo: 185000000,
      soTienDaTra: 185000000,
      trangThai: 'Da tra het',
      hanThanhToan: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      ghiChu: 'Đã tất toán toàn bộ tiền nhập lô Apple PN20260801'
    });

    // -------------------------------------------------------------
    // 15. HỢP ĐỒNG TRẢ GÓP & LỊCH THU KỲ (An)
    // -------------------------------------------------------------
    console.log('[Seed] 15. Khởi tạo Hợp đồng Trả góp...');
    await HopDongTraGop.create({
      hoaDon: hd2._id,
      soTienTraTruoc: 10000000,
      soTienTraGop: 15490000,
      soKy: 6,
      soTienMoiKy: 2581666,
      soKyDaThu: 1,
      trangThaiDuyet: 'Da duyet',
      ghiChu: 'Hợp đồng trả góp 6 tháng lãi suất 0% cho khách Trần Thị Mai'
    });

    // -------------------------------------------------------------
    // 16. CHỨNG TỪ THU - CHI SỔ QUỸ (Vượng)
    // -------------------------------------------------------------
    console.log('[Seed] 16. Khởi tạo Chứng từ Thu - Chi & Sổ quỹ...');
    // Thu bán hàng HD1 (30.510.000 đ Tiền mặt)
    await PhieuThu.create({
      hoaDon: hd1._id,
      soTien: hd1.tongTien,
      hinhThuc: 'Tien mat',
      ngayThu: hd1.ngayLap,
      ghiChu: `Thu tiền mặt bán lẻ theo hóa đơn ${hd1.soHD}`,
      status: true
    });

    // Thu tiền trả trước HD2 (10.000.000 đ Chuyển khoản)
    await PhieuThu.create({
      hoaDon: hd2._id,
      soTien: 10000000,
      hinhThuc: 'Chuyen khoan',
      ngayThu: hd2.ngayLap,
      ghiChu: `Thu tiền trả trước hợp đồng trả góp hóa đơn ${hd2.soHD}`,
      status: true
    });

    // Thu trả góp kỳ 1 HD2 (2.581.666 đ Chuyển khoản)
    await PhieuThu.create({
      hoaDon: hd2._id,
      soTien: 2581666,
      hinhThuc: 'Chuyen khoan',
      ngayThu: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      ghiChu: `Thu trả góp kỳ 1/6 hóa đơn ${hd2.soHD}`,
      status: true
    });

    // Thu cọc Đơn đặt trước 1 (2.000.000 đ Chuyển khoản)
    await PhieuThu.create({
      donDatHang: ddh1._id,
      soTien: ddh1.soTienCoc,
      hinhThuc: 'Chuyen khoan',
      ngayThu: ddh1.ngayDat,
      ghiChu: `Thu tiền cọc đơn đặt hàng ${ddh1.maDonDat} (iPhone 15 Pro Max)`,
      status: true
    });

    // Thu cọc Đơn đặt trước 2 (1.500.000 đ Quẹt thẻ)
    await PhieuThu.create({
      donDatHang: ddh2._id,
      soTien: ddh2.soTienCoc,
      hinhThuc: 'Quet the',
      ngayThu: ddh2.ngayDat,
      ghiChu: `Thu cọc quẹt thẻ POS đơn ${ddh2.maDonDat} (Galaxy S24 Ultra)`,
      status: true
    });

    // Thu cọc Đơn đặt trước 3 (3.000.000 đ Chuyển khoản)
    await PhieuThu.create({
      donDatHang: ddh3._id,
      soTien: ddh3.soTienCoc,
      hinhThuc: 'Chuyen khoan',
      ngayThu: ddh3.ngayDat,
      ghiChu: `Thu tiền cọc đơn ${ddh3.maDonDat} (MacBook Air)`,
      status: true
    });

    // Thu tiền bán hàng HD4 sau khi cấn trừ cọc (21.890.000 đ Chuyển khoản)
    await PhieuThu.create({
      hoaDon: hd4._id,
      soTien: 21890000,
      hinhThuc: 'Chuyen khoan',
      ngayThu: hd4.ngayLap,
      ghiChu: `Thu phần còn lại của hóa đơn ${hd4.soHD} sau cấn trừ cọc 3tr`,
      status: true
    });

    // Thu bán hàng HD5 (15.170.000 đ Chuyển khoản)
    await PhieuThu.create({
      hoaDon: hd5._id,
      soTien: hd5.tongTien,
      hinhThuc: 'Chuyen khoan',
      ngayThu: hd5.ngayLap,
      ghiChu: `Thu chuyển khoản VietQR bán hàng theo hóa đơn ${hd5.soHD}`,
      status: true
    });

    // Thu bán hàng HD6 (20.990.000 đ Quẹt thẻ)
    await PhieuThu.create({
      hoaDon: hd6._id,
      soTien: hd6.tongTien,
      hinhThuc: 'Quet the',
      ngayThu: hd6.ngayLap,
      ghiChu: `Thu tiền quẹt thẻ bán Apple Watch Ultra 2 theo hóa đơn ${hd6.soHD}`,
      status: true
    });

    // Thu nợ khách hàng đợt 1 từ anh Long (10.000.000 đ Chuyển khoản)
    await PhieuThu.create({
      congNo: cnKH._id,
      soTien: 10000000,
      hinhThuc: 'Chuyen khoan',
      ngayThu: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      ghiChu: `Thu nợ trả chậm đợt 1 từ khách hàng ${khLong.hoTen}`,
      status: true
    });

    // Chi trả tiền nhập lô hàng Apple PN1 (185.000.000 đ Chuyển khoản)
    await PhieuChi.create({
      phieuNhap: pn1._id,
      maDT: nccApple._id.toString(),
      soTien: 185000000,
      hinhThuc: 'Chuyen khoan',
      ngayChi: pn1.ngayNhap,
      lyDo: `Thanh toán 100% tiền nhập hàng lô phiếu ${pn1.maPN} từ Apple VN`,
      status: true
    });

    // Chi trả nợ đợt 1 cho Samsung Vina (40.000.000 đ Chuyển khoản)
    await PhieuChi.create({
      phieuNhap: pn2._id,
      maDT: nccSamsung._id.toString(),
      soTien: 40000000,
      hinhThuc: 'Chuyen khoan',
      ngayChi: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      lyDo: `Thanh toán trả nợ đợt 1 lô hàng phiếu ${pn2.maPN} cho Samsung Vina`,
      status: true
    });

    // Chi trả tiền nhập phụ kiện FPT PN3 (45.000.000 đ Chuyển khoản)
    await PhieuChi.create({
      phieuNhap: pn3._id,
      maDT: nccFPT._id.toString(),
      soTien: 45000000,
      hinhThuc: 'Chuyen khoan',
      ngayChi: pn3.ngayNhap,
      lyDo: `Thanh toán tiền nhập phụ kiện & linh kiện theo phiếu ${pn3.maPN}`,
      status: true
    });

    // Chi trả tiền nhập Apple Watch Digiworld PN4 (41.780.000 đ Chuyển khoản)
    await PhieuChi.create({
      phieuNhap: pn4._id,
      maDT: nccDigiworld._id.toString(),
      soTien: 41780000,
      hinhThuc: 'Chuyen khoan',
      ngayChi: pn4.ngayNhap,
      lyDo: `Thanh toán tiền nhập Apple Watch Ultra theo phiếu ${pn4.maPN}`,
      status: true
    });

    // Chi hoàn tiền cọc cho khách Đỗ Hoàng Yến đơn DAT20260804 (1.000.000 đ Tiền mặt)
    await PhieuChi.create({
      donDatHang: ddh4._id,
      maDT: khYen._id.toString(),
      soTien: 1000000,
      hinhThuc: 'Tien mat',
      ngayChi: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      lyDo: `Hoàn tiền cọc đơn đặt trước ${ddh4.maDonDat} cho khách ${khYen.hoTen}`,
      status: true
    });

    // Chi phí vận hành showroom (6.500.000 đ Chuyển khoản)
    await PhieuChi.create({
      maDT: 'CHI-PHI-VAN-HANH',
      soTien: 6500000,
      hinhThuc: 'Chuyen khoan',
      ngayChi: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      lyDo: 'Chi tiền điện, nước, internet showroom Thái Hà tháng này',
      status: true
    });

    console.log('====================================================');
    console.log('🎉 RESET VÀ SEED CSDL MỚI ĐA DẠNG 100% THÀNH CÔNG!');
    console.log('====================================================');
    console.log('📊 Thống kê các thực thể dữ liệu sạch & liên kết chặt chẽ:');
    console.log(' - 6 Tài khoản nhân viên (6 vai trò RBAC: admin, banhang, thukho, thungan, ketoan, kythuat)');
    console.log(' - 9 Danh mục sản phẩm (có danh mục có máy, danh mục chỉ có phụ kiện, và danh mục trống để đối chiếu)');
    console.log(' - 5 Nhà cung cấp đối tác uy tín');
    console.log(' - 8 Khách hàng với đầy đủ thông tin liên hệ');
    console.log(' - 3 Kho hàng (Cầu Giấy, Thái Hà, Quận 1)');
    console.log(' - 16 Model máy & thiết bị (iPhone, Galaxy, Xiaomi, iPad, Mac, Apple Watch, Máy cũ)');
    console.log(' - 10 Phụ kiện & 6 Linh kiện sửa chữa chính hãng');
    console.log(' - 48 Máy IMEI (15 số vật lý sạch, liên kết đầy đủ trạng thái)');
    console.log(' - 19 Bản ghi Tồn kho (TonKho) khớp 100% số máy Còn hàng');
    console.log(' - 4 Phiếu nhập kho (Apple, Samsung, FPT, Digiworld)');
    console.log(' - 6 Hóa đơn bán hàng POS kèm Chi tiết máy, Phụ kiện & Phiếu xuất kho');
    console.log(' - 4 Đơn đặt trước Pre-order (Đã cọc, Đã có hàng, Đã nhận máy, Đã hủy)');
    console.log(' - 2 Phiếu bảo hành (Đang xử lý & Đã sửa xong)');
    console.log(' - 1 Phiếu đổi trả máy trong 30 ngày');
    console.log(' - 3 Hồ sơ công nợ đa hình (Khách hàng & Nhà cung cấp)');
    console.log(' - 1 Hợp đồng trả góp 6 tháng lãi suất 0%');
    console.log(' - 10 Phiếu thu & 6 Phiếu chi đồng bộ Sổ quỹ');
    console.log('====================================================');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error);
    process.exit(1);
  }
};

seedData();
