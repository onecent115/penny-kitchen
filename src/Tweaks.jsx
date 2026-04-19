// Tweaks panel — lets users customize theme/density/etc.
const TweaksPanel = ({ tweaks, setTweaks, onClose }) => {
  const update = (patch) => setTweaks({...tweaks, ...patch});

  const accents = [
    { key: 'clay',  color: '#B85C3C' },
    { key: 'sage',  color: '#5E7A53' },
    { key: 'ink',   color: '#2C3E50' },
    { key: 'plum',  color: '#7B3F5C' },
    { key: 'ochre', color: '#B8893C' },
  ];

  return (
    <div className="tweaks-panel">
      <h4>
        Tweaks
        <button className="icon-btn" onClick={onClose} style={{border:'none'}}>
          <Icon name="x" size={14} />
        </button>
      </h4>

      <div className="tweak-row">
        <span className="tweak-label">Accent color</span>
        <div className="swatch-row">
          {accents.map(a => (
            <button key={a.key}
              className={`swatch ${tweaks.accent === a.key ? 'active' : ''}`}
              style={{background: a.color}}
              onClick={() => update({accent: a.key})} />
          ))}
        </div>
      </div>

      <div className="tweak-row">
        <span className="tweak-label">Theme</span>
        <div className="seg">
          <button className={tweaks.theme === 'light' ? 'active' : ''} onClick={() => update({theme: 'light'})}>Light</button>
          <button className={tweaks.theme === 'dark' ? 'active' : ''} onClick={() => update({theme: 'dark'})}>Dark</button>
        </div>
      </div>

      <div className="tweak-row">
        <span className="tweak-label">Font pairing</span>
        <div className="seg">
          <button className={tweaks.font === 'modern'    ? 'active' : ''} onClick={() => update({font:'modern'})}>Modern</button>
          <button className={tweaks.font === 'classic'   ? 'active' : ''} onClick={() => update({font:'classic'})}>Classic</button>
          <button className={tweaks.font === 'editorial' ? 'active' : ''} onClick={() => update({font:'editorial'})}>Editorial</button>
        </div>
      </div>

      <div className="tweak-row">
        <span className="tweak-label">Card density</span>
        <div className="seg">
          <button className={tweaks.density === 0.85 ? 'active' : ''} onClick={() => update({density: 0.85})}>Compact</button>
          <button className={tweaks.density === 1     ? 'active' : ''} onClick={() => update({density: 1})}>Normal</button>
          <button className={tweaks.density === 1.15  ? 'active' : ''} onClick={() => update({density: 1.15})}>Spacious</button>
        </div>
      </div>

      <div className="tweak-row">
        <span className="tweak-label">Home view</span>
        <div className="seg">
          <button className={tweaks.viewMode === 'grid' ? 'active' : ''} onClick={() => update({viewMode: 'grid'})}>Grid</button>
          <button className={tweaks.viewMode === 'list' ? 'active' : ''} onClick={() => update({viewMode: 'list'})}>List</button>
        </div>
      </div>
    </div>
  );
};

window.TweaksPanel = TweaksPanel;
