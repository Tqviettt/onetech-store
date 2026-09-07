const BaseService = require('./BaseService');
const { KhachHang, HoaDon } = require('../models');

function formatName(str) {
  if (!str) return '';
  return str.trim().replace(/\s+/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function validatePhone(phone) {
  return phone && /^[0-9]{10}$/.test(phone.trim());
}

class KhachHangService extends BaseService {
  constructor() {
    super(KhachHang);
  }

  async getAllKhachHangs(query = {}) {
    const { search } = query;
    const filter = {};

    if (search && search.trim()) {
      filter.$or = [
        { hoTen: { $regex: search.trim(), $options: 'i' } },
        { sdt: { $regex: search.trim(), $options: 'i' } }
      ];
    }
    if (query.hangThanhVien) {
      filter.hangThanhVien = query.hangThanhVien;
    }
    if (query.tongChiTieuMin || query.tongChiTieuMax) {
      filter.tongChiTieu = {};
      if (query.tongChiTieuMin) filter.tongChiTieu.$gte = Number(query.tongChiTieuMin);
      if (query.tongChiTieuMax) filter.tongChiTieu.$lte = Number(query.tongChiTieuMax);
    }
    if (query.status !== undefined) {
      filter.status = query.status === 'true' || query.status === true;
    } else {
      filter.status = true; // mặc định chỉ lấy khách hàng còn hoạt động
    }

    return await KhachHang.find(filter).sort({ createdAt: -1 });
  }

  async getKhachHangDetail(id) {
    const khachHang = await KhachHang.findById(id);
    if (!khachHang) {
      throw this.createError('Không tìm thấy khách hàng', 404);
    }

    // Lịch sử mua hàng
    const hoaDons = await HoaDon.find({ khachHang: id }).sort({ ngayLap: -1 });

    return { khachHang, hoaDons };
  }

  async createKhachHang(payload = {}) {
    const { hoTen, sdt, diaChi, email } = payload;
    if (!hoTen || !hoTen.trim()) {
      throw this.createError('Vui lòng nhập họ tên khách hàng', 400);
    }
    if (!validatePhone(sdt)) {
      throw this.createError('Số điện thoại không hợp lệ (yêu cầu 10 chữ số)', 400);
    }

    const existPhone = await KhachHang.findOne({ sdt: sdt.trim() });
    if (existPhone) {
      throw this.createError('Số điện thoại đã được đăng ký cho một khách hàng khác', 409);
    }

    if (email && email.trim() !== '') {
      const existEmail = await KhachHang.findOne({ email: email.trim() });
      if (existEmail) {
        throw this.createError('Email đã được đăng ký cho một khách hàng khác', 409);
      }
    }

    return await KhachHang.create({
      hoTen: formatName(hoTen),
      sdt: sdt.trim(),
      diaChi: formatName(diaChi),
      email: email ? email.trim() : '',
      status: true
    });
  }

  async updateKhachHang(id, payload = {}) {
    const { hoTen, sdt, diaChi, email, status } = payload;
    if (sdt && !validatePhone(sdt)) {
      throw this.createError('Số điện thoại không hợp lệ (yêu cầu 10 chữ số)', 400);
    }

    if (sdt) {
      const existPhone = await KhachHang.findOne({ sdt: sdt.trim(), _id: { $ne: id } });
      if (existPhone) {
        throw this.createError('Số điện thoại đã được đăng ký cho một khách hàng khác', 409);
      }
    }

    if (email && email.trim() !== '') {
      const existEmail = await KhachHang.findOne({ email: email.trim(), _id: { $ne: id } });
      if (existEmail) {
        throw this.createError('Email đã được đăng ký cho một khách hàng khác', 409);
      }
    }
    
    const updated = await KhachHang.findByIdAndUpdate(
      id,
      {
        hoTen: hoTen ? formatName(hoTen) : undefined,
        sdt: sdt !== undefined ? sdt.trim() : undefined,
        diaChi: diaChi !== undefined ? formatName(diaChi) : undefined,
        email: email !== undefined ? email.trim() : undefined,
        status: status !== undefined ? status : undefined
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw this.createError('Không tìm thấy khách hàng để cập nhật', 404);
    }

    return updated;
  }

  async deleteKhachHang(id) {
    // Soft delete instead of hard delete
    const deleted = await KhachHang.findByIdAndUpdate(id, { status: false }, { new: true });
    if (!deleted) {
      throw this.createError('Không tìm thấy khách hàng', 404);
    }

    return { success: true, id };
  }
}

module.exports = new KhachHangService();
