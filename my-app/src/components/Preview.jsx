import React from 'react';

const Preview = ({ elements }) => {
  return (
    <div style={{ width: '50%', padding: '20px' }}>
      <h2>Preview</h2>
      {elements.map((el) => (
        <div
          key={el.id}
          style={{
            ...el.styles,
            border: el.type === 'image' ? '1px solid #ddd' : 'none',
          }}
        >
          {el.type === 'image' ? (
            <img src={el.content} alt="Preview" style={{ width: '100%', height: 'auto' }} />
          ) : (
            el.content
          )}
        </div>
      ))}
    </div>
  );
};

export default Preview;
