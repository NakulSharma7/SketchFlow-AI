import { useState } from 'react';

const COLORS = ['#2d2a26', '#e6654e', '#2563a8', '#2f7958', '#d4942d'];
const WIDTHS = [2, 4, 7];
const FONTS = ['Poppins', 'Pangolin'];
const SIZES = [
  { label: 'S', size: 16 },
  { label: 'M', size: 24 },
  { label: 'L', size: 36 },
  { label: 'XL', size: 48 },
];

interface StylePanelProps {
  color: string;
  strokeWidth: number;
  fontFamily: string;
  fontSize: number;
  onColorChange: (color: string) => void;
  onWidthChange: (width: number) => void;
  onFontFamilyChange: (font: string) => void;
  onFontSizeChange: (size: number) => void;
  onClear: () => void;
}

export default function StylePanel({
  color,
  strokeWidth,
  fontFamily,
  fontSize,
  onColorChange,
  onWidthChange,
  onFontFamilyChange,
  onFontSizeChange,
  onClear,
}: StylePanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`inspector ${collapsed ? 'collapsed' : ''}`} id="inspector">
      <div className="inspector-head">
        {!collapsed && <span>STYLE</span>}
        <button onClick={() => setCollapsed(!collapsed)} aria-label="Toggle style panel">
          {collapsed ? '◂' : '×'}
        </button>
      </div>

      {!collapsed && (
        <>
          <label>Stroke color</label>
          <div className="colors">
            {COLORS.map((c) => (
              <button
                key={c}
                className={`color ${color === c ? 'active' : ''}`}
                style={{ '--swatch': c } as React.CSSProperties}
                onClick={() => onColorChange(c)}
              />
            ))}
          </div>

          <label>Stroke width</label>
          <div className="widths">
            {WIDTHS.map((w) => (
              <button
                key={w}
                className={`width ${strokeWidth === w ? 'active' : ''}`}
                onClick={() => onWidthChange(w)}
              >
                <i />
              </button>
            ))}
          </div>

          <label>Font family</label>
          <div className="fonts">
            {FONTS.map((f) => (
              <button
                key={f}
                className={`font-btn ${fontFamily === f ? 'active' : ''}`}
                style={{ fontFamily: f }}
                onClick={() => onFontFamilyChange(f)}
              >
                {f}
              </button>
            ))}
          </div>

          <label>Font size</label>
          <div className="fonts">
            {SIZES.map((s) => (
              <button
                key={s.label}
                className={`font-btn ${fontSize === s.size ? 'active' : ''}`}
                onClick={() => onFontSizeChange(s.size)}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="font-size-row" style={{ marginTop: '6px' }}>
            <button onClick={() => onFontSizeChange(Math.max(10, fontSize - 2))}>−</button>
            <span>{fontSize}px</span>
            <button onClick={() => onFontSizeChange(Math.min(96, fontSize + 2))}>+</button>
          </div>

          <div className="inspector-foot">
            <button onClick={onClear}>
              <span>⌫</span> Clear canvas
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
