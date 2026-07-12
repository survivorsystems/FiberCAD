async function loadCrochetLibrary() {
  const response = await fetch("data/crochet-stitches.json");
  if (!response.ok) {
    throw new Error("Could not load crochet stitch library.");
  }
  return response.json();
}

function formatList(items) {
  if (!items || items.length === 0) {
    return "";
  }
  return items.join(", ");
}

function renderStitchLibrary(data) {
  const tableBody = document.querySelector("[data-stitch-table-body]");
  const countNode = document.querySelector("[data-stitch-count]");
  const sourceNode = document.querySelector("[data-stitch-sources]");

  if (!tableBody) {
    return;
  }

  tableBody.innerHTML = data.stitches
    .map(
      (stitch) => `
        <tr>
          <td><code>${stitch.abbr}</code></td>
          <td>
            <strong>${stitch.name}</strong>
            <span>${formatList(stitch.aliases)}</span>
          </td>
          <td>${stitch.category}</td>
          <td>${stitch.ukEquivalent}</td>
          <td>${stitch.chartSymbol}</td>
          <td>${stitch.vernacular}</td>
        </tr>
      `,
    )
    .join("");

  if (countNode) {
    countNode.textContent = `${data.stitches.length} entries`;
  }

  if (sourceNode) {
    sourceNode.innerHTML = data.sources
      .map((source) => `<a href="${source.url}" target="_blank" rel="noreferrer">${source.name}</a>`)
      .join(" · ");
  }
}

loadCrochetLibrary()
  .then(renderStitchLibrary)
  .catch((error) => {
    const tableBody = document.querySelector("[data-stitch-table-body]");
    if (tableBody) {
      tableBody.innerHTML = `<tr><td colspan="6">${error.message}</td></tr>`;
    }
  });
