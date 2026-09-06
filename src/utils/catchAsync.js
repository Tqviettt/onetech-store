/**
 * Wrapper catchAsync giúp loại bỏ try...catch lặp lại trong Controller
 * Hàm này bọc hàm async và tự động đẩy lỗi (nếu có) vào biến next của Express
 * (Hoặc bạn có thể gọi trực tiếp handleError từ controller nếu muốn giữ nguyên kiến trúc)
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    // Vì kiến trúc hiện tại dùng BaseController.handleError, 
    // chúng ta sẽ kiểm tra xem req.app.get('baseController') hoặc gọi trực tiếp BaseController nếu có.
    // Cách an toàn nhất là truyền lỗi sang middleware error handler chung (app.js)
    next(err);
  });
};

module.exports = catchAsync;
