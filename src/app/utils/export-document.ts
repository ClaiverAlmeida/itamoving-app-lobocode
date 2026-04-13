import jsPDF from "jspdf";
const logo = new URL('../../assets/itamoving-logo.png', import.meta.url).href;

// Identidade visual Itamoving (azul escuro e azul claro)
const COLORS = {
  primary: [30, 58, 95] as [number, number, number], // #1E3A5F
  secondary: [93, 173, 226] as [number, number, number], // #5DADE2
  text: [33, 37, 41] as [number, number, number],
  textMuted: [108, 117, 125] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  lightBg: [248, 249, 250] as [number, number, number],
};

const MARGIN = 10;
// A4 em paisagem: largura 297mm, altura 210mm
const PAGE_WIDTH = 297;
const PAGE_HEIGHT = 210;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const CONTENT_HEIGHT = PAGE_HEIGHT - 45;
const TABLE_CELL_PADDING = 2;
const TABLE_LINE_HEIGHT = 4;
const TABLE_MIN_ROW_HEIGHT = 8;

function formatCurrency(value: unknown): string {
  const n = Number(value);
  return `$${n.toFixed(2)}`;
}

export class ExportDocument {
  private pdf: jsPDF;
  private y: number = 0;

  constructor() {
    this.pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
  }

  private resetY() {
    this.y = 0;
  }

  private addHeader(logoBase64: string, title: string, description: string) {
    this.pdf.setFillColor(...COLORS.primary);
    this.pdf.rect(0, 0, PAGE_WIDTH, 32, "F");

    this.pdf.addImage(logoBase64, "PNG", MARGIN, 6, 20, 20);

    this.pdf.setTextColor(...COLORS.white);
    this.pdf.setFontSize(18);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.text("ITAMOVING", 36, 14);
    this.pdf.setFont("helvetica", "normal");
    this.pdf.setFontSize(9);
    this.pdf.text(
      "Documento gerado em: " + new Date().toLocaleDateString("pt-BR"),
      36,
      20,
    );

    this.y = 42;

    this.pdf.setTextColor(...COLORS.primary);
    this.pdf.setFontSize(16);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.text(title, MARGIN, this.y);
    this.y += 8;

    this.pdf.setTextColor(...COLORS.textMuted);
    this.pdf.setFontSize(10);
    this.pdf.setFont("helvetica", "normal");
    const descLines = this.pdf.splitTextToSize(description, CONTENT_WIDTH);
    this.pdf.text(descLines, MARGIN, this.y);
    this.y += descLines.length * 5 + 10;
  }

  private addTable(headers: string[], rows: (string | number)[][]) {
    const colCount = headers.length;
    const p = TABLE_CELL_PADDING;
    const cellWidth = (CONTENT_WIDTH - p * 2 * colCount) / colCount;
    const textWidth = cellWidth - 2;
    this.pdf.setFontSize(7);

    const getCellLeft = (colIndex: number) =>
      MARGIN + p + colIndex * (cellWidth + p * 2);
    const getCellCenterX = (colIndex: number) =>
      getCellLeft(colIndex) + cellWidth / 2;

    const wrapText = (text: string, width: number): string[] =>
      this.pdf.splitTextToSize(String(text ?? ""), Math.max(width, 10));

    const headerLines = headers.map((h) => wrapText(h, textWidth));
    const headerLineCount = Math.max(
      1,
      ...headerLines.map((arr) => arr.length),
    );
    const headerHeight = Math.max(
      TABLE_MIN_ROW_HEIGHT,
      headerLineCount * TABLE_LINE_HEIGHT + p * 2,
    );

    this.pdf.setDrawColor(180, 180, 180);
    this.pdf.setFillColor(...COLORS.secondary);
    this.pdf.rect(MARGIN, this.y, CONTENT_WIDTH, headerHeight, "FD");
    this.pdf.setTextColor(...COLORS.white);
    this.pdf.setFont("helvetica", "bold");

    for (let i = 0; i <= colCount; i++) {
      const x = MARGIN + i * (cellWidth + p * 2);
      this.pdf.line(x, this.y, x, this.y + headerHeight);
    }
    headerLines.forEach((lines, i) => {
      const startY =
        this.y +
        (headerHeight - lines.length * TABLE_LINE_HEIGHT) / 2 +
        TABLE_LINE_HEIGHT * 0.8;
      lines.forEach((line, li) => {
        this.pdf.text(
          line,
          getCellCenterX(i),
          startY + li * TABLE_LINE_HEIGHT,
          {
            align: "center",
          },
        );
      });
    });
    this.y += headerHeight;

    this.pdf.setTextColor(...COLORS.text);
    this.pdf.setFont("helvetica", "normal");

    rows.forEach((row, rowIndex) => {
      const cellLines = row.map((cell) => wrapText(String(cell), textWidth));
      const lineCounts = cellLines.map((arr) => arr.length);
      const maxLines = Math.max(1, ...lineCounts);
      const rowHeight = Math.max(
        TABLE_MIN_ROW_HEIGHT,
        maxLines * TABLE_LINE_HEIGHT + p * 2,
      );

      if (this.y + rowHeight > CONTENT_HEIGHT) {
        this.pdf.addPage("a4", "l");
        this.y = MARGIN;
      }

      const fill = rowIndex % 2 === 1;
      if (fill) {
        this.pdf.setFillColor(...COLORS.lightBg);
        this.pdf.rect(MARGIN, this.y, CONTENT_WIDTH, rowHeight, "F");
      }
      for (let i = 0; i <= colCount; i++) {
        const x = MARGIN + i * (cellWidth + p * 2);
        this.pdf.setDrawColor(220, 220, 220);
        this.pdf.line(x, this.y, x, this.y + rowHeight);
      }
      cellLines.forEach((lines, colIndex) => {
        const startY =
          this.y +
          (rowHeight - lines.length * TABLE_LINE_HEIGHT) / 2 +
          TABLE_LINE_HEIGHT * 0.8;
        lines.forEach((line, li) => {
          this.pdf.text(
            line,
            getCellCenterX(colIndex),
            startY + li * TABLE_LINE_HEIGHT,
            {
              align: "center",
            },
          );
        });
      });
      this.pdf.setDrawColor(220, 220, 220);
      this.pdf.line(
        MARGIN,
        this.y + rowHeight,
        PAGE_WIDTH - MARGIN,
        this.y + rowHeight,
      );
      this.y += rowHeight;
    });
    this.pdf.setFontSize(8);
    this.y += 8;
  }

  private addKeyValue(data: Record<string, unknown>, label?: string) {
    if (label) {
      this.pdf.setTextColor(...COLORS.primary);
      this.pdf.setFontSize(11);
      this.pdf.setFont("helvetica", "bold");
      this.pdf.text(label, MARGIN, this.y);
      this.y += 6;
    }
    this.pdf.setFont("helvetica", "normal");
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(...COLORS.text);

    Object.entries(data).forEach(([key, value]) => {
      if (this.y > CONTENT_HEIGHT) {
        this.pdf.addPage("a4", "l");
        this.y = MARGIN;
      }
      const displayKey = String(key)
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (s) => s.toUpperCase());
      const displayValue =
        value === null || value === undefined ? "—" : String(value);
      this.pdf.setTextColor(...COLORS.textMuted);
      this.pdf.text(displayKey + ":", MARGIN, this.y);
      this.pdf.setTextColor(...COLORS.text);
      this.pdf.text(displayValue, MARGIN + 45, this.y);
      this.y += 6;
    });
    this.y += 6;
  }

  private addFooter() {
    const footerY = PAGE_HEIGHT - 12;
    this.pdf.setDrawColor(...COLORS.secondary);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(MARGIN, footerY - 5, PAGE_WIDTH - MARGIN, footerY - 5);
    this.pdf.setTextColor(...COLORS.textMuted);
    this.pdf.setFontSize(8);
    this.pdf.text(
      `ITAMOVING · Gerado em: ${new Date().toLocaleString("pt-BR")}`,
      PAGE_WIDTH / 2,
      footerY,
      { align: "center" },
    );
  }

  private renderData(data: unknown): boolean {
    if (data === null || data === undefined) {
      this.pdf.setTextColor(...COLORS.textMuted);
      this.pdf.setFontSize(10);
      this.pdf.text("No data to display.", MARGIN, this.y);
      this.y += 10;
      return true;
    }

    if (Array.isArray(data)) {
      if (data.length === 0) {
        this.pdf.setTextColor(...COLORS.textMuted);
        this.pdf.text("No records found.", MARGIN, this.y);
        this.y += 10;
        return true;
      }
      const first = data[0];
      delete first.id;

      if (
        typeof first === "object" &&
        first !== null &&
        !Array.isArray(first)
      ) {
        const headers = Object.keys(first as Record<string, unknown>);
        const rows: (string | number)[][] = data.map((item) =>
          headers.map((h) => {
            const val = (item as Record<string, unknown>)[h];

            if (val === null || val === undefined || val === "") return "—";

            if (h.toLowerCase().includes("price")) {
              return formatCurrency(val);
            }

            if(h === "deliveryDeadline") return `${val} days`;
            if(h === "active" || h === "variablePrice") return val ? "Yes" : "No";
            if (h === "maxWeight") return `${val} kg`;
            return typeof val === "number" ? val : String(val ?? "");
          }),
        );

        this.addTable(headers, rows);
        return true;
      }
      this.pdf.setFontSize(9);
      this.pdf.setTextColor(...COLORS.text);
      data.forEach((item, i) => {
        if (this.y > CONTENT_HEIGHT) {
          this.pdf.addPage("a4", "l");
          this.y = MARGIN;
        }
        this.pdf.text(`${i + 1}. ${String(item)}`, MARGIN, this.y);
        this.y += 6;
      });
      this.y += 6;
      return true;
    }

    if (typeof data === "object") {
      this.addKeyValue(data as Record<string, unknown>);
      return true;
    }

    this.pdf.text(String(data), MARGIN, this.y);
    this.y += 10;
    return true;
  }

  createPdf(data: unknown, title: string, description: string) {
    const now = new Date().toISOString().split("T")[0];
    const fileName = `ITAMOVING-${title.replace(/\s+/g, "-")}-${now}.pdf`;

    this.pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
    this.resetY();

    this.addHeader(logo, title, description);
    this.renderData(data);
    this.addFooter();

    this.pdf.save(fileName);
  }
}

export const exportDocument = new ExportDocument();
