import React from 'react';
import { CANVAS_WIDTH, CANVAS_HEIGHT, getGridLines } from '../../engine/canvasMath';

export interface ReferenceGridProps {
  /** Master visibility toggle */
  visible?: boolean;
  /** Whether to show golden ratio lines and eye focus crosshairs */
  showGoldenRatio?: boolean;
  /** Whether to show cell coordinate badges (C1:R1 etc) */
  showLabels?: boolean;
  /** Custom opacity multiplier */
  opacity?: number;
}

/**
 * 4x6 Anime Proportion Reference Grid Overlay
 * 
 * Maps directly to classical anime portrait anatomy over viewBox 0 0 800 1000:
 * - 4 Columns (200px each):
 *     Col 1 (0-200): Left silhouette, outer hair, ribbons
 *     Col 2 (200-400): Left eye, cheek, brow, ear
 *     Col 3 (400-600): Right eye, cheek, brow, ear
 *     Col 4 (600-800): Right silhouette, twin sidelocks
 *     Vertical Center (X = 400): Facial symmetry line, nose bridge, chin tip
 * 
 * - 6 Rows (166.67px each):
 *     Row 1 (0-166.7): Head crown, ahoge cowlick, hair volume
 *     Row 2 (166.7-333.3): Forehead, bangs, upper brow horizon
 *     Row 3 (333.3-500.0): Golden Eye Zone (golden irises, catchlights, eyelashes)
 *     Row 4 (500.0-666.7): Nose tip, mouth, lips, chin point
 *     Row 5 (666.7-833.3): Neck, collarbone, sailor uniform collar & ribbon
 *     Row 6 (833.3-1000.0): Shoulders, blouse folds, bust line
 * 
 * - Golden Ratio Lines:
 *     Y = 382.0 (Anime golden eye horizon)
 *     X = 305.6 (Left eye focal center)
 *     X = 494.4 (Right eye focal center)
 */
export const ReferenceGrid: React.FC<ReferenceGridProps> = ({
  visible = true,
  showGoldenRatio = true,
  showLabels = true,
  opacity = 0.85,
}) => {
  if (!visible) return null;

  const cols = 4;
  const rows = 6;
  const { verticalLines: colLines, horizontalLines: rowLines } = React.useMemo(
    () => getGridLines(cols, rows, CANVAS_WIDTH, CANVAS_HEIGHT),
    [cols, rows]
  );
  const colWidth = CANVAS_WIDTH / cols; // 200px
  const rowHeight = CANVAS_HEIGHT / rows; // 166.67px

  // Golden ratio coordinates for 800x1000
  const goldenYTop = 382.0;    // 1000 * (1 - 0.618)
  const goldenYBottom = 618.0; // 1000 * 0.618
  const goldenXLeft = 305.6;   // 800 * (1 - 0.618)
  const goldenXRight = 494.4;  // 800 * 0.618

  // Rule of thirds lines
  const thirdX1 = CANVAS_WIDTH / 3; // 266.67
  const thirdX2 = (CANVAS_WIDTH * 2) / 3; // 533.33

  // Anatomical zone tags for specific cells
  const zoneTags: Record<string, string> = {
    '2-1': '呆毛/Ahoge',
    '3-1': '发冠/Crown',
    '2-2': '刘海/Bangs',
    '3-2': '眉线/Brows',
    '2-3': '★左眼金瞳',
    '3-3': '★右眼金瞳',
    '2-4': '鼻尖/Nose',
    '3-4': '下颌/Chin',
    '2-5': '水手领/Collar',
    '3-5': '领结/Ribbon',
  };

  return (
    <g
      id="anime-reference-grid"
      className="reference-grid select-none"
      pointerEvents="none"
      style={{ opacity }}
    >
      {/* Outer bounding rectangle */}
      <rect
        x="0"
        y="0"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        fill="none"
        stroke="rgba(245, 158, 11, 0.45)"
        strokeWidth="1.5"
      />

      {/* Grid columns */}
      {colLines.map((x, index) => {
        const isCenterAxis = index === 1; // X = 400
        return (
          <line
            key={`col-${x}`}
            x1={x}
            y1={0}
            x2={x}
            y2={CANVAS_HEIGHT}
            stroke={isCenterAxis ? 'rgba(245, 158, 11, 0.75)' : 'rgba(251, 191, 36, 0.25)'}
            strokeWidth={isCenterAxis ? 1.5 : 1}
            strokeDasharray={isCenterAxis ? undefined : '4 4'}
          />
        );
      })}

      {/* Grid rows */}
      {rowLines.map((y) => (
        <line
          key={`row-${y}`}
          x1={0}
          y1={y}
          x2={CANVAS_WIDTH}
          y2={y}
          stroke="rgba(251, 191, 36, 0.25)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
      ))}

      {/* Golden Ratio & Rule of Thirds Overlays */}
      {showGoldenRatio && (
        <g id="grid-golden-ratio">
          {/* Eye Horizon Golden Line (Y = 382) */}
          <line
            x1={0}
            y1={goldenYTop}
            x2={CANVAS_WIDTH}
            y2={goldenYTop}
            stroke="rgba(56, 189, 248, 0.65)"
            strokeWidth="1.2"
            strokeDasharray="6 3"
          />
          <text
            x={10}
            y={goldenYTop - 4}
            fill="rgba(56, 189, 248, 0.85)"
            fontSize="9"
            fontFamily="ui-monospace, SFMono-Regular, monospace"
          >
            Golden Eye Horizon (Y: 382)
          </text>

          {/* Chin / Collar Golden Line (Y = 618) */}
          <line
            x1={0}
            y1={goldenYBottom}
            x2={CANVAS_WIDTH}
            y2={goldenYBottom}
            stroke="rgba(56, 189, 248, 0.4)"
            strokeWidth="1"
            strokeDasharray="6 3"
          />

          {/* Vertical Golden Lines (X = 305.6, X = 494.4) */}
          <line
            x1={goldenXLeft}
            y1={0}
            x2={goldenXLeft}
            y2={CANVAS_HEIGHT}
            stroke="rgba(56, 189, 248, 0.45)"
            strokeWidth="1"
            strokeDasharray="6 3"
          />
          <line
            x1={goldenXRight}
            y1={0}
            x2={goldenXRight}
            y2={CANVAS_HEIGHT}
            stroke="rgba(56, 189, 248, 0.45)"
            strokeWidth="1"
            strokeDasharray="6 3"
          />

          {/* Left Eye Focal Crosshair Target at (305.6, 382.0) */}
          <g transform={`translate(${goldenXLeft}, ${goldenYTop})`}>
            <circle r="7" fill="none" stroke="rgba(251, 191, 36, 0.9)" strokeWidth="1.2" />
            <circle r="2" fill="rgba(251, 191, 36, 0.9)" />
            <line x1="-10" y1="0" x2="10" y2="0" stroke="rgba(251, 191, 36, 0.7)" strokeWidth="1" />
            <line x1="0" y1="-10" x2="0" y2="10" stroke="rgba(251, 191, 36, 0.7)" strokeWidth="1" />
          </g>

          {/* Right Eye Focal Crosshair Target at (494.4, 382.0) */}
          <g transform={`translate(${goldenXRight}, ${goldenYTop})`}>
            <circle r="7" fill="none" stroke="rgba(251, 191, 36, 0.9)" strokeWidth="1.2" />
            <circle r="2" fill="rgba(251, 191, 36, 0.9)" />
            <line x1="-10" y1="0" x2="10" y2="0" stroke="rgba(251, 191, 36, 0.7)" strokeWidth="1" />
            <line x1="0" y1="-10" x2="0" y2="10" stroke="rgba(251, 191, 36, 0.7)" strokeWidth="1" />
          </g>

          {/* Vertical Rule of Thirds */}
          <line
            x1={thirdX1}
            y1={0}
            x2={thirdX1}
            y2={CANVAS_HEIGHT}
            stroke="rgba(147, 197, 253, 0.2)"
            strokeWidth="1"
            strokeDasharray="2 4"
          />
          <line
            x1={thirdX2}
            y1={0}
            x2={thirdX2}
            y2={CANVAS_HEIGHT}
            stroke="rgba(147, 197, 253, 0.2)"
            strokeWidth="1"
            strokeDasharray="2 4"
          />
        </g>
      )}

      {/* Cell Coordinate Badges and Anatomical Labels */}
      {showLabels && (
        <g id="grid-labels">
          {Array.from({ length: rows }).map((_, r) =>
            Array.from({ length: cols }).map((__, c) => {
              const colIndex = c + 1;
              const rowIndex = r + 1;
              const cellX = c * colWidth;
              const cellY = r * rowHeight;
              const tag = zoneTags[`${colIndex}-${rowIndex}`];

              return (
                <g key={`cell-${colIndex}-${rowIndex}`}>
                  {/* Coordinate Tag */}
                  <text
                    x={cellX + 6}
                    y={cellY + 14}
                    fill="rgba(251, 191, 36, 0.55)"
                    fontSize="10"
                    fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                    fontWeight="500"
                  >
                    C{colIndex}:R{rowIndex}
                  </text>
                  {/* Anatomical Zone Label if present */}
                  {tag && (
                    <text
                      x={cellX + 6}
                      y={cellY + 28}
                      fill={tag.startsWith('★') ? 'rgba(251, 191, 36, 0.9)' : 'rgba(216, 180, 254, 0.7)'}
                      fontSize="9"
                      fontFamily="system-ui, -apple-system, sans-serif"
                      fontWeight={tag.startsWith('★') ? '600' : 'normal'}
                    >
                      {tag}
                    </text>
                  )}
                </g>
              );
            })
          )}
        </g>
      )}
    </g>
  );
};
