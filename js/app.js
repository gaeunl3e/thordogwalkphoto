class ImageZoom {
  constructor(imageSelector) {
    this.image = document.querySelector(imageSelector);
    this.container = this.image.parentElement || this.image.parentNode;
    this.loadingBar = document.querySelector('.loading-bar');
    this.loadingProgress = document.querySelector('.loading-progress');

    this.scale = 1;
    this.minScale = 1;
    this.maxScale = 10;
    this.translateX = 0;
    this.translateY = 0;

    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;

    this.images = {
      hd: 'img/img-hd.jpg',
      '4k': 'img/img-4k.jpg',
      '6k': 'img/img-6k.jpg',
      '8k': 'img/img-8k.jpg',
      ultra: 'img/img-ultra.jpg'
    };
    this.currentResolution = 'hd';
    this.preloadedImages = {};
    this.isLoading = false;

    this.init();
  }

  init() {
    this.preloadImages();

    this.container.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });

    this.image.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    document.addEventListener('mouseup', () => this.handleMouseUp());

    this.image.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    this.image.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    this.image.addEventListener('touchend', () => this.handleTouchEnd());

    this.image.addEventListener('dblclick', () => this.reset());

    this.image.style.cursor = 'grab';
  }

  preloadImages() {
    // HD와 4K만 즉시 프리로드, 나머지는 필요할 때
    const priorityImages = ['hd', '4k'];

    priorityImages.forEach(key => {
      const img = new Image();
      img.src = this.images[key];
      this.preloadedImages[key] = img;
    });

    // 6K, 8K, Ultra는 지연 로드 (2초 후)
    setTimeout(() => {
      ['6k', '8k', 'ultra'].forEach(key => {
        if (!this.preloadedImages[key]) {
          const img = new Image();
          img.src = this.images[key];
          this.preloadedImages[key] = img;
        }
      });
    }, 2000);
  }

  switchResolution(newResolution) {
    if (newResolution === this.currentResolution) return;

    const newSrc = this.images[newResolution];
    const currentBg = this.image.style.backgroundImage;

    if (currentBg.includes(newSrc)) return;

    const currentTransform = this.image.style.transform;

    if (this.preloadedImages[newResolution] && this.preloadedImages[newResolution].complete) {
      this.image.style.backgroundImage = `url('${newSrc}')`;
      this.image.style.transform = currentTransform;
      this.currentResolution = newResolution;
    } else {
      // 프로그레스바 표시
      this.loadingBar.classList.add('active');
      this.loadingProgress.style.width = '0%';

      // 로딩 시뮬레이션 (실제 진행률 표시)
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 5;
        if (progress <= 90) {
          this.loadingProgress.style.width = progress + '%';
        }
      }, 100);

      const tempImg = new Image();
      tempImg.onload = () => {
        clearInterval(progressInterval);
        this.loadingProgress.style.width = '100%';

        // 완료 표시 후 이미지 교체
        setTimeout(() => {
          this.image.style.backgroundImage = `url('${newSrc}')`;
          this.image.style.transform = currentTransform;
          this.currentResolution = newResolution;
          this.loadingBar.classList.remove('active');
          this.loadingProgress.style.width = '0%';
        }, 200);
      };
      tempImg.onerror = () => {
        clearInterval(progressInterval);
        this.loadingBar.classList.remove('active');
        this.loadingProgress.style.width = '0%';
      };
      tempImg.src = newSrc;
    }
  }

  getOptimalResolution(scale) {
    if (scale >= 7.0) return 'ultra';
    if (scale >= 4.0) return '8k';
    if (scale >= 2.5) return '6k';
    if (scale >= 1.5) return '4k';
    return 'hd';
  }

  handleWheel(e) {
    e.preventDefault();

    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    this.scale = Math.min(Math.max(this.scale * delta, this.minScale), this.maxScale);

    const optimalRes = this.getOptimalResolution(this.scale);
    this.switchResolution(optimalRes);

    this.constrainPosition();
    this.updateTransform();
  }

  handleMouseDown(e) {
    e.preventDefault();
    this.isDragging = true;
    this.startX = e.clientX - this.translateX;
    this.startY = e.clientY - this.translateY;
    this.image.style.cursor = 'grabbing';
  }

  handleMouseMove(e) {
    if (this.isDragging) {
      e.preventDefault();
      this.translateX = e.clientX - this.startX;
      this.translateY = e.clientY - this.startY;
      this.constrainPosition();
      this.updateTransform();
    }
  }

  handleMouseUp() {
    this.isDragging = false;
    this.image.style.cursor = 'grab';
  }

  handleTouchStart(e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      this.initialDistance = this.getTouchDistance(e.touches);
      this.initialScale = this.scale;
    } else if (e.touches.length === 1) {
      this.isDragging = true;
      this.startX = e.touches[0].clientX - this.translateX;
      this.startY = e.touches[0].clientY - this.translateY;
    }
  }

  handleTouchMove(e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      const currentDistance = this.getTouchDistance(e.touches);
      const newScale = Math.min(
        Math.max((currentDistance / this.initialDistance) * this.initialScale, this.minScale),
        this.maxScale
      );
      this.scale = newScale;

      // Switch resolution based on zoom level
      const optimalRes = this.getOptimalResolution(this.scale);
      this.switchResolution(optimalRes);

      this.constrainPosition();
      this.updateTransform();
    } else if (e.touches.length === 1 && this.isDragging) {
      e.preventDefault();
      this.translateX = e.touches[0].clientX - this.startX;
      this.translateY = e.touches[0].clientY - this.startY;
      this.constrainPosition();
      this.updateTransform();
    }
  }

  handleTouchEnd() {
    this.isDragging = false;
    this.initialDistance = 0;
  }

  getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  constrainPosition() {
    if (this.scale <= 1) {
      this.translateX = 0;
      this.translateY = 0;
      return;
    }

    const rect = this.image.getBoundingClientRect();
    const containerWidth = this.container.clientWidth;
    const containerHeight = this.container.clientHeight;

    const imgWidth = rect.width / this.scale;
    const imgHeight = rect.height / this.scale;

    const scaledWidth = imgWidth * this.scale;
    const scaledHeight = imgHeight * this.scale;

    const maxX = Math.max(0, (scaledWidth - containerWidth) / 2);
    const maxY = Math.max(0, (scaledHeight - containerHeight) / 2);

    this.translateX = Math.min(Math.max(this.translateX, -maxX), maxX);
    this.translateY = Math.min(Math.max(this.translateY, -maxY), maxY);
  }

  updateTransform() {
    this.image.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
  }

  reset() {
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.updateTransform();
    this.switchResolution('hd');
  }
}

window.addEventListener('load', () => {
  new ImageZoom('.fullscreen-image');
});
