const BaseService = require('./BaseService');
const { NhanVien } = require('../models');
const mongoose = require('mongoose');

function formatName(str) {
  if (!str) return '';
  return str.trim().replace(/\s+/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function validatePhone(phone) {
  return phone && /^[0-9]{10}$/.test(phone.trim());
}

class NhanVienService extends BaseService {
  constructor() {
    super(NhanVien);
  }

  async getAllNhanViens(query = {}) {
    const { search, vaiTro, trangThai } = query;
    const filter = {};

    if (search && search.trim()) {
      filter.$or = [
        { hoTen: { $regex: search.trim(), $options: 'i' } },
        { sdt: { $regex: search.trim(), $options: 'i' } },
        { tenDangNhap: { $regex: search.trim(), $options: 'i' } }
      ];
    }
    if (vaiTro) {
      filter.vaiTro = vaiTro;
    }
    if (trangThai) {
      filter.trangThai = trangThai;
    } else {
      filter.trangThai = { $ne: 'Nghỉ việc' }; // Mặc định không lấy NV đã nghỉ việc
    }

    return await NhanVien.find(filter).select('-matKhau').sort({ createdAt: -1 }).lean();
  }

  async getNhanVienDetail(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw this.createError('ID nhân viên không hợp lệ', 400);
    }
    const nhanVien = await NhanVien.findById(id).select('-matKhau').lean();
    if (!nhanVien) {
      throw this.createError('Không tìm thấy nhân viên', 404);
    }
    return nhanVien;
  }

  async createNhanVien(payload = {}) {
    const { hoTen, sdt, diaChi, email, cccd, vaiTro, tenDangNhap, matKhau } = payload;

    if (!hoTen || !vaiTro || !tenDangNhap || !matKhau) {
      throw this.createError('Vui lòng điền đầy đủ Họ tên, Vai trò, Tên đăng nhập và Mật khẩu', 400);
    }
    
    if (!validatePhone(sdt)) {
      throw this.createError('Số điện thoại không hợp lệ (yêu cầu 10 chữ số)', 400);
    }

    const existPhone = await NhanVien.findOne({ sdt: sdt.trim() });
    if (existPhone) {
      throw this.createError('Số điện thoại đã được đăng ký cho một nhân viên khác', 409);
    }

    if (email && email.trim() !== '') {
      const existEmail = await NhanVien.findOne({ email: email.trim() });
      if (existEmail) {
        throw this.createError('Email đã được đăng ký cho một nhân viên khác', 409);
      }
    }

    if (cccd && cccd.trim() !== '') {
      if (!/^[0-9]{12}$/.test(cccd.trim())) {
        throw this.createError('Căn cước công dân không hợp lệ (yêu cầu 12 chữ số)', 400);
      }
      const existCccd = await NhanVien.findOne({ cccd: cccd.trim() });
      if (existCccd) {
        throw this.createError('Căn cước công dân đã được đăng ký cho một nhân viên khác', 409);
      }
    }

    const existing = await NhanVien.findOne({ tenDangNhap: tenDangNhap.trim() });
    if (existing) {
      throw this.createError('Tên đăng nhập đã tồn tại trong hệ thống', 409);
    }

    const nv = await NhanVien.create({
      hoTen: formatName(hoTen),
      sdt: sdt.trim(),
      diaChi: formatName(diaChi),
      email: email ? email.trim() : '',
      cccd: cccd ? cccd.trim() : '',
      vaiTro,
      tenDangNhap: tenDangNhap.trim(),
      matKhau
    });

    const nvObj = nv.toObject();
    delete nvObj.matKhau;
    return nvObj;
  }

  async updateNhanVien(id, payload = {}, currentUserId = null) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw this.createError('ID nhân viên không hợp lệ', 400);
    }
    const { hoTen, sdt, diaChi, email, cccd, vaiTro, tenDangNhap, matKhau, trangThai } = payload;

    const nv = await NhanVien.findById(id);
    if (!nv) {
      throw this.createError('Không tìm thấy nhân viên để cập nhật', 404);
    }

    if (tenDangNhap && tenDangNhap.trim() !== nv.tenDangNhap) {
      const dup = await NhanVien.findOne({ tenDangNhap: tenDangNhap.trim() });
      if (dup) {
        throw this.createError('Tên đăng nhập mới đã tồn tại', 409);
      }
      nv.tenDangNhap = tenDangNhap.trim();
    }

    if (sdt && !validatePhone(sdt)) {
      throw this.createError('Số điện thoại không hợp lệ (yêu cầu 10 chữ số)', 400);
    }

    if (sdt) {
      const existPhone = await NhanVien.findOne({ sdt: sdt.trim(), _id: { $ne: id } });
      if (existPhone) {
        throw this.createError('Số điện thoại đã được đăng ký cho một nhân viên khác', 409);
      }
    }

    if (email && email.trim() !== '') {
      const existEmail = await NhanVien.findOne({ email: email.trim(), _id: { $ne: id } });
      if (existEmail) {
        throw this.createError('Email đã được đăng ký cho một nhân viên khác', 409);
      }
    }

    if (cccd && cccd.trim() !== '') {
      if (!/^[0-9]{12}$/.test(cccd.trim())) {
        throw this.createError('Căn cước công dân không hợp lệ (yêu cầu 12 chữ số)', 400);
      }
      const existCccd = await NhanVien.findOne({ cccd: cccd.trim(), _id: { $ne: id } });
      if (existCccd) {
        throw this.createError('Căn cước công dân đã được đăng ký cho một nhân viên khác', 409);
      }
    }

    if (hoTen) nv.hoTen = formatName(hoTen);
    if (sdt !== undefined) nv.sdt = sdt.trim();
    if (diaChi !== undefined) nv.diaChi = formatName(diaChi);
    if (email !== undefined) nv.email = email.trim();
    if (cccd !== undefined) nv.cccd = cccd.trim();
    if (vaiTro) nv.vaiTro = vaiTro;
    if (trangThai) nv.trangThai = trangThai;
    if (matKhau && matKhau.trim()) {
      nv.matKhau = matKhau;
    }

    await nv.save();
    const nvObj = nv.toObject();
    delete nvObj.matKhau;
    return nvObj;
  }

  async deleteNhanVien(id, currentUserId = null) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw this.createError('ID nhân viên không hợp lệ', 400);
    }
    if (currentUserId && id.toString() === currentUserId.toString()) {
      throw this.createError('Bạn không thể tự xóa tài khoản của chính mình!', 400);
    }

    // Xoá mềm (Nghỉ việc)
    const deleted = await NhanVien.findByIdAndUpdate(id, { trangThai: 'Nghỉ việc' }, { new: true });
    if (!deleted) {
      throw this.createError('Không tìm thấy nhân viên', 404);
    }

    return { success: true, id };
  }
}

module.exports = new NhanVienService();
