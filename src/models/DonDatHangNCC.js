const mongoose = require('mongoose');

const donDatHangNCCSchema = new mongoose.Schema({
  maDDH: { type: String, unique: true, index: true },
  nhaCungCap: { type: mongoose.Schema.Types.ObjectId, ref: 'NhaCungCap', required: true },
  nhanVien: { type: mongoose.Schema.Types.ObjectId, ref: 'NhanVien', required: true },
  ngayDat: { type: Date, default: Date.now },
  ngayDuKienGiao: { type: Date },
  diaChiGiao: { type: String, default: '' },
  sdtNguoiGiao: { type: String, default: '' },
  cccdNguoiGiao: { type: String, default: '' },
  tongTien: { type: Number, default: 0, min: 0 },
  trangThai: {
    type: String,
    required: true,
    enum: ['Cho duyet', 'Da duyet', 'Dang giao', 'Da nhan hang', 'Da huy'],
    default: 'Cho duyet'
  },
  ghiChu: { type: String, default: '' }
}, {
  timestamps: true
});

// Auto sinh mã đơn đặt hàng NCC
donDatHangNCCSchema.pre('save', function(next) {
  if (!this.maDDH) {
    this.maDDH = 'DDH' + Date.now().toString().slice(-8);
  }
  next();
});

module.exports = mongoose.model('DonDatHangNCC', donDatHangNCCSchema, 'DONDATHANGNCC');
