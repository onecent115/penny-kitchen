// Add / edit dish editor
const Editor = ({ dish, isNew, uid, onSave, onCancel }) => {
  const [method, setMethod] = React.useState(isNew ? null : 'manual');
  const [d, setD] = React.useState(dish || {
    id: 'd' + Date.now(),
    name: '', category: 'Mains', tags: [],
    servings: 4, prepTime: 0, cookTime: 0,
    heroPhoto: null,
    ingredients: [{qty:'',unit:'',item:''}],
    steps: [{text:'', timer:null}],
    notes: '', links: [],
  });
  const [tab, setTab] = React.useState('ingredients');
  const [tagInput, setTagInput] = React.useState('');
  const [pasteInput, setPasteInput] = React.useState('');
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef(null);

  const update = (patch) => setD(prev => ({...prev, ...patch}));

  const handleImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = 'users/' + uid + '/dish-photos/' + d.id + '-' + Date.now() + '.' + ext;
    const ref = window.store.ref(path);
    ref.put(file).then(function(snap) {
      return snap.ref.getDownloadURL();
    }).then(function(url) {
      update({ heroPhoto: url });
      setUploading(false);
    }).catch(function(err) {
      console.error('Upload failed:', err);
      setUploading(false);
    });
  };

  const updateIng = (i, patch) => {
    const ings = [...d.ingredients];
    ings[i] = { ...ings[i], ...patch };
    update({ ingredients: ings });
  };
  const addIng = () => update({ ingredients: [...d.ingredients, {qty:'',unit:'',item:''}] });
  const removeIng = (i) => update({ ingredients: d.ingredients.filter((_, j) => j !== i) });

  const updateStep = (i, patch) => {
    const steps = [...d.steps];
    steps[i] = { ...steps[i], ...patch };
    update({ steps });
  };
  const addStep = () => update({ steps: [...d.steps, {text:'', timer:null}] });
  const removeStep = (i) => update({ steps: d.steps.filter((_, j) => j !== i) });

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !d.tags.includes(t)) update({ tags: [...d.tags, t] });
    setTagInput('');
  };
  const removeTag = (t) => update({ tags: d.tags.filter(x => x !== t) });

  const addLink = () => update({ links: [...(d.links||[]), {title:'', url:''}] });
  const updateLink = (i, patch) => {
    const links = [...(d.links||[])];
    links[i] = { ...links[i], ...patch };
    update({ links });
  };
  const removeLink = (i) => update({ links: d.links.filter((_, j) => j !== i) });

  // Paste-from-web mock: simple parse
  const doPasteParse = () => {
    const lines = pasteInput.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;
    const newName = lines[0];
    const rest = lines.slice(1);
    const ings = [];
    const steps = [];
    let mode = 'ing';
    rest.forEach(l => {
      if (/^(method|instructions|steps|directions):?$/i.test(l)) { mode = 'step'; return; }
      if (/^(ingredients):?$/i.test(l)) { mode = 'ing'; return; }
      if (mode === 'ing') {
        // try to split "2 cups flour" into qty unit item
        const m = l.match(/^([\d\/\.\s]+)\s*(cup|tbsp|tsp|oz|lb|cloves?|sprigs?|cans?|g|kg|ml|l)?\s+(.+)$/i);
        if (m) ings.push({qty:(m[1]||'').trim(), unit:(m[2]||'').trim(), item:(m[3]||'').trim()});
        else ings.push({qty:'', unit:'', item:l});
      } else {
        steps.push({text: l.replace(/^\d+\.\s*/, ''), timer: null});
      }
    });
    update({
      name: newName,
      ingredients: ings.length ? ings : d.ingredients,
      steps: steps.length ? steps : d.steps,
    });
    setMethod('manual');
  };

  const canSave = d.name.trim().length > 0;

  if (isNew && method === null) {
    return (
      <div className="editor">
        <div className="topbar" style={{marginBottom:24}}>
          <button className="btn-ghost" onClick={onCancel}>
            <Icon name="chev-left" size={16} /> Cancel
          </button>
        </div>
        <div className="page-head">
          <div>
            <div className="page-kicker">New dish</div>
            <h1 className="page-title">How are you <em>adding</em> this?</h1>
            <div className="page-sub">Pick what fits — you can always edit it after.</div>
          </div>
        </div>

        <div className="entry-method-grid">
          <button className="entry-method" onClick={() => setMethod('manual')}>
            <div className="em-icon"><Icon name="keyboard" size={18} stroke="currentColor" /></div>
            <h3 className="em-title">Type manually</h3>
            <div className="em-sub">Start from a blank form. Most control, most typing.</div>
          </button>
          <button className="entry-method" onClick={() => setMethod('paste')}>
            <div className="em-icon"><Icon name="paste" size={18} stroke="currentColor" /></div>
            <h3 className="em-title">Paste from web</h3>
            <div className="em-sub">Drop in text from a recipe site and clean it up.</div>
          </button>
          <button className="entry-method" onClick={() => setMethod('photo')}>
            <div className="em-icon"><Icon name="camera" size={18} stroke="currentColor" /></div>
            <h3 className="em-title">Photo of cookbook</h3>
            <div className="em-sub">Snap a page; we'll pull the text out for you.</div>
          </button>
          <button className="entry-method" onClick={() => setMethod('voice')}>
            <div className="em-icon"><Icon name="mic" size={18} stroke="currentColor" /></div>
            <h3 className="em-title">Voice dictation</h3>
            <div className="em-sub">Hands-free while you cook. Transcribed to text.</div>
          </button>
        </div>
      </div>
    );
  }

  if (method === 'paste') {
    return (
      <div className="editor">
        <div className="topbar" style={{marginBottom:24}}>
          <button className="btn-ghost" onClick={() => setMethod(null)}>
            <Icon name="chev-left" size={16} /> Back
          </button>
          <div className="spacer" />
        </div>
        <div className="page-head">
          <div>
            <div className="page-kicker">Paste &amp; clean</div>
            <h1 className="page-title">Drop in the <em>text</em>.</h1>
            <div className="page-sub">First line becomes the dish name. We'll split the rest into ingredients and steps.</div>
          </div>
        </div>
        <textarea className="editor-input" style={{minHeight: 280, fontFamily:'var(--f-mono)', fontSize:13}}
          placeholder={`Slow-braised short rib ragù\n\nIngredients:\n2.5 lb short ribs\n1 tbsp kosher salt\n...\n\nMethod:\n1. Pat ribs dry.\n2. Sear until browned.\n...`}
          value={pasteInput}
          onChange={e => setPasteInput(e.target.value)} />
        <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:16}}>
          <button className="btn-ghost" onClick={() => setMethod(null)}>Cancel</button>
          <button className="btn-primary" onClick={doPasteParse} disabled={!pasteInput.trim()}>
            <Icon name="arrow-right" size={14} stroke="currentColor" />
            Parse &amp; edit
          </button>
        </div>
      </div>
    );
  }

  if (method === 'photo' || method === 'voice') {
    const isPhoto = method === 'photo';
    return (
      <div className="editor">
        <div className="topbar" style={{marginBottom:24}}>
          <button className="btn-ghost" onClick={() => setMethod(null)}>
            <Icon name="chev-left" size={16} /> Back
          </button>
        </div>
        <div className="page-head">
          <div>
            <div className="page-kicker">{isPhoto ? 'Photo → text' : 'Dictation'}</div>
            <h1 className="page-title">{isPhoto ? 'Snap the page.' : <>Speak it <em>aloud</em>.</>}</h1>
          </div>
        </div>
        <div className="image-upload" style={{aspectRatio:'16/9'}} onClick={() => setMethod('manual')}>
          <Icon name={isPhoto?'camera':'mic'} size={36} stroke="var(--ink-3)" />
          <div style={{fontFamily:'var(--f-mono)', fontSize:12, color:'var(--ink-3)'}}>
            {isPhoto ? 'Tap to take or upload a photo' : 'Tap and hold to record'}
          </div>
          <div style={{fontSize:11, color:'var(--ink-4)'}}>(demo — continues to manual editor)</div>
        </div>
      </div>
    );
  }

  // Manual editor
  return (
    <div className="editor">
      <div className="topbar" style={{marginBottom:24}}>
        <button className="btn-ghost" onClick={onCancel}>
          <Icon name="chev-left" size={16} /> Cancel
        </button>
        <div className="spacer" />
        <button className="btn-primary" onClick={() => onSave(d)} disabled={!canSave}
          style={{opacity: canSave ? 1 : 0.5}}>
          <Icon name="check" size={14} stroke="currentColor" />
          {isNew ? 'Save dish' : 'Save changes'}
        </button>
      </div>

      <div className="editor-field">
        <span className="editor-label">Dish name</span>
        <input className="editor-title-input" placeholder="Name this dish…"
          value={d.name} onChange={e => update({name: e.target.value})} autoFocus />
      </div>

      <div className="editor-field">
        <span className="editor-label">Hero image</span>
        <div
          className={`image-upload ${d.heroPhoto ? 'has-image' : ''}`}
          onClick={() => !uploading && fileInputRef.current.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleImageFile(e.dataTransfer.files[0]); }}
          style={{cursor: uploading ? 'default' : 'pointer', position:'relative'}}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{display:'none'}}
            onChange={e => handleImageFile(e.target.files[0])} />
          {d.heroPhoto ? (
            <>
              <img src={d.heroPhoto} alt="Hero"
                style={{position:'absolute', inset:0, width:'100%', height:'100%',
                  objectFit:'cover', borderRadius:'inherit'}} />
              <button
                onClick={e => { e.stopPropagation(); update({heroPhoto:null}); }}
                style={{position:'absolute', top:8, right:8, zIndex:1,
                  background:'rgba(0,0,0,0.5)', border:'none', borderRadius:6,
                  color:'#fff', padding:'4px 8px', cursor:'pointer', fontSize:12}}>
                Remove
              </button>
            </>
          ) : uploading ? (
            <>
              <Icon name="image" size={32} stroke="var(--ink-3)" />
              <div style={{fontFamily:'var(--f-mono)', fontSize:12, color:'var(--ink-3)'}}>
                Uploading…
              </div>
            </>
          ) : (
            <>
              <Icon name="image" size={32} stroke="var(--ink-3)" />
              <div style={{fontFamily:'var(--f-mono)', fontSize:12}}>
                Tap to upload · drag &amp; drop
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12, marginBottom:24}}>
        <div className="editor-field" style={{margin:0}}>
          <span className="editor-label">Category</span>
          <select className="editor-input" value={d.category}
            onChange={e => update({category: e.target.value})}>
            {window.CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="editor-field" style={{margin:0}}>
          <span className="editor-label">Servings</span>
          <input className="editor-input" type="number" value={d.servings}
            onChange={e => update({servings: +e.target.value || 0})} />
        </div>
        <div className="editor-field" style={{margin:0}}>
          <span className="editor-label">Prep (min)</span>
          <input className="editor-input" type="number" value={d.prepTime}
            onChange={e => update({prepTime: +e.target.value || 0})} />
        </div>
        <div className="editor-field" style={{margin:0}}>
          <span className="editor-label">Cook (min)</span>
          <input className="editor-input" type="number" value={d.cookTime}
            onChange={e => update({cookTime: +e.target.value || 0})} />
        </div>
      </div>

      <div className="editor-field">
        <span className="editor-label">Tags</span>
        <div style={{display:'flex', flexWrap:'wrap', gap:6, alignItems:'center'}}>
          {d.tags.map(t => (
            <span key={t} className="tag-chip" onClick={() => removeTag(t)}>
              {t} <Icon name="x" size={12} />
            </span>
          ))}
          <input className="editor-input" style={{width:180, padding:'8px 12px'}}
            placeholder="Add tag + Enter"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} />
        </div>
      </div>

      <div className="editor-tabs">
        {['ingredients','steps','notes','links'].map(t => (
          <button key={t} className={`editor-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}>
            {t[0].toUpperCase() + t.slice(1)}
            <span style={{color:'var(--ink-4)', marginLeft:6, fontSize:11}}>
              {t === 'ingredients' && d.ingredients.length}
              {t === 'steps' && d.steps.length}
              {t === 'links' && (d.links||[]).length}
            </span>
          </button>
        ))}
      </div>

      {tab === 'ingredients' && (
        <div>
          <div className="ing-edit-row" style={{marginBottom:8}}>
            <span className="editor-label" style={{margin:0}}>Qty</span>
            <span className="editor-label" style={{margin:0}}>Unit</span>
            <span className="editor-label" style={{margin:0}}>Item</span>
            <span />
          </div>
          {d.ingredients.map((ing, i) => (
            <div key={i} className="ing-edit-row">
              <input value={ing.qty} placeholder="2" onChange={e => updateIng(i,{qty:e.target.value})} />
              <input value={ing.unit} placeholder="cups" onChange={e => updateIng(i,{unit:e.target.value})} />
              <input value={ing.item} placeholder="all-purpose flour" onChange={e => updateIng(i,{item:e.target.value})} />
              <button className="icon-btn" onClick={() => removeIng(i)}><Icon name="x" size={14}/></button>
            </div>
          ))}
          <button className="btn-ghost" onClick={addIng} style={{marginTop:12}}>
            <Icon name="plus" size={14} /> Add ingredient
          </button>
          <div style={{fontSize:12, color:'var(--ink-4)', marginTop:16, fontStyle:'italic'}}>
            Tip: leave qty &amp; unit blank to write a free-text ingredient line.
          </div>
        </div>
      )}

      {tab === 'steps' && (
        <div>
          {d.steps.map((s, i) => (
            <div key={i} className="step-edit">
              <div className="num">{i+1}.</div>
              <div>
                <textarea placeholder="Describe this step…"
                  value={s.text} onChange={e => updateStep(i, {text: e.target.value})} />
                <div style={{display:'flex', gap:8, alignItems:'center', marginTop:8}}>
                  <Icon name="timer" size={14} stroke="var(--ink-3)" />
                  <input type="number" placeholder="min" value={s.timer||''}
                    onChange={e => updateStep(i, {timer: e.target.value ? +e.target.value : null})}
                    style={{width:80, padding:'6px 10px', background:'var(--card)',
                      border:'1px solid var(--rule-soft)', borderRadius:8,
                      fontSize:13, color:'var(--ink)', outline:'none'}} />
                  <span style={{fontSize:12, color:'var(--ink-4)'}}>
                    {s.timer ? `${s.timer}-min timer` : 'no timer'}
                  </span>
                </div>
              </div>
              <button className="icon-btn" onClick={() => removeStep(i)}><Icon name="x" size={14}/></button>
            </div>
          ))}
          <button className="btn-ghost" onClick={addStep} style={{marginTop:12}}>
            <Icon name="plus" size={14} /> Add step
          </button>
        </div>
      )}

      {tab === 'notes' && (
        <div className="editor-field">
          <span className="editor-label">Your notes &amp; tweaks</span>
          <textarea className="editor-input" style={{minHeight:160,
            fontFamily:'var(--f-display)', fontSize:17, fontStyle:'italic'}}
            placeholder="Made this for Sunday dinner — doubled the garlic, didn't regret it…"
            value={d.notes||''} onChange={e => update({notes: e.target.value})} />
        </div>
      )}

      {tab === 'links' && (
        <div>
          {(d.links||[]).map((l, i) => (
            <div key={i} style={{display:'grid', gridTemplateColumns:'1fr 1fr 32px', gap:8, marginBottom:8}}>
              <input className="editor-input" placeholder="Link title (e.g. Video tutorial)"
                value={l.title} onChange={e => updateLink(i,{title:e.target.value})} />
              <input className="editor-input" placeholder="URL"
                value={l.url} onChange={e => updateLink(i,{url:e.target.value})} />
              <button className="icon-btn" onClick={() => removeLink(i)}><Icon name="x" size={14}/></button>
            </div>
          ))}
          <button className="btn-ghost" onClick={addLink} style={{marginTop:4}}>
            <Icon name="plus" size={14} /> Add link
          </button>
        </div>
      )}
    </div>
  );
};

window.Editor = Editor;
