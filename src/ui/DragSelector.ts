/**
 * @fileoverview Drag selection manager for calendar day cells
 * Handles mouse drag state and visual cell highlighting
 */

export interface DragCallbacks {
  onDragStart: (dateStr: string) => void;
  onDragMove: (dateStr: string) => void;
  onDragEnd: (dateStr: string) => void;
  onDragCancel: () => void;
}

export class DragSelector {
  private isDragging: boolean = false;
  private startDate: string | null = null;
  private endDate: string | null = null;

  constructor(
    private container: HTMLElement,
    private callbacks: DragCallbacks
  ) {
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    document.addEventListener('mouseleave', this.handleDocumentLeave.bind(this));
  }

  startDrag(dateStr: string): void {
    this.isDragging = true;
    this.startDate = dateStr;
    this.endDate = dateStr;
    this.updateSelectionClasses();
    this.callbacks.onDragStart(dateStr);
  }

  continueDrag(dateStr: string): void {
    if (!this.isDragging) return;
    this.endDate = dateStr;
    this.updateSelectionClasses();
    this.callbacks.onDragMove(dateStr);
  }

  get dragging(): boolean {
    return this.isDragging;
  }

  clearSelection(): void {
    this.isDragging = false;
    this.startDate = null;
    this.endDate = null;
    this.clearSelectionClasses();
  }

  private handleMouseUp(): void {
    if (!this.isDragging) return;
    const endDate = this.endDate!;
    this.isDragging = false;
    // Keep selection classes visible until explicitly cleared
    this.callbacks.onDragEnd(endDate);
  }

  private handleDocumentLeave(): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.clearSelectionClasses();
    this.callbacks.onDragCancel();
  }

  private updateSelectionClasses(): void {
    if (!this.startDate || !this.endDate) return;

    const cells = this.container.querySelectorAll<HTMLTableCellElement>(
      'td.day-cell[data-date]'
    );
    const [lo, hi] = [this.startDate, this.endDate].sort();

    cells.forEach(cell => {
      const d = cell.dataset.date!;
      if (d >= lo && d <= hi) {
        cell.classList.add('drag-selecting');
      } else {
        cell.classList.remove('drag-selecting');
      }
    });
  }

  private clearSelectionClasses(): void {
    const cells = this.container.querySelectorAll<HTMLTableCellElement>(
      'td.drag-selecting'
    );
    cells.forEach(cell => cell.classList.remove('drag-selecting'));
  }
}
