import React, { useState } from 'react';
import axios from 'axios';

const TemplateEditor = () => {
  const [template, setTemplate] = useState([]);
  const [editorMode, setEditorMode] = useState(null); // 'image' or 'text'
  const [selectedElement, setSelectedElement] = useState(null);

  // Handle Image Upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await axios.post('http://localhost:5000/api/upload', formData);
      const newImage = { type: 'image', url: data.url, width: 100, height: 100 };
      setTemplate([...template, newImage]);
      setEditorMode('image');
      setSelectedElement(newImage);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  // Handle Text Addition (Paragraph or Heading)
  const handleAddText = (type) => {
    const newText = { type, content: `New ${type}`, color: '#000', alignment: 'left' };
    setTemplate([...template, newText]);
    setEditorMode('text');
    setSelectedElement(newText);
  };

const handleSaveChanges = () => {
  if (!selectedElement) return;

  // Update the selected element in the template state correctly
  setTemplate((prevTemplate) => 
    prevTemplate.map((item) => 
      item === selectedElement ? { ...selectedElement } : item
    )
  );

  setEditorMode(null);
  setSelectedElement(null);
};

  // Handle Deleting an element
  const handleDeleteElement = (index) => {
    setTemplate(template.filter((_, i) => i !== index));
  };

  // Save Template to Database
  const handleSaveTemplate = async () => {
    try {
      await axios.post('http://localhost:5000/api/save-template', {
        template
      });
      alert('Template saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  // Send Template via Email
  const handleSendMail = async () => {
    try {
      await axios.post('http://localhost:5000/api/send-mail', {
        template
      });
      alert('Mail sent successfully!');
    } catch (error) {
      console.error('Error sending mail:', error);
    }
  };

  // Handle Input Change for Text Elements
  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setSelectedElement((prevElement) => ({ ...prevElement, [name]: value }));
  };

  // Handle Width and Height Changes for Image
  const handleImageSizeChange = (e) => {
    const { name, value } = e.target;
    setSelectedElement((prevElement) => ({ ...prevElement, [name]: value }));
  };

  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <div style={{ width: '40%' }}>
        {/* Editor Mode */}
        {!editorMode && (
          <>
            <button onClick={() => document.getElementById('imageUploader').click()}>
              Upload Image
            </button>
            <input
              id="imageUploader"
              type="file"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
            <button onClick={() => handleAddText('p')}>Add Paragraph</button>
            <button onClick={() => handleAddText('h')}>Add Heading</button>
          </>
        )}

        {/* Editor Form for Text or Image */}
        {editorMode && (
          <div>
            <h3>Editor</h3>
            {editorMode === 'image' && selectedElement && (
              <div>
                <label>
                  Width:
                  <input
                    type="number"
                    name="width"
                    value={selectedElement.width}
                    onChange={handleImageSizeChange}
                  />
                </label>
                <label>
                  Height:
                  <input
                    type="number"
                    name="height"
                    value={selectedElement.height}
                    onChange={handleImageSizeChange}
                  />
                </label>
              </div>
            )}
            {editorMode === 'text' && selectedElement && (
              <div>
                <label>
                  Text Content:
                  <textarea
                    name="content"
                    value={selectedElement.content}
                    onChange={handleTextChange}
                  />
                </label>
                <label>
                  Color:
                  <input
                    type="color"
                    name="color"
                    value={selectedElement.color}
                    onChange={handleTextChange}
                  />
                </label>
                <label>
                  Alignment:
                  <select
                    name="alignment"
                    value={selectedElement.alignment}
                    onChange={handleTextChange}
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </label>
              </div>
            )}
            <button onClick={handleSaveChanges}>Save</button>
          </div>
        )}
      </div>

      {/* Preview Area */}
      <div style={{ width: '60%', border: '1px solid #ccc', padding: '1rem' }}>
        <h3>Preview</h3>
        <div id="previewContainer" style={{ minHeight: '300px', border: '1px solid #ddd' }}>
         {template.map((item, index) => (
  <div key={index} style={{ position: 'relative', marginBottom: '1rem' }}>
    {item.type === 'image' && (
      <img
        src={item.url}
        alt="Uploaded"
        style={{
          width: `${item.width}px`,
          height: `${item.height}px`,
        }}
        onClick={() => {
          setEditorMode('image');
          setSelectedElement(item);
        }}
      />
    )}
    {(item.type === 'p' || item.type === 'h') && (
      <item.type
        style={{
          color: item.color,
          textAlign: item.alignment,
        }}
        onClick={() => {
          setEditorMode('text');
          setSelectedElement(item);
        }}
      >
        {item.content}
      </item.type>
    )}
    <button
      style={{ position: 'absolute', top: 0, right: 0 }}
      onClick={() => handleDeleteElement(index)}
    >
      Delete
    </button>
  </div>
))}

        </div>

        <button onClick={handleSaveTemplate}>Save Template</button>
        <button onClick={handleSendMail}>Send Mail</button>
      </div>
    </div>
  );
};

export default TemplateEditor;
