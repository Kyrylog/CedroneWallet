/**
 * Robust clipboard utility that works across browsers with fallback mechanisms
 */

export interface ClipboardResult {
  success: boolean;
  error?: string;
}

/**
 * Copy text to clipboard using modern Clipboard API with fallback
 * @param text - The text to copy
 * @returns Promise with success status and optional error message
 */
export async function copyToClipboard(text: string): Promise<ClipboardResult> {
  // Method 1: Modern Clipboard API (preferred)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true };
    } catch (error) {
      console.warn('Clipboard API failed, trying fallback:', error);
      // Continue to fallback methods
    }
  }

  // Method 2: execCommand fallback (works in more contexts)
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Make the textarea invisible and out of viewport
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.style.opacity = '0';
    textArea.setAttribute('readonly', '');
    
    document.body.appendChild(textArea);
    
    // Select the text
    textArea.focus();
    textArea.select();
    
    // For iOS compatibility
    textArea.setSelectionRange(0, text.length);
    
    // Try to copy
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    if (successful) {
      return { success: true };
    } else {
      return { 
        success: false, 
        error: 'Copy command was unsuccessful' 
      };
    }
  } catch (error) {
    console.error('Fallback copy failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to copy to clipboard' 
    };
  }
}

/**
 * Check if clipboard API is available
 * @returns boolean indicating if clipboard operations are supported
 */
export function isClipboardSupported(): boolean {
  return !!(
    (navigator.clipboard && window.isSecureContext) ||
    document.queryCommandSupported?.('copy')
  );
}
