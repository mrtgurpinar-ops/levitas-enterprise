/**
 * Levitas Enterprise — Lead Capture, KVKK Modal & Analytics Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initInquiryForm();
  initKvkkModal();
  initAnalyticsTracking();
});

// 1. Global Lightweight Analytics Tracker
function trackEvent(eventType, metaData = {}) {
  const isMobile = window.innerWidth <= 768;
  const payload = {
    event_type: eventType,
    path: window.location.pathname || "/",
    referrer: document.referrer || null,
    device_type: isMobile ? "mobile" : "desktop",
    meta_data: metaData
  };

  fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(() => {});
}

function initAnalyticsTracking() {
  // Track pageview on load
  trackEvent('pageview');
}

// 2. KVKK Modal Management
function initKvkkModal() {
  const modal = document.getElementById('kvkkModal');
  const openBtns = [
    document.getElementById('openKvkkModalBtn'),
    document.getElementById('footerKvkkTrigger')
  ].filter(Boolean);
  const closeBtn = document.getElementById('closeKvkkModalBtn');
  const acceptBtn = document.getElementById('acceptKvkkModalBtn');

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (modal) modal.style.display = 'flex';
    });
  });

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
  }

  if (acceptBtn && modal) {
    acceptBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      const chk = document.getElementById('kvkkConsent');
      if (chk) chk.checked = true;
    });
  }

  // Close on outside click
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
      modal.style.display = 'none';
    }
  });
}

// 3. Inquiry Form Submission & Validation
function initInquiryForm() {
  const form = document.getElementById('inquiryForm');
  if (!form) return;

  const formAlert = document.getElementById('formAlert');
  const submitBtn = document.getElementById('btnSubmitInquiry');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const kvkkCheckbox = document.getElementById('kvkkConsent');
    if (kvkkCheckbox && !kvkkCheckbox.checked) {
      showAlert('Lütfen KVKK Aydınlatma Metnini okuyup onay kutusunu işaretleyiniz.', 'error');
      return;
    }

    const fullName = document.getElementById('fullName')?.value.trim();
    const companyName = document.getElementById('companyName')?.value.trim() || null;
    const email = document.getElementById('email')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim() || null;
    const projectType = document.getElementById('projectTypeSelect')?.value;
    const budgetRange = document.getElementById('budgetRangeSelect')?.value;
    const projectDetails = document.getElementById('projectDetails')?.value.trim();

    if (!fullName || !email || !projectDetails) {
      showAlert('Lütfen Ad-Soyad, E-posta ve Proje Detayları alanlarını doldurunuz.', 'error');
      return;
    }

    const payload = {
      full_name: fullName,
      company_name: companyName,
      email: email,
      phone: phone,
      project_type: projectType || "Özel Kurumsal Çözüm",
      budget_range: budgetRange || "Belirtilmedi",
      timeline_preference: "Standart Kurumsal",
      selected_features: [],
      project_details: projectDetails
    };

    const originalBtnContent = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>⏳ Kapsam Analizi İletiliyor...</span>';
    }

    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Talep iletilemedi. Lütfen doğrudan WhatsApp üzerinden ulaşınız.');
      }

      const created = await res.json();

      // Track conversion event
      trackEvent('form_submit', {
        inquiry_id: created.id,
        project_type: created.project_type,
        budget_range: created.budget_range
      });

      // Prepare WhatsApp message URL
      const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
      const waMsg = encodeURIComponent(
        `Merhaba Levitas Enterprise,\n` +
        `Web siteniz üzerinden yeni bir proje talebi oluşturdum (Talep No: #${created.id}).\n\n` +
        `👤 Yetkili: ${fullName} (${companyName || 'Kurumsal'})\n` +
        `🚀 Kapsam: ${projectType}\n` +
        `💰 Bütçe Aralığı: ${budgetRange}\n\n` +
        `Ön teknik görüşme ve fizibilite analizini başlatmak istiyorum.`
      );
      const waUrl = `https://wa.me/905555105635?text=${waMsg}`;

      showAlert(
        `<strong>✅ Talebiniz Başarıyla Alındı (Kayıt No: #${created.id})</strong><br>` +
        `Mühendislik ekibimiz 2 saat içinde kapsam analizini tamamlayıp sizinle iletişime geçecektir.<br>` +
        `<div style="margin-top: 0.85rem;">` +
        `  <a href="${waUrl}" target="_blank" class="btn btn-whatsapp btn-sm" style="display: inline-flex; text-decoration: none; padding: 0.5rem 1rem;">` +
        `    <span>💬 WhatsApp'tan da Anında İletişim Başlat →</span>` +
        `  </a>` +
        `</div>`,
        'success'
      );

      form.reset();

    } catch (err) {
      console.error('[Form Submit Error]', err);
      showAlert(`❌ ${err.message}`, 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnContent;
      }
    }
  });

  function showAlert(htmlContent, type) {
    if (!formAlert) return;
    formAlert.style.display = 'block';
    formAlert.innerHTML = htmlContent;
    if (type === 'success') {
      formAlert.style.background = 'rgba(16, 185, 129, 0.15)';
      formAlert.style.border = '1px solid rgba(16, 185, 129, 0.4)';
      formAlert.style.color = '#34d399';
    } else {
      formAlert.style.background = 'rgba(244, 63, 94, 0.15)';
      formAlert.style.border = '1px solid rgba(244, 63, 94, 0.4)';
      formAlert.style.color = '#f87171';
    }
    formAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

