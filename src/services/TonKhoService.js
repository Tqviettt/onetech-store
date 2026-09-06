const BaseService = require('./BaseService');
const { TonKho, SanPham, Kho, PhieuXuatKho } = require('../models');

/**
 * TonKhoService
 * Phụ trách: Trương Thế An & Phạm Đăng Tuân
 *
 * Cung cấp hàm dùng chung capNhatTonKho() để Tuấn (bán hàng), Tuân (nhập kho),
 * Việt (đặt trước / đổi trả) cùng gọi khi cần tăng/giảm tồn kho.
 */
class TonKhoService extends BaseService {
  constructor() {
    super(TonKho);
  }

  /**
   * Cập nhật tồn kho dùng chung cho toàn hệ thống.
   * @param {String|ObjectId} sanPhamId
   * @param {String|ObjectId} [khoId] - Nếu null/undefined, tự động lấy kho mặc định đầu tiên
   * @param {Number} delta - Dương = nhập vào, Âm = xuất ra.
   * @param {Object} [options]
   * @param {mongoose.ClientSession} [options.session]
   * @param {Boolean} [options.choPhepAm=false]
   * @returns {Promise<Object>} bản ghi TonKho sau khi cập nhật
   */
  async capNhatTonKho(sanPhamId, khoId, delta, options = {}) {
    const { session = null, choPhepAm = false } = options;

    if (!sanPhamId) {
      throw this.createError('Thiếu sanPhamId khi cập nhật tồn kho', 400);
    }
    const soDelta = Number(delta);
    if (Number.isNaN(soDelta) || soDelta === 0) {
      throw this.createError('Giá trị delta không hợp lệ', 400);
    }

    let targetKhoId = khoId;
    if (!targetKhoId) {
      let defaultKho = await Kho.findOne().session(session);
      if (!defaultKho) {
        // Tự động tạo kho mặc định nếu chưa có kho nào trong hệ thống
        const created = await Kho.create([{ tenKho: 'Kho Chính', diaChi: 'Kho mặc định' }], session ? { session } : {});
        defaultKho = created[0];
      }
      targetKhoId = defaultKho._id;
    }

    const [sanPham, kho] = await Promise.all([
      SanPham.findById(sanPhamId).session(session),
      Kho.findById(targetKhoId).session(session)
    ]);
    if (!sanPham) throw this.createError(`Không tìm thấy sản phẩm ${sanPhamId}`, 404);
    if (!kho) throw this.createError(`Không tìm thấy kho ${targetKhoId}`, 404);

    let tonKho;
    if (soDelta < 0 && !choPhepAm) {
      tonKho = await TonKho.findOneAndUpdate(
        { sanPham: sanPhamId, kho: targetKhoId, soLuong: { $gte: Math.abs(soDelta) } },
        { $inc: { soLuong: soDelta } },
        { new: true, session }
      );
      if (!tonKho) {
        const currentTonKho = await TonKho.findOne({ sanPham: sanPhamId, kho: targetKhoId }).session(session);
        const currentQty = currentTonKho ? currentTonKho.soLuong : 0;
        throw this.createError(
          `Không đủ tồn kho: hiện có ${currentQty}, yêu cầu trừ ${Math.abs(soDelta)}`,
          409
        );
      }
    } else {
      tonKho = await TonKho.findOneAndUpdate(
        { sanPham: sanPhamId, kho: targetKhoId },
        { $inc: { soLuong: soDelta } },
        { new: true, upsert: true, session }
      );
    }
    return tonKho;
  }

  /**
   * GET /api/kho/ton-kho?maKho=
   * "maKho" ở đây nhận vào ObjectId của Kho (query string truyền _id).
   * Không truyền -> gộp tồn kho tất cả các kho theo từng sản phẩm.
   */
  async layThongKeTonKho({ maKho } = {}) {
    const filter = maKho ? { kho: maKho } : {};

    const rows = await TonKho.find(filter)
      .populate('sanPham', 'tenMay hang giaBan')
      .populate('kho', 'tenKho')
      .lean();

    if (maKho) {
      return rows.map(r => ({
        sanPham: r.sanPham,
        kho: r.kho,
        soLuong: r.soLuong
      }));
    }

    // Gộp theo sản phẩm khi không lọc theo kho cụ thể
    const gop = new Map();
    for (const r of rows) {
      const key = String(r.sanPham?._id);
      const cur = gop.get(key) || { sanPham: r.sanPham, tongSoLuong: 0, chiTietTheoKho: [] };
      cur.tongSoLuong += r.soLuong;
      cur.chiTietTheoKho.push({ kho: r.kho, soLuong: r.soLuong });
      gop.set(key, cur);
    }
    return [...gop.values()];
  }

  /**
   * GET /api/kho/phieu-xuat
   */
  async layDanhSachPhieuXuat(query = {}) {
    const { page, limit, skip } = this.getPaginationOptions(query);
    const [items, total] = await Promise.all([
      PhieuXuatKho.find()
        .populate({ path: 'hoaDon', select: 'soHD ngayLap tongTien' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PhieuXuatKho.countDocuments()
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

module.exports = new TonKhoService();
