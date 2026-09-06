const BaseService = require('./BaseService');
const { DanhMuc, SanPham, PhuKien } = require('../models');

class DanhMucService extends BaseService {
  constructor() {
    super(DanhMuc);
  }

  async getAllDanhMucs() {
    let danhMucs = await DanhMuc.find().sort({ tenDanhMuc: 1 });

    // Tự động khởi tạo 8 danh mục chuẩn nếu CSDL trống
    if (danhMucs.length === 0) {
      const standardCategories = [
        { tenDanhMuc: 'Điện thoại thông minh (Smartphones)', moTa: 'Điện thoại iPhone, Samsung, Xiaomi quản lý theo từng IMEI vật lý' },
        { tenDanhMuc: 'Máy tính bảng (iPad & Tablets)', moTa: 'iPad Pro, iPad Air, Galaxy Tab cao cấp quản lý theo số IMEI' },
        { tenDanhMuc: 'Laptop & MacBook', moTa: 'MacBook M2, M3 và Laptop Ultrabook mỏng nhẹ' },
        { tenDanhMuc: 'Đồng hồ thông minh (Smartwatches)', moTa: 'Apple Watch Series 9, Ultra 2, Galaxy Watch 6' },
        { tenDanhMuc: 'Thiết bị Âm thanh & Tai nghe', moTa: 'AirPods Pro, Galaxy Buds, Loa di động' },
        { tenDanhMuc: 'Phụ kiện Cáp, Sạc & Ốp lưng', moTa: 'Củ sạc 20W/45W, Cáp Type-C, Ốp lưng MagSafe, Kính cường lực' },
        { tenDanhMuc: 'Linh kiện sửa chữa & Thay thế', moTa: 'Màn hình OLED, Pin dung lượng cao, Camera bóc máy' },
        { tenDanhMuc: 'Máy cũ - Thu cũ đổi mới (Trade-in)', moTa: 'Điện thoại qua sử dụng, máy Likenew 99% tuyển chọn' }
      ];
      await DanhMuc.insertMany(standardCategories);
      danhMucs = await DanhMuc.find().sort({ tenDanhMuc: 1 });
    }

    const [spCounts, pkCounts] = await Promise.all([
      SanPham.aggregate([{ $group: { _id: '$danhMuc', count: { $sum: 1 } } }]),
      PhuKien.aggregate([{ $group: { _id: '$danhMuc', count: { $sum: 1 } } }])
    ]);

    const spMap = {};
    spCounts.forEach(c => {
      if (c._id) spMap[c._id.toString()] = c.count;
    });

    const pkMap = {};
    pkCounts.forEach(c => {
      if (c._id) pkMap[c._id.toString()] = c.count;
    });

    return danhMucs.map(dm => {
      const dmObj = dm.toObject ? dm.toObject() : { ...dm };
      dmObj.countSP = spMap[dm._id.toString()] || 0;
      dmObj.countPK = pkMap[dm._id.toString()] || 0;
      dmObj.totalProducts = dmObj.countSP + dmObj.countPK;
      return dmObj;
    });
  }

  async getDanhMucDetail(id) {
    const danhMuc = await DanhMuc.findById(id);
    if (!danhMuc) {
      throw this.createError('Không tìm thấy danh mục', 404);
    }
    return danhMuc;
  }

  async createDanhMuc(payload = {}) {
    const { tenDanhMuc, moTa } = payload;
    if (!tenDanhMuc || !tenDanhMuc.trim()) {
      throw this.createError('Vui lòng nhập tên danh mục', 400);
    }

    const existing = await DanhMuc.findOne({ tenDanhMuc: tenDanhMuc.trim() });
    if (existing) {
      throw this.createError('Tên danh mục này đã tồn tại', 409);
    }

    return await DanhMuc.create({
      tenDanhMuc: tenDanhMuc.trim(),
      moTa: moTa ? moTa.trim() : ''
    });
  }

  async updateDanhMuc(id, payload = {}) {
    const { tenDanhMuc, moTa } = payload;

    if (tenDanhMuc && tenDanhMuc.trim()) {
      const dup = await DanhMuc.findOne({ tenDanhMuc: tenDanhMuc.trim(), _id: { $ne: id } });
      if (dup) {
        throw this.createError('Tên danh mục mới đã tồn tại', 409);
      }
    }

    const updated = await DanhMuc.findByIdAndUpdate(
      id,
      {
        tenDanhMuc: tenDanhMuc ? tenDanhMuc.trim() : undefined,
        moTa: moTa !== undefined ? moTa.trim() : undefined
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw this.createError('Không tìm thấy danh mục để cập nhật', 404);
    }

    return updated;
  }

  async deleteDanhMuc(id) {
    const [spCount, pkCount] = await Promise.all([
      SanPham.countDocuments({ danhMuc: id }),
      PhuKien.countDocuments({ danhMuc: id })
    ]);

    if (spCount > 0 || pkCount > 0) {
      throw this.createError(`Không thể xóa danh mục vì vẫn còn ${spCount} sản phẩm máy và ${pkCount} phụ kiện liên kết!`, 400);
    }

    const deleted = await DanhMuc.findByIdAndDelete(id);
    if (!deleted) {
      throw this.createError('Không tìm thấy danh mục', 404);
    }

    return { success: true, id };
  }
}

module.exports = new DanhMucService();
