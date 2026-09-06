const mongoose = require('mongoose');

const ctDonDatHangNCCSchema = new mongoose.Schema({
  donDatHangNCC: { type: mongoose.Schema.Types.ObjectId, ref: 'DonDatHangNCC', required: true, index: true },
  sanPham: { type: mongoose.Schema.Types.ObjectId, ref: 'SanPham', required: true },
  soLuong: { type: Number, required: true, min: 1 },
  donGiaDuKien: { type: Number, required: true, min: 0 },
  mauSac: { type: String, default: '' },
  soLuongDaNhan: { type: Number, default: 0, min: 0 },
  ghiChu: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('CT_DonDatHangNCC', ctDonDatHangNCCSchema, 'CT_DONDATHANGNCC');
