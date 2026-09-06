const mongoose = require('mongoose');
const BaseService = require('./BaseService');
const { DonDatHangNCC, CT_DonDatHangNCC, NhaCungCap, SanPham, NhanVien } = require('../models');

/**
 * DonDatHangNCCService - Quản lý Đơn đặt hàng gửi Nhà Cung Cấp
 */
class DonDatHangNCCService extends BaseService {
  constructor() {
    super(DonDatHangNCC);
  }

  /**
   * Lấy danh sách đơn đặt hàng NCC (lọc, phân trang)
   */
  async getDanhSach(query = {}) {
    const { trangThai, nhaCungCap, search } = query;
    const filter = {};

    if (trangThai) filter.trangThai = trangThai;
    if (nhaCungCap) filter.nhaCungCap = nhaCungCap;
    if (search && search.trim()) {
      filter.$or = [
        { maDDH: { $regex: search.trim(), $options: 'i' } },
        { ghiChu: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const { page, limit, skip } = this.getPaginationOptions(query);

    const [list, total, choDuyetCount, dangGiaoCount, hoanThanhCount, huyCount] = await Promise.all([
      DonDatHangNCC.find(filter)
        .populate('nhaCungCap', 'tenNCC sdt diaChi')
        .populate('nhanVien', 'hoTen vaiTro tenDangNhap')
        .sort({ createdAt: -1 })
        .skip(skip).limit(limit)
        .lean(),
      DonDatHangNCC.countDocuments(filter),
      DonDatHangNCC.countDocuments({ trangThai: 'Cho duyet' }),
      DonDatHangNCC.countDocuments({ trangThai: 'Dang giao' }),
      DonDatHangNCC.countDocuments({ trangThai: 'Da nhan hang' }),
      DonDatHangNCC.countDocuments({ trangThai: 'Da huy' })
    ]);

    return {
      donDatHangNCCs: list,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      stats: {
        choDuyet: choDuyetCount,
        dangGiao: dangGiaoCount,
        hoanThanh: hoanThanhCount,
        huy: huyCount
      }
    };
  }

  /**
   * Lấy chi tiết đơn đặt hàng NCC kèm danh sách sản phẩm
   */
  async getChiTiet(id) {
    const ddh = await DonDatHangNCC.findById(id)
      .populate('nhaCungCap', 'tenNCC sdt diaChi')
      .populate('nhanVien', 'hoTen vaiTro tenDangNhap');

    if (!ddh) {
      throw this.createError('Không tìm thấy đơn đặt hàng NCC', 404);
    }

    const chiTiet = await CT_DonDatHangNCC.find({ donDatHangNCC: ddh._id })
      .populate('sanPham', 'tenMay hang giaBan').lean();

    return { donDatHangNCC: ddh, chiTiet };
  }

  /**
   * Tạo đơn đặt hàng NCC mới
   * @param {Object} payload { maNCC, maNV, danhSachSanPham: [{ maSP, soLuong, donGiaDuKien }], ngayDuKienGiao, ghiChu }
   */
  async taoDonDatHang(payload = {}, sessionUser = null) {
    const { maNCC, nhaCungCapId, maNV, danhSachSanPham = [], chiTiet = [], ngayDuKienGiao, ngayHenGiao, ghiChu = '', diaChiGiao = '', sdtNguoiGiao = '', cccdNguoiGiao = '' } = payload;
    const finalNCC = maNCC || nhaCungCapId;
    const finalNgayHenGiao = ngayDuKienGiao || ngayHenGiao;
    const itemsList = danhSachSanPham.length > 0 ? danhSachSanPham : chiTiet;

    let nhanVienId = maNV || (sessionUser ? sessionUser._id : null);
    if (!nhanVienId) {
      const defaultNV = await NhanVien.findOne({ isActived: { $ne: false } }).sort({ createdAt: 1 });
      if (defaultNV) {
        nhanVienId = defaultNV._id;
      } else {
        throw this.createError('Vui lòng cung cấp mã nhân viên lập đơn', 400);
      }
    }
    if (!finalNCC) throw this.createError('Vui lòng chọn Nhà Cung Cấp', 400);
    if (!nhanVienId) throw this.createError('Vui lòng cung cấp mã nhân viên lập đơn', 400);
    if (!itemsList || itemsList.length === 0) {
      throw this.createError('Đơn đặt hàng phải có ít nhất 1 sản phẩm', 400);
    }

    // Kiểm tra NCC tồn tại
    const ncc = await NhaCungCap.findById(finalNCC);
    if (!ncc) throw this.createError('Nhà Cung Cấp không tồn tại', 404);

    // Validate & tính tổng tiền
    let tongTien = 0;
    const chiTietItems = [];

    for (const item of itemsList) {
      const maSP = item.maSP || item.sanPham;
      const soLuong = parseInt(item.soLuong) || 1;
      const donGiaDuKien = Number(item.donGiaDuKien !== undefined ? item.donGiaDuKien : (item.donGiaNhap || 0)) || 0;
      const mauSac = item.mauSac ? String(item.mauSac).trim() : '';

      if (!maSP) throw this.createError('Thiếu mã sản phẩm trong danh sách', 400);

      const sp = await SanPham.findById(maSP);
      if (!sp) throw this.createError(`Sản phẩm với ID ${maSP} không tồn tại`, 404);

      tongTien += donGiaDuKien * soLuong;
      chiTietItems.push({
        sanPham: sp._id,
        soLuong,
        donGiaDuKien,
        mauSac,
        soLuongDaNhan: 0
      });
    }

    // Tạo đơn đặt hàng
    const ddhArray = await DonDatHangNCC.create([{
      nhaCungCap: finalNCC,
      nhanVien: nhanVienId,
      ngayDuKienGiao: finalNgayHenGiao ? new Date(finalNgayHenGiao) : undefined,
      diaChiGiao: diaChiGiao.trim(),
      sdtNguoiGiao: sdtNguoiGiao.trim(),
      cccdNguoiGiao: cccdNguoiGiao.trim(),
      tongTien,
      trangThai: 'Cho duyet',
      ghiChu
    }]);
    const ddh = ddhArray[0];

    // Tạo chi tiết
    const ctItems = chiTietItems.map(item => ({
      ...item,
      donDatHangNCC: ddh._id
    }));
    await CT_DonDatHangNCC.insertMany(ctItems);
    
    return await this.getChiTiet(ddh._id);
  }

  /**
   * Duyệt đơn đặt hàng NCC
   */
  async duyetDonDatHang(id, payload = {}) {
    const ddh = await DonDatHangNCC.findById(id);
    if (!ddh) throw this.createError('Không tìm thấy đơn đặt hàng NCC', 404);

    if (ddh.trangThai !== 'Cho duyet') {
      throw this.createError(`Đơn đặt hàng đang ở trạng thái "${ddh.trangThai}", không thể duyệt`, 400);
    }

    ddh.trangThai = 'Da duyet';
    if (payload.ghiChu) {
      ddh.ghiChu = (ddh.ghiChu ? ddh.ghiChu + ' | ' : '') + payload.ghiChu;
    }
    if (payload.ngayDuKienGiao) {
      ddh.ngayDuKienGiao = new Date(payload.ngayDuKienGiao);
    }
    await ddh.save();

    return await this.getChiTiet(ddh._id);
  }

  /**
   * Cập nhật trạng thái đơn đặt hàng NCC
   */
  async capNhatTrangThai(id, payload = {}) {
    const ddh = await DonDatHangNCC.findById(id);
    if (!ddh) throw this.createError('Không tìm thấy đơn đặt hàng NCC', 404);

    const { trangThai, ghiChu } = payload;
    const validStatuses = ['Cho duyet', 'Da duyet', 'Dang giao', 'Da nhan hang', 'Da huy'];

    if (trangThai && !validStatuses.includes(trangThai)) {
      throw this.createError(`Trạng thái "${trangThai}" không hợp lệ`, 400);
    }

    if (ddh.trangThai === 'Da huy') {
      throw this.createError('Đơn đặt hàng đã bị hủy, không thể thay đổi trạng thái', 400);
    }

    if (ddh.trangThai === 'Da nhan hang') {
      throw this.createError('Đơn đặt hàng đã nhận hàng xong, không thể thay đổi trạng thái', 400);
    }

    if (trangThai) ddh.trangThai = trangThai;
    if (ghiChu) {
      ddh.ghiChu = (ddh.ghiChu ? ddh.ghiChu + ' | ' : '') + ghiChu;
    }
    await ddh.save();

    return await this.getChiTiet(ddh._id);
  }

  /**
   * Đối soát đơn đặt hàng NCC khi nhập kho
   * Cập nhật số lượng đã nhận của từng sản phẩm
   * @param {String} ddhId - ID đơn đặt hàng NCC
   * @param {Array} danhSachNhan - [{ sanPham, soLuongNhan }]
   */
  async doiSoatNhapKho(ddhId, danhSachNhan = []) {
    const ddh = await DonDatHangNCC.findById(ddhId);
    if (!ddh) throw this.createError('Không tìm thấy đơn đặt hàng NCC', 404);

    if (ddh.trangThai === 'Da huy') {
      throw this.createError('Đơn đặt hàng đã bị hủy', 400);
    }

    const chiTiet = await CT_DonDatHangNCC.find({ donDatHangNCC: ddhId });

    for (const item of danhSachNhan) {
      const maSP = item.sanPham || item.maSP;
      const soLuongNhan = parseInt(item.soLuongNhan) || 0;

      const ct = chiTiet.find(c => c.sanPham.toString() === maSP.toString());
      if (ct) {
        ct.soLuongDaNhan += soLuongNhan;
        await ct.save();
      }
    }

    // Kiểm tra đã nhận đủ tất cả chưa
    const updatedCT = await CT_DonDatHangNCC.find({ donDatHangNCC: ddhId });
    const allReceived = updatedCT.every(ct => ct.soLuongDaNhan >= ct.soLuong);

    if (allReceived) {
      ddh.trangThai = 'Da nhan hang';
      await ddh.save();
    } else if (ddh.trangThai === 'Da duyet' || ddh.trangThai === 'Cho duyet') {
      ddh.trangThai = 'Dang giao';
      await ddh.save();
    }

    return await this.getChiTiet(ddh._id);
  }
}

module.exports = new DonDatHangNCCService();
