const LANGS={
  anbn:    {name:'aⁿbⁿ',               formula:'{ aⁿbⁿ | n ≥ 1 }',             regular:false, check:s=>/^a*b*$/.test(s)&&cc(s,'a')===cc(s,'b'),                                            hint:"Equal number of a's and b's"},
  anbm:    {name:'aⁿbᵐ',               formula:'{ aⁿbᵐ | n,m ≥ 0 }',           regular:true,  check:s=>/^a*b*$/.test(s),                                                                   hint:"Any a's followed by any b's — recognized by a simple DFA"},
  anbncn:  {name:'aⁿbⁿcⁿ',             formula:'{ aⁿbⁿcⁿ | n ≥ 1 }',           regular:false, check:s=>/^a*b*c*$/.test(s)&&cc(s,'a')===cc(s,'b')&&cc(s,'b')===cc(s,'c'),                 hint:"Equal a, b and c — not even context-free!"},
  ww:      {name:'ww',                 formula:'{ ww | w ∈ {a,b}* }',           regular:false, check:s=>{const h=s.length/2;return s.length%2===0&&s.slice(0,h)===s.slice(h)},            hint:"String concatenated with itself"},
  an2bn:   {name:'aⁿb²ⁿ',              formula:'{ aⁿb²ⁿ | n ≥ 0 }',            regular:false, check:s=>/^a*b*$/.test(s)&&cc(s,'b')===2*cc(s,'a'),                                         hint:"Twice as many b's as a's"},
  abstar:  {name:'(ab)*',              formula:'{ (ab)* }',                      regular:true,  check:s=>/^(ab)*$/.test(s),                                                                 hint:"Alternating ab — simple regular pattern"},
  astar:   {name:'a*',                formula:'{ a* }',                          regular:true,  check:s=>/^a*$/.test(s),                                                                    hint:"Zero or more a's — trivially regular"},
  '0n1n':  {name:'0ⁿ1ⁿ',              formula:'{ 0ⁿ1ⁿ | n ≥ 0 }',             regular:false, check:s=>/^0*1*$/.test(s)&&cc(s,'0')===cc(s,'1'),                                           hint:"Equal 0's and 1's"},
  pal:     {name:'Palindromes',        formula:'{ w | w = wᴿ, w ∈ {a,b}* }',   regular:false, check:s=>/^[ab]*$/.test(s)&&s===[...s].reverse().join(''),                                 hint:"String equals its reverse"},
  anbn2:   {name:'aⁿb^(n²)',           formula:'{ aⁿb^(n²) | n ≥ 1 }',         regular:false, check:s=>/^a*b*$/.test(s)&&cc(s,'b')===cc(s,'a')**2,                                        hint:"b count = square of a count"},
  prime:   {name:'aᵖ (p prime)',       formula:'{ aᵖ | p prime }',              regular:false, check:s=>/^a+$/.test(s)&&isPrime(s.length),                                                 hint:"Length must be prime — no DFA can track this"},
  anbmcnm: {name:'aⁿbᵐcⁿ⁺ᵐ',          formula:'{ aⁿbᵐcⁿ⁺ᵐ | n,m ≥ 0 }',      regular:false, check:s=>{const m=s.match(/^(a*)(b*)(c*)$/);return m&&m[3].length===m[1].length+m[2].length},hint:"c count = sum of a and b counts"},
  evena:   {name:'Even #a',            formula:'{ w ∈ {a,b}* | #a(w) even }',   regular:true,  check:s=>/^[ab]*$/.test(s)&&cc(s,'a')%2===0,                                               hint:"Even number of a's — 2-state DFA"},
  abncn:   {name:'abⁿcⁿ',             formula:'{ abⁿcⁿ | n ≥ 0 }',             regular:false, check:s=>{const m=s.match(/^a(b*)(c*)$/);return m&&m[1].length===m[2].length},             hint:"Starts with a, then equal b's and c's"},
  angtbn:  {name:'aⁿbᵐ (n > m)',      formula:'{ aⁿbᵐ | n > m }',              regular:false, check:s=>{const m=s.match(/^(a+)(b*)$/);return m&&m[1].length>m[2].length},                hint:"More a's than b's — requires unbounded counting"}
};

function cc(s,c){return s.split(c).length-1}
function isPrime(n){if(n<2)return false;for(let i=2;i<=Math.sqrt(n);i++)if(n%i===0)return false;return true}

// ── Structure-based checkers ──────────────────────────────────────
// isWPower: check if string s is the k-fold repetition of some substring w
//   e.g. isWPower("abcabc", 2) → true  (w="abc")
//        isWPower("abcabcabc", 3) → true  (w="abc")
function isWPower(s, k){
  if(k < 1) return false;
  if(s.length === 0) return true;          // ε = w^k with w=ε
  if(s.length % k !== 0) return false;     // must divide evenly
  const chunk = s.length / k;
  const w = s.slice(0, chunk);             // first copy
  for(let i = 1; i < k; i++){
    if(s.slice(i * chunk, (i + 1) * chunk) !== w) return false;
  }
  return true;
}

// Convenience alias kept for preset language entries
function isWW(s){ return isWPower(s, 2); }

// isPalindrome: string must equal its own reverse
function isPalindrome(s){
  return s === [...s].reverse().join('');
}

let curLang=null, curStr='', pLen=3, xE=0, yL=1, manualMemResult=null;
let ddOpen=false;

// ── Build dropdown items ──────────────────────────────────────────
function buildDd(filter=''){
  const regular=Object.entries(LANGS).filter(([,l])=>l.regular);
  const nonReg =Object.entries(LANGS).filter(([,l])=>!l.regular);
  const q=filter.toLowerCase();
  const match=([k,l])=>!q||l.name.toLowerCase().includes(q)||l.formula.toLowerCase().includes(q)||(l.hint&&l.hint.toLowerCase().includes(q));
  let html='';
  const rFiltered=regular.filter(match);
  const nFiltered=nonReg.filter(match);
  if(rFiltered.length){html+=`<div class="dd-group-label">Regular</div>`;rFiltered.forEach(([k,l])=>{html+=ddItem(k,l)})}
  if(nFiltered.length){html+=`<div class="dd-group-label" style="margin-top:4px">Non-Regular</div>`;nFiltered.forEach(([k,l])=>{html+=ddItem(k,l)})}
  if(!rFiltered.length&&!nFiltered.length)html=`<div style="padding:.9rem 1rem;font-family:'JetBrains Mono',monospace;font-size:.82rem;color:var(--text-secondary)">No matches found</div>`;
  document.getElementById('ddItems').innerHTML=html;
}

function ddItem(k,l){
  const sel=curLang&&curLang===l?'active':'';
  const badgeCls=l.regular?'regular':'non-regular';
  return `<div class="dd-item ${sel}" onclick="pickLang('${k}')">
    <div style="flex:1;min-width:0">
      <div class="di-name">${l.name}</div>
      <div class="di-formula">${l.formula}</div>
    </div>
    <span class="di-badge ${badgeCls}">${l.regular?'Regular':'Non-Regular'}</span>
  </div>`;
}

function toggleDd(){
  ddOpen=!ddOpen;
  document.getElementById('ddTrigger').classList.toggle('open',ddOpen);
  const menu=document.getElementById('ddMenu');
  menu.classList.toggle('open',ddOpen);
  if(ddOpen){buildDd();setTimeout(()=>document.getElementById('ddSearch').focus(),80)}
}

function filterDd(){buildDd(document.getElementById('ddSearch').value)}

function pickLang(key){
  curLang=LANGS[key];
  document.getElementById('customLang').value='';
  // update trigger label
  const lbl=document.getElementById('ddLabel');
  lbl.className='';
  lbl.textContent=curLang.name+' — '+curLang.formula;
  // close
  ddOpen=false;
  document.getElementById('ddTrigger').classList.remove('open');
  document.getElementById('ddMenu').classList.remove('open');
  document.getElementById('ddSearch').value='';
  showLangInfo();
  showLangStatus();
  onStrInput();
}

function showLangInfo(){
  const card=document.getElementById('langInfoCard');
  if(!curLang||curLang.isCustom){card.classList.remove('show');return}
  card.classList.add('show');
  document.getElementById('liName').textContent=curLang.name;
  const b=document.getElementById('liBadge');
  b.textContent=curLang.regular?'Regular':'Non-Regular';
  b.className='di-badge '+(curLang.regular?'regular':'non-regular');
  document.getElementById('liFormula').textContent=curLang.formula;
  document.getElementById('liHint').textContent='📐 '+curLang.hint;
  card.style.borderLeftColor=curLang.regular?'var(--success)':'var(--error)';
}

// close dropdown on outside click
document.addEventListener('click',e=>{
  if(ddOpen&&!document.getElementById('ddTrigger').contains(e.target)&&!document.getElementById('ddMenu').contains(e.target)){
    ddOpen=false;
    document.getElementById('ddTrigger').classList.remove('open');
    document.getElementById('ddMenu').classList.remove('open');
  }
});

// ── Hybrid membership checker for custom languages ───────────────
// Level 1: Detect if the expression looks like a JS regex (e.g., a*b*, (ab)*)
function tryRegex(expr){
  // Strip surrounding /.../ if present, or use raw if it looks like a pattern
  let pattern=expr;
  const slashMatch=expr.match(/^\/(.+)\/([gimsuy]*)$/);
  if(slashMatch)pattern=slashMatch[1];
  // Only treat as regex if it contains regex meta-chars but no set-builder notation
  if(!/[*+?\[\]().|\\^${}]/.test(pattern))return null;
  if(/[{}|≥≤ⁿᵐ²]/.test(expr))return null; // likely a set-builder, not regex
  try{
    const re=new RegExp('^(?:'+pattern+')$');
    return s=>re.test(s);
  }catch(e){return null}
}

// Level 2: Generalised exponent-pattern parser
// Handles: aⁿbⁿ, aⁿb²ⁿ, a²bⁿ, aⁿbⁿc, aⁿbⁿcᵐ, aⁿbᵐ, a²b³, 0ⁿ1ⁿ, aⁿbⁿcⁿ, etc.

// Unicode superscript → digit/letter map
const SUP_MAP={'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','ⁿ':'n','ᵐ':'m','ᵃ':'a','ᵇ':'b','ᵏ':'k'};
function decodeSup(s){return s.split('').map(c=>SUP_MAP[c]??c).join('')}

// Parse one exponent token (everything after the base symbol).
// Returns {type:'const',val:N} | {type:'var',name:'n'|'m',coeff:K} | null (= implicit 1)
function parseExp(raw){
  if(!raw)return{type:'const',val:1}; // bare symbol → count of 1
  const decoded=decodeSup(raw);
  // pure integer e.g. "2", "3"
  if(/^\d+$/.test(decoded))return{type:'const',val:parseInt(decoded)};
  // pure variable: "n" or "m"
  if(/^[nm]$/.test(decoded))return{type:'var',name:decoded,coeff:1};
  // scaled variable: "2n", "3m", "2m", "3n" …
  const kv=decoded.match(/^(\d+)([nm])$/);
  if(kv)return{type:'var',name:kv[2],coeff:parseInt(kv[1])};
  return null; // unrecognised → give up
}

// Tokenise expression into [{sym, exp}] or null if not a pure exponent pattern
function tokeniseExpr(expr){
  // Strip set-builder wrapper:  { ... | n ≥ 0 }  →  inner part
  let e=expr.replace(/\{[^|]*\|[^}]*\}/,'').trim()||expr;
  e=e.replace(/\s/g,'');
  // Remove leading { and trailing }
  e=e.replace(/^\{/,'').replace(/\}$/,'');
  // Symbol chars are a-z, 0-9
  // Exponent chars are ⁰¹²³⁴⁵⁶⁷⁸⁹ⁿᵐ (consecutive block after a base)
  const SUP=/[⁰¹²³⁴⁵⁶⁷⁸⁹ⁿᵐᵃᵇᵏ]/;
  const tokens=[];
  let i=0;
  while(i<e.length){
    const base=e[i];
    if(!/[a-z0-9]/.test(base))return null; // unexpected char → bail
    i++;
    let supStr='';
    while(i<e.length && SUP.test(e[i])){ supStr+=e[i]; i++; }
    const exp=parseExp(supStr);
    if(exp===null)return null;
    tokens.push({sym:base,exp});
  }
  return tokens.length?tokens:null;
}

// Build a membership-check function from an array of tokens
function buildRuleChecker(tokens){
  const syms=tokens.map(t=>t.sym);
  // Structure regex: each symbol block appears in order
  const structRe=new RegExp('^'+syms.map(s=>s+'*').join('')+'$');

  return s=>{
    // 1. Structure check: string must be composed of the right symbols in order
    if(!structRe.test(s))return false;
    // 2. Count each symbol
    const cnt={};
    syms.forEach(sym=>{ cnt[sym]=(cnt[sym]||0); }); // init
    for(const ch of s) if(cnt[ch]!==undefined) cnt[ch]++;
    // 3. Apply constraints
    // Group tokens by variable name for 'var' type; 'const' must equal fixed value
    const varGroups={}; // varName → [{sym, coeff}]
    for(const {sym,exp} of tokens){
      if(exp.type==='const'){
        if(cnt[sym]!==exp.val)return false; // e.g. a² → must have exactly 2 a's
      } else {
        // var type: collect scaling constraints
        if(!varGroups[exp.name])varGroups[exp.name]=[];
        varGroups[exp.name].push({sym,coeff:exp.coeff});
      }
    }
    // For each variable group, compute the implied n from the first entry,
    // then verify all others are consistent: cnt[sym] == coeff * n
    for(const entries of Object.values(varGroups)){
      const first=entries[0];
      const n=cnt[first.sym]; // raw count of this symbol
      // n must be divisible by coeff to give an integer base variable
      if(n%first.coeff!==0)return false;
      const base=n/first.coeff;
      for(let j=1;j<entries.length;j++){
        if(cnt[entries[j].sym]!==entries[j].coeff*base)return false;
      }
    }
    return true;
  };
}

function tryRule(expr){
  const tokens=tokeniseExpr(expr);
  if(!tokens)return null;
  return buildRuleChecker(tokens);
}

// Level 3: Structure-pattern detector
// Recognises: palindrome, ww^R, ww, www, w^k, wᵏ (k = any integer ≥ 2)
function tryStructure(expr){
  // Normalise: strip set-builder wrapper, whitespace, lower-case
  const norm = expr.replace(/\{[^}]*\}/g, '').replace(/\s/g, '').toLowerCase();

  // ── palindrome / ww^R  (check BEFORE ww so "ww^r" won't hit the ww branch) ──
  if(norm === 'palindrome' || norm === 'pal' ||
     norm === 'ww^r'       || norm === 'wwr' || norm === 'wwᴿ'){
    return s => isPalindrome(s);
  }

  // ── w^k via explicit notation: "w^3", "w^10", "wᵏ" where k is a digit/digits ──
  //    Accepts: "w^2", "w^3", "w^12", and Unicode superscript digits (w², w³ …)
  const SUP_DIGITS = {'²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9'};
  // Replace Unicode superscript digits with ASCII so one regex handles both
  let decoded = norm.replace(/[²³⁴⁵⁶⁷⁸⁹]/g, c => SUP_DIGITS[c] || c);

  const caretMatch = decoded.match(/^w\^(\d+)$/);
  if(caretMatch){
    const k = parseInt(caretMatch[1]);
    if(k >= 2) return s => isWPower(s, k);
  }

  // ── ww, www, …  — count consecutive 'w' characters ──
  if(/^w{2,}$/.test(norm)){
    const k = norm.length;   // "ww"→2, "www"→3, "wwww"→4, …
    return s => isWPower(s, k);
  }

  return null; // not a recognised structure pattern
}

// Master: structure → regex → count rule → null (manual fallback)
// Structure MUST run first so "ww"/"www"/"w^k" are never misread as count patterns.
function detectAndBuildCheck(expr){
  return tryStructure(expr)||tryRegex(expr)||tryRule(expr)||null;
}

// Helper: return the detection method label for a custom expression
function detectMethod(expr){
  if(tryStructure(expr))return 'structure';
  if(tryRegex(expr))return 'regex';
  if(tryRule(expr))return 'rule';
  return 'manual';
}

// ── Custom language ───────────────────────────────────────────────
function handleCustom(){
  const v=document.getElementById('customLang').value.trim();
  if(!v){if(!document.getElementById('ddLabel').className){/* keep dropdown selection */}else{curLang=null}showLangStatus();onStrInput();return}
  // reset dropdown display
  const lbl=document.getElementById('ddLabel');lbl.className='dd-placeholder';lbl.textContent='— choose a language —';
  // Check if it matches a preset language
  const match=Object.entries(LANGS).find(([k,l])=>l.name===v||l.formula===v);
  if(match){curLang=match[1];}else{
    const autoCheck=detectAndBuildCheck(v);
    const method=detectMethod(v);
    const hintMap={
      regex:'Auto-detected as regex — membership checked automatically',
      rule:'Auto-detected count pattern — membership checked automatically',
      structure:'Auto-detected structure pattern — membership checked automatically',
      manual:'Custom — membership will be confirmed manually'
    };
    curLang={name:v,formula:v,regular:null,check:autoCheck,hint:hintMap[method],isCustom:true,_method:method};
  }
  document.getElementById('langInfoCard').classList.remove('show');
  showLangStatus();onStrInput();
}

function clearCustom(){document.getElementById('customLang').value='';handleCustom()}

function showLangStatus(){
  const el=document.getElementById('langStatus');
  if(!curLang){el.className='lang-status';return}
  if(curLang.isCustom){
    const m=curLang._method||'manual';
    const icons={regex:'🔤 Regex detected',rule:'🔢 Count-rule detected',structure:'🔷 Structure pattern detected',manual:'📝 Custom expression'};
    const suffix={regex:' — auto-checked via RegExp',rule:' — auto-checked via count rules',structure:' — auto-checked via structural analysis (ww / palindrome)',manual:' — membership will be confirmed manually'};
    el.className='lang-status show custom';
    el.innerHTML=icons[m]+suffix[m];
    return;
  }
  const t=curLang.regular?'regular':'non-regular';
  el.className=`lang-status show ${t}`;
  el.innerHTML=(curLang.regular?'✓ Regular — pumping lemma is satisfied for all strings':'⚠ Non-Regular — use pumping lemma to derive contradiction')+`<br><span style="opacity:.75;font-style:italic;font-size:.75rem">📐 ${curLang.hint}</span>`;
}

// ── Lang keyboard ─────────────────────────────────────────────────
function lki(ch){const i=document.getElementById('customLang');const s=i.selectionStart,e=i.selectionEnd,v=i.value;i.value=v.substring(0,s)+ch+v.substring(e);i.focus();i.selectionStart=i.selectionEnd=s+ch.length;handleCustom()}
function lkd(){const i=document.getElementById('customLang');const s=i.selectionStart,e=i.selectionEnd,v=i.value;if(s===e&&s>0){i.value=v.substring(0,s-1)+v.substring(e);i.selectionStart=i.selectionEnd=s-1}else if(s!==e){i.value=v.substring(0,s)+v.substring(e);i.selectionStart=i.selectionEnd=s}i.focus();handleCustom()}

// ── String membership check ───────────────────────────────────────
function onStrInput(){
  const s=document.getElementById('inputStr').value.trim();
  const p=parseInt(document.getElementById('pLen').value)||3;
  const ind=document.getElementById('memIndicator');
  const banner=document.getElementById('memBanner');
  const manual=document.getElementById('memManual');
  const btn=document.getElementById('analyzeBtn');
  manualMemResult=null;
  ind.textContent='';banner.className='mem-banner';manual.className='mem-manual';btn.disabled=true;
  if(!curLang||!s)return;
  if(curLang.check){
    const inL=curLang.check(s);
    if(!inL){
      ind.textContent='✗';ind.style.color='var(--error)';
      banner.className='mem-banner show not-in-lang';
      banner.innerHTML=`✗ <strong>"${s}"</strong> ∉ ${curLang.name}. Please enter a valid member of the language.`;
    } else if(s.length<p){
      ind.textContent='✓';ind.style.color='var(--success)';
      banner.className='mem-banner show too-short';
      banner.innerHTML=`✓ <strong>"${s}"</strong> ∈ ${curLang.name}, but |s| = ${s.length} &lt; p = ${p}. Use a longer string or decrease p.`;
    } else {
      ind.textContent='✓';ind.style.color='var(--success)';
      banner.className='mem-banner show in-lang';
      banner.innerHTML=`✓ <strong>"${s}"</strong> ∈ ${curLang.name} and |s| = ${s.length} ≥ p = ${p}. Ready to analyze!`;
      btn.disabled=false;
    }
  } else {
    ind.textContent='?';ind.style.color='var(--accent-tertiary)';
    banner.className='mem-banner show unknown';
    banner.innerHTML=`? Membership of <strong>"${s}"</strong> in custom language — please confirm below.`;
    document.getElementById('memManualQ').textContent=`Does "${s}" belong to ${curLang.name}?`;
    manual.className='mem-manual show';
  }
}

function setManualMem(inL){
  const s=document.getElementById('inputStr').value.trim();
  const p=parseInt(document.getElementById('pLen').value)||3;
  const banner=document.getElementById('memBanner');
  const ind=document.getElementById('memIndicator');
  document.getElementById('memManual').className='mem-manual';
  manualMemResult=inL;
  if(!inL){
    ind.textContent='✗';ind.style.color='var(--error)';
    banner.className='mem-banner show not-in-lang';
    banner.innerHTML=`✗ You indicated <strong>"${s}"</strong> is NOT in the language. Please enter a valid member.`;
    document.getElementById('analyzeBtn').disabled=true;
  } else {
    ind.textContent='✓';ind.style.color='var(--success)';
    if(s.length<p){
      banner.className='mem-banner show too-short';
      banner.innerHTML=`✓ Confirmed in language, but |s| = ${s.length} &lt; p = ${p}. Use a longer string or decrease p.`;
      document.getElementById('analyzeBtn').disabled=true;
    } else {
      banner.className='mem-banner show in-lang';
      banner.innerHTML=`✓ Confirmed: <strong>"${s}"</strong> ∈ language, |s| = ${s.length} ≥ p = ${p}. Ready to analyze!`;
      document.getElementById('analyzeBtn').disabled=false;
    }
  }
}

// ── String keyboard ───────────────────────────────────────────────
function ski(ch){const i=document.getElementById('inputStr');const s=i.selectionStart,e=i.selectionEnd,v=i.value;i.value=v.substring(0,s)+ch+v.substring(e);i.focus();i.selectionStart=i.selectionEnd=s+ch.length;onStrInput()}
function skd(){const i=document.getElementById('inputStr');const s=i.selectionStart,e=i.selectionEnd,v=i.value;if(s===e&&s>0){i.value=v.substring(0,s-1)+v.substring(e);i.selectionStart=i.selectionEnd=s-1}else if(s!==e){i.value=v.substring(0,s)+v.substring(e);i.selectionStart=i.selectionEnd=s}i.focus();onStrInput()}
function skc(){document.getElementById('inputStr').value='';onStrInput()}

// ── Analyze ───────────────────────────────────────────────────────
function analyze(){
  curStr=document.getElementById('inputStr').value.trim();
  pLen=parseInt(document.getElementById('pLen').value)||3;
  xE=0;yL=1;
  document.getElementById('xEnd').max=pLen-1;document.getElementById('xEnd').value=0;
  document.getElementById('yLen').max=pLen;document.getElementById('yLen').value=1;
  document.getElementById('statsG').style.display='grid';
  document.getElementById('condRow').style.display='flex';
  document.getElementById('decCtrl').style.display='grid';
  document.getElementById('allDecBtn').disabled=false;
  document.getElementById('resultBox').style.display='none';
  document.getElementById('proofBox').style.display='none';
  document.getElementById('contraN').style.display='none';
  updateDec();
}

function updateDec(){
  if(!curStr)return;
  xE=parseInt(document.getElementById('xEnd').value)||0;
  yL=parseInt(document.getElementById('yLen').value)||1;
  if(xE<0)xE=0;if(yL<1)yL=1;
  if(xE+yL>pLen){yL=pLen-xE;if(yL<1){xE=pLen-1;yL=1}}
  if(xE+yL>curStr.length){yL=curStr.length-xE;if(yL<1){xE=curStr.length-1;yL=1}}
  document.getElementById('xEnd').value=xE;document.getElementById('yLen').value=yL;
  drawViz();
  const zLen=curStr.length-xE-yL;
  document.getElementById('xd').textContent=xE;document.getElementById('yd').textContent=yL;document.getElementById('zd').textContent=zLen;
  document.getElementById('zDisp').value=zLen+' chars';
  const c1=xE+yL<=pLen,c2=yL>=1;
  document.getElementById('condRow').innerHTML=`<span class="cond ${c1?'ok':'fail'}">① |xy|=${xE+yL} ≤ p=${pLen} ${c1?'✓':'✗'}</span><span class="cond ${c2?'ok':'fail'}">② |y|=${yL} ≥ 1 ${c2?'✓':'✗'}</span><span class="cond neu">③ pump below →</span>`;
  updatePump();
}

function drawViz(){
  const viz=document.getElementById('strViz');viz.innerHTML='';
  for(let i=0;i<curStr.length;i++){const sp=document.createElement('span');sp.className='sc '+(i<xE?'xp':i<xE+yL?'yp':'zp');sp.textContent=curStr[i];viz.appendChild(sp)}
  const lbl=document.createElement('div');lbl.style.cssText='width:100%;text-align:center;font-family:"JetBrains Mono",monospace;font-size:.72rem;margin-top:.4rem;letter-spacing:.1em;';
  const x=curStr.substring(0,xE)||'ε',y=curStr.substring(xE,xE+yL),z=curStr.substring(xE+yL)||'ε';
  lbl.innerHTML=`<span style="color:var(--x-color)">x="${x}"</span>&nbsp;&nbsp;<span style="color:var(--y-color)">y="${y}"</span>&nbsp;&nbsp;<span style="color:var(--z-color)">z="${z}"</span>`;
  viz.appendChild(lbl);
}

function updatePump(){
  if(!curStr)return;
  const i=parseInt(document.getElementById('iSlider').value);
  document.getElementById('iDisp').textContent=i;document.getElementById('iPow').textContent=i;
  const x=curStr.substring(0,xE),y=curStr.substring(xE,xE+yL),z=curStr.substring(xE+yL);
  const pumped=x+y.repeat(i)+z;
  document.getElementById('pumpedStr').textContent=pumped||(i===0?'(empty string ε)':'');
  document.getElementById('resultBox').style.display='block';
  // canAuto: preset languages OR custom with auto-detected check function
  const canAuto=curLang&&curLang.check;
  const pmc=document.getElementById('pumpMemCheck');
  if(canAuto){pmc.className='pump-mem-check';showPumpResult(curLang.check(pumped),x,y,z,pumped,i)}
  else{pmc.className='pump-mem-check show';const b=document.getElementById('memBadge');b.className='badge wait';b.textContent='⏳ Awaiting your response';document.getElementById('contraN').style.display='none';document.getElementById('proofBox').style.display='none'}
}

function handlePumpMem(inL){
  document.getElementById('pumpMemCheck').className='pump-mem-check';
  const i=parseInt(document.getElementById('iSlider').value);
  const x=curStr.substring(0,xE),y=curStr.substring(xE,xE+yL),z=curStr.substring(xE+yL);
  showPumpResult(inL,x,y,z,x+y.repeat(i)+z,i);
}

function showPumpResult(inL,x,y,z,pumped,i){
  const badge=document.getElementById('memBadge');const cn=document.getElementById('contraN');const pb=document.getElementById('proofBox');
  if(inL){badge.className='badge ok';badge.textContent=`✓ "${pumped||'ε'}" ∈ L`;cn.style.display='none';pb.style.display='none'}
  else{
    badge.className='badge fail';badge.textContent=`✗ "${pumped||'ε'}" ∉ L — Contradiction!`;
    cn.style.display='block';cn.innerHTML=`Pumping y="${y}" exactly ${i} time(s) produces a string outside L.<br>This decomposition (x="${x||'ε'}", y="${y}", z="${z||'ε'}") violates condition ③.`;
    if(curLang&&curLang.regular===false){
      pb.style.display='block';
      document.getElementById('proofTxt').innerHTML=`Assume for contradiction that L = ${curLang.name} is regular.<br>Then ∃ pumping length p. Choose s = <strong>${curStr}</strong> ∈ L, |s| = ${curStr.length} ≥ p = ${pLen}.<br>Decomposition: x = "${x||'ε'}", y = "${y}", z = "${z||'ε'}", |xy| = ${xE+yL} ≤ p, |y| = ${yL} ≥ 1.<br>Pumping i = ${i} gives xy${i}z = "<strong>${pumped||'ε'}</strong>" ∉ L. &nbsp;✗<br>∴ No pumping length p can satisfy all three conditions. L is <strong style="color:var(--error)">NOT regular</strong>. □`;
    } else pb.style.display='none';
  }
}

function showAllDecs(){
  let rows='';
  for(let x=0;x<=Math.min(pLen,curStr.length-1);x++){
    for(let y=1;y<=pLen-x&&x+y<=curStr.length;y++){
      const xp=curStr.substring(0,x)||'ε',yp=curStr.substring(x,x+y),zp=curStr.substring(x+y)||'ε';
      rows+=`<tr><td style="color:var(--x-color)">${xp}</td><td style="color:var(--y-color);font-weight:700">${yp}</td><td style="color:var(--z-color)">${zp}</td><td>${x}</td><td>${y}</td><td>${curStr.length-x-y}</td><td><button class="btn btn-sm" onclick="pickDec(${x},${y})">Use</button></td></tr>`;
    }
  }
  document.getElementById('decTable').innerHTML=`<table class="dtable"><thead><tr><th>x</th><th>y (pumped)</th><th>z</th><th>|x|</th><th>|y|</th><th>|z|</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
  document.getElementById('decModal').classList.add('open');
}

function pickDec(x,y){xE=x;yL=y;document.getElementById('xEnd').value=x;document.getElementById('yLen').value=y;updateDec();closeMod()}
function closeMod(){document.getElementById('decModal').classList.remove('open')}
window.onclick=e=>{if(e.target.classList.contains('modal'))e.target.classList.remove('open')}

// Init
buildDd();
