const priceCheck = document.querySelector('[data-price-check]');

if (priceCheck) {
  const steps = [...priceCheck.querySelectorAll('[data-price-step]')];
  const counter = priceCheck.querySelector('[data-price-counter]');
  const progress = priceCheck.querySelector('[data-price-progress]');
  const progressBar = progress?.querySelector('span');
  const backButton = priceCheck.querySelector('[data-price-back]');
  const nextButton = priceCheck.querySelector('[data-price-next]');
  const submitButton = priceCheck.querySelector('[data-price-submit]');
  const status = priceCheck.querySelector('[data-price-status]');
  const success = priceCheck.querySelector('[data-price-success]');
  const endpoint = priceCheck.dataset.endpoint?.trim();
  let currentStep = 0;

  const formatPrice = (value) => `${new Intl.NumberFormat('de-DE').format(value)} €`;
  const selectedValue = (name) => priceCheck.querySelector(`[name="${name}"]:checked`)?.value || '';
  const selectedValues = (name) => [...priceCheck.querySelectorAll(`[name="${name}"]:checked`)].map((input) => input.value);

  const priceCalculation = () => {
    const assessment = selectedValue('assessment');
    const situation = selectedValue('situation');
    const income = selectedValues('income');
    const special = selectedValues('special').filter((value) => value !== 'Keine besonderen Sachverhalte');
    const rentalCount = priceCheck.elements.rental_count?.value || '';
    const items = [];
    let total = 0;
    let needsReview = false;
    const declined = special.includes('Selbständige oder gewerbliche Einkünfte');

    if (assessment === 'Zusammenveranlagung') {
      total = 299;
      items.push(['Grundpreis Zusammenveranlagung', 299]);
    } else if (situation === 'Rentner oder Pensionär') {
      total = 179;
      items.push(['Grundpreis Rentner oder Pensionär', 179]);
    } else if (situation === 'Arbeitnehmer') {
      total = 249;
      items.push(['Grundpreis Arbeitnehmer', 249]);
    } else {
      total = 249;
      items.push(['Vorläufiger Grundpreis', 249]);
      needsReview = true;
    }

    if (income.includes('Vermietung')) {
      if (rentalCount === '10plus' || !rentalCount) {
        needsReview = true;
      } else {
        const count = Number(rentalCount);
        const rentalPrice = count * 150;
        total += rentalPrice;
        items.push([`${count} Vermietungsobjekt${count === 1 ? '' : 'e'}`, rentalPrice]);
      }
    }

    if (income.includes('Kapitaleinkünfte')) {
      total += 49;
      items.push(['Kapitaleinkünfte', 49]);
    }

    if (income.includes('Ausländische Einkünfte')) {
      total += 149;
      items.push(['Ausländische Einkünfte', 149]);
    }

    if (special.length) needsReview = true;

    return { total, items, needsReview, special, declined };
  };

  const updateRentalStep = () => {
    const rentalSelected = selectedValues('income').includes('Vermietung');
    const fields = priceCheck.querySelector('[data-rental-fields]');
    const noRental = priceCheck.querySelector('[data-no-rental]');
    const select = priceCheck.elements.rental_count;
    if (fields) fields.hidden = !rentalSelected;
    if (noRental) noRental.hidden = rentalSelected;
    if (select) {
      select.required = rentalSelected;
      if (!rentalSelected) select.value = '';
    }
  };

  const renderPrice = () => {
    const calculation = priceCalculation();
    const total = priceCheck.querySelector('[data-price-total]');
    const breakdown = priceCheck.querySelector('[data-price-breakdown]');
    const priceResult = priceCheck.querySelector('.price-result');
    const reviewNotice = priceCheck.querySelector('[data-review-notice]');
    const declineNotice = priceCheck.querySelector('[data-decline-notice]');
    const resultVat = priceCheck.querySelector('[data-price-step="result"] > p');
    const disclaimer = priceCheck.querySelector('.price-disclaimer');
    const priceHidden = priceCheck.querySelector('[data-price-hidden]');
    const breakdownHidden = priceCheck.querySelector('[data-breakdown-hidden]');
    const reviewHidden = priceCheck.querySelector('[data-review-hidden]');
    const formattedTotal = formatPrice(calculation.total);

    if (total) total.textContent = formattedTotal;
    if (priceResult) priceResult.hidden = calculation.declined;
    if (reviewNotice) reviewNotice.hidden = calculation.declined || !calculation.needsReview;
    if (declineNotice) declineNotice.hidden = !calculation.declined;
    if (resultVat) resultVat.hidden = calculation.declined;
    if (disclaimer) disclaimer.hidden = calculation.declined;
    if (breakdown) {
      breakdown.innerHTML = calculation.items.map(([label, price]) => `<div><span>${label}</span><strong>${formatPrice(price)}</strong></div>`).join('');
    }
    if (priceHidden) priceHidden.value = calculation.declined ? 'Kein Angebot' : `${formattedTotal} inklusive Umsatzsteuer`;
    if (breakdownHidden) breakdownHidden.value = calculation.items.map(([label, price]) => `${label}: ${formatPrice(price)}`).join(', ');
    if (reviewHidden) reviewHidden.value = calculation.declined ? 'Keine Beratung wegen selbständiger oder gewerblicher Einkünfte' : calculation.needsReview ? `Ja${calculation.special.length ? `, wegen: ${calculation.special.join(', ')}` : ''}` : 'Nein';
    return calculation;
  };

  const navigableSteps = () => {
    const rentalSelected = selectedValues('income').includes('Vermietung');
    return steps.filter((step) => rentalSelected || step.dataset.priceStep !== 'rental');
  };

  const validateCurrentStep = () => {
    const step = steps[currentStep];
    const requiredFields = [...step.querySelectorAll('[required]')];
    const radioNames = [...new Set(requiredFields.filter((field) => field.type === 'radio').map((field) => field.name))];

    for (const name of radioNames) {
      if (!step.querySelector(`[name="${name}"]:checked`)) {
        const first = step.querySelector(`[name="${name}"]`);
        first?.setCustomValidity('Bitte treffen Sie eine Auswahl.');
        first?.reportValidity();
        first?.setCustomValidity('');
        return false;
      }
    }

    for (const field of requiredFields.filter((item) => item.type !== 'radio')) {
      if (!field.checkValidity()) {
        field.reportValidity();
        return false;
      }
    }

    if (step.dataset.priceStep === 'income' && selectedValues('income').length === 0) {
      const first = step.querySelector('[name="income"]');
      first?.setCustomValidity('Bitte treffen Sie mindestens eine Auswahl.');
      first?.reportValidity();
      first?.setCustomValidity('');
      return false;
    }

    if (step.dataset.priceStep === 'special' && selectedValues('special').length === 0) {
      const first = step.querySelector('[name="special"]');
      first?.setCustomValidity('Bitte treffen Sie mindestens eine Auswahl.');
      first?.reportValidity();
      first?.setCustomValidity('');
      return false;
    }
    return true;
  };

  const showStep = (moveFocus = false) => {
    const rentalSelected = selectedValues('income').includes('Vermietung');
    if (steps[currentStep]?.dataset.priceStep === 'rental' && !rentalSelected) {
      currentStep = steps.findIndex((step) => step.dataset.priceStep === 'special');
    }
    steps.forEach((step, index) => {
      const active = index === currentStep;
      step.classList.toggle('active', active);
      step.hidden = !active;
      step.setAttribute('aria-hidden', String(!active));
    });
    const navigation = navigableSteps();
    const position = navigation.indexOf(steps[currentStep]);
    if (counter) counter.textContent = `Schritt ${position + 1} von ${navigation.length}`;
    if (progressBar) progressBar.style.width = `${((position + 1) / navigation.length) * 100}%`;
    progress?.setAttribute('aria-valuenow', String(position + 1));
    progress?.setAttribute('aria-valuemax', String(navigation.length));
    if (backButton) backButton.disabled = position === 0;
    if (nextButton) nextButton.hidden = position === navigation.length - 1;
    if (submitButton) submitButton.hidden = position !== navigation.length - 1;
    if (steps[currentStep]?.dataset.priceStep === 'rental') updateRentalStep();
    if (steps[currentStep]?.dataset.priceStep === 'result') {
      const calculation = renderPrice();
      if (calculation.declined && nextButton) nextButton.hidden = true;
    }
    if (moveFocus) {
      const heading = steps[currentStep]?.querySelector('h2');
      heading?.setAttribute('tabindex', '-1');
      heading?.focus();
    }
  };

  const configureExclusiveCheckboxes = (name, noneSelector) => {
    const boxes = [...priceCheck.querySelectorAll(`[name="${name}"]`)];
    const none = priceCheck.querySelector(noneSelector);
    boxes.forEach((box) => box.addEventListener('change', () => {
      if (!box.checked) return;
      if (box === none) {
        boxes.filter((item) => item !== box).forEach((item) => { item.checked = false; });
      } else if (none) {
        none.checked = false;
      }
      if (name === 'income') updateRentalStep();
    }));
  };

  nextButton?.addEventListener('click', () => {
    if (!validateCurrentStep()) return;
    const currentName = steps[currentStep]?.dataset.priceStep;
    const rentalSelected = selectedValues('income').includes('Vermietung');
    if (currentName === 'income' && !rentalSelected) {
      currentStep = steps.findIndex((step) => step.dataset.priceStep === 'special');
      showStep(true);
      return;
    }
    const navigation = navigableSteps();
    const position = navigation.indexOf(steps[currentStep]);
    if (position < navigation.length - 1) {
      currentStep = steps.indexOf(navigation[position + 1]);
      showStep(true);
    }
  });

  backButton?.addEventListener('click', () => {
    const currentName = steps[currentStep]?.dataset.priceStep;
    const rentalSelected = selectedValues('income').includes('Vermietung');
    if (currentName === 'special' && !rentalSelected) {
      currentStep = steps.findIndex((step) => step.dataset.priceStep === 'income');
      showStep(true);
      return;
    }
    const navigation = navigableSteps();
    const position = navigation.indexOf(steps[currentStep]);
    if (position > 0) {
      currentStep = steps.indexOf(navigation[position - 1]);
      showStep(true);
    }
  });

  priceCheck.addEventListener('submit', (event) => event.preventDefault());
  submitButton?.addEventListener('click', async () => {
    if (!validateCurrentStep()) return;
    renderPrice();
    submitButton.disabled = true;
    submitButton.textContent = 'Wird gesendet …';
    if (status) {
      status.textContent = '';
      status.classList.remove('error');
    }

    try {
      const formData = new FormData(priceCheck);
      formData.set('Steuerjahr', formData.get('year') || 'nicht angegeben');
      formData.set('Veranlagung', formData.get('assessment') || 'nicht angegeben');
      formData.set('Persönliche Situation', formData.get('situation') || 'nicht angegeben');
      formData.set('Weitere Einkünfte', formData.getAll('income').join(', ') || 'keine');
      formData.set('Vermietungsobjekte', formData.get('rental_count') || 'keine');
      formData.set('Besondere Sachverhalte', formData.getAll('special').join(', ') || 'keine');
      ['year', 'assessment', 'situation', 'income', 'rental_count', 'special'].forEach((name) => formData.delete(name));

      const response = await fetch(endpoint, { method: 'POST', body: formData, headers: { Accept: 'application/json' } });
      const result = await response.json().catch(() => ({ success: false }));
      if (!response.ok || result.success !== true) throw new Error(result.error_msg || result.error || 'Versand fehlgeschlagen');

      priceCheck.querySelectorAll('.wizard-step,.wizard-actions,.wizard-head,.wizard-progress').forEach((element) => { element.hidden = true; });
      success?.classList.add('show');
      success?.setAttribute('tabindex', '-1');
      success?.focus();
    } catch (error) {
      if (status) {
        status.textContent = 'Die Anfrage konnte gerade nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie uns eine E Mail.';
        status.classList.add('error');
        status.focus();
      }
      submitButton.disabled = false;
      submitButton.textContent = 'Erneut versuchen';
    }
  });

  configureExclusiveCheckboxes('income', '[data-none-income]');
  configureExclusiveCheckboxes('special', '[data-none-special]');
  counter?.setAttribute('aria-live', 'polite');
  progress?.setAttribute('role', 'progressbar');
  progress?.setAttribute('aria-valuemin', '1');
  progress?.setAttribute('aria-valuemax', String(steps.length));
  progress?.setAttribute('aria-label', 'Fortschritt des Preischecks');
  status?.setAttribute('aria-live', 'polite');
  showStep();
}
