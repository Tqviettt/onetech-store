const mongoose = require('mongoose');

const sanPhamSchema = new mongoose.Schema({
  danhMuc: { type: mongoose.Schema.Types.ObjectId, ref: 'DanhMuc', required: true },
  tenMay: { type: String, required: true, trim: true },
  hang: { type: String, trim: true },
  giaBan: { type: Number, required: true, default: 0, min: 0 },
  giaGoc: { type: Number, default: 0, min: 0 },
  dungLuong: { type: String, trim: true, default: '' },
  soThangBH: { type: Number, default: 12, min: 0 }, // Số tháng bảo hành (theo ràng buộc brief)
  hinhAnh: { type: String, default: '' },
  moTa: { type: String, default: '' },
  status: { type: Boolean, default: true } // Trạng thái hoạt động (Bit/Boolean: 1 - Hoạt động, 0 - Khóa/Xóa mềm)
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate danh sách IMEI của sản phẩm
sanPhamSchema.virtual('danhSachImei', {
  ref: 'MayImei',
  localField: '_id',
  foreignField: 'sanPham'
});

module.exports = mongoose.model('SanPham', sanPhamSchema, 'SANPHAM');
