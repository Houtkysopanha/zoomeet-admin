// Enhanced function to normalize Quill HTML output with proper classes for styling
export const normalizeQuillHtml = (html) => {
  if (!html) return ''
  
  return html
    // Convert Quill's bullet list structure to standard HTML with classes
    .replace(/<li data-list="bullet"[^>]*>/g, '<li class="ql-bullet">')
    // Convert Quill's ordered list structure to standard HTML with classes
    .replace(/<li data-list="ordered"[^>]*>/g, '<li class="ql-ordered">')
    // Ensure bullet lists have proper class
    .replace(/<ul(?![^>]*class=)/g, '<ul class="ql-bullet-list"')
    // Ensure ordered lists have proper class  
    .replace(/<ol(?![^>]*class=)/g, '<ol class="ql-ordered-list"')
    // Add classes to formatting elements if not present
    .replace(/<strong(?![^>]*class=)/g, '<strong class="ql-bold"')
    .replace(/<em(?![^>]*class=)/g, '<em class="ql-italic"')
    .replace(/<u(?![^>]*class=)/g, '<u class="ql-underline"')
    .replace(/<a(?![^>]*class=)/g, '<a class="ql-link"')
    // Remove Quill's internal UI elements
    .replace(/<span class="ql-ui"[^>]*><\/span>/g, '')
    // Clean up any empty paragraphs
    .replace(/<p><br><\/p>/g, '')
    .replace(/<p><\/p>/g, '')
    // Normalize whitespace
    .trim()
}