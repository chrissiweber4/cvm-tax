const head = document.querySelector('.sitehead');
const menu = document.querySelector('.menu');
const nav = document.querySelector('.nav');

const updateHeader = () => head?.classList.toggle('scrolled', window.scrollY > 8);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const setMenu = (open) => {
  if (!menu || !nav) return;
  nav.classList.toggle('open', open);
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
  menu.textContent = open ? 'Schließen' : 'Menü';
  document.body.classList.toggle('menu-open', open);
};

menu?.addEventListener('click', () => setMenu(!nav?.classList.contains('open')));
document.querySelectorAll('.nav a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('click', (event) => {
  if (!nav?.classList.contains('open')) return;
  if (nav.contains(event.target) || menu?.contains(event.target)) return;
  setMenu(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav?.classList.contains('open')) {
    setMenu(false);
    menu?.focus();
  }
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 760) setMenu(false);
});

document.querySelectorAll('[data-year]').forEach((element) => {
  element.textContent = new Date().getFullYear();
});

const wizard = document.querySelector('[data-wizard]');
if (wizard) {
  const steps = [...wizard.querySelectorAll('.wizard-step')];
  const bar = wizard.querySelector('.wizard-progress span');
  const progress = wizard.querySelector('.wizard-progress');
  const counter = wizard.querySelector('[data-counter]');
  const back = wizard.querySelector('[data-back]');
  const next = wizard.querySelector('[data-next]');
  const finish = wizard.querySelector('[data-finish]');
  const success = wizard.querySelector('.success');
  const successTitle = success?.querySelector('[data-success-title]');
  const successText = success?.querySelector('[data-success-text]');
  const formStatus = wizard.querySelector('[data-form-status]');
  const endpoint = wizard.dataset.endpoint?.trim();
  let currentStep = 0;

  counter?.setAttribute('aria-live', 'polite');
  progress?.setAttribute('role', 'progressbar');
  progress?.setAttribute('aria-valuemin', '1');
  progress?.setAttribute('aria-valuemax', String(steps.length));
  progress?.setAttribute('aria-label', 'Fortschritt der Anfrage');
  success?.setAttribute('aria-live', 'polite');
  success?.setAttribute('tabindex', '-1');
  formStatus?.setAttribute('aria-live', 'polite');

  if (finish) finish.textContent = endpoint ? 'Anfrage absenden' : 'E Mail Entwurf öffnen';

  const show = (moveFocus = false) => {
    steps.forEach((step, index) => {
      const active = index === currentStep;
      step.classList.toggle('active', active);
      step.hidden = !active;
      step.setAttribute('aria-hidden', String(!active));
    });
    if (bar) bar.style.width = `${((currentStep + 1) / steps.length) * 100}%`;
    if (counter) counter.textContent = `Schritt ${currentStep + 1} von ${steps.length}`;
    progress?.setAttribute('aria-valuenow', String(currentStep + 1));
    if (back) back.disabled = currentStep === 0;
    if (next) next.style.display = currentStep === steps.length - 1 ? 'none' : 'inline-flex';
    if (finish) finish.style.display = currentStep === steps.length - 1 ? 'inline-flex' : 'none';

    if (moveFocus) {
      const heading = steps[currentStep]?.querySelector('h2');
      heading?.setAttribute('tabindex', '-1');
      heading?.focus();
    }
  };

  const validate = () => {
    const step = steps[currentStep];
    const required = [...step.querySelectorAll('[required]')];
    const radioNames = [...new Set(required.filter((field) => field.type === 'radio').map((field) => field.name))];

    for (const name of radioNames) {
      if (!step.querySelector(`input[name="${name}"]:checked`)) {
        const firstRadio = step.querySelector(`input[name="${name}"]`);
        firstRadio?.setCustomValidity('Bitte treffen Sie eine Auswahl.');
        firstRadio?.reportValidity();
        firstRadio?.setCustomValidity('');
        return false;
      }
    }

    for (const field of required.filter((item) => item.type !== 'radio')) {
      if (!field.checkValidity()) {
        field.reportValidity();
        return false;
      }
    }
    return true;
  };

  wizard.addEventListener('submit', (event) => event.preventDefault());
  next?.addEventListener('click', () => {
    if (validate() && currentStep < steps.length - 1) {
      currentStep += 1;
      show(true);
    }
  });
  back?.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep -= 1;
      show(true);
    }
  });
  const requestPayload = () => {
    const formData = new FormData(wizard);
    const extras = formData.getAll('extras');
    formData.delete('extras');
    formData.set('Weitere Einkünfte', extras.length ? extras.join(', ') : 'keine');
    formData.set('Steuerjahr', formData.get('year') || 'nicht angegeben');
    formData.set('Situation', formData.get('type') || 'nicht angegeben');
    formData.set('Veranlagung', formData.get('assessment') || 'nicht angegeben');
    formData.set('Name', formData.get('name') || 'nicht angegeben');
    formData.set('email', formData.get('email') || 'nicht angegeben');
    formData.set('Telefon', formData.get('phone') || 'nicht angegeben');
    formData.set('Nachricht', formData.get('message') || 'keine');
    ['year', 'type', 'assessment', 'name', 'phone', 'message'].forEach((name) => formData.delete(name));
    return formData;
  };

  const showSuccess = (title, text) => {
    wizard.querySelectorAll('.wizard-step,.wizard-actions,.wizard-head,.wizard-progress').forEach((element) => {
      element.hidden = true;
    });
    if (successTitle) successTitle.textContent = title;
    if (successText) successText.textContent = text;
    success?.classList.add('show');
    success?.focus();
  };

  finish?.addEventListener('click', async () => {
    if (!validate()) return;
    const formData = new FormData(wizard);
    const value = (name) => formData.get(name) || 'nicht angegeben';
    const extras = formData.getAll('extras');
    const body = [
      'Neue Anfrage über CVM TAX',
      '',
      `Steuerjahr: ${value('year')}`,
      `Situation: ${value('type')}`,
      `Veranlagung: ${value('assessment')}`,
      `Weitere Themen: ${extras.length ? extras.join(', ') : 'keine'}`,
      `Name: ${value('name')}`,
      `E-Mail: ${value('email')}`,
      `Telefon: ${value('phone')}`,
      '',
      'Nachricht:',
      value('message'),
    ].join('\n');

    if (!endpoint) {
      window.location.href = `mailto:info@cvm-tax.de?subject=${encodeURIComponent('Anfrage Einkommensteuererklärung')}&body=${encodeURIComponent(body)}`;
      showSuccess('E Mail Entwurf vorbereitet', 'Ihr E Mail Programm wurde geöffnet. Bitte senden Sie die vorbereitete Nachricht dort noch ab.');
      return;
    }

    finish.disabled = true;
    finish.textContent = 'Wird gesendet …';
    if (formStatus) {
      formStatus.textContent = '';
      formStatus.classList.remove('error');
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: requestPayload(),
        headers: { Accept: 'application/json' },
      });
      const result = await response.json().catch(() => ({ success: false }));
      if (!response.ok || result.success !== true) {
        throw new Error(result.error_msg || result.error || `Formularversand fehlgeschlagen: ${response.status}`);
      }
      showSuccess('Anfrage erfolgreich gesendet', 'Vielen Dank. Wir prüfen Ihre Angaben und melden uns persönlich bei Ihnen.');
      wizard.reset();
    } catch (error) {
      if (formStatus) {
        formStatus.textContent = 'Die Anfrage konnte gerade nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie uns eine E Mail.';
        formStatus.classList.add('error');
        formStatus.focus();
      }
      finish.disabled = false;
      finish.textContent = 'Erneut versuchen';
    }
  });

  const extraChecks = [...wizard.querySelectorAll('input[name="extras"]')];
  extraChecks.forEach((box) => box.addEventListener('change', () => {
    if (!box.checked) return;
    if (box.value === 'Keine') {
      extraChecks.filter((item) => item !== box).forEach((item) => { item.checked = false; });
    } else {
      extraChecks.filter((item) => item.value === 'Keine').forEach((item) => { item.checked = false; });
    }
  }));

  show();
}
