import { useState, useMemo } from 'react';

const CX = 450, CY = 410;

const CATEGORY_CFG = {
  Platinum: { numSections: 4,  innerR: 128, outerR: 170, gap: 6, color: '#E5C100',
    names: ['North Platinum', 'East Platinum', 'South Platinum', 'West Platinum'], totalCols: 10 },
  Gold:     { numSections: 6,  innerR: 178, outerR: 224, gap: 5, color: '#FFD700',
    names: ['N Gold', 'NE Gold', 'SE Gold', 'S Gold', 'SW Gold', 'NW Gold'], totalCols: 20 },
  Silver:   { numSections: 6,  innerR: 232, outerR: 296, gap: 4, color: '#A8A8A8',
    names: ['N Silver', 'NE Silver', 'SE Silver', 'S Silver', 'SW Silver', 'NW Silver'], totalCols: 30 },
  General:  { numSections: 9,  innerR: 304, outerR: 398, gap: 3, color: '#4CAF50',
    names: ['N Stand', 'NE Stand', 'E Stand', 'SE Stand', 'S Stand', 'SW Stand', 'W Stand', 'NW Stand', 'NC Stand'], totalCols: 30 },
};

function arcPath(cx, cy, r1, r2, startDeg, endDeg) {
  const rad = d => ((d - 90) * Math.PI) / 180;
  const s = rad(startDeg), e = rad(endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  const p = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const [x1, y1] = p(r1, s), [x2, y2] = p(r2, s);
  const [x3, y3] = p(r2, e), [x4, y4] = p(r1, e);
  return `M${x1},${y1}L${x2},${y2}A${r2},${r2} 0 ${large} 1 ${x3},${y3}L${x4},${y4}A${r1},${r1} 0 ${large} 0 ${x1},${y1}Z`;
}

function midPoint(cx, cy, r1, r2, startDeg, endDeg) {
  const mid = (startDeg + endDeg) / 2;
  const r = (r1 + r2) / 2;
  const rad = ((mid - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad), mid };
}

export default function SeatMap({ seats, selectedSeats = [], quantity = 1, onSeatSelect }) {
  const [activeSection, setActiveSection] = useState(null);
  const [hoveredSection, setHoveredSection] = useState(null);

  const selectedIds = new Set(selectedSeats.map(s => s.id));

  const sections = useMemo(() => {
    const map = {};
    seats.forEach(seat => {
      const cfg = CATEGORY_CFG[seat.categoryName];
      if (!cfg) return;
      const idx = Math.min(Math.floor(seat.colIndex * cfg.numSections / cfg.totalCols), cfg.numSections - 1);
      const key = `${seat.categoryName}-${idx}`;
      if (!map[key]) map[key] = {
        key, categoryName: seat.categoryName, idx,
        name: cfg.names[idx] || `${seat.categoryName} ${idx + 1}`,
        price: seat.price, colorCode: seat.colorCode, seats: [],
      };
      map[key].seats.push(seat);
    });
    return map;
  }, [seats]);

  const activeSectionData = activeSection ? sections[activeSection] : null;
  const availableInActive = activeSectionData?.seats.filter(s => s.available) || [];

  const handleSectionClick = (key) => {
    const sec = sections[key];
    if (!sec || sec.seats.filter(s => s.available).length === 0) return;
    setActiveSection(prev => prev === key ? null : key);
  };

  const handleAutoSelect = (key) => {
    const sec = sections[key];
    if (!sec) return;
    const available = sec.seats.filter(s => s.available && !selectedIds.has(s.id));
    const toSelect = available.slice(0, quantity);
    toSelect.forEach(seat => onSeatSelect(seat));
  };

  const hexOpacity = (ratio) => Math.round((0.35 + ratio * 0.55) * 255).toString(16).padStart(2, '0');

  return (
    <div style={styles.container}>
      {/* Category legend */}
      <div style={styles.legend}>
        {Object.entries(CATEGORY_CFG).map(([name, cfg]) => {
          const price = seats.find(s => s.categoryName === name)?.price;
          return (
            <div key={name} style={styles.legendItem}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: cfg.color + 'bb', border: `1.5px solid ${cfg.color}` }} />
              <span>{name}</span>
              {price && <span style={{ color: '#888', fontSize: '0.78rem' }}>₹{price}</span>}
            </div>
          );
        })}
        <div style={styles.legendItem}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: '#333', border: '1.5px solid #444' }} />
          <span style={{ color: '#555' }}>Sold Out</span>
        </div>
      </div>

      <div style={styles.mapRow}>
        {/* SVG Stadium */}
        <div style={styles.svgWrapper}>
          <svg viewBox="30 10 840 800" style={styles.svg} preserveAspectRatio="xMidYMid meet">
            {/* Outer ring background */}
            <circle cx={CX} cy={CY} r={410} fill="#0a0f1a" />
            <circle cx={CX} cy={CY} r={408} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

            {/* Draw sections */}
            {Object.values(sections).map(sec => {
              const cfg = CATEGORY_CFG[sec.categoryName];
              if (!cfg) return null;
              const degPer = 360 / cfg.numSections;
              const startDeg = sec.idx * degPer + cfg.gap / 2;
              const endDeg = (sec.idx + 1) * degPer - cfg.gap / 2;
              const availCount = sec.seats.filter(s => s.available).length;
              const ratio = availCount / sec.seats.length;
              const isHov = hoveredSection === sec.key;
              const isAct = activeSection === sec.key;
              const color = sec.colorCode || cfg.color;
              const fill = availCount === 0 ? '#1c1c1c' : color + hexOpacity(ratio);
              const mp = midPoint(CX, CY, cfg.innerR, cfg.outerR, startDeg, endDeg);
              const arcW = cfg.outerR - cfg.innerR;

              return (
                <g key={sec.key}
                  onClick={() => handleSectionClick(sec.key)}
                  onMouseEnter={() => setHoveredSection(sec.key)}
                  onMouseLeave={() => setHoveredSection(null)}
                  style={{ cursor: availCount > 0 ? 'pointer' : 'default' }}
                >
                  <path
                    d={arcPath(CX, CY, cfg.innerR, cfg.outerR, startDeg, endDeg)}
                    fill={fill}
                    stroke={isAct ? '#fff' : isHov ? color : 'rgba(0,0,0,0.5)'}
                    strokeWidth={isAct ? 2.5 : isHov ? 1.5 : 0.8}
                    opacity={availCount === 0 ? 0.4 : 1}
                  />
                  {/* Section label */}
                  {arcW >= 50 && (
                    <>
                      <text x={mp.x} y={mp.y - (arcW > 60 ? 7 : 0)} textAnchor="middle"
                        dominantBaseline="middle" pointerEvents="none"
                        fill={availCount === 0 ? '#444' : '#fff'}
                        fontSize={arcW > 65 ? 9 : 7.5} fontWeight="700">
                        {sec.name}
                      </text>
                      {arcW > 60 && (
                        <text x={mp.x} y={mp.y + 8} textAnchor="middle"
                          dominantBaseline="middle" pointerEvents="none"
                          fill={availCount === 0 ? '#333' : color}
                          fontSize={7.5}>
                          ₹{sec.price} · {availCount} left
                        </text>
                      )}
                    </>
                  )}

                  {/* Hover card */}
                  {isHov && availCount > 0 && !isAct && (
                    <g>
                      <rect x={mp.x - 64} y={mp.y - 52} width="128" height="56" rx="7"
                        fill="#1e2235" stroke={color} strokeWidth="1.5" opacity="0.97" />
                      <text x={mp.x} y={mp.y - 36} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">{sec.name}</text>
                      <text x={mp.x} y={mp.y - 20} textAnchor="middle" fill={color} fontSize="13" fontWeight="bold">₹{sec.price}</text>
                      <text x={mp.x} y={mp.y - 6} textAnchor="middle" fill="#4CAF50" fontSize="10">{availCount} seats available · click to select</text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Cricket field */}
            <ellipse cx={CX} cy={CY} rx={120} ry={90} fill="#1c7a30" stroke="#0f5a20" strokeWidth="3" />
            {/* Outfield detail */}
            <ellipse cx={CX} cy={CY} rx={112} ry={84} fill="none" stroke="#1e8535" strokeWidth="5" />
            {/* 30-yard circle */}
            <ellipse cx={CX} cy={CY} rx={74} ry={55}
              fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" strokeDasharray="5,4" />
            {/* Pitch */}
            <rect x={CX - 10} y={CY - 46} width="20" height="92" rx="6"
              fill="#c9aa72" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
            {/* Crease lines */}
            <line x1={CX - 13} y1={CY - 32} x2={CX + 13} y2={CY - 32} stroke="white" strokeWidth="2" />
            <line x1={CX - 13} y1={CY + 32} x2={CX + 13} y2={CY + 32} stroke="white" strokeWidth="2" />
            <text x={CX} y={CY + 5} textAnchor="middle" dominantBaseline="middle"
              fill="rgba(255,255,255,0.35)" fontSize="9" fontWeight="bold" letterSpacing="1">PITCH</text>
          </svg>
        </div>

        {/* Section seats panel */}
        {activeSectionData && (
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <div style={{ color: activeSectionData.colorCode || '#f0a500', fontWeight: '700', fontSize: '1rem' }}>
                {activeSectionData.name}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#4CAF50', fontSize: '0.8rem' }}>{availableInActive.length} available</span>
                <span style={{ color: '#f0a500', fontWeight: 'bold' }}>
                  ₹{activeSectionData.price}
                  {quantity > 1 && (
                    <span style={{ color: '#aaa', fontSize: '0.78rem', fontWeight: 'normal' }}>
                      {' '}× {quantity} = <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>₹{(Number(activeSectionData.price) * quantity).toLocaleString('en-IN')}</span>
                    </span>
                  )}
                </span>
              </div>
              <button
                onClick={() => handleAutoSelect(activeSection)}
                style={styles.autoSelectBtn}
                disabled={availableInActive.length === 0}
              >
                Auto-select {quantity} best seat{quantity > 1 ? 's' : ''}
              </button>
            </div>

            <div style={styles.panelSeats}>
              {activeSectionData.seats.map(seat => {
                const isSelected = selectedIds.has(seat.id);
                return (
                  <button
                    key={seat.id}
                    disabled={!seat.available}
                    onClick={() => seat.available && onSeatSelect(seat)}
                    style={{
                      ...styles.seatBtn,
                      background: !seat.available ? '#1a1a1a'
                        : isSelected ? '#f0a500'
                        : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${!seat.available ? '#2a2a2a' : isSelected ? '#f0a500' : 'rgba(255,255,255,0.12)'}`,
                      color: !seat.available ? '#333'
                        : isSelected ? '#1a1a2e'
                        : '#ccc',
                      cursor: seat.available ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <span style={{ fontWeight: '700', fontSize: '0.8rem' }}>{seat.seatNumber}</span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>Row {seat.rowLabel}</span>
                    {!seat.available && <span style={{ fontSize: '0.65rem', color: '#444' }}>Sold</span>}
                  </button>
                );
              })}
            </div>

            {selectedSeats.filter(s => activeSectionData.seats.some(a => a.id === s.id)).length > 0 && (
              <div style={styles.panelSelected}>
                Selected: {selectedSeats.filter(s => activeSectionData.seats.some(a => a.id === s.id))
                  .map(s => <strong key={s.id} style={{ color: '#f0a500' }}>{s.seatNumber} </strong>)}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '0.8rem', maxWidth: '900px', margin: '0 auto', width: '100%' },
  legend: { display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '6px', color: '#bbb', fontSize: '0.82rem' },
  mapRow: { display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap', maxWidth: '900px', margin: '0 auto', width: '100%' },
  svgWrapper: {
    flex: '1 1 300px',
    background: '#0a0f1a',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.07)',
    overflow: 'hidden',
    minWidth: 0,
    maxHeight: '460px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: { width: '100%', height: '100%', maxHeight: '460px', display: 'block' },
  panel: {
    flex: '0 0 200px',
    background: '#1e2235',
    border: '1px solid rgba(240,165,0,0.25)',
    borderRadius: '14px',
    padding: '0.8rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    maxHeight: '460px',
    overflowY: 'auto',
  },
  panelHeader: { display: 'flex', flexDirection: 'column', gap: '6px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' },
  autoSelectBtn: {
    background: 'rgba(240,165,0,0.12)', border: '1px solid rgba(240,165,0,0.3)',
    color: '#f0a500', borderRadius: '8px', padding: '6px 10px',
    cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600', textAlign: 'center',
  },
  panelSeats: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' },
  seatBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: '2px', padding: '8px 4px', borderRadius: '8px', transition: 'all 0.15s',
  },
  panelSelected: {
    background: 'rgba(240,165,0,0.08)', border: '1px solid rgba(240,165,0,0.2)',
    borderRadius: '8px', padding: '8px 10px', color: '#ccc', fontSize: '0.82rem',
  },
};
