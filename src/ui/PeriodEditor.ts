/**
 * @fileoverview Period editor panel component
 * Manages the editor panel shown above the calendar after a drag selection
 */

import { HighlightPeriod, DateRange } from '../types.js';

export class PeriodEditor {
  private panel: HTMLElement;
  private rangeDisplay: HTMLElement;
  private nameInput: HTMLInputElement;
  private colorInput: HTMLInputElement;
  private colorHex: HTMLElement;
  private confirmBtn: HTMLButtonElement;
  private cancelBtn: HTMLButtonElement;
  private currentRange: DateRange | null = null;

  constructor(
    panel: HTMLElement,
    private onConfirm: (period: HighlightPeriod) => void,
    private onCancel: () => void
  ) {
    this.panel = panel;
    this.rangeDisplay = document.getElementById('editor-range-display')!;
    this.nameInput = document.getElementById('editor-name') as HTMLInputElement;
    this.colorInput = document.getElementById('editor-color') as HTMLInputElement;
    this.colorHex = document.getElementById('editor-color-hex')!;
    this.confirmBtn = document.getElementById('editor-confirm') as HTMLButtonElement;
    this.cancelBtn = document.getElementById('editor-cancel') as HTMLButtonElement;

    this.colorInput.addEventListener('input', () => {
      this.colorHex.textContent = this.colorInput.value;
    });

    this.confirmBtn.addEventListener('click', () => {
      this.handleConfirm();
    });

    this.cancelBtn.addEventListener('click', () => {
      this.hide();
      this.onCancel();
    });
  }

  show(range: DateRange): void {
    const [lo, hi] = [range.start, range.end].sort();
    this.currentRange = { start: lo, end: hi };

    this.rangeDisplay.textContent = lo === hi ? lo : `${lo} → ${hi}`;
    this.nameInput.value = '';
    this.colorInput.value = '#ffd700';
    this.colorHex.textContent = '#ffd700';

    this.panel.removeAttribute('hidden');
    this.nameInput.focus();
  }

  hide(): void {
    this.panel.setAttribute('hidden', '');
    this.currentRange = null;
    this.nameInput.value = '';
  }

  private handleConfirm(): void {
    if (!this.currentRange) { return; }

    const { start, end } = this.currentRange;
    const color = this.colorInput.value;
    const label = this.nameInput.value.trim() || undefined;

    let period: HighlightPeriod;
    if (start === end) {
      period = { dates: [start], color, label };
    } else {
      period = { start, end, color, label };
    }

    this.hide();
    this.onConfirm(period);
  }
}
