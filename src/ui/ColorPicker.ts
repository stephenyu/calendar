/**
 * @fileoverview Color picker modal management
 * Handles color picker UI interactions
 */

export interface ColorPickerElements {
  modal: HTMLDivElement;
  closeBtn: HTMLSpanElement;
  colorInput: HTMLInputElement;
  applyColorBtn: HTMLButtonElement;
}

export class ColorPicker {
  private elements: ColorPickerElements;
  private lastHashPosition: number | null = null;
  private configInput: HTMLTextAreaElement;

  constructor(
    elements: ColorPickerElements,
    configInput: HTMLTextAreaElement
  ) {
    this.elements = elements;
    this.configInput = configInput;
    this.setupEventListeners();
  }

  /**
   * Sets up event listeners for color picker interactions
   */
  private setupEventListeners(): void {
    // Show modal when '#' is typed in config input
    this.configInput.addEventListener('keydown', (e: KeyboardEvent): void => {
      if (e.key === '#') {
        // Wait until character is inserted
        setTimeout(() => {
          this.lastHashPosition = this.configInput.selectionStart! - 1;
          this.openModal();
        }, 0);
      }
    });

    // Close modal events
    this.elements.closeBtn.addEventListener('click', () => this.closeModal());

    window.addEventListener('click', (e: Event): void => {
      if (e.target === this.elements.modal) {
        this.closeModal();
      }
    });

    // Apply color button
    this.elements.applyColorBtn.addEventListener('click', (): void => {
      const chosenColor: string = this.elements.colorInput.value;
      if (this.lastHashPosition !== null) {
        this.insertColorAtPosition(chosenColor);
      }
      this.closeModal();
    });
  }

  /**
   * Opens the color picker modal and focuses the color input
   */
  openModal(): void {
    this.elements.modal.style.display = 'block';
    this.elements.colorInput.focus();
  }

  /**
   * Closes the color picker modal
   */
  closeModal(): void {
    this.elements.modal.style.display = 'none';
    this.lastHashPosition = null;
  }

  /**
   * Inserts a color value at the position where '#' was typed
   * @param color - The color value to insert (e.g., '#ff0000')
   */
  private insertColorAtPosition(color: string): void {
    if (this.lastHashPosition === null) {
      return;
    }

    const text: string = this.configInput.value;
    const before: string = text.slice(0, this.lastHashPosition);
    const after: string = text.slice(this.lastHashPosition + 1); // remove the '#'
    const newText: string = before + color + after;
    this.configInput.value = newText;

    // Move the cursor after the inserted color
    const cursorPos: number = before.length + color.length;
    this.configInput.selectionStart = cursorPos;
    this.configInput.selectionEnd = cursorPos;
    this.configInput.focus();
    this.lastHashPosition = null;
  }
}
