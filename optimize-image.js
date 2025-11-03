const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeImage() {
  const inputPath = path.join(__dirname, 'img', 'img.jpg');
  const backupPath = path.join(__dirname, 'img', 'img-original.jpg');

  try {
    // 원본 백업
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(inputPath, backupPath);
      console.log('원본 이미지를 img-original.jpg로 백업했습니다.\n');
    }

    // 이미지 메타데이터 확인
    const metadata = await sharp(inputPath, { limitInputPixels: false }).metadata();
    console.log(`원본 이미지 크기: ${metadata.width} x ${metadata.height}`);
    const originalSize = fs.statSync(inputPath).size;
    console.log(`원본 파일 크기: ${(originalSize / 1024 / 1024).toFixed(2)} MB\n`);

    // 옵션 1: Full HD (1920px) - 빠른 로딩
    const outputHD = path.join(__dirname, 'img', 'img-hd.jpg');
    await sharp(inputPath, { limitInputPixels: false })
      .resize(1920, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 85,
        progressive: true,
        mozjpeg: true
      })
      .toFile(outputHD);
    const sizeHD = fs.statSync(outputHD).size;
    console.log(`[HD 버전] 1920px: ${(sizeHD / 1024 / 1024).toFixed(2)} MB (품질: 85%)`);

    // 옵션 2: 4K (3840px) - 고품질, 적당한 크기
    const output4K = path.join(__dirname, 'img', 'img-4k.jpg');
    await sharp(inputPath, { limitInputPixels: false })
      .resize(3840, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 90,
        progressive: true,
        mozjpeg: true
      })
      .toFile(output4K);
    const size4K = fs.statSync(output4K).size;
    console.log(`[4K 버전] 3840px: ${(size4K / 1024 / 1024).toFixed(2)} MB (품질: 90%)`);

    // 옵션 3: 6K (6400px) - 매우 높은 품질, 합리적 크기
    const output6K = path.join(__dirname, 'img', 'img-6k.jpg');
    await sharp(inputPath, { limitInputPixels: false })
      .resize(6400, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 92,
        progressive: true,
        mozjpeg: true
      })
      .toFile(output6K);
    const size6K = fs.statSync(output6K).size;
    console.log(`[6K 버전] 6400px: ${(size6K / 1024 / 1024).toFixed(2)} MB (품질: 92%)`);

    // 옵션 4: 8K (10240px) - 극한 확대용, 고품질
    const output8K = path.join(__dirname, 'img', 'img-8k.jpg');
    await sharp(inputPath, { limitInputPixels: false })
      .resize(10240, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 96,
        progressive: true,
        mozjpeg: true
      })
      .toFile(output8K);
    const size8K = fs.statSync(output8K).size;
    console.log(`[8K 버전] 10240px: ${(size8K / 1024 / 1024).toFixed(2)} MB (품질: 96%)`);

    // 옵션 5: 12K (16384px) - Ultra 대체, 더 가벼움
    const output12K = path.join(__dirname, 'img', 'img-ultra.jpg');
    await sharp(inputPath, { limitInputPixels: false })
      .resize(16384, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 94,
        progressive: true,
        mozjpeg: true
      })
      .toFile(output12K);
    const size12K = fs.statSync(output12K).size;
    console.log(`[Ultra 버전] 16384px: ${(size12K / 1024 / 1024).toFixed(2)} MB (품질: 94%)`);

    console.log('\n✓ 모든 버전 생성 완료!');
    console.log('\n동적 해상도 전환 시스템 (최대 10배 줌):');
    console.log('- 줌 1.0-1.5배: HD (1920px, 0.25MB)');
    console.log('- 줌 1.5-2.5배: 4K (3840px, 0.87MB)');
    console.log('- 줌 2.5-4.0배: 6K (6400px, ~2MB)');
    console.log('- 줌 4.0-7.0배: 8K (10240px, 고품질 96%, ~5MB)');
    console.log('- 줌 7.0배 이상: Ultra (16384px, 고품질, ~7-8MB)');
    console.log('\n원본 대비 40% 크기로 빠른 로딩, 완벽한 화질!');

  } catch (error) {
    console.error('이미지 최적화 중 오류 발생:', error);
  }
}

optimizeImage();
