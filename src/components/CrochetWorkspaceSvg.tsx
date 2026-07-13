import type { CrochetChartSymbol, SvgRowRenderModel, SvgWorkspaceModel } from "../domain/crochetDesigner";

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
  const visibleTokens = row.stitchTokens.slice(0, 72);
  const visibleCount = Math.max(1, visibleTokens.length);
  const gap = row.width / visibleCount;
  const top = row.y + row.height * 0.18;
  const mid = row.y + row.height * 0.52;
  const bottom = row.y + row.height * 0.82;
  const marks = [];

  for (let index = 0; index < visibleTokens.length; index += 1) {
    const token = visibleTokens[index];
    const center = row.x + gap * index + gap / 2;
    const half = Math.min(gap * 0.36, row.height * 0.24);
    const tokenProps = { "data-pattern-token-id": token.id, "data-token-kind": token.kind };

    if (token.stitchId === "chain-stitch") {
      marks.push(
        <ellipse key={token.id} {...tokenProps} cx={center} cy={mid} rx={half * 0.72} ry={row.height * 0.2} />,
      );
    } else if (token.stitchId === "slip-stitch") {
      marks.push(
        <path key={token.id} {...tokenProps} d={`M ${center - half} ${mid} H ${center + half} M ${center} ${top} V ${bottom}`} />,
      );
    } else if (token.stitchId === "single-crochet") {
      marks.push(
        <path
          key={token.id}
          {...tokenProps}
          d={`M ${center - half} ${bottom} C ${center - half * 0.7} ${top}, ${center + half * 0.7} ${top}, ${center + half} ${bottom}`}
        />,
      );
    } else if (token.stitchId === "half-double-crochet") {
      marks.push(
        <path
          key={token.id}
          {...tokenProps}
          d={`M ${center - half} ${bottom} Q ${center} ${top} ${center + half} ${bottom} M ${center - half * 0.65} ${mid} H ${center + half * 0.65}`}
        />,
      );
    } else if (token.stitchId === "double-crochet") {
      marks.push(
        <path
          key={token.id}
          {...tokenProps}
          d={`M ${center - half * 0.55} ${bottom} L ${center + half * 0.42} ${top} M ${center - half * 0.2} ${top} L ${center + half * 0.58} ${bottom}`}
        />,
      );
    } else if (token.stitchId === "treble-crochet" || token.stitchId === "double-treble-crochet") {
      marks.push(
        <path
          key={token.id}
          {...tokenProps}
          d={`M ${center - half * 0.62} ${bottom} L ${center + half * 0.42} ${top} M ${center - half * 0.22} ${top} L ${center + half * 0.58} ${bottom} M ${center - half * 0.45} ${mid} H ${center + half * 0.45}`}
        />,
      );
    } else if (token.stitchId === "tunisian-simple-stitch") {
      marks.push(
        <path
          key={token.id}
          {...tokenProps}
          d={`M ${center} ${top} V ${bottom} M ${center - half * 0.6} ${mid} H ${center + half * 0.6}`}
        />,
      );
    } else {
      marks.push(
        <path
          key={token.id}
          {...tokenProps}
          d={`M ${center - half} ${bottom} L ${center} ${top} L ${center + half} ${bottom} M ${center} ${top} V ${bottom}`}
        />,
      );
    }
  }

  return marks;
}

function rowTechniqueSymbol(symbol: CrochetChartSymbol, index: number) {
  const x = 0.12 + index * 0.22;
  if (symbol === "increase-fan") {
    return <path key={`${symbol}-${index}`} d={`M ${x} 0.28 L ${x + 0.1} 0.04 L ${x + 0.2} 0.28 M ${x + 0.1} 0.04 V 0.28`} />;
  }
  if (symbol === "decrease-join") {
    return <path key={`${symbol}-${index}`} d={`M ${x} 0.04 L ${x + 0.1} 0.28 L ${x + 0.2} 0.04 M ${x} 0.04 H ${x + 0.2}`} />;
  }
  if (symbol === "magic-ring" || symbol === "spiral-round" || symbol === "joined-round") {
    return <circle key={`${symbol}-${index}`} cx={x + 0.1} cy="0.16" r="0.08" />;
  }
  if (symbol === "color-change" || symbol === "carried-yarn" || symbol === "tapestry" || symbol === "surface-slip") {
    return <path key={`${symbol}-${index}`} d={`M ${x} 0.24 C ${x + 0.06} 0.06, ${x + 0.14} 0.26, ${x + 0.2} 0.08`} />;
  }
  if (symbol === "blocking") {
    return <rect key={`${symbol}-${index}`} x={x + 0.02} y="0.06" width="0.16" height="0.16" />;
  }
  return <path key={`${symbol}-${index}`} d={`M ${x + 0.1} 0.04 V 0.28 M ${x + 0.02} 0.16 H ${x + 0.18}`} />;
}

function squareFoldPath(object: SvgWorkspaceModel["objects"][number]) {
  if (!object.fold?.folded) {
    return "";
  }

  if (object.fold.axis === "vertical") {
    return `M ${object.x + object.width / 2} ${object.y} V ${object.y + object.height}`;
  }
  if (object.fold.axis === "horizontal") {
    return `M ${object.x} ${object.y + object.height / 2} H ${object.x + object.width}`;
  }
  if (object.fold.axis === "diagonal-opposite") {
    return `M ${object.x + object.width} ${object.y} L ${object.x} ${object.y + object.height}`;
  }
  return `M ${object.x} ${object.y} L ${object.x + object.width} ${object.y + object.height}`;
}

function seamEdgePath(object: SvgWorkspaceModel["objects"][number], edge: string) {
  const inset = Math.min(object.width, object.height) * 0.035;
  if (edge === "top") {
    return `M ${object.x + inset} ${object.y + inset} H ${object.x + object.width - inset}`;
  }
  if (edge === "right") {
    return `M ${object.x + object.width - inset} ${object.y + inset} V ${object.y + object.height - inset}`;
  }
  if (edge === "bottom") {
    return `M ${object.x + inset} ${object.y + object.height - inset} H ${object.x + object.width - inset}`;
  }
  return `M ${object.x + inset} ${object.y + inset} V ${object.y + object.height - inset}`;
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

          {model.objects.map((object) => (
            <g
              key={object.id}
              className={`svg-object svg-object-${object.type}${object.selected ? " is-selected" : ""}`}
              data-svg-object-id={object.id}
            >
              <rect
                className="svg-object-frame"
                x={object.x}
                y={object.y}
                width={object.width}
                height={object.height}
                rx={object.type === "granny-square" ? "0.06" : "0.1"}
                fill={object.type === "granny-square" ? object.colorHex : undefined}
              />
              {object.type === "granny-square" ? (
                <>
                  <rect
                    className="svg-square-round"
                    x={object.x + object.width * 0.14}
                    y={object.y + object.height * 0.14}
                    width={object.width * 0.72}
                    height={object.height * 0.72}
                    rx="0.04"
                  />
                  <rect
                    className="svg-square-round"
                    x={object.x + object.width * 0.31}
                    y={object.y + object.height * 0.31}
                    width={object.width * 0.38}
                    height={object.height * 0.38}
                    rx="0.03"
                  />
                  <text
                    className="svg-object-label"
                    x={object.x + object.width / 2}
                    y={object.y + object.height / 2}
                    textAnchor="middle"
                  >
                    {object.name}
                  </text>
                  <g className="svg-square-template-symbols">
                    {(object.chartSymbols ?? []).slice(0, 4).map((symbol, index) => (
                      <g
                        key={`${object.id}-${symbol}-${index}`}
                        transform={`translate(${object.x + object.width * (0.26 + index * 0.16)} ${object.y + object.height * 0.72}) scale(${Math.min(object.width, object.height) * 0.12})`}
                      >
                        {rowTechniqueSymbol(symbol, 0)}
                      </g>
                    ))}
                  </g>
                  {object.fold?.folded ? (
                    <>
                      <path className="svg-square-fold-line" d={squareFoldPath(object)} />
                      {object.fold.seamEdges.map((edge) => (
                        <path key={`${object.id}-${edge}`} className="svg-square-seam-edge" d={seamEdgePath(object, edge)} />
                      ))}
                    </>
                  ) : null}
                </>
              ) : null}
            </g>
          ))}

          {model.rows.map((row) => (
            <g
              key={row.id}
              className={`svg-row crochet-strip${row.selected ? " is-selected" : ""}`}
              data-svg-row-id={row.id}
              data-svg-object-id={row.objectId}
              tabIndex={0}
              role="button"
              aria-label={`Select ${row.panelName} ${row.label}`}
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
              {row.chartSymbols.length > 1 ? (
                <g
                  className="svg-row-technique-symbols"
                  transform={`translate(${row.x + row.width - Math.min(row.width * 0.34, 1.1)} ${row.y + 0.08}) scale(${Math.min(row.height, 0.5)})`}
                >
                  {row.chartSymbols.slice(1, 5).map((symbol, index) => rowTechniqueSymbol(symbol, index))}
                </g>
              ) : null}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
