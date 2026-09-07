const mongoose = require('mongoose');
const BaseService = require('./BaseService');
const { SanPham, DanhMuc, MayImei } = require('../models');

class SanPhamService extends BaseService {
  constructor() {
    super(SanPham);
  }

  async getAllSanPhams(query = {}) {
    const { search, danhMucId, hang } = query;
    const filter = { status: { $ne: false } };

    if (search && search.trim()) {
      filter.tenMay = { $regex: search.trim(), $options: 'i' };
    }
    if (danhMucId) {
      filter.danhMuc = danhMucId;
    }
    if (hang && hang.trim()) {
      filter.hang = hang.trim();
    }

    const [sanPhams, danhMucs, allHangs, counts, totalCounts] = await Promise.all([
      SanPham.find(filter).populate('danhMuc').sort({ createdAt: -1 }).lean(),
      DanhMuc.find().sort({ tenDanhMuc: 1 }).lean(),
      SanPham.distinct('hang', filter),
      MayImei.aggregate([
        { $match: { trangThai: 'Con hang' } },
        { $group: { _id: '$sanPham', soLuongTon: { $sum: 1 } } }
      ]),
      MayImei.aggregate([
        { $group: { _id: '$sanPham', tongImei: { $sum: 1 } } }
      ])
    ]);

    const countMap = {};
    counts.forEach(c => {
      countMap[c._id.toString()] = c.soLuongTon;
    });

    const totalMap = {};
    totalCounts.forEach(c => {
      totalMap[c._id.toString()] = c.tongImei;
    });

    const enriched = sanPhams.map(sp => {
      const spObj = sp.toObject ? sp.toObject() : { ...sp };
      spObj.soLuongTon = countMap[sp._id.toString()] || 0;
      spObj.soLuongCon = spObj.soLuongTon;
      spObj.tongImei = totalMap[sp._id.toString()] || 0;
      return spObj;
    });

    return { sanPhams: enriched, danhMucs, allHangs };
  }

  async getSanPhamDetail(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw this.createError('ID sản phẩm không hợp lệ', 400);
    }

    const [sanPham, danhMucs, imeis] = await Promise.all([
      SanPham.findById(id).populate('danhMuc').lean(),
      DanhMuc.find().sort({ tenDanhMuc: 1 }).lean(),
      MayImei.find({ sanPham: id }).sort({ createdAt: -1 }).lean()
    ]);

    if (!sanPham) {
      throw this.createError('Không tìm thấy sản phẩm', 404);
    }

    return { sanPham, danhMucs, imeis };
  }

  async createSanPham(payload = {}) {
    const { tenMay, danhMuc, hang, giaBan, giaGoc, dungLuong, soThangBH, hinhAnh, moTa } = payload;
    if (!tenMay || !danhMuc || giaBan === undefined) {
      throw this.createError('Vui lòng điền đầy đủ Tên máy, Danh mục và Giá bán', 400);
    }
    const giaB = Number(giaBan);
    const giaG = giaGoc !== undefined ? Number(giaGoc) : 0;
    if (giaB <= giaG) {
      throw this.createError('Giá bán niêm yết phải lớn hơn Giá gốc', 400);
    }

    return await SanPham.create({
      tenMay: tenMay.trim(),
      danhMuc,
      hang: hang ? hang.trim() : '',
      giaBan: giaB,
      giaGoc: giaG,
      dungLuong: dungLuong ? dungLuong.trim() : '',
      soThangBH: soThangBH !== undefined ? Number(soThangBH) : 12,
      hinhAnh: hinhAnh ? hinhAnh.trim() : '',
      moTa: moTa ? moTa.trim() : ''
    });
  }

  async updateSanPham(id, payload = {}) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw this.createError('ID sản phẩm không hợp lệ', 400);
    }

    const { tenMay, danhMuc, hang, giaBan, giaGoc, dungLuong, soThangBH, hinhAnh, moTa } = payload;

    // Nếu có thay đổi giá, kiểm tra ràng buộc giá
    if (giaBan !== undefined || giaGoc !== undefined) {
      const sp = await SanPham.findById(id).lean();
      if (!sp) throw this.createError('Sản phẩm không tồn tại', 404);
      const newGiaBan = giaBan !== undefined ? Number(giaBan) : sp.giaBan;
      const newGiaGoc = giaGoc !== undefined ? Number(giaGoc) : (sp.giaGoc || 0);
      if (newGiaBan <= newGiaGoc) {
        throw this.createError('Giá bán niêm yết phải lớn hơn Giá gốc', 400);
      }
    }

    const updated = await SanPham.findByIdAndUpdate(
      id,
      {
        tenMay: tenMay ? tenMay.trim() : undefined,
        danhMuc,
        hang: hang !== undefined ? hang.trim() : undefined,
        giaBan: giaBan !== undefined ? Number(giaBan) : undefined,
        giaGoc: giaGoc !== undefined ? Number(giaGoc) : undefined,
        dungLuong: dungLuong !== undefined ? dungLuong.trim() : undefined,
        soThangBH: soThangBH !== undefined ? Number(soThangBH) : undefined,
        hinhAnh: hinhAnh !== undefined ? hinhAnh.trim() : undefined,
        moTa: moTa !== undefined ? moTa.trim() : undefined
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw this.createError('Không tìm thấy sản phẩm để cập nhật', 404);
    }

    return updated;
  }

  async deleteSanPham(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw this.createError('ID sản phẩm không hợp lệ', 400);
    }

    const updated = await SanPham.findByIdAndUpdate(
      id,
      { status: false },
      { new: true }
    );
    if (!updated) {
      throw this.createError('Không tìm thấy sản phẩm', 404);
    }
    return { success: true, id };
  }
}

module.exports = new SanPhamService();
