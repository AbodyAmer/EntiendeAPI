function jsonToHtml(jsonData) {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      const root = data.root;
      let html = '';
      
      if (root && root.children) {
        // Determine direction for the container div
        const direction = root.direction || 'rtl';
        html += `<div dir="${direction}">`;
        
        root.children.forEach(node => {
          if (node.type === 'paragraph') {
            // Start paragraph with appropriate text alignment only
            html += `<p style="text-align:${node.format === 'right' ? 'right' : 'left'}">`;
            
            // Add text content if available
            if (node.children && node.children.length > 0) {
              node.children.forEach(textNode => {
                if (textNode.type === 'text') {
                  html += textNode.text;
                }
              });
            }
            
            html += '</p>';
          }
        });
        
        html += '</div>';
      }
      
      return html;
    } catch (error) {
      console.error('Error converting JSON to HTML:', error);
      return '';
    }
  }
  
  module.exports = jsonToHtml
  