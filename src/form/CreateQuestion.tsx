import React from "react";

const CreateQuestion = () => {
  return (
    <>
      <form className="contact-form" action="#">
        <div className="row">
          <div className="col-md-12">
            <div className="single-input-unit">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Your Name"
              />
            </div>
          </div>
          <div className="col-md-12">
            <div className="single-input-unit">
              <label htmlFor="m-id">Email</label>
              <input
                type="email"
                name="m-id"
                id="m-id"
                placeholder="Your email"
              />
            </div>
          </div>
          <div className="col-md-12">
            <div className="single-input-unit">
              <label htmlFor="message">Question</label>
              <textarea
                name="message"
                id="message"
                placeholder="Your question..."
              ></textarea>
            </div>
          </div>
        </div>
        <div className="contact-btn">
          <button className="fill-btn">Submit</button>
        </div>
      </form>
    </>
  );
};

export default CreateQuestion;
