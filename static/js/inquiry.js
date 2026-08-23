/**
 * Levitas Enterprise — Lead Capture & WhatsApp Bridge Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initInquiryForm();
});

function initInquiryForm() {
  const form = document.getElementById('enterprise-inquiry-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;

    // Collect Form Data
    const formData = {
      full_name: document.getElementById('form-full-name').value.trim(),
      company_name: document.getElementById('form-company-name').value.trim() || null,
      email: document.getElementById('form-email').value.trim(),
      phone: document.getElementById('form-phone').value.trim() || null,
      project_type: document.getElementById('form-project-type').value.trim(),
      budget_range: document.getElementById('form-budget-range').value.trim() || "Belirtilmedi",
      timeline_preference: document.getElementById('form-timeline').value.trim() || "Standart",
      project_details: document.getElementById('form-project-details').value.trim(),
      selected_features: typeof currentConfig !== 'undefined' ? currentConfig.features : []
    };

    // Client-side validation
    if (!formData.full_name || !formData.email || !formData.project_type || !formData.project_details) {
      showToast('Lütfen zorunlu alanları (İsim, E-posta, Proje Türü, Detay) doldurunuz.', 'error');
      return;
    }

    try {
      // Loading State
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span style="display:inline-block; width:16px; height:16px; border:2px solid #000; border-top-color:transparent; border-radius:50%; animation:spin 0.8s linear infinite;"></span>
        Talep İletiliyor...
      `;

      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Talep iletilemedi. Lütfen tekrar deneyiniz.');
      }

      const createdInquiry = await response.json();

      // Show Success Modal / Banner
      showSuccessFeedback(formData, createdInquiry.id);
      form.reset();
      showToast('Proje talebiniz başarıyla alındı! Ekibimiz en kısa sürede iletişime geçecektir.', 'success');

    } catch (err) {
      console.error('[Inquiry Error]', err);
      showToast(err.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });
}

function showSuccessFeedback(data, inquiryId) {
  const resultCard = document.getElementById('inquiry-success-modal');
  if (!resultCard) return;

  const phone = window.LEV_WHATSAPP_PHONE || '905550000000';
  const waText = encodeURIComponent(
    `Merhaba Levitas Enterprise,\n` +
    `Web siteniz üzerinden yeni bir proje talebi oluşturdum (Talep No: #${inquiryId}).\n\n` +
    `👤 Yetkili: ${data.full_name} (${data.company_name || 'Bireysel'})\n` +
    `🚀 Proje: ${data.project_type}\n` +
    `💰 Bütçe: ${data.budget_range}\n\n` +
    `Detayları görüşmek ve fizibilite analizi almak istiyorum.`
  );
  
  const waUrl = `https://wa.me/${phone}?text=${waText}`;

  const waBtn = document.getElementById('modal-whatsapp-link');
  if (waBtn) waBtn.href = waUrl;

  const refCode = document.getElementById('modal-reference-code');
  if (refCode) refCode.textContent = `#LEV-${inquiryId.toString().padStart(4, '0')}`;

  resultCard.style.display = 'flex';
}

function closeSuccessModal() {
  const resultCard = document.getElementById('inquiry-success-modal');
  if (resultCard) resultCard.style.display = 'none';
}
