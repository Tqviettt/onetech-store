const BaseService = require('./BaseService');
const { HopDongTraGop, HoaDon } = require('../models');
const ThanhToanService = require('./ThanhToanService');

/**
 * TraGopService
 * Thành viên 3: Trương Thế An
 * Quản lý Phân hệ Hợp đồng Trả góp & Lịch thu kỳ hạn
 */
class TraGopService extends BaseService {
  constructor() {
    super(HopDongTraGop);
  }

  /**
   * Tạo hợp đồng trả góp mới từ Hóa đơn bán hàng
   * @param {Object} payload { hoaDonId, soTienTraTruoc, soKy, ghiChu, session }
   */
  async taoHopDongTraGop({ hoaDonId, soTienTraTruoc = 0, soKy, ghiChu = '', session = null }) {
    if (!hoaDonId) {
      throw this.createError('Thiếu hoaDonId khi lập hợp đồng trả góp', 400);
    }

    const numKy = Number(soKy);
    if (!numKy || numKy < 1 || !Number.isInteger(numKy)) {
      throw this.createError('Số kỳ trả góp không hợp lệ (phải là số nguyên lớn hơn 0)', 400);
    }

    const validTerms = [3, 6, 9, 12];
    if (!validTerms.includes(numKy)) {
      throw this.createError(`Kỳ hạn trả góp phải là một trong các số tháng: ${validTerms.join(', ')}`, 400);
    }

    const hoaDon = await HoaDon.findById(hoaDonId).session(session);
    if (!hoaDon) {
      throw this.createError(`Không tìm thấy hóa đơn ${hoaDonId}`, 404);
    }

    const existing = await HopDongTraGop.findOne({ hoaDon: hoaDonId }).session(session);
    if (existing) {
      throw this.createError(`Hóa đơn ${hoaDon.soHD} đã có hợp đồng trả góp`, 409);
    }

    const traTruoc = Math.max(0, Number(soTienTraTruoc) || 0);
    if (traTruoc >= hoaDon.tongTien) {
      throw this.createError('Số tiền trả trước phải nhỏ hơn tổng tiền hóa đơn', 400);
    }

    const soTienTraGop = hoaDon.tongTien - traTruoc;
    const soTienMoiKy = Math.round(soTienTraGop / numKy);

    const hopDong = new HopDongTraGop({
      hoaDon: hoaDonId,
      soTienTraTruoc: traTruoc,
      soTienTraGop,
      soKy: numKy,
      soTienMoiKy,
      soKyDaThu: 0,
      trangThaiDuyet: 'Da duyet',
      ghiChu: ghiChu || `Hợp đồng trả góp ${numKy} tháng`
    });

    await hopDong.save({ session });
    return hopDong;
  }

  /**
   * Lấy danh sách hợp đồng trả góp
   */
  async layDanhSachHopDong(query = {}) {
    const { trangThaiDuyet, search } = query;
    const filter = {};
    if (trangThaiDuyet) filter.trangThaiDuyet = trangThaiDuyet;

    const { page, limit, skip } = this.getPaginationOptions(query);
    const [items, total, thongKeRaw] = await Promise.all([
      HopDongTraGop.find(filter)
        .populate({
          path: 'hoaDon',
          select: 'soHD ngayLap tongTien khachHang nhanVien',
          populate: { path: 'khachHang', select: 'hoTen sdt' }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      HopDongTraGop.countDocuments(filter),
      HopDongTraGop.aggregate([
        { $group: {
          _id: '$trangThaiDuyet',
          count: { $sum: 1 }
        }}
      ])
    ]);

    // Tổng hợp thống kê
    const thongKe = { tongHopDong: total, dangTraGop: 0, hoanTat: 0, huy: 0 };
    thongKeRaw.forEach(g => {
      if (g._id === 'Da duyet') thongKe.dangTraGop += g.count;
      else if (g._id === 'Hoan tat') thongKe.hoanTat += g.count;
      else if (g._id === 'Huy') thongKe.huy += g.count;
    });

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      thongKe
    };
  }

  /**
   * Sinh lịch thu định kỳ theo tháng dựa trên ngày lập hóa đơn
   */
  async layLichThuKy(id) {
    const hopDong = await HopDongTraGop.findById(id)
      .populate({
        path: 'hoaDon',
        populate: { path: 'khachHang', select: 'hoTen sdt diaChi' }
      });

    if (!hopDong) {
      throw this.createError('Không tìm thấy hợp đồng trả góp', 404);
    }

    const ngayBatDau = hopDong.hoaDon?.createdAt || hopDong.createdAt || new Date();
    const lichThu = [];

    for (let i = 1; i <= hopDong.soKy; i++) {
      const ngayDenHan = new Date(ngayBatDau);
      ngayDenHan.setMonth(ngayDenHan.getMonth() + i);

      // Xử lý làm tròn số tiền cho kỳ cuối cùng
      let soTienKy = hopDong.soTienMoiKy;
      if (i === hopDong.soKy) {
        soTienKy = hopDong.soTienTraGop - hopDong.soTienMoiKy * (hopDong.soKy - 1);
      }

      const daThu = i <= hopDong.soKyDaThu;
      let trangThai = 'Chua thu';
      let trangThaiText = 'Chưa thu';
      if (daThu) {
        trangThai = 'Da thu';
        trangThaiText = 'Đã thu';
      } else if (ngayDenHan < new Date()) {
        trangThai = 'Qua han';
        trangThaiText = 'Quá hạn';
      }

      lichThu.push({
        ky: i,
        kyThu: i,
        ngayDenHan,
        soTien: soTienKy,
        daThu,
        trangThai,
        trangThaiText
      });
    }

    return {
      hopDong,
      lichThu,
      tongDaThu: Math.min(hopDong.soKyDaThu * hopDong.soTienMoiKy, hopDong.soTienTraGop),
      tongConLai: Math.max(0, hopDong.soTienTraGop - (hopDong.soKyDaThu * hopDong.soTienMoiKy))
    };
  }

  /**
   * Chi tiết hợp đồng trả góp
   */
  async layChiTietHopDong(id) {
    return this.layLichThuKy(id);
  }

  /**
   * Thu tiền 1 kỳ trả góp (tự động gọi ThanhToanService.taoPhieuThu)
   */
  async thuTienKy(id, { hinhThuc = 'Tien mat', ghiChu = '', session = null } = {}) {
    const hopDong = await HopDongTraGop.findById(id).session(session);
    if (!hopDong) {
      throw this.createError('Không tìm thấy hợp đồng trả góp', 404);
    }

    if (hopDong.soKyDaThu >= hopDong.soKy || hopDong.trangThaiDuyet === 'Hoan tat') {
      throw this.createError('Hợp đồng trả góp này đã hoàn tất tất toán đủ số kỳ', 400);
    }

    const nextKy = hopDong.soKyDaThu + 1;

    // Tính chính xác số tiền cần thu cho kỳ này
    let soTienThu = hopDong.soTienMoiKy;
    if (nextKy === hopDong.soKy) {
      soTienThu = hopDong.soTienTraGop - hopDong.soTienMoiKy * (hopDong.soKy - 1);
    }

    // Tự động gọi ThanhToanService sinh Phiếu Thu trong Sổ quỹ
    const phieuThu = await ThanhToanService.taoPhieuThu({
      hoaDon: hopDong.hoaDon,
      soTien: soTienThu,
      hinhThuc,
      ghiChu: ghiChu || `Thu tiền trả góp kỳ ${nextKy}/${hopDong.soKy}`
    });

    hopDong.soKyDaThu += 1;
    if (hopDong.soKyDaThu >= hopDong.soKy) {
      hopDong.trangThaiDuyet = 'Hoan tat';
    }

    await hopDong.save({ session });

    return {
      hopDong,
      phieuThu,
      kyVuaThu: nextKy,
      soTienThu
    };
  }
}

module.exports = new TraGopService();
