import type { SvgRowRenderModel, SvgWorkspaceModel } from "../domain/crochetDesigner";

type Rotation = {
  x: number;
  y: number;
  z: number;
};

type CrochetWorkspaceSvgProps = {
  model: SvgWorkspaceModel;
  rotation: Rotation;
  onSelectRow: (rowId: string) => void;
  onClearSelection: () => void;
};

function stitchMarks(row: SvgRowRenderModel) {
  const visibleCount = Math.min(row.stitchCount, 72);
  const gap = row.width / visibleCount;
  const top = row.y + row.height * 0.18;
  const mid = row.y + row.height * 0.52;
  const bottom = row.y + row.height * 0.82;
  const marks = [];

  for (let index = 0; index < visibleCount; index += 1) {
    const center = row.x + gap * index + gap / 2;
    const half = Math.min(gap * 0.36, row.height * 0.24);

    if (row.stitchId === "single-crochet") {
      marks.push(
        <path
          key={index}
          d={`M ${center - half} ${bottom} C ${center - half * 0.7} ${top}, ${center + half * 0.7} ${top}, ${center + half} ${bottom}`}
        />,
      );
    } else if (row.stitchId === "half-double-crochet") {
      marks.push(
        <path
          key={index}
          d={`M ${center - half} ${bottom} Q ${center} ${top} ${center + half} ${bottom} M ${center - half * 0.65} ${mid} H ${center + half * 0.65}`}
        />,
      );
    } else if (row.stitchId === "double-crochet") {
      marks.push(
        <path
          key={index}
          d={`M ${center - half * 0.55} ${bottom} L ${center + half * 0.42} ${top} M ${center - half * 0.2} ${top} L ${center + half * 0.58} ${bottom}`}
        />,
      );
    } else if (row.stitchId === "tunisian-simple-stitch") {
      marks.push(
        <path
          key={index}
          d={`M ${center} ${top} V ${bottom} M ${center - half * 0.6} ${mid} H ${center + half * 0.6}`}
        />,
      );
    } else {
      marks.push(
        <path
          key={index}
          d={`M ${center - half} ${bottom} L ${center} ${top} L ${center + half} ${bottom} M ${center} ${top} V ${bottom}`}
        />,
      );
    }
  }

  return marks;
}

export function CrochetWorkspaceSvg({
  model,
  rotation,
  onSelectRow,
  onClearSelection,
}: CrochetWorkspaceSvgProps) {
  const canvasTransform = {
    transform: `perspective(980px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
  };

  return (
    <div className="svg-stage blank-canvas-stage" data-visual-stage>
      <div className="workspace-rotator" style={canvasTransform}>
        <svg
          data-svg-workspace
          role="img"
          aria-label="Crochet project rows rendered proportionally on a blank canvas"
          preserveAspectRatio="xMidYMid meet"
          viewBox={`${model.viewBox.x} ${model.viewBox.y} ${model.viewBox.width} ${model.viewBox.height}`}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              onClearSelection();
            }
          }}
        >
          <rect
            x={model.viewBox.x}
            y={model.viewBox.y}
            width={model.viewBox.width}
            height={model.viewBox.height}
            className="svg-blank-canvas"
          />

          {model.empty ? (
            <g>
              <rect x="0.1" y="0.1" width="7.6" height="4.6" rx="0.18" className="svg-empty-frame" />
              <text x="3.9" y="2.25" textAnchor="middle" className="svg-empty-title">
                No rows yet
              </text>
              <text x="3.9" y="2.75" textAnchor="middle" className="svg-empty-copy">
                Add a row to render the first crochet strip.
              </text>
            </g>
          ) : null}

          {model.rows.map((row) => (
            <g
              key={row.id}
              className={`svg-row crochet-strip${row.selected ? " is-selected" : ""}`}
              data-svg-row-id={row.id}
              tabIndex={0}
              role="button"
              aria-label={`Select ${row.label}`}
              onClick={(event) => {
                event.stopPropagation();
                onSelectRow(row.id);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectRow(row.id);
                }
              }}
            >
              <rect
                className="svg-row-fill"
                x={row.x}
                y={row.y}
                width={row.width}
                height={row.height}
                rx="0.08"
                fill={row.colorHex}
              />
              <g className={`stitch-thread ${row.textureId}`}>{stitchMarks(row)}</g>
              <rect
                className="svg-row-highlight"
                x={row.x}
                y={row.y}
                width={row.width}
                height={row.height}
                rx="0.08"
              />
              <rect
                className="svg-row-outline"
                x={row.x}
                y={row.y}
                width={row.width}
                height={row.height}
                rx="0.08"
              />
              <text
                className="svg-row-label"
                x={row.x + Math.min(0.28, row.width / 8)}
                y={row.y + Math.max(0.18, row.height / 2)}
              >
                {row.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
