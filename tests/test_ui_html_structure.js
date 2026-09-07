/**
 * TEST SUITE: KIỂM THỬ TỰ ĐỘNG CẤU TRÚC GIAO DIỆN HTML & ASSETS TĨNH (QA & FRONTEND)
 * Quét toàn bộ các file .html trong src/public/ để kiểm tra:
 * 1. Mọi file CSS cục bộ được link trong <head> PHẢI tồn tại trên đĩa (chặn triệt để lỗi 404 như app.css)
 * 2. Mọi file JS cục bộ được link trong <script> PHẢI tồn tại trên đĩa
 * 3. Tất cả các trang ứng dụng (trừ login và 404) BẮT BUỘC phải có container #appSidebar và #appNavbar để layout.js render
 * 4. Thứ tự import scripts đúng chuẩn: api.js -> layout.js -> [module].js
 */

const fs = require('fs');
const path = require('path');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failed++;
  }
}

// Hàm duyệt đệ quy tìm tất cả file .html
function getAllHtmlFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllHtmlFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith('.html')) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

function runHtmlTests() {
  console.log('======================================================================');
  console.log('🌐 BẮT ĐẦU KIỂM THỬ CẤU TRÚC GIAO DIỆN HTML, SIDEBAR & TÀI NGUYÊN TĨNH');
  console.log('======================================================================\n');

  const publicDir = path.join(__dirname, '../src/public');
  const htmlFiles = getAllHtmlFiles(publicDir);

  console.log(`[Scanner] Tìm thấy ${htmlFiles.length} file HTML cần kiểm tra cấu trúc:\n`);

  const EXCLUDED_PAGES = ['login.html', '404.html'];

  htmlFiles.forEach(filePath => {
    const relPath = path.relative(publicDir, filePath).replace(/\\/g, '/');
    const fileName = path.basename(filePath);
    const content = fs.readFileSync(filePath, 'utf8');

    console.log(`--- Kiểm tra trang: ${relPath} ---`);

    // 1. Kiểm tra các thẻ <link rel="stylesheet">
    const cssMatches = [...content.matchAll(/<link[^>]+href=["']([^"']+)["'][^>]*>/gi)];
    for (const match of cssMatches) {
      const href = match[1];
      // Chỉ kiểm tra file local (bắt đầu bằng / hoặc ./ hoặc css/)
      if (href.startsWith('/') || href.startsWith('./') || href.startsWith('css/')) {
        const cleanHref = (href.startsWith('/') ? href.slice(1) : href).split('?')[0];
        const targetDiskPath = path.join(publicDir, cleanHref);
        const exists = fs.existsSync(targetDiskPath);
        assert(exists, `[${relPath}] File CSS "${href}" tồn tại trên đĩa`);
      }
    }

    // 2. Kiểm tra các thẻ <script src="...">
    const jsMatches = [...content.matchAll(/<script[^>]+src=["']([^"']+)["'][^>]*>/gi)];
    for (const match of jsMatches) {
      const src = match[1];
      if (src.startsWith('/') || src.startsWith('./') || src.startsWith('js/')) {
        const cleanSrc = (src.startsWith('/') ? src.slice(1) : src).split('?')[0];
        const targetDiskPath = path.join(publicDir, cleanSrc);
        const exists = fs.existsSync(targetDiskPath);
        assert(exists, `[${relPath}] File JS "${src}" tồn tại trên đĩa`);
      }
    }

    // 3. Với các trang chính (cần Sidebar/Navbar)
    if (!EXCLUDED_PAGES.includes(fileName)) {
      // Phải có #appSidebar
      const hasAppSidebar = content.includes('id="appSidebar"');
      assert(hasAppSidebar, `[${relPath}] Có thẻ container chứa Sidebar <div id="appSidebar">`);

      // Phải có #appNavbar
      const hasAppNavbar = content.includes('id="appNavbar"');
      assert(hasAppNavbar, `[${relPath}] Có thẻ container chứa Navbar <div id="appNavbar">`);

      // Phải có layout.js
      const hasLayoutJs = content.includes('/js/layout.js') || content.includes('layout.js');
      assert(hasLayoutJs, `[${relPath}] Đã nhúng script /js/layout.js để dựng Sidebar/Navbar`);

      // Phải có api.js
      const hasApiJs = content.includes('/js/api.js') || content.includes('api.js');
      assert(hasApiJs, `[${relPath}] Đã nhúng script /js/api.js`);

      // Kiểm tra thứ tự import: api.js PHẢI trước layout.js
      if (hasApiJs && hasLayoutJs) {
        const posApi = content.search(/<script[^>]+src=["'][^"']*api\.js/i);
        const posLayout = content.search(/<script[^>]+src=["'][^"']*layout\.js/i);
        assert(posApi !== -1 && posLayout !== -1 && posApi < posLayout, `[${relPath}] Script api.js được nạp trước layout.js`);
      }
    }

    console.log('');
  });

  console.log('======================================================================');
  console.log(`🎉 KẾT QUẢ KIỂM THỬ GIAO DIỆN HTML & SIDEBAR: ${passed} PASS, ${failed} FAIL`);
  console.log('======================================================================');

  if (failed === 0) {
    console.log('✅ TOÀN BỘ CÁC TRANG HTML ĐỀU CHUẨN CẤU TRÚC SIDEBAR & KHÔNG CÓ LINK LỖI 404!\n');
    process.exit(0);
  } else {
    console.error(`❌ CÓ ${failed} LỖI CẤU TRÚC HTML HOẶC LINK FILE TĨNH!\n`);
    process.exit(1);
  }
}

runHtmlTests();
