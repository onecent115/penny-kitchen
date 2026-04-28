// Sidebar / library navigation
const Sidebar = ({ dishes, activeCategory, setActiveCategory, activeTags, toggleTag, goHome, onOpenTweaks, onOpenPantry, route, pantrySoonCount }) => {
  const allTags = [...new Set(dishes.flatMap(d => d.tags))].sort();
  const categoryCounts = window.CATEGORIES.reduce((acc, c) => {
    acc[c] = dishes.filter(d => d.category === c).length;
    return acc;
  }, {});

  return (
    <>
      <div className="brand" onClick={goHome} style={{cursor:'pointer'}}>
        <span className="brand-mark">My Kitchen</span>
        <span className="brand-dot" />
      </div>

      <button className={`nav-item ${route?.view !== 'pantry' && activeCategory === null && activeTags.length === 0 ? 'active' : ''}`}
        onClick={goHome}>
        <span>All dishes</span>
        <span className="nav-count">{dishes.length}</span>
      </button>

      <button className={`nav-item ${route?.view === 'pantry' ? 'active' : ''}`}
        onClick={onOpenPantry}>
        <span>Pantry &amp; fridge</span>
        <span className="nav-count">
          {pantrySoonCount > 0 && (
            <span style={{color:'var(--accent)', marginRight:6}}>{pantrySoonCount} soon</span>
          )}
        </span>
      </button>

      <div className="sidebar-section">Categories</div>
      {window.CATEGORIES.map(cat => (
        <button key={cat}
          className={`nav-item ${activeCategory === cat ? 'active' : ''}`}
          onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}>
          <span>{cat}</span>
          <span className="nav-count">{categoryCounts[cat] || 0}</span>
        </button>
      ))}

      <div className="sidebar-section">Tags</div>
      <div style={{padding:'0 8px'}}>
        {allTags.map(t => (
          <span key={t}
            className={`tag-chip ${activeTags.includes(t) ? 'active' : ''}`}
            onClick={() => toggleTag(t)}>
            {t}
          </span>
        ))}
      </div>

      <div style={{marginTop: 28, padding: '0 8px'}}>
        <button className="nav-item" onClick={onOpenTweaks}>
          <span style={{display:'flex',alignItems:'center',gap:8}}>
            <Icon name="sliders" size={16} />
            Customize
          </span>
        </button>
      </div>
    </>
  );
};

// Dish card (grid)
const DishCard = ({ dish, onClick }) => (
  <div className="dish-card" onClick={onClick}>
    <div className="dish-photo">
      {dish.heroPhoto ? (
        <img src={dish.heroPhoto} alt={dish.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
      ) : (
        <div className="dish-photo-placeholder">
          <span>photo of {dish.name.toLowerCase().split(' ').slice(0,3).join(' ')}</span>
        </div>
      )}
    </div>
    <div className="meta">
      <h3 className="dish-title">{dish.name}</h3>
      <div className="dish-meta-row">
        <span>{dish.category}</span>
        <span className="dot" />
        <span>{(dish.prepTime || 0) + (dish.cookTime || 0)} min</span>
        <span className="dot" />
        <span>serves {dish.servings}</span>
      </div>
      {dish.tags.length > 0 && (
        <div className="dish-tags">
          {dish.tags.slice(0, 3).map(t => <span key={t} className="dish-tag">{t}</span>)}
        </div>
      )}
    </div>
  </div>
);

// Dish list-row
const DishListRow = ({ dish, onClick }) => (
  <div className="list-row" onClick={onClick}>
    <div className="thumb">
      {dish.heroPhoto && <img src={dish.heroPhoto} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>}
    </div>
    <div>
      <h3 className="name">{dish.name}</h3>
      <div className="sub">
        {dish.category} · {(dish.prepTime||0)+(dish.cookTime||0)} min · {dish.tags.slice(0,3).join(' · ')}
      </div>
    </div>
    <Icon name="chev-right" stroke="var(--ink-4)" />
  </div>
);

// Library (home) view
const Library = ({ dishes, onOpenDish, onAdd, viewMode, setViewMode, search, setSearch,
  openDrawer, activeCategory, activeTags }) => {
  const filtered = dishes.filter(d => {
    if (activeCategory && d.category !== activeCategory) return false;
    if (activeTags.length && !activeTags.every(t => d.tags.includes(t))) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = [d.name, d.category, ...(d.tags||[]),
        ...(d.ingredients||[]).map(i=>i.item)].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const heading = activeCategory ? activeCategory
    : activeTags.length ? activeTags.map(t => `#${t}`).join(' ')
    : search ? `"${search}"`
    : null;

  return (
    <div>
      <div className="topbar">
        <button className="mobile-menu" onClick={openDrawer}>
          <Icon name="menu" />
        </button>
        <div className="search">
          <Icon name="search" size={18} stroke="var(--ink-3)" />
          <input
            placeholder="Search dishes, ingredients, tags…"
            value={search}
            onChange={e => setSearch(e.target.value)} />
          {search && (
            <button className="icon-btn" onClick={() => setSearch('')}><Icon name="x" size={14}/></button>
          )}
        </div>
        <div className="view-toggle">
          <button className={viewMode==='grid'?'active':''} onClick={() => setViewMode('grid')}>
            <Icon name="grid" size={16} />
          </button>
          <button className={viewMode==='list'?'active':''} onClick={() => setViewMode('list')}>
            <Icon name="list" size={16} />
          </button>
        </div>
        <button className="btn-primary" onClick={onAdd}>
          <Icon name="plus" size={16} stroke="currentColor" />
          Add dish
        </button>
      </div>

      <div className="page-head">
        <div>
          <div className="page-kicker">
            {heading ? 'Filtered by' : 'Your cookbook'}
          </div>
          <h1 className="page-title">
            {heading ? <>{heading}</> : <>Every dish, <em>indexed</em>.</>}
          </h1>
          <div className="page-sub">
            {filtered.length} {filtered.length === 1 ? 'dish' : 'dishes'}
            {dishes.length !== filtered.length && ` of ${dishes.length} total`}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <h3>Nothing here yet.</h3>
          <p>{search ? 'Try a different search.' : 'Start by adding your first dish.'}</p>
          {!search && <button className="btn-primary" onClick={onAdd}>
            <Icon name="plus" size={16} /> Add a dish
          </button>}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid">
          {filtered.map(d => <DishCard key={d.id} dish={d} onClick={() => onOpenDish(d.id)} />)}
        </div>
      ) : (
        <div className="list">
          {filtered.map(d => <DishListRow key={d.id} dish={d} onClick={() => onOpenDish(d.id)} />)}
        </div>
      )}
    </div>
  );
};

Object.assign(window, { Sidebar, DishCard, DishListRow, Library });
