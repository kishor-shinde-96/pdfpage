let pdfjsLib = window['pdfjsLib'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';

let pdfPath = 'pdf/sample.pdf'; // Path to your PDF file
let pdfDoc = null;
let pageNum = 1;
const pdfViewer = document.getElementById('pdfViewer');
const workspace = document.getElementById('workspace');
const notesContainer = document.getElementById('notesContainer');
const svgCanvas = document.getElementById('svgCanvas');

// Load PDF
pdfjsLib.getDocument(pdfPath).promise.then(function (doc) {
  pdfDoc = doc;
  renderPage(pageNum);
});

// Render the PDF page with text layer
function renderPage(num) {
  pdfDoc.getPage(num).then(function (page) {
    let scale = 1.5;
    let viewport = page.getViewport({ scale: scale });

    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    canvas.style.position = 'absolute';
    canvas.style.left = '0';
    canvas.style.top = '0';
    pdfViewer.innerHTML = ''; // Clear previous page
    pdfViewer.appendChild(canvas);

    let renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    page.render(renderContext);

    // Create a div for text selection
    let textLayerDiv = document.createElement('div');
    textLayerDiv.className = 'textLayer';
    textLayerDiv.style.position = 'absolute';
    textLayerDiv.style.left = '0';
    textLayerDiv.style.top = '0';
    textLayerDiv.style.height = canvas.height + 'px';
    textLayerDiv.style.width = canvas.width + 'px';
    pdfViewer.appendChild(textLayerDiv);

    // Render the text layer
    page.getTextContent().then(function (textContent) {
      pdfjsLib.renderTextLayer({
        textContent: textContent,
        container: textLayerDiv,
        viewport: viewport,
        textDivs: []
      });
    });
  });
}

// Add text selection and drag-and-drop functionality
pdfViewer.addEventListener('mouseup', function () {
  let selectedText = window.getSelection().toString();
  if (selectedText) {
    createNoteBlock(selectedText);
  }
});

// Function to create a draggable note block
function createNoteBlock(text) {
  let noteBlock = document.createElement('div');
  noteBlock.className = 'note-block';
  noteBlock.innerHTML = text;

  // Set the initial position of the note block
  noteBlock.style.left = '10px';
  noteBlock.style.top = `${notesContainer.children.length * 40 + 10}px`;

  // Make the note block draggable
  noteBlock.draggable = true;
  noteBlock.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', text);
  });

  // Add the note block to the workspace
  notesContainer.appendChild(noteBlock);

  // Optional: Implement functionality to draw lines between note blocks
}
