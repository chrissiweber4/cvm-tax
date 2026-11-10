(()=>{

    const priceCheck=document.querySelector('#priceCheck');
    if(!priceCheck)return;
    const questions=[...priceCheck.querySelectorAll('.question')];
    const next=document.querySelector('#next');
    const back=document.querySelector('#back');
    const submitRequest=document.querySelector('#submitRequest');
    const rentalCount=document.querySelector('#rentalCount');
    const rentalExactField=document.querySelector('#rentalExactField');
    const rentalExactCount=document.querySelector('#rentalExactCount');
    const otherSpecialField=document.querySelector('#otherSpecialField');
    const otherSpecialDetails=document.querySelector('#otherSpecialDetails');
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
    const rentalObjectCount=()=>Number(rentalCount.value==='10plus'?rentalExactCount.value:rentalCount.value);
    function syncRentalExact(){
      const exact=rentalSelected()&&rentalCount.value==='10plus';
      rentalExactField.hidden=!exact;
      rentalExactCount.disabled=!exact;
    }
    const otherSpecialSelected=()=>selectedValues('special').includes('Sonstiger besonderer Sachverhalt');
    const otherSpecialDescription=()=>otherSpecialSelected()?otherSpecialDetails.value.trim():'';
    function syncOtherSpecial(){
      const selected=otherSpecialSelected();
      otherSpecialField.hidden=!selected;
      otherSpecialDetails.disabled=!selected;
      priceCheck.querySelector('[data-other-special]').setAttribute('aria-expanded',String(selected));
    }
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
        const count=rentalObjectCount();const fee=count*300;total+=fee;items.push([`${count} Vermietungsobjekt${count===1?'':'e'}`,fee]);
        if(count>=10)needsReview=true;
      }
      if(income.includes('Kapitaleinkünfte')){total+=49;items.push(['Kapitaleinkünfte',49])}
      if(income.includes('Ausländische Einkünfte')){total+=149;items.push(['Ausländische Einkünfte',149])}
      if(special.length){needsReview=true;if(!declined){total+=500;items.push(['Besondere Sachverhalte – einmalig je Anfrage',500])}}
      lastCalculation={total,items,needsReview,declined,special};
      return lastCalculation;
    }

    function renderResult(){
      const result=calculate();
      document.querySelector('.result-heading').textContent=result.declined?'Für diese Auswahl bieten wir keinen Preischeck an.':'Dein Ergebnis. Deine Entscheidung.';
      document.querySelector('#price').innerHTML=`${euro(result.total)} <small>inkl. USt.</small>`;
      document.querySelector('#reviewNote').classList.toggle('show',!result.declined);
      document.querySelector('#declineNote').classList.toggle('show',result.declined);
      document.querySelector('#price').hidden=result.declined;
      document.querySelector('#priceHidden').value=result.declined?'Kein Angebot':`${euro(result.total)} inklusive Umsatzsteuer; unverbindliche Preisindikation, persönliche Prüfung ausstehend`;
      document.querySelector('#reviewHidden').value=result.declined?'Keine Beratung wegen selbständiger oder gewerblicher Einkünfte':result.needsReview?`Ja${result.special.length?`, wegen: ${result.special.join(', ')}`:''}`:'Ja – Preis und Leistungsumfang vor Beauftragung bestätigen';
      document.querySelector('#contactPrice').textContent=euro(result.total);
      document.querySelector('#contactSummary').textContent='Unverbindliche Preisindikation inklusive Umsatzsteuer · persönliche Prüfung ausstehend';
    }

    function validationError(step,field,message){
      const error=step.querySelector('.step-error');
      error.textContent=message;error.hidden=false;
      field.setAttribute('aria-invalid','true');
      const describe=node=>node.setAttribute('aria-describedby',[...new Set((node.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean).concat(error.id))].join(' '));
      describe(field);const group=field.closest('[role="radiogroup"],[role="group"]');if(group){group.setAttribute('aria-invalid','true');describe(group);}
      field.focus();
      return false;
    }

    function clearValidation(step){
      const error=step.querySelector('.step-error');
      if(error){error.textContent='';error.hidden=true;}
      step.querySelectorAll('[aria-invalid]').forEach(field=>{field.removeAttribute('aria-invalid');const remaining=(field.getAttribute('aria-describedby')||'').split(/\s+/).filter(id=>id&&id!==error?.id);if(remaining.length)field.setAttribute('aria-describedby',remaining.join(' '));else field.removeAttribute('aria-describedby');});
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
      if(step.dataset.step==='rental'&&rentalCount.value==='10plus'&&(!rentalExactCount.value||!Number.isSafeInteger(rentalObjectCount())||rentalObjectCount()<10||!Number.isSafeInteger(rentalObjectCount()*300+10000)))return {field:rentalExactCount,message:'Bitte gib die genaue Anzahl ab 10 als ganze Zahl ein.'};
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
      if(field==='#otherSpecialDetails')text.className='special-description-summary';
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
      if(rentalSelected())summaryRow(tax,'Vermietungsobjekte',String(rentalObjectCount()),'rental');
      summaryRow(tax,'Besondere Sachverhalte',selectedValues('special').join(', '),'special');
      if(otherSpecialDescription())summaryRow(tax,'Beschreibung des Sachverhalts',otherSpecialDescription(),'special','#otherSpecialDetails');
      summaryRow(contact,'Name',document.querySelector('#priceName').value.trim(),'contact','#priceName');
      summaryRow(contact,'E-Mail',document.querySelector('#priceEmail').value.trim(),'contact','#priceEmail');
      summaryRow(contact,'Telefon',document.querySelector('#pricePhone').value.trim()||'Nicht angegeben','contact','#pricePhone');
      summaryRow(contact,'Dein Hinweis',document.querySelector('#priceMessage').value.trim()||'Nicht angegeben','contact','#priceMessage');
    }
    priceCheck.addEventListener('input',event=>{const step=event.target.closest('.question');if(step)clearValidation(step);});
    priceCheck.addEventListener('change',event=>{if(event.target.name==='special')syncOtherSpecial();if(event.target===rentalCount||event.target.name==='income')syncRentalExact();});

    function showStep(moveFocus=false){
      syncOtherSpecial();
      syncRentalExact();
      const activeNavigation=navigation();
      if(questions[current]?.dataset.step==='rental'&&!rentalSelected())current=questions.findIndex(question=>question.dataset.step==='special');
      questions.forEach((question,index)=>{const active=index===current;question.hidden=!active;question.classList.toggle('active',active);question.setAttribute('aria-hidden',String(!active))});
      const position=activeNavigation.indexOf(questions[current]);
      counter.textContent=`Schritt ${position+1} von ${activeNavigation.length}`;
      document.querySelector('#progress').style.width=`${((position+1)/activeNavigation.length)*100}%`;
      progressWrap.setAttribute('aria-valuenow',String(position+1));progressWrap.setAttribute('aria-valuemax',String(activeNavigation.length));
      back.disabled=position===0;
      const stepName=questions[current].dataset.step;
      const stepNames={year:'Steuerjahr',marital:'Familienstand',assessment:'Veranlagung',situation:'Persönliche Situation',income:'Weitere Einkünfte',rental:'Vermietungsobjekte',special:'Besondere Sachverhalte',result:'Preisindikation',contact:'Kontaktdaten',review:'Prüfen und senden'};
      progressWrap.setAttribute('aria-valuetext',`${stepNames[stepName]||stepName}: Schritt ${position+1} von ${activeNavigation.length}`);
      if(stepName==='result')renderResult();
      if(stepName==='review')renderSummary();
      const declined=stepName==='result'&&lastCalculation?.declined;
      next.hidden=stepName==='review'||declined;
      submitRequest.hidden=stepName!=='review';
      next.dataset.mode=stepName==='result'?'request':'';
      next.textContent=editingFromReview?'Änderung übernehmen':stepName==='contact'?'Angaben prüfen':stepName==='special'?'Preis anzeigen':stepName==='result'?'Mit diesen Angaben anfragen':'Weiter';
      if(moveFocus){
        const heading=questions[current].querySelector('h3');
        if(heading){
          heading.focus({preventScroll:true});
          // Keep visible questions in place; reveal only a heading outside the usable viewport.
          const viewport=window.visualViewport;
          const top=Math.max(viewport?.offsetTop||0,document.querySelector('.nav')?.getBoundingClientRect().bottom||0)+16;
          const bottom=(viewport?.offsetTop||0)+(viewport?.height||innerHeight)-16;
          const bounds=heading.getBoundingClientRect();
          if(bounds.top<top||bounds.top>=bottom){
            window.scrollBy({top:bounds.top-top,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
          }
        }
      }
    }

    function configureExclusive(name,noneSelector){
      const boxes=[...priceCheck.querySelectorAll(`[name="${name}"]`)];const none=priceCheck.querySelector(noneSelector);
      boxes.forEach(box=>box.addEventListener('change',()=>{if(!box.checked)return;if(box===none)boxes.filter(item=>item!==box).forEach(item=>item.checked=false);else none.checked=false;if(name==='income'&&!rentalSelected())rentalCount.value=''}));
    }

    next.addEventListener('click',()=>{if(!validateStep())return;if(editingFromReview){returnToReview();return;}const activeNavigation=navigation();const position=activeNavigation.indexOf(questions[current]);if(position<activeNavigation.length-1){current=questions.indexOf(activeNavigation[position+1]);showStep(true)}});
    back.addEventListener('click',()=>{editingFromReview=false;const activeNavigation=navigation();const position=activeNavigation.indexOf(questions[current]);if(position>0){current=questions.indexOf(activeNavigation[position-1]);showStep(true)}});
    priceCheck.querySelector('[data-decline-revise]').addEventListener('click',()=>goToStep('special'));
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
      if(['127.0.0.1','localhost','::1','[::1]'].includes(location.hostname)||location.protocol==='file:'){status.textContent='Lokale Vorschau: Es wurde keine Anfrage versendet. Deine Angaben bleiben zur Prüfung sichtbar.';status.classList.add('error');status.focus();return;}
      if(navigator.onLine===false){status.textContent='Du bist offline. Bitte stelle die Verbindung wieder her und sende deine Anfrage danach erneut.';status.classList.add('error');status.focus();return;}
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
        'Vermietungsobjekte':rentalSelected()?String(rentalObjectCount()):'Keine',
        'Besondere Sachverhalte':selectedValues('special').join(', '),
        'Beschreibung des Sachverhalts':otherSpecialDescription(),
        'name':document.querySelector('#priceName').value.trim(),
        'email':document.querySelector('#priceEmail').value.trim(),
        'Telefon':document.querySelector('#pricePhone').value.trim(),
        'Nachricht':document.querySelector('#priceMessage').value.trim(),
        'Preisindikation':document.querySelector('#priceHidden').value,
        'Preisaufschlüsselung':lastCalculation.items.map(([label,value])=>`${label}: ${euro(value)}`).join(', '),
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
      document.querySelectorAll('#priceHidden,#reviewHidden').forEach(field=>field.value='');
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
    const legal={"impressum": "<h2 id=\"legalDialogTitle\">Impressum</h2>\n<h3>Anbieter und Vertretung</h3>\n<p>CVM TAX GbR<br>Schillinger Weg 35<br>54421 Reinsfeld<br>Deutschland</p>\n<p>Vertreten durch die Gesellschafter:<br>Christopher Weber, Steuerberater<br>Vanessa Degner, Steuerberaterin</p>\n<h3>Kontakt</h3>\n<p>Telefon: <a href=\"tel:+491721734962\">0172 1734962</a><br>E-Mail: <a href=\"mailto:info@cvm-tax.de\">info@cvm-tax.de</a></p>\n<h3>Berufsbezeichnungen und zuständige Kammer</h3>\n<p>Die gesetzlichen Berufsbezeichnungen „Steuerberater“ und „Steuerberaterin“ wurden in der Bundesrepublik Deutschland verliehen.</p>\n<p>Zuständige Berufskammer und berufsrechtliche Aufsicht:<br>Steuerberaterkammer Rheinland-Pfalz<br>Hölderlinstraße 1<br>55131 Mainz<br><a href=\"https://www.sbk-rlp.de/\" target=\"_blank\" rel=\"noopener noreferrer\">www.sbk-rlp.de</a></p>\n<h3>Berufsrechtliche Regelungen</h3>\n<ul>\n<li><a href=\"https://www.gesetze-im-internet.de/stberg/\" target=\"_blank\" rel=\"noopener noreferrer\">Steuerberatungsgesetz (StBerG)</a></li>\n<li>Durchführungsverordnung zum Steuerberatungsgesetz (DVStB)</li>\n<li>Berufsordnung der Bundessteuerberaterkammer (BOStB)</li>\n<li><a href=\"https://www.gesetze-im-internet.de/stbgebv/\" target=\"_blank\" rel=\"noopener noreferrer\">Steuerberatervergütungsverordnung (StBVV)</a></li>\n</ul>\n<p>Die berufsrechtlichen Regelungen sind über die <a href=\"https://www.bstbk.de/de/themen/berufsrecht\" target=\"_blank\" rel=\"noopener noreferrer\">Bundessteuerberaterkammer, Rubrik Berufsrecht</a>, zugänglich.</p>\n<h3>Berufshaftpflichtversicherung</h3>\n<p>Allianz Versicherungs-Aktiengesellschaft<br>Königinstraße 28<br>80802 München<br>Deutschland</p>\n<p>Es besteht eine Vermögensschaden-Haftpflichtversicherung für Berufsausübungsgesellschaften von Steuerberatern.</p>\n<p><strong>Räumlicher Geltungsbereich:</strong> Der Versicherungsschutz umfasst die berufliche Tätigkeit in Deutschland. Für Haftpflichtansprüche mit Auslandsbezug gelten die Regelungen in Teil 3, § 26 I der Allgemeinen und Besonderen Versicherungsbedingungen zur Vermögensschaden-Haftpflichtversicherung für Rechtsanwälte, Patentanwälte und Steuerberater (AVB-RS).</p>\n<p>Die dort vorgesehenen Ausschlüsse für Ansprüche vor ausländischen Gerichten und aus der Verletzung oder Nichtbeachtung ausländischen Rechts gelten nicht für das europäische Ausland, die Türkei, die Russische Föderation und die sonstigen Staaten der ehemaligen Sowjetunion.</p>\n<p>Für das Abgabenrecht weiterer Staaten besteht unter den Voraussetzungen von § 26 I Nr. 3 AVB-RS ebenfalls Versicherungsschutz, wenn dem Auftrag ausschließlich deutsches Recht zugrunde liegt; die Leistung ist in diesen Fällen auf das Vierfache der gesetzlich vorgeschriebenen Mindestversicherungssumme begrenzt. Tätigkeiten über Niederlassungen, Zweigniederlassungen oder weitere Beratungsstellen im Ausland sind ohne besondere Vereinbarung nicht eingeschlossen.</p>\n<h3>Register und Identifikationsnummern</h3>\n<p>Die Gesellschaft ist nicht im Gesellschaftsregister eingetragen. Eine Umsatzsteuer-Identifikationsnummer und eine Wirtschafts-Identifikationsnummer sind nicht vorhanden.</p>\n<h3>Verbraucherstreitbeilegung</h3>\n<p>Wir sind weder bereit noch verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>", "datenschutz": "<h2 id=\"legalDialogTitle\">Datenschutzhinweise</h2>\n<p>Hier erfährst du, welche personenbezogenen Daten beim Besuch unserer Website, bei einer Beratungsanfrage und bei der digitalen Kommunikation mit CVM TAX verarbeitet werden.</p>\n<h3>1. Verantwortlicher und Kontakt</h3>\n<p>CVM TAX GbR<br>Schillinger Weg 35<br>54421 Reinsfeld<br>Deutschland</p>\n<p>Vertreten durch Christopher Weber und Vanessa Degner.<br>Telefon: <a href=\"tel:+491721734962\">0172 1734962</a><br>E-Mail: <a href=\"mailto:info@cvm-tax.de\">info@cvm-tax.de</a></p>\n<p>Für Fragen zum Datenschutz und zur Ausübung deiner Rechte kannst du uns über diese Kontaktdaten erreichen.</p>\n<h3>2. Bereitstellung der Website über GitHub Pages</h3>\n<p>Unsere öffentliche Website wird über GitHub Pages bereitgestellt. Beim Aufruf erhält der Hostingdienst technisch erforderliche Verbindungsdaten, insbesondere die IP-Adresse. GitHub dokumentiert, dass Besucher-IP-Adressen zu Sicherheitszwecken protokolliert und gespeichert werden.</p>\n<p>Die Bereitstellung und Absicherung der Website erfolgt auf Grundlage unseres berechtigten Interesses an einem funktionsfähigen und sicheren Internetauftritt, Art. 6 Abs. 1 Buchst. f DSGVO.</p>\n<p>GitHub nennt als verantwortliche Unternehmen GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA, und GitHub B.V., Prins Bernhardplein 200, 1097 JB Amsterdam, Niederlande. Es können Daten außerhalb des Europäischen Wirtschaftsraums, insbesondere in den USA, verarbeitet werden. GitHub erläutert als Übermittlungsgrundlagen insbesondere die EU-Standardvertragsklauseln und das EU-US Data Privacy Framework.</p>\n<p>Die Angaben von GitHub zu Datenverarbeitung, Empfängern, Übermittlungen und Speicherung findest du in den <a href=\"https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement\" target=\"_blank\" rel=\"noopener noreferrer\">GitHub-Datenschutzbestimmungen</a>.</p>\n<h3>3. Preischeck und Beratungsanfrage</h3>\n<p>Im Preischeck werden deine Angaben zunächst im Browser verarbeitet. Dabei können insbesondere Steuerjahr, Familienstand, Veranlagungsart, persönliche Situation, Einkunftsarten, Anzahl der Vermietungsobjekte und besondere Sachverhalte berücksichtigt werden. Eine freiwillige Beschreibung des besonderen Sachverhalts ergänzt deine Auswahl.</p>\n<p>Aus den Angaben entsteht automatisiert eine unverbindliche Preisindikation. Die Auswahl einzelner Antworten sendet noch keine Beratungsanfrage. Erst wenn du die Anfrage ausdrücklich absendest, werden deine steuerlichen Angaben, die Preisindikation und die Kontaktdaten an den eingesetzten Formulardienst übermittelt. Für eine Anfrage benötigen wir deinen Namen und deine E-Mail-Adresse. Telefonnummer und ergänzende Freitexte sind optional.</p>\n<p>Wir verwenden die Angaben, um deine Anfrage zu bearbeiten, den möglichen Leistungsumfang zu prüfen und mit dir Kontakt aufzunehmen. Rechtsgrundlage ist Art. 6 Abs. 1 Buchst. b DSGVO bei vorvertraglichen Maßnahmen auf deine Anfrage. Soweit die Kommunikation einem anderen Anliegen dient, ist Grundlage unser berechtigtes Interesse an dessen Bearbeitung nach Art. 6 Abs. 1 Buchst. f DSGVO. Ohne die erforderlichen Angaben ist eine Bearbeitung über das Formular nicht möglich; du kannst uns alternativ telefonisch oder per E-Mail kontaktieren.</p>\n<p>Eine Mandatsannahme oder eine Entscheidung mit rechtlicher oder vergleichbar erheblicher Wirkung erfolgt nicht ausschließlich automatisiert durch den Preischeck. Wir prüfen deinen Fall persönlich.</p>\n<h3>4. Formularübermittlung über Form.taxi</h3>\n<p>Für den technischen Empfang und die Zustellung der Anfrage verwenden wir Form.taxi, betrieben von wrkt*biz Reinhard Söllradl, 4070 Eferding, Österreich. Empfängerpostfach bei CVM TAX ist <a href=\"mailto:info@cvm-tax.de\">info@cvm-tax.de</a>. Neben den Formularinhalten verarbeitet Form.taxi nach seinen Angaben IP-Adresse, Browserkennung sowie Datum und Uhrzeit zur Zustellung, Spam-Abwehr und Nachvollziehbarkeit.</p>\n<p>Form.taxi handelt für diese Formularverarbeitung als Auftragsverarbeiter. Nach Anbieterangaben erfolgt die Verarbeitung der Formularsendungen grundsätzlich in der Europäischen Union; für Hosting und E-Mail-Zustellung werden Unterauftragnehmer eingesetzt. Die weitere Verarbeitung der zugestellten Nachricht in unserem Microsoft-365-Postfach ist davon zu unterscheiden.</p>\n<p>Form.taxi nennt für das Sendungsarchiv eine Aufbewahrung von höchstens einem Jahr und für als Spam eingestufte Sendungen einen Monat. Die Aufbewahrung der bei CVM TAX eingegangenen Nachrichten richtet sich nach Abschnitt 7. Weitere Anbieterinformationen: <a href=\"https://docs.form.taxi/de/privacy\" target=\"_blank\" rel=\"noopener noreferrer\">Datenschutz bei Form.taxi</a>.</p>\n<h3>5. E-Mail, Telefon und Microsoft 365</h3>\n<p>Wenn du uns per E-Mail oder telefonisch kontaktierst, verarbeiten wir die von dir mitgeteilten Kontaktdaten und Gesprächs- bzw. Nachrichteninhalte zur Bearbeitung deines Anliegens. Es gelten die in Abschnitt 3 genannten Rechtsgrundlagen.</p>\n<p>Für das E-Mail-Postfach und die digitale Verarbeitung und Speicherung von Mandantenunterlagen setzen wir Microsoft 365 ein. Dienstanbieter für europäische Geschäftskunden ist Microsoft Ireland Operations Limited, One Microsoft Place, South County Business Park, Leopardstown, Dublin 18, Irland. Im Rahmen der Leistungserbringung können Microsoft und seine Unterauftragnehmer Kommunikations-, Inhalts-, Konto- und technische Betriebsdaten verarbeiten.</p>\n<p>Eine Verarbeitung oder ein Zugriff außerhalb des Europäischen Wirtschaftsraums kann je nach Dienst und Verarbeitungsvorgang nicht ausgeschlossen werden. Microsoft beschreibt die vertraglichen Datenschutzbestimmungen und Übermittlungsmechanismen, insbesondere EU-Standardvertragsklauseln, im <a href=\"https://www.microsoft.com/licensing/docs/view/microsoft-products-and-services-data-protection-addendum-dpa?lang=14\" target=\"_blank\" rel=\"noopener noreferrer\">Microsoft Data Protection Addendum</a>. Weitere Informationen enthalten die <a href=\"https://www.microsoft.com/de-de/privacy/privacystatement\" target=\"_blank\" rel=\"noopener noreferrer\">Microsoft-Datenschutzbestimmungen</a>.</p>\n<p>Eine gewöhnliche E-Mail ist nicht mit einem gesondert abgesicherten Mandantenbereich gleichzusetzen. Für die Übergabe von Steuerunterlagen ist der nach Mandatsannahme bereitgestellte Weg vorgesehen.</p>\n<h3>6. Web-App und Mandantenunterlagen</h3>\n<p>Nach Mandatsannahme stellen wir einen Zugang zur eigenen Web-App bereit. Die technische Bereitstellung der Web-App erfolgt über GitHub; Anmeldungen und Mandantenunterlagen werden über Microsoft 365 verarbeitet. Der bloße Besuch dieser öffentlichen Website führt noch nicht zur Anlage eines Mandantenzugangs oder zur Übertragung deiner Unterlagen.</p>\n<p>Im Mandantenbereich verarbeiten wir Kontakt- und Zugangsdaten, die zur Bearbeitung bereitgestellten Unterlagen sowie die zugehörige Kommunikation zur Durchführung des vereinbarten Auftrags, Art. 6 Abs. 1 Buchst. b DSGVO. Soweit gesetzliche Pflichten eine Verarbeitung erfordern, ist Art. 6 Abs. 1 Buchst. c DSGVO die Grundlage. Für einzelne Verarbeitungen können ergänzende Datenschutzhinweise im Mandantenbereich gelten.</p>\n<h3>7. Speicherung und Löschung</h3>\n<p>Wir verarbeiten personenbezogene Daten so lange, wie dies für den jeweiligen Zweck erforderlich ist. Bei einer Anfrage ohne anschließendes Mandat sind hierfür insbesondere Abschluss und Nachvollziehbarkeit der Kommunikation maßgeblich. Daten werden gelöscht, wenn der Zweck entfällt und keine gesetzlichen Aufbewahrungspflichten oder berechtigten Gründe für eine weitere Speicherung bestehen.</p>\n<p>Bei einem Mandat können gesetzliche und berufsrechtliche Aufbewahrungspflichten gelten. Soweit Daten zur Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen benötigt werden, kann eine Speicherung für die maßgeblichen Fristen erforderlich sein. Der Zugriff wird auf den jeweiligen Zweck beschränkt.</p>\n<h3>8. Sitzungsspeicher und externe Inhalte</h3>\n<p>Die Website verwendet den Sitzungsspeicher des Browsers (sessionStorage), um den Anzeigestatus der Fristeneinblendung zu merken. Im Animations-Vorschaumodus kann außerdem eine sitzungsbezogene Darstellungseinstellung gespeichert werden. Diese Werte dienen den jeweiligen Darstellungsfunktionen; sie enthalten keine eingegebenen Steuer- oder Kontaktdaten. Der Sitzungsspeicher besteht grundsätzlich für die Dauer der jeweiligen Browser-Tab-Sitzung.</p>\n<p>Die derzeit eingebundenen Schriften, Bilder und Animationsbibliotheken werden mit den Website-Dateien bereitgestellt. Externe Verweise sind als Links ausgestaltet. Wenn du einem Link folgst, gelten für die weitere Verarbeitung auf der Zielseite die dortigen Datenschutzhinweise.</p>\n<h3>9. Deine Rechte</h3>\n<p>Unter den gesetzlichen Voraussetzungen hast du Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung und Datenübertragbarkeit. Soweit eine Verarbeitung auf einer Einwilligung beruht, kannst du diese mit Wirkung für die Zukunft widerrufen.</p>\n<p><strong>Widerspruch:</strong> Gegen eine Verarbeitung auf Grundlage von Art. 6 Abs. 1 Buchst. f DSGVO kannst du aus Gründen, die sich aus deiner besonderen Situation ergeben, Widerspruch einlegen. Bei Direktwerbung gilt das Widerspruchsrecht ohne diese Einschränkung.</p>\n<p>Wende dich zur Ausübung deiner Rechte an <a href=\"mailto:info@cvm-tax.de\">info@cvm-tax.de</a>. Du kannst dich außerdem bei einer Datenschutzaufsichtsbehörde beschweren. Für Rheinland-Pfalz ist dies der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Rheinland-Pfalz, Hintere Bleiche 34, 55116 Mainz; <a href=\"https://www.datenschutz.rlp.de/\" target=\"_blank\" rel=\"noopener noreferrer\">www.datenschutz.rlp.de</a>. Du kannst dich insbesondere auch an die Aufsichtsbehörde an deinem Aufenthaltsort, Arbeitsplatz oder am Ort eines vermuteten Verstoßes wenden.</p>\n<h3>10. Stand und Geltungsbereich</h3>\n<p>Stand: 8. November 2026. Diese Fassung berücksichtigt die öffentliche CVM-TAX-Website mit Preischeck und Beratungsanfrage sowie die bestätigte Nutzung von GitHub, Form.taxi und Microsoft 365. Bei Änderungen der eingesetzten Dienste oder Verarbeitungen werden die Hinweise entsprechend angepasst.</p>"};
    document.querySelectorAll('[data-modal]').forEach(a=>a.addEventListener('click',e=>{const dialog=document.querySelector('#legalDialog'),content=document.querySelector('#legalContent'),markup=legal[a.dataset.modal];if(!dialog||!content||!markup||typeof dialog.showModal!=='function')return;e.preventDefault();content.innerHTML=markup;dialog.showModal()}));document.querySelector('#closeDialog').addEventListener('click',()=>document.querySelector('#legalDialog').close());
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

/* Fristenhinweis ausschliesslich auf ausdruecklichen Wunsch. */
(()=>{
 const popup=document.querySelector('#deadlineDialog'),trigger=document.querySelector('[data-deadline-open]');if(!popup||!trigger)return;
 const viewport=matchMedia('(max-width:700px)');
 const images=()=>popup.querySelectorAll('img[data-dialog-src]').forEach(img=>{if(img.dataset.dialogSrc.includes('mobile')===viewport.matches)img.src=img.dataset.dialogSrc});
 trigger.addEventListener('click',event=>{event.preventDefault();images();popup.showModal()});
 viewport.addEventListener('change',()=>{if(popup.open)images()});
 popup.querySelector('.deadline-close').addEventListener('click',()=>popup.close());
 popup.addEventListener('click',event=>{if(event.target===popup){const r=popup.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)popup.close()}});
 popup.querySelector('.deadline-cta').addEventListener('click',()=>popup.close());
 popup.addEventListener('close',()=>trigger.focus({preventScroll:true}));
})();
