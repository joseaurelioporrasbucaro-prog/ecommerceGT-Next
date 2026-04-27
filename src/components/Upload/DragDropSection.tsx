import React from 'react';
import { useState } from "react";
import { FileUploader } from "react-drag-drop-files";

const DragDropSection = () => {
    const [file, setFile] = useState<any>(null);
    const handleChange = (file:any) => {
        setFile(file);
    };

    return (
        <>
            <div className="browse-file-wrapper mb-30 wow fadeInUp">
                <div className="browse-file-icon">
                    <i className="flaticon-cloud-computing"></i>
                </div>
                <h1 className='browse-file-text'>Drop your artwork here</h1>
                <FileUploader
                    multiple={true}
                    handleChange={handleChange}
                    name="file"
                />
                <div className="browse-file-note">Allowed all format | Max 1 GB</div>
            </div>
            <p>{file ? `File name: ${file[0].name}` : "no files uploaded yet"}</p>
        </>
    );
};

export default DragDropSection;