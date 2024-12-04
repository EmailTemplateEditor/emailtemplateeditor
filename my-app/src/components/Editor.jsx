import React from 'react';

const Editor = ({ elements, addElement, updateElement, deleteElement }) => {
  return (
    <div style={{ width: '50%', padding: '20px', borderRight: '1px solid #ddd' }}>
      <h2>Editor</h2>
      <button onClick={() => addElement('p')}>Add Paragraph</button>
      <button onClick={() => addElement('h1')}>Add Heading</button>
      <button onClick={() => addElement('image')}>Add Image</button>
      {elements.map((el) => (
        <div key={el.id} style={{ margin: '10px 0' }}>
          <div>
            <label>Edit Content:</label>
            <input
              type="text"
              value={el.content}
              onChange={(e) => updateElement(el.id, { ...el, content: e.target.value })}
            />
          </div>
          <button onClick={() => deleteElement(el.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default Editor;
