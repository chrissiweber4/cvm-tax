(()=>{

    const priceCheck=document.querySelector('#priceCheck');
    if(!priceCheck)return;
    const questions=[...priceCheck.querySelectorAll('.question')];
    const next=document.querySelector('#next');
    const back=document.querySelector('#back');
    const submitRequest=document.querySelector('#submitRequest');
    const rentalCount=document.querySelector('#rentalCount');
    const counter=document.querySelector('#counter');
    const progressWrap=document.querySelector('#progressWrap');
    let current=0;
    let lastCalculation=null;
    let editingFromReview=false;
    let sending=false;
    let submitted=false;
    let requestId="";

    const selectedValue=name=>priceCheck.querySelector(`[name="${name}"]:checked`)?.value||'';
    const selectedValues=name=>[...priceCheck.querySelectorAll(`[name="${name}"]:checked`)].map(input=>input.value);
    const euro=value=>`${new Intl.NumberFormat('de-DE').format(value)} €`;
    const rentalSelected=()=>selectedValues('income').includes('Vermietung');
    const marriedSelected=()=>selectedValue('marital')==='Verheiratet';
    const navigation=()=>questions.filter(question=>(rentalSelected()||question.dataset.step!=='rental')&&(marriedSelected()||question.dataset.step!=='assessment'));

    function calculate(){
      const marital=selectedValue('marital');
      const assessment=marital==='Ledig'?'Einzelveranlagung':selectedValue('assessment');
      const situation=selectedValue('situation');
      const income=selectedValues('income');
      const special=selectedValues('special').filter(value=>value!=='Keine besonderen Sachverhalte');
      const items=[];
      let total=0;
      let needsReview=false;
      const declined=special.includes('Selbständige oder gewerbliche Einkünfte');
      if(assessment==='Zusammenveranlagung'){total=299;items.push(['Grundpreis Zusammenveranlagung',299])}
      else if(assessment==='Ich bin unsicher'){total=299;items.push(['Vorläufiger Grundpreis',299]);needsReview=true}
      else if(situation==='Rentner oder Pensionär'){total=179;items.push(['Grundpreis Rentner oder Pensionär',179])}
      else if(situation==='Arbeitnehmer'){total=249;items.push(['Grundpreis Arbeitnehmer',249])}
      else{total=249;items.push(['Vorläufiger Grundpreis',249]);needsReview=true}
      if(income.includes('Vermietung')){
        if(rentalCount.value==='10plus'){needsReview=true}
        else{const count=Number(rentalCount.value);const fee=count*150;total+=fee;items.push([`${count} Vermietungsobjekt${count===1?'':'e'}`,fee])}
      }
      if(income.includes('Kapitaleinkünfte')){total+=49;items.push(['Kapitaleinkünfte',49])}
      if(income.includes('Ausländische Einkünfte')){total+=149;items.push(['Ausländische Einkünfte',149])}
      if(special.length)needsReview=true;
      lastCalculation={total,items,needsReview,declined,special};
      return lastCalculation;
    }

    function renderResult(){
      const result=calculate();
      document.querySelector('#price').innerHTML=result.needsReview?'Individuelle Preisprüfung':`${euro(result.total)} <small>inkl. USt.</small>`;
      document.querySelector('#price').classList.toggle('needs-review',result.needsReview);
      document.querySelector('#priceBreakdown').innerHTML=result.items.map(([label,value])=>`<div class="price-row"><span>${label}</span><strong>${euro(value)}</strong></div>`).join('');
      document.querySelector('#reviewNote').classList.toggle('show',result.needsReview&&!result.declined);
      document.querySelector('#declineNote').classList.toggle('show',result.declined);
      document.querySelector('#resultDisclaimer').hidden=result.declined;
      document.querySelector('#price').hidden=result.declined;
      document.querySelector('#priceBreakdown').hidden=result.declined;
      document.querySelector('#priceHidden').value=result.declined?'Kein Angebot':result.needsReview?`Individuelle Preisprüfung; berechenbare Bestandteile ${euro(result.total)} inklusive Umsatzsteuer`:`${euro(result.total)} inklusive Umsatzsteuer`;
      document.querySelector('#breakdownHidden').value=result.items.map(([label,value])=>`${label}: ${euro(value)}`).join(', ');
      document.querySelector('#reviewHidden').value=result.declined?'Keine Beratung wegen selbständiger oder gewerblicher Einkünfte':result.needsReview?`Ja${result.special.length?`, wegen: ${result.special.join(', ')}`:''}`:'Nein';
      document.querySelector('#contactPrice').textContent=result.needsReview?'Individuelle Preisprüfung':euro(result.total);
      document.querySelector('#contactSummary').textContent=result.needsReview?'Berechenbare Bestandteile: '+euro(result.total)+' inkl. USt.; kein Gesamtpreis':'Unverbindliche Preisindikation inklusive Umsatzsteuer';
    }

    function validationError(step,field,message){
      const error=step.querySelector('.step-error');
      error.textContent=message;error.hidden=false;
      field.setAttribute('aria-invalid','true');
      field.setAttribute('aria-describedby',error.id);
      field.focus();
      return false;
    }

    function clearValidation(step){
      const error=step.querySelector('.step-error');
      if(error){error.textContent='';error.hidden=true;}
      step.querySelectorAll('[aria-invalid]').forEach(field=>{field.removeAttribute('aria-invalid');if(field.getAttribute('aria-describedby')===error?.id)field.removeAttribute('aria-describedby');});
    }

    function validationIssue(step){
      if(step.dataset.step==='income'&&selectedValues('income').length===0)return {field:step.querySelector('[name="income"]'),message:'Bitte wähle deine weiteren Einkünfte oder „Keine weiteren Einkünfte“.'};
      if(step.dataset.step==='special'&&selectedValues('special').length===0)return {field:step.querySelector('[name="special"]'),message:'Bitte wähle einen Sachverhalt oder „Nein, keine besonderen Sachverhalte“.'};
      const required=[...step.querySelectorAll('[required]')];
      const radioNames=[...new Set(required.filter(field=>field.type==='radio').map(field=>field.name))];
      for(const name of radioNames){if(!step.querySelector(`[name="${name}"]:checked`))return {field:step.querySelector(`[name="${name}"]`),message:'Bitte wähle eine Antwort aus.'};}
      for(const field of required.filter(field=>field.type!=='radio')){
        if((field.type!=='checkbox'&&!field.value.trim())||!field.checkValidity())return {field,message:field.type==='email'?'Bitte gib eine gültige E-Mail-Adresse ein.':field.type==='checkbox'?'Bitte bestätige die Kenntnisnahme der Datenschutzhinweise.':'Bitte gib deinen Namen ein.'};
      }
      if(step.dataset.step==='rental'&&!rentalCount.value)return {field:rentalCount,message:'Bitte wähle die Anzahl der Vermietungsobjekte.'};
      return null;
    }
    function validateStep(step=questions[current]){
      clearValidation(step);
      const issue=validationIssue(step);
      return issue?validationError(step,issue.field,issue.message):true;
    }
    function firstIncomplete(){
      return navigation().find(step=>!['result','review'].includes(step.dataset.step)&&validationIssue(step));
    }
    function goToStep(name){current=questions.findIndex(step=>step.dataset.step===name);showStep(true);}
    function returnToReview(){
      const incomplete=firstIncomplete();
      if(incomplete){goToStep(incomplete.dataset.step);return;}
      renderResult();
      if(lastCalculation.declined){editingFromReview=false;goToStep('result');return;}
      editingFromReview=false;goToStep('review');
    }
    function summaryRow(container,label,value,step,field){
      const row=document.createElement('div'),term=document.createElement('dt'),description=document.createElement('dd'),text=document.createElement('span'),edit=document.createElement('button');
      term.textContent=label;text.textContent=value;edit.type='button';edit.className='summary-edit';edit.textContent='Ändern';edit.setAttribute('aria-label',label+' ändern');
      edit.addEventListener('click',()=>{editingFromReview=true;goToStep(step);if(field)priceCheck.querySelector(field)?.focus();});
      description.append(text,edit);row.append(term,description);container.append(row);
    }
    function renderSummary(){
      renderResult();
      document.querySelector('#reviewPrice').textContent=document.querySelector('#contactPrice').textContent;
      document.querySelector('#reviewPriceNote').textContent=document.querySelector('#contactSummary').textContent;
      const tax=document.querySelector('#taxSummary'),contact=document.querySelector('#detailsSummary');tax.replaceChildren();contact.replaceChildren();
      summaryRow(tax,'Steuerjahr',selectedValue('year'),'year');
      summaryRow(tax,'Familienstand',selectedValue('marital'),'marital');
      summaryRow(tax,'Veranlagung',marriedSelected()?selectedValue('assessment'):'Einzelveranlagung',marriedSelected()?'assessment':'marital');
      summaryRow(tax,'Persönliche Situation',selectedValue('situation'),'situation');
      summaryRow(tax,'Weitere Einkünfte',selectedValues('income').join(', '),'income');
      if(rentalSelected())summaryRow(tax,'Vermietungsobjekte',rentalCount.value==='10plus'?'10 oder mehr':rentalCount.value,'rental');
      summaryRow(tax,'Besondere Sachverhalte',selectedValues('special').join(', '),'special');
      summaryRow(contact,'Name',document.querySelector('#priceName').value.trim(),'contact','#priceName');
      summaryRow(contact,'E-Mail',document.querySelector('#priceEmail').value.trim(),'contact','#priceEmail');
      summaryRow(contact,'Telefon',document.querySelector('#pricePhone').value.trim()||'Nicht angegeben','contact','#pricePhone');
      summaryRow(contact,'Dein Hinweis',document.querySelector('#priceMessage').value.trim()||'Nicht angegeben','contact','#priceMessage');
    }
    priceCheck.addEventListener('input',event=>{const step=event.target.closest('.question');if(step)clearValidation(step);});

    function showStep(moveFocus=false){
      const activeNavigation=navigation();
      if(questions[current]?.dataset.step==='rental'&&!rentalSelected())current=questions.findIndex(question=>question.dataset.step==='special');
      questions.forEach((question,index)=>{const active=index===current;question.hidden=!active;question.classList.toggle('active',active);question.setAttribute('aria-hidden',String(!active))});
      const position=activeNavigation.indexOf(questions[current]);
      counter.textContent=`Schritt ${position+1} von ${activeNavigation.length}`;
      document.querySelector('#progress').style.width=`${((position+1)/activeNavigation.length)*100}%`;
      progressWrap.setAttribute('aria-valuenow',String(position+1));progressWrap.setAttribute('aria-valuemax',String(activeNavigation.length));
      back.disabled=position===0;
      const stepName=questions[current].dataset.step;
      if(stepName==='result')renderResult();
      if(stepName==='review')renderSummary();
      const declined=stepName==='result'&&lastCalculation?.declined;
      next.hidden=stepName==='review'||declined;
      submitRequest.hidden=stepName!=='review';
      next.dataset.mode=stepName==='result'?'request':'';
      next.textContent=editingFromReview?'Änderung übernehmen':stepName==='contact'?'Angaben prüfen':stepName==='special'?'Preis anzeigen':stepName==='result'?'Mit diesen Angaben anfragen':'Weiter';
      if(moveFocus){const heading=questions[current].querySelector('h3');if(heading){heading.focus({preventScroll:true});heading.scrollIntoView({block:'start',behavior:'instant'});}}
    }

    function configureExclusive(name,noneSelector){
      const boxes=[...priceCheck.querySelectorAll(`[name="${name}"]`)];const none=priceCheck.querySelector(noneSelector);
      boxes.forEach(box=>box.addEventListener('change',()=>{if(!box.checked)return;if(box===none)boxes.filter(item=>item!==box).forEach(item=>item.checked=false);else none.checked=false;if(name==='income'&&!rentalSelected())rentalCount.value=''}));
    }

    next.addEventListener('click',()=>{if(!validateStep())return;if(editingFromReview){returnToReview();return;}const activeNavigation=navigation();const position=activeNavigation.indexOf(questions[current]);if(position<activeNavigation.length-1){current=questions.indexOf(activeNavigation[position+1]);showStep(true)}});
    back.addEventListener('click',()=>{editingFromReview=false;const activeNavigation=navigation();const position=activeNavigation.indexOf(questions[current]);if(position>0){current=questions.indexOf(activeNavigation[position-1]);showStep(true)}});
    configureExclusive('income','[data-none-income]');configureExclusive('special','[data-none-special]');
    priceCheck.querySelectorAll('[name="marital"]').forEach(input=>input.addEventListener('change',()=>{if(input.value==='Ledig'&&input.checked)priceCheck.querySelectorAll('[name="assessment"]').forEach(field=>field.checked=false)}));

    // Form.taxi accepts public form submissions; no credentials belong in this client.
    priceCheck.addEventListener('submit',async event=>{
      event.preventDefault();
      if(sending||submitted)return;
      if(questions[current].dataset.step!=='review'){if(!next.hidden)next.click();return;}
      const incomplete=firstIncomplete();if(incomplete){editingFromReview=true;goToStep(incomplete.dataset.step);validateStep();return;}
      if(calculate().declined){editingFromReview=false;goToStep('result');return;}
      if(!validateStep())return;
      renderResult();
      const status=document.querySelector('#formStatus');
      const endpoint=priceCheck.dataset.endpoint;
      if(endpoint!=='https://form.taxi/s/lyr0k88l'){status.textContent='Der Anfrageversand ist nicht eingerichtet. Bitte schreibe an info@cvm-tax.de.';status.classList.add('error');status.focus();return;}
      if(!requestId)requestId='CVM-'+crypto.randomUUID();
      const payload=new FormData();
      const values={
        'Anfrageart':'Beratungsanfrage – Einkommensteuer',
        'Quelle':'CVM TAX · Sage Glacier',
        'Anfragekennung':requestId,
        '_subject':'CVM TAX · Beratungsanfrage · '+requestId,
        '_lang':'de',
        'Steuerjahr':selectedValue('year'),
        'Familienstand':selectedValue('marital'),
        'Veranlagung':marriedSelected()?selectedValue('assessment'):'Einzelveranlagung',
        'Persönliche Situation':selectedValue('situation'),
        'Weitere Einkünfte':selectedValues('income').join(', '),
        'Vermietungsobjekte':rentalSelected()?(rentalCount.value==='10plus'?'10 oder mehr':rentalCount.value):'Keine',
        'Besondere Sachverhalte':selectedValues('special').join(', '),
        'name':document.querySelector('#priceName').value.trim(),
        'email':document.querySelector('#priceEmail').value.trim(),
        'Telefon':document.querySelector('#pricePhone').value.trim(),
        'Nachricht':document.querySelector('#priceMessage').value.trim(),
        'Preisindikation':document.querySelector('#priceHidden').value,
        'Preisaufschlüsselung':document.querySelector('#breakdownHidden').value,
        'Manuelle Prüfung':document.querySelector('#reviewHidden').value,
        'Datenschutz zur Kenntnis genommen':'Ja',
        '_gotcha':priceCheck.querySelector('[name="_gotcha"]').value
      };
      Object.entries(values).forEach(([name,value])=>payload.set(name,value));
      sending=true;submitRequest.disabled=true;back.disabled=true;
      document.querySelector('#questions').inert=true;
      priceCheck.setAttribute('aria-busy','true');
      submitRequest.textContent='Wird gesendet …';status.textContent='Deine Anfrage wird übermittelt …';status.classList.remove('error');
      const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),45000);
      try{
        const response=await fetch(endpoint,{method:'POST',body:payload,headers:{Accept:'application/json'},signal:controller.signal,credentials:'omit'});
        const result=await response.json().catch(()=>null);
        if(!response.ok||result?.success!==true)throw new Error('submission-unconfirmed');
        submitted=true;
        priceCheck.querySelectorAll('.question,.calc-nav,.wizard-head,.calc-progress,.form-status').forEach(element=>element.hidden=true);
        const success=document.querySelector('#success');success.classList.add('show');success.focus();
      }catch(error){
        status.textContent='Der Versand konnte nicht bestätigt werden. Deine Angaben bleiben erhalten. Bitte prüfe vor einem erneuten Versuch, ob bereits eine Bestätigung vorliegt, oder schreibe an info@cvm-tax.de.';
        status.classList.add('error');status.focus();
      }finally{
        clearTimeout(timeout);sending=false;submitRequest.disabled=false;back.disabled=false;
        document.querySelector('#questions').inert=false;priceCheck.removeAttribute('aria-busy');
        submitRequest.textContent='Unverbindliche Anfrage senden';
      }
    });

    document.querySelector('#restartPreview').addEventListener('click',()=>{
      if(sending)return;
      priceCheck.reset();editingFromReview=false;lastCalculation=null;submitted=false;requestId="";
      const status=document.querySelector("#formStatus");status.textContent="";status.classList.remove("error");
      document.querySelector('#requestDetails').open=false;
      questions.forEach(clearValidation);
      document.querySelectorAll('#priceHidden,#breakdownHidden,#reviewHidden').forEach(field=>field.value='');
      document.querySelector('#taxSummary').replaceChildren();document.querySelector('#detailsSummary').replaceChildren();
      document.querySelector('#success').classList.remove('show');
      priceCheck.querySelectorAll('.calc-nav,.wizard-head,.calc-progress,.form-status').forEach(element=>element.hidden=false);
      goToStep('year');
    });
showStep();
})();
    const revealElements=[...document.querySelectorAll('.reveal')];
    if('IntersectionObserver' in window){
      const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in');observer.unobserve(entry.target)}}),{threshold:.12,rootMargin:'0px 0px -8%'});
      revealElements.forEach(element=>observer.observe(element));
    }else revealElements.forEach(element=>element.classList.add('in'));
    const pageHeader=document.querySelector('.nav');
    let headerTicking=false;
    const syncHeader=()=>{pageHeader.classList.toggle('is-compact',window.scrollY>28);headerTicking=false};
    addEventListener('scroll',()=>{if(!headerTicking){requestAnimationFrame(syncHeader);headerTicking=true}},{passive:true});syncHeader();
    const articleDialog=document.querySelector('#articleDialog');
    const articleContent=document.querySelector('#articleContent');
    document.querySelectorAll('[data-article]').forEach(link=>link.addEventListener('click',event=>{
      event.preventDefault();
      const template=document.querySelector(`#article-${link.dataset.article}`);
      if(!template)return;
      articleContent.innerHTML=template.innerHTML;
      articleContent.scrollTop=0;
      articleDialog.showModal();
    }));
    document.querySelector('#closeArticle').addEventListener('click',()=>articleDialog.close());
    articleContent.addEventListener('click',event=>{if(event.target.closest('[data-close-article]'))articleDialog.close()});
    articleDialog.addEventListener('click',event=>{if(event.target===articleDialog)articleDialog.close()});
    const legal={"impressum": "<p class=\"section-kicker\">Rechtlicher Entwurf · noch unvollständig</p><h2 id=\"legalDialogTitle\">Impressum</h2><h3>Anbieter</h3><p>CVM TAX GbR<br>Schillinger Weg 35<br>54421 Reinsfeld</p><h3>Vertreten durch</h3><p>Christopher Weber, Steuerberater<br>Vanessa Degner, Steuerberaterin</p><h3>Kontakt</h3><p>E-Mail: <a href=\"mailto:info@cvm-tax.de\">info@cvm-tax.de</a><br>Telefon: noch zu ergänzen</p><h3>Zuständige Steuerberaterkammer</h3><p>Steuerberaterkammer Rheinland-Pfalz<br>Hölderlinstraße 1<br>55131 Mainz<br><a href=\"https://www.sbk-rlp.de/\" target=\"_blank\" rel=\"noopener\">www.sbk-rlp.de</a></p><h3>Berufsbezeichnungen und Berufsrecht</h3><p>Steuerberater / Steuerberaterin. Die Berufsbezeichnungen wurden in Deutschland verliehen.</p><p>Steuerberatungsgesetz (StBerG), Durchführungsverordnung zum Steuerberatungsgesetz (DVStB), Berufsordnung der Bundessteuerberaterkammer (BOStB) und Steuerberatervergütungsverordnung (StBVV). Die aktuellen Fassungen und Verlinkungen werden vor Veröffentlichung ergänzt.</p><h3>Berufshaftpflichtversicherung</h3><p>Allianz. Die genaue Versicherergesellschaft, ihre Anschrift und der räumliche Geltungsbereich gemäß Versicherungspolice sind noch zu ergänzen.</p><p>Ein Eintrag im Gesellschaftsregister besteht nicht. Eine Umsatzsteuer-Identifikationsnummer ist nach Angabe der Kanzlei nicht vorhanden.</p><p>Dieser Entwurf ist noch nicht zur Veröffentlichung freigegeben.</p>", "datenschutz": "<p class=\"section-kicker\">Rechtlicher Entwurf · noch unvollständig</p><h2 id=\"legalDialogTitle\">Datenschutz</h2><h3>Verantwortlicher</h3><p>CVM TAX GbR<br>Schillinger Weg 35<br>54421 Reinsfeld<br>E-Mail: <a href=\"mailto:info@cvm-tax.de\">info@cvm-tax.de</a><br>Vertreten durch Christopher Weber und Vanessa Degner.</p><h3>Anfrageversand über Form.taxi</h3><p>Beim Absenden deiner Anfrage werden deine Angaben an Form.taxi zur Bearbeitung durch CVM TAX übermittelt. Empfängerpostfach der Kanzlei ist info@cvm-tax.de. Bitte übermittelst du keine Steuerunterlagen, Steueridentifikationsnummern oder Zugangsdaten.</p><h3>Für den Livebetrieb bestätigt</h3><p>Die öffentliche Website soll weiterhin über GitHub Pages bereitgestellt werden. Für die Bearbeitung von Beratungsanfragen soll weiterhin Form.taxi eingesetzt werden. Der Anfrageversand über Form.taxi ist in dieser Arbeitskopie angebunden. Die tatsächliche Zustellung wird gesondert geprüft.</p><h3>Unterlagenübergabe</h3><p>Nach der Mandatsannahme erhalten Mandanten per E-Mail einen Link zur eigenen Web-App der Kanzlei. Für deren Datenverarbeitung sind gesonderte Datenschutzhinweise vorzubereiten. Bitte keine Steuerunterlagen über das öffentliche Anfrageformular übermitteln.</p><h3>Vor Veröffentlichung zu vervollständigen</h3><p>Die vollständigen Hinweise zu Hosting, Formularverarbeitung, E-Mail-Dienst, Rechtsgrundlagen, Empfängern, möglichen Drittlandübermittlungen, Aufbewahrung, Betroffenenrechten und zuständiger Aufsichtsbehörde werden anhand der tatsächlichen Konfiguration geprüft und ergänzt. Dieser Entwurf ist noch nicht zur Veröffentlichung freigegeben.</p>"};
    document.querySelectorAll('[data-modal]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();document.querySelector('#legalContent').innerHTML=legal[a.dataset.modal];document.querySelector('#legalDialog').showModal()}));document.querySelector('#closeDialog').addEventListener('click',()=>document.querySelector('#legalDialog').close());
    document.querySelector('#year').textContent=new Date().getFullYear();
  
    // Reserve space below the actual fixed navigation, including larger text settings.
    const glassNavigation=document.querySelector('.nav');
    const reserveNavigationSpace=()=>{const bottom=glassNavigation.offsetTop+glassNavigation.offsetHeight;document.documentElement.style.setProperty('--nav-clearance',`${Math.ceil(bottom+44)}px`);document.documentElement.style.setProperty('--nav-menu-top',`${Math.ceil(bottom+12)}px`);};
    reserveNavigationSpace();
    if('ResizeObserver' in window)new ResizeObserver(reserveNavigationSpace).observe(glassNavigation);
    addEventListener('resize',reserveNavigationSpace,{passive:true});
  
const treeToggle=document.querySelector('.tree-toggle');
const siteTree=document.querySelector('#site-tree');
function toggleTree(open,restoreFocus=false){siteTree.hidden=!open;treeToggle.setAttribute('aria-expanded',String(open));treeToggle.setAttribute('aria-label',open?'Navigation schließen':'Navigation öffnen');if(restoreFocus)treeToggle.focus();}
treeToggle.addEventListener('click',()=>toggleTree(siteTree.hidden));
document.addEventListener('click',event=>{if(!siteTree.hidden&&!siteTree.contains(event.target)&&!treeToggle.contains(event.target))toggleTree(false);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!siteTree.hidden){event.preventDefault();toggleTree(false,true);}});
siteTree.addEventListener('click',event=>{if(event.target.closest('a'))toggleTree(false);});
