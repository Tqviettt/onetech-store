const BaseController = require('./BaseController');
const DonDatHangNCCService = require('../services/DonDatHangNCCService');

/**
 * DonDatHangNCCController - Quản lý Đơn đặt hàng Nhà Cung Cấp
 */
class DonDatHangNCCController extends BaseController {
  constructor() {
    super();
    this.index = this.index.bind(this);
    this.getDetail = this.getDetail.bind(this);
    this.create = this.create.bind(this);
    this.approve = this.approve.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
  }

  // GET /api/don-dat-hang-ncc
  async index(req, res) {
    try {
      const result = await DonDatHangNCCService.getDanhSach(req.query);
      return this.sendSuccess(res, result, 'Lấy danh sách đơn đặt hàng NCC thành công');
    } catch (error) {
      return this.handleError(res, error, 'Lỗi khi lấy danh sách đơn đặt hàng NCC');
    }
  }

  // GET /api/don-dat-hang-ncc/:id
  async getDetail(req, res) {
    try {
      const result = await DonDatHangNCCService.getChiTiet(req.params.id);
      return this.sendSuccess(res, result, 'Lấy chi tiết đơn đặt hàng NCC thành công');
    } catch (error) {
      return this.handleError(res, error, 'Lỗi khi lấy chi tiết đơn đặt hàng NCC');
    }
  }

  // POST /api/don-dat-hang-ncc
  async create(req, res) {
    try {
      const sessionUser = (req.session && req.session.user) ? req.session.user : (req.user ? req.user : null);
      const result = await DonDatHangNCCService.taoDonDatHang(req.body, sessionUser);
      return this.sendSuccess(res, result, `Tạo đơn đặt hàng NCC ${result.donDatHangNCC.maDDH || ''} thành công`, 201);
    } catch (error) {
      return this.handleError(res, error, 'Lỗi khi tạo đơn đặt hàng NCC');
    }
  }

  // PUT /api/don-dat-hang-ncc/:id/duyet
  async approve(req, res) {
    try {
      const result = await DonDatHangNCCService.duyetDonDatHang(req.params.id, req.body);
      return this.sendSuccess(res, result, 'Duyệt đơn đặt hàng NCC thành công');
    } catch (error) {
      return this.handleError(res, error, 'Lỗi khi duyệt đơn đặt hàng NCC');
    }
  }

  // PUT /api/don-dat-hang-ncc/:id/trang-thai
  async updateStatus(req, res) {
    try {
      const result = await DonDatHangNCCService.capNhatTrangThai(req.params.id, req.body);
      return this.sendSuccess(res, result, 'Cập nhật trạng thái đơn đặt hàng NCC thành công');
    } catch (error) {
      return this.handleError(res, error, 'Lỗi khi cập nhật trạng thái');
    }
  }
}

module.exports = new DonDatHangNCCController();
