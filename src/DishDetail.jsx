// Dish detail view + cook mode
const DishDetail = ({ dish, onBack, onEdit, onCook, onDelete }) => {
  const [checkedIngs, setCheckedIngs] = React.useState(new Set());
  const [doneSteps, setDoneSteps] = React.useState(new Set());
  const [servings, setServings] = React.useState(dish.servings || 1);
  React.useEffect(() => { setServings(dish.servings || 1); }, [dish.id]);
  const totalTime = (dish.prepTime || 0) + (dish.cookTime || 0);
  const factor = (dish.servings && dish.servings > 0) ? servings / dish.servings : 1;

  const toggleIng = (i) => {
    const s = new Set(checkedIngs);
    s.has(i) ? s.delete(i) : s.add(i);
    setCheckedIngs(s);
  };
  const toggleStep = (i) => {
    const s = new Set(doneSteps);
    s.has(i) ? s.delete(i) : s.add(i);
    setDoneSteps(s);
  };

  return (
    <div className="detail">
      <div className="topbar" style={{marginBottom: 24}}>
        <button className="btn-ghost" onClick={onBack}>
          <Icon name="chev-left" size={16} /> Library
        </button>
        <div className="spacer" />
        <button className="btn-ghost" onClick={onEdit}>
          <Icon name="edit" size={16} /> Edit
        </button>
        <button className="btn-accent" onClick={onCook}>
          <Icon name="play" size={14} stroke="#fff" /> Cook mode
        </button>
      </div>

      <div className="detail-hero">
        {dish.heroPhoto ? (
          <img src={dish.heroPhoto} alt={dish.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        ) : (
          <div className="placeholder-label">hero photo of {dish.name.toLowerCase()}</div>
        )}
      </div>

      <div className="detail-head">
        <div className="page-kicker">{dish.category} · {dish.tags.slice(0,3).join(' · ')}</div>
        <h1 className="detail-title">{dish.name}</h1>
      </div>

      <div className="detail-meta">
        <div className="item">
          <span className="k">Serves</span>
          <span className="v" style={{display:'inline-flex', alignItems:'center', gap:8}}>
            <button className="icon-btn" onClick={() => setServings(Math.max(1, servings - 1))}
              style={{width:26, height:26}}>
              <Icon name="chev-left" size={12} />
            </button>
            <span style={{minWidth:24, textAlign:'center'}}>{servings}</span>
            <button className="icon-btn" onClick={() => setServings(servings + 1)}
              style={{width:26, height:26}}>
              <Icon name="chev-right" size={12} />
            </button>
            {factor !== 1 && (
              <span style={{fontFamily:'var(--f-mono)', fontSize:10, color:'var(--accent)',
                letterSpacing:'0.08em', marginLeft:4}}>
                ×{(+factor.toFixed(2))}
              </span>
            )}
          </span>
        </div>
        <div className="item">
          <span className="k">Prep</span>
          <span className="v">{dish.prepTime || 0} min</span>
        </div>
        <div className="item">
          <span className="k">Cook</span>
          <span className="v">{dish.cookTime || 0} min</span>
        </div>
        <div className="item">
          <span className="k">Total</span>
          <span className="v">{totalTime} min</span>
        </div>
        <div className="item">
          <span className="k">Ingredients</span>
          <span className="v">{dish.ingredients.length}</span>
        </div>
        <div className="item">
          <span className="k">Steps</span>
          <span className="v">{dish.steps.length}</span>
        </div>
      </div>

      <div className="detail-body">
        <div>
          <div className="section-head">
            Ingredients
            <span className="count">{dish.ingredients.length} items</span>
          </div>
          <ul className="ing-list">
            {dish.ingredients.map((ing, i) => (
              <li key={i} className={checkedIngs.has(i) ? 'checked' : ''} onClick={() => toggleIng(i)}>
                <span className="qty">
                  {ing.qty && `${window.scaleQty(ing.qty, factor)}${ing.unit ? ' ' + ing.unit : ''}`}
                </span>
                <span className="ing-name">{ing.item}</span>
              </li>
            ))}
          </ul>

          {dish.notes && (
            <div className="notes-block" style={{marginTop: 28}}>
              <div className="notes-label">Notes</div>
              <div className="notes-body">{dish.notes}</div>
            </div>
          )}

          {dish.links && dish.links.length > 0 && (
            <div className="links-block">
              <div className="section-head" style={{fontSize:18, marginBottom:10}}>Links</div>
              {dish.links.map((l, i) => (
                <a key={i} className="link-row" href={`https://${l.url}`} target="_blank" rel="noreferrer"
                   onClick={e => e.preventDefault()}>
                  <div className="link-icon">
                    <Icon name={l.url.includes('youtube') ? 'youtube' : 'link'} size={16} />
                  </div>
                  <div style={{flex:1, minWidth:0}}>
                    <div className="link-title">{l.title}</div>
                    <div className="link-url" style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.url}</div>
                  </div>
                  <Icon name="external" size={14} stroke="var(--ink-4)" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="section-head">
            Method
            <span className="count">{dish.steps.length} steps</span>
          </div>
          {dish.steps.map((s, i) => (
            <div key={i} className={`step ${doneSteps.has(i) ? 'done' : ''}`}>
              <div className="step-num">{String(i+1).padStart(2,'0')}</div>
              <div className="step-body">
                <p>{s.text}</p>
                <div className="step-actions">
                  <button className="step-check" onClick={() => toggleStep(i)}>
                    <Icon name="check" size={14} stroke="#fff" />
                  </button>
                  {s.timer && (
                    <span className="timer-chip">
                      <Icon name="timer" size={14} stroke="currentColor" /> {s.timer} min
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div style={{marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--rule)'}}>
            <button className="btn-accent" onClick={onCook} style={{width:'100%', justifyContent:'center'}}>
              <Icon name="play" size={14} stroke="#fff" /> Start cook mode
            </button>
          </div>
          <button className="btn-ghost" onClick={onDelete}
            style={{marginTop: 16, color:'var(--ink-3)', borderColor:'transparent'}}>
            <Icon name="trash" size={14} /> Delete this dish
          </button>
        </div>
      </div>
    </div>
  );
};

// Cook mode — big text, step by step, timer
const CookMode = ({ dish, onExit, servings }) => {
  const [stepIdx, setStepIdx] = React.useState(0);
  const [timer, setTimer] = React.useState(null); // seconds remaining
  const [timerRunning, setTimerRunning] = React.useState(false);
  const step = dish.steps[stepIdx];
  const factor = (dish.servings && dish.servings > 0) ? (servings || dish.servings) / dish.servings : 1;

  React.useEffect(() => {
    // keep screen awake best-effort
    let wakeLock = null;
    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then(l => wakeLock = l).catch(() => {});
    }
    return () => { if (wakeLock && wakeLock.release) wakeLock.release(); };
  }, []);

  React.useEffect(() => {
    if (!timerRunning || timer === null) return;
    if (timer <= 0) { setTimerRunning(false); return; }
    const id = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer, timerRunning]);

  React.useEffect(() => {
    // reset timer when step changes
    setTimer(null); setTimerRunning(false);
  }, [stepIdx]);

  const startTimer = (min) => {
    setTimer(min * 60);
    setTimerRunning(true);
  };

  const fmt = (s) => {
    if (s == null) return '';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2,'0')}`;
  };

  return (
    <div className="cook-mode fade-in">
      <div className="cook-head">
        <div>
          <div className="page-kicker">Cook mode</div>
          <h1 className="cook-title">{dish.name}</h1>
        </div>
        <button className="btn-ghost" onClick={onExit}>
          <Icon name="x" size={16} /> Exit
        </button>
      </div>

      <div className="cook-progress">
        {dish.steps.map((_, i) => (
          <div key={i} className={`cook-progress-bar ${i <= stepIdx ? 'done' : ''}`} />
        ))}
      </div>
      <div style={{fontFamily:'var(--f-mono)', fontSize:11, color:'var(--ink-4)', letterSpacing:'0.1em', marginBottom:24}}>
        STEP {String(stepIdx+1).padStart(2,'0')} / {String(dish.steps.length).padStart(2,'0')}
      </div>

      <div className="cook-main">
        <div>
          <div className="cook-step-num">{stepIdx + 1}.</div>
          <div className="cook-step-text">{step.text}</div>

          {step.timer && (
            <div style={{marginTop: 40, display:'flex', gap:16, alignItems:'center', flexWrap:'wrap'}}>
              {timer === null ? (
                <button className="btn-accent" onClick={() => startTimer(step.timer)}>
                  <Icon name="timer" size={16} stroke="#fff" />
                  Start {step.timer}-min timer
                </button>
              ) : (
                <>
                  <div className="timer-big">{fmt(timer)}</div>
                  <button className="btn-ghost" onClick={() => setTimerRunning(r => !r)}>
                    <Icon name={timerRunning?'pause':'play'} size={14} /> {timerRunning?'Pause':'Resume'}
                  </button>
                  <button className="btn-ghost" onClick={() => { setTimer(null); setTimerRunning(false); }}>
                    Reset
                  </button>
                </>
              )}
              {timer === 0 && (
                <span style={{color:'var(--accent)', fontFamily:'var(--f-display)', fontStyle:'italic', fontSize:22}}>
                  Time's up!
                </span>
              )}
            </div>
          )}
        </div>

        <div className="cook-ingredients">
          <h4>For this recipe {factor !== 1 && <span style={{color:'var(--accent)', marginLeft:6}}>· ×{+factor.toFixed(2)}</span>}</h4>
          <ul className="cook-ing-list">
            {dish.ingredients.map((ing, i) => (
              <li key={i}>
                {ing.qty && <strong style={{fontFamily:'var(--f-mono)', fontSize:14, color:'var(--ink-3)', marginRight:8}}>
                  {window.scaleQty(ing.qty, factor)}{ing.unit ? ' ' + ing.unit : ''}
                </strong>}
                {ing.item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="cook-nav">
        <button className="btn-ghost"
          onClick={() => setStepIdx(i => Math.max(0, i - 1))}
          disabled={stepIdx === 0}
          style={{opacity: stepIdx === 0 ? 0.4 : 1}}>
          <Icon name="chev-left" size={16} /> Previous
        </button>
        <div style={{fontFamily:'var(--f-mono)', fontSize:12, color:'var(--ink-4)'}}>
          {stepIdx + 1} of {dish.steps.length}
        </div>
        {stepIdx < dish.steps.length - 1 ? (
          <button className="btn-primary" onClick={() => setStepIdx(i => i + 1)}>
            Next <Icon name="chev-right" size={16} stroke="currentColor" />
          </button>
        ) : (
          <button className="btn-primary" onClick={onExit}>
            <Icon name="check" size={16} stroke="currentColor" /> Done
          </button>
        )}
      </div>
    </div>
  );
};

Object.assign(window, { DishDetail, CookMode });
