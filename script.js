document.addEventListener('DOMContentLoaded', function () {
  const config = window.businessConfig;
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(nav.classList.contains('open')));
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const updateTextNode = function (selector, value) {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  };

  const buildWhatsAppLink = function (message) {
    return `${config.whatsappBase}?text=${encodeURIComponent(message)}`;
  };

  const applyBusinessData = function () {
    updateTextNode('[data-company-name]', config.companyName);
    updateTextNode('[data-phone]', config.phoneDisplay);
    updateTextNode('[data-address]', config.address);
    updateTextNode('[data-address-line]', config.address);

    document.querySelectorAll('[data-whatsapp-link]').forEach(function (link) {
      link.href = buildWhatsAppLink(config.whatsappIntro);
    });

    document.querySelectorAll('[data-google-reviews]').forEach(function (link) {
      link.href = config.googleReviewsUrl;
    });

    document.querySelectorAll('[data-maps-link]').forEach(function (link) {
      link.href = config.mapsSearchUrl;
    });

    document.querySelectorAll('[data-whatsapp-product]').forEach(function (link) {
      const product = config.products.find(function (item) {
        return link.dataset.whatsappProduct === item.id;
      });
      if (product) {
        link.href = buildWhatsAppLink(product.actionText);
      }
    });

    const reviewContainer = document.querySelector('[data-reviews]');
    if (reviewContainer && config.reviews) {
      reviewContainer.innerHTML = config.reviews.map(function (review) {
        return `
          <article class="review-card">
            <div class="stars" aria-label="Cinco estrelas">★★★★★</div>
            <blockquote>“${review.text}”</blockquote>
            <footer>${review.author}</footer>
          </article>
        `;
      }).join('');
    }

    const productContainer = document.querySelector('[data-products]');
    if (productContainer && config.products) {
      productContainer.innerHTML = config.products.map(function (product) {
        return `
          <article class="product-card">
            <div class="thumb" style="background-image:url('${product.image}')"></div>
            <div class="content">
              <h3>${product.title}</h3>
              <p>${product.shortDescription}</p>
              <a class="btn btn-gold" href="${buildWhatsAppLink(product.actionText)}" data-whatsapp-product="${product.id}">${product.buttonLabel}</a>
            </div>
          </article>
        `;
      }).join('');
    }

    const galleryContainer = document.querySelector('[data-gallery]');
    if (galleryContainer && config.galleryVideos) {
      galleryContainer.innerHTML = config.galleryVideos.map(function (video) {
        return `
          <button type="button" class="gallery-item" data-gallery-video="${video.video}" data-video-title="${video.title}" style="background-image:url('${video.poster}');" aria-label="Assistir: ${video.title}">
            <span class="gallery-play-icon" aria-hidden="true">▶</span>
            <span class="gallery-video-title">${video.title}</span>
          </button>
        `;
      }).join('');
    }

    const photoGalleryContainer = document.querySelector('[data-photo-gallery]');
    if (photoGalleryContainer && config.galleryImages) {
      photoGalleryContainer.innerHTML = config.galleryImages.map(function (image) {
        return `
          <figure class="gallery-photo-card">
            <img src="${image.image}" alt="${image.alt}" loading="lazy">
            <figcaption>${image.title}</figcaption>
          </figure>
        `;
      }).join('');
    }

    const hoursContainer = document.querySelector('[data-hours]');
    if (hoursContainer && config.hours) {
      hoursContainer.innerHTML = Object.entries(config.hours).map(function ([day, time]) {
        return `
          <li>
            <span>${day}</span>
            <strong>${time}</strong>
          </li>
        `;
      }).join('');
    }
  };

  applyBusinessData();

  const galleryContainer = document.querySelector('[data-gallery]');
  const videoDialog = document.querySelector('[data-video-dialog]');
  const videoPlayer = document.querySelector('[data-video-player]');
  const videoTitle = document.querySelector('[data-video-title-display]');
  const videoError = document.querySelector('[data-video-error]');

  if (galleryContainer && videoDialog && videoPlayer && videoTitle && videoError) {
    galleryContainer.addEventListener('click', function (event) {
      const button = event.target.closest('[data-gallery-video]');
      if (!button) return;

      videoPlayer.src = button.dataset.galleryVideo;
      videoTitle.textContent = button.dataset.videoTitle;
      videoError.hidden = true;
      videoDialog.showModal();
      videoPlayer.play().catch(function (error) {
        if (!videoDialog.open || error.name === 'AbortError') return;
        videoError.textContent = error.name === 'NotAllowedError'
          ? 'A reprodução automática foi bloqueada. Use o botão de reprodução nos controles do vídeo.'
          : 'Não foi possível reproduzir o vídeo neste navegador. Verifique se o arquivo está em um formato compatível.';
        videoError.hidden = false;
      });
    });

    videoPlayer.addEventListener('error', function () {
      if (!videoDialog.open) return;
      videoError.textContent = 'O navegador não conseguiu decodificar este vídeo. O arquivo pode usar um codec incompatível.';
      videoError.hidden = false;
    });

    videoDialog.addEventListener('click', function (event) {
      if (event.target === videoDialog) videoDialog.close();
    });

    videoDialog.addEventListener('close', function () {
      videoPlayer.pause();
      videoPlayer.removeAttribute('src');
      videoPlayer.load();
      videoError.hidden = true;
    });

    videoDialog.querySelector('[data-video-close]').addEventListener('click', function () {
      videoDialog.close();
    });
  }

  const form = document.querySelector('#budget-form');
  const statusEl = document.querySelector('#form-status');

  if (form && statusEl) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const formData = new FormData(form);
      const requiredFields = [
        'fullName',
        'phone',
        'product',
        'environment',
        'projectDescription'
      ];

      let hasError = false;
      requiredFields.forEach(function (fieldName) {
        const field = form.elements[fieldName];
        if (!field || !field.value.trim()) {
          hasError = true;
          field.setAttribute('aria-invalid', 'true');
        } else {
          field.setAttribute('aria-invalid', 'false');
        }
      });

      if (hasError) {
        statusEl.textContent = 'Preencha os campos obrigatórios antes de enviar o orçamento.';
        statusEl.className = 'form-status error';
        return;
      }

      const message = [
        'Olá! Conheci o Grupo Marps pelo site e gostaria de solicitar um orçamento para um projeto em porcelanato.',
        '',
        `Nome: ${formData.get('fullName')}`,
        `Telefone/WhatsApp: ${formData.get('phone')}`,
        `Produto: ${formData.get('product')}`,
        `Ambiente: ${formData.get('environment')}`,
        `Medidas aproximadas: ${formData.get('measurements') || 'Não informado'}`,
        `Descrição: ${formData.get('projectDescription')}`,
        `Imagem de referência: ${formData.get('referenceImage') ? 'Anexada' : 'Não enviada'}`
      ].join('\n');

      const whatsappUrl = buildWhatsAppLink(message);
      window.open(whatsappUrl, '_blank', 'noopener');

      statusEl.textContent = 'Mensagem pronta para envio pelo WhatsApp. Revise as informações e envie.';
      statusEl.className = 'form-status success';
      form.reset();
    });
  }
});
