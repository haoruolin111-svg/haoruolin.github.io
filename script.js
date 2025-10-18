document.addEventListener('DOMContentLoaded', function() {

    // --- 1. 移动端菜单功能 ---
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const navLinks = document.querySelectorAll('.main-nav a');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                }
            });
        });
    }

    // --- 2. 平滑滚动到页面锚点 ---
    function smoothScrollTo(targetId) {
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            const headerOffset = 80;
            const elementPosition = targetSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            smoothScrollTo(this.getAttribute('href'));
        });
    });

    // --- 3. 导航栏链接根据滚动位置自动激活 ---
    const sections = document.querySelectorAll('.page-section');
    if (sections.length > 0) {
        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    document.querySelectorAll('.main-nav a').forEach(link => link.classList.remove('active'));
                    const id = entry.target.getAttribute('id');
                    const activeLink = document.querySelector(`.main-nav a[href="#${id}"]`);
                    if (activeLink) {
                        activeLink.classList.add('active');
                    }
                }
            });
        }, { rootMargin: "-40% 0px -60% 0px" });

        sections.forEach(section => {
            navObserver.observe(section);
        });
    }

    // --- 4. 导航栏滚动时样式变化 ---
    const header = document.querySelector('.main-header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 80) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // --- 5. 滚动时的元素入场动画 ---
    const elementsToAnimate = document.querySelectorAll('.section-title, .section-subtitle, .experience-card, .project-card, .project-card-horizontal, .architecture-card, .social-account-showcase, .contact-container, .section-header-underline');
    
    if (elementsToAnimate.length > 0) {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = `
            .section-header-underline.is-visible { width: 80px !important; opacity: 1 !important; }
            .is-visible { opacity: 1 !important; transform: translateY(0) !important; }
        `;
        document.head.appendChild(styleSheet);

        const scrollObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        elementsToAnimate.forEach(el => {
            if (el.classList.contains('section-header-underline')) {
                el.style.width = '0';
                el.style.opacity = '0';
                el.style.transition = 'width 0.5s ease-out 0.2s, opacity 0.5s ease-out 0.2s';
            } else {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            }
            scrollObserver.observe(el);
        });
    }

    // --- 6. Project区域卡片轮播功能 ---
    const projectContainer = document.querySelector('.project-part-1');
    if (projectContainer) {
        projectContainer.addEventListener('click', (event) => {
            const arrow = event.target.closest('.card-arrow');
            if (!arrow) return;
            event.stopPropagation();

            const card = arrow.closest('.js-modal-trigger');
            const imageElement = card.querySelector('.project-image-content, .coze-image');
            if (!card || !imageElement || !card.dataset.images) return;

            const images = card.dataset.images.split(',').map(item => item.trim());
            if (images.length <= 1) return;

            let currentIndex = parseInt(imageElement.dataset.currentIndex || 0);
            if (arrow.classList.contains('next')) {
                currentIndex = (currentIndex + 1) % images.length;
            } else {
                currentIndex = (currentIndex - 1 + images.length) % images.length;
            }
            imageElement.dataset.currentIndex = currentIndex;
            
            imageElement.style.opacity = '0';
            setTimeout(() => {
                imageElement.src = images[currentIndex];
                imageElement.style.opacity = '1';
            }, 300);
        });
    }

    // --- 7. 详情弹窗 (Modal) 功能 (已修复) ---
    const modal = document.getElementById('project-modal');
    if (modal) {
        const clickableCards = document.querySelectorAll('.js-modal-trigger');
        const modalCloseBtn = modal.querySelector('.modal-close');
        const modalImage = modal.querySelector('.modal-image');
        const modalTitle = modal.querySelector('.modal-title');
        const modalDescription = modal.querySelector('.modal-description');
        const prevArrow = modal.querySelector('.gallery-arrow.prev');
        const nextArrow = modal.querySelector('.gallery-arrow.next');

        let currentImages = [];
        let currentIndex = 0;

        function updateGallery() {
            modalImage.style.opacity = '0';
            setTimeout(() => {
                modalImage.src = currentImages[currentIndex];
                modalImage.alt = modalTitle.innerText + " - 图片 " + (currentIndex + 1);
                modalImage.onload = () => { modalImage.style.opacity = '1'; };
            }, 200);

            // 如果只有一张图，则隐藏两个箭头，否则根据位置判断
            const showArrows = currentImages.length > 1;
            prevArrow.classList.toggle('hidden', !showArrows || currentIndex === 0);
            nextArrow.classList.toggle('hidden', !showArrows || currentIndex === currentImages.length - 1);
        }

        clickableCards.forEach(card => {
            // **核心修复点**：只要有详情，就让卡片可点击
            if (card.dataset.details) {
                card.style.cursor = 'pointer'; // 确保鼠标是手型
                card.addEventListener('click', (event) => {
                     if (event.target.closest('.card-arrow')) {
                    return;
                }
                    modalTitle.innerText = card.dataset.title || card.querySelector('h4').innerText;
                    modalDescription.innerHTML = card.dataset.details;
                    
                    // 判断是多图(data-images)还是单图(data-img)
                    if (card.dataset.images) {
                        currentImages = card.dataset.images.split(',').map(item => item.trim());
                    } else if (card.dataset.img) {
                        currentImages = [card.dataset.img];
                    } else {
                        currentImages = []; // 如果都没有，则为空
                    }

                    currentIndex = 0;
                    if (currentImages.length > 0) {
                       updateGallery();
                    }
                    
                    modal.classList.add('is-visible');
                    document.body.classList.add('modal-open');
                });
            }
        });

        nextArrow.addEventListener('click', () => {
            if (currentIndex < currentImages.length - 1) { currentIndex++; updateGallery(); }
        });
        prevArrow.addEventListener('click', () => {
            if (currentIndex > 0) { currentIndex--; updateGallery(); }
        });

        function closeModal() {
            modal.classList.remove('is-visible');
            document.body.classList.remove('modal-open');
        }
        modalCloseBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (event) => {
            if (event.target === modal) closeModal();
        });
    }
});