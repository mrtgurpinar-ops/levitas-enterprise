/* ===================================================================
   Levitas Enterprise — Prestige Enterprise Scope, Budget & ROI Engine
   21st.dev Precision Pricing & ROI Engine (Model 1: Prestige Enterprise)
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initProjectCalculator();
});

function initProjectCalculator() {
  const projectOptions = document.querySelectorAll('.calc-option');
  const addonCheckboxes = document.querySelectorAll('#featureAddons input[type="checkbox"]');
  const priceDisplay = document.getElementById('calcPriceDisplay');
  const daysDisplay = document.getElementById('calcDaysDisplay');
  const btnApply = document.getElementById('btnApplyToInquiry');
  const projectTypeSelect = document.getElementById('projectTypeSelect');
  const budgetRangeSelect = document.getElementById('budgetRangeSelect');

  let currentBasePrice = 65000;
  let currentBaseDays = 10;
  let currentTypeName = "Yapay Zeka Ajanı & LLM Botu";

  // 1. Project Type Selection
  projectOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      projectOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');

      currentBasePrice = parseInt(opt.getAttribute('data-base-price') || "65000", 10);
      currentBaseDays = parseInt(opt.getAttribute('data-base-days') || "10", 10);
      currentTypeName = opt.querySelector('.opt-title')?.textContent || "Yapay Zeka Ajanı";

      updateCalculations();
    });
  });

  // 2. Addon Checkboxes Selection
  addonCheckboxes.forEach(chk => {
    chk.addEventListener('change', updateCalculations);
  });

  // 3. Calculation Update Function
  function updateCalculations() {
    let totalMinPrice = currentBasePrice;
    let totalDays = currentBaseDays;

    addonCheckboxes.forEach(chk => {
      if (chk.checked) {
        totalMinPrice += parseInt(chk.getAttribute('data-price') || "0", 10);
        totalDays += parseInt(chk.getAttribute('data-days') || "0", 10);
      }
    });

    const totalMaxPrice = Math.round(totalMinPrice * 1.35);
    const maxDays = Math.round(totalDays * 1.35);

    if (priceDisplay) {
      priceDisplay.textContent = `${formatTL(totalMinPrice)} – ${formatTL(totalMaxPrice)}`;
    }
    if (daysDisplay) {
      daysDisplay.textContent = `${totalDays} – ${maxDays} İş Günü`;
    }
  }

  function formatTL(num) {
    return num.toLocaleString('tr-TR') + ' ₺';
  }

    // 4. Apply to Inquiry Form
  if (btnApply) {
    btnApply.addEventListener('click', () => {
      const inquirySection = document.getElementById('inquiry');
      if (inquirySection) {
        inquirySection.scrollIntoView({ behavior: 'smooth' });
      }

      // Auto-select project type in form
      if (projectTypeSelect) {
        for (let i = 0; i < projectTypeSelect.options.length; i++) {
          if (projectTypeSelect.options[i].text.toLowerCase().includes(currentTypeName.toLowerCase().slice(0, 5))) {
            projectTypeSelect.selectedIndex = i;
            break;
          }
        }
      }

      // Auto-select budget range based on calculated minimum
      let totalMin = currentBasePrice;
      addonCheckboxes.forEach(chk => {
        if (chk.checked) totalMin += parseInt(chk.getAttribute('data-price') || "0", 10);
      });

      if (budgetRangeSelect) {
        if (totalMin <= 120000) {
          budgetRangeSelect.value = "65.000 ₺ - 120.000 ₺";
        } else if (totalMin <= 250000) {
          budgetRangeSelect.value = "120.000 ₺ - 250.000 ₺";
        } else if (totalMin <= 450000) {
          budgetRangeSelect.value = "250.000 ₺ - 450.000 ₺";
        } else {
          budgetRangeSelect.value = "450.000 ₺+";
        }
      }

      // Add prefill text to details textarea
      const detailsTextarea = document.getElementById('projectDetails');
      if (detailsTextarea) {
        const checkedAddons = [];
        addonCheckboxes.forEach(chk => {
          if (chk.checked) {
            const label = chk.closest('label')?.querySelector('strong')?.textContent;
            if (label) checkedAddons.push(label);
          }
        });

        detailsTextarea.value = `Hesaplayıcıdan Seçilen Kapsam: ${currentTypeName}.\nEk Modüller: ${checkedAddons.length > 0 ? checkedAddons.join(', ') : 'Temel Kurumsal Paket'}.\nTahmini Bütçe: ${priceDisplay ? priceDisplay.textContent : 'Belirtildi'}.\n\nLütfen projemizin mimari detayları için ön görüşme başlatınız.`;
      }

      // Track analytics event
      if (typeof trackEvent === 'function') {
        trackEvent('calc_use', {
          architecture: currentTypeName,
          estimated_budget: priceDisplay ? priceDisplay.textContent : ''
        });
      }
    });
  }

  // Run initial calculation
  updateCalculations();
}

