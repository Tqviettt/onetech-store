const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const nhanVienSchema = new mongoose.Schema({
  hoTen: { type: String, required: true, trim: true },
  sdt: { type: String, required: true, trim: true },
  email: { type: String, trim: true },
  cccd: { type: String, trim: true },
  diaChi: { type: String, trim: true },
  vaiTro: {
    type: String,
    required: true,
    enum: ['Admin', 'Quản lý', 'Thủ kho', 'NV bán hàng', 'Thu ngân', 'Kế toán', 'Kỹ thuật'],
    default: 'NV bán hàng'
  },
  tenDangNhap: { type: String, required: true, unique: true, trim: true, lowercase: true },
  matKhau: { type: String, required: true },
  trangThai: { type: String, enum: ['Hoạt động', 'Khóa', 'Nghỉ việc'], default: 'Hoạt động' }
}, {
  timestamps: true
});

// Hash mật khẩu trước khi lưu
nhanVienSchema.pre('save', async function(next) {
  if (!this.isModified('matKhau')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.matKhau = await bcrypt.hash(this.matKhau, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// So sánh mật khẩu
nhanVienSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.matKhau);
};

module.exports = mongoose.model('NhanVien', nhanVienSchema, 'NHANVIEN');
