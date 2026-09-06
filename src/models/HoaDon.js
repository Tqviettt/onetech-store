const mongoose = require('mongoose');

const hoaDonSchema = new mongoose.Schema({
  soHD: { type: String, unique: true, index: true },
  khachHang: { type: mongoose.Schema.Types.ObjectId, ref: 'KhachHang', required: true },
  nhanVien: { type: mongoose.Schema.Types.ObjectId, ref: 'NhanVien', required: true },
  donDatHang: { type: mongoose.Schema.Types.ObjectId, ref: 'DonDatHangTruoc' },
  khuyenMai: { type: mongoose.Schema.Types.ObjectId, ref: 'KhuyenMai' }, // Khóa ngoại tới KhuyenMai
  khuyenMaiGiam: { type: Number, default: 0, min: 0 }, // Số tiền giảm từ KhuyenMai
  tienCocDaTru: { type: Number, default: 0, min: 0 },
  soTienGiam: { type: Number, default: 0, min: 0 },
  soTienThanhToan: { type: Number, default: 0, min: 0 },
  ngayLap: { type: Date, default: Date.now },
  tongTien: { type: Number, required: true, default: 0, min: 0 },
  trangThai: {
    type: String,
    required: true,
    enum: ['Da thanh toan', 'Cong no', 'Tra gop', 'Da huy'],
    default: 'Da thanh toan'
  },
  hanThanhToan: { type: Date },
  ghiChu: { type: String, default: '' },
  status: { type: Boolean, default: true } // Trạng thái hiệu lực hóa đơn (Bit: 1 - Hiệu lực, 0 - Đã hủy)
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Auto sinh số hóa đơn và tính số tiền thực thanh toán nếu chưa có
hoaDonSchema.pre('save', function(next) {
  if (!this.soHD) {
    this.soHD = 'HD' + Date.now().toString().slice(-8);
  }
  if (!this.soTienThanhToan || this.soTienThanhToan === 0) {
    const tongTien = this.tongTien || 0;
    const tienCoc = this.tienCocDaTru || 0;
    const tienGiam = (this.soTienGiam || 0) + (this.khuyenMaiGiam || 0);
    this.soTienThanhToan = Math.max(0, tongTien - tienCoc - tienGiam);
  }
  next();
});

hoaDonSchema.index({ ngayLap: -1, trangThai: 1 });
hoaDonSchema.index({ khachHang: 1, ngayLap: -1 });

module.exports = mongoose.model('HoaDon', hoaDonSchema, 'HOADON');
