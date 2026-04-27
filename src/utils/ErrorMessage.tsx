import React from 'react';

const ErrorMessage = ({ error }: any) => {
    return (
        <>
            <p className='error-message' style={{ color: "red", marginTop: "10px" }}>{error}</p>
        </>
    );
};

export default ErrorMessage;