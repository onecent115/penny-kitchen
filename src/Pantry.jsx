// Pantry view — tracks what's on hand, with optional purchase + expiry dates
const LOCATIONS = ['Pantry', 'Fridge', 'Freezer', 'Other'];

const PantryRow = ({ item, onEdit, onRemove }) => {
  const days = window.daysUntil(item.expires);
  const fClass = window.freshnessClass(days);
  const label = days == null ? 'no expiry'
    : days < 0 ? `expired ${-days}d ago`
    : days === 0 ? 'expires today'
    : days === 1 ? 'expires tomorrow'
    : days <= 14 ? `${days} days left`
    : `${days} days left`;
  return (
    <div className={`pantry-row ${fClass}`}>
      <div className="pantry-dot" />
      <div style={{flex:1, minWidth:0}}>
        <div className="pantry-name">{item.name}</div>
        <div className="pantry-sub">
          {item.qty && <span>{item.qty}</span>}
          {item.location && <span> · {item.location}</span>}
          {item.notes && <span> · <em>{item.notes}</em></span>}
        </div>
      </div>
      <div className="pantry-dates">
        <div className="pantry-k">Bought</div>
        <div className="pantry-v">{window.fmtDate(item.purchased)}</div>
      </div>
      <div className="pantry-dates">
        <div className="pantry-k">Expires</div>
        <div className="pantry-v">{window.fmtDate(item.expires)}</div>
      </div>
      <div className={`freshness-pill ${fClass}`}>{label}</div>
      <div className="pantry-actions">
        <button className="icon-btn" onClick={onEdit}><Icon name="edit" size={14}/></button>
        <button className="icon-btn" onClick={onRemove}><Icon name="x" size={14}/></button>
      </div>
    </div>
  );
};

const PantryEditor = ({ item, onSave, onCancel }) => {
  const [p, setP] = React.useState(item || {
    id: 'p' + Date.now(), name: '', qty: '', location: 'Pantry',
    purchased: '', expires: '', notes: '',
  });
  const u = (patch) => setP({...p, ...patch});
  return (
    <div className="pantry-editor">
      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:10, marginBottom:10}}>
        <div>
          <span className="editor-label">Item</span>
          <input className="editor-input" placeholder="Olive oil, eggs, flour…"
            value={p.name} onChange={e => u({name:e.target.value})} autoFocus />
        </div>
        <div>
          <span className="editor-label">Quantity</span>
          <input className="editor-input" placeholder="2 cans · 1 lb"
            value={p.qty} onChange={e => u({qty:e.target.value})} />
        </div>
        <div>
          <span className="editor-label">Location</span>
          <select className="editor-input" value={p.location} onChange={e => u({location:e.target.value})}>
            {LOCATIONS.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 2fr', gap:10, marginBottom:10}}>
        <div>
          <span className="editor-label">Purchased <em style={{color:'var(--ink-4)',textTransform:'none'}}>(optional)</em></span>
          <input className="editor-input" type="date" value={p.purchased||''}
            onChange={e => u({purchased:e.target.value})} />
        </div>
        <div>
          <span className="editor-label">Expires</span>
          <input className="editor-input" type="date" value={p.expires||''}
            onChange={e => u({expires:e.target.value})} />
        </div>
        <div>
          <span className="editor-label">Notes <em style={{color:'var(--ink-4)',textTransform:'none'}}>(optional)</em></span>
          <input className="editor-input" placeholder="Brand, origin, etc."
            value={p.notes||''} onChange={e => u({notes:e.target.value})} />
        </div>
      </div>
      <div style={{display:'flex', gap:10, justifyContent:'flex-end'}}>
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" disabled={!p.name.trim()}
          style={{opacity: p.name.trim() ? 1 : 0.4}}
          onClick={() => onSave(p)}>
          <Icon name="check" size={14} stroke="currentColor" /> Save item
        </button>
      </div>
    </div>
  );
};

const PantryView = ({ pantry, setPantry, openDrawer }) => {
  const [editing, setEditing] = React.useState(null); // id | 'new' | null
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState('all'); // all | soon | expired | by-location

  const save = (item) => {
    const exists = pantry.find(x => x.id === item.id);
    if (exists) setPantry(pantry.map(x => x.id === item.id ? item : x));
    else setPantry([item, ...pantry]);
    setEditing(null);
  };
  const remove = (id) => {
    if (!confirm('Remove this item from your pantry?')) return;
    setPantry(pantry.filter(x => x.id !== id));
  };

  // Sort: expired first, then by days-until-expiry
  const sorted = [...pantry].sort((a, b) => {
    const da = window.daysUntil(a.expires);
    const db = window.daysUntil(b.expires);
    if (da == null && db == null) return a.name.localeCompare(b.name);
    if (da == null) return 1;
    if (db == null) return -1;
    return da - db;
  });

  const filtered = sorted.filter(item => {
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    const d = window.daysUntil(item.expires);
    if (filter === 'soon' && !(d != null && d >= 0 && d <= 7)) return false;
    if (filter === 'expired' && !(d != null && d < 0)) return false;
    return true;
  });

  const counts = {
    all: pantry.length,
    soon: pantry.filter(x => { const d = window.daysUntil(x.expires); return d != null && d >= 0 && d <= 7; }).length,
    expired: pantry.filter(x => { const d = window.daysUntil(x.expires); return d != null && d < 0; }).length,
  };

  const grouped = LOCATIONS.map(loc => ({
    loc,
    items: filtered.filter(x => (x.location || 'Other') === loc),
  })).filter(g => g.items.length > 0);

  const editingItem = editing === 'new' ? null : pantry.find(x => x.id === editing);

  return (
    <div>
      <div className="topbar">
        <button className="mobile-menu" onClick={openDrawer}><Icon name="menu"/></button>
        <div className="search">
          <Icon name="search" size={18} stroke="var(--ink-3)" />
          <input placeholder="Search pantry…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn-primary" onClick={() => setEditing('new')}>
          <Icon name="plus" size={16} stroke="currentColor" /> Add item
        </button>
      </div>

      <div className="page-head">
        <div>
          <div className="page-kicker">Inventory</div>
          <h1 className="page-title">What's in <em>the kitchen</em>.</h1>
          <div className="page-sub">
            {pantry.length} items · {counts.soon} expiring soon
            {counts.expired > 0 && <span style={{color:'var(--accent)'}}> · {counts.expired} past date</span>}
          </div>
        </div>
      </div>

      <div style={{display:'flex', gap:8, marginBottom:20, flexWrap:'wrap'}}>
        {[
          {k:'all', label:'All'},
          {k:'soon', label:'Expiring soon'},
          {k:'expired', label:'Past date'},
        ].map(f => (
          <button key={f.k}
            className={`tag-chip ${filter === f.k ? 'active' : ''}`}
            onClick={() => setFilter(f.k)}>
            {f.label} · {counts[f.k]}
          </button>
        ))}
      </div>

      {(editing === 'new' || editingItem) && (
        <div style={{marginBottom: 24}}>
          <PantryEditor
            key={editing}
            item={editingItem}
            onSave={save}
            onCancel={() => setEditing(null)} />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty">
          <h3>Nothing to track.</h3>
          <p>{search ? 'Try a different search.' : 'Add the first thing in your pantry or fridge.'}</p>
          {!search && <button className="btn-primary" onClick={() => setEditing('new')}>
            <Icon name="plus" size={16} /> Add first item
          </button>}
        </div>
      ) : grouped.map(g => (
        <div key={g.loc} style={{marginBottom: 28}}>
          <div className="section-head" style={{fontSize:22}}>
            {g.loc}
            <span className="count">{g.items.length}</span>
          </div>
          <div className="pantry-list">
            {g.items.map(item => (
              <PantryRow key={item.id} item={item}
                onEdit={() => setEditing(item.id)}
                onRemove={() => remove(item.id)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

window.PantryView = PantryView;
